import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';

import { Athletes } from './schemas/athletes.schema';
import { AthleteDto } from './dtos/athlete.dto';
import { ResponsibleDto } from './dtos/responsible.dto';

import { ValidateFieldsService } from '@ds-services/validate-fields/validate-fields.service';
import { ClassDocument } from '@ds-types/documents/class-document.type';
import { PlanDocument } from '@ds-types/documents/plan-document';
import { Age } from '@ds-types/age.type';
import { calculateAge } from '@ds-common/helpers/calculate-age.helper';
import { Role } from '@ds-types/role.type';
import { ClassesService } from '@ds-modules/classes/classes.service';
import { PlansService } from '@ds-modules/plans/plans.service';
import { maskCardNumber } from '@ds-common/helpers/mask-card-number.helper';
import { PaymentMode } from '@ds-enums/payment-mode.enum';
import { PaymentService } from '@ds-modules/payment/payment.service';
import { AthleteDocument } from '@ds-types/documents/athlete-document.type';
import { PaymentPix } from '@ds-types/payment-pix.type';
import { PaymentDocument } from '@ds-types/documents/payment-document.type';
import { EmailService } from '@ds-services/email/email.service';
import { EmailDefinePassword } from '@ds-types/email-define-password.type';
import { IdentifierFields } from '@ds-enums/identifier-fields.enum';

@Injectable()
export class AthletesService {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(Athletes.name) private athletesModel: Model<Athletes>,
    private readonly validateFieldsService: ValidateFieldsService,
    private readonly classesService: ClassesService,
    private readonly plansService: PlansService,
    private readonly paymentService: PaymentService,
    private readonly emailService: EmailService,
  ) {}

  public async createAthlete(
    athleteDto: AthleteDto,
    role?: Role,
  ): Promise<{
    athlete: AthleteDocument;
    payment?: PaymentDocument | PaymentPix;
  }> {
    if (role === 'admin') {
      const athlete = await this.createByAdmin(athleteDto);

      return { athlete };
    }

    return await this.createByUser(athleteDto);
  }

  private async createByAdmin(
    athleteDto: AthleteDto,
  ): Promise<AthleteDocument> {
    if (athleteDto.paymentMode !== PaymentMode.PERSONALLY) {
      throw new BadRequestException(
        `Registration through an admin must be ${PaymentMode.PERSONALLY}`,
      );
    }

    const [classes, plan] = await Promise.all([
      this.classesService.findById(athleteDto.classes, [
        'id',
        'modality',
        'age',
      ]),
      this.plansService.findById(athleteDto.plan, ['id', 'modality', 'value']),
    ]);

    await this.validateClassPlan(classes, plan);
    await this.validateAthlete(athleteDto, classes.age);

    const { name, email } = this.resolveContactInfo(athleteDto);

    const athlete = await this.athletesModel.create({
      ...athleteDto,
      responsibles: [athleteDto.responsible],
      paymentMethod: athleteDto.paymentMethod
        ? {
            ...athleteDto.paymentMethod,
            cardNumber: maskCardNumber(athleteDto.paymentMethod.cardNumber),
          }
        : undefined,
    });

    await this.emailService.singleEmail<EmailDefinePassword>({
      recipient: email,
      subject: `Bem-vindo(a) à Dojo System! Defina sua senha para acessar o portal do
      aluno`,
      template: 'define-password',
      context: {
        firstName: name.split(' ')[0],
      },
    });

    return athlete;
  }

  private async createByUser(athleteDto: AthleteDto): Promise<{
    athlete: AthleteDocument;
    payment: PaymentDocument | PaymentPix;
  }> {
    const [classes, plan] = await Promise.all([
      this.classesService.findById(athleteDto.classes, [
        'id',
        'modality',
        'age',
      ]),
      this.plansService.findById(athleteDto.plan, ['id', 'modality', 'value']),
    ]);

    await this.validateClassPlan(classes, plan);
    await this.validateAthlete(athleteDto, classes.age);

    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const { classes, paymentMode, ...athleteData } = athleteDto;

      const athlete = new this.athletesModel({
        ...athleteData,
        responsibles: [athleteDto.responsible],
        paymentMethod: athleteDto.paymentMethod
          ? [
              {
                ...athleteDto.paymentMethod,
                cardNumber: maskCardNumber(athleteDto.paymentMethod.cardNumber),
              },
            ]
          : undefined,
      });

      if (athleteDto.paymentMode === PaymentMode.PERSONALLY) {
        throw new BadRequestException(
          `Payment method for a common user must be ${PaymentMode.CARD} or ${PaymentMode.PIX}`,
        );
      }

      const { name, email } = this.resolveContactInfo(athleteDto);

      if (athleteDto.paymentMode === PaymentMode.PIX) {
        const payment = await this.paymentService.payWithPix({
          payerEmail: email,
          athleteId: athlete.id,
          planId: plan.id,
          amount: plan.value,
          mode: athleteDto.paymentMode,
        });
        await this.emailService.singleEmail<EmailDefinePassword>({
          recipient: email,
          subject: `Bem-vindo(a) à Dojo System!`,
          template: 'welcome',
          context: {
            firstName: name.split(' ')[0],
          },
        });
        await athlete.save({ session });

        await session.commitTransaction();
        return {
          athlete,
          payment,
        };
      }

      if (!athleteDto.paymentMethod) {
        throw new BadRequestException(
          'Payment method information must be provided',
        );
      }

      const payment = await this.paymentService.payWithCard({
        cardToken: athleteDto.paymentMethod.cardToken,
        payerEmail: email,
        amount: plan.value,
        installments: 1,
        cardNumber: athleteDto.paymentMethod.cardNumber,
        athleteId: athlete.id,
        planId: plan.id,
        mode: athleteDto.paymentMode,
        methodId: athleteDto.paymentMethod.methodId,
      });
      await this.emailService.singleEmail<EmailDefinePassword>({
        recipient: email,
        subject: `Bem-vindo(a) à Dojo System!`,
        template: 'welcome',
        context: {
          firstName: name.split(' ')[0],
        },
      });
      await athlete.save({ session });

      await session.commitTransaction();
      return {
        athlete,
        payment,
      };
    } catch (error) {
      await session.abortTransaction();

      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Error processing payment, please try again',
      );
    } finally {
      session.endSession();
    }
  }

  private async validateClassPlan(
    classes: ClassDocument,
    plan: PlanDocument,
  ): Promise<void> {
    await this.validateFieldsService.isActive('Classes', classes.id);
    await this.validateFieldsService.isActive('Plans', plan.id);

    const planModalityId = plan.modality._id.toString();
    const classModalityId = classes.modality.toString();

    if (classModalityId !== planModalityId) {
      throw new ConflictException(
        `"Class modality '${classModalityId}' is not compatible with plan modality '${planModalityId}'`,
      );
    }
  }

  private async validateAthlete(
    athleteDto: AthleteDto,
    classAge: Age,
  ): Promise<void> {
    await this.validateFieldsService.validateCpf('Athletes', athleteDto.cpf);

    const athleteAge = calculateAge(athleteDto.dateBirth);

    if (
      athleteAge < classAge.min ||
      (classAge.max && athleteAge > classAge.max)
    ) {
      const errorMessage = classAge.max
        ? `Athlete age (${athleteAge}) does not meet the class age range (${classAge.min} - ${classAge.max})`
        : `Athlete age (${athleteAge}) does not meet the class minimum age (${classAge.min})`;

      throw new ConflictException(errorMessage);
    }

    if (athleteAge < 18) {
      return await this.validateResponsible(athleteDto.responsible);
    }

    if (!athleteDto.email) {
      throw new BadRequestException(
        'Email is required for athletes over 18 years old',
      );
    }

    await this.validateFieldsService.validateEmail(
      'Athletes',
      athleteDto.email,
    );
  }

  private async validateResponsible(
    responsibleDto?: ResponsibleDto,
  ): Promise<void> {
    if (!responsibleDto) {
      throw new BadRequestException(
        'Responsible is required for athletes under 18 years old',
      );
    }

    const responsibleAge = calculateAge(responsibleDto.dateBirth);

    if (responsibleAge < 18) {
      throw new BadRequestException('Responsible must be over 18 years old');
    }

    await this.checkExistingResponsible(
      IdentifierFields.CPF,
      responsibleDto.cpf,
    );
    await this.checkExistingResponsible(
      IdentifierFields.EMAIL,
      responsibleDto.email,
    );
  }

  private async checkExistingResponsible(
    field: IdentifierFields,
    value: string,
  ): Promise<void> {
    const lowerCaseField = field.toLocaleLowerCase();

    const exists = await this.athletesModel.findOne(
      { [`responsibles.${lowerCaseField}`]: value },
      { [lowerCaseField]: 1 },
    );

    if (exists) {
      throw new ConflictException(
        `Responsible with ${field} ${value} already exists`,
      );
    }
  }

  private resolveContactInfo(athleteDto: AthleteDto): {
    name: string;
    email: string;
  } {
    const athleteAge = calculateAge(athleteDto.dateBirth);

    let email = athleteDto.email;
    let name = athleteDto.name;

    if (athleteAge < 18) {
      email = athleteDto.responsible.email;
      name = athleteDto.responsible.name;
    }

    return {
      name,
      email,
    };
  }
}

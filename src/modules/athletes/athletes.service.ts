import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Athletes } from './schemas/athletes.schema';
import { AthleteDto } from './dtos/athlete.dto';
import { ResponsibleDto } from './dtos/responsible.dto';

import { ValidateFieldsService } from '@ds-services/validate-fields/validate-fields.service';
import { ClassDocument } from '@ds-types/documents/class-document.type';
import { PlanDocument } from '@ds-types/documents/plan-document';
import { Age } from '@ds-types/age.type';
import { calculateAge } from '@ds-common/helpers/calculate-age.helper';
import { Role } from '@ds-types/role.type';

@Injectable()
export class AthletesService {
  constructor(
    @InjectModel(Athletes.name) private athletesModel: Model<Athletes>,
    private readonly validadeFieldsService: ValidateFieldsService,
  ) {}

  public createAthlete(athleteDto: AthleteDto, role?: Role) {
    if (role === 'admin') {
      return this.createByAdmin(athleteDto);
    }

    return this.createByUser(athleteDto);
  }

  private createByAdmin(athleteDto: AthleteDto) {}

  private createByUser(athleteDto: AthleteDto) {}

  private async validateClassPlan(
    classes: ClassDocument,
    plan: PlanDocument,
  ): Promise<void> {
    await this.validadeFieldsService.isActive('Classes', classes.id);
    await this.validadeFieldsService.isActive('Plans', plan.id);

    if (classes.modality !== plan.modality) {
      throw new ConflictException(
        `"Class modality '${classes.modality}' is not compatible with plan modality '${plan.modality}'`,
      );
    }
  }

  private async validateAthlete(
    athleteDto: AthleteDto,
    classAge: Age,
  ): Promise<void> {
    await this.validadeFieldsService.validateCpf('Athletes', athleteDto.cpf);

    const athleteAge = calculateAge(athleteDto.birthDate);

    if (
      athleteAge < classAge.min ||
      (classAge.max && athleteAge > classAge.max)
    ) {
      throw new ConflictException(
        `Athlete age (${athleteAge}) does not meet the class age range (${classAge.min} - ${classAge.max})`,
      );
    }

    if (athleteAge < 18) {
      return await this.validateResponsible(athleteDto.responsible);
    }

    if (!athleteDto.email) {
      throw new BadRequestException(
        'Email is required for athletes over 18 years old',
      );
    }

    await this.validadeFieldsService.validateEmail(
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

    const responsibleAge = calculateAge(responsibleDto.birthDate);

    if (responsibleAge < 18) {
      throw new BadRequestException('Responsible must be over 18 years old');
    }

    await this.checkExistingResponsible('cpf', responsibleDto.cpf);
    await this.checkExistingResponsible('email', responsibleDto.email);
  }

  private async checkExistingResponsible(
    field: 'cpf' | 'email',
    value: string,
  ): Promise<void> {
    const exists = await this.athletesModel.findOne(
      { [`responsibles.${field}`]: value },
      { [field]: 1 },
    );

    if (exists) {
      throw new ConflictException(
        `Responsible with ${field} ${value} already exists`,
      );
    }
  }
}

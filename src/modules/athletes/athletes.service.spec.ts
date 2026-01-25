import { Test, TestingModule } from '@nestjs/testing';
import { Connection, Model, Types } from 'mongoose';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { BadRequestException, ConflictException } from '@nestjs/common';

import { AthletesService } from './athletes.service';
import { Athletes } from './schemas/athletes.schema';
import { AthleteDto } from './dtos/athlete.dto';
import { Responsible } from './schemas/responsible.schema';

import { AthleteDocument } from '@ds-types/documents/athlete-document.type';
import { ValidateFieldsService } from '@ds-services/validate-fields/validate-fields.service';
import { ClassesService } from '@ds-modules/classes/classes.service';
import { PlansService } from '@ds-modules/plans/plans.service';
import { PaymentService } from '@ds-modules/payment/payment.service';
import { EmailService } from '@ds-services/email/email.service';
import { PaymentMode } from '@ds-enums/payment-mode.enum';
import { ClassDocument } from '@ds-types/documents/class-document.type';
import { PlanDocument } from '@ds-types/documents/plan-document';
import { PaymentPix } from '@ds-types/payment-pix.type';
import { PaymentDocument } from '@ds-types/documents/payment-document.type';
import { CardType } from '@ds-enums/card-type.enum';
import { maskCardNumber } from '@ds-common/helpers/mask-card-number.helper';
import { PaymentMethod } from '@ds-modules/payment/schemas/payment-method.schema';
import { calculateAge } from '@ds-common/helpers/calculate-age.helper';
import { TranslateService } from '@ds-services/translate/translate.service';
import { I18nFiles } from '@ds-enums/i18n-files.enum';
import { ModuleName } from '@ds-enums/module-name.enum';
import { Message } from '@ds-enums/message.enum';

describe('AthletesService', () => {
  let service: AthletesService;
  let athleteModel: Model<AthleteDocument>;
  let connection: Connection;
  let validateFieldsService: ValidateFieldsService;
  let classesService: ClassesService;
  let plansService: PlansService;
  let paymentService: PaymentService;
  let emailService: EmailService;
  let translateService: TranslateService;

  const mockModel = {
    findOne: jest.fn().mockReturnThis(),
    findById: jest.fn().mockReturnThis(),
    find: jest.fn().mockReturnThis(),
    findByIdAndUpdate: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    equals: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    exec: jest.fn(),
    create: jest.fn(),
  };

  const mockSession = {
    startTransaction: jest.fn(),
    commitTransaction: jest.fn().mockResolvedValue(undefined),
    abortTransaction: jest.fn().mockResolvedValue(undefined),
    endSession: jest.fn(),
  };

  const mockSave = jest
    .fn()
    .mockResolvedValue({ _id: new Types.ObjectId('68ab8644201ea1a63f8cb44f') });
  const mockNewAthlete = jest.fn().mockImplementation(() => ({
    save: mockSave,
  }));

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AthletesService,
        {
          provide: getModelToken(Athletes.name),
          useValue: Object.assign(mockNewAthlete, mockModel),
        },
        {
          provide: getConnectionToken(),
          useValue: {
            startSession: jest.fn().mockResolvedValue(mockSession),
          },
        },
        {
          provide: ValidateFieldsService,
          useValue: {
            isActive: jest.fn(),
            validateCpf: jest.fn(),
            validateEmail: jest.fn(),
          },
        },
        {
          provide: ClassesService,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: PlansService,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: PaymentService,
          useValue: {
            payWithPix: jest.fn(),
            payWithCard: jest.fn(),
          },
        },
        {
          provide: EmailService,
          useValue: {
            singleEmail: jest.fn(),
          },
        },
        {
          provide: TranslateService,
          useValue: {
            translate: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AthletesService>(AthletesService);
    athleteModel = module.get<Model<AthleteDocument>>(
      getModelToken(Athletes.name),
    );
    connection = module.get<Connection>(getConnectionToken());
    validateFieldsService = module.get<ValidateFieldsService>(
      ValidateFieldsService,
    );
    classesService = module.get<ClassesService>(ClassesService);
    plansService = module.get<PlansService>(PlansService);
    paymentService = module.get<PaymentService>(PaymentService);
    emailService = module.get<EmailService>(EmailService);
    translateService = module.get<TranslateService>(TranslateService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create an adult athlete by admin successfully', async () => {
    const role = 'admin';
    const athleteDto: AthleteDto = {
      name: 'Test',
      cpf: '42153505240',
      dateBirth: new Date('1978-04-22'),
      plan: new Types.ObjectId('68ab8644201ea1a63f8cb22e'),
      classes: new Types.ObjectId('68b4acbe14a396b9de66a803'),
      email: 'unit.test.dj@gmail.com',
      paymentMode: PaymentMode.PERSONALLY,
    };
    const classes = {
      id: athleteDto.classes,
      modality: new Types.ObjectId('68ab8644201ea1a63f8cb33e'),
      age: {
        min: 18,
      },
    } as ClassDocument;
    const plan = {
      id: athleteDto.plan,
      modality: new Types.ObjectId('68ab8644201ea1a63f8cb33e'),
      value: 100,
    } as PlanDocument;
    const athlete = {
      id: new Types.ObjectId(),
      name: athleteDto.name,
      email: athleteDto.email,
      cpf: athleteDto.cpf,
      dateBirth: athleteDto.dateBirth,
      plan: athleteDto.plan,
      responsibles: [],
    } as AthleteDocument;

    classesService.findById = jest.fn().mockResolvedValue(classes);
    plansService.findById = jest.fn().mockResolvedValue(plan);

    validateFieldsService.isActive = jest.fn().mockImplementation(() => {});

    validateFieldsService.validateCpf = jest.fn().mockImplementation(() => {});
    validateFieldsService.validateEmail = jest
      .fn()
      .mockImplementation(() => {});

    mockModel.create.mockResolvedValue(athlete);
    emailService.singleEmail = jest.fn().mockImplementation(() => {});

    const result = await service.createAthlete(athleteDto, role);

    expect(result).toEqual({ athlete });
    expect(classesService.findById).toHaveBeenCalledWith(athleteDto.classes, [
      'id',
      'modality',
      'age',
    ]);
    expect(plansService.findById).toHaveBeenCalledWith(athleteDto.plan, [
      'id',
      'modality',
      'value',
    ]);
    expect(validateFieldsService.isActive).toHaveBeenCalledTimes(2);
    expect(validateFieldsService.isActive).toHaveBeenNthCalledWith(
      1,
      'Classes',
      classes.id,
    );
    expect(validateFieldsService.isActive).toHaveBeenNthCalledWith(
      2,
      'Plans',
      plan.id,
    );
    expect(validateFieldsService.validateCpf).toHaveBeenCalledWith(
      'Athletes',
      athleteDto.cpf,
    );
    expect(validateFieldsService.validateEmail).toHaveBeenCalledWith(
      'Athletes',
      athleteDto.email,
    );
    expect(athleteModel.create).toHaveBeenCalledWith({
      ...athleteDto,
      responsibles: [athleteDto.responsible],
    });
    expect(emailService.singleEmail).toHaveBeenCalledWith({
      recipient: athleteDto.email,
      subject: `Bem-vindo(a) à Dojo System! Defina sua senha para acessar o portal do
      aluno`,
      template: 'define-password',
      context: {
        firstName: athleteDto.name.split(' ')[0],
      },
    });
  });

  it('should create an minor athlete by admin successfully', async () => {
    const role = 'admin';
    const athleteDto: AthleteDto = {
      name: 'Test',
      cpf: '42153505240',
      dateBirth: new Date('2020-04-22'),
      plan: new Types.ObjectId('68ab8644201ea1a63f8cb22e'),
      classes: new Types.ObjectId('68b4acbe14a396b9de66a803'),
      paymentMode: PaymentMode.PERSONALLY,
      responsible: {
        dateBirth: new Date('1978-04-22'),
        cpf: '47294028429',
        email: 'responsible@gmail.com',
        name: 'Responsible',
      },
    };
    const classes = {
      id: athleteDto.classes,
      modality: new Types.ObjectId('68ab8644201ea1a63f8cb33e'),
      age: {
        min: 4,
        max: 8,
      },
    } as ClassDocument;
    const plan = {
      id: athleteDto.plan,
      modality: new Types.ObjectId('68ab8644201ea1a63f8cb33e'),
      value: 100,
    } as PlanDocument;
    const athlete = {
      id: new Types.ObjectId(),
      name: athleteDto.name,
      cpf: athleteDto.cpf,
      dateBirth: athleteDto.dateBirth,
      plan: athleteDto.plan,
      responsibles: [athleteDto.responsible as Responsible],
    } as AthleteDocument;

    classesService.findById = jest.fn().mockResolvedValue(classes);
    plansService.findById = jest.fn().mockResolvedValue(plan);

    validateFieldsService.isActive = jest.fn().mockImplementation(() => {});

    validateFieldsService.validateCpf = jest.fn().mockImplementation(() => {});
    mockModel.findOne.mockResolvedValue(null);

    mockModel.create.mockResolvedValue(athlete);
    emailService.singleEmail = jest.fn().mockImplementation(() => {});

    const result = await service.createAthlete(athleteDto, role);

    expect(result).toEqual({ athlete });
    expect(classesService.findById).toHaveBeenCalledWith(athleteDto.classes, [
      'id',
      'modality',
      'age',
    ]);
    expect(plansService.findById).toHaveBeenCalledWith(athleteDto.plan, [
      'id',
      'modality',
      'value',
    ]);
    expect(validateFieldsService.isActive).toHaveBeenCalledTimes(2);
    expect(validateFieldsService.isActive).toHaveBeenNthCalledWith(
      1,
      'Classes',
      classes.id,
    );
    expect(validateFieldsService.isActive).toHaveBeenNthCalledWith(
      2,
      'Plans',
      plan.id,
    );
    expect(validateFieldsService.validateCpf).toHaveBeenCalledWith(
      'Athletes',
      athleteDto.cpf,
    );
    expect(athleteModel.findOne).toHaveBeenCalledTimes(2);
    expect(athleteModel.findOne).toHaveBeenNthCalledWith(
      1,
      { [`responsibles.cpf`]: athleteDto.responsible.cpf },
      { cpf: 1 },
    );
    expect(athleteModel.findOne).toHaveBeenNthCalledWith(
      2,
      { [`responsibles.email`]: athleteDto.responsible.email },
      { email: 1 },
    );
    expect(athleteModel.create).toHaveBeenCalledWith({
      ...athleteDto,
      responsibles: [athleteDto.responsible],
    });
    expect(emailService.singleEmail).toHaveBeenCalledWith({
      recipient: athleteDto.responsible.email,
      subject: `Bem-vindo(a) à Dojo System! Defina sua senha para acessar o portal do
      aluno`,
      template: 'define-password',
      context: {
        firstName: athleteDto.responsible.name.split(' ')[0],
      },
    });
  });

  it('should create an adult athlete by user with pix successfully', async () => {
    const role = undefined;
    const athleteDto: AthleteDto = {
      name: 'Test',
      cpf: '42153505240',
      dateBirth: new Date('1978-04-22'),
      plan: new Types.ObjectId('68ab8644201ea1a63f8cb22e'),
      classes: new Types.ObjectId('68b4acbe14a396b9de66a803'),
      email: 'unit.test.dj@gmail.com',
      paymentMode: PaymentMode.PIX,
    };
    const classes = {
      id: athleteDto.classes,
      modality: new Types.ObjectId('68ab8644201ea1a63f8cb33e'),
      age: {
        min: 18,
      },
    } as ClassDocument;
    const plan = {
      id: athleteDto.plan,
      modality: new Types.ObjectId('68ab8644201ea1a63f8cb33e'),
      value: 100,
    } as PlanDocument;
    const athlete = {
      name: athleteDto.name,
      email: athleteDto.email,
      cpf: athleteDto.cpf,
      dateBirth: athleteDto.dateBirth,
      plan: athleteDto.plan,
      responsibles: [],
    } as AthleteDocument;
    const payment: PaymentPix = {
      athlete: athlete.id,
      date: new Date().toLocaleString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
      }),
      methodId: 'pix',
      mode: PaymentMode.PIX,
      paymentIdMP: '1',
      plan: athleteDto.plan,
      qrCode: 'qrCode',
      qrCodeBase64: 'data:image/png;base64,qrCode',
      status: 'Pending',
    };

    classesService.findById = jest.fn().mockResolvedValue(classes);
    plansService.findById = jest.fn().mockResolvedValue(plan);

    validateFieldsService.isActive = jest.fn().mockImplementation(() => {});

    validateFieldsService.validateCpf = jest.fn().mockImplementation(() => {});
    validateFieldsService.validateEmail = jest
      .fn()
      .mockImplementation(() => {});

    paymentService.payWithPix = jest.fn().mockResolvedValue(payment);
    emailService.singleEmail = jest.fn().mockImplementation(() => {});
    const athleteInstance = {
      ...athlete,
      save: jest.fn().mockResolvedValue(athlete),
    };
    mockNewAthlete.mockReturnValue(athleteInstance);

    const result = await service.createAthlete(athleteDto, role);

    expect(result).toEqual({ athlete: athleteInstance, payment });
    expect(connection.startSession).toHaveBeenCalledTimes(1);
    expect(mockSession.startTransaction).toHaveBeenCalledTimes(1);
    expect(mockNewAthlete).toHaveBeenCalledWith(
      expect.objectContaining(athlete),
    );
    expect(athleteInstance.save).toHaveBeenCalledWith({ session: mockSession });
    expect(mockSession.commitTransaction).toHaveBeenCalledTimes(1);
    expect(mockSession.endSession).toHaveBeenCalledTimes(1);
    expect(classesService.findById).toHaveBeenCalledWith(athleteDto.classes, [
      'id',
      'modality',
      'age',
    ]);
    expect(plansService.findById).toHaveBeenCalledWith(athleteDto.plan, [
      'id',
      'modality',
      'value',
    ]);
    expect(validateFieldsService.isActive).toHaveBeenCalledTimes(2);
    expect(validateFieldsService.isActive).toHaveBeenNthCalledWith(
      1,
      'Classes',
      classes.id,
    );
    expect(validateFieldsService.isActive).toHaveBeenNthCalledWith(
      2,
      'Plans',
      plan.id,
    );
    expect(validateFieldsService.validateCpf).toHaveBeenCalledWith(
      'Athletes',
      athleteDto.cpf,
    );
    expect(paymentService.payWithPix).toHaveBeenCalledWith({
      payerEmail: athleteDto.email,
      athleteId: athlete.id,
      planId: plan.id,
      amount: plan.value,
      mode: athleteDto.paymentMode,
    });
    expect(emailService.singleEmail).toHaveBeenCalledWith({
      recipient: athleteDto.email,
      subject: `Bem-vindo(a) à Dojo System!`,
      template: 'welcome',
      context: {
        firstName: athleteDto.name.split(' ')[0],
      },
    });
  });

  it('should create an adult athlete by user with card successfully', async () => {
    const role = undefined;
    const athleteDto: AthleteDto = {
      name: 'Test',
      cpf: '42153505240',
      dateBirth: new Date('1978-04-22'),
      plan: new Types.ObjectId('68ab8644201ea1a63f8cb22e'),
      classes: new Types.ObjectId('68b4acbe14a396b9de66a803'),
      email: 'unit.test.dj@gmail.com',
      paymentMode: PaymentMode.CARD,
      paymentMethod: {
        cardHolderName: 'Unit Test',
        cardNumber: '2579848919866818',
        cardToken: 'token_test_invalid_0001',
        cardType: CardType.CREDIT,
        expirationMonth: '12',
        expirationYear: '2029',
        methodId: 'visa',
      },
    };
    const classes = {
      id: athleteDto.classes,
      modality: new Types.ObjectId('68ab8644201ea1a63f8cb33e'),
      age: {
        min: 18,
      },
    } as ClassDocument;
    const plan = {
      id: athleteDto.plan,
      modality: new Types.ObjectId('68ab8644201ea1a63f8cb33e'),
      value: 100,
    } as PlanDocument;
    const athlete = {
      name: athleteDto.name,
      email: athleteDto.email,
      cpf: athleteDto.cpf,
      dateBirth: athleteDto.dateBirth,
      plan: athleteDto.plan,
      responsibles: [undefined],
      paymentMethod: [
        {
          ...athleteDto.paymentMethod,
          cardNumber: maskCardNumber(athleteDto.paymentMethod.cardNumber),
        } as PaymentMethod,
      ],
    } as AthleteDocument;
    const payment = {
      athlete: athlete.id,
      date: new Date().toLocaleString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
      }),
      methodId: 'visa',
      mode: PaymentMode.CARD,
      paymentIdMP: '1',
      plan: athleteDto.plan,
      status: 'Pending',
    } as PaymentDocument;

    classesService.findById = jest.fn().mockResolvedValue(classes);
    plansService.findById = jest.fn().mockResolvedValue(plan);

    validateFieldsService.isActive = jest.fn().mockImplementation(() => {});

    validateFieldsService.validateCpf = jest.fn().mockImplementation(() => {});
    validateFieldsService.validateEmail = jest
      .fn()
      .mockImplementation(() => {});

    paymentService.payWithCard = jest.fn().mockResolvedValue(payment);
    emailService.singleEmail = jest.fn().mockImplementation(() => {});
    const athleteInstance = {
      ...athlete,
      save: jest.fn().mockResolvedValue(athlete),
    };
    mockNewAthlete.mockReturnValue(athleteInstance);

    const result = await service.createAthlete(athleteDto, role);

    expect(result).toEqual({ athlete: athleteInstance, payment });
    expect(connection.startSession).toHaveBeenCalledTimes(1);
    expect(mockSession.startTransaction).toHaveBeenCalledTimes(1);
    expect(mockNewAthlete).toHaveBeenCalledWith(
      expect.objectContaining(athlete),
    );
    expect(athleteInstance.save).toHaveBeenCalledWith({ session: mockSession });
    expect(mockSession.commitTransaction).toHaveBeenCalledTimes(1);
    expect(mockSession.endSession).toHaveBeenCalledTimes(1);
    expect(classesService.findById).toHaveBeenCalledWith(athleteDto.classes, [
      'id',
      'modality',
      'age',
    ]);
    expect(plansService.findById).toHaveBeenCalledWith(athleteDto.plan, [
      'id',
      'modality',
      'value',
    ]);
    expect(validateFieldsService.isActive).toHaveBeenCalledTimes(2);
    expect(validateFieldsService.isActive).toHaveBeenNthCalledWith(
      1,
      'Classes',
      classes.id,
    );
    expect(validateFieldsService.isActive).toHaveBeenNthCalledWith(
      2,
      'Plans',
      plan.id,
    );
    expect(validateFieldsService.validateCpf).toHaveBeenCalledWith(
      'Athletes',
      athleteDto.cpf,
    );
    expect(paymentService.payWithCard).toHaveBeenCalledWith({
      cardToken: athleteDto.paymentMethod.cardToken,
      payerEmail: athleteDto.email,
      amount: plan.value,
      installments: 1,
      cardNumber: athleteDto.paymentMethod.cardNumber,
      athleteId: athlete.id,
      planId: plan.id,
      mode: athleteDto.paymentMode,
      methodId: athleteDto.paymentMethod.methodId,
    });
    expect(emailService.singleEmail).toHaveBeenCalledWith({
      recipient: athleteDto.email,
      subject: `Bem-vindo(a) à Dojo System!`,
      template: 'welcome',
      context: {
        firstName: athleteDto.name.split(' ')[0],
      },
    });
  });

  it('should create an minor athlete by user with pix successfully', async () => {
    const role = undefined;
    const athleteDto: AthleteDto = {
      name: 'Test',
      cpf: '42153505240',
      dateBirth: new Date('2020-04-22'),
      plan: new Types.ObjectId('68ab8644201ea1a63f8cb22e'),
      classes: new Types.ObjectId('68b4acbe14a396b9de66a803'),
      email: 'unit.test.dj@gmail.com',
      paymentMode: PaymentMode.PIX,
      responsible: {
        cpf: '17584930130',
        dateBirth: new Date('1970-06-02'),
        email: 'responsible@gmail.com',
        name: 'Responsible',
      },
    };
    const classes = {
      id: athleteDto.classes,
      modality: new Types.ObjectId('68ab8644201ea1a63f8cb33e'),
      age: {
        min: 4,
        max: 8,
      },
    } as ClassDocument;
    const plan = {
      id: athleteDto.plan,
      modality: new Types.ObjectId('68ab8644201ea1a63f8cb33e'),
      value: 100,
    } as PlanDocument;
    const athlete = {
      name: athleteDto.name,
      email: athleteDto.email,
      cpf: athleteDto.cpf,
      dateBirth: athleteDto.dateBirth,
      plan: athleteDto.plan,
      responsibles: [athleteDto.responsible],
    } as AthleteDocument;
    const payment: PaymentPix = {
      athlete: athlete.id,
      date: new Date().toLocaleString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
      }),
      methodId: 'pix',
      mode: PaymentMode.PIX,
      paymentIdMP: '1',
      plan: athleteDto.plan,
      qrCode: 'qrCode',
      qrCodeBase64: 'data:image/png;base64,qrCode',
      status: 'Pending',
    };

    classesService.findById = jest.fn().mockResolvedValue(classes);
    plansService.findById = jest.fn().mockResolvedValue(plan);

    validateFieldsService.isActive = jest.fn().mockImplementation(() => {});

    validateFieldsService.validateCpf = jest.fn().mockImplementation(() => {});
    mockModel.findOne.mockResolvedValue(null);

    paymentService.payWithPix = jest.fn().mockResolvedValue(payment);
    emailService.singleEmail = jest.fn().mockImplementation(() => {});
    const athleteInstance = {
      ...athlete,
      save: jest.fn().mockResolvedValue(athlete),
    };
    mockNewAthlete.mockReturnValue(athleteInstance);

    const result = await service.createAthlete(athleteDto, role);

    expect(result).toEqual({ athlete: athleteInstance, payment });
    expect(connection.startSession).toHaveBeenCalledTimes(1);
    expect(mockSession.startTransaction).toHaveBeenCalledTimes(1);
    expect(mockNewAthlete).toHaveBeenCalledWith(
      expect.objectContaining(athlete),
    );
    expect(athleteInstance.save).toHaveBeenCalledWith({ session: mockSession });
    expect(mockSession.commitTransaction).toHaveBeenCalledTimes(1);
    expect(mockSession.endSession).toHaveBeenCalledTimes(1);
    expect(classesService.findById).toHaveBeenCalledWith(athleteDto.classes, [
      'id',
      'modality',
      'age',
    ]);
    expect(plansService.findById).toHaveBeenCalledWith(athleteDto.plan, [
      'id',
      'modality',
      'value',
    ]);
    expect(validateFieldsService.isActive).toHaveBeenCalledTimes(2);
    expect(validateFieldsService.isActive).toHaveBeenNthCalledWith(
      1,
      'Classes',
      classes.id,
    );
    expect(validateFieldsService.isActive).toHaveBeenNthCalledWith(
      2,
      'Plans',
      plan.id,
    );
    expect(validateFieldsService.validateCpf).toHaveBeenCalledWith(
      'Athletes',
      athleteDto.cpf,
    );
    expect(athleteModel.findOne).toHaveBeenCalledTimes(2);
    expect(athleteModel.findOne).toHaveBeenNthCalledWith(
      1,
      { [`responsibles.cpf`]: athleteDto.responsible.cpf },
      { cpf: 1 },
    );
    expect(athleteModel.findOne).toHaveBeenNthCalledWith(
      2,
      { [`responsibles.email`]: athleteDto.responsible.email },
      { email: 1 },
    );
    expect(paymentService.payWithPix).toHaveBeenCalledWith({
      payerEmail: athleteDto.responsible.email,
      athleteId: athlete.id,
      planId: plan.id,
      amount: plan.value,
      mode: athleteDto.paymentMode,
    });
    expect(emailService.singleEmail).toHaveBeenCalledWith({
      recipient: athleteDto.responsible.email,
      subject: `Bem-vindo(a) à Dojo System!`,
      template: 'welcome',
      context: {
        firstName: athleteDto.responsible.name.split(' ')[0],
      },
    });
  });

  it('should create an minor athlete by user with card successfully', async () => {
    const role = undefined;
    const athleteDto: AthleteDto = {
      name: 'Test',
      cpf: '42153505240',
      dateBirth: new Date('2020-04-22'),
      plan: new Types.ObjectId('68ab8644201ea1a63f8cb22e'),
      classes: new Types.ObjectId('68b4acbe14a396b9de66a803'),
      email: 'unit.test.dj@gmail.com',
      paymentMode: PaymentMode.CARD,
      paymentMethod: {
        cardHolderName: 'Unit Test',
        cardNumber: '2579848919866818',
        cardToken: 'token_test_invalid_0001',
        cardType: CardType.CREDIT,
        expirationMonth: '12',
        expirationYear: '2029',
        methodId: 'visa',
      },
      responsible: {
        cpf: '17584930130',
        dateBirth: new Date('1970-06-02'),
        email: 'responsible@gmail.com',
        name: 'Responsible',
      },
    };
    const classes = {
      id: athleteDto.classes,
      modality: new Types.ObjectId('68ab8644201ea1a63f8cb33e'),
      age: {
        min: 4,
        max: 8,
      },
    } as ClassDocument;
    const plan = {
      id: athleteDto.plan,
      modality: new Types.ObjectId('68ab8644201ea1a63f8cb33e'),
      value: 100,
    } as PlanDocument;
    const athlete = {
      name: athleteDto.name,
      email: athleteDto.email,
      cpf: athleteDto.cpf,
      dateBirth: athleteDto.dateBirth,
      plan: athleteDto.plan,
      responsibles: [athleteDto.responsible],
      paymentMethod: [
        {
          ...athleteDto.paymentMethod,
          cardNumber: maskCardNumber(athleteDto.paymentMethod.cardNumber),
        } as PaymentMethod,
      ],
    } as AthleteDocument;
    const payment = {
      athlete: athlete.id,
      date: new Date().toLocaleString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
      }),
      methodId: 'visa',
      mode: PaymentMode.CARD,
      paymentIdMP: '1',
      plan: athleteDto.plan,
      status: 'Pending',
    } as PaymentDocument;

    classesService.findById = jest.fn().mockResolvedValue(classes);
    plansService.findById = jest.fn().mockResolvedValue(plan);

    validateFieldsService.isActive = jest.fn().mockImplementation(() => {});

    validateFieldsService.validateCpf = jest.fn().mockImplementation(() => {});
    mockModel.findOne.mockResolvedValue(null);

    paymentService.payWithCard = jest.fn().mockResolvedValue(payment);
    emailService.singleEmail = jest.fn().mockImplementation(() => {});
    const athleteInstance = {
      ...athlete,
      save: jest.fn().mockResolvedValue(athlete),
    };
    mockNewAthlete.mockReturnValue(athleteInstance);

    const result = await service.createAthlete(athleteDto, role);

    expect(result).toEqual({ athlete: athleteInstance, payment });
    expect(connection.startSession).toHaveBeenCalledTimes(1);
    expect(mockSession.startTransaction).toHaveBeenCalledTimes(1);
    expect(mockNewAthlete).toHaveBeenCalledWith(
      expect.objectContaining(athlete),
    );
    expect(athleteInstance.save).toHaveBeenCalledWith({ session: mockSession });
    expect(mockSession.commitTransaction).toHaveBeenCalledTimes(1);
    expect(mockSession.endSession).toHaveBeenCalledTimes(1);
    expect(classesService.findById).toHaveBeenCalledWith(athleteDto.classes, [
      'id',
      'modality',
      'age',
    ]);
    expect(plansService.findById).toHaveBeenCalledWith(athleteDto.plan, [
      'id',
      'modality',
      'value',
    ]);
    expect(validateFieldsService.isActive).toHaveBeenCalledTimes(2);
    expect(validateFieldsService.isActive).toHaveBeenNthCalledWith(
      1,
      'Classes',
      classes.id,
    );
    expect(validateFieldsService.isActive).toHaveBeenNthCalledWith(
      2,
      'Plans',
      plan.id,
    );
    expect(validateFieldsService.validateCpf).toHaveBeenCalledWith(
      'Athletes',
      athleteDto.cpf,
    );
    expect(athleteModel.findOne).toHaveBeenCalledTimes(2);
    expect(athleteModel.findOne).toHaveBeenNthCalledWith(
      1,
      { [`responsibles.cpf`]: athleteDto.responsible.cpf },
      { cpf: 1 },
    );
    expect(athleteModel.findOne).toHaveBeenNthCalledWith(
      2,
      { [`responsibles.email`]: athleteDto.responsible.email },
      { email: 1 },
    );
    expect(paymentService.payWithCard).toHaveBeenCalledWith({
      cardToken: athleteDto.paymentMethod.cardToken,
      payerEmail: athleteDto.responsible.email,
      amount: plan.value,
      installments: 1,
      cardNumber: athleteDto.paymentMethod.cardNumber,
      athleteId: athlete.id,
      planId: plan.id,
      mode: athleteDto.paymentMode,
      methodId: athleteDto.paymentMethod.methodId,
    });
    expect(emailService.singleEmail).toHaveBeenCalledWith({
      recipient: athleteDto.responsible.email,
      subject: `Bem-vindo(a) à Dojo System!`,
      template: 'welcome',
      context: {
        firstName: athleteDto.responsible.name.split(' ')[0],
      },
    });
  });

  it('should throw BadRequestException if the payment mode is not personally when an admin creates an athlete', async () => {
    const role = 'admin';
    const athleteDtoPix = {
      paymentMode: PaymentMode.PIX,
    } as AthleteDto;
    const athleteDtoCard = {
      paymentMode: PaymentMode.CARD,
    } as AthleteDto;

    await expect(service.createAthlete(athleteDtoPix, role)).rejects.toThrow(
      new BadRequestException(
        translateService.translate({
          i18nFile: I18nFiles.ERRORS,
          module: ModuleName.ATHLETES,
          message: Message.ADMIN_REGISTER,
        }),
      ),
    );
    await expect(service.createAthlete(athleteDtoCard, role)).rejects.toThrow(
      new BadRequestException(
        translateService.translate({
          i18nFile: I18nFiles.ERRORS,
          module: ModuleName.ATHLETES,
          message: Message.ADMIN_REGISTER,
        }),
      ),
    );
  });

  it('should throw BadRequestException if the payment mode is not card or pix when a user creates an athlete', async () => {
    const role = undefined;
    const athleteDto = {
      paymentMode: PaymentMode.PERSONALLY,
    } as AthleteDto;

    await expect(service.createAthlete(athleteDto, role)).rejects.toThrow(
      new BadRequestException(
        translateService.translate({
          i18nFile: I18nFiles.ERRORS,
          module: ModuleName.ATHLETES,
          message: Message.USER_REGISTER,
        }),
      ),
    );
  });

  it('should throw ConflictException if the class modality is not compatible with the plan modality when an admin creates an athlete', async () => {
    const role = 'admin';
    const athleteDto = {
      plan: new Types.ObjectId('68ab8644201ea1a63f8cb22e'),
      classes: new Types.ObjectId('68b4acbe14a396b9de66a803'),
      paymentMode: PaymentMode.PERSONALLY,
    } as AthleteDto;
    const classes = {
      id: athleteDto.classes,
      modality: new Types.ObjectId('68ab8644201ea1a63f8cb44f'),
      age: {
        min: 18,
      },
    } as ClassDocument;
    const plan = {
      id: athleteDto.plan,
      modality: new Types.ObjectId('68ab8644201ea1a63f8cb33e'),
      value: 100,
    } as PlanDocument;

    classesService.findById = jest.fn().mockResolvedValue(classes);
    plansService.findById = jest.fn().mockResolvedValue(plan);

    await expect(service.createAthlete(athleteDto, role)).rejects.toThrow(
      new ConflictException(
        translateService.translate({
          i18nFile: I18nFiles.ERRORS,
          module: ModuleName.ATHLETES,
          message: Message.INCOMPATIBLE_MODALITY_PLAN,
        }),
      ),
    );
  });

  it('should throw ConflictException if the class modality is not compatible with the plan modality when a user creates an athlete', async () => {
    const role = undefined;
    const athleteDto = {
      plan: new Types.ObjectId('68ab8644201ea1a63f8cb22e'),
      classes: new Types.ObjectId('68b4acbe14a396b9de66a803'),
      paymentMode: PaymentMode.PIX,
    } as AthleteDto;
    const classes = {
      id: athleteDto.classes,
      modality: new Types.ObjectId('68ab8644201ea1a63f8cb44f'),
      age: {
        min: 18,
      },
    } as ClassDocument;
    const plan = {
      id: athleteDto.plan,
      modality: new Types.ObjectId('68ab8644201ea1a63f8cb33e'),
      value: 100,
    } as PlanDocument;

    classesService.findById = jest.fn().mockResolvedValue(classes);
    plansService.findById = jest.fn().mockResolvedValue(plan);

    await expect(service.createAthlete(athleteDto, role)).rejects.toThrow(
      new ConflictException(
        translateService.translate({
          i18nFile: I18nFiles.ERRORS,
          module: ModuleName.ATHLETES,
          message: Message.INCOMPATIBLE_MODALITY_PLAN,
        }),
      ),
    );
  });

  it("should throw ConflictException if the athlete's age is outside the class's age range when an admin creates an athlete", async () => {
    const role = 'admin';
    const athleteDto = {
      plan: new Types.ObjectId('68ab8644201ea1a63f8cb22e'),
      classes: new Types.ObjectId('68b4acbe14a396b9de66a803'),
      paymentMode: PaymentMode.PERSONALLY,
      dateBirth: new Date('2018-02-04'),
    } as AthleteDto;
    const classes = {
      id: athleteDto.classes,
      modality: new Types.ObjectId('68ab8644201ea1a63f8cb33e'),
      age: {
        min: 4,
        max: 6,
      },
    } as ClassDocument;
    const plan = {
      id: athleteDto.plan,
      modality: new Types.ObjectId('68ab8644201ea1a63f8cb33e'),
      value: 100,
    } as PlanDocument;

    classesService.findById = jest.fn().mockResolvedValue(classes);
    plansService.findById = jest.fn().mockResolvedValue(plan);

    validateFieldsService.validateCpf = jest.fn().mockImplementation(() => {});

    const athleteAge = calculateAge(athleteDto.dateBirth);

    await expect(service.createAthlete(athleteDto, role)).rejects.toThrow(
      new ConflictException(
        translateService.translate(
          {
            i18nFile: I18nFiles.ERRORS,
            module: ModuleName.ATHLETES,
            message: Message.CLASS_RANGE_AGE,
          },
          {
            args: {
              athleteAge: athleteAge.toString(),
              classMinAge: classes.age.min.toString(),
              classMaxAge: classes.age.max.toString(),
            },
          },
        ),
      ),
    );
  });

  it("should throw ConflictException if the athlete's age is outside the class's age range when a user creates an athlete", async () => {
    const role = undefined;
    const athleteDto = {
      plan: new Types.ObjectId('68ab8644201ea1a63f8cb22e'),
      classes: new Types.ObjectId('68b4acbe14a396b9de66a803'),
      paymentMode: PaymentMode.PIX,
      dateBirth: new Date('2018-02-04'),
    } as AthleteDto;
    const classes = {
      id: athleteDto.classes,
      modality: new Types.ObjectId('68ab8644201ea1a63f8cb33e'),
      age: {
        min: 4,
        max: 6,
      },
    } as ClassDocument;
    const plan = {
      id: athleteDto.plan,
      modality: new Types.ObjectId('68ab8644201ea1a63f8cb33e'),
      value: 100,
    } as PlanDocument;

    classesService.findById = jest.fn().mockResolvedValue(classes);
    plansService.findById = jest.fn().mockResolvedValue(plan);

    validateFieldsService.validateCpf = jest.fn().mockImplementation(() => {});

    const athleteAge = calculateAge(athleteDto.dateBirth);

    await expect(service.createAthlete(athleteDto, role)).rejects.toThrow(
      new ConflictException(
        translateService.translate(
          {
            i18nFile: I18nFiles.ERRORS,
            module: ModuleName.ATHLETES,
            message: Message.CLASS_RANGE_AGE,
          },
          {
            args: {
              athleteAge: athleteAge.toString(),
              classMinAge: classes.age.min.toString(),
              classMaxAge: classes.age.max.toString(),
            },
          },
        ),
      ),
    );
  });

  it('should throw BadRequestException if an adult athlete does not provide an email when an admin creates an athlete', async () => {
    const role = 'admin';
    const athleteDto: AthleteDto = {
      name: 'Test',
      cpf: '42153505240',
      dateBirth: new Date('1978-04-22'),
      plan: new Types.ObjectId('68ab8644201ea1a63f8cb22e'),
      classes: new Types.ObjectId('68b4acbe14a396b9de66a803'),
      email: undefined,
      paymentMode: PaymentMode.PERSONALLY,
    };
    const classes = {
      id: athleteDto.classes,
      modality: new Types.ObjectId('68ab8644201ea1a63f8cb33e'),
      age: {
        min: 18,
      },
    } as ClassDocument;
    const plan = {
      id: athleteDto.plan,
      modality: new Types.ObjectId('68ab8644201ea1a63f8cb33e'),
      value: 100,
    } as PlanDocument;

    classesService.findById = jest.fn().mockResolvedValue(classes);
    plansService.findById = jest.fn().mockResolvedValue(plan);

    validateFieldsService.validateCpf = jest.fn().mockImplementation(() => {});

    await expect(service.createAthlete(athleteDto, role)).rejects.toThrow(
      new BadRequestException(
        translateService.translate({
          i18nFile: I18nFiles.ERRORS,
          module: ModuleName.ATHLETES,
          message: Message.EMAIL_REQUIRED,
        }),
      ),
    );
  });

  it('should throw BadRequestException if an adult athlete does not provide an email when a user creates an athlete', async () => {
    const role = undefined;
    const athleteDto: AthleteDto = {
      name: 'Test',
      cpf: '42153505240',
      dateBirth: new Date('1978-04-22'),
      plan: new Types.ObjectId('68ab8644201ea1a63f8cb22e'),
      classes: new Types.ObjectId('68b4acbe14a396b9de66a803'),
      email: undefined,
      paymentMode: PaymentMode.PIX,
    };
    const classes = {
      id: athleteDto.classes,
      modality: new Types.ObjectId('68ab8644201ea1a63f8cb33e'),
      age: {
        min: 18,
      },
    } as ClassDocument;
    const plan = {
      id: athleteDto.plan,
      modality: new Types.ObjectId('68ab8644201ea1a63f8cb33e'),
      value: 100,
    } as PlanDocument;

    classesService.findById = jest.fn().mockResolvedValue(classes);
    plansService.findById = jest.fn().mockResolvedValue(plan);

    validateFieldsService.validateCpf = jest.fn().mockImplementation(() => {});

    await expect(service.createAthlete(athleteDto, role)).rejects.toThrow(
      new BadRequestException(
        translateService.translate({
          i18nFile: I18nFiles.ERRORS,
          module: ModuleName.ATHLETES,
          message: Message.EMAIL_REQUIRED,
        }),
      ),
    );
  });

  it('should throw BadRequestException if a minor athlete does not have a responsible person when an admin creates an athlete', async () => {
    const role = 'admin';
    const athleteDto: AthleteDto = {
      name: 'Test',
      cpf: '42153505240',
      dateBirth: new Date('2020-04-22'),
      plan: new Types.ObjectId('68ab8644201ea1a63f8cb22e'),
      classes: new Types.ObjectId('68b4acbe14a396b9de66a803'),
      responsible: undefined,
      paymentMode: PaymentMode.PERSONALLY,
    };
    const classes = {
      id: athleteDto.classes,
      modality: new Types.ObjectId('68ab8644201ea1a63f8cb33e'),
      age: {
        min: 4,
        max: 8,
      },
    } as ClassDocument;
    const plan = {
      id: athleteDto.plan,
      modality: new Types.ObjectId('68ab8644201ea1a63f8cb33e'),
      value: 100,
    } as PlanDocument;

    classesService.findById = jest.fn().mockResolvedValue(classes);
    plansService.findById = jest.fn().mockResolvedValue(plan);

    validateFieldsService.validateCpf = jest.fn().mockImplementation(() => {});

    await expect(service.createAthlete(athleteDto, role)).rejects.toThrow(
      new BadRequestException(
        translateService.translate({
          i18nFile: I18nFiles.ERRORS,
          module: ModuleName.ATHLETES,
          message: Message.RESPONSIBLE_REQUIRED,
        }),
      ),
    );
  });

  it('should throw BadRequestException if a minor athlete does not have a responsible person when a user creates an athlete', async () => {
    const role = undefined;
    const athleteDto: AthleteDto = {
      name: 'Test',
      cpf: '42153505240',
      dateBirth: new Date('2020-04-22'),
      plan: new Types.ObjectId('68ab8644201ea1a63f8cb22e'),
      classes: new Types.ObjectId('68b4acbe14a396b9de66a803'),
      responsible: undefined,
      paymentMode: PaymentMode.PIX,
    };
    const classes = {
      id: athleteDto.classes,
      modality: new Types.ObjectId('68ab8644201ea1a63f8cb33e'),
      age: {
        min: 4,
        max: 8,
      },
    } as ClassDocument;
    const plan = {
      id: athleteDto.plan,
      modality: new Types.ObjectId('68ab8644201ea1a63f8cb33e'),
      value: 100,
    } as PlanDocument;

    classesService.findById = jest.fn().mockResolvedValue(classes);
    plansService.findById = jest.fn().mockResolvedValue(plan);

    validateFieldsService.validateCpf = jest.fn().mockImplementation(() => {});

    await expect(service.createAthlete(athleteDto, role)).rejects.toThrow(
      new BadRequestException(
        translateService.translate({
          i18nFile: I18nFiles.ERRORS,
          module: ModuleName.ATHLETES,
          message: Message.RESPONSIBLE_REQUIRED,
        }),
      ),
    );
  });

  it('should throw BadRequestException if a minor athlete has a minor responsible when an admin creates an athlete', async () => {
    const role = 'admin';
    const athleteDto: AthleteDto = {
      name: 'Test',
      cpf: '42153505240',
      dateBirth: new Date('2020-04-22'),
      plan: new Types.ObjectId('68ab8644201ea1a63f8cb22e'),
      classes: new Types.ObjectId('68b4acbe14a396b9de66a803'),
      responsible: {
        dateBirth: new Date('2018-04-22'),
      } as Responsible,
      paymentMode: PaymentMode.PERSONALLY,
    };
    const classes = {
      id: athleteDto.classes,
      modality: new Types.ObjectId('68ab8644201ea1a63f8cb33e'),
      age: {
        min: 4,
        max: 8,
      },
    } as ClassDocument;
    const plan = {
      id: athleteDto.plan,
      modality: new Types.ObjectId('68ab8644201ea1a63f8cb33e'),
      value: 100,
    } as PlanDocument;

    classesService.findById = jest.fn().mockResolvedValue(classes);
    plansService.findById = jest.fn().mockResolvedValue(plan);

    validateFieldsService.validateCpf = jest.fn().mockImplementation(() => {});

    await expect(service.createAthlete(athleteDto, role)).rejects.toThrow(
      new BadRequestException(
        translateService.translate({
          i18nFile: I18nFiles.ERRORS,
          module: ModuleName.ATHLETES,
          message: Message.RESPONSIBLE_ORVER_18,
        }),
      ),
    );
  });

  it('should throw BadRequestException if a minor athlete has a minor responsible when a user creates an athlete', async () => {
    const role = undefined;
    const athleteDto: AthleteDto = {
      name: 'Test',
      cpf: '42153505240',
      dateBirth: new Date('2020-04-22'),
      plan: new Types.ObjectId('68ab8644201ea1a63f8cb22e'),
      classes: new Types.ObjectId('68b4acbe14a396b9de66a803'),
      responsible: {
        dateBirth: new Date('2018-04-22'),
      } as Responsible,
      paymentMode: PaymentMode.PIX,
    };
    const classes = {
      id: athleteDto.classes,
      modality: new Types.ObjectId('68ab8644201ea1a63f8cb33e'),
      age: {
        min: 4,
        max: 8,
      },
    } as ClassDocument;
    const plan = {
      id: athleteDto.plan,
      modality: new Types.ObjectId('68ab8644201ea1a63f8cb33e'),
      value: 100,
    } as PlanDocument;

    classesService.findById = jest.fn().mockResolvedValue(classes);
    plansService.findById = jest.fn().mockResolvedValue(plan);

    validateFieldsService.validateCpf = jest.fn().mockImplementation(() => {});

    await expect(service.createAthlete(athleteDto, role)).rejects.toThrow(
      new BadRequestException(
        translateService.translate({
          i18nFile: I18nFiles.ERRORS,
          module: ModuleName.ATHLETES,
          message: Message.RESPONSIBLE_ORVER_18,
        }),
      ),
    );
  });

  it('should throw BadRequestException if a user tries to create an athlete using a card but without providing card information', async () => {
    const role = undefined;
    const athleteDto: AthleteDto = {
      name: 'Test',
      cpf: '42153505240',
      dateBirth: new Date('1978-04-22'),
      plan: new Types.ObjectId('68ab8644201ea1a63f8cb22e'),
      classes: new Types.ObjectId('68b4acbe14a396b9de66a803'),
      email: 'unit.test.dj@gmail.com',
      paymentMode: PaymentMode.CARD,
      paymentMethod: undefined,
    };
    const classes = {
      id: athleteDto.classes,
      modality: new Types.ObjectId('68ab8644201ea1a63f8cb33e'),
      age: {
        min: 18,
      },
    } as ClassDocument;
    const plan = {
      id: athleteDto.plan,
      modality: new Types.ObjectId('68ab8644201ea1a63f8cb33e'),
      value: 100,
    } as PlanDocument;

    classesService.findById = jest.fn().mockResolvedValue(classes);
    plansService.findById = jest.fn().mockResolvedValue(plan);

    validateFieldsService.isActive = jest.fn().mockImplementation(() => {});

    validateFieldsService.validateCpf = jest.fn().mockImplementation(() => {});
    validateFieldsService.validateEmail = jest
      .fn()
      .mockImplementation(() => {});

    await expect(service.createAthlete(athleteDto, role)).rejects.toThrow(
      new BadRequestException(
        translateService.translate({
          i18nFile: I18nFiles.ERRORS,
          module: ModuleName.ATHLETES,
          message: Message.PAYMENT_METHOD_REQUIRED,
        }),
      ),
    );
  });
});

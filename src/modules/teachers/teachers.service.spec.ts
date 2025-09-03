import { Test, TestingModule } from '@nestjs/testing';
import { Model, Types } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';

import { TeachersService } from './teachers.service';
import { Teachers } from './schemas/teachers.schema';
import { FindTeachersDto } from './dtos/find-teachers.dto';
import { DateDto } from './dtos/date.dto';

import { ValidateFieldsService } from '@ds-services/validate-fields/validate-fields.service';
import { TeacherDocument } from '@ds-types/documents/teacher-document.type';
import { ClassesService } from '@ds-modules/classes/classes.service';
import { WeekDays } from '@ds-enums/week-days.enum';

describe('TeachersService', () => {
  let service: TeachersService;
  let validateFieldsService: ValidateFieldsService;
  let classesService: ClassesService;

  let model: Model<TeacherDocument>;

  const mockTeacherModel = {
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeachersService,
        {
          provide: ValidateFieldsService,
          useValue: {
            validateCpf: jest.fn(),
            validateEmail: jest.fn(),
            isActive: jest.fn(),
          },
        },
        {
          provide: ClassesService,
          useValue: {
            findByTeacher: jest.fn(),
          },
        },
        {
          provide: getModelToken(Teachers.name),
          useValue: mockTeacherModel,
        },
      ],
    }).compile();

    service = module.get<TeachersService>(TeachersService);
    validateFieldsService = module.get<ValidateFieldsService>(
      ValidateFieldsService,
    );
    classesService = module.get<ClassesService>(ClassesService);
    model = module.get<Model<TeacherDocument>>(getModelToken(Teachers.name));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a teacher succesfully', async () => {
    const newTeacher = {
      name: 'Test',
      cpf: '12345678910',
      email: 'test@gmail.com',
      hourPrice: 5,
      description: 'Unit tests with jest',
      modalities: [
        new Types.ObjectId('64f1b2a3c4d5e6f7890abc12'),
        new Types.ObjectId('64f1b2a3c4d5e6f7890abc34'),
      ],
      image: Buffer.from('new-fake-image'),
    } as TeacherDocument;

    const teacher = {
      _id: new Types.ObjectId('64f1b2a3c4d5e6f7890abc15'),
      name: 'Test',
      cpf: '12345678910',
      email: 'test@gmail.com',
      hourPrice: 5,
      description: 'Unit tests with jest',
      modalities: [
        {
          name: 'Judô',
          description: 'Modalidade Judô',
        },
        {
          name: 'Jiu-Jitsu',
          description: 'Modalidade Jiu-Jitsu',
        },
      ],
      image: Buffer.from('new-fake-image'),
    };

    validateFieldsService.validateCpf = jest.fn().mockImplementation(() => {});
    validateFieldsService.validateEmail = jest
      .fn()
      .mockImplementation(() => {});

    newTeacher.modalities.forEach(() => {
      validateFieldsService.isActive = jest.fn().mockImplementation(() => {});
    });

    mockTeacherModel.create.mockResolvedValue({
      ...newTeacher,
      _id: teacher._id,
    });
    mockTeacherModel.findById.mockReturnThis();
    mockTeacherModel.exec.mockResolvedValue(teacher);

    const result = await service.createTeacher(newTeacher);

    expect(result).toEqual(teacher);
    expect(validateFieldsService.validateCpf).toHaveBeenCalledWith(
      'Teachers',
      newTeacher.cpf,
    );
    expect(validateFieldsService.validateEmail).toHaveBeenCalledWith(
      'Teachers',
      newTeacher.email,
    );
    newTeacher.modalities.forEach((modalityId) => {
      expect(validateFieldsService.isActive).toHaveBeenCalledWith(
        'Modalities',
        modalityId,
      );
    });
    expect(validateFieldsService.isActive).toHaveBeenCalledTimes(
      newTeacher.modalities.length,
    );
    expect(model.create).toHaveBeenCalledWith(newTeacher);
    expect(model.findById).toHaveBeenCalledWith(teacher._id);
  });

  it('should calculate salarie successfully', () => {
    const workload = 30;
    const hourPrice = 5;

    const result = service.calculateSalarie(hourPrice, workload);

    expect(result).toEqual((hourPrice * workload).toFixed(2));
  });

  it("should calculate the teacher's monthly workload successfully", async () => {
    const teacherId = new Types.ObjectId();
    const month = 9;
    const year = 2025;
    const classes = [
      {
        hour: {
          start: '17:00',
          end: '18:00',
        },
        weekDays: [WeekDays.MONDAY, WeekDays.WEDNESDAY],
      },
      {
        hour: {
          start: '18:00',
          end: '19:00',
        },
        weekDays: [WeekDays.MONDAY, WeekDays.WEDNESDAY],
      },
    ];

    classesService.findByTeacher = jest.fn().mockResolvedValue(classes);

    const result = await service.monthlyWorkload(teacherId, month, year);

    expect(result).toEqual(18);
  });

  it('should return 0 if the teacher has no classes', async () => {
    const teacherId = new Types.ObjectId();
    const month = 9;
    const year = 2025;

    classesService.findByTeacher = jest.fn().mockResolvedValue([]);

    const result = await service.monthlyWorkload(teacherId, month, year);

    expect(result).toEqual(0);
  });

  it('should find all teachers', async () => {
    const queryParams: FindTeachersDto = {
      skip: 0,
      limit: 0,
      status: true,
    };
    const teachers = [
      {
        _id: new Types.ObjectId('64f1b2a3c4d5e6f7890abc15'),
        name: 'Test',
        cpf: '12345678910',
        email: 'test@gmail.com',
        hourPrice: 5,
        description: 'Unit tests with jest',
        modalities: [
          {
            name: 'Judô',
            description: 'Modalidade Judô',
          },
          {
            name: 'Jiu-Jitsu',
            description: 'Modalidade Jiu-Jitsu',
          },
        ],
        image: Buffer.from('new-fake-image'),
      },
    ];

    mockTeacherModel.find.mockReturnThis();
    mockTeacherModel.skip.mockReturnThis();
    mockTeacherModel.limit.mockReturnThis();
    mockTeacherModel.where.mockReturnThis();
    mockTeacherModel.equals.mockReturnThis();
    mockTeacherModel.exec.mockResolvedValue(teachers);

    const result = await service.findAll(queryParams, []);

    expect(result).toEqual(teachers);
    expect(model.find).toHaveBeenCalledWith({}, {});
    expect(result.length).toBe(teachers.length);
    expect(mockTeacherModel.skip).toHaveBeenCalledWith(queryParams.skip);
    expect(mockTeacherModel.limit).toHaveBeenCalledWith(queryParams.limit);
    expect(mockTeacherModel.where).toHaveBeenCalledWith('status');
    expect(mockTeacherModel.equals).toHaveBeenCalledWith(queryParams.status);
  });

  it('should find by id successfully', async () => {
    const id = new Types.ObjectId();
    const teacher = {
      _id: id,
      name: 'Test',
      cpf: '12345678910',
      email: 'test@gmail.com',
      hourPrice: 5,
      description: 'Unit tests with jest',
      modalities: [
        {
          name: 'Judô',
          description: 'Modalidade Judô',
        },
        {
          name: 'Jiu-Jitsu',
          description: 'Modalidade Jiu-Jitsu',
        },
      ],
      image: Buffer.from('new-fake-image'),
    };

    mockTeacherModel.findById.mockReturnThis();
    mockTeacherModel.exec.mockReturnValue(teacher);

    const result = await service.findById(id, []);

    expect(result).toEqual(teacher);
    expect(model.findById).toHaveBeenCalledWith(id, {});
  });

  it("should throw NotFoundException if teacher doesn't exist", async () => {
    const id = new Types.ObjectId();

    mockTeacherModel.findById.mockReturnThis();
    mockTeacherModel.exec.mockReturnValue(null);

    await expect(service.findById(id, [])).rejects.toThrow(
      new NotFoundException(`Teacher with id ${id} not found`),
    );
    expect(model.findById).toHaveBeenCalledWith(id, {});
  });

  it('should find all teachers with admin role', async () => {
    const role = 'admin';
    const queryParams: FindTeachersDto = {
      skip: 0,
      limit: 0,
      status: true,
      month: 9,
      year: 2025,
    };
    const teachers = [
      {
        _id: new Types.ObjectId('64f1b2a3c4d5e6f7890abc15'),
        name: 'Test',
        cpf: '12345678910',
        email: 'test@gmail.com',
        hourPrice: 5,
        description: 'Unit tests with jest',
        modalities: [
          {
            name: 'Judô',
            description: 'Modalidade Judô',
          },
          {
            name: 'Jiu-Jitsu',
            description: 'Modalidade Jiu-Jitsu',
          },
        ],
        image: Buffer.from('new-fake-image'),
      },
    ];
    const workload = 30;
    const salarie = '150';
    const teachersReport = teachers.map((teacher) => {
      return {
        teacher,
        report: {
          workload: '30:00',
          salarie,
          month: queryParams.month,
          year: queryParams.year,
        },
      };
    });

    service.findAll = jest.fn().mockResolvedValue(teachers);
    service.monthlyWorkload = jest.fn().mockResolvedValue(workload);
    service.calculateSalarie = jest.fn().mockReturnValue(salarie);

    const result = await service.findAllWithRole(role, queryParams);

    expect(result).toEqual(teachersReport);
    expect(service.findAll).toHaveBeenCalledWith(queryParams, []);
    expect(service.monthlyWorkload).toHaveBeenCalledTimes(teachers.length);
    expect(service.calculateSalarie).toHaveBeenCalledTimes(teachers.length);
  });

  it('should find all teachers without admin role', async () => {
    const role = undefined;
    const queryParams: FindTeachersDto = {
      skip: 0,
      limit: 0,
      status: true,
    };
    const teachers = [
      {
        _id: new Types.ObjectId('64f1b2a3c4d5e6f7890abc15'),
        name: 'Test',
        description: 'Unit tests with jest',
        modalities: [
          {
            name: 'Judô',
            description: 'Modalidade Judô',
          },
          {
            name: 'Jiu-Jitsu',
            description: 'Modalidade Jiu-Jitsu',
          },
        ],
        image: Buffer.from('new-fake-image'),
      },
    ];

    service.findAll = jest.fn().mockResolvedValue(teachers);
    service.monthlyWorkload = jest.fn();
    service.calculateSalarie = jest.fn();

    const result = await service.findAllWithRole(role, queryParams);

    expect(result).toEqual(teachers);
    expect(service.findAll).toHaveBeenCalledWith(queryParams, [
      'name',
      'description',
      'image',
    ]);
    expect(service.monthlyWorkload).toHaveBeenCalledTimes(0);
    expect(service.calculateSalarie).toHaveBeenCalledTimes(0);
  });

  it('should find teacher by id with admin role', async () => {
    const id = '64f1b2a3c4d5e6f7890abc15';
    const role = 'admin';
    const queryParams: DateDto = {
      month: 9,
      year: 2025,
    };
    const teacher = {
      _id: new Types.ObjectId(id),
      name: 'Test',
      cpf: '12345678910',
      email: 'test@gmail.com',
      hourPrice: 5,
      description: 'Unit tests with jest',
      modalities: [
        {
          name: 'Judô',
          description: 'Modalidade Judô',
        },
        {
          name: 'Jiu-Jitsu',
          description: 'Modalidade Jiu-Jitsu',
        },
      ],
      image: Buffer.from('new-fake-image'),
    };
    const workload = 30;
    const salarie = '150';
    const teachersReport = {
      teacher,
      report: {
        workload: '30:00',
        salarie,
        month: queryParams.month,
        year: queryParams.year,
      },
    };

    service.findById = jest.fn().mockResolvedValue(teacher);
    service.monthlyWorkload = jest.fn().mockResolvedValue(workload);
    service.calculateSalarie = jest.fn().mockReturnValue(salarie);

    const result = await service.findByIdWithRole(id, role, queryParams);

    expect(result).toEqual(teachersReport);
    expect(service.findById).toHaveBeenCalledWith(teacher._id, []);
  });

  it('should find teacher by id without admin role', async () => {
    const id = '64f1b2a3c4d5e6f7890abc15';
    const role = undefined;
    const queryParams: DateDto = {
      month: 9,
      year: 2025,
    };
    const teacher = {
      _id: new Types.ObjectId(id),
      name: 'Test',
      description: 'Unit tests with jest',
      modalities: [
        {
          name: 'Judô',
          description: 'Modalidade Judô',
        },
        {
          name: 'Jiu-Jitsu',
          description: 'Modalidade Jiu-Jitsu',
        },
      ],
      image: Buffer.from('new-fake-image'),
    };
    service.findById = jest.fn().mockResolvedValue(teacher);
    service.monthlyWorkload = jest.fn();
    service.calculateSalarie = jest.fn();

    const result = await service.findByIdWithRole(id, role, queryParams);

    expect(result).toEqual(teacher);
    expect(service.findById).toHaveBeenCalledWith(teacher._id, [
      'name',
      'description',
      'image',
    ]);
    expect(service.monthlyWorkload).toHaveBeenCalledTimes(0);
    expect(service.calculateSalarie).toHaveBeenCalledTimes(0);
  });
});

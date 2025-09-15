import { Test, TestingModule } from '@nestjs/testing';
import { Model, Types } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';

import { ClassesService } from './classes.service';
import { Classes } from './schemas/classes.schema';
import { ClassesHistory } from './schemas/classes-history.schema';
import { FindClassesDto } from './dtos/find-classes.dto';

import { ClassDocument } from '@ds-types/documents/class-document.type';
import { ModalitiesService } from '@ds-modules/modalities/modalities.service';
import { TeachersService } from '@ds-modules/teachers/teachers.service';
import { WeekDays } from '@ds-enums/week-days.enum';
import { ModalitiesDocument } from '@ds-types/documents/modalitie-document.type';
import { TeacherDocument } from '@ds-types/documents/teacher-document.type';

describe('ClassesService', () => {
  let service: ClassesService;
  let modalitiesService: ModalitiesService;
  let teachersService: TeachersService;
  let classesModel: Model<ClassDocument>;
  // let classesHistoryModel: Model<ClassHistoryDocument>;

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
    aggregate: jest.fn().mockReturnThis(),
    exec: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClassesService,
        {
          provide: getModelToken(Classes.name),
          useValue: mockModel,
        },
        {
          provide: getModelToken(ClassesHistory.name),
          useValue: mockModel,
        },
        {
          provide: ModalitiesService,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: TeachersService,
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ClassesService>(ClassesService);
    modalitiesService = module.get<ModalitiesService>(ModalitiesService);
    teachersService = module.get<TeachersService>(TeachersService);
    classesModel = module.get<Model<ClassDocument>>(
      getModelToken(Classes.name),
    );
    // classesHistoryModel = module.get<Model<ClassHistoryDocument>>(
    //   getModelToken(ClassesHistory.name),
    // );

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('shoud create a class successfully', async () => {
    const newClass = {
      modality: new Types.ObjectId('60c72b2f9b1d8c001c8e4e1a'),
      teacher: new Types.ObjectId('60c72b2f9b1d8c001c8e4e2b'),
      hour: {
        start: '18:00',
        end: '19:00',
      },
      age: {
        min: 10,
        max: 15,
      },
      maxAthletes: 20,
      weekDays: [WeekDays.MONDAY, WeekDays.WEDNESDAY],
      image: Buffer.from('fake-image'),
    } as ClassDocument;
    const modality = {
      _id: newClass.modality,
      name: 'Test',
      description: 'Unit tests with jest',
      status: true,
    } as ModalitiesDocument;
    const teacher = {
      _id: newClass.teacher,
      name: 'Teacher',
      description: 'Academy teacher',
      image: Buffer.from('teacher-fake-image'),
      modalities: [newClass.modality],
      status: true,
    } as TeacherDocument;

    modalitiesService.findById = jest.fn().mockResolvedValue(modality);
    teachersService.findById = jest.fn().mockResolvedValue(teacher);
    mockModel.create.mockResolvedValue({
      ...newClass,
      populate: jest.fn().mockImplementation(function () {
        this.modality = {
          _id: modality._id,
          name: modality.name,
          description: modality.description,
        };
        this.teacher = {
          _id: teacher._id,
          name: teacher.name,
          description: teacher.description,
          image: teacher.image,
        };
        this.populate = undefined;

        return this;
      }),
    });

    const result = await service.createClass(newClass);

    expect(result).toEqual({
      ...newClass,
      modality: {
        _id: modality._id,
        name: modality.name,
        description: modality.description,
      },
      teacher: {
        _id: teacher._id,
        name: teacher.name,
        description: teacher.description,
        image: teacher.image,
      },
    });
    expect(modalitiesService.findById).toHaveBeenCalledWith(newClass.modality);
    expect(teachersService.findById).toHaveBeenCalledWith(newClass.teacher, []);
    expect(classesModel.create).toHaveBeenCalledWith(newClass);
  });

  it('shoud throw BadRequestException if modality is disabled', async () => {
    const newClass = {
      modality: new Types.ObjectId('60c72b2f9b1d8c001c8e4e1a'),
      teacher: new Types.ObjectId('60c72b2f9b1d8c001c8e4e2b'),
      hour: {
        start: '18:00',
        end: '19:00',
      },
      age: {
        min: 10,
        max: 15,
      },
      maxAthletes: 20,
      weekDays: [WeekDays.MONDAY, WeekDays.WEDNESDAY],
      image: Buffer.from('fake-image'),
    } as ClassDocument;
    const modality = {
      _id: newClass.modality,
      name: 'Test',
      description: 'Unit tests with jest',
      status: false,
    } as ModalitiesDocument;
    const teacher = {
      _id: newClass.teacher,
      name: 'Teacher',
      description: 'Academy teacher',
      image: Buffer.from('teacher-fake-image'),
      modalities: [newClass.modality],
      status: true,
    } as TeacherDocument;

    modalitiesService.findById = jest.fn().mockResolvedValue(modality);
    teachersService.findById = jest.fn().mockResolvedValue(teacher);

    await expect(service.createClass(newClass)).rejects.toThrow(
      new BadRequestException(
        `Modality with id ${newClass.modality} is disabled`,
      ),
    );
    expect(modalitiesService.findById).toHaveBeenCalledWith(newClass.modality);
    expect(teachersService.findById).toHaveBeenCalledWith(newClass.teacher, []);
    expect(classesModel.create).toHaveBeenCalledTimes(0);
  });

  it('shoud throw BadRequestException if teacher is disabled', async () => {
    const newClass = {
      modality: new Types.ObjectId('60c72b2f9b1d8c001c8e4e1a'),
      teacher: new Types.ObjectId('60c72b2f9b1d8c001c8e4e2b'),
      hour: {
        start: '18:00',
        end: '19:00',
      },
      age: {
        min: 10,
        max: 15,
      },
      maxAthletes: 20,
      weekDays: [WeekDays.MONDAY, WeekDays.WEDNESDAY],
      image: Buffer.from('fake-image'),
    } as ClassDocument;
    const modality = {
      _id: newClass.modality,
      name: 'Test',
      description: 'Unit tests with jest',
      status: true,
    } as ModalitiesDocument;
    const teacher = {
      _id: newClass.teacher,
      name: 'Teacher',
      description: 'Academy teacher',
      image: Buffer.from('teacher-fake-image'),
      modalities: [newClass.modality],
      status: false,
    } as TeacherDocument;

    modalitiesService.findById = jest.fn().mockResolvedValue(modality);
    teachersService.findById = jest.fn().mockResolvedValue(teacher);

    await expect(service.createClass(newClass)).rejects.toThrow(
      new BadRequestException(
        `Teacher with id ${newClass.modality} is disabled`,
      ),
    );
    expect(modalitiesService.findById).toHaveBeenCalledWith(newClass.modality);
    expect(teachersService.findById).toHaveBeenCalledWith(newClass.teacher, []);
    expect(classesModel.create).toHaveBeenCalledTimes(0);
  });

  it('shoud throw BadRequestException if teacher does not have the modality', async () => {
    const newClass = {
      modality: new Types.ObjectId('60c72b2f9b1d8c001c8e4e1a'),
      teacher: new Types.ObjectId('60c72b2f9b1d8c001c8e4e2b'),
      hour: {
        start: '18:00',
        end: '19:00',
      },
      age: {
        min: 10,
        max: 15,
      },
      maxAthletes: 20,
      weekDays: [WeekDays.MONDAY, WeekDays.WEDNESDAY],
      image: Buffer.from('fake-image'),
    } as ClassDocument;
    const modality = {
      _id: newClass.modality,
      name: 'Test',
      description: 'Unit tests with jest',
      status: true,
    } as ModalitiesDocument;
    const teacher = {
      _id: newClass.teacher,
      name: 'Teacher',
      description: 'Academy teacher',
      image: Buffer.from('teacher-fake-image'),
      modalities: [new Types.ObjectId('60c72b2f9b1d8c001c8e4e3c')],
      status: true,
    } as TeacherDocument;

    modalitiesService.findById = jest.fn().mockResolvedValue(modality);
    teachersService.findById = jest.fn().mockResolvedValue(teacher);

    await expect(service.createClass(newClass)).rejects.toThrow(
      new BadRequestException(
        `Teacher ${teacher.name} does not have ${modality.name} modality`,
      ),
    );
    expect(modalitiesService.findById).toHaveBeenCalledWith(newClass.modality);
    expect(teachersService.findById).toHaveBeenCalledWith(newClass.teacher, []);
    expect(classesModel.create).toHaveBeenCalledTimes(0);
  });

  it('should find a class by ID succesfully', async () => {
    const id = new Types.ObjectId('60c72b2f9b1d8c001c8e4e1a');
    const classDoc: Partial<ClassDocument> = {
      _id: id,
      modality: new Types.ObjectId('60c72b2f9b1d8c001c8e4e1b'),
      teacher: new Types.ObjectId('60c72b2f9b1d8c001c8e4e1c'),
      hour: {
        start: '17:00',
        end: '18:00',
      },
      age: {
        min: 4,
        max: 8,
      },
      maxAthletes: 15,
      weekDays: [WeekDays.MONDAY, WeekDays.WEDNESDAY],
      image: Buffer.from('fake-image'),
      athletes: [],
    };

    mockModel.findById.mockReturnThis();
    mockModel.exec.mockResolvedValue(classDoc);

    const result = await service.findById(id);

    expect(result).toEqual(classDoc);
    expect(classesModel.findById).toHaveBeenCalledWith(id);
  });

  it('should throw a NotFoundException if class is not found', async () => {
    const id = new Types.ObjectId('60c72b2f9b1d8c001c8e4e1a');

    mockModel.findById.mockReturnThis();
    mockModel.exec.mockResolvedValue(null);

    await expect(service.findById(id)).rejects.toThrow(
      new NotFoundException(`Class with id ${id} not found`),
    );
    expect(classesModel.findById).toHaveBeenCalledWith(id);
  });

  it('should find all classses with pagination and filter', async () => {
    const queryParams: FindClassesDto = {
      skip: 0,
      limit: 5,
      status: true,
      modality: new Types.ObjectId('60c72b2f9b1d8c001c8e4e1a'),
      startHour: '17:00',
      endHour: '18:00',
      minAge: 4,
      maxAge: 8,
      weekDays: [WeekDays.MONDAY],
    };
    const classes: Partial<ClassDocument>[] = [
      {
        _id: new Types.ObjectId('60c72b2f9b1d8c001c8e4e2b'),
        modality: new Types.ObjectId('60c72b2f9b1d8c001c8e4e1b'),
        teacher: new Types.ObjectId('60c72b2f9b1d8c001c8e4e1c'),
        hour: {
          start: '17:00',
          end: '18:00',
        },
        age: {
          min: 4,
          max: 8,
        },
        maxAthletes: 15,
        weekDays: [WeekDays.MONDAY, WeekDays.WEDNESDAY],
        image: Buffer.from('fake-image'),
        athletes: [],
      },
    ];

    mockModel.find.mockReturnThis();
    mockModel.skip.mockReturnThis();
    mockModel.limit.mockReturnThis();
    mockModel.exec.mockResolvedValue(classes);

    const result = await service.findAll(queryParams);

    expect(result).toEqual(classes);
    expect(result.length).toBe(classes.length);
    expect(classesModel.find).toHaveBeenCalled();
    expect(mockModel.skip).toHaveBeenCalledWith(queryParams.skip);
    expect(mockModel.limit).toHaveBeenCalledWith(queryParams.limit);
  });

  it('should find a class by ID succesfully', async () => {
    const id = new Types.ObjectId('60c72b2f9b1d8c001c8e4e1a');
    const classDoc: Partial<ClassDocument> = {
      _id: id,
      modality: new Types.ObjectId('60c72b2f9b1d8c001c8e4e1b'),
      teacher: new Types.ObjectId('60c72b2f9b1d8c001c8e4e1c'),
      hour: {
        start: '17:00',
        end: '18:00',
      },
      age: {
        min: 4,
        max: 8,
      },
      maxAthletes: 15,
      weekDays: [WeekDays.MONDAY, WeekDays.WEDNESDAY],
      image: Buffer.from('fake-image'),
      athletes: [],
    };

    mockModel.findById.mockReturnThis();
    mockModel.exec.mockResolvedValue(classDoc);

    const result = await service.findById(id);

    expect(result).toEqual(classDoc);
    expect(classesModel.findById).toHaveBeenCalledWith(id);
  });

  it('should throw a NotFoundException if class is not found', async () => {
    const id = new Types.ObjectId('60c72b2f9b1d8c001c8e4e1a');

    mockModel.findById.mockReturnThis();
    mockModel.exec.mockResolvedValue(null);

    await expect(service.findById(id)).rejects.toThrow(
      new NotFoundException(`Class with id ${id} not found`),
    );
    expect(classesModel.findById).toHaveBeenCalledWith(id);
  });

  it('should find all classses with pagination and filter', async () => {
    const queryParams: FindClassesDto = {
      skip: 0,
      limit: 5,
      status: true,
      modality: new Types.ObjectId('60c72b2f9b1d8c001c8e4e1a'),
      startHour: '17:00',
      endHour: '18:00',
      minAge: 4,
      maxAge: 8,
      weekDays: [WeekDays.MONDAY],
    };
    const classes: Partial<ClassDocument>[] = [
      {
        _id: new Types.ObjectId('60c72b2f9b1d8c001c8e4e2b'),
        modality: new Types.ObjectId('60c72b2f9b1d8c001c8e4e1b'),
        teacher: new Types.ObjectId('60c72b2f9b1d8c001c8e4e1c'),
        hour: {
          start: '17:00',
          end: '18:00',
        },
        age: {
          min: 4,
          max: 8,
        },
        maxAthletes: 15,
        weekDays: [WeekDays.MONDAY, WeekDays.WEDNESDAY],
        image: Buffer.from('fake-image'),
        athletes: [
          new Types.ObjectId('64f1b2a3c4d5e6f7890abc12'),
          new Types.ObjectId('64f1b2a3c4d5e6f7890abc23'),
        ],
      },
    ];

    mockModel.find.mockReturnThis();
    mockModel.skip.mockReturnThis();
    mockModel.limit.mockReturnThis();
    mockModel.exec.mockResolvedValue(classes);

    const result = await service.findAll(queryParams);

    expect(result).toEqual(classes);
    expect(result.length).toBe(classes.length);
    expect(classesModel.find).toHaveBeenCalled();
    expect(mockModel.skip).toHaveBeenCalledWith(queryParams.skip);
    expect(mockModel.limit).toHaveBeenCalledWith(queryParams.limit);
  });

  it('should format class document without admin role', async () => {
    const role = undefined;
    const modality = {
      _id: new Types.ObjectId('60c72b2f9b1d8c001c8e4e3c'),
      name: 'Test 1',
      description: 'Unit tests 1',
      image: Buffer.from('fake-image'),
    };
    const teacher = {
      _id: new Types.ObjectId('60c72b2f9b1d8c001c8e4e2b'),
      name: 'Test',
      modalities: [
        new Types.ObjectId('64f1b2a3c4d5e6f7890abc12'),
        new Types.ObjectId('64f1b2a3c4d5e6f7890abc34'),
      ],
    };
    const classDoc = {
      _id: new Types.ObjectId('60c72b2f9b1d8c001c8e4e2b'),
      modality: new Types.ObjectId('60c72b2f9b1d8c001c8e4e1b'),
      teacher: new Types.ObjectId('60c72b2f9b1d8c001c8e4e1c'),
      hour: {
        start: '17:00',
        end: '18:00',
      },
      age: {
        min: 4,
        max: 8,
      },
      maxAthletes: 15,
      weekDays: [WeekDays.MONDAY, WeekDays.WEDNESDAY],
      image: Buffer.from('fake-image'),
      athletes: [
        new Types.ObjectId('64f1b2a3c4d5e6f7890abc12'),
        new Types.ObjectId('64f1b2a3c4d5e6f7890abc23'),
      ],
      populate: jest.fn().mockResolvedValue({
        toObject: () => ({
          _id: new Types.ObjectId('60c72b2f9b1d8c001c8e4e2b'),
          modality,
          teacher,
          hour: { start: '17:00', end: '18:00' },
          age: { min: 4, max: 8 },
          maxAthletes: 15,
          weekDays: ['Segunda-feira', 'Quarta-feira'],
          image: Buffer.from('fake-image'),
          athletes: [
            new Types.ObjectId('64f1b2a3c4d5e6f7890abc12'),
            new Types.ObjectId('64f1b2a3c4d5e6f7890abc23'),
          ],
        }),
      }),
    } as unknown as ClassDocument;

    const result = await service.formatClassByRole(classDoc, role);

    expect(result.modality).toEqual(modality);
    expect(result.teacher).toEqual({
      _id: teacher._id,
      name: teacher.name,
      modalities: undefined,
    });
    expect(result.athletes).toBeUndefined();
  });

  it('should format class document with admin role', async () => {
    const role = 'admin';
    const modality = {
      _id: new Types.ObjectId('60c72b2f9b1d8c001c8e4e3c'),
      name: 'Test 1',
      description: 'Unit tests 1',
      image: Buffer.from('fake-image'),
    };
    const teacher = {
      _id: new Types.ObjectId('60c72b2f9b1d8c001c8e4e2b'),
      name: 'Test',
      modalities: [
        new Types.ObjectId('64f1b2a3c4d5e6f7890abc12'),
        new Types.ObjectId('64f1b2a3c4d5e6f7890abc34'),
      ],
    };
    const classDoc = {
      _id: new Types.ObjectId('60c72b2f9b1d8c001c8e4e2b'),
      modality: new Types.ObjectId('60c72b2f9b1d8c001c8e4e1b'),
      teacher: new Types.ObjectId('60c72b2f9b1d8c001c8e4e1c'),
      hour: {
        start: '17:00',
        end: '18:00',
      },
      age: {
        min: 4,
        max: 8,
      },
      maxAthletes: 15,
      weekDays: [WeekDays.MONDAY, WeekDays.WEDNESDAY],
      image: Buffer.from('fake-image'),
      athletes: [
        new Types.ObjectId('64f1b2a3c4d5e6f7890abc12'),
        new Types.ObjectId('64f1b2a3c4d5e6f7890abc23'),
      ],
      populate: jest.fn().mockResolvedValue({
        toObject: () => ({
          _id: new Types.ObjectId('60c72b2f9b1d8c001c8e4e2b'),
          modality,
          teacher,
          hour: { start: '17:00', end: '18:00' },
          age: { min: 4, max: 8 },
          maxAthletes: 15,
          weekDays: ['Segunda-feira', 'Quarta-feira'],
          image: Buffer.from('fake-image'),
          athletes: [
            new Types.ObjectId('64f1b2a3c4d5e6f7890abc12'),
            new Types.ObjectId('64f1b2a3c4d5e6f7890abc23'),
          ],
        }),
      }),
    } as unknown as ClassDocument;

    const result = await service.formatClassByRole(classDoc, role);

    expect(result.modality).toEqual(modality);
    expect(result.teacher).toEqual({
      _id: teacher._id,
      name: teacher.name,
      modalities: undefined,
    });
    expect(result.athletes).toEqual(classDoc.athletes);
  });

  it('should return top 5 teachers', async () => {
    const limit = 5;
    const mockResult = [
      { _id: 'teacher1', totalClasses: 12 },
      { _id: 'teacher2', totalClasses: 10 },
      { _id: 'teacher3', totalClasses: 9 },
      { _id: 'teacher4', totalClasses: 8 },
      { _id: 'teacher5', totalClasses: 6 },
    ];

    mockModel.aggregate.mockReturnThis();
    mockModel.exec.mockResolvedValue(mockResult);

    const result = await service.teachersClasses(limit);

    expect(classesModel.aggregate).toHaveBeenCalledWith([
      { $match: { status: true } },
      { $group: { _id: '$teacher', totalClasses: { $sum: 1 } } },
      { $sort: { totalClasses: -1 } },
      { $limit: limit },
      { $project: { _id: 1, totalClasses: 1 } },
    ]);
    expect(result).toEqual(mockResult);
    expect(result.length).toBeLessThanOrEqual(limit);
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { Model, Types } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException } from '@nestjs/common';

import { ClassesService } from './classes.service';
import { Classes } from './schemas/classes.schema';
import { ClassesHistory } from './schemas/classes-history.schema';

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

  it('shoud create a class sucessfully', async () => {
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
    expect(teachersService.findById).toHaveBeenCalledWith(newClass.teacher);
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
    expect(teachersService.findById).toHaveBeenCalledWith(newClass.teacher);
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
    expect(teachersService.findById).toHaveBeenCalledWith(newClass.teacher);
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
    expect(teachersService.findById).toHaveBeenCalledWith(newClass.teacher);
    expect(classesModel.create).toHaveBeenCalledTimes(0);
  });
});

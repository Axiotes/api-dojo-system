import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { BadRequestException } from '@nestjs/common';
import { Request } from 'express';

import { ClassesController } from './classes.controller';
import { ClassesService } from './classes.service';
import { ClassDto } from './dtos/class.dto';
import { FindClassesDto } from './dtos/find-classes.dto';

import { ReduceImagePipe } from '@ds-common/pipes/reduce-image/reduce-image.pipe';
import { ModalitiesDocument } from '@ds-types/documents/modalitie-document.type';
import { WeekDays } from '@ds-enums/week-days.enum';
import { TeacherDocument } from '@ds-types/documents/teacher-document.type';
import { ClassDocument } from '@ds-types/documents/class-document.type';

describe('ClassesController', () => {
  let controller: ClassesController;
  let classesService: ClassesService;
  let reduceImagePipe: jest.Mocked<ReduceImagePipe>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClassesController],
      providers: [
        {
          provide: ClassesService,
          useValue: {
            createClass: jest.fn(),
            findById: jest.fn(),
            findAll: jest.fn(),
            formatClassByRole: jest.fn(),
          },
        },
        {
          provide: ReduceImagePipe,
          useValue: {
            transform: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ClassesController>(ClassesController);
    classesService = module.get<ClassesService>(ClassesService);
    reduceImagePipe = module.get<jest.Mocked<ReduceImagePipe>>(ReduceImagePipe);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a class succesfully', async () => {
    const dto: ClassDto = {
      modality: new Types.ObjectId('60c72b2f9b1d8c001c8e4e1a'),
      teacher: new Types.ObjectId('60c72b2f9b1d8c001c8e4e2b'),
      startHour: '18:00',
      endHour: '19:00',
      minAge: 10,
      maxAge: 15,
      maxAthletes: 20,
      weekDays: [WeekDays.MONDAY, WeekDays.WEDNESDAY],
    };
    const mockFile = {
      buffer: Buffer.from('fake-image'),
      mimetype: 'image/png',
    } as Express.Multer.File;
    const reducedImage = Buffer.from('reduced-image');
    const modality = {
      _id: dto.modality,
      name: 'Test',
      description: 'Unit tests with jest',
      status: true,
    } as ModalitiesDocument;
    const teacher = {
      _id: dto.teacher,
      name: 'Teacher',
      description: 'Academy teacher',
      image: Buffer.from('teacher-fake-image'),
      modalities: [dto.modality],
      status: true,
    } as TeacherDocument;

    const { startHour, endHour, minAge, maxAge, ...rest } = dto;
    const newClass = {
      ...rest,
      modality: modality,
      teacher: teacher,
      hour: {
        start: startHour,
        end: endHour,
      },
      age: {
        min: minAge,
        max: maxAge,
      },
      image: reducedImage,
    };

    reduceImagePipe.transform.mockResolvedValue(reducedImage);
    classesService.createClass = jest.fn().mockResolvedValue(newClass);

    const result = await controller.createClass(mockFile, dto);

    expect(result).toEqual({ data: newClass });
    expect(reduceImagePipe.transform).toHaveBeenCalledWith(mockFile);
    expect(classesService.createClass).toHaveBeenCalledWith({
      ...rest,
      hour: {
        start: startHour,
        end: endHour,
      },
      age: {
        min: minAge,
        max: maxAge,
      },
      image: reducedImage,
    });
  });

  it('should find a class by ID succesfully with admin role', async () => {
    const id = '60c72b2f9b1d8c001c8e4e1a';
    const mockReq: Partial<Request> & { user?: { role?: string } } = {
      user: { role: 'admin' },
    };
    const classDoc = {
      _id: new Types.ObjectId(id),
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
    } as ClassDocument;
    const formatedClass = {
      ...classDoc,
      modality: {
        _id: classDoc.modality,
        name: 'Test Modality',
      },
      teacher: {
        _id: classDoc.modality,
        name: 'Test Teacher',
        modalities: undefined,
      },
    };

    classesService.findById = jest.fn().mockResolvedValue(classDoc);
    classesService.formatClassByRole = jest
      .fn()
      .mockResolvedValue(formatedClass);

    const result = await controller.findById(id, mockReq as Request);

    expect(result).toEqual({
      data: formatedClass,
    });
    expect(classesService.findById).toHaveBeenCalledWith(classDoc._id);
    expect(classesService.formatClassByRole).toHaveBeenCalledWith(
      classDoc,
      mockReq.user.role,
    );
  });

  it('should find a class by ID succesfully without admin role', async () => {
    const id = '60c72b2f9b1d8c001c8e4e1a';
    const mockReq: Partial<Request> & { user?: { role?: string } } = {
      user: { role: undefined },
    };
    const classDoc = {
      _id: new Types.ObjectId(id),
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
    } as ClassDocument;
    const formatedClass = {
      ...classDoc,
      modality: {
        _id: classDoc.modality,
        name: 'Test Modality',
      },
      teacher: {
        _id: classDoc.modality,
        name: 'Test Teacher',
        modalities: undefined,
      },
      athletes: undefined,
    };

    classesService.findById = jest.fn().mockResolvedValue(classDoc);
    classesService.formatClassByRole = jest
      .fn()
      .mockResolvedValue(formatedClass);

    const result = await controller.findById(id, mockReq as Request);

    expect(result).toEqual({
      data: formatedClass,
    });
    expect(classesService.findById).toHaveBeenCalledWith(classDoc._id);
    expect(classesService.formatClassByRole).toHaveBeenCalledWith(
      classDoc,
      mockReq.user.role,
    );
  });

  it('should throw BadRequestException for invalid ID format in findByID', async () => {
    const invalidId = '1234';
    const mockReq: Partial<Request> & { user?: { role?: string } } = {
      user: { role: 'admin' },
    };

    await expect(
      controller.findById(invalidId, mockReq as Request),
    ).rejects.toThrow(new BadRequestException('Invalid id format'));
    expect(classesService.findById).toHaveBeenCalledTimes(0);
    expect(classesService.formatClassByRole).toHaveBeenCalledTimes(0);
  });

  it('should find all classes succesfully with admin role', async () => {
    const mockReq: Partial<Request> & { user?: { role?: string } } = {
      user: { role: 'admin' },
    };
    const queryParams: FindClassesDto = {
      skip: 0,
      limit: 0,
      status: true,
      modality: new Types.ObjectId('64f1b2a3c4d5e6f7890abc12'),
      minAge: 5,
      maxAge: 10,
      startHour: '16:00',
      endHour: '18:00',
      weekDays: [WeekDays.MONDAY],
    };
    const classes = [
      {
        _id: new Types.ObjectId('64f1b2a3c4d5e6f7890abc23'),
        modality: new Types.ObjectId('60c72b2f9b1d8c001c8e4e1b'),
        teacher: new Types.ObjectId('60c72b2f9b1d8c001c8e4e1c'),
        hour: {
          start: '16:00',
          end: '17:00',
        },
        age: {
          min: 6,
          max: 10,
        },
        maxAthletes: 15,
        weekDays: [WeekDays.MONDAY, WeekDays.WEDNESDAY],
        image: Buffer.from('fake-image'),
        athletes: [
          new Types.ObjectId('64f1b2a3c4d5e6f7890abc12'),
          new Types.ObjectId('64f1b2a3c4d5e6f7890abc23'),
        ],
      },
      {
        _id: new Types.ObjectId('64f1b2a3c4d5e6f7890abc23'),
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
    const formatedClasses = classes.map((classDoc) => {
      return {
        ...classDoc,
        modality: {
          _id: classDoc.modality,
          name: 'Test Modality',
        },
        teacher: {
          _id: classDoc.modality,
          name: 'Test Teacher',
          modalities: undefined,
        },
      };
    });

    classesService.findAll = jest.fn().mockResolvedValue(classes);
    classesService.formatClassByRole = jest
      .fn()
      .mockResolvedValueOnce(formatedClasses[0])
      .mockResolvedValueOnce(formatedClasses[1]);

    const result = await controller.findAll(queryParams, mockReq as Request);

    expect(result).toEqual({
      data: formatedClasses,
      pagination: {
        skip: queryParams.skip,
        limit: queryParams.limit,
      },
      total: formatedClasses.length,
    });
    expect(classesService.findAll).toHaveBeenCalledWith(queryParams);
    expect(classesService.formatClassByRole).toHaveBeenCalledWith(
      classes[0],
      'admin',
    );
    expect(classesService.formatClassByRole).toHaveBeenCalledWith(
      classes[1],
      'admin',
    );
    expect(classesService.formatClassByRole).toHaveBeenCalledTimes(
      formatedClasses.length,
    );
  });

  it('should throw BadRequestException for invalid ID format in findByID', async () => {
    const invalidId = '1234';
    const mockReq: Partial<Request> & { user?: { role?: string } } = {
      user: { role: 'admin' },
    };

    await expect(
      controller.findById(invalidId, mockReq as Request),
    ).rejects.toThrow(new BadRequestException('Invalid id format'));
    expect(classesService.findById).toHaveBeenCalledTimes(0);
    expect(classesService.formatClassByRole).toHaveBeenCalledTimes(0);
  });

  it('should find all classes succesfully without admin role', async () => {
    const mockReq: Partial<Request> & { user?: { role?: string } } = {
      user: { role: 'admin' },
    };
    const queryParams: FindClassesDto = {
      skip: 0,
      limit: 0,
      status: true,
      modality: new Types.ObjectId('64f1b2a3c4d5e6f7890abc12'),
      minAge: 5,
      maxAge: 10,
      startHour: '16:00',
      endHour: '18:00',
      weekDays: [WeekDays.MONDAY],
    };
    const classes = [
      {
        _id: new Types.ObjectId('64f1b2a3c4d5e6f7890abc23'),
        modality: new Types.ObjectId('60c72b2f9b1d8c001c8e4e1b'),
        teacher: new Types.ObjectId('60c72b2f9b1d8c001c8e4e1c'),
        hour: {
          start: '16:00',
          end: '17:00',
        },
        age: {
          min: 6,
          max: 10,
        },
        maxAthletes: 15,
        weekDays: [WeekDays.MONDAY, WeekDays.WEDNESDAY],
        image: Buffer.from('fake-image'),
        athletes: [
          new Types.ObjectId('64f1b2a3c4d5e6f7890abc12'),
          new Types.ObjectId('64f1b2a3c4d5e6f7890abc23'),
        ],
      },
      {
        _id: new Types.ObjectId('64f1b2a3c4d5e6f7890abc23'),
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
    const formatedClasses = classes.map((classDoc) => {
      return {
        ...classDoc,
        modality: {
          _id: classDoc.modality,
          name: 'Test Modality',
        },
        teacher: {
          _id: classDoc.modality,
          name: 'Test Teacher',
          modalities: undefined,
        },
        athletes: undefined,
      };
    });

    classesService.findAll = jest.fn().mockResolvedValue(classes);
    classesService.formatClassByRole = jest
      .fn()
      .mockResolvedValueOnce(formatedClasses[0])
      .mockResolvedValueOnce(formatedClasses[1]);

    const result = await controller.findAll(queryParams, mockReq as Request);

    expect(result).toEqual({
      data: formatedClasses,
      pagination: {
        skip: queryParams.skip,
        limit: queryParams.limit,
      },
      total: formatedClasses.length,
    });
    expect(classesService.findAll).toHaveBeenCalledWith(queryParams);
    expect(classesService.formatClassByRole).toHaveBeenCalledWith(
      classes[0],
      'admin',
    );
    expect(classesService.formatClassByRole).toHaveBeenCalledWith(
      classes[1],
      'admin',
    );
    expect(classesService.formatClassByRole).toHaveBeenCalledTimes(
      formatedClasses.length,
    );
  });
});

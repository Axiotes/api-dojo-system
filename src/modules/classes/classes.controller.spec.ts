import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';

import { ClassesController } from './classes.controller';
import { ClassesService } from './classes.service';
import { ClassDto } from './dtos/class.dto';

import { ReduceImagePipe } from '@ds-common/pipes/reduce-image/reduce-image.pipe';
import { ModalitiesDocument } from '@ds-types/documents/modalitie-document.type';
import { WeekDays } from '@ds-enums/week-days.enum';
import { TeacherDocument } from '@ds-types/documents/teacher-document.type';

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
});

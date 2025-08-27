import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';

import { TeachersController } from './teachers.controller';
import { TeachersService } from './teachers.service';
import { TeacherDto } from './dtos/teacher.dto';

import { ReduceImagePipe } from '@ds-common/pipes/reduce-image/reduce-image.pipe';

describe('TeachersController', () => {
  let controller: TeachersController;
  let teachersService: TeachersService;
  let reduceImagePipe: jest.Mocked<ReduceImagePipe>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeachersController],
      providers: [
        {
          provide: TeachersService,
          useValue: {
            createTeacher: jest.fn(),
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

    controller = module.get<TeachersController>(TeachersController);
    teachersService = module.get<TeachersService>(TeachersService);
    reduceImagePipe = module.get<jest.Mocked<ReduceImagePipe>>(ReduceImagePipe);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a teacher sucessfuly', async () => {
    const dto: TeacherDto = {
      name: 'Test',
      cpf: '12345678910',
      email: 'test@gmail.com',
      hourPrice: 5,
      description: 'Unit tests with jest',
      modalities: [
        new Types.ObjectId('64f1b2a3c4d5e6f7890abc12'),
        new Types.ObjectId('64f1b2a3c4d5e6f7890abc34'),
      ],
    };
    const mockFile = {
      buffer: Buffer.from('fake-image'),
      mimetype: 'image/png',
    } as Express.Multer.File;
    const reducedImage = Buffer.from('reduced-image');
    const teacher = {
      _id: new Types.ObjectId('64f1b2a3c4d5e6f7890abc15'),
      ...dto,
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
      image: reducedImage,
    };

    reduceImagePipe.transform.mockResolvedValue(reducedImage);
    teachersService.createTeacher = jest.fn().mockResolvedValue(teacher);

    const result = await controller.createTeacher(mockFile, dto);

    expect(result).toEqual({ data: teacher });
    expect(reduceImagePipe.transform).toHaveBeenCalledWith(mockFile);
    expect(teachersService.createTeacher).toHaveBeenCalledWith({
      ...dto,
      image: reducedImage,
    });
  });
});

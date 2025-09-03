import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { Request } from 'express';

import { TeachersController } from './teachers.controller';
import { TeachersService } from './teachers.service';
import { TeacherDto } from './dtos/teacher.dto';
import { DateDto } from './dtos/date.dto';
import { FindTeachersDto } from './dtos/find-teachers.dto';

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
            findByIdWithRole: jest.fn(),
            findAllWithRole: jest.fn(),
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

  it('should find teacher by id with admin role', async () => {
    const id = '60c72b2f9b1d8c001c8e4e1a';
    const mockReq: Partial<Request> & { user?: { role?: string } } = {
      user: { role: 'admin' },
    };
    const queryParams: DateDto = {
      month: 9,
      year: 2025,
    };
    const teacherReport = {
      teacher: {
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
      },
      report: {
        workload: '30:00',
        salarie: 150,
        month: queryParams.month,
        year: queryParams.year,
      },
    };

    teachersService.findByIdWithRole = jest
      .fn()
      .mockResolvedValue(teacherReport);

    const result = await controller.findById(
      id,
      queryParams,
      mockReq as Request,
    );

    expect(result).toEqual({ data: teacherReport });
    expect(teachersService.findByIdWithRole).toHaveBeenCalledWith(
      id,
      mockReq.user.role,
      queryParams,
    );
  });

  it('should find teacher by id without admin role', async () => {
    const id = '60c72b2f9b1d8c001c8e4e1a';
    const mockReq: Partial<Request> & { user?: { role?: string } } = {
      user: { role: undefined },
    };
    const queryParams: DateDto = {
      month: 9,
      year: 2025,
    };
    const teacher = {
      teacher: {
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
      },
    };

    teachersService.findByIdWithRole = jest.fn().mockResolvedValue(teacher);

    const result = await controller.findById(
      id,
      queryParams,
      mockReq as Request,
    );

    expect(result).toEqual({ data: teacher });
    expect(teachersService.findByIdWithRole).toHaveBeenCalledWith(
      id,
      mockReq.user.role,
      queryParams,
    );
  });

  it('should find all teachers with admin role', async () => {
    const mockReq: Partial<Request> & { user?: { role?: string } } = {
      user: { role: 'admin' },
    };
    const queryParams: FindTeachersDto = {
      skip: 0,
      limit: 5,
      status: true,
      month: 9,
      year: 2025,
    };
    const teachers = [
      {
        teacher: {
          _id: new Types.ObjectId('60c72b2f9b1d8c001c8e4e1a'),
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
        report: {
          workload: '30:00',
          salarie: 150,
          month: queryParams.month,
          year: queryParams.year,
        },
      },
    ];

    teachersService.findAllWithRole = jest.fn().mockResolvedValue(teachers);

    const result = await controller.findAll(queryParams, mockReq as Request);

    expect(result).toEqual({
      data: teachers,
      pagination: { skip: queryParams.skip, limit: queryParams.limit },
      total: teachers.length,
    });
    expect(teachersService.findAllWithRole).toHaveBeenCalledWith(
      mockReq.user.role,
      queryParams,
    );
  });

  it('should find all teachers without admin role', async () => {
    const mockReq: Partial<Request> & { user?: { role?: string } } = {
      user: { role: undefined },
    };
    const queryParams: FindTeachersDto = {
      skip: 0,
      limit: 5,
      status: true,
      month: 9,
      year: 2025,
    };
    const teachers = [
      {
        teacher: {
          _id: new Types.ObjectId('60c72b2f9b1d8c001c8e4e1a'),
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
      },
    ];

    teachersService.findAllWithRole = jest.fn().mockResolvedValue(teachers);

    const result = await controller.findAll(queryParams, mockReq as Request);

    expect(result).toEqual({
      data: teachers,
      pagination: { skip: queryParams.skip, limit: queryParams.limit },
      total: teachers.length,
    });
    expect(teachersService.findAllWithRole).toHaveBeenCalledWith(
      mockReq.user.role,
      queryParams,
    );
  });
});

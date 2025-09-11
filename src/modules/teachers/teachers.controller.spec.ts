import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { Request } from 'express';
import { BadRequestException } from '@nestjs/common';

import { TeachersController } from './teachers.controller';
import { TeachersService } from './teachers.service';
import { TeacherDto } from './dtos/teacher.dto';
import { DateDto } from './dtos/date.dto';
import { FindTeachersDto } from './dtos/find-teachers.dto';
import { UpdateTeacherDto } from './dtos/update-teacher.dto';

import { ReduceImagePipe } from '@ds-common/pipes/reduce-image/reduce-image.pipe';
import { TeacherDocument } from '@ds-types/documents/teacher-document.type';

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
            findById: jest.fn(),
            findByIdWithRole: jest.fn(),
            findAllWithRole: jest.fn(),
            update: jest.fn(),
            deactivate: jest.fn(),
            reactive: jest.fn(),
            setStatus: jest.fn(),
            report: jest.fn(),
            topFive: jest.fn(),
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

  it('should throw BadRequestException for invalid ID format in findByID', async () => {
    const invalidId = '1234';
    const mockReq: Partial<Request> & { user?: { role?: string } } = {
      user: { role: undefined },
    };
    const queryParams: DateDto = {
      month: 9,
      year: 2025,
    };

    await expect(
      controller.findById(invalidId, queryParams, mockReq as Request),
    ).rejects.toThrow(new BadRequestException('Invalid id format'));
    expect(teachersService.findById).toHaveBeenCalledTimes(0);
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

  it('should update teacher successfully', async () => {
    const id: string = '60c72b2f9b1d8c001c8e4e1a';
    const updateTeacher: UpdateTeacherDto = {
      name: 'New Name',
      cpf: '10987654321',
      email: 'newemail@gmail.com',
      description: 'Unit tests with jest',
      hourPrice: 6.2,
      modalities: [new Types.ObjectId('64f1b2a3c4d5e6f7890abc2b')],
    };
    const mockFile = {
      buffer: Buffer.from('fake-image'),
      mimetype: 'image/png',
    } as Express.Multer.File;
    const reducedImage = Buffer.from('reduced-image');
    const updatedTeacher = {
      _id: id,
      ...updateTeacher,
      image: reducedImage,
      status: true,
    } as unknown as TeacherDocument;

    reduceImagePipe.transform.mockResolvedValue(reducedImage);
    teachersService.update = jest.fn().mockResolvedValue(updatedTeacher);

    const result = await controller.update(id, mockFile, updateTeacher);

    expect(result).toEqual({ data: updatedTeacher });
    expect(reduceImagePipe.transform).toHaveBeenCalledWith(mockFile);
    expect(teachersService.update).toHaveBeenCalledWith({
      id: new Types.ObjectId(id),
      ...updateTeacher,
      image: reducedImage,
    });
  });

  it('should throw BadRequestException for invalid ID format in update', async () => {
    const invalidId = '1234';

    await expect(controller.update(invalidId)).rejects.toThrow(
      new BadRequestException('Invalid id format'),
    );
    expect(teachersService.findById).toHaveBeenCalledTimes(0);
  });

  it('should deactivate teacher successfully', async () => {
    const id = '60c72b2f9b1d8c001c8e4e1a';

    teachersService.deactivate = jest.fn().mockImplementation(() => {});

    const result = await controller.deactivate(id);

    expect(result).toEqual({
      data: 'Teacher successfully deactivate',
    });
  });

  it('should throw BadRequestException for invalid ID format in deactivate', async () => {
    const invalidId = '1234';

    await expect(controller.deactivate(invalidId)).rejects.toThrow(
      new BadRequestException('Invalid id format'),
    );
    expect(teachersService.findById).toHaveBeenCalledTimes(0);
  });

  it('should reactivate teacher successfully', async () => {
    const id = '60c72b2f9b1d8c001c8e4e1a';

    const teacher = {
      status: true,
    } as TeacherDocument;

    teachersService.findById = jest.fn().mockResolvedValue(teacher);
    teachersService.setStatus = jest.fn().mockImplementation(() => {});

    const result = await controller.reactivate(id);

    expect(result).toEqual({
      data: 'Teacher successfully reactivate',
    });
    expect(teachersService.findById).toHaveBeenCalledWith(
      new Types.ObjectId(id),
      ['status'],
    );
  });

  it('should throw BadRequestException for invalid ID format in reactivate', async () => {
    const invalidId = '1234';

    await expect(controller.reactivate(invalidId)).rejects.toThrow(
      new BadRequestException('Invalid id format'),
    );
    expect(teachersService.findById).toHaveBeenCalledTimes(0);
  });

  it('should return top 5 teachers', async () => {
    const topTeachers = [
      { _id: new Types.ObjectId('64f1b2a3c4d5e6f7890abc2b'), totalClasses: 12 },
      { _id: new Types.ObjectId('64f1b2a3c4d5e6f7890abc1a'), totalClasses: 10 },
      { _id: new Types.ObjectId('64f1b2a3c4d5e6f7890abc3c'), totalClasses: 9 },
      { _id: new Types.ObjectId('64f1b2a3c4d5e6f7890abc4d'), totalClasses: 8 },
      { _id: new Types.ObjectId('64f1b2a3c4d5e6f7890abc5e'), totalClasses: 6 },
    ];
    const teachers = topTeachers.map((teacher, index) => {
      return {
        _id: teacher._id,
        name: `Teacher ${index + 1}`,
        description: `Description ${index + 1}`,
        image: Buffer.from(`image${index + 1}`),
        status: true,
      } as TeacherDocument;
    });
    const teacherTotalClasses = topTeachers.map((topTeacher) => ({
      teacher: teachers.find((teacher) => {
        const teacherId = teacher._id as Types.ObjectId;

        return teacherId.equals(topTeacher._id);
      }),
      totalClasses: topTeacher.totalClasses,
    }));

    teachersService.topFive = jest.fn().mockResolvedValue(teacherTotalClasses);

    const result = await controller.topFive();

    expect(result).toEqual({ data: teacherTotalClasses });
    expect(teachersService.topFive).toHaveBeenCalledTimes(1);
  });

  it('should generate teachers report in pdf format', async () => {
    const pdfBuffer = Buffer.from('fake-pdf-buffer');

    const report = {
      filename: 'teachers_report.pdf',
      mimeType: 'application/pdf',
      data: pdfBuffer,
    };

    teachersService.report = jest.fn().mockResolvedValue(report);

    const result = await controller.report();

    expect(result).toEqual({ data: report });
    expect(teachersService.report).toHaveBeenCalledTimes(1);
  });
});

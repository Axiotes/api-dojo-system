import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { ConflictException } from '@nestjs/common';

import { Admin } from './schemas/admin.schema';
import { AdminDto } from './dtos/admin.dto';
import { AdminService } from './admin.service';

import { AdminDocument } from '@ds-types/documents/admin';

describe('AdminService', () => {
  let service: AdminService;
  let model: Model<AdminDocument>;

  const mockAdminModel = {
    findOne: jest.fn().mockReturnThis(),
    exec: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: getModelToken(Admin.name),
          useValue: mockAdminModel,
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    model = module.get<Model<AdminDocument>>(getModelToken(Admin.name));
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create an admin successfully', async () => {
    const adminDto: AdminDto = {
      name: 'Unit Test',
      email: 'test@gmail.com',
      password: 'Password123',
    };

    mockAdminModel.findOne.mockReturnThis();
    mockAdminModel.exec.mockResolvedValue(null);
    mockAdminModel.create.mockResolvedValue(adminDto);

    const result = await service.createAdmin(adminDto);
    expect(result).toEqual(adminDto);
    expect(model.findOne).toHaveBeenCalledWith({ email: adminDto.email });
    expect(model.create).toHaveBeenCalledWith(adminDto);
  });

  it('should throw ConflictException if admin already exists', async () => {
    const adminDto: AdminDto = {
      name: 'Unit Test',
      email: 'test@gmail.com',
      password: 'Password123',
    };

    mockAdminModel.findOne.mockReturnThis();
    mockAdminModel.exec.mockResolvedValue(adminDto);

    await expect(service.createAdmin(adminDto)).rejects.toThrow(
      new ConflictException('An admin with this email already exists'),
    );
    expect(model.findOne).toHaveBeenCalledWith({ email: adminDto.email });
    expect(model.create).toHaveBeenCalledTimes(0);
  });
});

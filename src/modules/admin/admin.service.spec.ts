import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { ConflictException, NotFoundException } from '@nestjs/common';

import { Admin } from './schemas/admin.schema';
import { AdminDto } from './dtos/admin.dto';
import { AdminService } from './admin.service';

import { AdminDocument } from '@ds-types/documents/admin';

describe('AdminService', () => {
  let service: AdminService;
  let model: Model<AdminDocument>;

  const mockAdminModel = {
    findOne: jest.fn().mockReturnThis(),
    findById: jest.fn().mockReturnThis(),
    find: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
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

  it('should find an admin by ID successfully', async () => {
    const adminId = '60c72b2f9b1d8c001c8e4e1a';
    const admin: Partial<AdminDocument> = {
      _id: adminId,
      name: 'Test Admin',
      email: 'testadmin@gmail.com',
      status: true,
    };

    mockAdminModel.findById.mockReturnThis();
    mockAdminModel.exec.mockResolvedValue(admin);

    const result = await service.findById(adminId);

    expect(result).toEqual(admin);
    expect(model.findById).toHaveBeenCalledWith(adminId);
  });

  it('should throw NotFoundException if admin not found', async () => {
    const adminId = '60c72b2f9b1d8c001c8e4e1a';

    mockAdminModel.findById.mockReturnThis();
    mockAdminModel.exec.mockResolvedValue(null);

    await expect(service.findById(adminId)).rejects.toThrow(
      new NotFoundException('Admin not found'),
    );
    expect(model.findById).toHaveBeenCalledWith(adminId);
  });

  it('should find all admins with pagination', async () => {
    const pagination = { skip: 0, limit: 5 };
    const admins: Partial<AdminDocument>[] = [
      { _id: '1', name: 'Admin 1', email: 'admin1@gmail.com' },
      { _id: '2', name: 'Admin 2', email: 'admin2@gmail.com' },
      { _id: '3', name: 'Admin 3', email: 'admin3@gmail.com' },
      { _id: '4', name: 'Admin 4', email: 'admin4@gmail.com' },
      { _id: '5', name: 'Admin 5', email: 'admin5@gmail.com' },
    ];

    mockAdminModel.find.mockReturnThis();
    mockAdminModel.skip.mockReturnThis();
    mockAdminModel.limit.mockReturnThis();
    mockAdminModel.exec.mockResolvedValue(admins);

    const result = await service.findAll(pagination);

    expect(result).toEqual(admins);
    expect(result.length).toBe(admins.length);
    expect(model.find).toHaveBeenCalled();
    expect(mockAdminModel.skip).toHaveBeenCalledWith(pagination.skip);
    expect(mockAdminModel.limit).toHaveBeenCalledWith(pagination.limit);
  });
});

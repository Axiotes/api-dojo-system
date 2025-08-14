import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { Admin } from './schemas/admin.schema';
import { AdminDto } from './dtos/admin.dto';
import { AdminService } from './admin.service';
import { AdminLoginDto } from './dtos/admin-login.dto';

import { AdminDocument } from '@ds-types/documents/admin';
import { AuthModule } from '@ds-modules/auth/auth.module';

describe('AdminService', () => {
  let service: AdminService;
  let model: Model<AdminDocument>;

  const mockAdminModel = {
    findOne: jest.fn().mockReturnThis(),
    findById: jest.fn().mockReturnThis(),
    find: jest.fn().mockReturnThis(),
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
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [],
        }),
        AuthModule,
      ],
      providers: [
        AdminService,
        {
          provide: getModelToken(Admin.name),
          useValue: mockAdminModel,
        },
      ],
    })
      .overrideProvider(ConfigService)
      .useValue({
        get: jest.fn((key: string) => {
          if (key === 'JWT_SECRET') return 'test-secret';
          if (key === 'JWT_EXPIRATION_TIME') return '1h';
          return null;
        }),
      })
      .compile();

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
    const queryParams = { skip: 0, limit: 5, status: true };
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

    const result = await service.findAll(queryParams);

    expect(result).toEqual(admins);
    expect(result.length).toBe(admins.length);
    expect(model.find).toHaveBeenCalled();
    expect(mockAdminModel.skip).toHaveBeenCalledWith(queryParams.skip);
    expect(mockAdminModel.limit).toHaveBeenCalledWith(queryParams.limit);
  });

  it('should login admin successfully', async () => {
    const loginDto: AdminLoginDto = {
      email: 'test@gmail.com',
      password: 'Password123',
    };
    const admin: Partial<AdminDocument> = {
      _id: '60c72b2f9b1d8c001c8e4e1a',
      email: loginDto.email,
      password: bcrypt.hashSync(loginDto.password, 10),
      status: true,
    };

    mockAdminModel.findOne.mockReturnThis();
    mockAdminModel.select.mockReturnThis();
    mockAdminModel.exec.mockResolvedValue(admin);

    const token = await service.login(loginDto);

    expect(token).toBeDefined();
    expect(model.findOne).toHaveBeenCalledWith({
      email: loginDto.email,
      status: true,
    });
    expect(bcrypt.compareSync(loginDto.password, admin.password)).toBe(true);
  });

  it('should throw NotFoundException for invalid email', async () => {
    const loginDto: AdminLoginDto = {
      email: 'test@gmail.com',
      password: 'Password123',
    };

    mockAdminModel.findOne.mockReturnThis();
    mockAdminModel.select.mockReturnThis();
    mockAdminModel.exec.mockResolvedValue(null);

    await expect(service.login(loginDto)).rejects.toThrow(
      new NotFoundException('Invalid email or password'),
    );
    expect(model.findOne).toHaveBeenCalledWith({
      email: loginDto.email,
      status: true,
    });
  });

  it('should throw NotFoundException for invalid password', async () => {
    const loginDto: AdminLoginDto = {
      email: 'test@gmail.com',
      password: 'Password123',
    };
    const admin: Partial<AdminDocument> = {
      _id: '60c72b2f9b1d8c001c8e4e1a',
      email: loginDto.email,
      password: bcrypt.hashSync('test123', 10),
      status: true,
    };

    mockAdminModel.findOne.mockReturnThis();
    mockAdminModel.select.mockReturnThis();
    mockAdminModel.exec.mockResolvedValue(admin);

    await expect(service.login(loginDto)).rejects.toThrow(
      new NotFoundException('Invalid email or password'),
    );
    expect(model.findOne).toHaveBeenCalledWith({
      email: loginDto.email,
      status: true,
    });
    expect(bcrypt.compareSync(loginDto.password, admin.password)).toBe(false);
  });

  it('should set admin status false successfully', async () => {
    const adminId = '60c72b2f9b1d8c001c8e4e1a';

    const admin: Partial<AdminDocument> = {
      _id: adminId,
      name: 'Test Admin',
      email: 'test@gmail.com',
      status: true,
      save: jest.fn(),
    };

    mockAdminModel.findById.mockReturnThis();
    mockAdminModel.exec.mockResolvedValue(admin);

    await service.setStatus(adminId, false);

    expect(model.findById).toHaveBeenCalledWith(adminId);
    expect(admin.status).toBe(false);
  });

  it('should set admin status true successfully', async () => {
    const adminId = '60c72b2f9b1d8c001c8e4e1a';

    const admin: Partial<AdminDocument> = {
      _id: adminId,
      name: 'Test Admin',
      email: 'test@gmail.com',
      status: false,
      save: jest.fn(),
    };

    mockAdminModel.findById.mockReturnThis();
    mockAdminModel.exec.mockResolvedValue(admin);

    await service.setStatus(adminId, true);

    expect(model.findById).toHaveBeenCalledWith(adminId);
    expect(admin.status).toBe(true);
  });

  it('should throw NotFoundException if the administrator does not exist', async () => {
    const adminId = '60c72b2f9b1d8c001c8e4e1a';

    mockAdminModel.findById.mockReturnThis();
    mockAdminModel.exec.mockResolvedValue(null);

    await expect(service.setStatus(adminId, false)).rejects.toThrow(
      new NotFoundException('Admin not found'),
    );
    expect(model.findById).toHaveBeenCalledWith(adminId);
  });
});

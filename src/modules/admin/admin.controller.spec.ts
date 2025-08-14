import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { Response } from 'express';

import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminDto } from './dtos/admin.dto';
import { AdminLoginDto } from './dtos/admin-login.dto';
import { FindAdminDto } from './dtos/find-admin.dto';
import { UpdateAdminDto } from './dtos/update-admin.dto';

import { AdminDocument } from '@ds-types/documents/admin';

describe('AdminController', () => {
  let controller: AdminController;
  let adminService: AdminService;

  const mockResponse = {
    cookie: jest.fn(),
  } as unknown as Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        {
          provide: AdminService,
          useValue: {
            createAdmin: jest.fn(),
            findById: jest.fn(),
            findAll: jest.fn(),
            login: jest.fn(),
            setStatus: jest.fn(),
            updateAdmin: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AdminController>(AdminController);
    adminService = module.get<AdminService>(AdminService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create an admin successfully', async () => {
    const adminDto: AdminDto = {
      name: 'Unit Test',
      email: 'test@gmail.com',
      password: 'Password123',
    };

    adminService.createAdmin = jest.fn().mockResolvedValue(adminDto);

    const result = await controller.createAdmin(adminDto);
    expect(result).toEqual({ data: adminDto });
    expect(adminService.createAdmin).toHaveBeenCalledWith(adminDto);
  });

  it('should find an admin by ID successfully', async () => {
    const adminId = '60c72b2f9b1d8c001c8e4e1a';
    const admin: Partial<AdminDocument> = {
      _id: adminId,
      name: 'Unit Test',
      email: 'testadmin@gmail.com',
    };

    adminService.findById = jest.fn().mockResolvedValue(admin);

    const result = await controller.findById(adminId);

    expect(result).toEqual({ data: admin });
    expect(adminService.findById).toHaveBeenCalledWith(adminId);
  });

  it('should throw BadRequestException for invalid ID format', async () => {
    const invalidId = '1234';

    await expect(controller.findById(invalidId)).rejects.toThrow(
      new BadRequestException('Invalid id format'),
    );
    expect(adminService.findById).toHaveBeenCalledTimes(0);
  });

  it('should find all admins successfully', async () => {
    const queryParams: FindAdminDto = { skip: 0, limit: 5, status: true };
    const admins: Partial<AdminDocument>[] = [
      {
        _id: '60c72b2f9b1d8c001c8e4e1a',
        name: 'Admin 1',
        email: 'admin1@gmail.com',
      },
      {
        _id: '60c72b2f9b1d8c001c8e4e2a',
        name: 'Admin 2',
        email: 'admin2@gmail.com',
      },
      {
        _id: '60c72b2f9b1d8c001c8e4e3a',
        name: 'Admin 3',
        email: 'admin3@gmail.com',
      },
      {
        _id: '60c72b2f9b1d8c001c8e4e4a',
        name: 'Admin 4',
        email: 'admin4@gmail.com',
      },
      {
        _id: '60c72b2f9b1d8c001c8e4e5a',
        name: 'Admin 5',
        email: 'admin5@gmail.com',
      },
    ];

    adminService.findAll = jest.fn().mockResolvedValue(admins);

    const result = await controller.findAll(queryParams);

    expect(result).toEqual({
      data: admins,
      pagination: { skip: queryParams.skip, limit: queryParams.limit },
      total: admins.length,
    });
    expect(result.data.length).toBe(admins.length);
    expect(adminService.findAll).toHaveBeenCalledWith(queryParams);
  });

  it('should login successfully', async () => {
    const loginDto: AdminLoginDto = {
      email: 'tests@gmail.com',
      password: 'test123',
    };
    const token = 'jwt-token';

    adminService.login = jest.fn().mockResolvedValue(token);

    const result = await controller.login(loginDto, mockResponse);
    expect(result).toEqual({ data: 'Login successful' });
  });

  it('should inative an admin successfully', async () => {
    const adminId = '60c72b2f9b1d8c001c8e4e1a';
    const status = false;

    adminService.setStatus = jest.fn().mockResolvedValue(undefined);

    const result = await controller.inactive(adminId);

    expect(result).toEqual({ data: 'Admin successfully deactivated' });
    expect(adminService.setStatus).toHaveBeenCalledWith(adminId, status);
  });

  it('should throw BadRequestException for invalid ID format on inactivation', async () => {
    const invalidId = '1234';

    await expect(controller.inactive(invalidId)).rejects.toThrow(
      new BadRequestException('Invalid id format'),
    );
    expect(adminService.setStatus).toHaveBeenCalledTimes(0);
  });

  it('should throw BadRequestException for invalid ID format on reactivation', async () => {
    const invalidId = '1234';

    await expect(controller.reactivate(invalidId)).rejects.toThrow(
      new BadRequestException('Invalid id format'),
    );
    expect(adminService.setStatus).toHaveBeenCalledTimes(0);
  });

  it('should reactivate an admin successfully', async () => {
    const adminId = '60c72b2f9b1d8c001c8e4e1a';
    const status = true;

    adminService.setStatus = jest.fn().mockResolvedValue(undefined);

    const result = await controller.reactivate(adminId);

    expect(result).toEqual({ data: 'Admin successfully deactivated' });
    expect(adminService.setStatus).toHaveBeenCalledWith(adminId, status);
  });

  it('should update an admin successfully', async () => {
    const updateDto: UpdateAdminDto = {
      email: 'test@gmail.com',
      password: 'Password123',
      newName: 'Updated Name',
      newEmail: 'newtest@gmail.com',
      newPassword: 'NewPassword123',
    };
    const updatedAdmin: Partial<AdminDocument> = {
      _id: '60c72b2f9b1d8c001c8e4e1a',
      name: updateDto.newName,
      email: updateDto.newEmail,
    };

    adminService.updateAdmin = jest.fn().mockResolvedValue(updatedAdmin);

    const result = await controller.updateAdmin(updateDto);
    expect(result).toEqual({ data: updatedAdmin });
    expect(adminService.updateAdmin).toHaveBeenCalledWith(updateDto);
  });
});

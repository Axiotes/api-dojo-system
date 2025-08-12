import { Test, TestingModule } from '@nestjs/testing';

import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminDto } from './dtos/admin.dto';

describe('AdminController', () => {
  let controller: AdminController;
  let adminService: AdminService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        {
          provide: AdminService,
          useValue: {
            createAdmin: jest.fn(),
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
});

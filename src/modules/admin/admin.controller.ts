import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';

import { AdminDto } from './dtos/admin.dto';
import { AdminService } from './admin.service';

import { ApiResponse } from '@ds-types/api-response.type';
import { AdminDocument } from '@ds-types/documents/admin';
import { RoleGuard } from '@ds-common/guards/role/role.guard';
import { Roles } from '@ds-common/decorators/roles.decorator';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('admin')
  @Throttle({
    default: {
      limit: 10,
      ttl: 60000,
    },
  })
  @Post()
  public async createAdmin(
    @Body() body: AdminDto,
  ): Promise<ApiResponse<AdminDocument>> {
    const admin = await this.adminService.createAdmin(body);

    return {
      data: admin,
    };
  }
}

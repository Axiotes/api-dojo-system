import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import { ApiCookieAuth, ApiOperation } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { Response } from 'express';

import { AdminDto } from './dtos/admin.dto';
import { AdminService } from './admin.service';
import { FindAdminDto } from './dtos/find-admin.dto';
import { AdminLoginDto } from './dtos/admin-login.dto';
import { UpdateAdminDto } from './dtos/update-admin.dto';

import { ApiResponse } from '@ds-types/api-response.type';
import { AdminDocument } from '@ds-types/documents/admin';
import { RoleGuard } from '@ds-common/guards/role/role.guard';
import { Roles } from '@ds-common/decorators/roles.decorator';
import { TranslateService } from '@ds-services/translate/translate.service';
import { I18nFiles } from '@ds-enums/i18n-files.enum';
import { ModuleName } from '@ds-enums/module-name.enum';
import { UserMessage } from '@ds-enums/user-message.enum';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly translateService: TranslateService,
  ) {}

  @ApiCookieAuth()
  @ApiOperation({
    summary: 'docs.ADMIN.REGISTER_SUMMARY',
    description: 'docs.ADMIN.REGISTER_DESCRIPTION',
  })
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

  @ApiOperation({
    summary: 'docs.ADMIN.LOGIN_SUMMARY',
    description: 'docs.ADMIN.LOGIN_DESCRIPTION',
  })
  @Throttle({
    default: {
      limit: 5,
      ttl: 60000,
    },
  })
  @Post('login')
  public async login(
    @Body() loginDto: AdminLoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ApiResponse<string>> {
    const token = await this.adminService.login(loginDto);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 604800000,
    });

    return {
      data: this.translateService.translate({
        i18nFile: I18nFiles.ERRORS,
        module: ModuleName.COMMON,
        message: UserMessage.SUCCESSFUL_LOGIN,
      }),
    };
  }

  @ApiCookieAuth()
  @ApiOperation({
    summary: 'docs.ADMIN.FIND_BY_ID_SUMMARY',
    description: 'docs.ADMIN.FIND_BY_ID_DESCRIPTION',
  })
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('admin')
  @Throttle({
    default: {
      limit: 10,
      ttl: 60000,
    },
  })
  @Get('id/:id')
  public async findById(
    @Param('id') id: string,
  ): Promise<ApiResponse<AdminDocument>> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(
        this.translateService.translate(
          {
            i18nFile: I18nFiles.ERRORS,
            module: ModuleName.COMMON,
            message: UserMessage.INVALID_ID,
          },
          { args: { property: 'id' } },
        ),
      );
    }

    const admin = await this.adminService.findById(id);

    return {
      data: admin,
    };
  }

  @ApiCookieAuth()
  @ApiOperation({
    summary: 'docs.ADMIN.FIND_ALL_SUMMARY',
    description: 'docs.ADMIN.FIND_ALL_DESCRIPTION',
  })
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('admin')
  @Throttle({
    default: {
      limit: 10,
      ttl: 60000,
    },
  })
  @Get()
  public async findAll(
    @Query() query: FindAdminDto,
  ): Promise<ApiResponse<AdminDocument[]>> {
    const admins = await this.adminService.findAll(query);

    return {
      data: admins,
      pagination: {
        skip: query.skip,
        limit: query.limit,
      },
      total: admins.length,
    };
  }

  @ApiCookieAuth()
  @ApiOperation({
    summary: 'docs.ADMIN.DEACTIVATE_SUMMARY',
    description: 'docs.ADMIN.DEACTIVATE_DESCRIPTION',
  })
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('admin')
  @Throttle({
    default: {
      limit: 10,
      ttl: 60000,
    },
  })
  @Patch('inactive/:id')
  public async inactive(@Param('id') id: string): Promise<ApiResponse<string>> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(
        this.translateService.translate(
          {
            i18nFile: I18nFiles.ERRORS,
            module: ModuleName.COMMON,
            message: UserMessage.INVALID_ID,
          },
          { args: { property: 'id' } },
        ),
      );
    }

    await this.adminService.setStatus(id, false);

    return {
      data: this.translateService.translate({
        i18nFile: I18nFiles.ERRORS,
        module: ModuleName.COMMON,
        message: UserMessage.DEACTIVATED,
      }),
    };
  }

  @ApiCookieAuth()
  @ApiOperation({
    summary: 'docs.ADMIN.REACTIVATE_SUMMARY',
    description: 'docs.ADMIN.REACTIVATE_DESCRIPTION',
  })
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('admin')
  @Throttle({
    default: {
      limit: 10,
      ttl: 60000,
    },
  })
  @Patch('reactivate/:id')
  public async reactivate(
    @Param('id') id: string,
  ): Promise<ApiResponse<string>> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(
        this.translateService.translate(
          {
            i18nFile: I18nFiles.ERRORS,
            module: ModuleName.COMMON,
            message: UserMessage.INVALID_ID,
          },
          { args: { property: 'id' } },
        ),
      );
    }

    await this.adminService.setStatus(id, true);

    return {
      data: this.translateService.translate({
        i18nFile: I18nFiles.ERRORS,
        module: ModuleName.COMMON,
        message: UserMessage.REACTIVATED,
      }),
    };
  }

  @ApiCookieAuth()
  @ApiOperation({
    summary: 'docs.ADMIN.UPDATE_SUMMARY',
    description: 'docs.ADMIN.UPDATE_DESCRIPTION',
  })
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('admin')
  @Throttle({
    default: {
      limit: 5,
      ttl: 60000,
    },
  })
  @Patch()
  public async updateAdmin(
    @Body() updateDto: UpdateAdminDto,
  ): Promise<ApiResponse<AdminDocument>> {
    const updatedAdmin = await this.adminService.updateAdmin(updateDto);

    return {
      data: updatedAdmin,
    };
  }
}

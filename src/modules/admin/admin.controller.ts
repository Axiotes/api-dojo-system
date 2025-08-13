import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
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
import { Pagination } from './dtos/pagination.dto';
import { AdminLoginDto } from './dtos/admin-login.dto';

import { ApiResponse } from '@ds-types/api-response.type';
import { AdminDocument } from '@ds-types/documents/admin';
import { RoleGuard } from '@ds-common/guards/role/role.guard';
import { Roles } from '@ds-common/decorators/roles.decorator';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @ApiCookieAuth()
  @ApiOperation({
    summary: 'Cadastra um novo administrador da academia',
    description:
      'Apenas usuários com token jwt e cargos "admin" podem utilizar este endpoint',
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
    summary: 'Login do administrador da academia',
    description:
      'Em caso de sucesso, retorna um token JWT nos cookies que deve ser utilizado para acessar outros endpoints protegidos.',
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
      data: 'Login successful',
    };
  }

  @ApiCookieAuth()
  @ApiOperation({
    summary: 'Busca administrador da academia por ID',
    description:
      'Apenas usuários com token jwt e cargos "admin" podem utilizar este endpoint',
  })
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('admin')
  @Throttle({
    default: {
      limit: 10,
      ttl: 60000,
    },
  })
  @Get(':id')
  public async findById(
    @Param('id') id: string,
  ): Promise<ApiResponse<AdminDocument>> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid id format');
    }

    const admin = await this.adminService.findById(id);

    return {
      data: admin,
    };
  }

  @ApiCookieAuth()
  @ApiOperation({
    summary: 'Busca administradores da academia',
    description:
      'Apenas usuários com token jwt e cargos "admin" podem utilizar este endpoint',
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
    @Query() pagination: Pagination,
  ): Promise<ApiResponse<AdminDocument[]>> {
    const admins = await this.adminService.findAll(pagination);

    return {
      data: admins,
      pagination,
      total: admins.length,
    };
  }
}

import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import { Types } from 'mongoose';

import { PlansService } from './plans.service';
import { PlanDto } from './dtos/plan.dto';
import { FindModalitiesDto } from './dtos/find-plan.dto';

import { ApiResponse } from '@ds-types/api-response.type';
import { PlanDocument } from '@ds-types/documents/plan-document';
import { RoleGuard } from '@ds-common/guards/role/role.guard';
import { Roles } from '@ds-common/decorators/roles.decorator';

@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @ApiCookieAuth()
  @ApiOperation({
    summary: 'Cadastra um novo plano',
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
  public async createPlan(
    @Body() planDto: PlanDto,
  ): Promise<ApiResponse<PlanDocument>> {
    const plan = await this.plansService.createPlan(planDto);

    return {
      data: plan,
    };
  }

  @ApiOperation({
    summary: 'Buscar planos por ID',
  })
  @Throttle({
    default: {
      limit: 30,
      ttl: 60000,
    },
  })
  @Get(':id')
  public async findById(
    @Param('id') id: string,
  ): Promise<ApiResponse<PlanDocument>> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid id format');
    }

    const plan = await this.plansService.findById(id);

    return {
      data: plan,
    };
  }

  @ApiOperation({
    summary: 'Buscar todos os planos com paginação e filtro por status',
  })
  @Throttle({
    default: {
      limit: 30,
      ttl: 60000,
    },
  })
  @Get()
  public async findAll(
    @Query() queryParams: FindModalitiesDto,
  ): Promise<ApiResponse<PlanDocument[]>> {
    const plans = await this.plansService.findAll(queryParams);

    return {
      data: plans,
      pagination: {
        skip: queryParams.skip,
        limit: queryParams.limit,
      },
      total: plans.length,
    };
  }
}

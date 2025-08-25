import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';

import { PlansService } from './plans.service';
import { PlanDto } from './dtos/plan.dto';

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
}

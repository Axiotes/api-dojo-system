import { Body, Controller, Post } from '@nestjs/common';

import { PlansService } from './plans.service';
import { PlanDto } from './dtos/plan.dto';

import { ApiResponse } from '@ds-types/api-response.type';
import { PlanDocument } from '@ds-types/documents/plan-document';

@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

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

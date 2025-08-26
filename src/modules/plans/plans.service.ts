import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Plans } from './schemas/plans.schema';
import { PlanDto } from './dtos/plan.dto';
import { FindPlansDto } from './dtos/find-plans.dto';

import { PlanDocument } from '@ds-types/documents/plan-document';
import { ValidateFieldsService } from '@ds-services/validate-fields/validate-fields.service';

@Injectable()
export class PlansService {
  constructor(
    @InjectModel(Plans.name) private plansModel: Model<Plans>,
    private readonly validateFieldsService: ValidateFieldsService,
  ) {}

  public async createPlan(planDto: PlanDto): Promise<PlanDocument> {
    await this.validateFieldsService.isActive('Modalities', planDto.modality);

    const newPlan = await this.plansModel.create(planDto);

    return await this.plansModel.findById(newPlan._id).exec();
  }

  public async findById(id: string): Promise<PlanDocument> {
    const plan = await this.plansModel.findById(id).exec();

    if (!plan) {
      throw new NotFoundException(`Plan with id ${id} not found`);
    }

    return plan;
  }

  public async findAll(queryParams: FindPlansDto): Promise<PlanDocument[]> {
    const query = this.plansModel
      .find()
      .skip(queryParams.skip)
      .limit(queryParams.limit);

    if (queryParams.status !== undefined) {
      query.where('status').equals(queryParams.status);
    }

    return await query.exec();
  }
}

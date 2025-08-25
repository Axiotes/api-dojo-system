import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Plans } from './schemas/plans.schema';
import { PlanDto } from './dtos/plan.dto';
import { FindModalitiesDto } from './dtos/find-plan.dto';

import { ModalitiesService } from '@ds-modules/modalities/modalities.service';
import { PlanDocument } from '@ds-types/documents/plan-document';
import { ModalitiesDocument } from '@ds-types/documents/modalitie-document.type';

@Injectable()
export class PlansService {
  constructor(
    @InjectModel(Plans.name) private plansModel: Model<Plans>,
    private readonly modalitiesService: ModalitiesService,
  ) {}

  public async createPlan(planDto: PlanDto): Promise<PlanDocument> {
    const modality: ModalitiesDocument = await this.modalitiesService.findById(
      planDto.modality,
    );

    if (!modality.status) {
      throw new BadRequestException(
        `Modality with id ${planDto.modality} is disabled`,
      );
    }

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

  public async findAll(
    queryParams: FindModalitiesDto,
  ): Promise<PlanDocument[]> {
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

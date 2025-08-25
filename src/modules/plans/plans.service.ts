import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Plans } from './schemas/plans.schema';
import { PlanDto } from './dtos/plan.dto';

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
}

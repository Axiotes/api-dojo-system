import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Plans } from './schemas/plans.schema';
import { PlanDto } from './dtos/plan.dto';
import { FindPlansDto } from './dtos/find-plans.dto';

import { PlanDocument } from '@ds-types/documents/plan-document';
import { ValidateFieldsService } from '@ds-services/validate-fields/validate-fields.service';
import { TranslateService } from '@ds-services/translate/translate.service';
import { I18nFiles } from '@ds-enums/i18n-files.enum';
import { Message } from '@ds-enums/message.enum';
import { ModuleName } from '@ds-enums/module-name.enum';

@Injectable()
export class PlansService {
  constructor(
    @InjectModel(Plans.name) private plansModel: Model<Plans>,
    private readonly validateFieldsService: ValidateFieldsService,
    private readonly translateService: TranslateService,
  ) {}

  public async createPlan(planDto: PlanDto): Promise<PlanDocument> {
    await this.validateFieldsService.isActive('Modalities', planDto.modality);

    const newPlan = await this.plansModel.create(planDto);

    return await this.plansModel.findById(newPlan._id).exec();
  }

  public async findById<K extends keyof PlanDocument>(
    id: Types.ObjectId,
    fields: K[],
  ): Promise<PlanDocument> {
    const projection = Object.fromEntries(fields.map((key) => [key, 1]));

    const plan = await this.plansModel.findById(id, projection).exec();

    if (!plan) {
      throw new NotFoundException(
        this.translateService.translate({
          i18nFile: I18nFiles.ERRORS,
          module: ModuleName.PLANS,
          message: Message.NOT_FOUND,
        }),
      );
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

    if (queryParams.modality !== undefined) {
      query.where('modality').equals(queryParams.modality);
    }

    return await query.exec();
  }

  public async findByModality<K extends keyof PlanDocument>(
    modalityId: Types.ObjectId,
    fields: K[],
  ): Promise<PlanDocument[]> {
    const projection = Object.fromEntries(fields.map((key) => [key, 1]));

    const plan = await this.plansModel
      .find({ modality: modalityId, status: true }, projection)
      .exec();

    return plan;
  }
}

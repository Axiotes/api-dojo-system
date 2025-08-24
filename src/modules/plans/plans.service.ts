import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Plans } from './schemas/plans.schema';

@Injectable()
export class PlansService {
  constructor(@InjectModel(Plans.name) private plansModel: Model<Plans>) {}
}

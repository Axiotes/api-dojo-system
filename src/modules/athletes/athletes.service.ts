import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Athletes } from './schemas/athletes.schema';

@Injectable()
export class AthletesService {
  constructor(
    @InjectModel(Athletes.name) private athletesModel: Model<Athletes>,
  ) {}
}

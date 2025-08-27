import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Classes } from './schemas/classes.schema';
import { ClassesHistory } from './schemas/classes-history.schema';

import { ValidateFieldsService } from '@ds-services/validate-fields/validate-fields.service';

@Injectable()
export class ClassesService {
  constructor(
    @InjectModel(Classes.name) private classesModel: Model<Classes>,
    @InjectModel(ClassesHistory.name)
    private classesHistoryModel: Model<ClassesHistory>,
    private readonly validateFieldsService: ValidateFieldsService,
  ) {}
}

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Classes } from './schemas/classes.schema';
import { ClassesHistory } from './schemas/classes-history.schema';

import { ValidateFieldsService } from '@ds-services/validate-fields/validate-fields.service';
import { ClassDocument } from '@ds-types/documents/class-document.type';

@Injectable()
export class ClassesService {
  constructor(
    @InjectModel(Classes.name) private classesModel: Model<Classes>,
    @InjectModel(ClassesHistory.name)
    private classesHistoryModel: Model<ClassesHistory>,
    private readonly validateFieldsService: ValidateFieldsService,
  ) {}

  public async createClass(newClass: ClassDocument): Promise<ClassDocument> {
    await this.validateFieldsService.isActive('Modalities', newClass.modality);
    await this.validateFieldsService.isActive('Teachers', newClass.teacher);

    const classDoc = await this.classesModel.create(newClass);

    return await this.classesModel.findById(classDoc._id).exec();
  }
}

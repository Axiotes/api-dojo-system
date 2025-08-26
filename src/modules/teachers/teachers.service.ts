import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Teachers } from './schemas/teachers.schema';

import { TeacherDocument } from '@ds-types/documents/teacher-document.type';
import { ValidateFieldsService } from '@ds-services/validate-fields/validate-fields.service';

@Injectable()
export class TeachersService {
  constructor(
    @InjectModel(Teachers.name) private teachersModel: Model<Teachers>,
    private readonly validateFieldsService: ValidateFieldsService,
  ) {}

  public async createTeacher(
    newTeacher: TeacherDocument,
  ): Promise<TeacherDocument> {
    await this.validateFieldsService.validateCpf('Teachers', newTeacher.cpf);
    await this.validateFieldsService.validateEmail(
      'Teachers',
      newTeacher.email,
    );

    const modalitiesPromise = newTeacher.modalities.map(async (modalityId) => {
      await this.validateFieldsService.isActive('Modalities', modalityId);
    });
    await Promise.all(modalitiesPromise);

    const teacher = await this.teachersModel.create(newTeacher);

    return await this.teachersModel.findById(teacher._id).exec();
  }
}

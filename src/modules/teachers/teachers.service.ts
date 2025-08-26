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

  public async createTeacher(newTeacher: TeacherDocument) {
    await this.validateFieldsService.validateCpf('Teachers', newTeacher.cpf);
    await this.validateFieldsService.validateEmail(
      'Teachers',
      newTeacher.email,
    );
  }
}

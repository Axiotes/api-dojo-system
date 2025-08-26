import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Teachers } from './schemas/teachers.schema';

import { ModalitiesService } from '@ds-modules/modalities/modalities.service';
import { TeacherDocument } from '@ds-types/documents/teacher-document.type';

@Injectable()
export class TeachersService {
  constructor(
    @InjectModel(Teachers.name) private teachersModel: Model<Teachers>,
    private readonly modalitiesService: ModalitiesService,
  ) {}

  public async createTeacher(newTeacher: TeacherDocument) {}
}

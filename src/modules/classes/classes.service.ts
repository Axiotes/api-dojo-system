import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Classes } from './schemas/classes.schema';
import { ClassesHistory } from './schemas/classes-history.schema';

import { ClassDocument } from '@ds-types/documents/class-document.type';
import { ModalitiesService } from '@ds-modules/modalities/modalities.service';
import { TeachersService } from '@ds-modules/teachers/teachers.service';
import { Role } from '@ds-types/role.type';

@Injectable()
export class ClassesService {
  constructor(
    @InjectModel(Classes.name) private classesModel: Model<Classes>,
    @InjectModel(ClassesHistory.name)
    private classesHistoryModel: Model<ClassesHistory>,
    private readonly modalitiesService: ModalitiesService,
    private readonly teachersService: TeachersService,
  ) {}

  public async createClass(newClass: ClassDocument): Promise<ClassDocument> {
    const [modality, teacher] = await Promise.all([
      this.modalitiesService.findById(newClass.modality),
      this.teachersService.findById(newClass.teacher),
    ]);

    if (!modality.status) {
      throw new BadRequestException(
        `Modality with id ${newClass.modality} is disabled`,
      );
    }

    if (!teacher.status) {
      throw new BadRequestException(
        `Teacher with id ${newClass.modality} is disabled`,
      );
    }

    const modalityMatch = teacher.modalities.some(
      (teacherModality) =>
        teacherModality._id.toString() === modality._id.toString(),
    );

    if (!modalityMatch) {
      throw new BadRequestException(
        `Teacher ${teacher.name} does not have ${modality.name} modality`,
      );
    }

    const classDoc = await this.classesModel.create(newClass);

    await classDoc.populate([
      {
        path: 'modality',
        select: '-createdAt -updatedAt -image',
      },
      {
        path: 'teacher',
        select: 'name description',
      },
    ]);

    return classDoc;
  }

  public async findById(id: Types.ObjectId): Promise<ClassDocument> {
    const classDoc = await this.classesModel.findById(id);

    if (!classDoc) {
      throw new NotFoundException(`Class with id ${id} not found`);
    }

    return classDoc;
  }

  public async formatClassByRole(
    classDoc: ClassDocument,
    role?: Role,
  ): Promise<ClassDocument> {
    const populatedClass = await classDoc.populate([
      {
        path: 'modality',
        select: 'name',
      },
      {
        path: 'teacher',
        select: 'name',
      },
    ]);
    const classObj = populatedClass.toObject();
    classObj.teacher.modalities = undefined;

    if (role !== 'admin') {
      classObj.athletes = undefined;

      return classObj;
    }

    return classObj;
  }
}

import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Classes } from './schemas/classes.schema';
import { ClassesHistory } from './schemas/classes-history.schema';
import { FindClassesDto } from './dtos/find-classes.dto';

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

    @Inject(forwardRef(() => TeachersService))
    private readonly teachersService: TeachersService,
  ) {}

  public async createClass(newClass: ClassDocument): Promise<ClassDocument> {
    const [modality, teacher] = await Promise.all([
      this.modalitiesService.findById(newClass.modality),
      this.teachersService.findById(newClass.teacher, []),
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
    const classDoc = await this.classesModel.findById(id).exec();

    if (!classDoc) {
      throw new NotFoundException(`Class with id ${id} not found`);
    }

    return classDoc;
  }

  public async findAll(queryParams: FindClassesDto): Promise<ClassDocument[]> {
    let filter = {};

    const verifyQueryParams: { [K in keyof FindClassesDto]?: () => void } = {
      status: () => (filter = { ...filter, status: queryParams.status }),
      modality: () => (filter = { ...filter, modality: queryParams.modality }),
      minAge: () => {
        filter = {
          ...filter,
          $or: [
            {
              $and: [
                { 'age.min': { $lte: queryParams.maxAge } },
                { 'age.max': { $gte: queryParams.minAge } },
              ],
            },
            {
              $and: [
                { 'age.min': { $lte: queryParams.maxAge } },
                { 'age.max': { $exists: false } },
              ],
            },
          ],
        };
      },
      startHour: () => {
        filter = {
          ...filter,
          $or: [
            {
              $and: [
                { 'hour.start': { $gte: queryParams.startHour } },
                { 'hour.start': { $lt: queryParams.endHour } },
              ],
            },
            {
              $and: [
                { 'hour.end': { $gt: queryParams.startHour } },
                { 'hour.end': { $lte: queryParams.endHour } },
              ],
            },
          ],
        };
      },
      weekDays: () =>
        (filter = { ...filter, weekDays: { $in: queryParams.weekDays } }),
    };

    for (const key in queryParams) {
      const func = verifyQueryParams[key];

      if (func) func();
    }

    const classes = await this.classesModel
      .find(filter)
      .skip(queryParams.skip)
      .limit(queryParams.limit)
      .exec();

    return classes;
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

  public async findByTeacher(
    id: Types.ObjectId,
  ): Promise<Pick<ClassDocument, 'hour' | 'weekDays'>[]> {
    const classes = await this.classesModel
      .find({ teacher: id, status: true }, { hour: 1, weekDays: 1 })
      .exec();

    return classes;
  }
}

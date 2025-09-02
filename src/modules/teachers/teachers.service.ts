import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

import { Teachers } from './schemas/teachers.schema';

import { TeacherDocument } from '@ds-types/documents/teacher-document.type';
import { ValidateFieldsService } from '@ds-services/validate-fields/validate-fields.service';
import { ClassesService } from '@ds-modules/classes/classes.service';
import { WeekDays } from '@ds-enums/week-days.enum';

@Injectable()
export class TeachersService {
  constructor(
    @InjectModel(Teachers.name) private teachersModel: Model<Teachers>,
    private readonly validateFieldsService: ValidateFieldsService,

    @Inject(forwardRef(() => ClassesService))
    private readonly classesService: ClassesService,
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

  public async findById(id: Types.ObjectId): Promise<TeacherDocument> {
    const teacher = await this.teachersModel.findById(id).exec();

    if (!teacher) {
      throw new NotFoundException(`Teacher with id ${id} not found`);
    }

    return teacher;
  }

  public async monthlyWorkload(
    teacher: TeacherDocument,
    month: number,
    year: number,
  ): Promise<number> {
    const classes = await this.classesService.findByTeacher(teacher.id);

    let totalMinutes = 0;

    const start = startOfMonth(new Date(year, month - 1));
    const end = endOfMonth(new Date(year, month - 1));
    const days = eachDayOfInterval({ start, end });

    for (const classDoc of classes) {
      const [startHour, startMinute] = classDoc.hour.start
        .split(':')
        .map(Number);
      const [endHour, endMinute] = classDoc.hour.end.split(':').map(Number);

      const durationMinutes =
        endHour * 60 + endMinute - (startHour * 60 + startMinute);

      const classDays = days.filter((day) =>
        classDoc.weekDays.some(
          (weekDay) =>
            weekDay.toLocaleLowerCase() ===
            (
              day.toLocaleDateString('pt-BR', { weekday: 'long' }) as WeekDays
            ).toLocaleLowerCase(),
        ),
      );

      totalMinutes += classDays.length * durationMinutes;
    }

    return totalMinutes / 60;
  }

  public calculateSalarie(hourPrice: number, workload: number): number {
    return workload * hourPrice;
  }
}

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
import { DateDto } from './dtos/date.dto';
import { FindTeachersDto } from './dtos/find-teachers.dto';

import { TeacherDocument } from '@ds-types/documents/teacher-document.type';
import { ValidateFieldsService } from '@ds-services/validate-fields/validate-fields.service';
import { ClassesService } from '@ds-modules/classes/classes.service';
import { WeekDays } from '@ds-enums/week-days.enum';
import { Role } from '@ds-types/role.type';
import { TeacherReport } from '@ds-types/teacher-report.type';

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

  public async findByIdWithRole(
    id: string,
    role: Role,
    queryParams: DateDto,
  ): Promise<TeacherReport | TeacherDocument> {
    if (role !== 'admin') {
      return await this.findById(new Types.ObjectId(id), [
        'name',
        'description',
        'image',
      ]);
    }

    const month = queryParams.month ?? new Date().getMonth() + 1;
    const year = queryParams.year ?? new Date().getFullYear();

    const teacher = await this.findById(new Types.ObjectId(id), []);
    const workload = await this.monthlyWorkload(teacher.id, month, year);
    const salarie = this.calculateSalarie(teacher.hourPrice, workload);

    return {
      teacher: teacher,
      report: {
        workload: this.hoursToHHMM(workload),
        salarie,
        month,
        year,
      },
    };
  }

  public async findAllWithRole(
    role: Role,
    queryParams: FindTeachersDto,
  ): Promise<TeacherReport[] | TeacherDocument[]> {
    if (role !== 'admin') {
      return await this.findAll(queryParams, ['name', 'description', 'image']);
    }

    const month = queryParams.month ?? new Date().getMonth() + 1;
    const year = queryParams.year ?? new Date().getFullYear();

    const teachers = await this.findAll(queryParams, []);

    const reportPromises = teachers.map(async (teacher) => {
      const workload = await this.monthlyWorkload(teacher.id, month, year);
      const salarie = this.calculateSalarie(teacher.hourPrice, workload);

      return {
        teacher,
        report: {
          workload: this.hoursToHHMM(workload),
          salarie,
          month,
          year,
        },
      };
    });
    const teacherReports = await Promise.all(reportPromises);

    return teacherReports;
  }

  public async findById(
    id: Types.ObjectId,
    fields: (keyof TeacherDocument)[],
  ): Promise<TeacherDocument> {
    const projection = Object.fromEntries(fields.map((key) => [key, 1]));

    const teacher = await this.teachersModel.findById(id, projection).exec();

    if (!teacher) {
      throw new NotFoundException(`Teacher with id ${id} not found`);
    }

    return teacher;
  }

  public async findAll(
    queryParams: FindTeachersDto,
    fields: (keyof TeacherDocument)[],
  ): Promise<TeacherDocument[]> {
    const projection = Object.fromEntries(fields.map((key) => [key, 1]));

    const query = this.teachersModel
      .find({}, projection)
      .skip(queryParams.skip)
      .limit(queryParams.limit);

    if (queryParams.status !== undefined) {
      query.where('status').equals(queryParams.status);
    }

    return await query.exec();
  }

  public async monthlyWorkload(
    teacherId: Types.ObjectId,
    month: number,
    year: number,
  ): Promise<number> {
    const classes = await this.classesService.findByTeacher(teacherId);

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

  public calculateSalarie(hourPrice: number, workload: number): string {
    const salarie = workload * hourPrice;

    return salarie.toFixed(2);
  }

  private hoursToHHMM(hours: number): string {
    const hour = Math.floor(hours);
    const minute = Math.round((hours - hour) * 60);
    const hh = String(hour).padStart(2, '0');
    const mm = String(minute).padStart(2, '0');

    return `${hh}:${mm}`;
  }
}

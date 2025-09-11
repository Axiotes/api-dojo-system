import * as fs from 'node:fs';
import * as path from 'node:path';

import {
  BadRequestException,
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
import { UpdateTeacherDto } from './dtos/update-teacher.dto';

import { TeacherDocument } from '@ds-types/documents/teacher-document.type';
import { ValidateFieldsService } from '@ds-services/validate-fields/validate-fields.service';
import { ClassesService } from '@ds-modules/classes/classes.service';
import { WeekDays } from '@ds-enums/week-days.enum';
import { Role } from '@ds-types/role.type';
import { TeacherReport } from '@ds-types/teacher-report.type';
import { ReportService } from '@ds-services/report/report.service';
import { Report } from '@ds-types/report.type';
import { TeachersPdf } from '@ds-types/teachers-pdf.type';
import { hoursToHHMM } from '@ds-common/helpers/hours-to-hhmm.helper';
import { hoursText } from '@ds-common/helpers/hours-text.helper';
import { logoBase64 } from '@ds-common/helpers/logo-base64.helper';
import { costEvolution } from '@ds-common/helpers/cost-evolution.helper';

@Injectable()
export class TeachersService {
  constructor(
    @InjectModel(Teachers.name) private teachersModel: Model<Teachers>,
    private readonly validateFieldsService: ValidateFieldsService,
    private readonly reportService: ReportService,

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
    const workload = await this.monthlyWorkload(
      teacher._id as Types.ObjectId,
      month,
      year,
    );
    const salary = this.calculateSalary(teacher.hourPrice, workload);

    return {
      teacher: teacher,
      report: {
        workload: hoursToHHMM(workload),
        salary: salary.toLocaleString('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
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
      const workload = await this.monthlyWorkload(
        teacher._id as Types.ObjectId,
        month,
        year,
      );
      const salary = this.calculateSalary(teacher.hourPrice, workload);

      return {
        teacher,
        report: {
          workload: hoursToHHMM(workload),
          salary: salary.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
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
    const classes = await this.classesService.findByTeacher(teacherId, [
      'hour',
      'weekDays',
    ]);

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

  public calculateSalary(hourPrice: number, workload: number): number {
    const salary = workload * hourPrice;

    return salary;
  }

  public async update(
    updateTeacher: Partial<TeacherDocument>,
  ): Promise<TeacherDocument> {
    const teacher = await this.findById(updateTeacher.id, []);
    const teacherUpdates: Partial<TeacherDocument> = {};

    const verifyUpdate: { [K in keyof UpdateTeacherDto]?: () => void } = {
      name: () => (teacherUpdates.name = updateTeacher.name ?? teacher.name),
      cpf: async () => {
        await this.validateFieldsService.validateCpf(
          'Teachers',
          updateTeacher.cpf,
        );

        teacherUpdates.cpf = updateTeacher.cpf;
      },
      email: async () => {
        await this.validateFieldsService.validateEmail(
          'Teachers',
          updateTeacher.email,
        );

        teacherUpdates.email = updateTeacher.email;
      },
      description: () =>
        (teacherUpdates.description =
          updateTeacher.description ?? teacher.description),
      hourPrice: () =>
        (teacherUpdates.hourPrice =
          updateTeacher.hourPrice ?? teacher.hourPrice),
      modalities: async () => {
        const modalitiesPromise = updateTeacher.modalities.map(
          async (modalityId) => {
            await this.validateFieldsService.isActive('Modalities', modalityId);
          },
        );
        await Promise.all(modalitiesPromise);

        const teacherClasses = await this.classesService.findByTeacher(
          teacher.id,
          ['modality'],
        );

        teacherClasses.forEach((classDoc) => {
          const modalityMatch = updateTeacher.modalities.some(
            (modality) => modality.toString() === classDoc.modality.toString(),
          );

          if (!modalityMatch) {
            throw new BadRequestException(
              `Teacher ${teacher.name} must have the ${classDoc.modality} modality to match his class registration`,
            );
          }
        });

        teacherUpdates.modalities = updateTeacher.modalities;
      },
    };

    for (const key in updateTeacher) {
      const func = verifyUpdate[key];

      if (func) await func();
    }

    teacherUpdates.image = updateTeacher.image ?? teacher.image;

    return await this.teachersModel.findByIdAndUpdate(
      teacher.id,
      teacherUpdates,
      { new: true },
    );
  }

  public async deactivate(id: string): Promise<void> {
    const teacher = await this.findById(new Types.ObjectId(id), [
      'id',
      'status',
    ]);

    const classes = await this.classesService.findByTeacher(teacher.id, ['id']);

    if (classes.length > 0) {
      throw new BadRequestException('Teacher is registered in active classes');
    }

    await this.setStatus(teacher, false);
  }

  public async setStatus(
    teacher: TeacherDocument,
    status: boolean,
  ): Promise<void> {
    teacher.status = status;
    await teacher.save();
  }

  public async topFive(): Promise<
    {
      teacher: TeacherDocument;
      totalClasses: number;
    }[]
  > {
    const topTeachers = await this.classesService.teachersClasses(5);

    if (!topTeachers.length) return [];

    const teacherIds = topTeachers.map((teacher) => teacher._id);

    const teachers = await this.teachersModel
      .find({ _id: { $in: teacherIds }, status: true })
      .select(['name', 'description', 'image'])
      .exec();

    return topTeachers.map((topTeacher) => ({
      teacher: teachers.find((teacher) => teacher._id.equals(topTeacher._id)),
      totalClasses: topTeacher.totalClasses,
    }));
  }

  public async report(): Promise<Report> {
    const templatePath = path.join(
      process.cwd(),
      'src/templates/pdfs',
      'teacher-report.hbs',
    );
    const templateString = fs.readFileSync(templatePath, 'utf-8');

    const pdfData = await this.teacherPdfData();

    const pdfBuffer = await this.reportService.templateToPdf<TeachersPdf>(
      templateString,
      pdfData,
    );

    return {
      filename: `teachers-report.pdf`,
      mimeType: 'application/pdf',
      file: pdfBuffer,
    };
  }

  private async teacherPdfData(): Promise<TeachersPdf> {
    const date = new Date();

    console.log('Current Month: ', date.getMonth() + 1);
    const teachersData = await this.teachersData(
      date.getMonth() + 1,
      date.getFullYear(),
    );
    const indicators = await this.teachersIndicators(teachersData, date);

    const formattedTeachers = teachersData.map((teacher) => {
      const formattedCpf = teacher.cpf.replace(
        /(\d{3})(\d{3})(\d{3})(\d{2})/,
        '$1.$2.$3-$4',
      );
      const createdAt = teacher.createdAt as Date;

      return {
        ...teacher,
        cpf: formattedCpf,
        hourPrice: teacher.hourPrice.toLocaleString('pt-BR'),
        createdAt: createdAt.toLocaleDateString('pt-BR', {
          timeZone: 'America/Sao_Paulo',
        }),
        workload: hoursText(teacher.workload as number),
        salary: teacher.salary.toLocaleString('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
      };
    });

    return {
      header: {
        title: 'Relatório de Professores da academia',
        logoPath: logoBase64(),
        date: new Date().toLocaleDateString('pt-BR', {
          timeZone: 'America/Sao_Paulo',
        }),
        time: new Date().toLocaleTimeString('pt-BR', {
          timeZone: 'America/Sao_Paulo',
        }),
      },
      teachers: formattedTeachers,
      indicators,
    };
  }

  private async teachersData(
    month: number,
    year: number,
  ): Promise<TeachersPdf['teachers']> {
    const months = [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro',
    ];

    const totalTeachers = await this.teachersModel.countDocuments({
      status: true,
    });

    const teachersClasses =
      await this.classesService.teachersClasses(totalTeachers);

    const teacherIds = teachersClasses.map((teacher) => teacher._id);

    const teachers = await this.teachersModel
      .find({ _id: { $in: teacherIds }, status: true })
      .select(['name', 'cpf', 'email', 'modalities', 'hourPrice', 'createdAt'])
      .exec();

    const teachersDataPromises = teachersClasses.map(async (teacherClass) => {
      const teacher = teachers.find((t) => t._id.equals(teacherClass._id));

      const workload = await this.monthlyWorkload(teacher._id, month, year);
      const salary = this.calculateSalary(teacher.hourPrice, workload);
      const modalitiesNames = teacher.modalities.map((modality) => {
        return modality['name'];
      });

      return {
        name: teacher.name,
        cpf: teacher.cpf,
        email: teacher.email,
        modalities: modalitiesNames.join(', '),
        totalClasses: teacherClass.totalClasses,
        hourPrice: teacher.hourPrice,
        createdAt: teacher['createdAt'],
        workload: workload,
        salary: salary,
        month: months[month - 1],
      };
    });

    const teachersData = await Promise.all(teachersDataPromises);

    return teachersData;
  }

  private async teachersIndicators(
    teachersData: TeachersPdf['teachers'],
    date: Date,
  ): Promise<TeachersPdf['indicators']> {
    const totalTeachers = teachersData.length;
    let totalSalary = 0;
    let totalHourPrice = 0;
    let totalWorkload = 0;
    let month = '';
    const year = new Date().getFullYear();
    const teachersTotalClasses = [];

    teachersData.forEach((teacher) => {
      month = teacher.month;

      const salary = teacher.salary as number;
      totalSalary += salary;

      const hourPrice = teacher.hourPrice as number;
      totalHourPrice += hourPrice;

      const workload = teacher.workload as number;
      totalWorkload += workload;

      const totalClasses = teacher.totalClasses;
      teachersTotalClasses.push({ name: teacher.name, totalClasses });
    });

    teachersTotalClasses.sort((a, b) => b.totalClasses - a.totalClasses);

    const moreClasses = teachersTotalClasses[0];
    const lessClasses = teachersTotalClasses[teachersTotalClasses.length - 1];

    const averageHourPrice =
      totalTeachers > 0 ? totalHourPrice / totalTeachers : 0;
    const averageWorkload =
      totalTeachers > 0 ? totalWorkload / totalTeachers : 0;
    const averageSalary = totalTeachers > 0 ? totalSalary / totalTeachers : 0;

    const lastMonth = new Date(
      date.getFullYear(),
      date.getMonth() - 1,
      date.getDate(),
    );
    console.log('Last Month:', lastMonth.getMonth() + 1);
    const lastTeachersData = await this.teachersData(
      lastMonth.getMonth() + 1,
      lastMonth.getFullYear(),
    );

    let lastTotalSalary = 0;
    lastTeachersData.forEach((teacher) => {
      const salary = teacher.salary as number;
      lastTotalSalary += salary;
    });

    return {
      totalTeachers,
      totalSalary: totalSalary.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      averageHourPrice: averageHourPrice.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      averageWorkload: hoursText(averageWorkload),
      averageSalary: averageSalary.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      moreClasses: `${moreClasses.name} (${moreClasses.totalClasses})`,
      lessClasses: `${lessClasses.name} (${lessClasses.totalClasses})`,
      costEvolution: costEvolution(totalSalary, lastTotalSalary),
      month,
      year,
    };
  }
}

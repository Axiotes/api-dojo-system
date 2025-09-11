import { PdfHeader } from './pdf-header.type';

export type TeachersPdf = {
  header: PdfHeader;
  teachers: {
    name: string;
    cpf: string;
    email: string;
    modalities: string;
    totalClasses: number;
    hourPrice: string | number;
    createdAt: string | Date;
    workload: string | number;
    salary: string | number;
    month: string;
  }[];
  indicators: {
    totalTeachers: number;
    totalSalary: string;
    averageHourPrice: string;
    averageWorkload: string;
    averageSalary: string;
    costEvolution: string;
    moreClasses: string;
    lessClasses: string;
    month: string;
    year: number;
  };
};

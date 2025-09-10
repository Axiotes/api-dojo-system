import { PdfHeader } from './pdf-header.type';

export type TeachersPdf = {
  header: PdfHeader;
  teachers: {
    name: string;
    cpf: string;
    email: string;
    modalities: string;
    totalClasses: number;
    hourPrice: string;
    createdAt: string;
    workload: string;
    salary: string;
    month: string;
  }[];
};

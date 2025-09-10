import { TeacherDocument } from './documents/teacher-document.type';

export type TeacherReport = {
  teacher: TeacherDocument;
  report: {
    workload: string;
    salary: string;
    month: number;
    year: number;
  };
};

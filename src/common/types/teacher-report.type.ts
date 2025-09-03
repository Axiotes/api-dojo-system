import { TeacherDocument } from './documents/teacher-document.type';

export type TeacherReport = {
  teacher: TeacherDocument;
  report: {
    workload: string;
    salarie: string;
    month: number;
    year: number;
  };
};

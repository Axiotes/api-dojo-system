import { TeacherDocument } from './documents/teacher-document.type';

export type TeacherReport = {
  teacher: TeacherDocument;
  report: {
    workload: number | string;
    salarie: number;
    month: number;
    year: number;
  };
};

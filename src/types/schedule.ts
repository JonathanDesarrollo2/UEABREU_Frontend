export interface TypeScheduleCreate {
  code: string;
  grade: string;
  section: string;
  day: 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes';
  startBlock: number;
  endBlock: number;
  classroom?: string;
  building?: string;
  subjectId: string;
  teacherId?: string;
}

export interface TypeScheduleUpdate {
  id: string;
  code?: string;
  grade?: string;
  section?: string;
  day?: 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes';
  startBlock?: number;
  endBlock?: number;
  classroom?: string;
  building?: string;
  subjectId?: string;
  teacherId?: string;
}

export interface TypeSubjectCreate {
  name: string;
  code: string;
  hoursPerWeek: number;
  theoreticalHours?: number;
  labHours?: number;
  subjectType?: 'ordinaria' | 'regular' | 'complementaria_obligatoria' | 'complementaria_opcional';
  comments?: string;
  class?: string;
  teacherId?: string;
}

export interface TypeTeacherCreate {
  fullName: string;
  identityCard: string;
  address: string;
  phone: string;
  email: string;
  specialization?: string;
  degree?: string;
  status?: boolean;
  comments?: string;
  class?: string;
}

export interface ScheduleBlock {
  blockId: number;
  time: string;
  period: string;
  isBreak: boolean;
  isOccupied?: boolean;
  occupiedBy?: string;
  subject?: string;
  subjectCode?: string;
  teacher?: string;
  classroom?: string;
  scheduleId?: string;
  spans?: number;
}

export interface ScheduleDay {
  [day: string]: ScheduleBlock[];
}

export interface ScheduleResponse {
  grade: string;
  section: string;
  blockTimes: any[];
  schedulesByDay: ScheduleDay;
}

export interface TypeApiResponseGeneric {
  result: boolean;
  content: any;
  error: string[];
}
export interface TypeSubject {
  id?: string;
  name?: string;
  code?: string;
  hoursPerWeek?: number;
  theoreticalHours?: number;
  labHours?: number;
  subjectType?: 'ordinaria' | 'regular' | 'complementaria_obligatoria' | 'complementaria_opcional';
  comments?: string;
  class?: string;
  teacherId?: string;
  createdAt?: Date;
  updatedAt?: Date;
  teacher?: {
    id?: string;
    fullName?: string;
    email?: string;
    phone?: string;
    specialization?: string;
  };
}

export interface TypeSubjectCreate {
  name: string;
  code: string;
  hoursPerWeek: number;
  theoreticalHours?: number;
  labHours?: number;
  subjectType?: string;
  comments?: string;
  class?: string;
  teacherId?: string;
}

export interface TypeSubjectUpdate {
  id: string;
  name?: string;
  code?: string;
  hoursPerWeek?: number;
  theoreticalHours?: number;
  labHours?: number;
  subjectType?: string;
  comments?: string;
  class?: string;
  teacherId?: string;
}

export interface TypeSubjectListResponse {
  result: boolean;
  content: TypeSubject[];
  pagination: {
    totalRecords: number;
    currentPage: number;
    totalPages: number;
  };
  error: string[];
}

export interface TypeSubjectResponse {
  result: boolean;
  content: TypeSubject;
  error: string[];
}

export interface TypeSubjectGenericResponse {
  result: boolean;
  content: string[] | any[];
  error: string[];
}
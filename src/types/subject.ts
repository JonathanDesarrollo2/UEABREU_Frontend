// Tipos principales de Subject
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

// Para creación de materia
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

// Para actualización de materia
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

// Respuesta de la API para lista paginada
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

// Respuesta de la API para una sola materia
export interface TypeSubjectResponse {
  result: boolean;
  content: TypeSubject;
  error: string[];
}

// Respuesta genérica de la API (para creación, actualización, eliminación)
export interface TypeSubjectGenericResponse {
  result: boolean;
  content: string[] | any[];
  error: string[];
}

// Para búsqueda/filtros
export interface TypeSubjectFilter {
  page?: number;
  limit?: number;
  search?: string;
  grade?: string;
  subjectType?: string;
  teacherId?: string;
}
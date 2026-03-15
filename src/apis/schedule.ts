import { isAxiosError } from "axios";
import api from "../library/axios";
import type { TypeApiResponseGeneric, TypeScheduleCreate, TypeScheduleUpdate, TypeSubjectCreate } from "../types/schedule";
import type { TypeTeacher } from "../types/teacher";

// Tipos para las respuestas
export interface ScheduleResponse {
  result: boolean;
  content: any;
  error: string[];
}

export interface PaginatedResponse {
  result: boolean;
  content: any[];
  pagination: {
    totalRecords: number;
    currentPage: number;
    totalPages: number;
  };
  error: string[];
}

// ========== API PARA HORARIOS ==========
export async function addScheduleAPI(formdata: TypeScheduleCreate): Promise<TypeApiResponseGeneric> {
  try {
    const { data } = await api.post<TypeApiResponseGeneric>('/private/academic/schedule/add', formdata);
    return data;
  } catch (error) {
    let mensaje = 'Error al crear horario';
    if (isAxiosError(error) && error.response) {
      const errores = error.response.data.error;
      if (errores && errores.length > 0) {
        mensaje = errores.join(', ');
      }
    }
    throw new Error(mensaje);
  }
}

export async function getSchedulesAPI(params?: {
  grade?: string;
  section?: string;
  day?: string;
  search?: string;
}): Promise<ScheduleResponse> {
  try {
    const { data } = await api.get<ScheduleResponse>('/private/academic/schedule/list', { params });
    return data;
  } catch (error) {
    throw new Error('Error al obtener horarios');
  }
}

export async function getScheduleByIdAPI(id: string): Promise<ScheduleResponse> {
  try {
    const { data } = await api.get<ScheduleResponse>(`/private/academic/schedule/${id}`);
    return data;
  } catch (error) {
    throw new Error('Error al obtener horario');
  }
}

export async function updateScheduleAPI(formdata: TypeScheduleUpdate): Promise<TypeApiResponseGeneric> {
  try {
    const { data } = await api.post<TypeApiResponseGeneric>('/private/academic/schedule/update', formdata);
    return data;
  } catch (error) {
    let mensaje = 'Error al actualizar horario';
    if (isAxiosError(error) && error.response) {
      const errores = error.response.data.error;
      if (errores && errores.length > 0) {
        mensaje = errores.join(', ');
      }
    }
    throw new Error(mensaje);
  }
}

export async function deleteScheduleAPI(id: string): Promise<TypeApiResponseGeneric> {
  try {
    const { data } = await api.post<TypeApiResponseGeneric>('/private/academic/schedule/delete', { id });
    return data;
  } catch (error) {
    let mensaje = 'Error al eliminar horario';
    if (isAxiosError(error) && error.response) {
      const errores = error.response.data.error;
      if (errores && errores.length > 0) {
        mensaje = errores.join(', ');
      }
    }
    throw new Error(mensaje);
  }
}

export async function getSchedulesByGradeSectionAPI(grade: string, section: string): Promise<ScheduleResponse> {
  try {
    const { data } = await api.get<ScheduleResponse>(`/private/academic/schedule/grade/${grade}/section/${section}`);
    return data;
  } catch (error) {
    throw new Error('Error al obtener horarios por grado y sección');
  }
}

// 🎯 **NUEVA FUNCIÓN: Obtener horarios de los hijos del representante**
export async function getChildrenSchedulesAPI(): Promise<any> {
  try {
    const { data } = await api.get('/private/academic/schedule/my-children');
    return data;
  } catch (error) {
    let mensaje = 'Error al obtener horarios de los hijos';
    if (isAxiosError(error) && error.response) {
      const errores = error.response.data.error;
      if (errores && errores.length > 0) {
        mensaje = errores.join(', ');
      }
    }
    throw new Error(mensaje);
  }
}

// ========== API PARA MATERIAS ==========
export async function addSubjectAPI(formdata: TypeSubjectCreate): Promise<TypeApiResponseGeneric> {
  try {
    const { data } = await api.post<TypeApiResponseGeneric>('/private/academic/subject/add', formdata);
    return data;
  } catch (error) {
    let mensaje = 'Error al crear materia';
    if (isAxiosError(error) && error.response) {
      const errores = error.response.data.error;
      if (errores && errores.length > 0) {
        mensaje = errores.join(', ');
      }
    }
    throw new Error(mensaje);
  }
}

export async function getSubjectsAPI(params?: {
  grade?: string;
  subjectType?: string;
  teacherId?: string;
  search?: string;
}): Promise<ScheduleResponse> {
  try {
    const { data } = await api.get<ScheduleResponse>('/private/academic/subject/list', { params });
    return data;
  } catch (error) {
    throw new Error('Error al obtener materias');
  }
}

export async function getSubjectsByGradeAPI(grade: string): Promise<ScheduleResponse> {
  try {
    const { data } = await api.get<ScheduleResponse>(`/private/academic/subject/grade/${grade}`);
    return data;
  } catch (error) {
    throw new Error('Error al obtener materias por grado');
  }
}

// ========== API PARA DOCENTES ==========
export async function addTeacherAPI(formdata: TypeTeacher): Promise<TypeApiResponseGeneric> {
  try {
    const { data } = await api.post<TypeApiResponseGeneric>('/private/academic/teacher/add', formdata);
    return data;
  } catch (error) {
    let mensaje = 'Error al crear docente';
    if (isAxiosError(error) && error.response) {
      const errores = error.response.data.error;
      if (errores && errores.length > 0) {
        mensaje = errores.join(', ');
      }
    }
    throw new Error(mensaje);
  }
}

export async function getTeachersAPI(params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<PaginatedResponse> {
  try {
    const { data } = await api.get<PaginatedResponse>('/private/academic/teacher/list', { params });
    return data;
  } catch (error) {
    throw new Error('Error al obtener docentes');
  }
}

export async function getActiveTeachersAPI(): Promise<ScheduleResponse> {
  try {
    const { data } = await api.get<ScheduleResponse>('/private/academic/teacher/active/list');
    return data;
  } catch (error) {
    throw new Error('Error al obtener docentes activos');
  }
}

// ========== API PARA ASIGNACIONES ==========
export async function assignStudentToScheduleAPI(formdata: {
  studentId: string;
  scheduleId: string;
  scheduleType?: string;
}): Promise<TypeApiResponseGeneric> {
  try {
    const { data } = await api.post<TypeApiResponseGeneric>('/private/academic/schedule/assign-student', formdata);
    return data;
  } catch (error) {
    let mensaje = 'Error al asignar estudiante';
    if (isAxiosError(error) && error.response) {
      const errores = error.response.data.error;
      if (errores && errores.length > 0) {
        mensaje = errores.join(', ');
      }
    }
    throw new Error(mensaje);
  }
}
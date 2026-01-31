import { isAxiosError } from "axios";
import api from "../library/axios";
import type { TypeSubjectCreate, TypeSubjectGenericResponse, TypeSubjectListResponse, TypeSubjectResponse, TypeSubjectUpdate } from "../types/subject";

// Agregar materia
export async function addSubjectAPI(formData: TypeSubjectCreate): Promise<TypeSubjectGenericResponse> {
  try {
    const formattedData = {
      ...formData,
      comments: formData.comments || '',
      class: formData.class || '',
    };
    
    const { data } = await api.post<TypeSubjectGenericResponse>('/private/academic/subject/add', formattedData);
    return data;
  } catch (error) {
    let mensaje = 'Error Desconocido';
    if (isAxiosError(error) && error.response) {
      const errores = error.response.data.error;
      if (errores && errores.length > 0) {
        mensaje = errores.join(', ');
      }
      throw new Error(mensaje);
    }
    throw new Error(mensaje);
  }
}

// Obtener materias paginadas
export async function getPaginatedSubjectsAPI(
  page: number = 1,
  limit: number = 10,
  search: string = '',
  grade?: string,
  subjectType?: string,
  teacherId?: string
): Promise<TypeSubjectListResponse> {
  try {
    const { data } = await api.get<TypeSubjectListResponse>('/private/academic/subject/list', {
      params: { page, limit, search, grade, subjectType, teacherId }
    });
    return data;
  } catch (error) {
    let mensaje = 'Error Desconocido';
    if (isAxiosError(error) && error.response) {
      const errores = error.response.data.error;
      if (errores && errores.length > 0) {
        mensaje = errores.join(', ');
      }
      throw new Error(mensaje);
    }
    throw new Error(mensaje);
  }
}

// Obtener materia por ID
export async function getSubjectByIdAPI(id: string): Promise<TypeSubjectCreate> {
  try {
    const { data } = await api.get<TypeSubjectResponse>(`/private/academic/subject/${id}`);
    return data;
  } catch (error) {
    let mensaje = 'Error Desconocido';
    if (isAxiosError(error) && error.response) {
      const errores = error.response.data.error;
      if (errores && errores.length > 0) {
        mensaje = errores.join(', ');
      }
      throw new Error(mensaje);
    }
    throw new Error(mensaje);
  }
}

// Actualizar materia
export async function updateSubjectAPI(formData: TypeSubjectUpdate): Promise<TypeSubjectGenericResponse> {
  try {
    const formattedData = {
      ...formData,
      comments: formData.comments || '',
      class: formData.class || '',
    };
    
    const { data } = await api.post<TypeSubjectGenericResponse>('/private/academic/subject/update', formattedData);
    return data;
  } catch (error) {
    let mensaje = 'Error Desconocido';
    if (isAxiosError(error) && error.response) {
      const errores = error.response.data.error;
      if (errores && errores.length > 0) {
        mensaje = errores.join(', ');
      }
      throw new Error(mensaje);
    }
    throw new Error(mensaje);
  }
}

// Eliminar materia
export async function deleteSubjectAPI(id: string): Promise<TypeSubjectGenericResponse> {
  try {
    const { data } = await api.post<TypeSubjectGenericResponse>('/private/academic/subject/delete', { id });
    return data;
  } catch (error) {
    let mensaje = 'Error Desconocido';
    if (isAxiosError(error) && error.response) {
      const errores = error.response.data.error;
      if (errores && errores.length > 0) {
        mensaje = errores.join(', ');
      }
      throw new Error(mensaje);
    }
    throw new Error(mensaje);
  }
}

// Obtener materias por grado
export async function getSubjectsByGradeAPI(grade: string): Promise<TypeSubjectListResponse> {
  try {
    const { data } = await api.get<TypeSubjectListResponse>(`/private/academic/subject/grade/${grade}`);
    return data;
  } catch (error) {
    let mensaje = 'Error Desconocido';
    if (isAxiosError(error) && error.response) {
      const errores = error.response.data.error;
      if (errores && errores.length > 0) {
        mensaje = errores.join(', ');
      }
      throw new Error(mensaje);
    }
    throw new Error(mensaje);
  }
}
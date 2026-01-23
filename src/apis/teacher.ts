// src/apis/teacher.ts
import { isAxiosError } from "axios";
import api from "../library/axios";
import type {
  TypeTeacherCreate,
  TypeTeacherUpdate,
  TypeTeacherListResponse,
  TypeTeacherResponse,
  TypeTeacherGenericResponse,
  TypeTeacherActiveList
} from "../types/teacher";

// Agregar profesor
export async function addTeacherAPI(formData: TypeTeacherCreate): Promise<TypeTeacherGenericResponse> {
  try {
    // Asegurarnos de que los campos opcionales estén presentes
    const formattedData = {
      ...formData,
      specialization: formData.specialization || '',
      degree: formData.degree || '',
      comments: formData.comments || '',
      class: formData.class || '',
    };
    
    const { data } = await api.post<TypeTeacherGenericResponse>('/private/academic/teacher/add', formattedData);
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

// Obtener profesores paginados
export async function getPaginatedTeachersAPI(
  page: number = 1,
  limit: number = 10,
  search: string = ''
): Promise<TypeTeacherListResponse> {
  try {
    const { data } = await api.get<TypeTeacherListResponse>('/private/academic/teacher/list', {
      params: { page, limit, search }
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

// Obtener profesor por ID
export async function getTeacherByIdAPI(id: string): Promise<TypeTeacherResponse> {
  try {
    const { data } = await api.get<TypeTeacherResponse>(`/private/academic/teacher/${id}`);
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

// Actualizar profesor
export async function updateTeacherAPI(formData: TypeTeacherUpdate): Promise<TypeTeacherGenericResponse> {
  try {
    // Asegurarnos de que los campos opcionales estén presentes
    const formattedData = {
      ...formData,
      specialization: formData.specialization || '',
      degree: formData.degree || '',
      comments: formData.comments || '',
      class: formData.class || '',
    };
    
    const { data } = await api.post<TypeTeacherGenericResponse>('/private/academic/teacher/update', formattedData);
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

// Eliminar profesor
export async function deleteTeacherAPI(id: string): Promise<TypeTeacherGenericResponse> {
  try {
    const { data } = await api.post<TypeTeacherGenericResponse>('/private/academic/teacher/delete', { id });
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

// Obtener profesores activos (para select)
export async function getActiveTeachersAPI(): Promise<TypeTeacherActiveList> {
  try {
    const { data } = await api.get<TypeTeacherActiveList>('/private/academic/teacher/active/list');
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
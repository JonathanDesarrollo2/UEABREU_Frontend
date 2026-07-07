import { isAxiosError } from "axios";
import api from "../library/axios";
import type { TypeStudentGenericResponse, TypeStudentListResponse } from "../types/student";

// Listar estudiantes paginados
export async function getPaginatedStudentsAPI(
  page: number = 1,
  limit: number = 10,
  search: string = '',
  status?: string
): Promise<TypeStudentListResponse> {
  try {
    const params: any = { page, limit, search };
    if (status && status !== 'all') params.status = status;
    
    const { data } = await api.get<TypeStudentListResponse>('/private/user/students/list', {
      params
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

// Eliminar estudiante
export async function deleteStudentAPI(studentId: string, representativeId: string): Promise<TypeStudentGenericResponse> {
  try {
    const { data } = await api.post<TypeStudentGenericResponse>('/private/user/remove-student', {
      studentId,
      representativeId
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

// Agregar estudiante a representante
export async function addStudentToRepresentativeAPI(
  representativeId: string,
  studentData: any
): Promise<TypeStudentGenericResponse> {
  try {
    const { data } = await api.post<TypeStudentGenericResponse>('/private/user/add-student', {
      representativeId,
      studentData
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
// Actualizar porcentaje de exoneración
export async function updateStudentExonerationAPI(
  studentId: string,
  exonerationPercent: number
): Promise<TypeStudentGenericResponse> {
  try {
    const { data } = await api.put<TypeStudentGenericResponse>(
      `/private/user/students/${studentId}/exoneration`,
      { exonerationPercent }
    );
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

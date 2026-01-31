import { isAxiosError } from "axios";
import api from "../library/axios";
import type {
  TypeSubjectCreate,
  TypeSubjectUpdate,
  TypeSubjectListResponse,
  TypeSubjectResponse,
  TypeSubjectGenericResponse,
  TypeSubject
} from "../types/subject";

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
    const params: any = { 
      page, 
      limit, 
      search 
    };
    
    if (grade && grade !== 'all') params.grade = grade;
    if (subjectType && subjectType !== 'all') params.subjectType = subjectType;
    if (teacherId) params.teacherId = teacherId;
    
    const { data } = await api.get<any>('/private/academic/subject/list', {
      params
    });
    
    // Asegurar que la respuesta tenga el formato correcto
    if (data.result) {
      // Si la API no devuelve paginación, calcularla manualmente
      if (!data.pagination && Array.isArray(data.content)) {
        return {
          result: true,
          content: data.content,
          pagination: {
            totalRecords: data.content.length,
            currentPage: page,
            totalPages: Math.ceil(data.content.length / limit)
          },
          error: []
        };
      }
      
      return data as TypeSubjectListResponse;
    }
    
    // Si no hay resultado exitoso
    return {
      result: false,
      content: [],
      pagination: {
        totalRecords: 0,
        currentPage: page,
        totalPages: 0
      },
      error: data.error || ['Error al obtener materias']
    };
    
  } catch (error) {
    let mensaje = 'Error Desconocido';
    if (isAxiosError(error) && error.response) {
      const errores = error.response.data.error;
      if (errores && errores.length > 0) {
        mensaje = errores.join(', ');
      }
    }
    
    // Retornar estructura vacía pero válida
    return {
      result: false,
      content: [],
      pagination: {
        totalRecords: 0,
        currentPage: page,
        totalPages: 0
      },
      error: [mensaje]
    };
  }
}

// Obtener materia por ID
export async function getSubjectByIdAPI(id: string): Promise<TypeSubjectResponse> {
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

// Obtener objeto de materia por ID (solo el objeto Subject, no toda la respuesta)
export async function getSubjectDataByIdAPI(id: string): Promise<TypeSubject> {
  try {
    const { data } = await api.get<TypeSubjectResponse>(`/private/academic/subject/${id}`);
    
    if (data.result && data.content) {
      return data.content;
    }
    
    throw new Error(data.error?.[0] || 'Materia no encontrada');
    
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
    const { data } = await api.get<any>(`/private/academic/subject/grade/${grade}`);
    
    if (data.result) {
      return {
        result: true,
        content: data.content || [],
        pagination: {
          totalRecords: Array.isArray(data.content) ? data.content.length : 0,
          currentPage: 1,
          totalPages: 1
        },
        error: []
      };
    }
    
    return {
      result: false,
      content: [],
      pagination: {
        totalRecords: 0,
        currentPage: 1,
        totalPages: 0
      },
      error: data.error || ['Error al obtener materias por grado']
    };
    
  } catch (error) {
    let mensaje = 'Error Desconocido';
    if (isAxiosError(error) && error.response) {
      const errores = error.response.data.error;
      if (errores && errores.length > 0) {
        mensaje = errores.join(', ');
      }
    }
    
    return {
      result: false,
      content: [],
      pagination: {
        totalRecords: 0,
        currentPage: 1,
        totalPages: 0
      },
      error: [mensaje]
    };
  }
}

// Obtener materias para select (solo datos básicos)
export async function getSubjectsForSelectAPI(): Promise<Array<{
  id: string;
  name: string;
  code: string;
  teacherId?: string;
}>> {
  try {
    const { data } = await api.get<any>('/private/academic/subject/list', {
      params: { limit: 1000 }
    });
    
    if (data.result && Array.isArray(data.content)) {
      return data.content.map((subject: TypeSubject) => ({
        id: subject.id!,
        name: subject.name!,
        code: subject.code!,
        teacherId: subject.teacherId
      }));
    }
    
    return [];
    
  } catch (error) {
    console.error('Error obteniendo materias para select:', error);
    return [];
  }
}
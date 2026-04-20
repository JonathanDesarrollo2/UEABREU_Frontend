import { isAxiosError } from "axios";
import api from "../library/axios";
import type { BlockTimeConfigResponse, AllBlockTimeConfigsResponse, TypeApiResponseGeneric, BlockTimeConfig } from "../types/blockTimeConfig";

// Obtener configuración de bloques para un grado y sección
export async function getBlockTimesAPI(grade: string, section: string): Promise<BlockTimeConfigResponse> {
  try {
    const { data } = await api.get<{ result: boolean; content: BlockTimeConfigResponse; error: string[] }>(
      '/private/config/block-times',
      { params: { grade, section } }
    );
    if (!data.result) throw new Error(data.error?.[0] || 'Error al obtener configuración');
    return data.content;
  } catch (error) {
    let mensaje = 'Error al obtener configuración de bloques';
    if (isAxiosError(error) && error.response) {
      mensaje = error.response.data.error?.[0] || mensaje;
    }
    throw new Error(mensaje);
  }
}

// Guardar configuración de bloques (reemplaza) 
export async function saveBlockTimesAPI(
  grade: string,
  section: string,
  blocks: BlockTimeConfig[]
): Promise<TypeApiResponseGeneric> {
  try {
    const { data } = await api.post<TypeApiResponseGeneric>('/private/config/block-times', {
      grade,
      section,
      blocks
    });
    return data;
  } catch (error) {
    let mensaje = 'Error al guardar configuración';
    if (isAxiosError(error) && error.response) {
      mensaje = error.response.data.error?.[0] || mensaje;
    }
    throw new Error(mensaje);
  }
}

// Restablecer a valores por defecto
export async function resetBlockTimesAPI(grade: string, section: string): Promise<TypeApiResponseGeneric> {
  try {
    const { data } = await api.post<TypeApiResponseGeneric>('/private/config/block-times/reset', {
      grade,
      section
    });
    return data;
  } catch (error) {
    let mensaje = 'Error al restablecer configuración';
    if (isAxiosError(error) && error.response) {
      mensaje = error.response.data.error?.[0] || mensaje;
    }
    throw new Error(mensaje);
  }
}

// Obtener todas las configuraciones (para administración)
export async function getAllBlockTimeConfigsAPI(): Promise<AllBlockTimeConfigsResponse[]> {
  try {
    const { data } = await api.get<{ result: boolean; content: AllBlockTimeConfigsResponse[]; error: string[] }>(
      '/private/config/block-times/all'
    );
    if (!data.result) throw new Error(data.error?.[0] || 'Error al obtener configuraciones');
    return data.content;
  } catch (error) {
    let mensaje = 'Error al obtener todas las configuraciones';
    if (isAxiosError(error) && error.response) {
      mensaje = error.response.data.error?.[0] || mensaje;
    }
    throw new Error(mensaje);
  }
}
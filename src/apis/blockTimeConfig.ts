import { isAxiosError } from "axios";
import api from "../library/axios";
import type { BlockTimeConfigResponse, AllBlockTimeConfigsResponse, TypeApiResponseGeneric, BlockTimeConfig } from "../types/blockTimeConfig";

export async function getBlockTimesAPI(grade: string, section: string, day: string): Promise<BlockTimeConfigResponse> {
  try {
    const { data } = await api.get<{ result: boolean; content: BlockTimeConfigResponse; error: string[] }>(
      '/private/block/block-times',
      { params: { grade, section, day } }
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

export async function saveBlockTimesAPI(
  grade: string,
  section: string,
  day: string,
  blocks: BlockTimeConfig[]
): Promise<TypeApiResponseGeneric> {
  try {
    const { data } = await api.post<TypeApiResponseGeneric>('/private/block/block-times', {
      grade,
      section,
      day,
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

export async function resetBlockTimesAPI(grade: string, section: string, day: string): Promise<TypeApiResponseGeneric> {
  try {
    const { data } = await api.post<TypeApiResponseGeneric>('/private/block/block-times/reset', {
      grade,
      section,
      day
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

export async function getAllBlockTimeConfigsAPI(): Promise<AllBlockTimeConfigsResponse[]> {
  try {
    const { data } = await api.get<{ result: boolean; content: AllBlockTimeConfigsResponse[]; error: string[] }>(
      '/private/block/block-times/all'
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
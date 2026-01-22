// src/apis/user.ts
import { isAxiosError } from "axios";
import api from "../library/axios";
import type { 
  TypeApiResponsePaginatedUsers, 
  TypeUserBuscar,
  TypeUser_delete,
} from "../types/user";
import type { TypeApiResponseGeneric} from "../types/login";

export async function LoadPaginatedUsers({
  page,
  limit,
  Buscar
}: {
  page: number;
  limit: number;
  Buscar: TypeUserBuscar;
}): Promise<TypeApiResponsePaginatedUsers> {
  try {
    const params = {
      page,
      limit,
      idBus: Buscar.idBus,
      DeBus: Buscar.DeBus,
      nivelFilter: Buscar.nivelFilter || 'all'
    };

    const { data } = await api.get<TypeApiResponsePaginatedUsers>('/private/user/listpag', { params });
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

export async function RemoveUser(formdata: TypeUser_delete): Promise<TypeApiResponseGeneric> {
  try {
    const { data } = await api.post<TypeApiResponseGeneric>('/private/user/removelogin', formdata);
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
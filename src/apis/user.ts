import { isAxiosError } from "axios";
import api from "../library/axios";
import type { 
  TypeApiResponseLoginActive, 
  typeLogin_in, 
  TypeApiResponseToken, 
  TypeApiResponseGeneric, 
  TypeLogin_insert 
} from "../types/login";
import type { TypeUser_delete } from "../types/user";

export async function userActiveAPI(): Promise<TypeApiResponseLoginActive> {
    try {
        const { data } = await api.get<TypeApiResponseLoginActive>('/public/login/onsession');
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

export async function AuthUser(formdata: typeLogin_in): Promise<TypeApiResponseToken> {
    try {
        const { data } = await api.post<TypeApiResponseToken>('/public/login/privateauth', formdata);
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

export async function AddUser(formdata: TypeLogin_insert): Promise<TypeApiResponseGeneric> {
    try {
        const { data } = await api.post<TypeApiResponseGeneric>('/private/user/adduser', formdata);
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
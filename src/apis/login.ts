import { isAxiosError } from "axios";
import api from "../library/axios"; // Ajusta la ruta a tu instancia de axios
import type { TypeApiResponseLoginActive, typeLogin_in, TypeApiResponseToken, TypeApiResponseGeneric, TypeLogin_insert } from "../types/login";

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
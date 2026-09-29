// src/apis/exchangeRate.ts
import { isAxiosError } from "axios";
import api from "../library/axios";

// Prefijo del router de tasas en el backend.
// Si en server.ts el mount es distinto, ajustar SOLO esta constante.
const EXCHANGE_RATE_BASE = "/private/exchange-rate";

// Respuesta estándar del proyecto
export interface ExchangeRateApiResponse<T> {
  result: boolean;
  content: T;
  error: string[];
}

// Tasa registrada para una fecha valor exacta
export interface RateByDateResponse {
  date: string;
  rate: number;
}

// Registro completo de una tasa (fila de la tabla ExchangeRate)
export interface ExchangeRateRecord {
  id: string;
  effectiveDate: string;
  rate: number;
  fetchedAt?: string | null;
  source?: string | null;
}

// API para obtener la tasa BCV registrada en una fecha valor (YYYY-MM-DD)
// (Usada por ManualBalance — NO modificar su endpoint)
export async function getRateByDateAPI(date: string): Promise<ExchangeRateApiResponse<RateByDateResponse>> {
  try {
    const { data } = await api.get<ExchangeRateApiResponse<RateByDateResponse>>(`/private/balance/rate/${date}`);
    return data;
  } catch (error) {
    let mensaje = 'No existe tasa para la fecha indicada';
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

// Lista todas las tasas registradas en un mes (year: YYYY, month: 1-12)
export async function getRatesByMonthAPI(
  year: number,
  month: number
): Promise<ExchangeRateApiResponse<ExchangeRateRecord[]>> {
  try {
    const { data } = await api.get<ExchangeRateApiResponse<ExchangeRateRecord[]>>(
      `${EXCHANGE_RATE_BASE}/month`,
      { params: { year, month } }
    );
    return data;
  } catch (error) {
    let mensaje = 'Error al obtener las tasas del mes';
    if (isAxiosError(error) && error.response) {
      const errores = error.response.data.error;
      if (errores && errores.length > 0) mensaje = errores.join(', ');
    }
    throw new Error(mensaje);
  }
}

// Actualiza el rate de un registro existente (no cambia effectiveDate)
export async function updateRateAPI(
  id: string,
  rate: number
): Promise<ExchangeRateApiResponse<ExchangeRateRecord>> {
  try {
    const { data } = await api.put<ExchangeRateApiResponse<ExchangeRateRecord>>(
      `${EXCHANGE_RATE_BASE}/${id}`,
      { rate }
    );
    return data;
  } catch (error) {
    let mensaje = 'Error al actualizar la tasa';
    if (isAxiosError(error) && error.response) {
      const errores = error.response.data.error;
      if (errores && errores.length > 0) mensaje = errores.join(', ');
    }
    throw new Error(mensaje);
  }
}
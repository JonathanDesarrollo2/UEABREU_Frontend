// src/apis/bank.ts
import { isAxiosError } from "axios";
import api from "../library/axios";

// Tipos para las respuestas del banco
export interface BankWelcomeResponse {
  message: string;
  service: string;
  version: string;
  timestamp?: string;
}

export interface BankHealthResponse {
  service: string;
  status: string;
  timestamp: string;
  environment: string;
}

export interface BankApiResponse<T = any> {
  result: boolean;
  content: T;
  error: string[];
}

// Tipos para autenticación
export interface BankLogOnResponse {
  workingKey: string;
}

// Tipos para validaciones
export interface BankValidationRequest {
  AccountNumber: string;
  BankCode: number;
  PhoneNumber: string;
  ClientID: string;
  Reference: string;
  RequestDate: string;
  Amount: number;
  ChildClientID?: string;
  BranchID?: string;
}

export interface ValidationResponse {
  MovementExists: boolean;
  Date: string;
  ControlNumber: string;
  Amount: number;
  BankCode: string;
  Code: string;
  DebtorInstrument: any;
  Concept: string;
  DebitAccount: string;
  Type: string;
  BalanceDelta: string;
  ReferenceA: string;
  ReferenceB: string;
  ReferenceC: string;
  ReferenceD: string;
  DebtorID?: string;
  DebtorType?: string;
}

// Tipo para la validación en cascada
export interface CascadedValidationResult {
  overallResult: 'success' | 'manual_review' | 'error';
  message: string;
  details: {
    validateP2P: {
      executed: boolean;
      success: boolean;
      movementExists: boolean;
      data?: ValidationResponse;
      error?: string;
    };
    validateReference: {
      executed: boolean;
      success: boolean;
      movementExists: boolean;
      data?: ValidationResponse;
      error?: string;
    };
    validateExistence: {
      executed: boolean;
      success: boolean;
      movementExists: boolean;
      data?: ValidationResponse;
      error?: string;
    };
  };
  timestamp: string;
}

// APIs existentes del banco
export async function getBankWelcomeAPI(): Promise<BankApiResponse<BankWelcomeResponse>> {
  try {
    const { data } = await api.get<BankApiResponse<BankWelcomeResponse>>('/bank/welcome');
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

export async function testBankConnectionAPI(): Promise<BankApiResponse<BankHealthResponse>> {
  try {
    const { data } = await api.get<BankApiResponse<BankHealthResponse>>('/bank/test-connection');
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

export async function getBankHealthAPI(): Promise<BankApiResponse> {
  try {
    const { data } = await api.get<BankApiResponse>('/bank/health');
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

// API para autenticación con el banco (LogOn)
export async function bankLogOnAPI(): Promise<BankApiResponse<BankLogOnResponse>> {
  try {
    const { data } = await api.post<BankApiResponse<BankLogOnResponse>>('/bank/logon');
    return data;
  } catch (error) {
    let mensaje = 'Error en autenticación con el banco';
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

// API para validación en cascada
export async function cascadedValidationAPI(validationData: BankValidationRequest): Promise<BankApiResponse<CascadedValidationResult>> {
  try {
    const { data } = await api.post<BankApiResponse<CascadedValidationResult>>('/bank/cascaded-validation', validationData);
    return data;
  } catch (error) {
    let mensaje = 'Error en validación en cascada';
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

// API para validación P2P simple (mantener por compatibilidad)
export async function validateP2PAPI(validationData: BankValidationRequest): Promise<BankApiResponse<ValidationResponse>> {
  try {
    const { data } = await api.post<BankApiResponse<ValidationResponse>>('/bank/validate-p2p', validationData);
    return data;
  } catch (error) {
    let mensaje = 'Error en validación P2P';
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

// API para obtener estado completo del banco
export async function getBankFullStatusAPI(): Promise<BankApiResponse<{
  welcome: BankWelcomeResponse;
  health: BankHealthResponse;
  auth: { authenticated: boolean; testMode: boolean };
}>> {
  try {
    const { data } = await api.get<BankApiResponse<{
      welcome: BankWelcomeResponse;
      health: BankHealthResponse;
      auth: { authenticated: boolean; testMode: boolean };
    }>>('/bank/full-status');
    return data;
  } catch (error) {
    let mensaje = 'Error obteniendo estado completo del banco';
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

// src/apis/bank.ts - Agregar estos tipos y funciones

// ... código existente ...

// Tipo para tasa BCV
export interface BCVRateResponse {
  PriceRateBCV: number;
  dtRate: string; // Formato: "dd/MM/yyyy"
}

// ... después de las funciones existentes, agregar:

// API para obtener tasa BCV del día
export async function getBCVRateAPI(): Promise<BankApiResponse<BCVRateResponse>> {
  try {
    const { data } = await api.get<BankApiResponse<BCVRateResponse>>('/bank/bcv-rate');
    return data;
  } catch (error) {
    let mensaje = 'Error obteniendo tasa BCV';
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

// Función para formatear moneda
export function formatCurrency(amount: number, currency: 'VES' | 'USD' = 'VES'): string {
  const formatter = new Intl.NumberFormat('es-VE', {
    style: 'currency',
    currency: currency === 'VES' ? 'VES' : 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  return formatter.format(amount);
}
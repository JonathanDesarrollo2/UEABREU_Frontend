import api from '../library/axios';
import type { BankApiResponse } from './bank'; // <-- importa el tipo genérico

// Obtener la fecha simulada actual
export async function getSimulatedDate(): Promise<BankApiResponse<{ simulatedDate: string | null }>> {
  const response = await api.get('/test/simulation/date');
  return response.data;
}

// Establecer una nueva fecha simulada
export async function setSimulatedDate(date: string): Promise<BankApiResponse<{ simulatedDate: string }>> {
  const response = await api.post('/test/simulation/date', { date });
  return response.data;
}

// Restablecer a la fecha real
export async function resetSimulatedDate(): Promise<BankApiResponse<{ simulatedDate: null }>> {
  const response = await api.delete('/test/simulation/date');
  return response.data;
}

// Aplicar mensualidades a todos los estudiantes activos
export async function applyMonthlyFeesAPI(): Promise<BankApiResponse<any>> {
  const response = await api.post('/test/simulation/apply-monthly-fees');
  return response.data;
}
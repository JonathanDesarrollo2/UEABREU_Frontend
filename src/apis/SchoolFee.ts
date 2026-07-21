// src/apis/schoolFee.ts
import api from '../library/axios';
import type { SchoolFee } from '../types/SchoolFee';

/**
 * Obtiene la configuración de tarifas para un año escolar.
 * Si no se especifica, devuelve la del año 2026-2027.
 */
export async function getSchoolFees(schoolYear: string = '2026-2027'): Promise<SchoolFee> {
  const response = await api.get('/private/fees/fees', { params: { schoolYear } });
  if (response.data.result) {
    return response.data.content;
  }
  throw new Error(response.data.error?.[0] || 'Error al obtener tarifas');
}

/**
 * Actualiza las tarifas de un año escolar.
 * @param schoolYear – año escolar (ej: '2026-2027')
 * @param data – objeto con los campos a actualizar
 */
export async function updateSchoolFees(
  schoolYear: string,
  data: Partial<SchoolFee>
): Promise<SchoolFee> {
  const response = await api.put(`/private/fees/fees/${schoolYear}`, data);
  if (response.data.result) {
    return response.data.content;
  }
  throw new Error(response.data.error?.[0] || 'Error al actualizar tarifas');
}
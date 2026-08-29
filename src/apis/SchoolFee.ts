// src/apis/SchoolFee.ts
import api from '../library/axios';
import type { SchoolFee } from '../types/SchoolFee';

export async function getSchoolFees(): Promise<SchoolFee> {
  try {
    const { data } = await api.get('/private/fees/fees', {
      params: { schoolYear: '2026-2027' }
    });
    return data.content;
  } catch (error: any) {
    throw new Error(error.response?.data?.error?.[0] || 'Error al obtener tarifas');
  }
}

export async function updateSchoolFees(
  schoolYear: string,
  payload: Partial<SchoolFee> & { password: string }
): Promise<SchoolFee> {
  try {
    const { data } = await api.put(`/private/fees/fees/${schoolYear}`, payload);
    return data.content;
  } catch (error: any) {
    throw new Error(error.response?.data?.error?.[0] || 'Error al actualizar tarifas');
  }
}

export async function getAuditLogs(): Promise<any[]> {
  try {
    const { data } = await api.get('/private/fees/fees/audit-logs');
    return data.content;
  } catch (error: any) {
    throw new Error(error.response?.data?.error?.[0] || 'Error al obtener historial');
  }
}
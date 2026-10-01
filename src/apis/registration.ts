import api from '../library/axios';

export async function updateApplication(id: string, payload: any) {
  try {
    const { data } = await api.put(`/private/registrations/${id}/update`, payload);
    return data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error?.[0] || 'Error al actualizar solicitud');
  }
}
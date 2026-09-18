import api from '../library/axios';
export const createRepresentativeRegistration = async (studentData: Record<string, unknown>) =>
  (await api.post('/private/registrations/existing-representative', { studentData })).data;

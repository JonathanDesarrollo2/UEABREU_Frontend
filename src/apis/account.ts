import api from '../library/axios';

export const getAccountInfo = async () => (await api.get('/private/user/account')).data;
export const requestPasswordCode = async () => (await api.post('/private/user/account/password-code')).data;
export const resetPassword = async (data: { code: string; newPassword: string; confirmPassword: string }) =>
  (await api.post('/private/user/account/password', data)).data;

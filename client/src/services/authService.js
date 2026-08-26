import api from './api';

const authService = {
  async register(name, email, password) {
    const { data } = await api.post('/auth/register', { name, email, password });
    return data;
  },

  async login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    return data;
  },

  async logout() {
    const { data } = await api.post('/auth/logout');
    return data;
  },

  async getMe() {
    const { data } = await api.get('/auth/me');
    return data;
  },

  async refresh() {
    const { data } = await api.post('/auth/refresh');
    return data;
  },

  async changePassword(currentPassword, newPassword) {
    const { data } = await api.patch('/auth/change-password', { currentPassword, newPassword });
    return data;
  },
};

export default authService;

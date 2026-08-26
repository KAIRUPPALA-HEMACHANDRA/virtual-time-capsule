import api from './api';

/**
 * Capsule Service
 * 
 * All capsule-related API calls.
 * The auth token is automatically attached by the Axios interceptor in api.js
 */

const capsuleService = {
  async createCapsule(capsuleData) {
    const { data } = await api.post('/capsules', capsuleData);
    return data;
  },

  async getMyCapsules() {
    const { data } = await api.get('/capsules');
    return data;
  },

  async getCapsule(id) {
    const { data } = await api.get(`/capsules/${id}`);
    return data;
  },

  async updateCapsule(id, updateData) {
    const { data } = await api.patch(`/capsules/${id}`, updateData);
    return data;
  },

  async deleteCapsule(id) {
    const { data } = await api.delete(`/capsules/${id}`);
    return data;
  },
};

export default capsuleService;

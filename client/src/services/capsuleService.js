import api from './api';

/**
 * Capsule Service — with File Upload Support
 * 
 * When creating a capsule with files, we use FormData instead of JSON.
 * FormData is the web standard for sending files over HTTP.
 * Axios automatically sets the correct Content-Type header (multipart/form-data)
 * when it detects a FormData object.
 */

const capsuleService = {
  async createCapsule(capsuleData, files = []) {
    // Use FormData when there are files to upload
    const formData = new FormData();
    formData.append('title', capsuleData.title);
    formData.append('unlockAt', capsuleData.unlockAt);

    if (capsuleData.content) {
      formData.append('content', capsuleData.content);
    }
    if (capsuleData.isPublic !== undefined) {
      formData.append('isPublic', capsuleData.isPublic);
    }
    if (capsuleData.isGeoLocked) {
      formData.append('isGeoLocked', capsuleData.isGeoLocked);
      formData.append('latitude', capsuleData.latitude);
      formData.append('longitude', capsuleData.longitude);
      formData.append('geoRadius', capsuleData.geoRadius);
    }
    if (capsuleData.prerequisiteId) {
      formData.append('prerequisiteId', capsuleData.prerequisiteId);
    }
    if (capsuleData.isEncrypted) {
      formData.append('isEncrypted', 'true');
    }
    
    // Append each file to the form data
    // The field name 'files' must match what Multer expects on the backend
    for (const file of files) {
      formData.append('files', file);
    }

    const { data } = await api.post('/capsules', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
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

  async deleteAttachment(capsuleId, attachmentId) {
    const { data } = await api.delete(`/capsules/${capsuleId}/attachments/${attachmentId}`);
    return data;
  },
};

export default capsuleService;

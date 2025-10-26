import apiClient from './client';

const apiService = {
  get: (url, params = {}) => apiClient.get(url, { params }).then((res) => res.data),
  post: (url, payload = {}, config = {}) => apiClient.post(url, payload, config).then((res) => res.data),
  put: (url, payload = {}, config = {}) => apiClient.put(url, payload, config).then((res) => res.data),
  patch: (url, payload = {}, config = {}) => apiClient.patch(url, payload, config).then((res) => res.data),
  delete: (url, config = {}) => apiClient.delete(url, config).then((res) => res.data),
};

export default apiService;

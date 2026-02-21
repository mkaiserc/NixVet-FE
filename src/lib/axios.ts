import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // Important for CORS if needed, though JWT is header based
});

api.interceptors.request.use(
  (config) => {
    // Add Authorization header if token exists
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Add Tenant ID header
      // In a real multi-tenant app, this might come from the URL subdomain or a selector
      // For now, let's assume it's stored or we use a default/test one if not present
      const tenantId = localStorage.getItem('tenantId');
      if (tenantId) {
        config.headers['x-tenant-id'] = tenantId;
      } else {
        // Fallback for dev/testing if needed, or don't send and let backend fail
        // config.headers['x-tenant-id'] = 'default-tenant-id'; 
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 (Unauthorized) - Refresh Token logic could go here
    if (error.response?.status === 401 && !originalRequest._retry) {
      // originalRequest._retry = true;
      // Implement refresh token flow...
    }
    
    return Promise.reject(error);
  }
);

export default api;

import axios from 'axios';

const api = axios.create({
  baseURL: '/',  // Vite proxy forwards /api/* → http://localhost:8080
  headers: {
    'Content-Type': 'application/json',
  },
});

// Inject Access Token to outgoing requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercept 401 Unauthorized errors to attempt Refresh Token workflow
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (refreshToken) {
        try {
          const res = await axios.post('/api/auth/refresh-token', {
            refreshToken: refreshToken,
          });
          const { token } = res.data;
          localStorage.setItem('accessToken', token);
          
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed, clear session and log out
          localStorage.clear();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

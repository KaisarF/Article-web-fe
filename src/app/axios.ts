import axios from 'axios';
import Cookies from 'js-cookie';
const api = axios.create({
  baseURL: 'https://test-fe.mysellerpintar.com/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false,
});

api.interceptors.request.use(
  (config) => {

    if (typeof window !== 'undefined') {
      const token = Cookies.get('token');

      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {

    return Promise.reject(error);
  }
);
export default api;
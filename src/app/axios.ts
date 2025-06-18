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
    // Cek apakah kode berjalan di sisi client sebelum mengakses localStorage
    if (typeof window !== 'undefined') {
      // Ambil token dari local storage
      const token = Cookies.get('token'); // Pastikan key-nya 'token', sesuai gambar Anda

      // Jika token ada, tambahkan ke header Authorization
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config; // Kembalikan config yang sudah dimodifikasi
  },
  (error) => {
    // Lakukan sesuatu jika ada error pada request
    return Promise.reject(error);
  }
);
export default api;
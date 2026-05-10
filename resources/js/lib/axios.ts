import { languageCode, localStorageKey } from '@/constants/Index';
import axios from 'axios';

const language =
  typeof localStorage !== "undefined"
    ? localStorage.getItem(localStorageKey.LanguageKey)
    : null

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-Language': language || languageCode.DefaultLanguageCode,
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default axiosInstance;
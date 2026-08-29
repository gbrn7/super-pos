import { languageCode, LanguageSystem, localStorageKey } from '@/constants/Index';
import axios from 'axios';
import constants from 'constants';

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    },
});

axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    const lang = LanguageSystem

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    config.headers['X-Language'] = lang;

    return config;
});

export default axiosInstance;


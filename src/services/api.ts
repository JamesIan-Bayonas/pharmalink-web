import axios, { type AxiosInstance, type InternalAxiosRequestConfig, AxiosError } from 'axios';

// Create the Axios Instance
const api: AxiosInstance = axios.create({
    baseURL: 'https://localhost:7118/api', // Matches your .NET API
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request Interceptor (The "Stamper")
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => Promise.reject(error)
);

// Response Interceptor (The "Guard")
api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
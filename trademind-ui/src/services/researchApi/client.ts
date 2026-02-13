import axios, { type AxiosResponse, type AxiosError } from 'axios';

// Get base URL from environment or default to localhost
const BASE_URL = import.meta.env.VITE_RESEARCH_API_BASE_URL || 'http://localhost:8000';

export const researchApi = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Response interceptor for error handling and data unwrapping
researchApi.interceptors.response.use(
    (response: AxiosResponse) => {
        // If backend wraps data in { data: ... }, unwrap it here
        if (response.data && response.data.data) {
            return response.data;
        }
        return response;
    },
    (error: AxiosError) => {
        // Handle global errors (401, etc.)
        if (error.response) {
            const { status } = error.response;
            if (status === 401) {
                // Handle unauthorized (redirect to login, clear token, etc.)
                console.error('Unauthorized access');
            }
        }
        return Promise.reject(error);
    }
);

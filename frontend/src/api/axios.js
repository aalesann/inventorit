import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    withCredentials: true  // IMPORTANT: Send cookies with requests
});

import { toast } from 'sonner';

// Response interceptor to handle token refresh and errors
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Handle Rate Limiting (429)
        if (error.response?.status === 429) {
            const resetTime = error.response.headers['ratelimit-reset'];
            // RateLimit-Reset is usually a unix timestamp or seconds remaining depending on implementation
            // express-rate-limit standardHeaders: true returns seconds remaining in RateLimit-Reset

            let waitMessage = 'Inténtalo nuevamente más tarde.';

            if (resetTime) {
                // If it's a number (seconds)
                const seconds = parseInt(resetTime);
                if (!isNaN(seconds)) {
                    waitMessage = `Espera ${seconds} segundos antes de intentar nuevamente.`;
                }
            }

            toast.error('Demasiados intentos', {
                description: waitMessage,
                duration: 5000,
            });

            return Promise.reject(error);
        }

        // If error is 401 and we haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Try to refresh the access token (refreshToken is in httpOnly cookie)
                await axios.post('/api/auth/refresh', {}, {
                    withCredentials: true
                });

                // Retry the original request
                return api(originalRequest);
            } catch (refreshError) {
                // Refresh failed, redirect to login
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;

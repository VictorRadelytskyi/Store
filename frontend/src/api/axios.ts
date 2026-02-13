import axios from 'axios';

// Set default base URL for all axios requests
axios.defaults.baseURL = 'http://localhost:5000/api';

// Request interceptor to add Authorization header to all axios requests
axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("accessToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for automatic token refresh on all axios requests
axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Don't try to refresh tokens for auth endpoints
        const noRefreshEndpoints = ['/users/login', '/users/register', '/users/refresh'];
        const isAuthEndpoint = noRefreshEndpoints.some(endpoint => 
            originalRequest.url?.includes(endpoint)
        );

        // if access token expired (401) and we haven't tried refreshing it and it's not an auth endpoint
        if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint){
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem("refreshToken");

            if (!refreshToken) {
                // No refresh token, redirect to login
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                localStorage.removeItem("role");
                localStorage.removeItem("userId");
                window.location.href = '/login';
                return Promise.reject(error);
            }

            try{
                const { data } = await axios.post('http://localhost:5000/api/users/refresh', {
                    token: refreshToken
                });

                localStorage.setItem("accessToken", data.accessToken);
                originalRequest.headers['Authorization'] = `Bearer ${data.token}`;
                return axios(originalRequest);

            }catch(refreshErr){
                // refreshing failed - both tokens expired or tampered
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                localStorage.removeItem("role");
                localStorage.removeItem("userId");
                window.location.href = '/login';
                return Promise.reject(refreshErr);
            }
        }

        // For auth endpoints with 401, handle logout directly
        if (error.response?.status === 401 && isAuthEndpoint) {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("role");
            localStorage.removeItem("userId");
            window.location.href = '/login';
        }

        return Promise.reject(error);
    }
);

export default axios;
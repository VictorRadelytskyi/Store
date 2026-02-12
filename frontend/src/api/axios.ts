import axios from 'axios';

const api = axios.create({baseURL: "http://localhost:5000/api"});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // if access token expired (401) and we haven't tried refreshing it
        if (originalRequest?.response.status === 401 && !originalRequest._retry){
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem("refreshToken");

            try{
                const { data } = await axios.post('http://localhost:5000/api/users/refresh', {
                    token: refreshToken
                });

                localStorage.setItem("accessToken", data.token);
                originalRequest.headers['Authorization'] = `Bearer ${data.token}`;
                return api(originalRequest);

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
        return Promise.reject(error);
    }
);
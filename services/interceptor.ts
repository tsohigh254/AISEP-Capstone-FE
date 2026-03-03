import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  withCredentials: true,
});

// Add a request interceptor: attach Bearer token if available
instance.interceptors.request.use(
  function (config: InternalAxiosRequestConfig) {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  function (error: AxiosError) {
    return Promise.reject(error);
  },
);

// Helper to call refresh-token endpoint using base axios
const callRefreshToken = async (): Promise<IBackendRes<ILoginInfo | null>> => {
  const response = await axios.post(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/refresh-token`,
    {},
    { withCredentials: true },
  );
  return response.data as unknown as IBackendRes<ILoginInfo | null>;
};

// Add a response interceptor with refresh token logic
instance.interceptors.response.use(
  function (response) {
    if (response.data) return response.data;
    return response;
  },
  async function (error: AxiosError) {
    const originalRequest: any = error.config;

    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;

      try {
        const refreshResult = await callRefreshToken();

        if (refreshResult && refreshResult.isSuccess && refreshResult.statusCode === 200 && refreshResult.data) {
          const { accessToken } = refreshResult.data;

          if (typeof window !== "undefined") {
            localStorage.setItem("accessToken", accessToken);
          }

          originalRequest.headers = originalRequest.headers ?? {};
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;

          return instance(originalRequest);
        }
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    // Trả về dạng IBackendRes nếu backend trả về theo cấu trúc đó
    const backendRes = (error.response?.data ?? null) as IBackendRes<unknown> | null;
    if (backendRes && backendRes.isSuccess && backendRes.statusCode === 200) {
      return backendRes;
    }

    return Promise.reject(error);
  },
);

export default instance;
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
    if (response.data) {
      if (typeof response.data.success === "undefined" && typeof response.data.isSuccess === "boolean") {
        response.data.success = response.data.isSuccess;
      }
      return response.data;
    }
    return response;
  },
  async function (error: AxiosError) {
    const originalRequest: any = error.config;

    const isLogoutRequest = originalRequest?.url?.includes("/api/auth/logout");

    if (error.response?.status === 401 && !originalRequest?._retry && !isLogoutRequest) {
      originalRequest._retry = true;

      try {
        const refreshResult = await callRefreshToken();

        if (refreshResult && (refreshResult.success || (refreshResult as any).isSuccess) && refreshResult.data) {
          const { accessToken } = refreshResult.data;

          if (typeof window !== "undefined") {
            localStorage.setItem("accessToken", accessToken);
          }

          originalRequest.headers = originalRequest.headers ?? {};
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;

          return instance(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, don't throw another error, just let the original 401 pass through
        // This avoids messy "Request failed with status code 401" in the console for the refresh-token call itself
        console.warn("Token refresh failed. Redirecting to login or handling session end.");
      }
    }

    // Trả về dạng IBackendRes nếu backend trả về theo cấu trúc đó
    const backendRes = (error.response?.data ?? null) as any;
    if (backendRes && (typeof backendRes.success === "boolean" || typeof backendRes.isSuccess === "boolean")) {
      if (typeof backendRes.success === "undefined" && typeof backendRes.isSuccess === "boolean") {
        backendRes.success = backendRes.isSuccess;
      }
      return backendRes;
    }

    return Promise.reject(error);
  },
);

export default instance;
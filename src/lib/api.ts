import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/auth.store';
import { useUIStore } from '@/stores/ui.store';
import type { ApiResponse, ApiError } from '@/types';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';
const API_TIMEOUT = 30000; // 30 seconds

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token;
    const currentBranch = useAuthStore.getState().currentBranch;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add branch ID to headers if available
    if (currentBranch) {
      config.headers['X-Branch-ID'] = currentBranch.id;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors and token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // Handle 401 Unauthorized - try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });
          
          const { token, refreshToken: newRefreshToken } = response.data.data;
          
          // Update tokens in store
          useAuthStore.setState({
            token,
            refreshToken: newRefreshToken,
          });
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed - logout user
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    // Handle network errors
    if (!error.response) {
      useUIStore.getState().setOnline(false);
      useUIStore.getState().addToast(
        'warning',
        'Network Error',
        'You appear to be offline. Changes will sync when connection is restored.'
      );
    }
    
    // Handle other errors
    const errorMessage = error.response?.data?.error?.message || 'An unexpected error occurred';
    
    if (error.response?.status === 403) {
      useUIStore.getState().addToast(
        'error',
        'Access Denied',
        'You do not have permission to perform this action.'
      );
    } else if (error.response?.status === 404) {
      useUIStore.getState().addToast(
        'error',
        'Not Found',
        'The requested resource was not found.'
      );
    } else if (error.response?.status === 500) {
      useUIStore.getState().addToast(
        'error',
        'Server Error',
        'Something went wrong. Please try again later.'
      );
    }
    
    return Promise.reject(error);
  }
);

// API Helper functions
export const api = {
  // GET request
  get: async <T>(url: string, params?: Record<string, unknown>): Promise<ApiResponse<T>> => {
    const response = await apiClient.get<ApiResponse<T>>(url, { params });
    return response.data;
  },

  // POST request
  post: async <T>(url: string, data?: Record<string, unknown>): Promise<ApiResponse<T>> => {
    const response = await apiClient.post<ApiResponse<T>>(url, data);
    return response.data;
  },

  // PUT request
  put: async <T>(url: string, data?: Record<string, unknown>): Promise<ApiResponse<T>> => {
    const response = await apiClient.put<ApiResponse<T>>(url, data);
    return response.data;
  },

  // PATCH request
  patch: async <T>(url: string, data?: Record<string, unknown>): Promise<ApiResponse<T>> => {
    const response = await apiClient.patch<ApiResponse<T>>(url, data);
    return response.data;
  },

  // DELETE request
  delete: async <T>(url: string): Promise<ApiResponse<T>> => {
    const response = await apiClient.delete<ApiResponse<T>>(url);
    return response.data;
  },

  // Upload file
  upload: async <T>(url: string, formData: FormData): Promise<ApiResponse<T>> => {
    const response = await apiClient.post<ApiResponse<T>>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// Export the axios instance for custom requests
export { apiClient };
export default api;

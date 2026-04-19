class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = localStorage.getItem('access_token');
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Merge with any additional headers from options
    if (options.headers) {
      Object.assign(headers, options.headers);
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const refreshResponse = await fetch(`${this.baseURL}/api/token/refresh/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh: refreshToken }),
          });

          if (refreshResponse.ok) {
            const { access } = await refreshResponse.json();
            localStorage.setItem('access_token', access);
            
            const retryResponse = await fetch(`${this.baseURL}${endpoint}`, {
              ...options,
              headers: {
                ...headers,
                'Authorization': `Bearer ${access}`,
              },
            });
            
            if (retryResponse.ok) {
              return await retryResponse.json();
            }
          }
        } catch (error) {
          console.error('Token refresh failed:', error);
        }
      }
      
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Session expired. Please login again.');
    }

    if (!response.ok) {
      // Try to get the error response body
      let errorData: any = {};
      try {
        errorData = await response.json();
      } catch {
        // If response is not JSON, use status text
        errorData = { message: response.statusText };
      }
      
      // Create an error object that matches axios error structure for consistency
      const error = new Error();
      (error as any).response = {
        status: response.status,
        data: errorData,
      };
      (error as any).message = this.extractErrorMessage(errorData);
      
      throw error;
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }
    
    return {} as T;
  }

  private extractErrorMessage(errorData: any): string {
    if (!errorData) return 'An unknown error occurred';
    
    // Handle DRF non_field_errors
    if (errorData.non_field_errors) {
      return Array.isArray(errorData.non_field_errors) 
        ? errorData.non_field_errors[0] 
        : errorData.non_field_errors;
    }
    
    // Handle field-specific errors
    if (typeof errorData === 'object') {
      // Get the first error message from any field
      for (const [field, value] of Object.entries(errorData)) {
        if (Array.isArray(value) && value.length > 0) {
          return `${field}: ${value[0]}`;
        }
        if (typeof value === 'string') {
          return `${field}: ${value}`;
        }
      }
    }
    
    // Handle detail field (common in DRF)
    if (errorData.detail) {
      return errorData.detail;
    }
    
    // Handle message field
    if (errorData.message) {
      return errorData.message;
    }
    
    // Handle string response
    if (typeof errorData === 'string') {
      return errorData;
    }
    
    return 'An unexpected error occurred';
  }

  get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || '/api';
export const apiClient = new ApiClient(API_BASE_URL);
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

class ApiError extends Error {
  constructor(public status: number, message: string, public data?: unknown) {
    super(message);
    this.name = 'ApiError';
  }
}

function getToken(): string | null {
  if (typeof window !== 'undefined') {
    // Try direct localStorage first
    const directToken = localStorage.getItem('access_token');
    if (directToken) {
      return directToken;
    }
    
    // Fallback: Try zustand persisted state
    try {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        const parsed = JSON.parse(authStorage);
        if (parsed?.state?.token) {
          return parsed.state.token;
        }
      }
    } catch (e) {
      console.error('Failed to parse auth storage:', e);
    }
  }
  return null;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, ...fetchOptions } = options;
  
  let url = `${API_BASE_URL}${endpoint}`;
  
  // Add query parameters
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const token = getToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };
  
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  console.log('[API Request]', fetchOptions.method || 'GET', endpoint, token ? 'Token: ✓' : 'Token: ✗');

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    // === HANDLE 401 UNAUTHORIZED (Session Timeout) ===
    if (response.status === 401) {
      console.error('[API] Session expired - 401 Unauthorized');
      
      // Clear auth state
      if (typeof window !== 'undefined') {
        // Import dynamically to avoid circular dependency
        const { useAuthStore } = await import('@/stores/auth-store');
        useAuthStore.getState().logout();
        
        // Show toast notification
        try {
          const { toast } = await import('sonner');
          toast.error('Session expired. Please log in again.');
        } catch (e) {
          console.error('Failed to show toast:', e);
        }
        
        // Hard redirect to login
        setTimeout(() => {
          window.location.href = '/login';
        }, 500); // Small delay to show toast
      }
      
      // Still throw the error, but the redirect will happen
      throw new ApiError(401, 'Session expired', { detail: 'Unauthorized' });
    }
    
    // Handle other errors
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = { detail: response.statusText };
    }
    console.error('[API Error]', response.status, errorData);
    throw new ApiError(
      response.status,
      errorData.detail || 'An error occurred',
      errorData
    );
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) => 
    request<T>(endpoint, { ...options, method: 'GET' }),
  
  post: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, { 
      ...options, 
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),
  
  put: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, { 
      ...options, 
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),

  patch: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, { 
      ...options, 
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }),
  
  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),
};

export { ApiError };
export default api;

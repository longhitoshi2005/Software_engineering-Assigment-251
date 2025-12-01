import { BASE_API_URL } from "@/config/env";

/**
 * API client with common configuration
 */
export const api = {
  /**
   * Make a GET request
   */
  get: async (endpoint: string, options?: RequestInit) => {
    const response = await fetch(`${BASE_API_URL}${endpoint}`, {
      method: 'GET',
      credentials: 'include', // Include cookies
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      // For authentication endpoints, 401 is expected when not logged in
      if (response.status === 401) {
        throw new Error('UNAUTHORIZED');
      }
      const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
      throw new Error(error.detail || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  /**
   * Make a POST request
   */
  post: async (endpoint: string, data?: any, options?: RequestInit) => {
    const response = await fetch(`${BASE_API_URL}${endpoint}`, {
      method: 'POST',
      credentials: 'include', // Include cookies
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
      throw new Error(error.detail || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  /**
   * Make a PUT request
   */
  put: async (endpoint: string, data?: any, options?: RequestInit) => {
    const response = await fetch(`${BASE_API_URL}${endpoint}`, {
      method: 'PUT',
      credentials: 'include', // Include cookies
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
      throw new Error(error.detail || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  /**
   * Make a DELETE request
   */
  delete: async (endpoint: string, options?: RequestInit) => {
    const response = await fetch(`${BASE_API_URL}${endpoint}`, {
      method: 'DELETE',
      credentials: 'include', // Include cookies
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
      throw new Error(error.detail || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  },
};

export default api;

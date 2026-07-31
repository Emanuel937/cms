import { API_ENDPOINTS } from '../config';
import { User } from '../types/cms';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    ...options,
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`User API Error (${response.status}): ${errorText || response.statusText}`);
  }
  return response.json() as Promise<T>;
}

export const userService = {
  async getAll(): Promise<User[]> {
    return fetchJson<User[]>(API_ENDPOINTS.USERS);
  },

  async create(userData: Omit<User, 'id' | 'created_at'>): Promise<User> {
    return fetchJson<User>(API_ENDPOINTS.USERS, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  async update(id: string, updates: Partial<User>): Promise<User> {
    return fetchJson<User>(`${API_ENDPOINTS.USERS}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async delete(id: string): Promise<{ success: boolean; id: string }> {
    return fetchJson<{ success: boolean; id: string }>(`${API_ENDPOINTS.USERS}/${id}`, {
      method: 'DELETE',
    });
  },
};

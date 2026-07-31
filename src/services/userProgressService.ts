import { API_ENDPOINTS } from '../config';
import { UserProgress } from '../types/cms';

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
    throw new Error(`UserProgress API Error (${response.status}): ${errorText || response.statusText}`);
  }
  return response.json() as Promise<T>;
}

export const userProgressService = {
  async getAll(): Promise<UserProgress[]> {
    return fetchJson<UserProgress[]>(API_ENDPOINTS.USER_PROGRESS);
  },

  async create(progData: Omit<UserProgress, 'id' | 'last_seen'>): Promise<UserProgress> {
    return fetchJson<UserProgress>(API_ENDPOINTS.USER_PROGRESS, {
      method: 'POST',
      body: JSON.stringify(progData),
    });
  },

  async update(id: string, updates: Partial<UserProgress>): Promise<UserProgress> {
    return fetchJson<UserProgress>(`${API_ENDPOINTS.USER_PROGRESS}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async delete(id: string): Promise<{ success: boolean; id: string }> {
    return fetchJson<{ success: boolean; id: string }>(`${API_ENDPOINTS.USER_PROGRESS}/${id}`, {
      method: 'DELETE',
    });
  },
};

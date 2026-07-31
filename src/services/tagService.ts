import { API_ENDPOINTS } from '../config';
import { Tag } from '../types/cms';

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
    throw new Error(`Tag API Error (${response.status}): ${errorText || response.statusText}`);
  }
  return response.json() as Promise<T>;
}

export const tagService = {
  async getAll(): Promise<Tag[]> {
    return fetchJson<Tag[]>(API_ENDPOINTS.TAGS);
  },

  async create(tagData: Omit<Tag, 'id' | 'created_at'>): Promise<Tag> {
    return fetchJson<Tag>(API_ENDPOINTS.TAGS, {
      method: 'POST',
      body: JSON.stringify(tagData),
    });
  },

  async update(id: string, updates: Partial<Tag>): Promise<Tag> {
    return fetchJson<Tag>(`${API_ENDPOINTS.TAGS}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async delete(id: string): Promise<{ success: boolean; id: string }> {
    return fetchJson<{ success: boolean; id: string }>(`${API_ENDPOINTS.TAGS}/${id}`, {
      method: 'DELETE',
    });
  },
};

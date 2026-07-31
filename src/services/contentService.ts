import { API_ENDPOINTS } from '../config';
import { Content } from '../types/cms';

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
    throw new Error(`Content API Error (${response.status}): ${errorText || response.statusText}`);
  }
  return response.json() as Promise<T>;
}

export const contentService = {
  async getAll(): Promise<Content[]> {
    return fetchJson<Content[]>(API_ENDPOINTS.CONTENT);
  },

  async create(contentData: Omit<Content, 'id' | 'created_at'>): Promise<Content> {
    return fetchJson<Content>(API_ENDPOINTS.CONTENT, {
      method: 'POST',
      body: JSON.stringify(contentData),
    });
  },

  async update(id: string, updates: Partial<Content>): Promise<Content> {
    return fetchJson<Content>(`${API_ENDPOINTS.CONTENT}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async delete(id: string): Promise<{ success: boolean; id: string }> {
    return fetchJson<{ success: boolean; id: string }>(`${API_ENDPOINTS.CONTENT}/${id}`, {
      method: 'DELETE',
    });
  },
};

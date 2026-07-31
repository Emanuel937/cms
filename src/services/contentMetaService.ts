import { API_ENDPOINTS } from '../config';
import { ContentMeta } from '../types/cms';

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
    throw new Error(`ContentMeta API Error (${response.status}): ${errorText || response.statusText}`);
  }
  return response.json() as Promise<T>;
}

export const contentMetaService = {
  async getAll(): Promise<ContentMeta[]> {
    return fetchJson<ContentMeta[]>(API_ENDPOINTS.CONTENT_META);
  },

  async create(metaData: Omit<ContentMeta, 'id'>): Promise<ContentMeta> {
    return fetchJson<ContentMeta>(API_ENDPOINTS.CONTENT_META, {
      method: 'POST',
      body: JSON.stringify(metaData),
    });
  },

  async update(id: string, updates: Partial<ContentMeta>): Promise<ContentMeta> {
    return fetchJson<ContentMeta>(`${API_ENDPOINTS.CONTENT_META}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async delete(id: string): Promise<{ success: boolean; id: string }> {
    return fetchJson<{ success: boolean; id: string }>(`${API_ENDPOINTS.CONTENT_META}/${id}`, {
      method: 'DELETE',
    });
  },
};

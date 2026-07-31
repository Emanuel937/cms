import { API_ENDPOINTS } from '../config';
import { ContentTag } from '../types/cms';

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
    throw new Error(`ContentTag API Error (${response.status}): ${errorText || response.statusText}`);
  }
  return response.json() as Promise<T>;
}

export const contentTagService = {
  async getAll(): Promise<ContentTag[]> {
    return fetchJson<ContentTag[]>(API_ENDPOINTS.CONTENT_TAG);
  },

  async create(ctData: Omit<ContentTag, 'id'>): Promise<ContentTag> {
    return fetchJson<ContentTag>(API_ENDPOINTS.CONTENT_TAG, {
      method: 'POST',
      body: JSON.stringify(ctData),
    });
  },

  async delete(id: string): Promise<{ success: boolean; id: string }> {
    return fetchJson<{ success: boolean; id: string }>(`${API_ENDPOINTS.CONTENT_TAG}/${id}`, {
      method: 'DELETE',
    });
  },
};

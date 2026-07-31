import { API_ENDPOINTS } from '../config';
import { MediaAsset } from '../types/cms';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      ...(options?.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Media API Error (${response.status}): ${errorText || response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export const mediaService = {
  async getAll(): Promise<MediaAsset[]> {
    return fetchJson<MediaAsset[]>(API_ENDPOINTS.MEDIA);
  },

  async create(form: FormData): Promise<MediaAsset> {

   

    const response = await fetch(API_ENDPOINTS.MEDIA + "/", {
      method: "POST",
      body: form, 
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Media API Error (${response.status}): ${errorText || response.statusText}`);
    }
    return response.json() as Promise<MediaAsset>;
  },

  async update(id: string, updates: Partial<MediaAsset>): Promise<MediaAsset> {
    return fetchJson<MediaAsset>(`${API_ENDPOINTS.MEDIA}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
  },

  async delete(id: string): Promise<{ success: boolean; id: string }> {
    return fetchJson<{ success: boolean; id: string }>(`${API_ENDPOINTS.MEDIA}/${id}`, {
      method: 'DELETE',
    });
  },
};

import { API_ENDPOINTS } from '../config';

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
    throw new Error(`Admin API Error (${response.status}): ${errorText || response.statusText}`);
  }
  return response.json() as Promise<T>;
}

export const adminService = {
  async resetDatabase(): Promise<{ success: boolean; message: string }> {
    return fetchJson<{ success: boolean; message: string }>(API_ENDPOINTS.DATABASE_RESET, {
      method: 'POST',
    });
  },
};

import { API_ENDPOINTS } from '../config';
import { User, Tag, Content, ContentMeta, ContentTag, UserProgress, MediaAsset } from '../types/cms';

/**
 * Database API Service Layer
 * Performs real HTTP requests (GET, POST, PUT, DELETE) against backend database endpoints
 */

export interface FullDatabaseDump {
  users: User[];
  tags: Tag[];
  content: Content[];
  contentMeta: ContentMeta[];
  contentTag: ContentTag[];
  userProgress: UserProgress[];
  mediaAssets: MediaAsset[];
  exportedAt?: string;
}

// Universal fetch helper with error handling
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
    throw new Error(`Database Request Failed (${response.status}): ${errorText || response.statusText}`);
  }

  return response.json() as Promise<T>;
}


// Universal fetch helper that supports both JSON and FormData (file uploads)
async function fetchSmart<T>(url: string, options: RequestInit = {}): Promise<T> {
  // Detect if the request body is FormData (used for file uploads)
  const isFormData = options.body instanceof FormData;

  const response = await fetch(url, {
    ...options,

    // If body is FormData → DO NOT set Content-Type (browser will set multipart/form-data)
    headers: isFormData
      ? { 'Accept': 'application/json' }
      : {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(options.headers || {}),
        },
  });

  // Handle errors
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Request Failed (${response.status}): ${errorText || response.statusText}`);
  }

  // Return JSON response
  return response.json() as Promise<T>;
}


export const databaseApi = {
  // --- USERS ---
  async getUsers(): Promise<User[]> {
    return fetchJson<User[]>(API_ENDPOINTS.USERS);
  },
  async createUser(userData: Omit<User, 'id' | 'created_at'>): Promise<User> {
    return fetchJson<User>(API_ENDPOINTS.USERS, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },
  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    return fetchJson<User>(`${API_ENDPOINTS.USERS}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
  async deleteUser(id: string): Promise<{ success: boolean; id: string }> {
    return fetchJson<{ success: boolean; id: string }>(`${API_ENDPOINTS.USERS}/${id}`, {
      method: 'DELETE',
    });
  },

  // --- TAGS ---
  async getTags(): Promise<Tag[]> {
    return fetchJson<Tag[]>(API_ENDPOINTS.TAGS);
  },
  async createTag(tagData: Omit<Tag, 'id' | 'created_at'>): Promise<Tag> {
    return fetchJson<Tag>(API_ENDPOINTS.TAGS, {
      method: 'POST',
      body: JSON.stringify(tagData),
    });
  },
  async updateTag(id: string, updates: Partial<Tag>): Promise<Tag> {
    return fetchJson<Tag>(`${API_ENDPOINTS.TAGS}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
  async deleteTag(id: string): Promise<{ success: boolean; id: string }> {
    return fetchJson<{ success: boolean; id: string }>(`${API_ENDPOINTS.TAGS}/${id}`, {
      method: 'DELETE',
    });
  },

  // --- CONTENT ---
  async getContent(): Promise<Content[]> {
    return fetchJson<Content[]>(API_ENDPOINTS.CONTENT);
  },
  async createContent(contentData: Omit<Content, 'id' | 'created_at'>): Promise<Content> {
    return fetchJson<Content>(API_ENDPOINTS.CONTENT, {
      method: 'POST',
      body: JSON.stringify(contentData),
    });
  },
  async updateContent(id: string, updates: Partial<Content>): Promise<Content> {
    return fetchJson<Content>(`${API_ENDPOINTS.CONTENT}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
  async deleteContent(id: string): Promise<{ success: boolean; id: string }> {
    return fetchJson<{ success: boolean; id: string }>(`${API_ENDPOINTS.CONTENT}/${id}`, {
      method: 'DELETE',
    });
  },

  // --- MEDIA ---
   async getMedia(): Promise<MediaAsset[]> {
      // Simple GET request (JSON)
      return fetchSmart<MediaAsset[]>(API_ENDPOINTS.MEDIA);
    },

    async createMedia(form: FormData): Promise<MediaAsset> {
      // POST request with FormData (file + metadata)
      // fetchSmart automatically handles FormData correctly
      return fetchSmart<MediaAsset>(API_ENDPOINTS.MEDIA, {
        method: 'POST',
        body: form,
      });
    },

    async updateMedia(id: string, updates: Partial<MediaAsset>): Promise<MediaAsset> {
      // PUT request with JSON body
      return fetchSmart<MediaAsset>(`${API_ENDPOINTS.MEDIA}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    },

    async deleteMedia(id: string): Promise<{ success: boolean; id: string }> {
      // DELETE request
      return fetchSmart<{ success: boolean; id: string }>(`${API_ENDPOINTS.MEDIA}/${id}`, {
        method: 'DELETE',
      });
    },

  // --- CONTENT META ---
  async getContentMeta(): Promise<ContentMeta[]> {
    return fetchJson<ContentMeta[]>(API_ENDPOINTS.CONTENT_META);
  },
  async createContentMeta(metaData: Omit<ContentMeta, 'id'>): Promise<ContentMeta> {
    return fetchJson<ContentMeta>(API_ENDPOINTS.CONTENT_META, {
      method: 'POST',
      body: JSON.stringify(metaData),
    });
  },
  async updateContentMeta(id: string, updates: Partial<ContentMeta>): Promise<ContentMeta> {
    return fetchJson<ContentMeta>(`${API_ENDPOINTS.CONTENT_META}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
  async deleteContentMeta(id: string): Promise<{ success: boolean; id: string }> {
    return fetchJson<{ success: boolean; id: string }>(`${API_ENDPOINTS.CONTENT_META}/${id}`, {
      method: 'DELETE',
    });
  },

  // --- CONTENT TAG (JUNCTION) ---
  async getContentTag(): Promise<ContentTag[]> {
    return fetchJson<ContentTag[]>(API_ENDPOINTS.CONTENT_TAG);
  },
  async createContentTag(ctData: Omit<ContentTag, 'id'>): Promise<ContentTag> {
    return fetchJson<ContentTag>(API_ENDPOINTS.CONTENT_TAG, {
      method: 'POST',
      body: JSON.stringify(ctData),
    });
  },
  async deleteContentTag(id: string): Promise<{ success: boolean; id: string }> {
    return fetchJson<{ success: boolean; id: string }>(`${API_ENDPOINTS.CONTENT_TAG}/${id}`, {
      method: 'DELETE',
    });
  },

  // --- USER PROGRESS ---
  async getUserProgress(): Promise<UserProgress[]> {
    return fetchJson<UserProgress[]>(API_ENDPOINTS.USER_PROGRESS);
  },
  async createUserProgress(progData: Omit<UserProgress, 'id' | 'last_seen'>): Promise<UserProgress> {
    return fetchJson<UserProgress>(API_ENDPOINTS.USER_PROGRESS, {
      method: 'POST',
      body: JSON.stringify(progData),
    });
  },
  async updateUserProgress(id: string, updates: Partial<UserProgress>): Promise<UserProgress> {
    return fetchJson<UserProgress>(`${API_ENDPOINTS.USER_PROGRESS}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
  async deleteUserProgress(id: string): Promise<{ success: boolean; id: string }> {
    return fetchJson<{ success: boolean; id: string }>(`${API_ENDPOINTS.USER_PROGRESS}/${id}`, {
      method: 'DELETE',
    });
  },

  // --- ADMIN DATABASE UTILITIES ---
  async resetDatabase(): Promise<{ success: boolean; message: string }> {
    return fetchJson<{ success: boolean; message: string }>(API_ENDPOINTS.DATABASE_RESET, {
      method: 'POST',
    });
  },

  async fetchAllTables(): Promise<FullDatabaseDump> {
    const [users, tags, content, mediaAssets, contentMeta, contentTag, userProgress] = await Promise.all([
      this.getUsers(),
      this.getTags(),
      this.getContent(),
      this.getMedia(),
      this.getContentMeta(),
      this.getContentTag(),
      this.getUserProgress(),
    ]);

    return {
      users,
      tags,
      content,
      mediaAssets,
      contentMeta,
      contentTag,
      userProgress,
      exportedAt: new Date().toISOString(),
    };
  }
};

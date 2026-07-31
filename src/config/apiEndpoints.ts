/**
 * Centralized API Endpoints, Database Request Routes & Media Links Configuration
 * All backend API URLs, database request endpoints, and external resource paths
 * are consolidated here so they can be modified in one single place.
 */

// Base Backend API Server URL
export const BASE_API_URL = typeof window !== 'undefined' 
  ? ((import.meta as any).env?.VITE_API_BASE_URL || window.location.origin + '/api/v1')
  : '/api/v1';

// Database Entity API Endpoints (RESTful Routes)
export const API_ENDPOINTS = {
  // Core Database Tables & Resources
  USERS: `${BASE_API_URL}/users`,
  TAGS: `${BASE_API_URL}/tags`,
  CONTENT: `${BASE_API_URL}/content`,
  MEDIA: `${BASE_API_URL}/media`,
  CONTENT_META: `${BASE_API_URL}/content-meta`,
  CONTENT_TAG: `${BASE_API_URL}/content-tag`,
  USER_PROGRESS: `${BASE_API_URL}/user-progress`,

  // Auth & Session Endpoints
  AUTH_LOGIN: `${BASE_API_URL}/auth/login`,
  AUTH_LOGOUT: `${BASE_API_URL}/auth/logout`,
  AUTH_ME: `${BASE_API_URL}/auth/me`,

  // System & Database Administration Routes
  DATABASE_RESET: `${BASE_API_URL}/admin/reset-db`,
  DATABASE_EXPORT: `${BASE_API_URL}/admin/export-json`,
  DATABASE_SCHEMA: `${BASE_API_URL}/admin/schema-visualizer`,
} as const;

// Storage Keys for Local State & Cache Syncing
export const STORAGE_KEYS = {
  USERS: 'cms_admin_users',
  TAGS: 'cms_admin_tags',
  CONTENT: 'cms_admin_content',
  CONTENT_META: 'cms_admin_content_meta',
  CONTENT_TAG: 'cms_admin_content_tag',
  USER_PROGRESS: 'cms_admin_user_progress',
  MEDIA_ASSETS: 'cms_admin_media_assets',
  THEME: 'cms_admin_theme',
  AUTH_USER: 'cms_admin_auth_user',
  AUTH_IS_AUTH: 'cms_admin_is_auth',
} as const;

// Default Media Placeholder Links & External Embed Resources
export const DEFAULT_MEDIA_LINKS = {
  DEFAULT_IMAGE: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&auto=format&fit=crop&q=80',
  DEFAULT_AI_IMAGE: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=1000&auto=format&fit=crop&q=80',
  DEFAULT_DESIGN_IMAGE: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1000&auto=format&fit=crop&q=80',
  DEFAULT_VIDEO_EMBED: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  DEFAULT_AUDIO_TRACK: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
} as const;

/**
 * Helper function to construct full API URLs with optional query parameters
 */
export function buildApiUrl(endpoint: string, queryParams?: Record<string, string | number | boolean>): string {
  const baseUrlStr = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const url = new URL(endpoint.startsWith('http') ? endpoint : baseUrlStr + endpoint);
  if (queryParams) {
    Object.entries(queryParams).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        url.searchParams.append(key, String(val));
      }
    });
  }
  return url.toString();
}

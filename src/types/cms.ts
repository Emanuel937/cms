export type EntityType = 'users' | 'tags' | 'content' | 'contentMeta' | 'contentTag' | 'userProgress' | 'mediaAssets';

export type TagType = 'category' | 'level' | 'topic' | 'kind';

export type ContentType = 'article' | 'course' | 'lesson' | 'quiz' | 'page';

export type MediaType = 'image' | 'video' | 'document' | 'audio';


export interface MediaAsset {
  id: string;
  name: string;
  url: string;
  type: MediaType;
  size: string;
  dimensions?: string;
  created_at: string;
  linkedContentIds: string[];
  linkedTagIds: string[];
  caption?: string;
  altText?: string;
  // FRONTEND ONLY — not stored in DB
  file?: File;
}

export interface User {
  id: string;
  email: string;
  password_hash: string;
  created_at: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  type: TagType;
  created_at: string;
}

export interface Content {
  id: string;
  type: ContentType;
  title: string;
  body: string;
  created_at: string;
}

export interface ContentMeta {
  id: string;
  content_id: string;
  key: string;
  value: string;
}

export interface ContentTag {
  id: string;
  content_id: string;
  tag_id: string;
}

export interface UserProgress {
  id: string;
  user_id: string;
  content_id: string;
  score: number; // 0 - 100
  completed: boolean;
  last_seen: string; // ISO string
}

// Joined View Interfaces for rich display
export interface EnrichedContent extends Content {
  tags: Tag[];
  meta: ContentMeta[];
  progressCount: number;
  completedCount: number;
  averageScore: number;
}

export interface EnrichedUser extends User {
  progressList: (UserProgress & { content_title?: string; content_type?: ContentType })[];
  totalCompleted: number;
  averageScore: number;
}

export interface EnrichedTag extends Tag {
  contentCount: number;
}

export interface EnrichedContentTag extends ContentTag {
  content_title?: string;
  content_type?: ContentType;
  tag_name?: string;
  tag_type?: TagType;
  tag_slug?: string;
}

export interface EnrichedUserProgress extends UserProgress {
  user_email?: string;
  content_title?: string;
  content_type?: ContentType;
}

export type ActiveTab = 
  | 'dashboard' 
  | 'users' 
  | 'tags' 
  | 'content' 
  | 'media_library'
  | 'content_meta' 
  | 'content_tag' 
  | 'user_progress'
  | 'schema'
  | 'design_system';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  description?: string;
}

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, Tag, Content, ContentMeta, ContentTag, UserProgress, MediaAsset,
  ActiveTab, ToastMessage, TagType, ContentType,
  EnrichedContent, EnrichedUser, EnrichedTag, EnrichedContentTag, EnrichedUserProgress
} from '../types/cms';
import { STORAGE_KEYS, API_ENDPOINTS, BASE_API_URL, buildApiUrl } from '../config';
import { databaseApi } from '../services/databaseApi';

export { STORAGE_KEYS, API_ENDPOINTS, BASE_API_URL, buildApiUrl, databaseApi };

interface CMSContextType {
  // Auth State
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password_hash?: string) => boolean;
  logout: () => void;

  // Raw Collections
  users: User[];
  tags: Tag[];
  content: Content[];
  contentMeta: ContentMeta[];
  contentTag: ContentTag[];
  userProgress: UserProgress[];
  mediaAssets: MediaAsset[];

  // Navigation & UI state
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  toggleDarkMode: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // On-demand Entity Loaders (fetches only requested route entity)
  fetchUsers: () => Promise<void>;
  fetchTags: () => Promise<void>;
  fetchContent: () => Promise<void>;
  fetchMedia: () => Promise<void>;
  fetchContentMeta: () => Promise<void>;
  fetchContentTag: () => Promise<void>;
  fetchUserProgress: () => Promise<void>;

  // Toasts
  toasts: ToastMessage[];
  addToast: (type: 'success' | 'error' | 'info', title: string, description?: string) => void;
  removeToast: (id: string) => void;

  // Enriched Getters
  getEnrichedContent: () => EnrichedContent[];
  getEnrichedUsers: () => EnrichedUser[];
  getEnrichedTags: () => EnrichedTag[];
  getEnrichedContentTags: () => EnrichedContentTag[];
  getEnrichedUserProgress: () => EnrichedUserProgress[];

  // User CRUD
  addUser: (user: Omit<User, 'id' | 'created_at'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;

  // Tag CRUD
  addTag: (tag: Omit<Tag, 'id' | 'created_at'>) => void;
  updateTag: (id: string, updates: Partial<Tag>) => void;
  deleteTag: (id: string) => void;

  // Content CRUD
  addContent: (data: Omit<Content, 'id' | 'created_at'>, tagIds?: string[], metaPairs?: { key: string; value: string }[]) => void;
  updateContent: (id: string, updates: Partial<Content>) => void;
  deleteContent: (id: string) => void;

  // Media Asset CRUD & Linking
  addMediaAsset: (media: Omit<MediaAsset, 'id' | 'created_at'>) => void;
  updateMediaAsset: (id: string, updates: Partial<MediaAsset>) => void;
  deleteMediaAsset: (id: string) => void;
  linkMediaToContent: (mediaId: string, contentId: string) => void;
  unlinkMediaFromContent: (mediaId: string, contentId: string) => void;
  linkMediaToTag: (mediaId: string, tagId: string) => void;
  unlinkMediaFromTag: (mediaId: string, tagId: string) => void;

  // ContentMeta CRUD
  addContentMeta: (meta: Omit<ContentMeta, 'id'>) => void;
  updateContentMeta: (id: string, updates: Partial<ContentMeta>) => void;
  deleteContentMeta: (id: string) => void;

  // ContentTag Relations
  assignTagToContent: (content_id: string, tag_id: string) => void;
  removeTagFromContent: (content_id: string, tag_id: string) => void;
  setTagsForContent: (content_id: string, tag_ids: string[]) => void;

  // UserProgress CRUD
  saveUserProgress: (user_id: string, content_id: string, score: number, completed: boolean) => void;
  deleteUserProgress: (id: string) => void;

  // Utilities
  resetToDefaultData: () => void;
  exportDataJSON: () => void;
}

const CMSContext = createContext<CMSContextType | undefined>(undefined);

export const CMSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state
  const [darkMode, setDarkModeState] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    if (saved !== null) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isLoadingDatabase, setIsLoadingDatabase] = useState<boolean>(true);
  const [isApiConnected, setIsApiConnected] = useState<boolean>(false);

  // Entity States initialized with empty array fallback (no initial/mock data)
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    return saved ? JSON.parse(saved) : [];
  });

  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
    if (saved) {
      try { return JSON.parse(saved); } catch { return null; }
    }
    return null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUTH_IS_AUTH);
    return saved !== null ? saved === 'true' : false;
  });

  const login = (email: string, password_hash?: string): boolean => {
    const targetEmail = email.trim().toLowerCase();
    let foundUser = users.find((u) => u.email.toLowerCase() === targetEmail);

    if (!foundUser) {
      // Auto-register user if email is provided
      const newUser: User = {
        id: `usr_${Date.now().toString().slice(-4)}`,
        email: targetEmail,
        password_hash: password_hash || 'demo_hash_123',
        created_at: new Date().toISOString(),
      };
      setUsers((prev) => [newUser, ...prev]);
      foundUser = newUser;
    }

    setCurrentUser(foundUser);
    setIsAuthenticated(true);
    localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(foundUser));
    localStorage.setItem(STORAGE_KEYS.AUTH_IS_AUTH, 'true');
    addToast('success', 'Authentication Successful', `Logged in as ${foundUser.email}`);
    return true;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.setItem(STORAGE_KEYS.AUTH_IS_AUTH, 'false');
    addToast('info', 'Logged Out', 'You have been logged out of the CMS.');
  };

  const [tags, setTags] = useState<Tag[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TAGS);
    return saved ? JSON.parse(saved) : [];
  });

  const [content, setContent] = useState<Content[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CONTENT);
    return saved ? JSON.parse(saved) : [];
  });

  const [contentMeta, setContentMeta] = useState<ContentMeta[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CONTENT_META);
    return saved ? JSON.parse(saved) : [];
  });

  const [contentTag, setContentTag] = useState<ContentTag[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CONTENT_TAG);
    return saved ? JSON.parse(saved) : [];
  });

  const [userProgress, setUserProgress] = useState<UserProgress[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER_PROGRESS);
    return saved ? JSON.parse(saved) : [];
  });

  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MEDIA_ASSETS);
    return saved ? JSON.parse(saved) : [];
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TAGS, JSON.stringify(tags));
  }, [tags]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CONTENT, JSON.stringify(content));
  }, [content]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CONTENT_META, JSON.stringify(contentMeta));
  }, [contentMeta]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CONTENT_TAG, JSON.stringify(contentTag));
  }, [contentTag]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER_PROGRESS, JSON.stringify(userProgress));
  }, [userProgress]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MEDIA_ASSETS, JSON.stringify(mediaAssets));
  }, [mediaAssets]);

  // On-demand Entity Loaders (fetches ONLY the requested entity for the active route/tab)
  const fetchUsers = async () => {
    try {
      const data = await databaseApi.getUsers();
      setUsers(data || []);
      setIsApiConnected(true);
    } catch (err) {
      console.warn('Users API unreachable:', err);
    }
  };

  const fetchTags = async () => {
    try {
      const data = await databaseApi.getTags();
      setTags(data || []);
      setIsApiConnected(true);
    } catch (err) {
      console.warn('Tags API unreachable:', err);
    }
  };

  const fetchContent = async () => {
    try {
      const data = await databaseApi.getContent();
      setContent(data || []);
      setIsApiConnected(true);
    } catch (err) {
      console.warn('Content API unreachable:', err);
    }
  };

  const fetchMedia = async () => {
    try {
      const data = await databaseApi.getMedia();
      setMediaAssets(data || []);
      setIsApiConnected(true);
    } catch (err) {
      console.warn('Media API unreachable:', err);
    }
  };

  const fetchContentMeta = async () => {
    try {
      const data = await databaseApi.getContentMeta();
      setContentMeta(data || []);
      setIsApiConnected(true);
    } catch (err) {
      console.warn('ContentMeta API unreachable:', err);
    }
  };

  const fetchContentTag = async () => {
    try {
      const data = await databaseApi.getContentTag();
      setContentTag(data || []);
      setIsApiConnected(true);
    } catch (err) {
      console.warn('ContentTag API unreachable:', err);
    }
  };

  const fetchUserProgress = async () => {
    try {
      const data = await databaseApi.getUserProgress();
      setUserProgress(data || []);
      setIsApiConnected(true);
    } catch (err) {
      console.warn('UserProgress API unreachable:', err);
    }
  };

  // Handle Dark mode class on root
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_KEYS.THEME, darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const toggleDarkMode = () => setDarkModeState((prev) => !prev);
  const setDarkMode = (dark: boolean) => setDarkModeState(dark);

  // Toast System
  const addToast = (type: 'success' | 'error' | 'info', title: string, description?: string) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    setToasts((prev) => [...prev, { id, type, title, description }]);
    setTimeout(() => removeToast(id), 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Helper Enriched Queries
  const getEnrichedContent = (): EnrichedContent[] => {
    return content.map((item) => {
      // Attached tags
      const linkedTagIds = contentTag
        .filter((ct) => ct.content_id === item.id)
        .map((ct) => ct.tag_id);
      const linkedTags = tags.filter((t) => linkedTagIds.includes(t.id));

      // Attached meta
      const linkedMeta = contentMeta.filter((m) => m.content_id === item.id);

      // Progress stats
      const itemProgress = userProgress.filter((p) => p.content_id === item.id);
      const progressCount = itemProgress.length;
      const completedCount = itemProgress.filter((p) => p.completed).length;
      const totalScore = itemProgress.reduce((sum, p) => sum + p.score, 0);
      const averageScore = progressCount > 0 ? Math.round(totalScore / progressCount) : 0;

      return {
        ...item,
        tags: linkedTags,
        meta: linkedMeta,
        progressCount,
        completedCount,
        averageScore,
      };
    });
  };

  const getEnrichedUsers = (): EnrichedUser[] => {
    return users.map((user) => {
      const userProgs = userProgress
        .filter((p) => p.user_id === user.id)
        .map((p) => {
          const cnt = content.find((c) => c.id === p.content_id);
          return {
            ...p,
            content_title: cnt?.title || 'Unknown Content',
            content_type: cnt?.type || 'article',
          };
        });

      const totalCompleted = userProgs.filter((p) => p.completed).length;
      const totalScore = userProgs.reduce((sum, p) => sum + p.score, 0);
      const averageScore = userProgs.length > 0 ? Math.round(totalScore / userProgs.length) : 0;

      return {
        ...user,
        progressList: userProgs,
        totalCompleted,
        averageScore,
      };
    });
  };

  const getEnrichedTags = (): EnrichedTag[] => {
    return tags.map((tag) => {
      const contentCount = contentTag.filter((ct) => ct.tag_id === tag.id).length;
      return {
        ...tag,
        contentCount,
      };
    });
  };

  const getEnrichedContentTags = (): EnrichedContentTag[] => {
    return contentTag.map((ct) => {
      const cnt = content.find((c) => c.id === ct.content_id);
      const tg = tags.find((t) => t.id === ct.tag_id);
      return {
        ...ct,
        content_title: cnt?.title || 'Unknown Content',
        content_type: cnt?.type,
        tag_name: tg?.name || 'Unknown Tag',
        tag_type: tg?.type,
        tag_slug: tg?.slug,
      };
    });
  };

  const getEnrichedUserProgress = (): EnrichedUserProgress[] => {
    return userProgress.map((p) => {
      const usr = users.find((u) => u.id === p.user_id);
      const cnt = content.find((c) => c.id === p.content_id);
      return {
        ...p,
        user_email: usr?.email || 'Deleted User',
        content_title: cnt?.title || 'Deleted Content',
        content_type: cnt?.type,
      };
    });
  };

  // --- USER CRUD ---
  const addUser = (userData: Omit<User, 'id' | 'created_at'>) => {
    const newUser: User = {
      id: `usr_${Date.now().toString().slice(-4)}`,
      email: userData.email,
      password_hash: userData.password_hash,
      created_at: new Date().toISOString(),
    };
    setUsers((prev) => [newUser, ...prev]);
    databaseApi.createUser(userData).then((created) => {
      setUsers((prev) => prev.map((u) => u.id === newUser.id ? created : u));
    }).catch(console.error);
    addToast('success', 'User Created', `User ${userData.email} saved to database.`);
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...updates } : u))
    );
    databaseApi.updateUser(id, updates).catch(console.error);
    addToast('success', 'User Updated', 'User changes persisted to database.');
  };

  const deleteUser = (id: string) => {
    const target = users.find((u) => u.id === id);
    setUsers((prev) => prev.filter((u) => u.id !== id));
    setUserProgress((prev) => prev.filter((p) => p.user_id !== id));
    databaseApi.deleteUser(id).catch(console.error);
    addToast('info', 'User Deleted', `User ${target?.email || id} removed from database.`);
  };

  // --- TAG CRUD ---
  const addTag = (tagData: Omit<Tag, 'id' | 'created_at'>) => {
    const newTag: Tag = {
      id: `tag_${Date.now().toString().slice(-4)}`,
      name: tagData.name,
      slug: tagData.slug || tagData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      type: tagData.type,
      created_at: new Date().toISOString(),
    };
    setTags((prev) => [newTag, ...prev]);
    databaseApi.createTag(tagData).then((created) => {
      setTags((prev) => prev.map((t) => t.id === newTag.id ? created : t));
    }).catch(console.error);
    addToast('success', 'Tag Created', `Tag "${tagData.name}" added to database.`);
  };

  const updateTag = (id: string, updates: Partial<Tag>) => {
    setTags((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
    databaseApi.updateTag(id, updates).catch(console.error);
    addToast('success', 'Tag Updated', 'Tag changes persisted to database.');
  };

  const deleteTag = (id: string) => {
    const target = tags.find((t) => t.id === id);
    setTags((prev) => prev.filter((t) => t.id !== id));
    setContentTag((prev) => prev.filter((ct) => ct.tag_id !== id));
    databaseApi.deleteTag(id).catch(console.error);
    addToast('info', 'Tag Deleted', `Tag "${target?.name || id}" removed from database.`);
  };

  // --- CONTENT CRUD ---
  const addContent = (
    data: Omit<Content, 'id' | 'created_at'>,
    tagIds: string[] = [],
    metaPairs: { key: string; value: string }[] = []
  ) => {
    const newId = `cnt_${Date.now().toString().slice(-4)}`;
    const newContent: Content = {
      id: newId,
      type: data.type,
      title: data.title,
      body: data.body,
      created_at: new Date().toISOString(),
    };

    setContent((prev) => [newContent, ...prev]);

    databaseApi.createContent(data).then((created) => {
      setContent((prev) => prev.map((c) => c.id === newId ? created : c));
      
      // Persist attached tags to endpoint
      if (tagIds.length > 0) {
        tagIds.forEach((tid) => {
          databaseApi.createContentTag({ content_id: created.id, tag_id: tid }).then((ct) => {
            setContentTag((prev) => [...prev, ct]);
          }).catch(console.error);
        });
      }

      // Persist attached meta to endpoint
      if (metaPairs.length > 0) {
        metaPairs.forEach((pair) => {
          databaseApi.createContentMeta({ content_id: created.id, key: pair.key, value: pair.value }).then((meta) => {
            setContentMeta((prev) => [...prev, meta]);
          }).catch(console.error);
        });
      }
    }).catch(console.error);

    addToast('success', 'Content Created', `"${data.title}" saved to database.`);
  };

  const updateContent = (id: string, updates: Partial<Content>) => {
    setContent((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
    databaseApi.updateContent(id, updates).catch(console.error);
    addToast('success', 'Content Saved', 'Content details updated in database.');
  };

  const deleteContent = (id: string) => {
    const target = content.find((c) => c.id === id);
    setContent((prev) => prev.filter((c) => c.id !== id));
    setContentTag((prev) => prev.filter((ct) => ct.content_id !== id));
    setContentMeta((prev) => prev.filter((cm) => cm.content_id !== id));
    setUserProgress((prev) => prev.filter((up) => up.content_id !== id));
    databaseApi.deleteContent(id).catch(console.error);
    addToast('info', 'Content Deleted', `"${target?.title || id}" removed from database.`);
  };

  // --- CONTENT META CRUD ---
  const addContentMeta = (metaData: Omit<ContentMeta, 'id'>) => {
    const newMeta: ContentMeta = {
      id: `meta_${Date.now().toString().slice(-4)}`,
      content_id: metaData.content_id,
      key: metaData.key,
      value: metaData.value,
    };
    setContentMeta((prev) => [...prev, newMeta]);
    databaseApi.createContentMeta(metaData).then((created) => {
      setContentMeta((prev) => prev.map((m) => m.id === newMeta.id ? created : m));
    }).catch(console.error);
    addToast('success', 'Metadata Added', `Key "${metaData.key}" created in database.`);
  };

  const updateContentMeta = (id: string, updates: Partial<ContentMeta>) => {
    setContentMeta((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );
    databaseApi.updateContentMeta(id, updates).catch(console.error);
    addToast('success', 'Metadata Updated', 'Metadata persisted to database.');
  };

  const deleteContentMeta = (id: string) => {
    setContentMeta((prev) => prev.filter((m) => m.id !== id));
    databaseApi.deleteContentMeta(id).catch(console.error);
    addToast('info', 'Metadata Deleted', 'Metadata entry removed from database.');
  };

  // --- CONTENT TAG RELATIONS ---
  const assignTagToContent = (content_id: string, tag_id: string) => {
    const exists = contentTag.some((ct) => ct.content_id === content_id && ct.tag_id === tag_id);
    if (exists) return;

    const newRelation: ContentTag = {
      id: `ct_${Date.now().toString().slice(-4)}`,
      content_id,
      tag_id,
    };
    setContentTag((prev) => [...prev, newRelation]);
    databaseApi.createContentTag({ content_id, tag_id }).then((created) => {
      setContentTag((prev) => prev.map((ct) => ct.id === newRelation.id ? created : ct));
    }).catch(console.error);
    addToast('success', 'Tag Attached', 'Tag relation created in database.');
  };

  const removeTagFromContent = (content_id: string, tag_id: string) => {
    const target = contentTag.find((ct) => ct.content_id === content_id && ct.tag_id === tag_id);
    setContentTag((prev) => prev.filter((ct) => !(ct.content_id === content_id && ct.tag_id === tag_id)));
    if (target) {
      databaseApi.deleteContentTag(target.id).catch(console.error);
    }
    addToast('info', 'Tag Detached', 'Tag relation removed from database.');
  };

  const setTagsForContent = (content_id: string, tag_ids: string[]) => {
    // Delete existing relations for content
    const existing = contentTag.filter((ct) => ct.content_id === content_id);
    existing.forEach((ct) => databaseApi.deleteContentTag(ct.id).catch(console.error));

    setContentTag((prev) => {
      const filtered = prev.filter((ct) => ct.content_id !== content_id);
      const newlyAdded: ContentTag[] = tag_ids.map((tid, idx) => ({
        id: `ct_${Date.now().toString().slice(-4)}_${idx}`,
        content_id,
        tag_id: tid,
      }));
      return [...filtered, ...newlyAdded];
    });

    tag_ids.forEach((tid) => {
      databaseApi.createContentTag({ content_id, tag_id: tid }).catch(console.error);
    });

    addToast('success', 'Tags Updated', 'Content tag relations updated in database.');
  };

  // --- USER PROGRESS ---
  const saveUserProgress = (user_id: string, content_id: string, score: number, completed: boolean) => {
    const existingIndex = userProgress.findIndex((p) => p.user_id === user_id && p.content_id === content_id);
    const nowISO = new Date().toISOString();

    if (existingIndex >= 0) {
      const existing = userProgress[existingIndex];
      const updatedItem = { ...existing, score, completed, last_seen: nowISO };
      setUserProgress((prev) => {
        const next = [...prev];
        next[existingIndex] = updatedItem;
        return next;
      });
      databaseApi.updateUserProgress(existing.id, { score, completed }).catch(console.error);
    } else {
      const newRecord: UserProgress = {
        id: `prog_${Date.now().toString().slice(-4)}`,
        user_id,
        content_id,
        score,
        completed,
        last_seen: nowISO,
      };
      setUserProgress((prev) => [...prev, newRecord]);
      databaseApi.createUserProgress({ user_id, content_id, score, completed }).then((created) => {
        setUserProgress((prev) => prev.map((p) => p.id === newRecord.id ? created : p));
      }).catch(console.error);
    }
    addToast('success', 'Progress Saved', `Score set to ${score}% in database.`);
  };

  const deleteUserProgress = (id: string) => {
    setUserProgress((prev) => prev.filter((p) => p.id !== id));
    databaseApi.deleteUserProgress(id).catch(console.error);
    addToast('info', 'Progress Cleared', 'User progress log removed from database.');
  };

  // --- MEDIA ASSETS CRUD & LINKING ---
 const addMediaAsset = (form: FormData) => {
  // Récupérer le fichier pour le preview local
  const file = form.get("file") as File | null;

  const tempId = `med_${Date.now().toString().slice(-4)}`;

  const newMedia: MediaAsset = {
    id: tempId,
    name: form.get("name") as string,
    url: file ? URL.createObjectURL(file) : (form.get("url") as string) || "",
    type: form.get("type") as MediaType,
    size: (form.get("size") as string) || "1.0 MB",
    dimensions: (form.get("dimensions") as string) || "Original",
    created_at: new Date().toISOString(),
    linkedContentIds: [],
    linkedTagIds: [],
    caption: (form.get("caption") as string) || "",
    altText: (form.get("altText") as string) || (form.get("name") as string),
  };

  // Ajouter l’asset temporaire dans l’UI
  setMediaAssets((prev) => [newMedia, ...prev]);

  // Appel API : on envoie FormData tel quel
  databaseApi.createMedia(form)
    .then((created) => {
      setMediaAssets((prev) =>
        prev.map((m) => (m.id === newMedia.id ? created : m))
      );
    })
    .catch(console.error);
  
  console.log('data ..........');
  console.log(mediaAssets);

  addToast(
    "success",
    "Media Uploaded",
    `Asset "${newMedia.name}" added to database.`
  );
};


  const updateMediaAsset = (id: string, updates: Partial<MediaAsset>) => {
    setMediaAssets((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );
    databaseApi.updateMedia(id, updates).catch(console.error);
    addToast('success', 'Media Saved', 'Media details updated in database.');
  };

  const deleteMediaAsset = (id: string) => {
    const target = mediaAssets.find((m) => m.id === id);
    setMediaAssets((prev) => prev.filter((m) => m.id !== id));
    databaseApi.deleteMedia(id).catch(console.error);
    addToast('info', 'Media Deleted', `Media "${target?.name || id}" removed from database.`);
  };

  const linkMediaToContent = (mediaId: string, contentId: string) => {
    setMediaAssets((prev) =>
      prev.map((m) => {
        if (m.id === mediaId) {
          const current = m.linkedContentIds || [];
          if (!current.includes(contentId)) {
            return { ...m, linkedContentIds: [...current, contentId] };
          }
        }
        return m;
      })
    );
    addToast('success', 'Linked to Content', 'Media asset attached to content item.');
  };

  const unlinkMediaFromContent = (mediaId: string, contentId: string) => {
    setMediaAssets((prev) =>
      prev.map((m) => {
        if (m.id === mediaId) {
          return {
            ...m,
            linkedContentIds: (m.linkedContentIds || []).filter((cid) => cid !== contentId),
          };
        }
        return m;
      })
    );
    addToast('info', 'Unlinked Content', 'Media asset detached from content.');
  };

  const linkMediaToTag = (mediaId: string, tagId: string) => {
    setMediaAssets((prev) =>
      prev.map((m) => {
        if (m.id === mediaId) {
          const current = m.linkedTagIds || [];
          if (!current.includes(tagId)) {
            return { ...m, linkedTagIds: [...current, tagId] };
          }
        }
        return m;
      })
    );
    addToast('success', 'Linked to Category/Tag', 'Media asset linked to tag.');
  };

  const unlinkMediaFromTag = (mediaId: string, tagId: string) => {
    setMediaAssets((prev) =>
      prev.map((m) => {
        if (m.id === mediaId) {
          return {
            ...m,
            linkedTagIds: (m.linkedTagIds || []).filter((tid) => tid !== tagId),
          };
        }
        return m;
      })
    );
    addToast('info', 'Unlinked Tag', 'Media asset unlinked from tag.');
  };

  // --- UTILITIES ---
  const resetToDefaultData = () => {
    setUsers([]);
    setTags([]);
    setContent([]);
    setContentMeta([]);
    setContentTag([]);
    setUserProgress([]);
    setMediaAssets([]);
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.TAGS);
    localStorage.removeItem(STORAGE_KEYS.CONTENT);
    localStorage.removeItem(STORAGE_KEYS.CONTENT_META);
    localStorage.removeItem(STORAGE_KEYS.CONTENT_TAG);
    localStorage.removeItem(STORAGE_KEYS.USER_PROGRESS);
    localStorage.removeItem(STORAGE_KEYS.MEDIA_ASSETS);
    databaseApi.resetDatabase().catch(console.error);
    addToast('info', 'Database Cleared', 'All tables cleared to empty state.');
  };

  const exportDataJSON = () => {
    const fullDump = {
      users,
      tags,
      content,
      contentMeta,
      contentTag,
      userProgress,
      mediaAssets,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(fullDump, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cms_database_dump_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('success', 'Data Exported', 'Full JSON database export downloaded.');
  };

  return (
    <CMSContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        login,
        logout,
        users,
        tags,
        content,
        contentMeta,
        contentTag,
        userProgress,
        mediaAssets,
        activeTab,
        setActiveTab,
        darkMode,
        setDarkMode,
        toggleDarkMode,
        searchQuery,
        setSearchQuery,
        sidebarCollapsed,
        setSidebarCollapsed,
        fetchUsers,
        fetchTags,
        fetchContent,
        fetchMedia,
        fetchContentMeta,
        fetchContentTag,
        fetchUserProgress,
        toasts,
        addToast,
        removeToast,
        getEnrichedContent,
        getEnrichedUsers,
        getEnrichedTags,
        getEnrichedContentTags,
        getEnrichedUserProgress,
        addUser,
        updateUser,
        deleteUser,
        addTag,
        updateTag,
        deleteTag,
        addContent,
        updateContent,
        deleteContent,
        addMediaAsset,
        updateMediaAsset,
        deleteMediaAsset,
        linkMediaToContent,
        unlinkMediaFromContent,
        linkMediaToTag,
        unlinkMediaFromTag,
        addContentMeta,
        updateContentMeta,
        deleteContentMeta,
        assignTagToContent,
        removeTagFromContent,
        setTagsForContent,
        saveUserProgress,
        deleteUserProgress,
        resetToDefaultData,
        exportDataJSON,
      }}
    >
      {children}
    </CMSContext.Provider>
  );
};

export const useCMS = () => {
  const context = useContext(CMSContext);
  if (!context) {
    throw new Error('useCMS must be used within a CMSProvider');
  }
  return context;
};

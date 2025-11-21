import { ChatMessage, ChatSession, User, AppItem, BookmarkItem, Role } from "../types";

const STORAGE_KEY_USER = 'spark_user';
const STORAGE_KEY_SESSIONS = 'spark_sessions';
const STORAGE_KEY_BOOKMARKS = 'spark_bookmarks_data'; // Changed key to store full objects
const STORAGE_KEY_APPS = 'spark_apps';

// Mock delay helper
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const userService = {
  // --- Authentication ---

  getUser: (): User | null => {
    const stored = localStorage.getItem(STORAGE_KEY_USER);
    return stored ? JSON.parse(stored) : null;
  },

  login: async (provider: 'google' | 'github'): Promise<User> => {
    await delay(1500); // Simulate network request
    
    const mockUser: User = {
      id: `user_${Date.now()}`,
      name: provider === 'google' ? 'Alex Chen' : 'Dev_Spark',
      email: provider === 'google' ? 'alex.chen@gmail.com' : 'dev@github.com',
      avatar: provider === 'google' 
        ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100' 
        : 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=100&h=100',
      provider
    };

    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(mockUser));
    return mockUser;
  },

  logout: async () => {
    await delay(500);
    localStorage.removeItem(STORAGE_KEY_USER);
  },

  // --- History / Sessions ---

  getSessions: (): ChatSession[] => {
    const stored = localStorage.getItem(STORAGE_KEY_SESSIONS);
    if (!stored) return [];
    // Sort by newest first
    return JSON.parse(stored).sort((a: ChatSession, b: ChatSession) => b.updatedAt - a.updatedAt);
  },

  saveSession: (sessionId: string, messages: ChatMessage[]) => {
    if (messages.length === 0) return;

    const sessions = userService.getSessions();
    const existingIndex = sessions.findIndex(s => s.id === sessionId);

    // Determine title based on first user message
    const firstUserMsg = messages.find(m => m.role === 'user');
    const title = firstUserMsg ? (firstUserMsg.text.slice(0, 20) + (firstUserMsg.text.length > 20 ? '...' : '')) : '新对话';
    const previewText = messages[messages.length - 1].text.slice(0, 30);

    const updatedSession: ChatSession = {
      id: sessionId,
      title,
      previewText,
      updatedAt: Date.now(),
      messages
    };

    if (existingIndex >= 0) {
      sessions[existingIndex] = updatedSession;
    } else {
      sessions.push(updatedSession);
    }

    localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
  },

  deleteSession: (sessionId: string) => {
    const sessions = userService.getSessions().filter(s => s.id !== sessionId);
    localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
  },

  createNewSessionId: () => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  generateShareLink: (sessionId: string, baseUrl: string): string => {
    return `${baseUrl}?session_id=${sessionId}`;
  },

  // --- Apps Management ---
  
  getApps: (): AppItem[] => {
      const stored = localStorage.getItem(STORAGE_KEY_APPS);
      return stored ? JSON.parse(stored).sort((a: AppItem, b: AppItem) => b.createdAt - a.createdAt) : [];
  },

  saveApp: (message: ChatMessage, _ignoredTitle: string) => {
      // Extract HTML code block
      const htmlMatch = message.text.match(/```html([\s\S]*?)```/);
      if (!htmlMatch) return;
      
      const code = htmlMatch[1].trim();
      const is3D = code.includes('<!-- 3D_MODEL_VIEWER -->');
      
      const apps = userService.getApps();
      
      // Check if app from this message already exists
      if (apps.some(app => app.id === message.id)) return;

      // Generate Official Title from content (H2) instead of user question
      let appTitle = is3D ? 'Spark 3D 空间视图' : 'Spark 灵动微应用';
      const h2Match = message.text.match(/^##\s+(.+)$/m);
      
      if (h2Match && h2Match[1]) {
          appTitle = h2Match[1].trim().replace(/\*\*/g, ''); // Remove bold markdown if present
      } else {
          // Try to extract title from HTML title tag as fallback
          const htmlTitle = code.match(/<title>(.*?)<\/title>/);
          if (htmlTitle && htmlTitle[1] && htmlTitle[1] !== 'Document') {
              appTitle = htmlTitle[1];
          }
      }

      const newApp: AppItem = {
          id: message.id,
          title: appTitle,
          code: code,
          type: is3D ? '3d' : 'html',
          createdAt: Date.now(),
          previewColor: message.themeColor || '#D68C6E'
      };
      
      apps.unshift(newApp);
      localStorage.setItem(STORAGE_KEY_APPS, JSON.stringify(apps));
  },

  removeApp: (id: string) => {
      const apps = userService.getApps().filter(a => a.id !== id);
      localStorage.setItem(STORAGE_KEY_APPS, JSON.stringify(apps));
  },

  // --- Bookmarks Management ---

  getBookmarks: (): BookmarkItem[] => {
      const stored = localStorage.getItem(STORAGE_KEY_BOOKMARKS);
      return stored ? JSON.parse(stored).sort((a: BookmarkItem, b: BookmarkItem) => b.timestamp - a.timestamp) : [];
  },

  toggleBookmark: (message: ChatMessage, questionText: string): boolean => {
      const bookmarks = userService.getBookmarks();
      const existingIndex = bookmarks.findIndex(b => b.messageId === message.id);
      
      let isBookmarked = false;

      if (existingIndex >= 0) {
          // Remove bookmark
          bookmarks.splice(existingIndex, 1);
          isBookmarked = false;
          
          // Also remove associated app if it exists
          userService.removeApp(message.id);
      } else {
          // Add bookmark
          bookmarks.unshift({
              id: `bm_${Date.now()}`,
              messageId: message.id,
              question: questionText,
              answer: message,
              timestamp: Date.now()
          });
          isBookmarked = true;

          // Check if message has code and save as App
          if (message.text.includes('```html')) {
             userService.saveApp(message, questionText);
          }
      }
      
      localStorage.setItem(STORAGE_KEY_BOOKMARKS, JSON.stringify(bookmarks));
      return isBookmarked;
  }
};
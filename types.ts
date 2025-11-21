export enum Role {
  USER = 'user',
  MODEL = 'model',
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
  maps?: {
    uri: string;
    title: string;
    placeAnswerSources?: {
        reviewSnippets?: {
            content: string;
        }[]
    }
  };
}

export type ImageSize = '1K' | '2K' | '4K';

export interface ChatMessage {
  id: string;
  role: Role;
  text: string;
  image?: string; // Base64 string of uploaded image
  timestamp: number;
  isLoading?: boolean;
  groundingChunks?: GroundingChunk[];
  isCodeApp?: boolean; // Flag to detect if this is a generated "mini-app" code block
  themeColor?: string; // Dynamic theme color based on content topic (e.g., #ff00ff for makeup)
  isBookmarked?: boolean;
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  email: string;
  provider: 'google' | 'github';
}

export interface ChatSession {
  id: string;
  title: string;
  previewText: string;
  updatedAt: number;
  messages: ChatMessage[];
}

export interface AppItem {
  id: string;
  title: string;
  code: string;
  type: 'html' | '3d';
  createdAt: number;
  previewColor: string;
}

export interface BookmarkItem {
  id: string;
  messageId: string;
  question: string;
  answer: ChatMessage;
  timestamp: number;
}

export interface AppState {
  messages: ChatMessage[];
  input: string;
  isLoading: boolean;
  isSidebarOpen: boolean;
  user: User | null;
  currentSessionId: string | null;
}
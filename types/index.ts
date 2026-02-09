export interface Profile {
  username: string;
  token: string;
  createdAt: number;
  lastUpdated: number;
  displayName?: string;
  bio?: string;
  avatar?: string;
  backgroundImage?: string;
  backgroundVideo?: string;
  musicUrl?: string;
  musicTitle?: string;
  musicAutoplay?: boolean;
  welcomeScreen?: {
    enabled: boolean;
    title?: string;
    buttonText?: string;
  };
  colors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    background?: string;
    text?: string;
  };
  fonts?: {
    heading?: string;
    body?: string;
  };
  layout?: 'default' | 'centered' | 'minimal' | 'split';
  effects?: {
    cursorEffect?: 'glow' | 'trail' | 'none';
    backgroundEffect?: 'particles' | 'gradient' | 'static' | 'none';
    typewriterBio?: boolean;
  };
  socialLinks?: SocialLink[];
  badges?: Badge[];
  widgets?: Widget[];
  images?: string[];
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  analytics?: {
    views: number;
    lastViewed?: number;
  };
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon?: string;
  display?: boolean;
}

export interface Badge {
  id: string;
  name: string;
  icon?: string;
  verified?: boolean;
}

export interface Widget {
  id: string;
  type: 'spotify' | 'discord' | 'github' | 'custom';
  data: any;
  enabled: boolean;
}

export interface RateLimit {
  ip: string;
  count: number;
  timestamp: number;
  action: 'claim' | 'check' | 'update';
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ClaimResponse {
  username: string;
  token: string;
  editUrl: string;
  profileUrl: string;
}

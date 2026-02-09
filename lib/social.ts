// Extract YouTube video ID from various URL formats
export function getYouTubeVideoId(url: string): string | null {
  if (!url) return null;
  
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

// Convert YouTube URL to embeddable audio URL
export function getYouTubeEmbedUrl(url: string): string | null {
  const videoId = getYouTubeVideoId(url);
  if (!videoId) return null;
  
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1`;
}

// Platform data with react-icons component names
const PLATFORMS: Record<string, { name: string; iconName: string; color: string }> = {
  youtube: { name: 'YouTube', iconName: 'SiYoutube', color: '#FF0000' },
  tiktok: { name: 'TikTok', iconName: 'SiTiktok', color: '#000000' },
  twitch: { name: 'Twitch', iconName: 'SiTwitch', color: '#9146FF' },
  roblox: { name: 'Roblox', iconName: 'SiRoblox', color: '#000000' },
  instagram: { name: 'Instagram', iconName: 'SiInstagram', color: '#E4405F' },
  twitter: { name: 'X', iconName: 'SiX', color: '#000000' },
  discord: { name: 'Discord', iconName: 'SiDiscord', color: '#5865F2' },
  github: { name: 'GitHub', iconName: 'SiGithub', color: '#181717' },
  spotify: { name: 'Spotify', iconName: 'SiSpotify', color: '#1DB954' },
  snapchat: { name: 'Snapchat', iconName: 'SiSnapchat', color: '#FFFC00' },
  reddit: { name: 'Reddit', iconName: 'SiReddit', color: '#FF4500' },
  linkedin: { name: 'LinkedIn', iconName: 'SiLinkedin', color: '#0A66C2' },
  facebook: { name: 'Facebook', iconName: 'SiFacebook', color: '#1877F2' },
  steam: { name: 'Steam', iconName: 'SiSteam', color: '#000000' },
  soundcloud: { name: 'SoundCloud', iconName: 'SiSoundcloud', color: '#FF7700' },
  telegram: { name: 'Telegram', iconName: 'SiTelegram', color: '#0088cc' },
  whatsapp: { name: 'WhatsApp', iconName: 'SiWhatsapp', color: '#25D366' },
  pinterest: { name: 'Pinterest', iconName: 'SiPinterest', color: '#E60023' },
  patreon: { name: 'Patreon', iconName: 'SiPatreon', color: '#FF424D' },
  paypal: { name: 'PayPal', iconName: 'SiPaypal', color: '#003087' },
  amazon: { name: 'Amazon', iconName: 'SiAmazon', color: '#FF9900' },
  apple: { name: 'Apple', iconName: 'SiApple', color: '#000000' },
  google: { name: 'Google', iconName: 'SiGoogle', color: '#4285F4' },
  behance: { name: 'Behance', iconName: 'SiBehance', color: '#0A66C2' },
  dribbble: { name: 'Dribbble', iconName: 'SiDribbble', color: '#EA4C89' },
  medium: { name: 'Medium', iconName: 'SiMedium', color: '#000000' },
  substack: { name: 'Substack', iconName: 'SiSubstack', color: '#FF6719' },
  bluesky: { name: 'Bluesky', iconName: 'SiBluesky', color: '#1285FE' },
  mastodon: { name: 'Mastodon', iconName: 'SiMastodon', color: '#6364FF' },
  threads: { name: 'Threads', iconName: 'SiThreads', color: '#000000' },
  kick: { name: 'Kick', iconName: 'SiKick', color: '#53FC18' },
};

// Detect social media platform from URL
export function detectSocialPlatform(url: string): {
  platform: string;
  iconName: string;
  color: string;
} | null {
  if (!url) return null;
  
  const urlLower = url.toLowerCase();
  
  // Check each platform
  for (const [key, data] of Object.entries(PLATFORMS)) {
    const pattern = getPlatformPattern(key);
    if (pattern && pattern.test(urlLower)) {
      return {
        platform: data.name,
        iconName: data.iconName,
        color: data.color,
      };
    }
  }
  
  // Default
  return { platform: 'Link', iconName: 'SiLink', color: '#666666' };
}

// Get pattern for each platform
function getPlatformPattern(platform: string): RegExp | null {
  const patterns: Record<string, RegExp> = {
    youtube: /(?:youtube\.com|youtu\.be)/i,
    tiktok: /tiktok\.com/i,
    twitch: /twitch\.tv/i,
    roblox: /roblox\.com/i,
    instagram: /(?:instagram\.com|instagr\.am)/i,
    twitter: /(?:twitter\.com|x\.com)/i,
    discord: /(?:discord\.gg|discord\.com)/i,
    github: /github\.com/i,
    spotify: /spotify\.com/i,
    snapchat: /snapchat\.com/i,
    reddit: /reddit\.com/i,
    linkedin: /linkedin\.com/i,
    facebook: /(?:facebook\.com|fb\.com)/i,
    steam: /(?:steampowered\.com|steamcommunity\.com)/i,
    soundcloud: /soundcloud\.com/i,
    telegram: /(?:t\.me|telegram\.org)/i,
    whatsapp: /(?:whatsapp\.com|wa\.me)/i,
    pinterest: /pinterest\.com/i,
    patreon: /patreon\.com/i,
    paypal: /paypal\.com/i,
    amazon: /amazon\.com/i,
    apple: /apple\.com/i,
    google: /google\.com/i,
    behance: /behance\.net/i,
    dribbble: /dribbble\.com/i,
    medium: /medium\.com/i,
    substack: /substack\.com/i,
    bluesky: /bsky\.app/i,
    mastodon: /mastodon/i,
    threads: /threads\.net/i,
    kick: /kick\.com/i,
  };
  
  return patterns[platform] || null;
}

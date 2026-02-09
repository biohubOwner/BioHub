import { customAlphabet } from 'nanoid';

// Generate a secure random token
const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 64);

export function generateToken(): string {
  return nanoid();
}

// Normalize username
export function normalizeUsername(username: string): string {
  return username.toLowerCase().trim();
}

// Validate username
export function isValidUsername(username: string): { valid: boolean; error?: string } {
  if (!username || username.length === 0) {
    return { valid: false, error: 'Username is required' };
  }
  
  if (username.length < 3) {
    return { valid: false, error: 'Username must be at least 3 characters' };
  }
  
  if (username.length > 20) {
    return { valid: false, error: 'Username must be 20 characters or less' };
  }
  
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return { valid: false, error: 'Username can only contain letters, numbers, underscores, and hyphens' };
  }
  
  // Reserved usernames
  const reserved = ['admin', 'api', 'edit', 'explore', 'claim', 'about', 'contact', 'terms', 'privacy', 'help'];
  if (reserved.includes(username.toLowerCase())) {
    return { valid: false, error: 'This username is reserved' };
  }
  
  return { valid: true };
}

// Get client IP
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const real = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (real) {
    return real;
  }
  
  return 'unknown';
}

// Create token backup file content
export function createTokenBackup(username: string, token: string, domain: string = 'localhost:3000') {
  const data = {
    username,
    token,
    editUrl: `http://${domain}/edit/${username}?token=${token}`,
    profileUrl: `http://${domain}/${username}`,
    claimedAt: new Date().toISOString(),
    warning: 'Keep this file safe! You cannot recover your profile without this token.',
  };
  
  return JSON.stringify(data, null, 2);
}

// Check if profile is nearing deletion
export function getDaysUntilDeletion(lastUpdated: number, createdAt: number): number | null {
  const now = Date.now();
  const daysSinceUpdate = (now - lastUpdated) / (1000 * 60 * 60 * 24);
  const daysSinceCreation = (now - createdAt) / (1000 * 60 * 60 * 24);
  
  // Never edited
  if (createdAt === lastUpdated && daysSinceCreation < 7) {
    return Math.ceil(7 - daysSinceCreation);
  }
  
  // Inactive
  if (daysSinceUpdate < 180) {
    return Math.ceil(180 - daysSinceUpdate);
  }
  
  return null;
}

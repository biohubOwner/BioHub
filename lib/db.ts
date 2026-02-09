import { kv } from '@vercel/kv';
import { Profile, RateLimit } from '@/types';

const PROFILE_PREFIX = 'profile:';
const RATE_LIMIT_PREFIX = 'ratelimit:';
const USERNAME_INDEX = 'usernames';

// Profile operations
export async function getProfile(username: string): Promise<Profile | null> {
  try {
    const profile = await kv.get<Profile>(`${PROFILE_PREFIX}${username.toLowerCase()}`);
    return profile;
  } catch (error) {
    console.error('Error getting profile:', error);
    return null;
  }
}

export async function setProfile(profile: Profile): Promise<boolean> {
  try {
    const username = profile.username.toLowerCase();
    await kv.set(`${PROFILE_PREFIX}${username}`, profile);
    await kv.sadd(USERNAME_INDEX, username);
    return true;
  } catch (error) {
    console.error('Error setting profile:', error);
    return false;
  }
}

export async function deleteProfile(username: string): Promise<boolean> {
  try {
    const lowerUsername = username.toLowerCase();
    await kv.del(`${PROFILE_PREFIX}${lowerUsername}`);
    await kv.srem(USERNAME_INDEX, lowerUsername);
    return true;
  } catch (error) {
    console.error('Error deleting profile:', error);
    return false;
  }
}

export async function usernameExists(username: string): Promise<boolean> {
  try {
    const profile = await getProfile(username);
    return profile !== null;
  } catch (error) {
    console.error('Error checking username:', error);
    return false;
  }
}

export async function getAllUsernames(): Promise<string[]> {
  try {
    const usernames = await kv.smembers(USERNAME_INDEX);
    return usernames as string[];
  } catch (error) {
    console.error('Error getting all usernames:', error);
    return [];
  }
}

// Rate limiting
export async function checkRateLimit(
  ip: string,
  action: 'claim' | 'check' | 'update',
  limit: number,
  windowMs: number
): Promise<boolean> {
  try {
    const key = `${RATE_LIMIT_PREFIX}${ip}:${action}`;
    const now = Date.now();
    
    const rateLimit = await kv.get<RateLimit>(key);
    
    if (!rateLimit) {
      await kv.set(key, {
        ip,
        count: 1,
        timestamp: now,
        action,
      }, { ex: Math.ceil(windowMs / 1000) });
      return true;
    }
    
    if (now - rateLimit.timestamp > windowMs) {
      await kv.set(key, {
        ip,
        count: 1,
        timestamp: now,
        action,
      }, { ex: Math.ceil(windowMs / 1000) });
      return true;
    }
    
    if (rateLimit.count >= limit) {
      return false;
    }
    
    await kv.set(key, {
      ...rateLimit,
      count: rateLimit.count + 1,
    }, { ex: Math.ceil(windowMs / 1000) });
    
    return true;
  } catch (error) {
    console.error('Error checking rate limit:', error);
    return true; // Allow on error
  }
}

// Cleanup inactive profiles
export async function cleanupInactiveProfiles(
  neverEditedDays: number = 7,
  inactiveDays: number = 180
): Promise<number> {
  try {
    const usernames = await getAllUsernames();
    const now = Date.now();
    let deleted = 0;
    
    for (const username of usernames) {
      const profile = await getProfile(username);
      if (!profile) continue;
      
      const daysSinceCreation = (now - profile.createdAt) / (1000 * 60 * 60 * 24);
      const daysSinceUpdate = (now - profile.lastUpdated) / (1000 * 60 * 60 * 24);
      
      // Never edited after creation
      if (profile.createdAt === profile.lastUpdated && daysSinceCreation > neverEditedDays) {
        await deleteProfile(username);
        deleted++;
        continue;
      }
      
      // Inactive for too long
      if (daysSinceUpdate > inactiveDays) {
        await deleteProfile(username);
        deleted++;
      }
    }
    
    return deleted;
  } catch (error) {
    console.error('Error cleaning up profiles:', error);
    return 0;
  }
}

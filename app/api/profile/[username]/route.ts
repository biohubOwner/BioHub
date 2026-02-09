import { NextRequest, NextResponse } from 'next/server';
import { getProfile, setProfile } from '@/lib/db';
import { normalizeUsername, getClientIp } from '@/lib/utils';
import { checkRateLimit } from '@/lib/db';
import { ApiResponse, Profile } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params;
    
    if (!username) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Username is required',
      }, { status: 400 });
    }
    
    const normalizedUsername = normalizeUsername(username);
    const profile = await getProfile(normalizedUsername);
    
    if (!profile) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Profile not found',
      }, { status: 404 });
    }
    
    // Update analytics
    const updatedProfile = {
      ...profile,
      analytics: {
        views: (profile.analytics?.views || 0) + 1,
        lastViewed: Date.now(),
      },
    };
    
    await setProfile(updatedProfile);
    
    // Remove sensitive data
    const { token, ...publicProfile } = updatedProfile;
    
    return NextResponse.json<ApiResponse>({
      success: true,
      data: publicProfile,
    });
    
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error',
    }, { status: 500 });
  }
}

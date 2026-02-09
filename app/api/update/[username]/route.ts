import { NextRequest, NextResponse } from 'next/server';
import { getProfile, setProfile } from '@/lib/db';
import { normalizeUsername, getClientIp } from '@/lib/utils';
import { checkRateLimit } from '@/lib/db';
import { ApiResponse, Profile } from '@/types';

export async function POST(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params;
    const body = await request.json();
    const { token, ...updates } = body;
    
    if (!username || !token) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Username and token are required',
      }, { status: 400 });
    }
    
    // Rate limiting
    const ip = getClientIp(request);
    const allowed = await checkRateLimit(ip, 'update', 30, 60 * 1000); // 30 updates per minute
    
    if (!allowed) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Too many requests',
      }, { status: 429 });
    }
    
    const normalizedUsername = normalizeUsername(username);
    const profile = await getProfile(normalizedUsername);
    
    if (!profile) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Profile not found',
      }, { status: 404 });
    }
    
    // Verify token
    if (profile.token !== token) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Invalid token',
      }, { status: 403 });
    }
    
    // Update profile - merge all data carefully
    const updatedProfile: Profile = {
      username: normalizedUsername,
      token: profile.token,
      createdAt: profile.createdAt,
      lastUpdated: Date.now(),
      // Preserve existing fields and apply updates
      displayName: updates.displayName !== undefined ? updates.displayName : profile.displayName,
      bio: updates.bio !== undefined ? updates.bio : profile.bio,
      avatar: updates.avatar !== undefined ? updates.avatar : profile.avatar,
      backgroundImage: updates.backgroundImage !== undefined ? updates.backgroundImage : profile.backgroundImage,
      backgroundVideo: updates.backgroundVideo !== undefined ? updates.backgroundVideo : profile.backgroundVideo,
      musicUrl: updates.musicUrl !== undefined ? updates.musicUrl : profile.musicUrl,
      musicTitle: updates.musicTitle !== undefined ? updates.musicTitle : profile.musicTitle,
      musicAutoplay: updates.musicAutoplay !== undefined ? updates.musicAutoplay : profile.musicAutoplay,
      welcomeScreen: updates.welcomeScreen !== undefined ? updates.welcomeScreen : profile.welcomeScreen,
      colors: updates.colors !== undefined ? updates.colors : profile.colors,
      fonts: updates.fonts !== undefined ? updates.fonts : profile.fonts,
      layout: updates.layout !== undefined ? updates.layout : profile.layout,
      effects: updates.effects !== undefined ? updates.effects : profile.effects,
      socialLinks: updates.socialLinks !== undefined ? updates.socialLinks : profile.socialLinks,
      badges: updates.badges !== undefined ? updates.badges : profile.badges,
      widgets: updates.widgets !== undefined ? updates.widgets : profile.widgets,
      images: updates.images !== undefined ? updates.images : profile.images,
      seo: updates.seo !== undefined ? updates.seo : profile.seo,
      analytics: {
        ...profile.analytics,
        views: profile.analytics?.views || 0,
        lastViewed: profile.analytics?.lastViewed,
      },
    };
    
    const success = await setProfile(updatedProfile);
    
    if (!success) {
      console.error('Failed to save profile to database:', updatedProfile);
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Failed to update profile',
      }, { status: 500 });
    }
    
    console.log('Profile saved successfully:', { username: normalizedUsername, fields: Object.keys(updatedProfile) });
    
    // Return profile data without sensitive fields
    const safeProfile = { ...updatedProfile };
    delete (safeProfile as any).token;
    
    return NextResponse.json<ApiResponse>({
      success: true,
      data: safeProfile,
      message: 'Profile updated successfully',
    });
    
  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error',
    }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params;
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');
    
    if (!username || !token) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Username and token are required',
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
    
    // Verify token
    if (profile.token !== token) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Invalid token',
      }, { status: 403 });
    }
    
    // Return complete profile for editing (excluding sensitive token)
    const { token: _, ...profileForEditing } = profile as any;
    
    console.log('Profile loaded for editing:', { username: normalizedUsername, fields: Object.keys(profileForEditing) });
    
    return NextResponse.json<ApiResponse>({
      success: true,
      data: profileForEditing,
    });
    
  } catch (error) {
    console.error('Fetch error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error',
    }, { status: 500 });
  }
}

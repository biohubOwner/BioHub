import { NextRequest, NextResponse } from 'next/server';
import { getProfile, setProfile } from '@/lib/db';
import { generateToken, normalizeUsername, isValidUsername, getClientIp, createTokenBackup } from '@/lib/utils';
import { checkRateLimit } from '@/lib/db';
import { Profile, ApiResponse, ClaimResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json();
    
    if (!username) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Username is required',
      }, { status: 400 });
    }
    
    // Validate username
    const validation = isValidUsername(username);
    if (!validation.valid) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: validation.error,
      }, { status: 400 });
    }
    
    // Rate limiting
    const ip = getClientIp(request);
    const allowed = await checkRateLimit(ip, 'claim', 3, 60 * 60 * 1000); // 3 claims per hour
    
    if (!allowed) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Rate limit exceeded. Please try again later.',
      }, { status: 429 });
    }
    
    const normalizedUsername = normalizeUsername(username);
    
    // Check if username exists
    const existing = await getProfile(normalizedUsername);
    if (existing) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Username is already taken',
      }, { status: 409 });
    }
    
    // Generate token
    const token = generateToken();
    const now = Date.now();
    
    // Create profile
    const profile: Profile = {
      username: normalizedUsername,
      token,
      createdAt: now,
      lastUpdated: now,
      analytics: {
        views: 0,
      },
    };
    
    const success = await setProfile(profile);
    
    if (!success) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Failed to create profile',
      }, { status: 500 });
    }
    
    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    
    return NextResponse.json<ApiResponse<ClaimResponse>>({
      success: true,
      data: {
        username: normalizedUsername,
        token,
        editUrl: `${protocol}://${host}/edit/${normalizedUsername}?token=${token}`,
        profileUrl: `${protocol}://${host}/${normalizedUsername}`,
      },
      message: 'Username claimed successfully',
    });
    
  } catch (error) {
    console.error('Claim error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error',
    }, { status: 500 });
  }
}

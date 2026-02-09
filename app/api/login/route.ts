import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { getProfile } from '@/lib/db';
import { ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token || typeof token !== 'string') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Token is required' },
        { status: 400 }
      );
    }

    console.log('Login attempt with token:', token.substring(0, 10) + '...');

    // Search through all profiles for a matching token
    try {
      const keys = await kv.keys('profile:*');
      console.log('Found', keys.length, 'profiles to search');
      
      for (const key of keys) {
        const username = key.replace('profile:', '');
        const profile = await getProfile(username);
        if (profile && profile.token === token) {
          console.log('Token matched to profile:', profile.username);
          return NextResponse.json<ApiResponse>({
            success: true,
            data: { username: profile.username },
          });
        }
      }
    } catch (keyError) {
      console.error('Error searching profiles by token:', keyError);
    }

    console.log('No profile found with this token');
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Invalid token' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

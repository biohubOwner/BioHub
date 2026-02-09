import { NextRequest, NextResponse } from 'next/server';
import { usernameExists } from '@/lib/db';
import { normalizeUsername, isValidUsername, getClientIp } from '@/lib/utils';
import { checkRateLimit } from '@/lib/db';
import { ApiResponse } from '@/types';

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
    
    // Rate limiting
    const ip = getClientIp(request);
    const allowed = await checkRateLimit(ip, 'check', 30, 60 * 1000); // 30 checks per minute
    
    if (!allowed) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Too many requests',
      }, { status: 429 });
    }
    
    // Validate username format
    const validation = isValidUsername(username);
    if (!validation.valid) {
      return NextResponse.json<ApiResponse>({
        success: true,
        data: { available: false },
      });
    }
    
    const normalizedUsername = normalizeUsername(username);
    const exists = await usernameExists(normalizedUsername);
    
    return NextResponse.json<ApiResponse>({
      success: true,
      data: { available: !exists },
    });
    
  } catch (error) {
    console.error('Check error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error',
    }, { status: 500 });
  }
}

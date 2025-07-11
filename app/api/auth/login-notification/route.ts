import { NextRequest, NextResponse } from 'next/server';
import { sendLoginNotification } from '@/lib/n8n-webhook';

/**
 * API route to handle login notifications.
 * This route is called by the auth context when a user logs in.
 * It sends a notification to the N8N webhook with user details.
 */
export async function POST(request: NextRequest) {
  try {
    const { userEmail, userName, userAgent } = await request.json();
    console.log('data:', { userEmail, userName, userAgent });

    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email is required' },
        { status: 400 }
      );
    }

    // Get client IP from headers
    const forwarded = request.headers.get('x-forwarded-for');
    const ipAddress = forwarded ? forwarded.split(',')[0] : 'unknown';

    const success = await sendLoginNotification({
      userEmail,
      userName,
      loginTime: new Date().toISOString(),
      userAgent,
      ipAddress,
    });

    if (success) {
      console.log('x aca hno')
      return NextResponse.json({ message: 'Login notification sent successfully' });
    } else {
      return NextResponse.json(
        { error: 'Failed to send login notification' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in login notification API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

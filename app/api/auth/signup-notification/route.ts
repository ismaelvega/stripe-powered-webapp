import { NextRequest, NextResponse } from 'next/server';
import { sendSignupNotification } from '@/lib/n8n-webhook';

export async function POST(request: NextRequest) {
  try {
    const { userEmail, userName, signupTime, userAgent, ipAddress } = await request.json();

    if (!userEmail || !signupTime) {
      return NextResponse.json(
        { error: 'User email and signup time are required' },
        { status: 400 }
      );
    }

    console.log('Processing signup notification for:', userEmail);

    const success = await sendSignupNotification({
      userEmail,
      userName,
      signupTime,
      userAgent,
      ipAddress,
    });

    if (success) {
      console.log('Signup notification sent successfully for:', userEmail);
      return NextResponse.json({ message: 'Signup notification sent successfully' });
    } else {
      console.error('Failed to send signup notification for:', userEmail);
      return NextResponse.json(
        { error: 'Failed to send signup notification' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in signup notification API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

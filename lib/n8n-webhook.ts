interface LoginNotificationData {
  userEmail: string;
  userName?: string;
  loginTime: string;
  userAgent?: string;
  ipAddress?: string;
}

/** Sends a login notification to the N8N webhook.
 * @param data - The login notification data
 * @returns A promise that resolves to true if the notification was sent successfully, false otherwise
*/
export async function sendLoginNotification(data: LoginNotificationData): Promise<boolean> {
  try {
    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    
    if (!webhookUrl) {
      console.error('N8N_WEBHOOK_URL is not configured');
      return false;
    }

    const payload = {
      event: 'user_login',
      timestamp: data.loginTime,
      user: {
        email: data.userEmail,
        name: data.userName || 'User',
      },
      metadata: {
        userAgent: data.userAgent,
        ipAddress: data.ipAddress,
      },
    };

    console.log('Sending to N8N webhook:', webhookUrl);
    console.log('Payload:', JSON.stringify(payload, null, 2));

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log('N8N response status:', response.status);
    console.log('N8N response statusText:', response.statusText);

    if (!response.ok) {
      const responseText = await response.text();
      console.error('N8N response body:', responseText);
      console.error('Failed to send login notification to N8N:', response.statusText);
      return false;
    }
    
    const responseBody = await response.text();
    console.log('N8N success response:', responseBody);
    return true;

  } catch (error) {
    console.error('Error sending login notification:', error);
    return false;
  }
}

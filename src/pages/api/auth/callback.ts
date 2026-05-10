import type { APIRoute } from 'astro';
import { exchangeCodeForUser, createSessionToken } from '../../../lib/auth';

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  if (error) {
    return new Response(null, {
      status: 302,
      headers: { Location: '/?error=auth_denied' },
    });
  }

  if (!code) {
    return new Response(null, {
      status: 302,
      headers: { Location: '/?error=no_code' },
    });
  }

  try {
    const user = await exchangeCodeForUser(code);
    const token = createSessionToken(user.slack_id);

    return new Response(null, {
      status: 302,
      headers: {
        Location: '/profile',
        'Set-Cookie': `session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`,
      },
    });
  } catch (err) {
    console.error('Auth error:', err);
    const message = err instanceof Error ? err.message : 'unknown';
    return new Response(null, {
      status: 302,
      headers: { Location: `/?error=${encodeURIComponent(message)}` },
    });
  }
};

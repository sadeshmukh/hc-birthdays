import { upsertUser, type User } from './db';

const SLACK_CLIENT_ID = process.env.SLACK_CLIENT_ID!;
const SLACK_CLIENT_SECRET = process.env.SLACK_CLIENT_SECRET!;
const BASE_URL = process.env.BASE_URL || 'http://localhost:4321';
const SESSION_SECRET = process.env.SESSION_SECRET!;

export function getSlackAuthUrl(): string {
  const params = new URLSearchParams({
    client_id: SLACK_CLIENT_ID,
    scope: 'identity.basic,identity.avatar',
    redirect_uri: `${BASE_URL}/api/auth/callback`,
  });
  return `https://slack.com/oauth/authorize?${params.toString()}`;
}

export async function exchangeCodeForUser(code: string): Promise<User> {
  const params = new URLSearchParams({
    client_id: SLACK_CLIENT_ID,
    client_secret: SLACK_CLIENT_SECRET,
    code,
    redirect_uri: `${BASE_URL}/api/auth/callback`,
  });

  const response = await fetch('https://slack.com/api/oauth.access', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  const data = await response.json();

  if (!data.ok) {
    throw new Error(`Slack OAuth error: ${data.error}`);
  }

  const teamId = data.team_id;
  if (teamId !== 'T0266FRGM') {
    throw new Error('Only Hack Club Slack members can use this app');
  }

  const user = await upsertUser(
    data.user_id,
    data.user?.name || 'Unknown',
    data.user?.image_192 || null
  );

  return user;
}

function base64url(input: string): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function hmacSha256(data: string, secret: string): string {
  const crypto = require('crypto');
  return crypto.createHmac('sha256', secret).update(data).digest('base64url');
}

export function createSessionToken(slackId: string): string {
  const payload = {
    sub: slackId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days
  };
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64url(JSON.stringify(payload));
  const signature = hmacSha256(`${header}.${body}`, SESSION_SECRET);
  return `${header}.${body}.${signature}`;
}

export function verifySessionToken(token: string): string | null {
  try {
    const [header, body, signature] = token.split('.');
    const expectedSig = hmacSha256(`${header}.${body}`, SESSION_SECRET);
    if (signature !== expectedSig) return null;

    const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;

    return payload.sub;
  } catch {
    return null;
  }
}

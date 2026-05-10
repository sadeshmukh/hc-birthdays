import { createHmac } from "node:crypto";
import { upsertUser, type User } from "./db";

const HCA_CLIENT_ID =
  import.meta.env.HCA_CLIENT_ID ?? process.env.HCA_CLIENT_ID;
const HCA_CLIENT_SECRET =
  import.meta.env.HCA_CLIENT_SECRET ?? process.env.HCA_CLIENT_SECRET;
const BASE_URL =
  import.meta.env.PUBLIC_BASE_URL ??
  process.env.PUBLIC_BASE_URL ??
  "http://localhost:4321";
const SESSION_SECRET =
  import.meta.env.SESSION_SECRET ?? process.env.SESSION_SECRET;

export function getHCAAuthUrl(): string {
  const params = new URLSearchParams({
    client_id: HCA_CLIENT_ID,
    redirect_uri: `${BASE_URL}/api/auth/callback`,
    response_type: "code",
    scope: "slack_id",
  });
  return `https://auth.hackclub.com/oauth/authorize?${params.toString()}`;
}

export async function exchangeCodeForUser(code: string): Promise<User> {
  const tokenResponse = await fetch("https://auth.hackclub.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: HCA_CLIENT_ID,
      client_secret: HCA_CLIENT_SECRET,
      code,
      redirect_uri: `${BASE_URL}/api/auth/callback`,
      grant_type: "authorization_code",
    }).toString(),
  });

  const tokenData = await tokenResponse.json();
  if (!tokenData.access_token) {
    throw new Error(`HCA OAuth error: ${tokenData.error || "no access token"}`);
  }

  const meResponse = await fetch("https://auth.hackclub.com/api/v1/me", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });

  const meData = await meResponse.json();
  const identity = meData.identity;

  if (!identity?.slack_id) {
    throw new Error(
      "No Slack ID returned from HCA — ensure slack_id scope is granted",
    );
  }

  let displayName: string = identity.slack_id;
  let avatarUrl: string | null = null;

  const cachetResponse = await fetch(
    `https://cachet.dunkirk.sh/users/${identity.slack_id}`,
  );
  if (cachetResponse.ok) {
    const cachetData = await cachetResponse.json();
    displayName = cachetData.displayName || identity.slack_id;
    avatarUrl = cachetData.imageUrl || null;
  }

  return await upsertUser(identity.slack_id, displayName, avatarUrl);
}

function base64url(input: string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function hmacSha256(data: string, secret: string): string {
  return createHmac("sha256", secret).update(data).digest("base64url");
}

export function createSessionToken(slackId: string): string {
  const payload = {
    sub: slackId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days
  };
  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = base64url(JSON.stringify(payload));
  const signature = hmacSha256(`${header}.${body}`, SESSION_SECRET);
  return `${header}.${body}.${signature}`;
}

export function verifySessionToken(token: string): string | null {
  try {
    const [header, body, signature] = token.split(".");
    const expectedSig = hmacSha256(`${header}.${body}`, SESSION_SECRET);
    if (signature !== expectedSig) return null;

    const payload = JSON.parse(Buffer.from(body, "base64url").toString());
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;

    return payload.sub;
  } catch {
    return null;
  }
}

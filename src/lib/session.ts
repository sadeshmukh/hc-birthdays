import type { AstroCookies } from "astro";
import { verifySessionToken } from "./auth";
import { getUserBySlackId, type User } from "./db";

export async function getCurrentUser(
	cookies: AstroCookies,
): Promise<User | null> {
	const sessionToken = cookies.get("session")?.value;
	if (!sessionToken) return null;

	const slackId = verifySessionToken(sessionToken);
	if (!slackId) return null;

	return await getUserBySlackId(slackId);
}

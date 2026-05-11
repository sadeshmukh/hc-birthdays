import type { APIRoute } from "astro";
import { exchangeCodeForUser, createSessionToken } from "../../../lib/auth";

export const GET: APIRoute = async ({ request }) => {
	const url = new URL(request.url);
	const code = url.searchParams.get("code");
	const error = url.searchParams.get("error");

	if (error) {
		return new Response(null, {
			status: 302,
			headers: { Location: `/api/auth/login` },
		});
	}

	if (!code) {
		return new Response(
			`<html><body><p>Missing auth code. <a href="/api/auth/login">Try again</a></p></body></html>`,
			{
				status: 400,
				headers: { "Content-Type": "text/html" },
			},
		);
	}

	try {
		const user = await exchangeCodeForUser(code);
		const token = createSessionToken(user.slack_id);

		return new Response(null, {
			status: 302,
			headers: {
				Location: "/",
				"Set-Cookie": `session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`,
			},
		});
	} catch (err) {
		console.error("Auth error:", err);
		const message = err instanceof Error ? err.message : "unknown error";
		return new Response(
			`<html><body><p>Auth failed: ${message}. <a href="/api/auth/login">Try again</a></p></body></html>`,
			{
				status: 500,
				headers: { "Content-Type": "text/html" },
			},
		);
	}
};

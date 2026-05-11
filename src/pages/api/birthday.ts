import type { APIRoute } from "astro";
import { verifySessionToken } from "../../lib/auth";
import { updateBirthday } from "../../lib/db";

export const POST: APIRoute = async ({ request, cookies }) => {
	const sessionToken = cookies.get("session")?.value;
	if (!sessionToken) {
		return new Response(JSON.stringify({ error: "Not authenticated" }), {
			status: 401,
			headers: { "Content-Type": "application/json" },
		});
	}

	const slackId = verifySessionToken(sessionToken);
	if (!slackId) {
		return new Response(JSON.stringify({ error: "Invalid session" }), {
			status: 401,
			headers: { "Content-Type": "application/json" },
		});
	}

	const formData = await request.formData();
	const month = parseInt(formData.get("month") as string, 10);
	const day = parseInt(formData.get("day") as string, 10);
	const yearStr = formData.get("year") as string;
	const channel = (formData.get("channel") as string)?.trim() || null;
	const channelName = (formData.get("channel_name") as string)?.trim() || null;
	const channelIsPrivate = formData.get("channel_is_private") === "true";

	if (isNaN(month) || month < 1 || month > 12) {
		return new Response(JSON.stringify({ error: "Invalid month" }), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		});
	}

	if (isNaN(day) || day < 1 || day > 31) {
		return new Response(JSON.stringify({ error: "Invalid day" }), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		});
	}

	const year = yearStr ? parseInt(yearStr, 10) : null;
	if (
		year !== null &&
		(isNaN(year) || year < 1900 || year > new Date().getFullYear())
	) {
		return new Response(JSON.stringify({ error: "Invalid year" }), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		});
	}

	await updateBirthday(
		slackId,
		month,
		day,
		year,
		channel,
		channelName,
		channelIsPrivate,
	);

	return new Response(null, {
		status: 302,
		headers: { Location: "/" },
	});
};

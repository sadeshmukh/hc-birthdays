import type { APIRoute } from "astro";
import { getHCAAuthUrl } from "../../../lib/auth";

export const GET: APIRoute = async () => {
  return new Response(null, {
    status: 302,
    headers: {
      Location: getHCAAuthUrl(),
    },
  });
};

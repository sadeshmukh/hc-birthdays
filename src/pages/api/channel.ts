import type { APIRoute } from "astro";

interface ChannelResult {
  name: string;
  id: string;
  is_private: boolean;
}

function json(data: object) {
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
  });
}

function isPrivate(c: Record<string, unknown>): boolean {
  return !("created" in c);
}

function normalizeChannel(c: Record<string, unknown>): ChannelResult | null {
  if (!c.name || !c.id) return null;
  return {
    name: c.name as string,
    id: c.id as string,
    is_private: isPrivate(c),
  };
}

export const GET: APIRoute = async ({ url }) => {
  const q = url.searchParams.get("q")?.trim();
  const id = url.searchParams.get("id")?.trim();

  if (!q && !id) return json({ results: [] });

  try {
    if (id) {
      const res = await fetch(
        `https://flaron.halceon.dev/channel/${encodeURIComponent(id)}`,
      );
      if (!res.ok) return json({ found: false });
      const data = (await res.json()) as Record<string, unknown>;
      const channel = normalizeChannel({ ...data, id: data.id ?? id });
      return channel
        ? json({ found: true, ...channel })
        : json({ found: false });
    }

    const res = await fetch(
      `https://flaron.halceon.dev/channels/search?q=${encodeURIComponent(q!)}`,
    );
    if (!res.ok) return json({ results: [] });
    const body = (await res.json()) as { data?: Record<string, unknown>[] };
    const raw = body.data ?? [];
    return json({
      results: raw
        .map(normalizeChannel)
        .filter((c): c is ChannelResult => c !== null),
    });
  } catch {
    return id ? json({ found: false }) : json({ results: [] });
  }
};

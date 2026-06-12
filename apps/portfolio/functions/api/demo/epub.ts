import { corsHeaders } from "./_shared";

type DemoEnv = {
  DEMO_ALLOWED_ORIGINS?: string;
};

const GUTENBERG_CACHE_HOST = "www.gutenberg.org";
const GUTENBERG_CACHE_PATH = /^\/cache\/epub\/(\d+)\/pg\1(?:-images-3)?\.epub$/i;

function resolveGutenbergEpubUrl(gutenbergId: string): string | null {
  if (!/^\d+$/.test(gutenbergId)) return null;
  return `https://${GUTENBERG_CACHE_HOST}/cache/epub/${gutenbergId}/pg${gutenbergId}-images-3.epub`;
}

function resolveAllowedEpubUrl(rawUrl: string): string | null {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== "https:") return null;
    if (parsed.hostname !== GUTENBERG_CACHE_HOST) return null;
    if (!GUTENBERG_CACHE_PATH.test(parsed.pathname)) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

export const onRequestGet = async (context: { request: Request; env: DemoEnv }) => {
  const { request } = context;
  const url = new URL(request.url);
  const gutenbergId = url.searchParams.get("gutenberg_id")?.trim() ?? "";
  const directUrl = url.searchParams.get("url")?.trim() ?? "";

  const target =
    (gutenbergId ? resolveGutenbergEpubUrl(gutenbergId) : null) ??
    (directUrl ? resolveAllowedEpubUrl(directUrl) : null);

  if (!target) {
    return new Response("Invalid or missing EPUB source.", {
      status: 400,
      headers: corsHeaders("GET, OPTIONS"),
    });
  }

  try {
    const upstream = await fetch(target, {
      headers: {
        Accept: "application/epub+zip, application/octet-stream, */*",
      },
    });

    if (!upstream.ok) {
      return new Response("EPUB source unavailable.", {
        status: upstream.status,
        headers: corsHeaders("GET, OPTIONS"),
      });
    }

    const body = await upstream.arrayBuffer();
    return new Response(body, {
      status: 200,
      headers: {
        ...corsHeaders("GET, OPTIONS"),
        "Content-Type": "application/epub+zip",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error) {
    console.error("Demo EPUB proxy error", error);
    return new Response("EPUB proxy failed.", {
      status: 502,
      headers: corsHeaders("GET, OPTIONS"),
    });
  }
};

export const onRequestOptions = async () =>
  new Response(null, {
    status: 204,
    headers: corsHeaders("GET, OPTIONS"),
  });

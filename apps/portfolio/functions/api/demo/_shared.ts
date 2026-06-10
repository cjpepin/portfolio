type RateBucket = {
  count: number;
  windowStart: number;
};

const rateBuckets = new Map<string, RateBucket>();

export type DemoEnv = {
  GOOGLE_TRANSLATE_API_KEY?: string;
  OPENAI_API_KEY?: string;
  DEMO_ALLOWED_ORIGINS?: string;
  DEMO_RATE_LIMIT_PER_HOUR?: string;
};

export function json(data: unknown, status = 200, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      ...extraHeaders,
    },
  });
}

export function corsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Demo-Session",
  };
}

export function assertAllowedOrigin(request: Request, env: DemoEnv): Response | null {
  const headerOrigin = request.headers.get("Origin");
  if (!headerOrigin) {
    return null;
  }

  const allowed = (env.DEMO_ALLOWED_ORIGINS ?? "http://localhost:4321,https://connorjpepin.com,https://www.connorjpepin.com")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  try {
    const origin = new URL(headerOrigin).origin;
    if (!allowed.includes(origin)) {
      return json({ error: "Origin not allowed." }, 403, corsHeaders());
    }
  } catch {
    return json({ error: "Origin not allowed." }, 403, corsHeaders());
  }

  return null;
}

export function getClientKey(request: Request): string {
  const session = request.headers.get("X-Demo-Session")?.trim();
  const ip = request.headers.get("CF-Connecting-IP") ?? request.headers.get("X-Forwarded-For") ?? "unknown";
  return `${ip}:${session ?? "anonymous"}`;
}

export function checkRateLimit(request: Request, env: DemoEnv, bucket: string): Response | null {
  const limit = Number(env.DEMO_RATE_LIMIT_PER_HOUR ?? "30");
  const windowMs = 60 * 60 * 1000;
  const key = `${bucket}:${getClientKey(request)}`;
  const now = Date.now();
  const current = rateBuckets.get(key);

  if (!current || now - current.windowStart >= windowMs) {
    rateBuckets.set(key, { count: 1, windowStart: now });
    return null;
  }

  if (current.count >= limit) {
    return json({ error: "Demo rate limit exceeded. Try again later." }, 429, corsHeaders());
  }

  current.count += 1;
  rateBuckets.set(key, current);
  return null;
}

const STATIC_TRANSLATIONS: Record<string, string> = {
  "es:en:hola": "hello",
  "es:en:mundo": "world",
  "es:en:gracias": "thank you",
  "fr:en:bonjour": "hello",
  "en:es:hello": "hola",
  "en:es:world": "mundo",
};

export async function translateTerm(input: {
  source_lang: string;
  target_lang: string;
  text: string;
  apiKey?: string;
}): Promise<{ translation: string; from_cache: boolean; detected_lang?: string }> {
  const term = input.text.trim();
  const termNormalized = term.toLowerCase();
  const cacheKey = `${input.source_lang}:${input.target_lang}:${termNormalized}`;
  const cached = STATIC_TRANSLATIONS[cacheKey];
  if (cached) {
    return { translation: cached, from_cache: true, detected_lang: input.source_lang };
  }

  if (!input.apiKey) {
    return {
      translation: `[demo] ${term}`,
      from_cache: false,
      detected_lang: input.source_lang,
    };
  }

  const googleUrl = `https://translation.googleapis.com/language/translate/v2?key=${input.apiKey}`;
  const googleResponse = await fetch(googleUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      q: term,
      source: input.source_lang,
      target: input.target_lang,
      format: "text",
    }),
  });

  if (!googleResponse.ok) {
    throw new Error("Translation provider failed.");
  }

  const googleData = (await googleResponse.json()) as {
    data: { translations: Array<{ translatedText: string }> };
  };

  return {
    translation: googleData.data.translations[0]?.translatedText ?? term,
    from_cache: false,
    detected_lang: input.source_lang,
  };
}

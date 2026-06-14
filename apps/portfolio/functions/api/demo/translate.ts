import {
  assertAllowedOrigin,
  checkRateLimit,
  corsHeaders,
  json,
  translateTerm,
  type DemoEnv,
} from "./_shared";

type TranslatePayload = {
  source_lang?: string;
  target_lang?: string;
  text?: string;
};

export const onRequestPost = async (context: { request: Request; env: DemoEnv }) => {
  const { request, env } = context;

  const originError = assertAllowedOrigin(request, env);
  if (originError) return originError;

  const rateError = checkRateLimit(request, env, "translate");
  if (rateError) return rateError;

  try {
    const body = (await request.json()) as TranslatePayload;
    const sourceLang = body.source_lang?.trim();
    const targetLang = body.target_lang?.trim();
    const text = body.text?.trim();

    if (!sourceLang || !targetLang || !text) {
      return json({ error: "Missing required fields." }, 400, corsHeaders());
    }

    if (text.length > 100) {
      return json({ error: "Text too long (max 100 characters)." }, 400, corsHeaders());
    }

    const result = await translateTerm({
      source_lang: sourceLang,
      target_lang: targetLang,
      text,
      apiKey: env.GOOGLE_TRANSLATE_API_KEY,
    });

    return json(
      {
        term: text,
        term_normalized: text.toLowerCase(),
        translation: result.translation,
        from_cache: result.from_cache,
        detected_lang: result.detected_lang,
        same_language: result.detected_lang === targetLang,
      },
      200,
      corsHeaders(),
    );
  } catch (error) {
    console.error("Demo translate error", error);
    const message = error instanceof Error ? error.message : "Translation failed.";
    const status = message.includes("not configured") ? 503 : 500;
    return json({ error: status === 503 ? "Translation service is not configured." : "Translation failed." }, status, corsHeaders());
  }
};

export const onRequestOptions = async () =>
  new Response(null, {
    status: 204,
    headers: corsHeaders(),
  });

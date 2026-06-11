var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/pages-gH6qYL/functionsWorker-0.8623652137320676.mjs
var __defProp2 = Object.defineProperty;
var __name2 = /* @__PURE__ */ __name((target, value) => __defProp2(target, "name", { value, configurable: true }), "__name");
var rateBuckets = /* @__PURE__ */ new Map();
function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      ...extraHeaders
    }
  });
}
__name(json, "json");
__name2(json, "json");
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Demo-Session"
  };
}
__name(corsHeaders, "corsHeaders");
__name2(corsHeaders, "corsHeaders");
function assertAllowedOrigin(request, env) {
  const headerOrigin = request.headers.get("Origin");
  if (!headerOrigin) {
    return null;
  }
  const allowed = (env.DEMO_ALLOWED_ORIGINS ?? "http://localhost:4321,https://connorjpepin.com,https://www.connorjpepin.com").split(",").map((value) => value.trim()).filter(Boolean);
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
__name(assertAllowedOrigin, "assertAllowedOrigin");
__name2(assertAllowedOrigin, "assertAllowedOrigin");
function getClientKey(request) {
  const session = request.headers.get("X-Demo-Session")?.trim();
  const ip = request.headers.get("CF-Connecting-IP") ?? request.headers.get("X-Forwarded-For") ?? "unknown";
  return `${ip}:${session ?? "anonymous"}`;
}
__name(getClientKey, "getClientKey");
__name2(getClientKey, "getClientKey");
function checkRateLimit(request, env, bucket) {
  const limit = Number(env.DEMO_RATE_LIMIT_PER_HOUR ?? "30");
  const windowMs = 60 * 60 * 1e3;
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
__name(checkRateLimit, "checkRateLimit");
__name2(checkRateLimit, "checkRateLimit");
var STATIC_TRANSLATIONS = {
  "es:en:hola": "hello",
  "es:en:mundo": "world",
  "es:en:gracias": "thank you",
  "fr:en:bonjour": "hello",
  "en:es:hello": "hola",
  "en:es:world": "mundo"
};
async function translateTerm(input) {
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
      detected_lang: input.source_lang
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
      format: "text"
    })
  });
  if (!googleResponse.ok) {
    throw new Error("Translation provider failed.");
  }
  const googleData = await googleResponse.json();
  return {
    translation: googleData.data.translations[0]?.translatedText ?? term,
    from_cache: false,
    detected_lang: input.source_lang
  };
}
__name(translateTerm, "translateTerm");
__name2(translateTerm, "translateTerm");
function buildDemoReply(messages) {
  const lastUser = [...messages].reverse().find((message) => message.role === "user");
  const prompt = lastUser?.content?.trim() ?? "";
  if (!prompt) {
    return "Ask me something about your notes, roadmap, or local-first product ideas.";
  }
  return [
    "Demo mode reply (rate-limited, not persisted to cloud):",
    "",
    `You asked about \u201C${prompt.slice(0, 120)}\u201D.`,
    "In the full Trellis app this would stream from your configured model and stay in your vault.",
    "Here, the assistant response is generated locally in the portfolio demo API."
  ].join("\n");
}
__name(buildDemoReply, "buildDemoReply");
__name2(buildDemoReply, "buildDemoReply");
var onRequestPost = /* @__PURE__ */ __name2(async (context) => {
  const { request, env } = context;
  const originError = assertAllowedOrigin(request, env);
  if (originError) return originError;
  const rateError = checkRateLimit(request, env, "chat");
  if (rateError) return rateError;
  try {
    const body = await request.json();
    const messages = (body.messages ?? []).filter((message) => typeof message.role === "string" && typeof message.content === "string").map((message) => ({ role: message.role, content: message.content }));
    if (messages.length === 0) {
      return json({ error: "At least one message is required." }, 400, corsHeaders());
    }
    const reply = buildDemoReply(messages);
    if (env.OPENAI_API_KEY) {
      try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.OPENAI_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "gpt-4.1-mini",
            messages: [
              {
                role: "system",
                content: "You are Trellis demo assistant. Keep answers concise (<=120 words) for a portfolio embed."
              },
              ...messages.slice(-6)
            ],
            max_tokens: 180
          })
        });
        if (response.ok) {
          const data = await response.json();
          const content = data.choices?.[0]?.message?.content?.trim();
          if (content) {
            return streamText(content);
          }
        }
      } catch (error) {
        console.warn("Demo chat OpenAI fallback", error);
      }
    }
    return streamText(reply);
  } catch (error) {
    console.error("Demo chat error", error);
    return json({ error: "Chat failed." }, 500, corsHeaders());
  }
}, "onRequestPost");
function streamText(text) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const chunks = text.match(/.{1,24}/g) ?? [text];
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ token: chunk })}

`));
      }
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    }
  });
  return new Response(stream, {
    status: 200,
    headers: {
      ...corsHeaders(),
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive"
    }
  });
}
__name(streamText, "streamText");
__name2(streamText, "streamText");
var onRequestOptions = /* @__PURE__ */ __name2(async () => new Response(null, {
  status: 204,
  headers: corsHeaders()
}), "onRequestOptions");
var onRequestPost2 = /* @__PURE__ */ __name2(async (context) => {
  const { request, env } = context;
  const originError = assertAllowedOrigin(request, env);
  if (originError) return originError;
  const rateError = checkRateLimit(request, env, "translate");
  if (rateError) return rateError;
  try {
    const body = await request.json();
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
      apiKey: env.GOOGLE_TRANSLATE_API_KEY
    });
    return json(
      {
        term: text,
        term_normalized: text.toLowerCase(),
        translation: result.translation,
        from_cache: result.from_cache,
        detected_lang: result.detected_lang
      },
      200,
      corsHeaders()
    );
  } catch (error) {
    console.error("Demo translate error", error);
    return json({ error: "Translation failed." }, 500, corsHeaders());
  }
}, "onRequestPost");
var onRequestOptions2 = /* @__PURE__ */ __name2(async () => new Response(null, {
  status: 204,
  headers: corsHeaders()
}), "onRequestOptions");
var SUPABASE_DB_SCHEMA = "lingoleaf";
var supabaseApiHeaders = /* @__PURE__ */ __name2((apiKey, bearerToken) => ({
  apikey: apiKey,
  "Content-Type": "application/json",
  Accept: "application/json",
  "Accept-Profile": SUPABASE_DB_SCHEMA,
  "Content-Profile": SUPABASE_DB_SCHEMA,
  ...bearerToken ? { Authorization: `Bearer ${bearerToken}` } : {}
}), "supabaseApiHeaders");
var MAX_RANGE_MS = 60 * 24 * 60 * 60 * 1e3;
var json2 = /* @__PURE__ */ __name2((data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "no-store"
  }
}), "json");
var asRecord = /* @__PURE__ */ __name2((value) => typeof value === "object" && value !== null && !Array.isArray(value) ? value : null, "asRecord");
var firstNonEmptyString = /* @__PURE__ */ __name2((...values) => {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return null;
}, "firstNonEmptyString");
var parseIsoDate = /* @__PURE__ */ __name2((value) => {
  if (!value) {
    return null;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}, "parseIsoDate");
var firstNumber = /* @__PURE__ */ __name2((...values) => {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === "string") {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }
  return null;
}, "firstNumber");
var normalizeRecentEvent = /* @__PURE__ */ __name2((value) => {
  const row = asRecord(value) ?? {};
  const properties = asRecord(row.properties) ?? asRecord(row.event_properties) ?? asRecord(row.event_payload) ?? asRecord(row.metadata) ?? null;
  const purchase = asRecord(properties?.purchase) ?? asRecord(row.purchase) ?? null;
  const error = asRecord(properties?.error) ?? asRecord(row.error) ?? null;
  return {
    ...row,
    severity: firstNonEmptyString(row.severity, properties?.severity, properties?.level, error?.severity),
    error_code: firstNonEmptyString(row.error_code, properties?.error_code, error?.code, purchase?.error_code),
    error_message: firstNonEmptyString(row.error_message, properties?.error_message, error?.message, purchase?.error_message),
    purchase_product_id: firstNonEmptyString(
      row.purchase_product_id,
      properties?.purchase_product_id,
      properties?.product_id,
      purchase?.product_id
    ),
    purchase_price: firstNumber(row.purchase_price, properties?.purchase_price, properties?.price, purchase?.price),
    purchase_currency: firstNonEmptyString(
      row.purchase_currency,
      properties?.purchase_currency,
      properties?.currency,
      purchase?.currency
    ),
    purchase_storefront: firstNonEmptyString(
      row.purchase_storefront,
      properties?.purchase_storefront,
      properties?.storefront,
      purchase?.storefront
    )
  };
}, "normalizeRecentEvent");
var supabaseRpc = /* @__PURE__ */ __name2(async ({
  url,
  anonKey,
  token,
  rpcName,
  payload
}) => {
  const response = await fetch(`${url}/rest/v1/rpc/${rpcName}`, {
    method: "POST",
    headers: supabaseApiHeaders(anonKey, token),
    body: JSON.stringify(payload)
  });
  const body = await response.text();
  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      body
    };
  }
  return {
    ok: true,
    status: response.status,
    data: (() => {
      if (!body) {
        return null;
      }
      try {
        return JSON.parse(body);
      } catch {
        return body;
      }
    })()
  };
}, "supabaseRpc");
var onRequestGet = /* @__PURE__ */ __name2(async ({ request, env }) => {
  const token = request.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) {
    return json2({ error: "Missing authorization token." }, 401);
  }
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = env;
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return json2({ error: "Supabase configuration missing for admin analytics." }, 500);
  }
  try {
    const meResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: supabaseApiHeaders(SUPABASE_ANON_KEY, token)
    });
    if (!meResponse.ok) {
      return json2({ error: "Invalid session." }, 401);
    }
    const url = new URL(request.url);
    const from = parseIsoDate(url.searchParams.get("from"));
    const to = parseIsoDate(url.searchParams.get("to"));
    const limitValue = Number(url.searchParams.get("limit") ?? "50");
    const limit = Number.isFinite(limitValue) ? Math.min(Math.max(Math.trunc(limitValue), 1), 200) : 50;
    if (!from || !to || from >= to || to.getTime() - from.getTime() > MAX_RANGE_MS) {
      return json2({ error: "Invalid date range." }, 400);
    }
    const summaryResult = await supabaseRpc({
      url: SUPABASE_URL,
      anonKey: SUPABASE_ANON_KEY,
      token,
      rpcName: "analytics_admin_dashboard",
      payload: {
        p_from: from.toISOString(),
        p_to: to.toISOString()
      }
    });
    if (!summaryResult.ok) {
      if (summaryResult.status === 401 || summaryResult.status === 403) {
        return json2({ error: "Not authorized for analytics dashboard." }, 403);
      }
      console.error("Analytics summary RPC failed", { status: summaryResult.status, body: summaryResult.body });
      return json2({ error: "Failed to load analytics summary." }, 500);
    }
    const eventsResult = await supabaseRpc({
      url: SUPABASE_URL,
      anonKey: SUPABASE_ANON_KEY,
      token,
      rpcName: "analytics_admin_recent_events",
      payload: {
        p_limit: limit,
        p_from: from.toISOString(),
        p_to: to.toISOString()
      }
    });
    if (!eventsResult.ok) {
      if (eventsResult.status === 401 || eventsResult.status === 403) {
        return json2({ error: "Not authorized for analytics dashboard." }, 403);
      }
      console.error("Analytics events RPC failed", { status: eventsResult.status, body: eventsResult.body });
      return json2({ error: "Failed to load analytics events." }, 500);
    }
    return json2({
      summary: summaryResult.data,
      recent_events: Array.isArray(eventsResult.data) ? eventsResult.data.map(normalizeRecentEvent) : []
    });
  } catch (error) {
    console.error("Admin analytics error", error);
    return json2({ error: "Failed to load admin analytics." }, 500);
  }
}, "onRequestGet");
var onRequestPost3 = /* @__PURE__ */ __name2(async (context) => {
  const { request, env } = context;
  const apiKey = env.RESEND_API_KEY;
  const json4 = /* @__PURE__ */ __name2((data, status = 200) => new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store"
    }
  }), "json");
  const requestOrigin = new URL(request.url).origin;
  const headerOrigin = request.headers.get("Origin");
  const referer = request.headers.get("Referer");
  const incomingOrigin = headerOrigin ?? referer;
  if (incomingOrigin) {
    try {
      if (new URL(incomingOrigin).origin !== requestOrigin) {
        return json4({ error: "Origin not allowed." }, 403);
      }
    } catch {
      return json4({ error: "Origin not allowed." }, 403);
    }
  }
  if (!apiKey) {
    return json4({ error: "Contact form is not configured." }, 500);
  }
  try {
    const formData = await request.formData();
    const honeypot = formData.get("website");
    if (typeof honeypot === "string" && honeypot.trim()) {
      return json4({ success: true });
    }
    const readField = /* @__PURE__ */ __name2((key) => {
      const value = formData.get(key);
      return typeof value === "string" ? value.trim() : "";
    }, "readField");
    const name = readField("name");
    const email = readField("email");
    const subject = readField("subject") || "Contact form submission";
    const message = readField("message");
    if (!name || name.length > 100) {
      return json4({ error: "Name is required and must be 100 characters or fewer." }, 400);
    }
    if (!email || email.length > 320 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json4({ error: "Enter a valid email address." }, 400);
    }
    if (subject.length > 140) {
      return json4({ error: "Subject must be 140 characters or fewer." }, 400);
    }
    if (message.length < 10 || message.length > 4e3) {
      return json4({ error: "Message must be between 10 and 4000 characters." }, 400);
    }
    const escape = /* @__PURE__ */ __name2((s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"), "escape");
    const html = `
      <h2>New contact form submission</h2>
      <p><strong>From:</strong> ${escape(name)} &lt;${escape(email)}&gt;</p>
      <p><strong>Subject:</strong> ${escape(subject)}</p>
      <hr />
      <p>${escape(message).replace(/\n/g, "<br />")}</p>
    `;
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "Lingoleaf Contact <contact@lingoleaf.app>",
        to: ["support@lingoleaf.app"],
        reply_to: email,
        subject: `[Lingoleaf] ${subject}`,
        html
      })
    });
    if (!resendResponse.ok) {
      console.error("Resend API error", { status: resendResponse.status });
      return json4({ error: "Failed to send message. Please try again." }, 500);
    }
    return json4({ success: true });
  } catch (error) {
    console.error("Contact form error", error);
    return json4({ error: "Failed to send message. Please try again." }, 500);
  }
}, "onRequestPost");
var json3 = /* @__PURE__ */ __name2((data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "no-store"
  }
}), "json");
var onRequestPost4 = /* @__PURE__ */ __name2(async ({ request, env }) => {
  const token = request.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) {
    return json3({ error: "Missing authorization token." }, 401);
  }
  const requestOrigin = new URL(request.url).origin;
  const headerOrigin = request.headers.get("Origin");
  const referer = request.headers.get("Referer");
  const incomingOrigin = headerOrigin ?? referer;
  if (incomingOrigin) {
    try {
      if (new URL(incomingOrigin).origin !== requestOrigin) {
        return json3({ error: "Origin not allowed." }, 403);
      }
    } catch {
      return json3({ error: "Origin not allowed." }, 403);
    }
  }
  const { TURNSTILE_SECRET_KEY, SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY } = env;
  if (!TURNSTILE_SECRET_KEY || !SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
    return json3({ error: "Turnstile verification is not configured." }, 500);
  }
  try {
    const payload = await request.json().catch(() => ({}));
    if (typeof payload.token !== "string" || payload.token.length === 0 || payload.token.length > 2048) {
      return json3({ error: "Missing Turnstile token." }, 400);
    }
    const ip = request.headers.get("CF-Connecting-IP") ?? void 0;
    const verificationResponse = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: TURNSTILE_SECRET_KEY,
        response: payload.token,
        remoteip: ip
      })
    });
    if (!verificationResponse.ok) {
      console.error("Turnstile upstream error", { status: verificationResponse.status });
      return json3({ error: "Turnstile verification failed." }, 502);
    }
    const verificationResult = await verificationResponse.json();
    if (!verificationResult.success) {
      return json3({ error: "Turnstile verification failed." }, 400);
    }
    const meResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: supabaseApiHeaders(SUPABASE_ANON_KEY, token)
    });
    if (!meResponse.ok) {
      return json3({ error: "Invalid session." }, 401);
    }
    const user = await meResponse.json().catch(() => ({}));
    if (!user.id) {
      return json3({ error: "Invalid session." }, 401);
    }
    const rpcResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/mark_forum_human_verified_for_user`, {
      method: "POST",
      headers: supabaseApiHeaders(SUPABASE_SERVICE_ROLE_KEY, SUPABASE_SERVICE_ROLE_KEY),
      body: JSON.stringify({ p_user_id: user.id })
    });
    if (!rpcResponse.ok) {
      console.error("Failed to store Turnstile verification", { status: rpcResponse.status });
      return json3({ error: "Failed to store verification." }, 500);
    }
    const expiresAt = await rpcResponse.json().catch(() => null);
    return json3({ success: true, expires_at: expiresAt });
  } catch (error) {
    console.error("Turnstile verification error", error);
    return json3({ error: "Turnstile verification failed." }, 500);
  }
}, "onRequestPost");
var onRequestPost5 = /* @__PURE__ */ __name2(async (context) => {
  const { request, env } = context;
  const apiKey = env.RESEND_API_KEY;
  const toEmail = env.CONTACT_TO_EMAIL ?? "cjpepin@wustl.edu";
  const fromEmail = env.CONTACT_FROM_EMAIL ?? "Portfolio Contact <onboarding@resend.dev>";
  const json4 = /* @__PURE__ */ __name2((data, status = 200) => new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store"
    }
  }), "json");
  const requestOrigin = new URL(request.url).origin;
  const headerOrigin = request.headers.get("Origin");
  if (headerOrigin) {
    try {
      if (new URL(headerOrigin).origin !== requestOrigin) {
        return json4({ error: "Origin not allowed." }, 403);
      }
    } catch {
      return json4({ error: "Origin not allowed." }, 403);
    }
  }
  if (!apiKey) {
    return json4({ error: "Contact form is not configured." }, 500);
  }
  try {
    const body = await request.json();
    if (typeof body.website === "string" && body.website.trim()) {
      return json4({ success: true });
    }
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const subject = (typeof body.subject === "string" ? body.subject.trim() : "") || "Portfolio contact";
    const message = typeof body.message === "string" ? body.message.trim() : "";
    if (!name || name.length > 100) {
      return json4({ error: "Name is required and must be 100 characters or fewer." }, 400);
    }
    if (!email || email.length > 320 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json4({ error: "Enter a valid email address." }, 400);
    }
    if (subject.length > 140) {
      return json4({ error: "Subject must be 140 characters or fewer." }, 400);
    }
    if (message.length < 10 || message.length > 4e3) {
      return json4({ error: "Message must be between 10 and 4000 characters." }, 400);
    }
    const escape = /* @__PURE__ */ __name2((s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"), "escape");
    const html = `
      <h2>Portfolio contact form</h2>
      <p><strong>From:</strong> ${escape(name)} &lt;${escape(email)}&gt;</p>
      <p><strong>Subject:</strong> ${escape(subject)}</p>
      <hr />
      <p>${escape(message).replace(/\n/g, "<br />")}</p>
    `;
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        reply_to: email,
        subject: `[Portfolio] ${subject}`,
        html
      })
    });
    if (!resendResponse.ok) {
      console.error("Resend API error", { status: resendResponse.status });
      return json4({ error: "Failed to send message. Please try again." }, 500);
    }
    return json4({ success: true });
  } catch (error) {
    console.error("Contact form error", error);
    return json4({ error: "Failed to send message. Please try again." }, 500);
  }
}, "onRequestPost");
var onRequestOptions3 = /* @__PURE__ */ __name2(async () => new Response(null, {
  status: 204,
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  }
}), "onRequestOptions");
var routes = [
  {
    routePath: "/api/demo/chat",
    mountPath: "/api/demo",
    method: "OPTIONS",
    middlewares: [],
    modules: [onRequestOptions]
  },
  {
    routePath: "/api/demo/chat",
    mountPath: "/api/demo",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost]
  },
  {
    routePath: "/api/demo/translate",
    mountPath: "/api/demo",
    method: "OPTIONS",
    middlewares: [],
    modules: [onRequestOptions2]
  },
  {
    routePath: "/api/demo/translate",
    mountPath: "/api/demo",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost2]
  },
  {
    routePath: "/lingoleaf/api/admin-analytics",
    mountPath: "/lingoleaf/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet]
  },
  {
    routePath: "/lingoleaf/api/contact",
    mountPath: "/lingoleaf/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost3]
  },
  {
    routePath: "/lingoleaf/api/turnstile-verify",
    mountPath: "/lingoleaf/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost4]
  },
  {
    routePath: "/api/contact",
    mountPath: "/api",
    method: "OPTIONS",
    middlewares: [],
    modules: [onRequestOptions3]
  },
  {
    routePath: "/api/contact",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost5]
  }
];
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
__name2(lexer, "lexer");
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name2(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name2(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name2(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name2(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name2(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
__name2(parse, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
__name2(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name2(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
__name2(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
__name2(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
__name2(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
__name2(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
__name2(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
__name2(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
__name2(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");
__name2(pathToRegexp, "pathToRegexp");
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult) {
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: mountMatchResult.path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
__name2(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name2(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: /* @__PURE__ */ __name2(() => {
            isFailOpen = true;
          }, "passThroughOnException")
        };
        const response = await handler(context);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error) {
      if (isFailOpen) {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name2((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");
var drainBody = /* @__PURE__ */ __name2(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
__name2(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name2(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = pages_template_worker_default;
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
__name2(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
__name2(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");
__name2(__facade_invoke__, "__facade_invoke__");
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  static {
    __name(this, "___Facade_ScheduledController__");
  }
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name2(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name2(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name2(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
__name2(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name2((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name2((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
__name2(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;

// ../../../../../../private/var/folders/xb/9rzdt3lx26q7kbj2zlh127yw0000gn/T/cursor-sandbox-cache/9f708bd9cb33649a45060e3814ea6417/npm/_npx/c943b712072b77c4/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody2 = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default2 = drainBody2;

// ../../../../../../private/var/folders/xb/9rzdt3lx26q7kbj2zlh127yw0000gn/T/cursor-sandbox-cache/9f708bd9cb33649a45060e3814ea6417/npm/_npx/c943b712072b77c4/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError2(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError2(e.cause)
  };
}
__name(reduceError2, "reduceError");
var jsonError2 = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError2(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default2 = jsonError2;

// .wrangler/tmp/bundle-J0B0W6/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__2 = [
  middleware_ensure_req_body_drained_default2,
  middleware_miniflare3_json_error_default2
];
var middleware_insertion_facade_default2 = middleware_loader_entry_default;

// ../../../../../../private/var/folders/xb/9rzdt3lx26q7kbj2zlh127yw0000gn/T/cursor-sandbox-cache/9f708bd9cb33649a45060e3814ea6417/npm/_npx/c943b712072b77c4/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__2 = [];
function __facade_register__2(...args) {
  __facade_middleware__2.push(...args.flat());
}
__name(__facade_register__2, "__facade_register__");
function __facade_invokeChain__2(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__2(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__2, "__facade_invokeChain__");
function __facade_invoke__2(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__2(request, env, ctx, dispatch, [
    ...__facade_middleware__2,
    finalMiddleware
  ]);
}
__name(__facade_invoke__2, "__facade_invoke__");

// .wrangler/tmp/bundle-J0B0W6/middleware-loader.entry.ts
var __Facade_ScheduledController__2 = class ___Facade_ScheduledController__2 {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__2)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler2(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__2 === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__2.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__2) {
    __facade_register__2(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__2(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__2(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler2, "wrapExportedHandler");
function wrapWorkerEntrypoint2(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__2 === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__2.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__2) {
    __facade_register__2(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__2(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__2(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint2, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY2;
if (typeof middleware_insertion_facade_default2 === "object") {
  WRAPPED_ENTRY2 = wrapExportedHandler2(middleware_insertion_facade_default2);
} else if (typeof middleware_insertion_facade_default2 === "function") {
  WRAPPED_ENTRY2 = wrapWorkerEntrypoint2(middleware_insertion_facade_default2);
}
var middleware_loader_entry_default2 = WRAPPED_ENTRY2;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__2 as __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default2 as default
};
//# sourceMappingURL=functionsWorker-0.8623652137320676.js.map

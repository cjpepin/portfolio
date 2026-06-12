import {
  assertAllowedOrigin,
  checkRateLimit,
  corsHeaders,
  json,
  type DemoEnv,
} from "./_shared";

type ChatPayload = {
  messages?: Array<{ role?: string; content?: string }>;
};

const SYSTEM_PROMPT =
  "You are Trellis, a local-first AI knowledge assistant. Answer concisely (≤120 words) as a helpful demo assistant for a portfolio embed. Help users think about their notes, ideas, and projects.";

export const onRequestPost = async (context: { request: Request; env: DemoEnv }) => {
  const { request, env } = context;

  const originError = assertAllowedOrigin(request, env);
  if (originError) return originError;

  const rateError = checkRateLimit(request, env, "chat");
  if (rateError) return rateError;

  try {
    const body = (await request.json()) as ChatPayload;
    const messages = (body.messages ?? [])
      .filter((message) => typeof message.role === "string" && typeof message.content === "string")
      .map((message) => ({ role: message.role as string, content: message.content as string }));

    if (messages.length === 0) {
      return json({ error: "At least one message is required." }, 400, corsHeaders());
    }

    const apiKey = env.OPENAI_API_KEY?.trim();
    if (!apiKey) {
      return json(
        {
          error:
            "Demo chat AI is not configured. Set OPENAI_API_KEY in Cloudflare Pages environment variables (or apps/portfolio/.dev.vars for local wrangler dev).",
        },
        503,
        corsHeaders(),
      );
    }

    try {
      return await streamOpenAI(messages, apiKey);
    } catch (error) {
      console.error("Demo chat OpenAI error", error);
      return json({ error: "Chat provider failed. Try again shortly." }, 502, corsHeaders());
    }
  } catch (error) {
    console.error("Demo chat error", error);
    return json({ error: "Chat failed." }, 500, corsHeaders());
  }
};

async function streamOpenAI(
  messages: Array<{ role: string; content: string }>,
  apiKey: string,
): Promise<Response> {
  const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages.slice(-6)],
      max_tokens: 180,
      stream: true,
    }),
  });

  if (!openaiResponse.ok || !openaiResponse.body) {
    throw new Error(`OpenAI request failed (${openaiResponse.status})`);
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const reader = openaiResponse.body.getReader();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let buffer = "";
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;

            const payload = trimmed.slice(5).trim();
            if (payload === "[DONE]") continue;

            try {
              const parsed = JSON.parse(payload) as {
                choices?: Array<{ delta?: { content?: string } }>;
              };
              const token = parsed.choices?.[0]?.delta?.content;
              if (token) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ token })}\n\n`));
              }
            } catch {
              // ignore malformed chunks
            }
          }
        }

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      ...corsHeaders(),
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

export const onRequestOptions = async () =>
  new Response(null, {
    status: 204,
    headers: corsHeaders(),
  });

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

function buildDemoReply(messages: Array<{ role: string; content: string }>): string {
  const lastUser = [...messages].reverse().find((message) => message.role === "user");
  const prompt = lastUser?.content?.trim() ?? "";
  if (!prompt) {
    return "Ask me something about your notes, roadmap, or local-first product ideas.";
  }
  return [
    "Demo mode reply (rate-limited, not persisted to cloud):",
    "",
    `You asked about “${prompt.slice(0, 120)}”.`,
    "In the full Trellis app this would stream from your configured model and stay in your vault.",
    "Here, the assistant response is generated locally in the portfolio demo API.",
  ].join("\n");
}

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

    const reply = buildDemoReply(messages);

    if (env.OPENAI_API_KEY) {
      try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4.1-mini",
            messages: [
              {
                role: "system",
                content:
                  "You are Trellis demo assistant. Keep answers concise (<=120 words) for a portfolio embed.",
              },
              ...messages.slice(-6),
            ],
            max_tokens: 180,
          }),
        });

        if (response.ok) {
          const data = (await response.json()) as {
            choices?: Array<{ message?: { content?: string } }>;
          };
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
};

function streamText(text: string): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const chunks = text.match(/.{1,24}/g) ?? [text];
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ token: chunk })}\n\n`));
      }
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
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

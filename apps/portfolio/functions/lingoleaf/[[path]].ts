type PagesContext = {
  request: Request;
  next: () => Promise<Response>;
  env: {
    ASSETS: { fetch: typeof fetch };
  };
};

/** Existing LingoLeaf build output — not a separate public route. */
const SPA_SHELL_PATH = "/lingoleaf/index.html";

export const onRequest = async (context: PagesContext) => {
  const staticResponse = await context.next();
  if (staticResponse.status !== 404) {
    return staticResponse;
  }

  const pathname = new URL(context.request.url).pathname;
  if (!pathname.startsWith("/lingoleaf/") || pathname.startsWith("/lingoleaf/api/")) {
    return staticResponse;
  }

  const shellUrl = new URL(SPA_SHELL_PATH, context.request.url);
  const shellResponse = await context.env.ASSETS.fetch(
    new Request(shellUrl, { redirect: "follow" }),
  );
  if (!shellResponse.ok) {
    return staticResponse;
  }

  const html = await shellResponse.text();
  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
};

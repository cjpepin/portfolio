type ContactPayload = {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  website?: string;
};

export const onRequestPost = async (context: {
  request: Request;
  env: {
    RESEND_API_KEY?: string;
    CONTACT_TO_EMAIL?: string;
    CONTACT_FROM_EMAIL?: string;
  };
}) => {
  const { request, env } = context;
  const apiKey = env.RESEND_API_KEY;
  const toEmail = env.CONTACT_TO_EMAIL ?? "cjpepin@wustl.edu";
  const fromEmail = env.CONTACT_FROM_EMAIL ?? "Portfolio Contact <onboarding@resend.dev>";

  const json = (data: unknown, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });

  const requestOrigin = new URL(request.url).origin;
  const headerOrigin = request.headers.get("Origin");

  if (headerOrigin) {
    try {
      if (new URL(headerOrigin).origin !== requestOrigin) {
        return json({ error: "Origin not allowed." }, 403);
      }
    } catch {
      return json({ error: "Origin not allowed." }, 403);
    }
  }

  if (!apiKey) {
    return json({ error: "Contact form is not configured." }, 500);
  }

  try {
    const body = (await request.json()) as ContactPayload;

    if (typeof body.website === "string" && body.website.trim()) {
      return json({ success: true });
    }

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const subject = (typeof body.subject === "string" ? body.subject.trim() : "") || "Portfolio contact";
    const message = typeof body.message === "string" ? body.message.trim() : "";

    if (!name || name.length > 100) {
      return json({ error: "Name is required and must be 100 characters or fewer." }, 400);
    }

    if (!email || email.length > 320 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({ error: "Enter a valid email address." }, 400);
    }

    if (subject.length > 140) {
      return json({ error: "Subject must be 140 characters or fewer." }, 400);
    }

    if (message.length < 10 || message.length > 4000) {
      return json({ error: "Message must be between 10 and 4000 characters." }, 400);
    }

    const escape = (s: string) =>
      s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
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
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        reply_to: email,
        subject: `[Portfolio] ${subject}`,
        html,
      }),
    });

    if (!resendResponse.ok) {
      console.error("Resend API error", { status: resendResponse.status });
      return json({ error: "Failed to send message. Please try again." }, 500);
    }

    return json({ success: true });
  } catch (error) {
    console.error("Contact form error", error);
    return json({ error: "Failed to send message. Please try again." }, 500);
  }
};

export const onRequestOptions = async () =>
  new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });

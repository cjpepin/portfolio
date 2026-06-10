import { profile } from "../../../data/profile";
import { ApiTryItPanel } from "../ApiTryItPanel";
import { SectionHeader } from "../SectionHeader";

type ContactPayload = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export function ContactSection() {
  const serverHint = {
    hint: "Submit the form to send a real request to POST /api/contact",
    contact: profile.info.contact.email,
  };

  return (
    <div className="stagger-children">
      <SectionHeader
        title="Contact"
        description="Submit a request body to reach Connor. Responses are returned as JSON — just like a real API."
      />

      <ApiTryItPanel
        method="POST"
        path="/api/contact"
        summary="Send a message via the contact endpoint"
        description="Required fields are validated server-side. A successful response returns { success: true }."
        contentType="application/json"
        initialResponse={serverHint}
        fields={[
          {
            name: "name",
            type: "string",
            description: "Your full name (max 100 chars)",
            required: true,
            placeholder: "Jane Doe",
          },
          {
            name: "email",
            type: "string",
            description: "Valid email for reply",
            required: true,
            placeholder: "you@example.com",
          },
          {
            name: "subject",
            type: "string",
            description: "Message subject (max 140 chars)",
            required: false,
            placeholder: "Project inquiry",
          },
          {
            name: "message",
            type: "string",
            description: "Message body (10–4000 chars)",
            required: true,
            multiline: true,
            placeholder: "Tell me about your project…",
          },
          {
            name: "website",
            type: "string",
            hidden: true,
          },
        ]}
        onExecute={async (values) => {
          const payload: ContactPayload = {
            name: values.name,
            email: values.email,
            subject: values.subject,
            message: values.message,
          };

          const res = await fetch("/api/contact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...payload, website: values.website ?? "" }),
          });

          const data = (await res.json()) as Record<string, unknown>;

          if (!res.ok) {
            return {
              status: res.status,
              ...data,
            };
          }

          return {
            status: res.status,
            ...data,
          };
        }}
      />
    </div>
  );
}

import { profile } from "../../../data/profile";
import { fetchResumeResponse } from "../../../lib/api/handlers";
import { ApiTryItPanel } from "../ApiTryItPanel";
import { ResumePdfMenu } from "../ResumePdfMenu";
import { SectionHeader } from "../SectionHeader";
import { useViewMode } from "../ViewModeContext";

function resumeDownloadFileName(name: string): string {
  return `${name.replace(/\s+/g, "_")}_Resume.pdf`;
}

function resumePdfViewerSrc(filePath: string): string {
  return `${filePath}#view=FitH&navpanes=0`;
}

function ResumePdfPanel() {
  const { resume, info } = profile;
  const downloadFileName = resumeDownloadFileName(info.contact.name);

  return (
    <section className="swagger-panel overflow-hidden" aria-label="Resume PDF">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-swagger-border px-4 py-3">
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold text-swagger-text">{info.contact.name} - Resume</h2>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="font-mono text-xs text-swagger-muted">Updated {resume.updatedAt}</span>
          <ResumePdfMenu
            pdfPath={resume.filePath}
            viewerPath={resumePdfViewerSrc(resume.filePath)}
            downloadFileName={downloadFileName}
          />
        </div>
      </div>
      <div className="relative">
        <iframe
          src={resumePdfViewerSrc(resume.filePath)}
          title={`${info.contact.name} resume`}
          className="h-[min(80vh,960px)] w-full border-0 bg-white"
        />
      </div>
    </section>
  );
}

function ResumePreview({ response }: { response: unknown }) {
  if (!response || typeof response !== "object") {
    return (
      <div className="flex min-h-[12rem] items-center justify-center p-6 text-center text-sm text-swagger-muted">
        No preview available for this response.
      </div>
    );
  }

  const record = response as Record<string, unknown>;
  const data = typeof record.data === "object" && record.data !== null ? (record.data as Record<string, unknown>) : null;
  if (!data) {
    return (
      <div className="flex min-h-[12rem] items-center justify-center p-6 text-center text-sm text-swagger-muted">
        No preview available for this response.
      </div>
    );
  }

  const filePath =
    typeof data.filePath === "string" ? data.filePath : profile.resume.filePath;
  const updatedAt =
    typeof data.updatedAt === "string" ? data.updatedAt : profile.resume.updatedAt;

  return (
    <div className="space-y-4 p-4">
      <div className="rounded border border-swagger-border bg-swagger-bg/60 p-4">
        <p className="font-mono text-xs uppercase text-swagger-muted">file path</p>
        <a
          href={filePath}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-block text-sm text-swagger-get hover:underline"
        >
          {filePath}
        </a>
        <p className="mt-3 font-mono text-xs uppercase text-swagger-muted">updated at</p>
        <p className="mt-1 text-sm text-swagger-text">{updatedAt}</p>
      </div>
    </div>
  );
}

export function ResumeSection() {
  const { isReadable } = useViewMode();

  if (isReadable) {
    return (
      <div className="stagger-children space-y-6">
        <SectionHeader title="Resume" description="PDF resume." />
        <ResumePdfPanel />
      </div>
    );
  }

  return (
    <div className="stagger-children space-y-4">
      <SectionHeader
        title="Resume"
        description="Fetch resume PDF metadata from a single endpoint."
      />
      <ResumePdfPanel />
      <ApiTryItPanel
        method="GET"
        path="/api/v1/resume"
        summary="Retrieve resume PDF metadata"
        description="Returns the public PDF file path and last-updated date."
        contentType="query parameters"
        fields={[]}
        onExecute={fetchResumeResponse}
        renderPreview={(response) => <ResumePreview response={response} />}
      />
    </div>
  );
}

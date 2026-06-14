import type { CaseStudyArchitectureStep } from "../../data/caseStudies";
import { MermaidDiagram } from "./MermaidDiagram";

type Props = {
  summary: string;
  steps: readonly CaseStudyArchitectureStep[];
  diagram: string;
};

export function ArchitectureSection({ summary, steps, diagram }: Props) {
  return (
    <section className="space-y-4">
      <h2 className="font-mono text-xs uppercase tracking-wide text-swagger-get">Architecture</h2>
      <p className="text-sm leading-relaxed text-swagger-muted">{summary}</p>

      <div className="grid gap-3 md:grid-cols-2">
        {steps.map((step, index) => (
          <div
            key={step.label}
            className="rounded-lg border border-swagger-border bg-swagger-bg/60 p-4"
          >
            <div className="mb-2 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-swagger-get/15 font-mono text-xs text-swagger-get">
                {index + 1}
              </span>
              <h3 className="font-medium text-swagger-text">{step.label}</h3>
            </div>
            <p className="text-sm text-swagger-muted">{step.detail}</p>
          </div>
        ))}
      </div>

      <div className="swagger-panel overflow-hidden">
        <div className="border-b border-swagger-border px-4 py-2">
          <span className="font-mono text-[10px] uppercase tracking-wide text-swagger-muted">
            Flow diagram
          </span>
        </div>
        <MermaidDiagram chart={diagram} />
      </div>
    </section>
  );
}

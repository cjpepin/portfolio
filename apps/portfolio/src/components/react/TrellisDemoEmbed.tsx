import { useTheme } from "./useTheme";

const demoBaseSrc = "/trellis/demo/embed/index.html";

const FRAME_HEIGHT = {
  compact: 640,
  featured: 720,
} as const;

type Props = {
  demoBuilt: boolean;
  variant?: keyof typeof FRAME_HEIGHT;
};

export function TrellisDemoEmbed({
  demoBuilt,
  variant = "compact",
}: Props) {
  const { theme } = useTheme();
  const frameHeight = FRAME_HEIGHT[variant];
  const demoSrc = `${demoBaseSrc}?theme=${theme}`;

  if (demoBuilt) {
    return (
      <div className="border-t border-swagger-border">
        <div className="border-b border-swagger-border bg-swagger-code px-4 py-2">
          <p className="font-mono text-xs text-swagger-muted">Trellis desktop preview</p>
        </div>
        <div
          className={`overflow-auto ${theme === "dark" ? "bg-[#0f1419]" : "bg-swagger-code"}`}
        >
          <iframe
            title="Trellis desktop preview"
            src={demoSrc}
            width={960}
            height={frameHeight}
            className="w-full max-w-full border-0"
            style={{ minHeight: frameHeight }}
            loading="lazy"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-swagger-border p-4">
      <p className="mb-3 text-sm text-swagger-muted">
        The Trellis demo bundle is not in this repo yet. Build from the Trellis subproject and run{" "}
        <code className="swagger-code">./scripts/sync-trellis-demo.sh</code> in{" "}
        <code className="swagger-code">apps/portfolio</code>.
      </p>
      <pre className="overflow-x-auto rounded bg-swagger-code p-3 font-mono text-xs leading-relaxed">
        {`cd projects/trellis
bash scripts/export-web-demo.sh

cd ../../apps/portfolio
./scripts/sync-trellis-demo.sh`}
      </pre>
    </div>
  );
}

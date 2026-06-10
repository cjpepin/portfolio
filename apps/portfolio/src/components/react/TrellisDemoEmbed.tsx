const demoSrc = "/trellis/demo/embed/index.html";

const DEMO_FRAME_WIDTH = 960;
const DEMO_FRAME_HEIGHT = 640;

type Props = {
  demoBuilt: boolean;
};

export function TrellisDemoEmbed({ demoBuilt }: Props) {
  if (demoBuilt) {
    return (
      <div className="overflow-auto border-t border-swagger-border bg-[#0f1419]">
        <iframe
          title="Trellis web demo"
          src={demoSrc}
          width={DEMO_FRAME_WIDTH}
          height={DEMO_FRAME_HEIGHT}
          className="w-full max-w-full border-0"
          style={{ minHeight: DEMO_FRAME_HEIGHT }}
          loading="lazy"
        />
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

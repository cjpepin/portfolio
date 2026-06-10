const demoSrc = "/lingoleaf/demo/embed/index.html";

/** Native iPhone 15 logical frame (393×852) plus minimal embed padding. */
const DEMO_FRAME_WIDTH = 425;
const DEMO_FRAME_HEIGHT = 876;

type Props = {
  demoBuilt: boolean;
};

export function LingoLeafDemoEmbed({ demoBuilt }: Props) {
  if (demoBuilt) {
    return (
      <div className="flex justify-center overflow-auto border-t border-swagger-border bg-[#E7ECE8]">
        <iframe
          title="LingoLeaf web demo"
          src={demoSrc}
          width={DEMO_FRAME_WIDTH}
          height={DEMO_FRAME_HEIGHT}
          className="shrink-0 border-0"
          style={{ minWidth: DEMO_FRAME_WIDTH, minHeight: DEMO_FRAME_HEIGHT }}
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div className="border-t border-swagger-border p-4">
      <p className="mb-3 text-sm text-swagger-muted">
        The demo bundle is not in this repo yet. Build from the LingoLeaf subproject and run{" "}
        <code className="swagger-code">./scripts/sync-lingoleaf-demo.sh</code> in{" "}
        <code className="swagger-code">apps/portfolio</code>.
      </p>
      <pre className="overflow-x-auto rounded bg-swagger-code p-3 font-mono text-xs leading-relaxed">
        {`cd projects/lingoleaf
npm run export:web-demo

cd ../../apps/portfolio
./scripts/sync-lingoleaf-demo.sh`}
      </pre>
    </div>
  );
}

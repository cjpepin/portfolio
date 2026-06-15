type Props = {
  visible: boolean;
  label?: string;
};

export function CopyTooltip({ visible, label = "Copied!" }: Props) {
  return (
    <div
      role="tooltip"
      aria-live="polite"
      className={`pointer-events-none absolute bottom-[calc(100%+0.5rem)] left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded border border-swagger-border bg-swagger-panel px-2.5 py-1.5 text-xs font-medium text-swagger-get shadow-lg transition-opacity duration-200 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      {label}
    </div>
  );
}

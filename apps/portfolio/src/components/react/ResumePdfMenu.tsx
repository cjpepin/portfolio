import { useEffect, useId, useRef, useState } from "react";
import { EllipsisIcon } from "./icons";

type Props = {
  pdfPath: string;
  viewerPath?: string;
  downloadFileName: string;
};

export function ResumePdfMenu({ pdfPath, viewerPath = pdfPath, downloadFileName }: Props) {
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex h-9 w-9 items-center justify-center rounded border border-swagger-border bg-swagger-panel text-swagger-muted transition-all duration-200 hover:border-swagger-get hover:text-swagger-get"
        aria-label="Resume actions"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        title="Resume actions"
      >
        <EllipsisIcon size={18} />
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          className="absolute right-0 top-[calc(100%+0.375rem)] z-20 min-w-[11rem] overflow-hidden rounded border border-swagger-border bg-swagger-panel py-1 shadow-lg animate-fade-in"
        >
          <a
            href={pdfPath}
            download={downloadFileName}
            role="menuitem"
            className="block px-3 py-2 text-sm text-swagger-text transition-colors duration-200 hover:bg-swagger-bg/70 hover:text-swagger-get"
            onClick={() => setOpen(false)}
          >
            Download
          </a>
          <a
            href={viewerPath}
            target="_blank"
            rel="noopener noreferrer"
            role="menuitem"
            className="block px-3 py-2 text-sm text-swagger-text transition-colors duration-200 hover:bg-swagger-bg/70 hover:text-swagger-get"
            onClick={() => setOpen(false)}
          >
            Open in a new tab
          </a>
        </div>
      )}
    </div>
  );
}

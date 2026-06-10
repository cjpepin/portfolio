import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { HttpMethod } from "../../data/profile";

export type PreviewPayload = {
  method: HttpMethod;
  path: string;
  content: ReactNode;
};

type PreviewPanelContextValue = {
  preview: PreviewPayload | null;
  publishPreview: (payload: PreviewPayload) => void;
  clearPreview: () => void;
};

const PreviewPanelContext = createContext<PreviewPanelContextValue | null>(null);

export function PreviewPanelProvider({ children }: { children: ReactNode }) {
  const [preview, setPreview] = useState<PreviewPayload | null>(null);

  const publishPreview = useCallback((payload: PreviewPayload) => {
    setPreview(payload);
  }, []);

  const clearPreview = useCallback(() => {
    setPreview(null);
  }, []);

  const value = useMemo(
    () => ({ preview, publishPreview, clearPreview }),
    [preview, publishPreview, clearPreview],
  );

  return <PreviewPanelContext.Provider value={value}>{children}</PreviewPanelContext.Provider>;
}

export function usePreviewPanel(): PreviewPanelContextValue {
  const ctx = useContext(PreviewPanelContext);
  if (!ctx) {
    throw new Error("usePreviewPanel must be used within PreviewPanelProvider");
  }
  return ctx;
}

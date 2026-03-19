'use client';

import React, { createContext, useContext, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import styles from "./bounceAnimationsProvider.module.css";

type BounceAnimationsContextValue = {
  enabled: boolean;
  setEnabled: React.Dispatch<React.SetStateAction<boolean>>;
};

const BounceAnimationsContext = createContext<BounceAnimationsContextValue | null>(null);

export function BounceAnimationsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [enabled, setEnabled] = useState(true);
  const pathname = usePathname();

  const value = useMemo(() => ({ enabled, setEnabled }), [enabled]);

  return (
    <BounceAnimationsContext.Provider value={value}>
      {children}
      {(pathname === "/" || pathname === "/experience") && (
        <button
          type="button"
          className={`${styles.switch} ${enabled ? styles.switchOn : styles.switchOff}`}
          onClick={() => setEnabled((current) => !current)}
          aria-pressed={!enabled}
          aria-label={enabled ? "Turn off bounce animations" : "Turn on bounce animations"}
          title="kill bounciness"
        >
          <span className={styles.track}>
            <span className={styles.thumb} />
          </span>
          <span className={styles.tooltip} role="tooltip">
            kill bounciness
          </span>
        </button>
      )}
    </BounceAnimationsContext.Provider>
  );
}

export function useBounceAnimations() {
  const context = useContext(BounceAnimationsContext);

  if (!context) {
    throw new Error("useBounceAnimations must be used within BounceAnimationsProvider");
  }

  return context;
}

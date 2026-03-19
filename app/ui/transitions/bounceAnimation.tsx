// BounceAnimation.tsx
'use client';

import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { motion, useAnimationControls } from "framer-motion";
import { useBounceAnimations } from "../bounceAnimationsProvider";

const BounceAnimation = ({
    children,
    className,
    isBouncing,
    setIsBouncing,
}: {
    children: React.ReactNode;
    className?: string;
    isBouncing: boolean;
    setIsBouncing: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
    const { enabled } = useBounceAnimations();

    const controls = useAnimationControls();
    const isMounted = useRef(false);
    const previousIsBouncing = useRef(isBouncing);
    const runId = useRef(0);

    const bounceAnimation = useMemo(() => ({
        y: [0, -32, 0, -16, 0, -8, 0, -4, 0, -2, 0],
        transition: {
            duration: 0.95,
            times: [0, 0.12, 0.24, 0.38, 0.5, 0.62, 0.72, 0.82, 0.9, 0.96, 1],
            ease: [
                "easeOut",
                "easeIn",
                "easeOut",
                "easeIn",
                "easeOut",
                "easeIn",
                "easeOut",
                "easeIn",
                "easeOut",
                "easeIn",
            ],
        },
    }), []);

    const playBounce = useCallback(async (shouldResetExternalState: boolean) => {
        if (!isMounted.current) {
            return;
        }

        if (!enabled) {
            if (shouldResetExternalState) {
                setIsBouncing(false);
            }
            return;
        }

        const currentRunId = ++runId.current;

        controls.stop();
        controls.set({ y: 0 });
        await controls.start(bounceAnimation);

        if (runId.current === currentRunId && shouldResetExternalState) {
            setIsBouncing(false);
        }
    }, [bounceAnimation, controls, enabled, setIsBouncing]);

    useEffect(() => {
        isMounted.current = true;

        return () => {
            isMounted.current = false;
        };
    }, []);

    useEffect(() => {
        if (isBouncing && !previousIsBouncing.current) {
            void playBounce(true);
        }

        previousIsBouncing.current = isBouncing;
    }, [isBouncing, playBounce]);

    if (!enabled) {
        return <div className={className}>{children}</div>;
    }

    return (
        <motion.div
            className={className}
            initial={{ y: 0 }}
            animate={controls}
            onHoverStart={() => {
                void playBounce(isBouncing);
            }}
        >
            {children}
        </motion.div>
    );
};

export default BounceAnimation;

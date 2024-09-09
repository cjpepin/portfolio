// BounceAnimation.tsx
'use client';

import React, { useState } from "react";
import { motion } from "framer-motion";

const BounceAnimation = ({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) => {
    const [isBouncing, setIsBouncing] = useState<boolean>(false);

    const bounceVariant = {
        bounce: {
            y: [0, -25, 0], 
            transition: {
                duration: 0.4,
            },
        }
    };

    return (
        <motion.div
            className={className}
            variants={bounceVariant}
            animate={isBouncing ? "bounce" : ""} // Trigger bounce animation based on state
            onHoverStart={() => setIsBouncing(true)} // Start bounce when hovered
            onAnimationComplete={() => setIsBouncing(false)} // Reset bounce state when animation completes
        >
            {children}
        </motion.div>
    );
};

export default BounceAnimation;

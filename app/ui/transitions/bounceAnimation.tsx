// BounceAnimation.tsx
'use client';

import React, { useState } from "react";
import { motion } from "framer-motion";

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

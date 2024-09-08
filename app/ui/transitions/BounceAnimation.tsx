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
    const [isBouncing, setIsBouncing] = useState<boolean>(false); // State to manage bounce effect

    // Animation variant for the bounce effect
    const bounceVariant = {
        bounce: {
            y: [0, -40, 0, -20, 0, -10, 0, -5, 0, -2, 0, -1, 0], // Defines a series of bounces, getting smaller each time
            transition: {
                duration: 1.25, // Duration of the bounce effect
                ease: [0.0, -0.0, 0.0, 0], // Custom easing for a snappy bounce resembling impact
                times: [0, 0.3, 0.5, 0.8, 1], // Adjust timing to emphasize the first impact
            },
        }
    };

    // const bounceVariant = {
    //     hover: {
    //         y: [0, -40, 0, -20, 0, -10, 0, -5, 0, -2, 0, -1, 0], // Defines a series of bounces, getting smaller each time
    //     transition: {
    //         duration: 1.25, // Shorter duration for a sharper, more immediate bounce effect
    //         ease: [0.0, -0.0, 0.0, 0], // Custom easing for a snappy bounce resembling impact
    //         times: [0, 0.3, 0.5, 0.8, 1], // Adjust timing to emphasize the first impact
    //         }
    //     }
    // };

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

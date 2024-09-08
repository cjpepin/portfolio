'use client';

import { motion } from "framer-motion";

const ShiftFromRightAnimation = ({
    children,
}: {
    children: React.ReactNode;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 1500 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 1500 }}
      transition={{ 
        duration: 0.25, 
        ease: "linear", 
      }}
    >
        {children}
    </motion.div>
  );
}

export default ShiftFromRightAnimation;
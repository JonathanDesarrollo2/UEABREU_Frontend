import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface AnimatedPageProps {
  children: ReactNode;
  className?: string;
}

export default function AnimatedPage ({ children, className }: AnimatedPageProps) {
  return (
    <motion.div
      initial={{ 
        opacity: 0,
        scale: 0.95 
      }}
      animate={{ 
        opacity: 1,
        scale: 1 
      }}
      exit={{ 
        opacity: 0,
        scale: 0.9 
      }}
      transition={{
        delay: 0.3,
        duration: 0.9,
        ease: [0.17, 0.67, 0.83, 0.67],
        scale: {
          type: "spring",
          stiffness: 100,
          damping: 15
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
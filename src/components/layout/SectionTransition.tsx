import { motion, useInView } from "framer-motion";
import { ReactNode, useRef } from "react";

interface SectionTransitionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
}

const directionVariants = {
  up: { y: 60, x: 0 },
  down: { y: -60, x: 0 },
  left: { y: 0, x: 60 },
  right: { y: 0, x: -60 },
};

export function SectionTransition({ 
  children, 
  className = "",
  delay = 0,
  direction = "up"
}: SectionTransitionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const initialPosition = directionVariants[direction];

  return (
    <motion.div
      ref={ref}
      initial={{ 
        opacity: 0, 
        ...initialPosition,
        filter: "blur(10px)"
      }}
      animate={isInView ? { 
        opacity: 1, 
        y: 0, 
        x: 0,
        filter: "blur(0px)"
      } : {}}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

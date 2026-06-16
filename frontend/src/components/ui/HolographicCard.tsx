import React, { useRef, memo } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

interface HolographicCardProps {
  children: React.ReactNode;
  className?: string;
}

const HolographicCard: React.FC<HolographicCardProps> = ({ children, className }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Use lower spring mass for faster, crispier feedback
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["8deg", "-8deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-8deg", "8deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    
    const width = rect.width;
    const height = rect.height;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Throttled update conceptually - motion values handle it well
    x.set(mouseX / width - 0.5);
    y.set(mouseY / height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div 
      className="perspective-1000 w-full h-full"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        ref={cardRef}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className={cn(
          "relative w-full h-full rounded-[48px] bg-white/[0.02] border border-white/10 backdrop-blur-3xl shadow-2xl transition-all duration-300",
          className
        )}
      >
        {/* Prismatic Light Reflection - Optimized with useTransform */}
        <motion.div 
            style={{
                background: useTransform(
                    [mouseXSpring, mouseYSpring],
                    ([mx, my]) => `radial-gradient(circle at ${mx * 100 + 50}% ${my * 100 + 50}%, rgba(99, 102, 241, 0.12) 0%, transparent 65%)`
                )
            }}
            className="absolute inset-0 rounded-[48px] pointer-events-none z-0"
        />

        <div className="relative z-10 w-full h-full" style={{ transform: "translateZ(40px)" }}>
            {children}
        </div>

        {/* Outer Glow - Performance: using opacity instead of complex filters where possible */}
        <div className="absolute -inset-1 bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 rounded-[50px] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </motion.div>
    </div>
  );
};

export default memo(HolographicCard);

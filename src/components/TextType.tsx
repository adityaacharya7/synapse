import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

export interface TextSegment {
  text: string;
  className?: string;
}

interface TextTypeProps {
  segments: (string | TextSegment)[];
  speed?: number; 
  delay?: number; 
  className?: string;
  showCursor?: boolean;
}

const TextType: React.FC<TextTypeProps> = ({
  segments,
  speed = 20, 
  delay = 0,
  className = '',
  showCursor = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "0px" });

  const mappedCharacters = segments.flatMap((segment) => {
    const textData = typeof segment === 'string' ? segment : segment.text;
    const segmentClass = typeof segment === 'string' ? '' : (segment.className || '');
    
    return textData.split('').map((char) => ({
      char,
      className: segmentClass,
    }));
  });

  const parentVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: speed / 1000,
        delayChildren: delay / 1000,
      },
    },
  };

  // We use max opacity instead of block to avoid layout reflows jumping wildly
  const childVariants = {
    hidden: { opacity: 0, display: "none" },
    visible: { opacity: 1, display: "inline" },
  };

  return (
    <div ref={containerRef} className={`${className} whitespace-pre-wrap leading-relaxed inline`}>
      <motion.div
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={parentVariants}
        className="inline"
      >
        {mappedCharacters.map((item, i) => (
          <motion.span
            key={i}
            variants={childVariants}
            className={item.className}
          >
            {item.char}
          </motion.span>
        ))}
        
        {showCursor && (
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
            className="inline-block w-[2px] h-[1em] bg-purple-400 ml-1 align-middle"
          />
        )}
      </motion.div>
    </div>
  );
};

export default TextType;

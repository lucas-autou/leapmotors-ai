import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface AvatarProps {
  isSpeaking: boolean;
  emotion?: 'neutral' | 'happy' | 'thinking';
}

export const Avatar: React.FC<AvatarProps> = ({ isSpeaking, emotion = 'neutral' }) => {
  const [blinkAnimation, setBlinkAnimation] = useState(false);

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlinkAnimation(true);
      setTimeout(() => setBlinkAnimation(false), 150);
    }, 3000 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, []);

  const mouthVariants = {
    closed: { d: "M 35 60 Q 50 65 65 60" },
    open: { d: "M 35 60 Q 50 70 65 60" },
    smile: { d: "M 35 58 Q 50 68 65 58" }
  };

  const eyeVariants = {
    open: { scaleY: 1 },
    closed: { scaleY: 0.1 }
  };

  return (
    <div className="relative w-48 h-48 mx-auto">
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-leap-green-400 to-leap-green-600 rounded-full"
        animate={{
          scale: isSpeaking ? [1, 1.05, 1] : 1,
        }}
        transition={{
          duration: 0.5,
          repeat: isSpeaking ? Infinity : 0,
          ease: "easeInOut"
        }}
      />
      
      <svg
        viewBox="0 0 100 100"
        className="relative z-10 w-full h-full"
      >
        {/* Face */}
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="#fdbcb4"
          stroke="#00B74F"
          strokeWidth="2"
        />
        
        {/* Eyes */}
        <motion.ellipse
          cx="35"
          cy="40"
          rx="8"
          ry="10"
          fill="#333"
          animate={blinkAnimation ? "closed" : "open"}
          variants={eyeVariants}
          transition={{ duration: 0.1 }}
        />
        <motion.ellipse
          cx="65"
          cy="40"
          rx="8"
          ry="10"
          fill="#333"
          animate={blinkAnimation ? "closed" : "open"}
          variants={eyeVariants}
          transition={{ duration: 0.1 }}
        />
        
        {/* Eye sparkles */}
        <circle cx="37" cy="38" r="2" fill="white" opacity="0.8" />
        <circle cx="67" cy="38" r="2" fill="white" opacity="0.8" />
        
        {/* Eyebrows */}
        <motion.path
          d={emotion === 'thinking' ? "M 25 32 Q 35 28 42 32" : "M 25 35 Q 35 32 42 35"}
          stroke="#333"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        <motion.path
          d={emotion === 'thinking' ? "M 58 32 Q 65 28 75 32" : "M 58 35 Q 65 32 75 35"}
          stroke="#333"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        
        {/* Nose */}
        <path
          d="M 50 45 L 48 52 L 52 52 Z"
          fill="#f4a09c"
        />
        
        {/* Mouth */}
        <motion.path
          animate={isSpeaking ? ["open", "closed"] : emotion === 'happy' ? "smile" : "closed"}
          variants={mouthVariants}
          transition={{
            duration: 0.2,
            repeat: isSpeaking ? Infinity : 0,
            repeatType: "reverse"
          }}
          stroke="#333"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        
        {/* Hair */}
        <path
          d="M 20 35 Q 30 20, 50 22 T 80 35 L 75 30 Q 65 15, 50 18 Q 35 15, 25 30 Z"
          fill="#4a4a4a"
        />
      </svg>
      
      {/* Status indicator */}
      <motion.div
        className={`absolute bottom-0 right-0 w-4 h-4 rounded-full ${
          isSpeaking ? 'bg-green-500' : 'bg-gray-400'
        }`}
        animate={isSpeaking ? { scale: [1, 1.2, 1] } : {}}
        transition={{
          duration: 0.5,
          repeat: isSpeaking ? Infinity : 0,
        }}
      />
    </div>
  );
};
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export type AvatarEmotion = 'neutral' | 'happy' | 'thinking' | 'excited' | 'curious' | 'concerned' | 'welcoming';

interface AvatarProps {
  isSpeaking: boolean;
  emotion?: AvatarEmotion;
  isListening?: boolean;
  isIdle?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({ 
  isSpeaking, 
  emotion = 'neutral', 
  isListening = false,
  isIdle = true 
}) => {
  const [blinkAnimation, setBlinkAnimation] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState(0);
  const [idleMovement, setIdleMovement] = useState({ x: 0, y: 0 });

  // Sistema de piscadas mais natural
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      if (!isSpeaking) { // Não piscar enquanto fala
        setBlinkAnimation(true);
        setTimeout(() => setBlinkAnimation(false), 120 + Math.random() * 80);
      }
    }, 2000 + Math.random() * 4000); // Intervalo mais variável

    return () => clearInterval(blinkInterval);
  }, [isSpeaking]);

  // Sistema de respiração
  useEffect(() => {
    const breathingInterval = setInterval(() => {
      setBreathingPhase(prev => (prev + 1) % 360);
    }, 50); // 50ms para animação suave

    return () => clearInterval(breathingInterval);
  }, []);

  // Micro-movimentos idle
  useEffect(() => {
    if (!isIdle || isSpeaking || isListening) return;
    
    const moveInterval = setInterval(() => {
      setIdleMovement({
        x: (Math.random() - 0.5) * 2,
        y: (Math.random() - 0.5) * 1
      });
    }, 5000 + Math.random() * 10000);

    return () => clearInterval(moveInterval);
  }, [isIdle, isSpeaking, isListening]);

  const mouthVariants = {
    closed: { d: "M 35 60 Q 50 65 65 60" },
    open: { d: "M 35 60 Q 50 70 65 60" },
    smile: { d: "M 35 58 Q 50 68 65 58" },
    excited: { d: "M 32 56 Q 50 72 68 56" },
    concerned: { d: "M 38 62 Q 50 67 62 62" },
    thinking: { d: "M 40 60 Q 50 63 60 60" },
    welcoming: { d: "M 30 57 Q 50 70 70 57" }
  };

  const eyeVariants = {
    open: { scaleY: 1, scaleX: 1 },
    closed: { scaleY: 0.1, scaleX: 1 },
    wide: { scaleY: 1.2, scaleX: 1.1 }, // Para excited/curious
    squint: { scaleY: 0.7, scaleX: 0.9 }, // Para thinking/concerned
    gentle: { scaleY: 0.9, scaleX: 1 } // Para welcoming/happy
  };

  const eyebrowVariants = {
    neutral: { d: "M 25 35 Q 35 32 42 35" },
    raised: { d: "M 25 32 Q 35 29 42 32" }, // Curious/excited
    furrowed: { d: "M 25 37 Q 35 34 42 37" }, // Concerned/thinking
    gentle: { d: "M 25 34 Q 35 31 42 34" } // Happy/welcoming
  };

  // Funções para determinar expressões baseadas na emoção
  const getMouthState = () => {
    if (isSpeaking) return ['open', 'closed'];
    
    switch (emotion) {
      case 'happy':
      case 'welcoming':
        return 'welcoming';
      case 'excited':
        return 'excited';
      case 'concerned':
        return 'concerned';
      case 'thinking':
        return 'thinking';
      case 'curious':
        return 'smile';
      default:
        return 'closed';
    }
  };

  const getEyeState = () => {
    if (blinkAnimation) return 'closed';
    
    switch (emotion) {
      case 'excited':
      case 'curious':
        return 'wide';
      case 'thinking':
      case 'concerned':
        return 'squint';
      case 'happy':
      case 'welcoming':
        return 'gentle';
      default:
        return 'open';
    }
  };

  const getEyebrowState = () => {
    switch (emotion) {
      case 'curious':
      case 'excited':
        return 'raised';
      case 'thinking':
      case 'concerned':
        return 'furrowed';
      case 'happy':
      case 'welcoming':
        return 'gentle';
      default:
        return 'neutral';
    }
  };

  const getAvatarColor = () => {
    switch (emotion) {
      case 'excited':
        return { from: '#10b981', to: '#059669' }; // Verde mais vibrante
      case 'curious':
        return { from: '#3b82f6', to: '#1d4ed8' }; // Azul
      case 'concerned':
        return { from: '#f59e0b', to: '#d97706' }; // Amarelo/laranja
      case 'welcoming':
        return { from: '#10b981', to: '#047857' }; // Verde caloroso
      default:
        return { from: '#10b981', to: '#059669' }; // Verde padrão Leapmotor
    }
  };

  // Calcular animação de respiração
  const breathingScale = 1 + Math.sin(breathingPhase * Math.PI / 180) * 0.02;

  const avatarColors = getAvatarColor();

  return (
    <div className="relative w-48 h-48 mx-auto">
      {/* Avatar background com cores dinâmicas e respiração */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: `linear-gradient(135deg, ${avatarColors.from}, ${avatarColors.to})`
        }}
        animate={{
          scale: isSpeaking ? [1, 1.08, 1] : breathingScale,
          x: isIdle ? idleMovement.x : 0,
          y: isIdle ? idleMovement.y : 0,
        }}
        transition={{
          duration: isSpeaking ? 0.4 : 3,
          repeat: isSpeaking ? Infinity : 0,
          ease: isSpeaking ? "easeInOut" : "easeInOut"
        }}
      />

      {/* Indicador de listening com pulso */}
      {isListening && (
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-blue-400"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.3, 0.8, 0.3]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
      
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
        
        {/* Eyes with dynamic expressions */}
        <motion.ellipse
          cx="35"
          cy="40"
          rx="8"
          ry="10"
          fill="#333"
          animate={getEyeState()}
          variants={eyeVariants}
          transition={{ duration: 0.15, ease: "easeOut" }}
        />
        <motion.ellipse
          cx="65"
          cy="40"
          rx="8"
          ry="10"
          fill="#333"
          animate={getEyeState()}
          variants={eyeVariants}
          transition={{ duration: 0.15, ease: "easeOut" }}
        />
        
        {/* Eye sparkles dinâmicos */}
        <motion.circle 
          cx="37" 
          cy="38" 
          r="2" 
          fill="white" 
          animate={{ 
            opacity: emotion === 'excited' || emotion === 'curious' ? [0.6, 1, 0.6] : 0.8,
            scale: emotion === 'excited' ? [1, 1.2, 1] : 1
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.circle 
          cx="67" 
          cy="38" 
          r="2" 
          fill="white" 
          animate={{ 
            opacity: emotion === 'excited' || emotion === 'curious' ? [0.6, 1, 0.6] : 0.8,
            scale: emotion === 'excited' ? [1, 1.2, 1] : 1
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        
        {/* Eyebrows dinâmicas */}
        <motion.path
          animate={getEyebrowState()}
          variants={eyebrowVariants}
          stroke="#333"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
        <motion.path
          d={eyebrowVariants[getEyebrowState() as keyof typeof eyebrowVariants].d.replace('25', '58').replace('35', '65').replace('42', '75')}
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
        
        {/* Mouth with lip-sync simulation */}
        <motion.path
          animate={getMouthState()}
          variants={mouthVariants}
          transition={{
            duration: isSpeaking ? 0.15 : 0.3,
            repeat: isSpeaking ? Infinity : 0,
            repeatType: isSpeaking ? "reverse" : "loop",
            ease: "easeInOut"
          }}
          stroke="#333"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />

        {/* Cheek blush for positive emotions */}
        {(emotion === 'happy' || emotion === 'welcoming' || emotion === 'excited') && (
          <>
            <motion.ellipse
              cx="25"
              cy="48"
              rx="4"
              ry="3"
              fill="#ff9999"
              opacity="0.3"
              animate={{
                opacity: [0.2, 0.4, 0.2],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <motion.ellipse
              cx="75"
              cy="48"
              rx="4"
              ry="3"
              fill="#ff9999"
              opacity="0.3"
              animate={{
                opacity: [0.2, 0.4, 0.2],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </>
        )}
        
        {/* Hair */}
        <path
          d="M 20 35 Q 30 20, 50 22 T 80 35 L 75 30 Q 65 15, 50 18 Q 35 15, 25 30 Z"
          fill="#4a4a4a"
        />
      </svg>
      
      {/* Status indicator dinâmico */}
      <motion.div
        className={`absolute bottom-0 right-0 w-4 h-4 rounded-full ${
          isSpeaking ? 'bg-green-500' : 
          isListening ? 'bg-blue-500' :
          emotion === 'excited' ? 'bg-yellow-500' :
          emotion === 'concerned' ? 'bg-orange-500' :
          'bg-green-400'
        }`}
        animate={
          isSpeaking ? { scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] } : 
          isListening ? { scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] } :
          { scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }
        }
        transition={{
          duration: isSpeaking ? 0.3 : isListening ? 0.5 : 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Pensando indicator */}
      {emotion === 'thinking' && (
        <motion.div
          className="absolute top-2 right-2 flex space-x-1"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-gray-500 rounded-full"
              animate={{
                y: [0, -8, 0],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut"
              }}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
};
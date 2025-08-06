import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export type AvatarEmotion = 
  | 'welcoming' | 'professional' | 'curious' | 'excited' 
  | 'thinking' | 'concerned' | 'happy' | 'confident' 
  | 'empathetic' | 'processing' | 'surprised' | 'satisfied' | 'neutral';

interface AvatarProps {
  isSpeaking: boolean;
  emotion?: AvatarEmotion;
  isListening?: boolean;
  isIdle?: boolean;
  size?: 'normal' | 'large' | 'hero';
}

export const Avatar: React.FC<AvatarProps> = ({ 
  isSpeaking, 
  emotion = 'neutral', 
  isListening = false,
  isIdle = true,
  size = 'normal'
}) => {
  const [blinkAnimation, setBlinkAnimation] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState(0);
  const [idleMovement, setIdleMovement] = useState({ x: 0, y: 0 });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [eyeTrackingEnabled, setEyeTrackingEnabled] = useState(false);

  // Sistema de piscadas ultra-natural
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      if (!isSpeaking) {
        setBlinkAnimation(true);
        setTimeout(() => setBlinkAnimation(false), 150 + Math.random() * 100);
      }
    }, 1500 + Math.random() * 5000);

    return () => clearInterval(blinkInterval);
  }, [isSpeaking]);

  // Sistema de respiração realista
  useEffect(() => {
    const breathingInterval = setInterval(() => {
      setBreathingPhase(prev => (prev + 0.8) % 360);
    }, 30);

    return () => clearInterval(breathingInterval);
  }, []);

  // Micro-movimentos naturais
  useEffect(() => {
    if (!isIdle || isSpeaking || isListening) return;
    
    const moveInterval = setInterval(() => {
      setIdleMovement({
        x: (Math.random() - 0.5) * 1.5,
        y: (Math.random() - 0.5) * 0.8
      });
    }, 6000 + Math.random() * 8000);

    return () => clearInterval(moveInterval);
  }, [isIdle, isSpeaking, isListening]);

  // Eye tracking para interação premium
  useEffect(() => {
    if (!isIdle || !eyeTrackingEnabled) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = document.querySelector('.avatar-container')?.getBoundingClientRect();
      if (rect) {
        setMousePosition({
          x: (e.clientX - rect.left - rect.width / 2) / rect.width,
          y: (e.clientY - rect.top - rect.height / 2) / rect.height
        });
      }
    };

    const enableEyeTracking = () => setEyeTrackingEnabled(true);
    const disableEyeTracking = () => setEyeTrackingEnabled(false);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseenter', enableEyeTracking);
    document.addEventListener('mouseleave', disableEyeTracking);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseenter', enableEyeTracking);
      document.removeEventListener('mouseleave', disableEyeTracking);
    };
  }, [isIdle]);

  // Expressões de boca ultra-realistas
  const mouthVariants = {
    closed: { d: "M 38 62 Q 50 64 62 62" },
    open: { d: "M 38 62 Q 50 69 62 62" },
    smile: { d: "M 36 60 Q 50 67 64 60" },
    wide_smile: { d: "M 34 58 Q 50 69 66 58" },
    excited_open: { d: "M 35 59 Q 50 72 65 59" },
    concerned: { d: "M 40 63 Q 50 66 60 63" },
    thinking: { d: "M 42 62 Q 50 64 58 62" },
    welcoming: { d: "M 32 59 Q 50 68 68 59" },
    confident: { d: "M 37 61 Q 50 66 63 61" },
    empathetic: { d: "M 39 61 Q 50 65 61 61" },
    surprised: { d: "M 42 61 Q 50 67 58 61" },
    satisfied: { d: "M 36 60 Q 50 66 64 60" },
    professional: { d: "M 40 62 Q 50 65 60 62" }
  };

  // Olhos mais expressivos com tracking
  const eyeVariants = {
    open: { scaleY: 1, scaleX: 1, x: 0, y: 0 },
    closed: { scaleY: 0.1, scaleX: 1, x: 0, y: 0 },
    wide: { scaleY: 1.3, scaleX: 1.2, x: 0, y: 0 },
    squint: { scaleY: 0.6, scaleX: 0.95, x: 0, y: 0 },
    gentle: { scaleY: 0.85, scaleX: 1, x: 0, y: 0 },
    surprised: { scaleY: 1.4, scaleX: 1.3, x: 0, y: 0 },
    confident: { scaleY: 0.9, scaleX: 1.05, x: 0, y: 0 },
    tracking: { 
      scaleY: 1, 
      scaleX: 1, 
      x: eyeTrackingEnabled ? mousePosition.x * 2 : 0, 
      y: eyeTrackingEnabled ? mousePosition.y * 1.5 : 0 
    }
  };

  // Sobrancelhas com expressões naturais
  const eyebrowVariants = {
    neutral: { d: "M 23 33 Q 35 30 45 33", y: 0 },
    raised: { d: "M 23 30 Q 35 27 45 30", y: -1 },
    furrowed: { d: "M 23 35 Q 35 32 45 35", y: 1 },
    gentle: { d: "M 23 32 Q 35 29 45 32", y: -0.5 },
    surprised: { d: "M 23 28 Q 35 25 45 28", y: -2 },
    confident: { d: "M 23 31 Q 35 28 45 31", y: -0.3 },
    concerned: { d: "M 23 36 Q 35 33 45 36", y: 1.5 },
    thinking: { d: "M 23 34 Q 35 31 45 34", y: 0.5 }
  };

  // Mapeamento inteligente de emoções para expressões
  const getMouthState = () => {
    if (isSpeaking) return ['open', 'closed'];
    
    switch (emotion) {
      case 'welcoming': return 'welcoming';
      case 'professional': return 'professional';
      case 'curious': return 'smile';
      case 'excited': return 'excited_open';
      case 'thinking': return 'thinking';
      case 'concerned': return 'concerned';
      case 'happy': return 'wide_smile';
      case 'confident': return 'confident';
      case 'empathetic': return 'empathetic';
      case 'processing': return 'thinking';
      case 'surprised': return 'surprised';
      case 'satisfied': return 'satisfied';
      case 'neutral':
      default:
        return 'closed';
    }
  };

  const getEyeState = () => {
    if (blinkAnimation) return 'closed';
    if (eyeTrackingEnabled && isIdle) return 'tracking';
    
    switch (emotion) {
      case 'excited':
      case 'surprised':
        return 'wide';
      case 'curious':
        return 'wide';
      case 'thinking':
      case 'processing':
        return 'squint';
      case 'concerned':
        return 'squint';
      case 'happy':
      case 'welcoming':
      case 'satisfied':
        return 'gentle';
      case 'confident':
      case 'professional':
        return 'confident';
      case 'empathetic':
        return 'gentle';
      case 'neutral':
      default:
        return 'open';
    }
  };

  const getEyebrowState = () => {
    switch (emotion) {
      case 'curious':
      case 'surprised':
        return 'raised';
      case 'excited':
        return 'raised';
      case 'thinking':
      case 'processing':
        return 'thinking';
      case 'concerned':
        return 'concerned';
      case 'happy':
      case 'welcoming':
      case 'satisfied':
        return 'gentle';
      case 'confident':
      case 'professional':
        return 'confident';
      case 'empathetic':
        return 'gentle';
      case 'neutral':
      default:
        return 'neutral';
    }
  };

  // Paleta de cores premium baseada em emoções
  const getAvatarColor = () => {
    switch (emotion) {
      case 'welcoming':
        return { from: '#00B74F', to: '#00a347', glow: '#00B74F40' };
      case 'professional':
        return { from: '#1e40af', to: '#1e3a8a', glow: '#3b82f640' };
      case 'curious':
        return { from: '#06b6d4', to: '#0891b2', glow: '#06b6d440' };
      case 'excited':
        return { from: '#f59e0b', to: '#d97706', glow: '#f59e0b40' };
      case 'thinking':
      case 'processing':
        return { from: '#8b5cf6', to: '#7c3aed', glow: '#8b5cf640' };
      case 'concerned':
        return { from: '#ef4444', to: '#dc2626', glow: '#ef444440' };
      case 'happy':
      case 'satisfied':
        return { from: '#10b981', to: '#059669', glow: '#10b98140' };
      case 'confident':
        return { from: '#0f172a', to: '#1e293b', glow: '#64748b40' };
      case 'empathetic':
        return { from: '#ec4899', to: '#db2777', glow: '#ec489940' };
      case 'surprised':
        return { from: '#eab308', to: '#ca8a04', glow: '#eab30840' };
      case 'neutral':
      default:
        return { from: '#00B74F', to: '#00a347', glow: '#00B74F30' };
    }
  };

  // Calcular animação de respiração realista
  const breathingScale = 1 + Math.sin(breathingPhase * Math.PI / 180) * 0.015;
  const shoulderBreathing = Math.sin(breathingPhase * Math.PI / 180) * 0.5;

  // Determinar tamanho do avatar
  const getAvatarSize = () => {
    switch (size) {
      case 'hero': return { width: 'w-96', height: 'h-96', size: 400 };
      case 'large': return { width: 'w-64', height: 'h-64', size: 256 };
      case 'normal':
      default: return { width: 'w-48', height: 'h-48', size: 192 };
    }
  };

  const avatarSize = getAvatarSize();
  const avatarColors = getAvatarColor();

  return (
    <div className={`relative ${avatarSize.width} ${avatarSize.height} mx-auto avatar-container`}>
      {/* Glow effect premium */}
      <motion.div
        className="absolute inset-0 rounded-full blur-2xl"
        style={{
          background: avatarColors.glow,
          transform: 'scale(1.2)'
        }}
        animate={{
          opacity: isSpeaking ? [0.4, 0.8, 0.4] : isListening ? [0.2, 0.6, 0.2] : 0.3,
          scale: isSpeaking ? [1.2, 1.4, 1.2] : [1.2, 1.3, 1.2],
        }}
        transition={{
          duration: isSpeaking ? 0.6 : 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Avatar background premium com gradiente */}
      <motion.div
        className="absolute inset-0 rounded-full shadow-2xl ring-2 ring-white/20"
        style={{
          background: `linear-gradient(145deg, ${avatarColors.from}, ${avatarColors.to})`,
          boxShadow: `0 20px 40px -10px ${avatarColors.glow}, inset 0 1px 2px rgba(255,255,255,0.3)`
        }}
        animate={{
          scale: isSpeaking ? [1, 1.05, 1] : breathingScale,
          x: isIdle ? idleMovement.x : 0,
          y: isIdle ? idleMovement.y : 0,
        }}
        transition={{
          duration: isSpeaking ? 0.4 : 4,
          repeat: isSpeaking ? Infinity : 0,
          ease: "easeInOut"
        }}
      />

      {/* Partículas flutuantes para emoções específicas */}
      {(emotion === 'excited' || emotion === 'happy' || emotion === 'surprised') && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/60 rounded-full"
              style={{
                left: `${20 + i * 12}%`,
                top: `${15 + (i % 3) * 25}%`,
              }}
              animate={{
                y: [-20, -40, -20],
                opacity: [0, 1, 0],
                scale: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2 + i * 0.3,
                repeat: Infinity,
                delay: i * 0.4,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      )}

      {/* Ondas sonoras durante listening */}
      {isListening && (
        <>
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-full border-2 border-cyan-400/40"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0, 0.6, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.5,
                ease: "easeOut"
              }}
            />
          ))}
        </>
      )}

      {/* Voice waves durante speaking */}
      {isSpeaking && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-1 bg-white/30 rounded-full"
              style={{
                width: `${20 + i * 15}%`,
                left: '50%',
                transform: 'translateX(-50%)',
                top: `${45 + i * 3}%`
              }}
              animate={{
                scaleX: [0.5, 1.5, 0.5],
                opacity: [0.2, 0.8, 0.2],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.1,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      )}
      
      <svg
        viewBox="0 0 100 100"
        className="relative z-10 w-full h-full"
      >
        {/* Definir gradientes e filtros premium */}
        <defs>
          <radialGradient id="faceGradient" cx="0.3" cy="0.3">
            <stop offset="0%" stopColor="#ffd0c4" />
            <stop offset="50%" stopColor="#fdbcb4" />
            <stop offset="100%" stopColor="#f4a09c" />
          </radialGradient>
          <linearGradient id="hairGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#8B4513" />
            <stop offset="30%" stopColor="#D2B48C" />
            <stop offset="100%" stopColor="#8B4513" />
          </linearGradient>
          <filter id="soften" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.5"/>
          </filter>
        </defs>

        {/* Face shape mais realista */}
        <ellipse
          cx="50"
          cy="52"
          rx="32"
          ry="35"
          fill="url(#faceGradient)"
          filter="url(#soften)"
        />
        
        {/* Contorno facial suave */}
        <ellipse
          cx="50"
          cy="52"
          rx="32"
          ry="35"
          fill="none"
          stroke="rgba(244, 160, 156, 0.3)"
          strokeWidth="0.5"
        />
        
        {/* Cabelo moderno long bob */}
        <path
          d="M 18 38 Q 25 18 50 20 Q 75 18 82 38 
             L 85 45 Q 80 50 75 48 L 75 55 Q 70 58 65 56
             Q 60 54 55 56 Q 50 58 45 56 Q 40 54 35 56
             L 25 55 Q 20 50 15 45 Z"
          fill="url(#hairGradient)"
          filter="url(#soften)"
        />
        
        {/* Hair highlights */}
        <path
          d="M 30 25 Q 40 22 50 24 Q 60 22 70 25"
          stroke="#D2B48C"
          strokeWidth="2"
          fill="none"
          opacity="0.6"
        />
        
        {/* Olhos ultrarrealistas com íris colorida */}
        
        {/* Eye whites */}
        <motion.ellipse
          cx="35"
          cy="42"
          rx="10"
          ry="8"
          fill="white"
          animate={getEyeState()}
          variants={eyeVariants}
          transition={{ duration: 0.2, ease: "easeOut" }}
        />
        <motion.ellipse
          cx="65"
          cy="42"
          rx="10"
          ry="8"
          fill="white"
          animate={getEyeState()}
          variants={eyeVariants}
          transition={{ duration: 0.2, ease: "easeOut" }}
        />

        {/* Íris com gradiente Leapmotor green */}
        <motion.ellipse
          cx="35"
          cy="42"
          rx="6"
          ry="6"
          fill="#00B74F"
          animate={getEyeState()}
          variants={eyeVariants}
          transition={{ duration: 0.2, ease: "easeOut" }}
        />
        <motion.ellipse
          cx="65"
          cy="42"
          rx="6"
          ry="6"
          fill="#00B74F"
          animate={getEyeState()}
          variants={eyeVariants}
          transition={{ duration: 0.2, ease: "easeOut" }}
        />

        {/* Inner iris detail */}
        <motion.ellipse
          cx="35"
          cy="42"
          rx="4"
          ry="4"
          fill="#00a347"
          animate={getEyeState()}
          variants={eyeVariants}
          transition={{ duration: 0.2, ease: "easeOut" }}
        />
        <motion.ellipse
          cx="65"
          cy="42"
          rx="4"
          ry="4"
          fill="#00a347"
          animate={getEyeState()}
          variants={eyeVariants}
          transition={{ duration: 0.2, ease: "easeOut" }}
        />

        {/* Pupils com dilatação emocional */}
        <motion.ellipse
          cx="35"
          cy="42"
          rx="2"
          ry="2"
          fill="#000"
          animate={{
            ...getEyeState(),
            scale: (emotion === 'excited' || emotion === 'surprised') ? 1.3 : 
                   (emotion === 'thinking' || emotion === 'concerned') ? 0.8 : 1
          }}
          variants={eyeVariants}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
        <motion.ellipse
          cx="65"
          cy="42"
          rx="2"
          ry="2"
          fill="#000"
          animate={{
            ...getEyeState(),
            scale: (emotion === 'excited' || emotion === 'surprised') ? 1.3 : 
                   (emotion === 'thinking' || emotion === 'concerned') ? 0.8 : 1
          }}
          variants={eyeVariants}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
        
        {/* Reflexos realistas nos olhos */}
        <motion.circle 
          cx="33" 
          cy="40" 
          r="1.5" 
          fill="white" 
          animate={{ 
            opacity: emotion === 'excited' || emotion === 'curious' ? [0.7, 1, 0.7] : 0.9,
            scale: emotion === 'excited' ? [1, 1.2, 1] : 1
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.circle 
          cx="63" 
          cy="40" 
          r="1.5" 
          fill="white" 
          animate={{ 
            opacity: emotion === 'excited' || emotion === 'curious' ? [0.7, 1, 0.7] : 0.9,
            scale: emotion === 'excited' ? [1, 1.2, 1] : 1
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* Smaller sparkles */}
        <motion.circle 
          cx="37" 
          cy="44" 
          r="0.8" 
          fill="white" 
          opacity="0.6"
        />
        <motion.circle 
          cx="67" 
          cy="44" 
          r="0.8" 
          fill="white" 
          opacity="0.6"
        />

        {/* Cílios superiores */}
        <path
          d="M 26 36 Q 28 34 30 36 M 30 35 Q 32 33 34 35 M 34 35 Q 36 33 38 35 M 38 36 Q 40 34 42 36"
          stroke="#2d1810"
          strokeWidth="1"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 56 36 Q 58 34 60 36 M 60 35 Q 62 33 64 35 M 64 35 Q 66 33 68 35 M 68 36 Q 70 34 72 36"
          stroke="#2d1810"
          strokeWidth="1"
          fill="none"
          strokeLinecap="round"
        />

        {/* Cílios inferiores subtis */}
        <path
          d="M 28 46 Q 30 47 32 46 M 36 47 Q 38 48 40 47"
          stroke="#2d1810"
          strokeWidth="0.5"
          fill="none"
          strokeLinecap="round"
          opacity="0.4"
        />
        <path
          d="M 58 46 Q 60 47 62 46 M 66 47 Q 68 48 70 47"
          stroke="#2d1810"
          strokeWidth="0.5"
          fill="none"
          strokeLinecap="round"
          opacity="0.4"
        />
        
        {/* Sobrancelhas ultra-realistas */}
        <motion.path
          animate={getEyebrowState()}
          variants={eyebrowVariants}
          stroke="#2d1810"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
        <motion.path
          d="M 55 33 Q 65 30 75 33"
          animate={getEyebrowState()}
          stroke="#2d1810"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          transition={{ duration: 0.3, ease: "easeOut" }}
        />

        {/* Individual eyebrow hairs for realism */}
        <path d="M 25 33 L 27 32 M 29 32 L 31 31 M 33 31 L 35 32 M 37 32 L 39 33" 
              stroke="#2d1810" strokeWidth="0.8" opacity="0.6" />
        <path d="M 61 33 L 63 32 M 65 32 L 67 31 M 69 31 L 71 32 M 73 32 L 75 33" 
              stroke="#2d1810" strokeWidth="0.8" opacity="0.6" />
        
        {/* Nariz feminino elegante com sombra */}
        <ellipse
          cx="50"
          cy="52"
          rx="2"
          ry="4"
          fill="#f4a09c"
        />
        <path
          d="M 48 50 Q 50 48 52 50"
          stroke="#f4a09c"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
        {/* Narinas subtis */}
        <ellipse cx="47.5" cy="54" rx="1" ry="1.5" fill="#e6a8a8" opacity="0.4" />
        <ellipse cx="52.5" cy="54" rx="1" ry="1.5" fill="#e6a8a8" opacity="0.4" />

        {/* Boca premium com gradiente e lip gloss */}
        <defs>
          <linearGradient id="lipGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E6A8A8" />
            <stop offset="50%" stopColor="#d19999" />
            <stop offset="100%" stopColor="#c48a8a" />
          </linearGradient>
        </defs>

        {/* Lip base */}
        <motion.path
          animate={getMouthState()}
          variants={mouthVariants}
          transition={{
            duration: isSpeaking ? 0.12 : 0.25,
            repeat: isSpeaking ? Infinity : 0,
            repeatType: isSpeaking ? "reverse" : "loop",
            ease: "easeInOut"
          }}
          stroke="url(#lipGradient)"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />

        {/* Lip gloss highlight */}
        <motion.path
          animate={getMouthState()}
          variants={mouthVariants}
          d="M 40 61 Q 50 64 60 61"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="1"
          fill="none"
          strokeLinecap="round"
          transition={{
            duration: isSpeaking ? 0.12 : 0.25,
            repeat: isSpeaking ? Infinity : 0,
            repeatType: isSpeaking ? "reverse" : "loop",
            ease: "easeInOut"
          }}
        />

        {/* Lip line definition */}
        <motion.path
          animate={getMouthState()}
          variants={mouthVariants}
          stroke="#c48a8a"
          strokeWidth="1"
          fill="none"
          strokeLinecap="round"
          opacity="0.6"
          transition={{
            duration: isSpeaking ? 0.12 : 0.25,
            repeat: isSpeaking ? Infinity : 0,
            repeatType: isSpeaking ? "reverse" : "loop",
            ease: "easeInOut"
          }}
        />

        {/* Blush natural nas bochechas para emoções positivas */}
        {(emotion === 'happy' || emotion === 'welcoming' || emotion === 'excited' || emotion === 'satisfied') && (
          <>
            <motion.ellipse
              cx="28"
              cy="55"
              rx="5"
              ry="3"
              fill="#ff9999"
              opacity="0.25"
              animate={{
                opacity: [0.15, 0.35, 0.15],
                scale: [1, 1.08, 1]
              }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            <motion.ellipse
              cx="72"
              cy="55"
              rx="5"
              ry="3"
              fill="#ff9999"
              opacity="0.25"
              animate={{
                opacity: [0.15, 0.35, 0.15],
                scale: [1, 1.08, 1]
              }}
              transition={{ duration: 4, repeat: Infinity }}
            />
          </>
        )}

        {/* Dimples para sorrisos genuínos */}
        {(emotion === 'happy' || emotion === 'welcoming' || emotion === 'satisfied') && (
          <>
            <motion.circle
              cx="38"
              cy="58"
              r="1"
              fill="#e6a8a8"
              opacity="0.4"
              animate={{
                scale: [0.8, 1.2, 0.8],
                opacity: [0.2, 0.6, 0.2]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.circle
              cx="62"
              cy="58"
              r="1"
              fill="#e6a8a8"
              opacity="0.4"
              animate={{
                scale: [0.8, 1.2, 0.8],
                opacity: [0.2, 0.6, 0.2]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </>
        )}

        {/* Chin definition */}
        <ellipse
          cx="50"
          cy="75"
          rx="8"
          ry="4"
          fill="#f4a09c"
          opacity="0.3"
        />
        
        {/* Jaw line sutil */}
        <path
          d="M 22 65 Q 35 75 50 76 Q 65 75 78 65"
          stroke="#e6a8a8"
          strokeWidth="1"
          fill="none"
          opacity="0.2"
        />
      </svg>
      
      {/* Status indicator premium 3D */}
      <motion.div
        className={`absolute -bottom-2 -right-2 w-6 h-6 rounded-full shadow-lg border-2 border-white ${
          isSpeaking ? 'bg-green-500' : 
          isListening ? 'bg-cyan-500' :
          emotion === 'excited' ? 'bg-yellow-500' :
          emotion === 'concerned' ? 'bg-orange-500' :
          emotion === 'thinking' || emotion === 'processing' ? 'bg-purple-500' :
          'bg-green-400'
        }`}
        animate={
          isSpeaking ? { 
            scale: [1, 1.4, 1], 
            opacity: [0.8, 1, 0.8],
            boxShadow: ['0 0 10px rgba(34, 197, 94, 0.5)', '0 0 20px rgba(34, 197, 94, 0.8)', '0 0 10px rgba(34, 197, 94, 0.5)']
          } : 
          isListening ? { 
            scale: [1, 1.3, 1], 
            opacity: [0.8, 1, 0.8],
            boxShadow: ['0 0 10px rgba(6, 182, 212, 0.5)', '0 0 20px rgba(6, 182, 212, 0.8)', '0 0 10px rgba(6, 182, 212, 0.5)']
          } :
          { scale: [1, 1.15, 1], opacity: [0.8, 1, 0.8] }
        }
        transition={{
          duration: isSpeaking ? 0.4 : isListening ? 0.6 : 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {/* Inner glow */}
        <div className="absolute inset-1 rounded-full bg-white/30" />
      </motion.div>

      {/* Pensando indicator com 3 dots animados */}
      {(emotion === 'thinking' || emotion === 'processing') && (
        <motion.div
          className="absolute -top-4 left-1/2 transform -translate-x-1/2 flex space-x-1"
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-purple-500 rounded-full shadow-lg"
              animate={{
                y: [0, -12, 0],
                opacity: [0.4, 1, 0.4],
                scale: [0.8, 1.2, 0.8]
              }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                delay: i * 0.3,
                ease: "easeInOut"
              }}
            />
          ))}
        </motion.div>
      )}

      {/* Neural connection lines quando processando */}
      {emotion === 'processing' && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent"
              style={{
                width: '60%',
                left: '20%',
                top: `${30 + i * 15}%`,
                transform: `rotate(${i * 45}deg)`,
                transformOrigin: 'center'
              }}
              animate={{
                opacity: [0, 0.6, 0],
                scale: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.4,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
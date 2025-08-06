import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';

export type AvatarEmotion = 
  | 'welcoming' | 'professional' | 'curious' | 'excited' 
  | 'thinking' | 'concerned' | 'happy' | 'confident' 
  | 'empathetic' | 'processing' | 'surprised' | 'satisfied' | 'neutral';

export type AvatarExpression = 'neutral' | 'smiling' | 'speaking';

interface AvatarProps {
  isSpeaking: boolean;
  emotion?: AvatarEmotion;
  isListening?: boolean;
  isIdle?: boolean;
  size?: 'normal' | 'large' | 'hero';
  isIntro?: boolean; // Nova prop para identificar se é a fala de intro
}

export const Avatar: React.FC<AvatarProps> = ({ 
  isSpeaking, 
  emotion = 'neutral', 
  isListening = false,
  isIdle = true,
  size = 'normal',
  isIntro = false
}) => {
  const [currentExpression, setCurrentExpression] = useState<AvatarExpression>('neutral');
  const [breathingPhase, setBreathingPhase] = useState(0);
  const [idleMovement, setIdleMovement] = useState({ x: 0, y: 0 });
  const [videoLoaded, setVideoLoaded] = useState(true); // Start as true to avoid initial loading screen
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0); // For smooth crossfade
  const [previousVideoPath, setPreviousVideoPath] = useState<string>('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const videoRef1 = useRef<HTMLVideoElement>(null);
  const videoRef2 = useRef<HTMLVideoElement>(null);
  const transitionTimeoutRef = useRef<NodeJS.Timeout>();

  // Paths dos vídeos - agora com 3 estados
  const videoPaths = {
    listening: '/lea-listening.mp4',        // Estado padrão - ouvindo/idle
    intro: '/leap-animated-hello.mp4',      // Apresentação inicial
    conversation: '/video-loop-lea.mp4'     // Falando/conversação
  };
  
  // Sistema inteligente de seleção de vídeo
  const getVideoPath = () => {
    if (isSpeaking) {
      const selectedPath = isIntro ? videoPaths.intro : videoPaths.conversation;
      console.log(`🎬 LEA falando: ${isIntro ? 'intro' : 'conversação'} -> ${selectedPath}`);
      return selectedPath;
    }
    // Padrão: sempre usa vídeo listening (substituindo imagem estática)
    console.log(`👂 LEA em estado listening/idle -> ${videoPaths.listening}`);
    return videoPaths.listening;
  };
  
  const currentVideoPath = getVideoPath();

  // Get current and next video refs for smooth crossfading
  const getCurrentVideoRef = () => currentVideoIndex === 0 ? videoRef1 : videoRef2;
  const getNextVideoRef = () => currentVideoIndex === 0 ? videoRef2 : videoRef1;

  // Preload both videos and handle smooth transitions
  useEffect(() => {
    const currentRef = getCurrentVideoRef();
    const nextRef = getNextVideoRef();
    
    // If video path changed, start transition
    if (currentVideoPath !== previousVideoPath && previousVideoPath !== '') {
      console.log(`🎬 Transitioning from ${previousVideoPath} to ${currentVideoPath}`);
      
      if (nextRef.current) {
        setIsTransitioning(true);
        
        // Preload the new video
        nextRef.current.src = currentVideoPath;
        nextRef.current.currentTime = 0;
        
        const handleLoadedData = () => {
          // Start playing the new video
          nextRef.current?.play().then(() => {
            // After new video starts, fade out old and fade in new
            setTimeout(() => {
              setCurrentVideoIndex(prev => prev === 0 ? 1 : 0);
              setIsTransitioning(false);
              console.log('✨ Smooth transition completed');
            }, 100);
          }).catch(e => {
            console.error('Error playing new video:', e);
            setIsTransitioning(false);
          });
        };
        
        nextRef.current.addEventListener('loadeddata', handleLoadedData, { once: true });
      }
    } else {
      // First load or same video
      if (currentRef.current) {
        const shouldUpdateSrc = !currentRef.current.src.includes(currentVideoPath.split('/').pop() || '');
        if (shouldUpdateSrc) {
          console.log(`🎬 Loading initial video: ${currentVideoPath}`);
          currentRef.current.src = currentVideoPath;
          currentRef.current.currentTime = 0;
          
          // Add small delay for smooth initial load
          setTimeout(() => {
            currentRef.current?.play().catch(e => {
              console.error('Error playing video:', e);
            });
          }, 100);
        }
      }
    }
    
    setPreviousVideoPath(currentVideoPath);
  }, [currentVideoPath]);

  // Sistema inteligente de seleção de expressão
  useEffect(() => {
    const getExpressionForEmotion = (emotion: AvatarEmotion, isSpeaking: boolean): AvatarExpression => {
      // Prioridade 1: Se está falando, mostrar expressão de fala
      if (isSpeaking) return 'speaking';
      
      // Prioridade 2: Expressões que sempre sorriem
      const happyEmotions = ['welcoming', 'happy', 'excited', 'satisfied', 'cheerful'];
      if (happyEmotions.includes(emotion)) return 'smiling';
      
      // Prioridade 3: Outras emoções ficam neutras
      return 'neutral';
    };

    setCurrentExpression(getExpressionForEmotion(emotion, isSpeaking));
  }, [emotion, isSpeaking]);

  // Clean up transition timeouts
  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

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




  // Paleta de cores premium baseada em emoções
  const getAvatarColor = () => {
    switch (emotion) {
      case 'welcoming':
        return { glow: '#00B74F40' };
      case 'professional':
        return { glow: '#3b82f640' };
      case 'curious':
        return { glow: '#06b6d440' };
      case 'excited':
        return { glow: '#f59e0b40' };
      case 'thinking':
      case 'processing':
        return { glow: '#8b5cf640' };
      case 'concerned':
        return { glow: '#ef444440' };
      case 'happy':
      case 'satisfied':
        return { glow: '#10b98140' };
      case 'confident':
        return { glow: '#64748b40' };
      case 'empathetic':
        return { glow: '#ec489940' };
      case 'surprised':
        return { glow: '#eab30840' };
      case 'neutral':
      default:
        return { glow: '#00B74F30' };
    }
  };

  // Calcular animação de respiração realista
  const breathingScale = 1 + Math.sin(breathingPhase * Math.PI / 180) * 0.015;

  // Determinar tamanho do avatar - versão 100% vídeo com aspect ratio horizontal
  const getAvatarSize = () => {
    switch (size) {
      case 'hero': return { 
        container: 'w-full aspect-video', // Usa aspect ratio 16:9 para vídeo horizontal
        video: 'w-full h-full', // Vídeo ocupa todo container
        size: 700 
      };
      case 'large': return { 
        container: 'w-full aspect-video', // Aspect ratio 16:9
        video: 'w-full h-full',
        size: 320 
      };
      case 'normal':
      default: return { 
        container: 'w-full aspect-video', // Aspect ratio 16:9
        video: 'w-full h-full',
        size: 256 
      };
    }
  };

  const avatarSize = getAvatarSize();
  const avatarColors = getAvatarColor();

  // Placeholder simplificado apenas para vídeo
  if (!videoLoaded) {
    return (
      <div className={`relative ${avatarSize.container} mx-auto avatar-container`}>
        <div className="absolute inset-0 rounded-2xl bg-leap-surface/60 backdrop-blur-sm animate-pulse flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-leap-green-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="text-leap-text-secondary text-sm">Carregando LEA...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${avatarSize.container} w-full avatar-container overflow-hidden rounded-2xl`}>
      {/* Glow effect premium mais intenso com estados imersivos */}
      <motion.div
        className="absolute inset-0 rounded-full blur-3xl"
        style={{
          background: avatarColors.glow,
          transform: 'scale(1.3)'
        }}
        animate={{
          opacity: isSpeaking ? [0.6, 1.0, 0.6] : 
                   isListening ? [0.4, 0.8, 0.4] : 
                   emotion === 'thinking' || emotion === 'processing' ? [0.3, 0.7, 0.3] :
                   0.5,
          scale: isSpeaking ? [1.3, 1.6, 1.3] : 
                 isListening ? [1.3, 1.45, 1.3] : 
                 emotion === 'excited' ? [1.3, 1.5, 1.3] :
                 [1.3, 1.36, 1.3],
        }}
        transition={{
          duration: isSpeaking ? 0.4 : 
                    isListening ? 1.2 : 
                    emotion === 'excited' ? 0.8 :
                    3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Breathing Light Ring - Efeito adicional quando idle */}
      {!isSpeaking && !isListening && (
        <motion.div
          className="absolute inset-4 rounded-full border-2"
          style={{
            borderColor: avatarColors.glow.replace('40', '60'),
          }}
          animate={{
            opacity: [0.2, 0.6, 0.2],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}

      {/* Dual Video System Ocupando Toda Área */}
      <motion.video
        ref={videoRef1}
        className="absolute inset-0 w-full h-full object-cover rounded-2xl z-10"
        style={{
          opacity: currentVideoIndex === 0 ? 1 : 0,
          transition: 'opacity 600ms ease-in-out',
          willChange: 'opacity',
          pointerEvents: 'none',
        }}
        animate={{
          scale: isSpeaking ? [1, 1.02, 1] : breathingScale,
        }}
        transition={{
          duration: isSpeaking ? 0.4 : 4,
          repeat: isSpeaking ? Infinity : 0,
          ease: "easeInOut"
        }}
        loop
        muted
        playsInline
        autoPlay={false}
        preload="auto"
      />
      
      <motion.video
        ref={videoRef2}
        className="absolute inset-0 w-full h-full object-cover rounded-2xl z-10"
        style={{
          opacity: currentVideoIndex === 1 ? 1 : 0,
          transition: 'opacity 600ms ease-in-out',
          willChange: 'opacity',
          pointerEvents: 'none',
        }}
        animate={{
          scale: isSpeaking ? [1, 1.02, 1] : breathingScale,
        }}
        transition={{
          duration: isSpeaking ? 0.4 : 4,
          repeat: isSpeaking ? Infinity : 0,
          ease: "easeInOut"
        }}
        loop
        muted
        playsInline
        autoPlay={false}
        preload="auto"
      />


      {/* Partículas flutuantes para emoções específicas */}
      {(emotion === 'excited' || emotion === 'happy' || emotion === 'surprised') && (
        <div className="absolute inset-0 pointer-events-none z-20">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/70 rounded-full shadow-lg"
              style={{
                left: `${15 + i * 10}%`,
                top: `${10 + (i % 4) * 20}%`,
              }}
              animate={{
                y: [-25, -50, -25],
                opacity: [0, 1, 0],
                scale: [0.3, 1.2, 0.3],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 2.5 + i * 0.3,
                repeat: Infinity,
                delay: i * 0.3,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      )}

      {/* Partículas douradas quando processando */}
      {(emotion === 'thinking' || emotion === 'processing') && (
        <div className="absolute inset-0 pointer-events-none z-20">
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={`thinking-${i}`}
              className="absolute w-2 h-2 bg-yellow-400/80 rounded-full shadow-md"
              style={{
                left: `${10 + (i % 5) * 20}%`,
                top: `${20 + Math.floor(i / 5) * 30}%`,
              }}
              animate={{
                rotate: [0, 360],
                scale: [0.5, 1, 0.5],
                opacity: [0.3, 0.9, 0.3],
                x: [0, Math.sin(i) * 20, 0],
                y: [0, Math.cos(i) * 15, 0],
              }}
              transition={{
                duration: 3 + i * 0.2,
                repeat: Infinity,
                delay: i * 0.4,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      )}

      {/* Ondas sonoras durante listening - mais imersivas */}
      {isListening && (
        <>
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={`listen-wave-${i}`}
              className="absolute inset-0 rounded-2xl border-2 border-cyan-400/50 z-20"
              animate={{
                scale: [1, 1.4 + i * 0.1, 1],
                opacity: [0, 0.8, 0],
                borderWidth: ['2px', '1px', '2px']
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                delay: i * 0.4,
                ease: "easeOut"
              }}
            />
          ))}
          
          {/* Pontos pulsantes de audio */}
          <div className="absolute inset-0 z-20 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={`audio-dot-${i}`}
                className="absolute w-2 h-2 bg-cyan-400 rounded-full"
                style={{
                  left: `${30 + i * 8}%`,
                  top: '50%',
                  transform: 'translateY(-50%)',
                }}
                animate={{
                  scale: [0.5, 1.5, 0.5],
                  opacity: [0.3, 1, 0.3],
                  y: [0, -10, 0]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        </>
      )}

      
      {/* Status indicator premium 3D - mais destacado */}
      <motion.div
        className={`absolute -bottom-3 -right-3 w-8 h-8 rounded-full shadow-xl border-3 border-white z-30 ${
          isSpeaking ? 'bg-green-500' : 
          isListening ? 'bg-cyan-500' :
          emotion === 'excited' ? 'bg-yellow-500' :
          emotion === 'concerned' ? 'bg-orange-500' :
          emotion === 'thinking' || emotion === 'processing' ? 'bg-purple-500' :
          'bg-green-400'
        }`}
        animate={
          isSpeaking ? { 
            scale: [1, 1.6, 1], 
            opacity: [0.9, 1, 0.9],
            boxShadow: ['0 0 15px rgba(34, 197, 94, 0.6)', '0 0 30px rgba(34, 197, 94, 1)', '0 0 15px rgba(34, 197, 94, 0.6)']
          } : 
          isListening ? { 
            scale: [1, 1.4, 1], 
            opacity: [0.9, 1, 0.9],
            boxShadow: ['0 0 15px rgba(6, 182, 212, 0.6)', '0 0 30px rgba(6, 182, 212, 1)', '0 0 15px rgba(6, 182, 212, 0.6)']
          } :
          { scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }
        }
        transition={{
          duration: isSpeaking ? 0.3 : isListening ? 0.5 : 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {/* Inner glow mais brilhante */}
        <div className="absolute inset-1 rounded-full bg-white/40" />
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
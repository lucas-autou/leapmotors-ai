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
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const transitionTimeoutRef = useRef<NodeJS.Timeout>();

  // Paths das imagens do avatar
  const avatarImages = {
    neutral: '/leap-avatar-neutro.png',
    smiling: '/leap-avatar-sorrindo.png',
    speaking: '/leap-avatar-falando.png'
  };

  // Paths dos vídeos - diferentes para intro e conversação
  const videoPaths = {
    intro: '/leap-animated-hello.mp4',
    conversation: '/video-loop-lea.mp4'
  };
  
  // Seleciona vídeo baseado se é intro ou não
  const currentVideoPath = isIntro ? videoPaths.intro : videoPaths.conversation;

  // Preload das imagens e vídeo
  useEffect(() => {
    const imagePromises = Object.values(avatarImages).map(src => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => resolve(); // Continuar mesmo se uma imagem falhar
        img.src = src;
      });
    });

    Promise.all(imagePromises).then(() => {
      setImagesLoaded(true);
    });

    // Preload do vídeo
    if (videoRef.current) {
      videoRef.current.addEventListener('loadeddata', () => {
        setVideoLoaded(true);
        console.log('🎥 Vídeo carregado e pronto');
      });
      
      videoRef.current.addEventListener('error', (e) => {
        console.error('❌ Erro ao carregar vídeo:', e);
        setVideoLoaded(false);
      });
    }
  }, []);

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

  // Controle de transição vídeo/imagem sincronizado com áudio real
  useEffect(() => {
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }

    if (isSpeaking) {
      // Delay maior para aguardar o áudio começar de verdade
      transitionTimeoutRef.current = setTimeout(() => {
        setShowVideo(true);
        
        if (videoRef.current) {
          videoRef.current.currentTime = 0; // Reinicia do começo
          videoRef.current.play().catch(e => {
            console.error('Erro ao reproduzir vídeo:', e);
            // Tenta novamente após um pequeno delay
            setTimeout(() => {
              videoRef.current?.play().catch(e2 => {
                console.error('Segunda tentativa falhou:', e2);
              });
            }, 100);
          });
        }
      }, 800); // Aguarda 800ms para o áudio começar de verdade
    } else {
      // Delay maior para manter vídeo até o áudio terminar completamente
      transitionTimeoutRef.current = setTimeout(() => {
        setShowVideo(false);
        
        if (videoRef.current) {
          // Pausa o vídeo após a transição completar
          setTimeout(() => {
            videoRef.current?.pause();
            videoRef.current.currentTime = 0; // Volta ao início
          }, 400); // Aguarda a transição CSS completar
        }
      }, 1000); // Delay de 1s após parar de falar (para sincronizar com fim do áudio)
    }

    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
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

  // Determinar tamanho do avatar - versão expandida para vídeo maior
  const getAvatarSize = () => {
    switch (size) {
      case 'hero': return { 
        container: 'w-[500px] h-[400px]', // Container retangular maior
        image: 'w-96 h-96', // Imagem mantém círculo
        video: 'w-full h-full', // Vídeo ocupa todo container
        size: 500 
      };
      case 'large': return { 
        container: 'w-80 h-64', 
        image: 'w-64 h-64',
        video: 'w-full h-full',
        size: 256 
      };
      case 'normal':
      default: return { 
        container: 'w-48 h-48',
        image: 'w-48 h-48', 
        video: 'w-full h-full',
        size: 192 
      };
    }
  };

  const avatarSize = getAvatarSize();
  const avatarColors = getAvatarColor();

  // Se as imagens ainda não carregaram, mostrar placeholder
  if (!imagesLoaded) {
    return (
      <div className={`relative ${avatarSize.container} mx-auto avatar-container`}>
        <div className="absolute inset-0 rounded-2xl bg-gray-300 animate-pulse flex items-center justify-center">
          <span className="text-gray-500 text-sm">Carregando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${avatarSize.container} mx-auto avatar-container overflow-hidden`}>
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

      {/* Avatar principal com vídeo e imagem */}
      <motion.div
        className="relative z-10 w-full h-full flex items-center justify-center"
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
      >
        {/* Camada base: Imagem estática circular (sempre presente) */}
        <img
          src={avatarImages.neutral}
          alt="Avatar neutro"
          className={`absolute ${avatarSize.image} object-cover rounded-full`}
          style={{
            opacity: showVideo ? 0 : 1,
            transition: 'opacity 400ms ease-in-out',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        />
        
        {/* Camada overlay: Vídeo retangular maior (aparece quando falando) */}
        <video
          ref={videoRef}
          src={currentVideoPath}
          className={`absolute ${avatarSize.video} object-cover rounded-2xl`}
          style={{
            opacity: showVideo ? 1 : 0,
            transition: 'opacity 400ms ease-in-out',
            willChange: 'opacity',
            pointerEvents: 'none',
          }}
          loop
          muted
          playsInline
          autoPlay={false}
          preload="auto"
          key={currentVideoPath} // Força re-render quando vídeo muda
        />
      </motion.div>


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
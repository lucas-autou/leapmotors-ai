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
  const videoRef = useRef<HTMLVideoElement>(null);
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

  // Preload do vídeo com timeout de fallback
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (videoRef.current) {
      const handleLoadedData = () => {
        setVideoLoaded(true);
        console.log('🎥 Vídeo carregado e pronto:', currentVideoPath);
        clearTimeout(timeoutId);
      };
      
      const handleError = (e: Event) => {
        console.error('❌ Erro ao carregar vídeo:', e);
        setVideoLoaded(true); // Continua mesmo com erro para não travar
        clearTimeout(timeoutId);
      };
      
      videoRef.current.addEventListener('loadeddata', handleLoadedData);
      videoRef.current.addEventListener('error', handleError);
      
      // Timeout de 3 segundos para forçar carregamento caso o evento não dispare
      timeoutId = setTimeout(() => {
        console.log('⏰ Timeout do vídeo - forçando carregamento');
        setVideoLoaded(true);
      }, 3000);
      
      return () => {
        if (videoRef.current) {
          videoRef.current.removeEventListener('loadeddata', handleLoadedData);
          videoRef.current.removeEventListener('error', handleError);
        }
        clearTimeout(timeoutId);
      };
    }
  }, [currentVideoPath]); // Recarrega quando vídeo muda

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

  // Controle de transição entre diferentes vídeos
  useEffect(() => {
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }

    // Vídeo sempre visível - apenas muda o src
    
    if (videoRef.current) {
      // Reinicia vídeo quando mudança de estado
      videoRef.current.currentTime = 0;
      
      // Inicia reprodução com delay apropriado
      const playDelay = isSpeaking ? 800 : 200; // Maior delay quando falando para sincronizar com áudio
      
      transitionTimeoutRef.current = setTimeout(() => {
        videoRef.current?.play().catch(e => {
          console.error('Erro ao reproduzir vídeo:', e);
          // Retry após delay
          setTimeout(() => {
            videoRef.current?.play().catch(e2 => {
              console.error('Segunda tentativa falhou:', e2);
            });
          }, 100);
        });
      }, playDelay);
    }

    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, [isSpeaking, currentVideoPath]); // Adiciona currentVideoPath para reagir a mudanças de vídeo

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

  // Determinar tamanho do avatar - versão 100% vídeo
  const getAvatarSize = () => {
    switch (size) {
      case 'hero': return { 
        container: 'w-full h-[600px]', // Container para vídeo grande
        video: 'w-full h-full', // Vídeo ocupa todo container
        size: 600 
      };
      case 'large': return { 
        container: 'w-full h-80', 
        video: 'w-full h-full',
        size: 320 
      };
      case 'normal':
      default: return { 
        container: 'w-full h-64',
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
        {/* Vídeo principal - agora sempre visível com 3 estados diferentes */}
        <video
          ref={videoRef}
          src={currentVideoPath}
          className={`absolute ${avatarSize.video} object-cover rounded-2xl`}
          style={{
            opacity: 1, // Sempre visível
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
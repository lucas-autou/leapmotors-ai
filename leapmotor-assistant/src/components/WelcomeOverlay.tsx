import { motion } from 'framer-motion';
import { useState } from 'react';

interface WelcomeOverlayProps {
  onStart: () => void;
}

export const WelcomeOverlay: React.FC<WelcomeOverlayProps> = ({ onStart }) => {
  const [isStarting, setIsStarting] = useState(false);

  const handleStart = () => {
    setIsStarting(true);
    // Small delay to show animation before calling onStart
    setTimeout(() => {
      onStart();
    }, 500);
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-leap-dark/95 backdrop-blur-xl flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container mx-auto px-6">
        <motion.div
          className="max-w-2xl mx-auto text-center"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* Logo/Avatar Premium */}
          <div className="mb-8">
            <motion.div
              className="w-32 h-32 mx-auto bg-gradient-to-br from-leap-green-primary to-leap-green-neon rounded-3xl flex items-center justify-center shadow-2xl"
              animate={{
                scale: [1, 1.05, 1],
                boxShadow: [
                  '0 0 30px rgba(0, 183, 79, 0.3)',
                  '0 0 60px rgba(0, 183, 79, 0.5)',
                  '0 0 30px rgba(0, 183, 79, 0.3)'
                ]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <span className="text-white font-bold text-5xl">LEA</span>
            </motion.div>
          </div>

          {/* Título Premium */}
          <motion.div
            className="mb-8"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-leap-text-primary mb-4">
              Bem-vindo à{' '}
              <span className="bg-gradient-to-r from-leap-green-primary to-leap-green-neon bg-clip-text text-transparent">
                LEAP AI 4.0
              </span>
            </h1>
            <p className="text-xl text-leap-text-secondary mb-2">
              Sua assistente virtual inteligente está pronta!
            </p>
            <p className="text-sm text-leap-text-muted">
              Experiência imersiva com voz neural e inteligência emocional
            </p>
          </motion.div>

          {/* Features Premium */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <div className="bg-leap-surface/60 backdrop-blur-sm border border-leap-border rounded-xl p-4">
              <div className="text-2xl mb-2">🧠</div>
              <h3 className="text-leap-text-primary font-medium mb-1">IA Conversacional</h3>
              <p className="text-xs text-leap-text-muted">Entende contexto e intenções</p>
            </div>
            <div className="bg-leap-surface/60 backdrop-blur-sm border border-leap-border rounded-xl p-4">
              <div className="text-2xl mb-2">🎙️</div>
              <h3 className="text-leap-text-primary font-medium mb-1">Voz Neural</h3>
              <p className="text-xs text-leap-text-muted">Síntese de fala premium</p>
            </div>
            <div className="bg-leap-surface/60 backdrop-blur-sm border border-leap-border rounded-xl p-4">
              <div className="text-2xl mb-2">💚</div>
              <h3 className="text-leap-text-primary font-medium mb-1">Avatar Expressivo</h3>
              <p className="text-xs text-leap-text-muted">Emoções e gestos naturais</p>
            </div>
          </motion.div>

          {/* Call to Action Premium */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <motion.button
              onClick={handleStart}
              disabled={isStarting}
              className={`
                relative px-12 py-4 rounded-2xl font-semibold text-lg text-white
                bg-gradient-to-r from-leap-green-primary to-leap-green-neon
                shadow-lg shadow-leap-green-primary/30
                transition-all duration-300 ease-out
                ${isStarting ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 hover:shadow-xl hover:shadow-leap-green-primary/40'}
                disabled:hover:scale-100 disabled:hover:shadow-lg disabled:hover:shadow-leap-green-primary/30
              `}
              whileHover={!isStarting ? { scale: 1.05 } : {}}
              whileTap={!isStarting ? { scale: 0.98 } : {}}
            >
              {isStarting ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Iniciando LEA...
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span>🚀</span>
                  Iniciar Experiência
                </div>
              )}
            </motion.button>
            
            <p className="text-xs text-leap-text-muted mt-4 max-w-md mx-auto">
              Clique para ativar áudio e começar a conversar com a LEA
            </p>
          </motion.div>

          {/* Decorative Elements */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-leap-green-primary/40 rounded-full"
                style={{
                  left: `${10 + (i % 4) * 20}%`,
                  top: `${20 + Math.floor(i / 4) * 20}%`,
                }}
                animate={{
                  opacity: [0.2, 0.8, 0.2],
                  scale: [0.5, 1.2, 0.5],
                }}
                transition={{
                  duration: 2 + i * 0.3,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
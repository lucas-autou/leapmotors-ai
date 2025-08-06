import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import type { Message } from '../types';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isListening: boolean;
  onToggleListening: () => void;
  isSpeaking: boolean;
  onToggleSpeaking: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  isListening,
  onToggleListening,
  isSpeaking,
  onToggleSpeaking,
}) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  useEffect(() => {
    // Só fazer scroll se há mensagens e se não é a primeira renderização
    if (messages.length > 1) {
      // Pequeno delay para garantir que a mensagem foi renderizada
      const timer = setTimeout(scrollToBottom, 100);
      return () => clearTimeout(timer);
    }
  }, [messages.length]); // Só dependente do length, não do array completo

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-transparent rounded-2xl">
      {/* Messages Container com Balões Imersivos - Integrado */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3">
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.95 }}
              transition={{ duration: 0.4, type: "spring", stiffness: 120 }}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div className="relative max-w-[85%]">
                {/* Balão de fala com seta - Integrado com LEA */}
                <div
                  className={`p-3 rounded-2xl relative shadow-md ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-leap-green-primary to-leap-green-neon text-white'
                      : 'bg-leap-surface/60 backdrop-blur-sm text-leap-text-primary border border-leap-green-primary/20'
                  }`}
                >
                  {/* Seta do balão */}
                  <div
                    className={`absolute top-3 w-0 h-0 ${
                      message.role === 'user'
                        ? 'right-[-8px] border-l-[8px] border-l-leap-green-neon border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent'
                        : 'left-[-8px] border-r-[8px] border-r-leap-surface/60 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent'
                    }`}
                  />
                  
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  <span className={`text-xs mt-2 block ${
                    message.role === 'user' ? 'opacity-60' : 'opacity-50 text-leap-text-muted'
                  }`}>
                    {new Date(message.timestamp).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                
                {/* Avatar mini da LEA para suas mensagens */}
                {message.role === 'assistant' && (
                  <div className="absolute -left-2 top-0 w-6 h-6 bg-leap-green-primary/80 backdrop-blur-sm rounded-full flex items-center justify-center text-xs border border-leap-green-primary/30">
                    🤖
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area Integrada - Sutil */}
      <div className="border-t border-leap-border/30 p-3 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleListening}
            className={`p-2 rounded-full transition-all duration-300 ${
              isListening
                ? 'bg-red-500 text-white animate-pulse scale-105 shadow-lg shadow-red-500/50'
                : 'bg-leap-green-primary/80 text-white hover:bg-leap-green-primary hover:scale-105 shadow-md shadow-leap-green-primary/20'
            }`}
            title={isListening ? 'Parar gravação' : 'Falar com a LEA'}
          >
            {isListening ? <MicOff size={16} /> : <Mic size={16} />}
          </button>

          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={isListening ? "🎤 Fale com a LEA..." : "💬 Digite sua mensagem..."}
            className="flex-1 px-3 py-2 bg-leap-surface/40 text-leap-text-primary placeholder-leap-text-muted/70 rounded-full focus:outline-none focus:ring-1 focus:ring-leap-green-primary/50 transition-all border border-leap-border/30 focus:border-leap-green-primary/60 text-sm backdrop-blur-sm"
            disabled={isListening}
          />

          <button
            type="submit"
            disabled={!inputValue.trim() || isListening}
            className="p-2 bg-leap-green-primary/80 text-white rounded-full hover:bg-leap-green-primary disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md"
          >
            <Send size={14} />
          </button>

          <button
            type="button"
            onClick={onToggleSpeaking}
            className={`p-2 rounded-full transition-all duration-300 ${
              isSpeaking
                ? 'bg-leap-green-primary/80 text-white shadow-md shadow-leap-green-primary/20 scale-105'
                : 'bg-leap-surface/60 text-leap-text-muted hover:bg-leap-surface/80 border border-leap-border/30 hover:scale-105'
            }`}
            title={isSpeaking ? 'Silenciar LEA' : 'Ativar voz da LEA'}
          >
            {isSpeaking ? <Volume2 size={14} /> : <VolumeX size={14} />}
          </button>
        </form>
      </div>
    </div>
  );
};
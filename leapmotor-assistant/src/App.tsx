import { useState, useEffect } from 'react';
import { Mic } from 'lucide-react';
import { Avatar, type AvatarEmotion } from './components/Avatar';
import { ChatInterface } from './components/ChatInterface';
import { VehicleCards } from './components/VehicleCards';
import { ServiceOptions } from './components/ServiceOptions';
import { AIInsights } from './components/AIInsights';
import { WelcomeOverlay } from './components/WelcomeOverlay';
import { openAIService, type Intent } from './services/openai';
import { openaiSpeechService } from './services/openaiSpeech';
import type { Message, Vehicle } from './types';

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPreparingToSpeak, setIsPreparingToSpeak] = useState(false); // New state for audio sync
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [avatarEmotion, setAvatarEmotion] = useState<AvatarEmotion>('welcoming');
  const [currentIntent, setCurrentIntent] = useState<Intent>('general_conversation');
  const [isThinking, setIsThinking] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false); // New state for user interaction
  const [isIntroSpeech, setIsIntroSpeech] = useState(true); // Flag para saber se é a fala de intro

  useEffect(() => {
    // Evita execução dupla
    if (hasInitialized) return;

    // Initialize services - agora só precisamos da chave OpenAI!
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY || 'demo';

    console.log('🚀 Inicializando LEAP AI v2.0 com OpenAI...');
    openAIService.initialize(apiKey);
    openaiSpeechService.initialize(apiKey);

    // Send welcome message
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: 'Olá! Bem-vindo à Leapmotor! Eu sou a Lea, sua recepcionista digital. Estou aqui para te ajudar com tudo que precisar!',
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
    setAvatarEmotion('welcoming');

    // Marca como inicializado ANTES de falar para evitar duplicação
    setHasInitialized(true);
  }, [hasInitialized]); // Adiciona hasInitialized como dependência

  // Remove automatic speech - user can interact manually if they want to hear LEA speak

  const speakMessage = (text: string, emotion: AvatarEmotion = 'happy', isIntro: boolean = false) => {
    // Fase 1: Preparando para falar (mostra estado "thinking")
    setIsPreparingToSpeak(true);
    setAvatarEmotion('thinking'); // Mostra estado de processamento
    setIsIntroSpeech(isIntro); // Define se é fala de intro

    console.log('🎬 Preparando para falar - aguardando sincronização de áudio...');

    // Mapear emoção do avatar para opções de voz OpenAI
    const emotionMap: Record<AvatarEmotion, 'neutral' | 'happy' | 'excited' | 'concerned' | 'cheerful' | 'friendly'> = {
      'neutral': 'neutral',
      'happy': 'happy',
      'thinking': 'neutral',
      'excited': 'excited',
      'curious': 'friendly',
      'concerned': 'concerned',
      'welcoming': 'cheerful',
      'professional': 'neutral',
      'confident': 'friendly',
      'empathetic': 'cheerful',
      'processing': 'neutral',
      'surprised': 'excited',
      'satisfied': 'happy'
    };

    console.log(`🎙️ Processando TTS com emoção: ${emotion} -> ${emotionMap[emotion]}`);

    openaiSpeechService.speak(text, {
      emotion: emotionMap[emotion],
      speed: 1.0, // Velocidade normal para naturalidade
      voice: 'shimmer' // Voz feminina suave e fluida
    },
    // onEnd callback
    () => {
      // Delay maior para garantir que o vídeo continue até o fim do áudio
      setTimeout(() => {
        setIsSpeaking(false);
        setAvatarEmotion('neutral');
        setIsIntroSpeech(false); // Sempre volta para modo conversação após qualquer fala
        console.log('🔇 Fala concluída - transição suave para imagem');
      }, 500); // Delay maior para sincronizar com fim real do áudio
    },
    // onAudioStart callback - SINCRONIZAÇÃO PERFEITA!
    () => {
      // Fase 2: Áudio começou - agora sim mostra vídeo de fala
      setIsPreparingToSpeak(false);
      setIsSpeaking(true);
      setAvatarEmotion(emotion);
      console.log('🎬✅ Áudio sincronizado! Vídeo de fala iniciado com emoção:', emotion);
    });
  };

  const handleSendMessage = async (content: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    // Set thinking state
    setIsThinking(true);
    setAvatarEmotion('processing');

    // Get AI response with enhanced context
    const conversationHistory = messages.map(m => ({
      role: m.role,
      content: m.content
    }));

    try {
      const aiResponse = await openAIService.getResponse(content, conversationHistory);

      // Update states based on AI response
      setCurrentIntent(aiResponse.intent);
      setIsThinking(false);

      // Map intent to emotion - usando novos estados emocionais
      const intentToEmotion: Record<Intent, AvatarEmotion> = {
        'greeting': 'welcoming',
        'vehicle_inquiry': 'curious',
        'test_drive_request': 'excited',
        'coffee_request': 'satisfied',
        'consultant_request': 'professional',
        'appointment_request': 'confident',
        'financing_inquiry': 'concerned',
        'sustainability_question': 'empathetic',
        'general_conversation': 'neutral',
        'goodbye': 'satisfied'
      };

      const responseEmotion = intentToEmotion[aiResponse.intent] || 'neutral';
      setAvatarEmotion(responseEmotion);

      // Add assistant response
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse.response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);

      // Speak response with appropriate emotion
      if (audioEnabled) {
        speakMessage(aiResponse.response, responseEmotion);
      } else {
        // Se não for falar, mantém emoção por um tempo
        setTimeout(() => setAvatarEmotion('neutral'), 3000);
      }
    } catch (error) {
      console.error('Erro ao processar mensagem:', error);
      setIsThinking(false);
      setAvatarEmotion('concerned');

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Desculpe, tive um problema para processar sua mensagem. Pode tentar novamente? 😅',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);

      if (audioEnabled) {
        speakMessage(errorMessage.content, 'concerned');
      }
    }
  };

  const handleToggleListening = () => {
    if (isListening) {
      openaiSpeechService.stopListening();
      setIsListening(false);
      setAvatarEmotion('neutral');
      console.log('🎤 Parou de escutar');
    } else {
      setIsListening(true);
      setAvatarEmotion('curious'); // Mostra que está prestando atenção
      console.log('🎤 Começou a escutar...');

      openaiSpeechService.startListening(
        (transcript, confidence) => {
          setIsListening(false);
          console.log(`✅ Reconhecido (${Math.round(confidence * 100)}%): "${transcript}"`);

          // Processar com confiança mais baixa pois OpenAI/Web Speech são bons
          if (confidence > 0.2) {
            handleSendMessage(transcript);
          } else {
            setAvatarEmotion('concerned');
            console.log('❌ Confiança muito baixa, ignorando transcrição');

            const errorMessage: Message = {
              id: Date.now().toString(),
              role: 'assistant',
              content: `Desculpe, não consegui entender muito bem. Pode repetir? 🎤`,
              timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);

            setTimeout(() => setAvatarEmotion('neutral'), 2000);
          }
        },
        (error) => {
          console.error('❌ Erro reconhecimento de voz:', error);
          setIsListening(false);
          setAvatarEmotion('concerned');

          // Mostrar erro de forma mais amigável
          const errorMessage: Message = {
            id: Date.now().toString(),
            role: 'assistant',
            content: `Ops! ${error} 🎤 Pode tentar novamente ou digitar sua mensagem.`,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, errorMessage]);

          setTimeout(() => setAvatarEmotion('neutral'), 3000);
        },
        () => {
          setIsListening(false);
          setAvatarEmotion('neutral');
          console.log('🎤 Reconhecimento finalizado');
        }
      );
    }
  };

  const handleToggleSpeaking = () => {
    if (audioEnabled) {
      openaiSpeechService.stopSpeaking();
      setAudioEnabled(false);
      setIsSpeaking(false);
      setAvatarEmotion('neutral');
      console.log('🔇 Áudio desativado');
    } else {
      setAudioEnabled(true);
      setAvatarEmotion('happy');
      console.log('🔊 Áudio ativado - usando OpenAI TTS');

      // Breve confirmação de que o áudio foi ativado
      setTimeout(() => setAvatarEmotion('neutral'), 1500);
    }
  };

  const handleSelectVehicle = (vehicle: Vehicle) => {
    const message = `Estou interessado no ${vehicle.name}. Pode me contar mais sobre ele?`;
    handleSendMessage(message);
  };

  const [showCoffeeOptions, setShowCoffeeOptions] = useState(false);

  const handleSelectService = (service: string) => {
    let message = '';
    switch (service) {
      case 'coffee':
        setShowCoffeeOptions(true);
        return; // Não enviar mensagem ainda, mostrar opções primeiro
      case 'test-drive':
        message = 'Quero agendar um test-drive!';
        break;
      case 'consultant':
        message = 'Gostaria de falar com um consultor especializado.';
        break;
      case 'schedule':
        message = 'Quero agendar uma visita.';
        break;
      case 'coffee-espresso':
        message = 'Vou querer um café expresso, por favor.';
        setShowCoffeeOptions(false);
        break;
      case 'coffee-double-espresso':
        message = 'Um expresso duplo seria perfeito!';
        setShowCoffeeOptions(false);
        break;
      case 'coffee-latte':
        message = 'Gostaria de um café com leite.';
        setShowCoffeeOptions(false);
        break;
      case 'coffee-cappuccino':
        message = 'Um cappuccino, por favor.';
        setShowCoffeeOptions(false);
        break;
      case 'eco-info':
        message = 'Quais são os benefícios ecológicos dos veículos Leapmotor?';
        break;
      case 'financing':
        message = 'Quais são as opções de financiamento disponíveis?';
        break;
      case 'warranty':
        message = 'Como funciona a garantia e o suporte dos veículos?';
        break;
      default:
        message = `Estou interessado em ${service}`;
    }
    handleSendMessage(message);
  };

  const handleStartExperience = () => {
    setHasUserInteracted(true);
    console.log('✨ Usuário interagiu - desbloqueando áudio e iniciando experiência');

    // Agora que o usuário interagiu, pode falar a mensagem de boas-vindas
    setTimeout(() => {
      if (messages.length > 0) {
        const welcomeMessage = messages[0]; // First message is the welcome message
        if (welcomeMessage && welcomeMessage.role === 'assistant') {
          speakMessage(welcomeMessage.content, 'welcoming', true); // true = é intro
        }
      }
    }, 1000); // Delay para transição suave do overlay
  };

  // Show welcome overlay if user hasn't interacted yet
  if (!hasUserInteracted) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-leap-dark via-leap-surface to-leap-dark">
          {/* Main app content (blurred in background) */}
          <div className="opacity-30 blur-sm pointer-events-none">
            {/* Header Premium Compacto */}
            <header className="bg-leap-surface/80 backdrop-blur-xl border-b border-leap-border">
              <div className="container mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="relative">
                      <img
                        src="/logo-leapmotor.png"
                        alt="Leapmotor Brasil"
                        className="h-12 w-auto max-w-[140px] object-contain"
                      />
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-leap-green-neon rounded-full animate-pulse"></div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-leap-green-neon rounded-full animate-pulse"></div>
                        <span className="text-leap-green-primary font-medium text-sm">IA Neural Ativa</span>
                      </div>
                    </div>

                    <div className="px-3 py-1 bg-leap-green-soft border border-leap-green-primary/30 rounded-full backdrop-blur-sm">
                      <span className="text-leap-green-primary text-sm font-medium">🤖 Online</span>
                    </div>
                  </div>
                </div>
              </div>
            </header>

            {/* Preview of main content */}
            <main className="container mx-auto px-6 py-4">
              <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-120px)]">
                <div className="lg:w-[70%]">
                  <div className="h-full bg-leap-surface/60 backdrop-blur-xl rounded-2xl border border-leap-border p-6 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-32 h-32 mx-auto bg-leap-green-primary/20 rounded-2xl mb-4"></div>
                      <p className="text-leap-text-muted text-lg">LEA Avatar (Protagonista)</p>
                    </div>
                  </div>
                </div>
                <div className="lg:w-[30%]">
                  <div className="h-full bg-leap-surface/60 backdrop-blur-xl rounded-2xl border border-leap-border p-6 flex items-center justify-center">
                    <p className="text-leap-text-muted">Chat Compacto</p>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>

        {/* Welcome Overlay */}
        <WelcomeOverlay onStart={handleStartExperience} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-leap-dark via-leap-surface to-leap-dark">
      {/* Header Premium Compacto */}
      <header className="bg-leap-surface/80 backdrop-blur-xl border-b border-leap-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="relative">
                <img
                  src="/logo-leapmotor.png"
                  alt="Leapmotor Brasil"
                  className="h-12 w-auto max-w-[140px] object-contain"
                />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-leap-green-neon rounded-full animate-pulse"></div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-leap-green-neon rounded-full animate-pulse"></div>
                  <span className="text-leap-green-primary font-medium text-sm">IA Neural Ativa</span>
                </div>
              </div>

              <div className="px-3 py-1 bg-leap-green-soft border border-leap-green-primary/30 rounded-full backdrop-blur-sm">
                <span className="text-leap-green-primary text-sm font-medium">🤖 Online</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Layout UX/UI Otimizado */}
      <main className="container mx-auto px-6 py-4">
        {/* Layout Premium: LEA Protagonista com Chat Integrado */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 h-[calc(100vh-120px)]">

          {/* SEÇÃO PRINCIPAL: LEA + CHAT INTEGRADO */}
          <div className="flex-1 lg:w-[75%] flex flex-col space-y-3">

            {/* LEA AVATAR - Protagonista Absoluta */}
            <div className="flex-1 bg-leap-surface/70 backdrop-blur-xl rounded-2xl border border-leap-green-primary/20 relative overflow-hidden animate-fade-in shadow-2xl shadow-leap-green-primary/10">
              {/* Efeito de fundo premium mais intenso */}
              <div className="absolute inset-0 bg-gradient-to-br from-leap-green-primary/8 via-transparent to-leap-green-neon/8"></div>

              {/* Neural network background */}
              <div className="absolute inset-0 opacity-10">
                <svg width="100%" height="100%" viewBox="0 0 400 300">
                  <defs>
                    <radialGradient id="nodeGradient" cx="50%" cy="50%">
                      <stop offset="0%" stopColor="#00B74F" />
                      <stop offset="100%" stopColor="transparent" />
                    </radialGradient>
                  </defs>
                  {[...Array(12)].map((_, i) => (
                    <circle
                      key={i}
                      cx={50 + (i % 4) * 100}
                      cy={50 + Math.floor(i / 4) * 100}
                      r="3"
                      fill="url(#nodeGradient)"
                    />
                  ))}
                  {/* Connection lines */}
                  <path d="M 50 50 L 150 50 L 250 150 M 150 150 L 350 50"
                        stroke="#00B74F" strokeWidth="1" opacity="0.3" />
                </svg>
              </div>

              {/* LEA Avatar Centralizada */}
              <div className="relative z-10 h-full flex flex-col justify-center items-center">
                <div className="w-full h-full relative">
                  <Avatar
                    isSpeaking={isSpeaking}
                    emotion={avatarEmotion}
                    isListening={isListening}
                    isIdle={!isSpeaking && !isListening && !isThinking && !isPreparingToSpeak}
                    size="hero"
                    isIntro={isIntroSpeech}
                  />

                  {/* Status Dinâmico Discreto - Canto Superior Esquerdo */}
                  <div className="absolute top-4 left-4 z-20">
                    <div className="bg-black/20 backdrop-blur-sm rounded-full px-3 py-1 border border-white/10">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          isThinking ? 'bg-purple-400 animate-pulse' :
                          isPreparingToSpeak ? 'bg-yellow-400 animate-pulse' :
                          isSpeaking ? 'bg-leap-green-neon animate-pulse' :
                          isListening ? 'bg-cyan-400 animate-pulse' :
                          'bg-leap-green-primary'
                        }`} />
                        <span className="text-white/90 text-xs font-medium drop-shadow">
                          {isThinking ? 'Pensando' :
                           isPreparingToSpeak ? 'Preparando' :
                           isSpeaking ? 'Falando' :
                           isListening ? 'Ouvindo' :
                           'Ativa'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Indicador de Contexto Minimalista - Canto Inferior Esquerdo */}
                  <div className="absolute bottom-4 left-4 z-20">
                    <div className="bg-black/15 backdrop-blur-sm rounded-full px-2 py-1 border border-white/10">
                      <span className="text-white/70 text-xs font-medium capitalize drop-shadow">
                        {currentIntent.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Botão de Fala Central - Overlay Intuitivo */}
                  <div className="absolute bottom-6 lg:bottom-8 left-1/2 transform -translate-x-1/2 z-30">
                    <button
                      onClick={handleToggleListening}
                      className={`group relative p-3 lg:p-4 rounded-full transition-all duration-300 backdrop-blur-md border ${
                        isListening
                          ? 'bg-red-500/90 border-red-400/50 shadow-lg shadow-red-500/30 animate-pulse'
                          : 'bg-black/30 border-white/20 hover:bg-black/40 hover:border-white/30 shadow-lg hover:scale-105'
                      }`}
                      title={isListening ? 'Parar gravação' : 'Falar com a LEA'}
                    >
                      <Mic size={20} className="lg:w-6 lg:h-6 text-white drop-shadow-lg" />

                      {/* Onda visual quando ativo */}
                      {isListening && (
                        <div className="absolute inset-0 rounded-full border-2 border-red-400/50 animate-ping" />
                      )}
                    </button>
                  </div>

                  {/* LEA Identity Overlay - Elegant */}
                  <div className="absolute bottom-4 right-4 z-20">
                    <div className="bg-black/30 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20 shadow-lg">
                      <div className="text-white text-sm font-semibold drop-shadow-lg">
                        LEA
                      </div>
                      <div className="text-white/80 text-xs">
                        Recepcionista Digital Leapmotor
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* CHAT INTEGRADO - Fluindo da LEA */}
            <div className="h-52 lg:h-64 bg-leap-surface/30 backdrop-blur-xl rounded-2xl border border-leap-green-primary/10 animate-fade-in shadow-lg shadow-leap-green-primary/5">
              <ChatInterface
                messages={messages}
                onSendMessage={handleSendMessage}
                isListening={isListening}
                onToggleListening={handleToggleListening}
                isSpeaking={audioEnabled}
                onToggleSpeaking={handleToggleSpeaking}
              />
            </div>
          </div>

          {/* SIDEBAR DIREITA - Serviços e Veículos */}
          <div className="w-full lg:w-[25%] flex flex-col space-y-4">
            {/* Serviços Rápidos */}
            <div className="bg-leap-surface/60 backdrop-blur-xl rounded-2xl border border-leap-border p-4">
              <h3 className="text-leap-text-primary font-bold mb-4 text-center">Serviços</h3>
              <div className="grid grid-cols-2 gap-3">
                {/* Test-drive */}
                <button
                  onClick={() => handleSelectService('test-drive')}
                  className="group bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 hover:border-leap-green-primary/40 rounded-lg p-3 text-white transition-all duration-200 hover:bg-gray-800/60"
                >
                  <div className="flex flex-col items-center space-y-1">
                    <div className="text-xl opacity-80 group-hover:opacity-100 transition-opacity">🚗</div>
                    <span className="font-medium text-xs text-gray-300 group-hover:text-white transition-colors">Test-drive</span>
                  </div>
                </button>

                {/* Leap Café */}
                <button
                  onClick={() => handleSelectService('coffee')}
                  className="group bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 hover:border-amber-500/40 rounded-lg p-3 text-white transition-all duration-200 hover:bg-gray-800/60"
                >
                  <div className="flex flex-col items-center space-y-1">
                    <div className="text-xl opacity-80 group-hover:opacity-100 transition-opacity">☕</div>
                    <span className="font-medium text-xs text-gray-300 group-hover:text-white transition-colors">Leap Café</span>
                  </div>
                </button>

                {/* Consultor */}
                <button
                  onClick={() => handleSelectService('consultant')}
                  className="group bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 hover:border-blue-500/40 rounded-lg p-3 text-white transition-all duration-200 hover:bg-gray-800/60"
                >
                  <div className="flex flex-col items-center space-y-1">
                    <div className="text-xl opacity-80 group-hover:opacity-100 transition-opacity">👥</div>
                    <span className="font-medium text-xs text-gray-300 group-hover:text-white transition-colors">Consultor</span>
                  </div>
                </button>

                {/* Agendar */}
                <button
                  onClick={() => handleSelectService('schedule')}
                  className="group bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 hover:border-purple-500/40 rounded-lg p-3 text-white transition-all duration-200 hover:bg-gray-800/60"
                >
                  <div className="flex flex-col items-center space-y-1">
                    <div className="text-xl opacity-80 group-hover:opacity-100 transition-opacity">📅</div>
                    <span className="font-medium text-xs text-gray-300 group-hover:text-white transition-colors">Agendar</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Opções de Café Expandido */}
            {showCoffeeOptions && (
              <div className="bg-leap-surface/80 backdrop-blur-xl rounded-2xl border border-amber-500/30 p-4 animate-fade-in">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-leap-text-primary font-bold text-sm">Opções de Café</h3>
                  <button
                    onClick={() => setShowCoffeeOptions(false)}
                    className="text-leap-text-muted hover:text-leap-text-primary"
                  >
                    ✕
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleSelectService('coffee-espresso')}
                    className="group relative overflow-hidden rounded-lg bg-gradient-to-br from-amber-700 to-amber-900 p-3 text-white shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                    <div className="relative z-10 flex flex-col items-center space-y-1">
                      <div className="text-lg">☕</div>
                      <span className="font-medium text-xs text-center">Expresso</span>
                    </div>
                  </button>

                  <button
                    onClick={() => handleSelectService('coffee-double-espresso')}
                    className="group relative overflow-hidden rounded-lg bg-gradient-to-br from-amber-800 to-amber-900 p-3 text-white shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                    <div className="relative z-10 flex flex-col items-center space-y-1">
                      <div className="text-sm">☕☕</div>
                      <span className="font-medium text-xs text-center">Duplo</span>
                    </div>
                  </button>

                  <button
                    onClick={() => handleSelectService('coffee-latte')}
                    className="group relative overflow-hidden rounded-lg bg-gradient-to-br from-amber-600 to-amber-800 p-3 text-white shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                    <div className="relative z-10 flex flex-col items-center space-y-1">
                      <div className="text-lg">🥛</div>
                      <span className="font-medium text-xs text-center">C/ Leite</span>
                    </div>
                  </button>

                  <button
                    onClick={() => handleSelectService('coffee-cappuccino')}
                    className="group relative overflow-hidden rounded-lg bg-gradient-to-br from-amber-700 to-amber-900 p-3 text-white shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                    <div className="relative z-10 flex flex-col items-center space-y-1">
                      <div className="text-lg">☕</div>
                      <span className="font-medium text-xs text-center">Cappuccino</span>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Veículos */}
            <div className="flex-1 bg-leap-surface/60 backdrop-blur-xl rounded-2xl border border-leap-border p-4">
              <h3 className="text-leap-text-primary font-bold mb-3 text-center">Nossos Veículos</h3>
              <div className="max-h-[300px] overflow-y-auto">
                <VehicleCards onSelectVehicle={handleSelectVehicle} />
              </div>
            </div>

            {/* AI Insights */}
            <div className="hidden lg:block bg-leap-surface/60 backdrop-blur-xl rounded-2xl border border-leap-border p-4">
              <AIInsights
                currentIntent={currentIntent}
                emotion={avatarEmotion}
                isThinking={isThinking}
                isSpeaking={isSpeaking}
                isListening={isListening}
                messagesCount={messages.length}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer Premium */}
      <footer className="bg-leap-surface/80 backdrop-blur-xl border-t border-leap-border mt-8">
        <div className="container mx-auto px-6 py-6">
          <div className="text-center">
            <p className="text-sm text-leap-text-secondary">
              © 2024 Leapmotor Brasil - LEAP AI 4.0 Experiência Imersiva
            </p>
            <p className="text-xs text-leap-text-muted mt-1">
              Powered by Advanced Neural Networks
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

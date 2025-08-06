import { useState, useEffect } from 'react';
import { Avatar, type AvatarEmotion } from './components/Avatar';
import { ChatInterface } from './components/ChatInterface';
import { VehicleCards } from './components/VehicleCards';
import { ServiceOptions } from './components/ServiceOptions';
import { AIInsights } from './components/AIInsights';
import { openAIService, type Intent } from './services/openai';
import { openaiSpeechService } from './services/openaiSpeech';
import type { Message, Vehicle } from './types';

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [avatarEmotion, setAvatarEmotion] = useState<AvatarEmotion>('welcoming');
  const [currentIntent, setCurrentIntent] = useState<Intent>('general_conversation');
  const [isThinking, setIsThinking] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
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
      content: 'Olá! Bem-vindo à Leapmotor! Eu sou a Lea, sua assistente virtual. Como posso ajudá-lo hoje?',
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
    setAvatarEmotion('welcoming');
    
    // Marca como inicializado ANTES de falar para evitar duplicação
    setHasInitialized(true);
    
    // Fala automaticamente a mensagem de boas-vindas ao abrir (intro)
    setTimeout(() => {
      speakMessage(welcomeMessage.content, 'welcoming', true); // true = é intro
    }, 1000); // Delay maior para garantir que OpenAI TTS está completamente inicializado
  }, [hasInitialized]); // Adiciona hasInitialized como dependência

  const speakMessage = (text: string, emotion: AvatarEmotion = 'happy', isIntro: boolean = false) => {
    // Começa a mostrar vídeo imediatamente
    setIsSpeaking(true);
    setAvatarEmotion(emotion);
    setIsIntroSpeech(isIntro); // Define se é fala de intro

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

    console.log(`🎙️ Falando com emoção: ${emotion} -> ${emotionMap[emotion]}`);

    openaiSpeechService.speak(text, {
      emotion: emotionMap[emotion],
      speed: 1.0, // Velocidade normal para naturalidade
      voice: 'shimmer' // Voz feminina suave e fluida
    }, () => {
      // Delay maior para garantir que o vídeo continue até o fim do áudio
      setTimeout(() => {
        setIsSpeaking(false);
        setAvatarEmotion('neutral');
        setIsIntroSpeech(false); // Sempre volta para modo conversação após qualquer fala
        console.log('🔇 Fala concluída - transição suave para imagem');
      }, 500); // Delay maior para sincronizar com fim real do áudio
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

  const handleSelectService = (service: string) => {
    let message = '';
    switch (service) {
      case 'coffee':
        message = 'Gostaria de tomar um café enquanto conhecemos os veículos.';
        break;
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
        break;
      case 'coffee-double-espresso':
        message = 'Um expresso duplo seria perfeito!';
        break;
      case 'coffee-latte':
        message = 'Gostaria de um café com leite.';
        break;
      case 'coffee-cappuccino':
        message = 'Um cappuccino, por favor.';
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-leap-dark via-leap-surface to-leap-dark">
      {/* Header Premium Compacto */}
      <header className="bg-leap-surface/80 backdrop-blur-xl border-b border-leap-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-leap-green-primary to-leap-green-neon rounded-xl flex items-center justify-center shadow-lg animate-glow">
                  <span className="text-white font-bold text-xl">L</span>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-leap-green-neon rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-leap-text-primary">Leapmotor Brasil</h1>
                <p className="text-leap-green-primary text-sm font-medium">LEAP AI 4.0 • Experiência Imersiva</p>
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

      {/* Main Content - Layout Imersivo */}
      <main className="container mx-auto px-6 py-4">
        {/* Layout Imersivo com LEA como protagonista */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* LEA AVATAR - Protagonista da experiência */}
          <div className="xl:col-span-1">
            <div className="bg-leap-surface/60 backdrop-blur-xl rounded-2xl border border-leap-border p-6 relative overflow-hidden animate-fade-in">
              {/* Efeito de fundo premium */}
              <div className="absolute inset-0 bg-gradient-to-br from-leap-green-primary/5 via-transparent to-leap-green-neon/5"></div>
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

              {/* LEA Avatar - Protagonista Imersiva */}
              <div className="relative z-10">
                <Avatar
                  isSpeaking={isSpeaking}
                  emotion={avatarEmotion}
                  isListening={isListening}
                  isIdle={!isSpeaking && !isListening && !isThinking}
                  size="hero"
                  isIntro={isIntroSpeech}
                />

                {/* LEA Status Premium */}
                <div className="mt-4 text-center space-y-3">
                  <div>
                    <h2 className="text-2xl font-bold text-leap-text-primary mb-1">LEA</h2>
                    <p className="text-leap-green-primary text-sm font-medium">
                      Consultora Digital Avançada
                    </p>
                  </div>

                  {/* Status dinâmico premium */}
                  <div className="bg-leap-surface/80 backdrop-blur-sm rounded-xl px-4 py-2 border border-leap-border">
                    <p className="text-sm text-leap-text-secondary">
                      {isThinking ? '🧠 Pensando...' :
                       isSpeaking ? '💬 Conversando' :
                       isListening ? '👂 Escutando' :
                       '✨ Pronta para ajudar'}
                    </p>
                  </div>

                  {/* Mini indicadores */}
                  <div className="flex justify-center items-center gap-3 text-xs">
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${
                        isThinking ? 'bg-purple-400 animate-pulse' :
                        isSpeaking ? 'bg-leap-green-neon animate-pulse' :
                        isListening ? 'bg-cyan-400 animate-pulse' :
                        'bg-leap-border'
                      }`} />
                      <span className="text-leap-text-muted capitalize">
                        {currentIntent.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CHAT INTERFACE - Expandida e Premium */}
          <div className="xl:col-span-2 space-y-6">
            {/* Chat Interface Premium */}
            <div className="h-[600px] bg-leap-surface/60 backdrop-blur-xl rounded-2xl border border-leap-border animate-fade-in">
              <ChatInterface
                messages={messages}
                onSendMessage={handleSendMessage}
                isListening={isListening}
                onToggleListening={handleToggleListening}
                isSpeaking={audioEnabled}
                onToggleSpeaking={handleToggleSpeaking}
              />
            </div>

            {/* Painel de Serviços Premium */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ServiceOptions onSelectService={handleSelectService} />
              <VehicleCards onSelectVehicle={handleSelectVehicle} />
            </div>

            {/* AI Insights Melhorado */}
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

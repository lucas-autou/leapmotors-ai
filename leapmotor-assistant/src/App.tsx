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

  useEffect(() => {
    // Initialize services - agora só precisamos da chave OpenAI!
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY || 'demo';
    
    console.log('🚀 Inicializando LEAP AI v2.0 com OpenAI...');
    openAIService.initialize(apiKey);
    openaiSpeechService.initialize(apiKey);
    
    // Send welcome message
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: 'Olá! Bem-vindo à Leapmotor! 🌟 Eu sou a LEAP AI v2.0, sua assistente virtual super inteligente com voz neural OpenAI! Estou aqui para tornar sua experiência única e especial. Como posso começar a ajudá-lo hoje?',
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
    setAvatarEmotion('welcoming');
    
    // Speak welcome message with emotion
    if (audioEnabled) {
      speakMessage(welcomeMessage.content, 'welcoming');
    }
  }, [audioEnabled]);

  const speakMessage = (text: string, emotion: AvatarEmotion = 'happy') => {
    setIsSpeaking(true);
    setAvatarEmotion(emotion);
    
    // Mapear emoção do avatar para opções de voz OpenAI
    const emotionMap: Record<AvatarEmotion, 'neutral' | 'happy' | 'excited' | 'concerned' | 'cheerful' | 'friendly'> = {
      'neutral': 'neutral',
      'happy': 'happy',
      'thinking': 'neutral',
      'excited': 'excited',
      'curious': 'friendly',
      'concerned': 'concerned',
      'welcoming': 'cheerful'
    };

    console.log(`🎙️ Falando com emoção: ${emotion} -> ${emotionMap[emotion]}`);

    openaiSpeechService.speak(text, {
      emotion: emotionMap[emotion],
      speed: 1.0, // Velocidade normal para naturalidade
      voice: 'shimmer' // Voz feminina suave e fluida
    }, () => {
      setIsSpeaking(false);
      setAvatarEmotion('neutral');
      console.log('🔇 Fala concluída');
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
    <div className="min-h-screen bg-leap-dark">
      {/* Header Premium com foco na IA */}
      <header className="bg-gradient-to-r from-leap-dark via-gray-900 to-leap-dark border-b border-gray-700/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-leap-green-500 to-leap-green-600 rounded-full flex items-center justify-center shadow-2xl ring-2 ring-leap-green-500/30">
                  <span className="text-white font-bold text-3xl">L</span>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-leap-dark animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Leapmotor Brasil</h1>
                <p className="text-leap-green-400 text-lg font-medium">LEAP AI 3.0 • Recepção Digital Inteligente</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-400">Sistema de IA</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 font-medium text-sm">Neural Network Online</span>
                </div>
              </div>
              
              <div className="px-4 py-2 bg-gradient-to-r from-leap-green-500/20 to-cyan-500/20 rounded-full border border-leap-green-500/30 backdrop-blur-sm">
                <span className="text-leap-green-400 text-sm font-medium">🤖 IA Ativa</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Layout protagonista da IA */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left Column - IA PROTAGONISTA (3/5 = 60%) */}
          <div className="lg:col-span-3 space-y-6">
            {/* Hero Avatar Section */}
            <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-3xl shadow-2xl p-8 border border-gray-700 relative overflow-hidden">
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
              
              {/* Avatar Heroico */}
              <div className="relative z-10 flex flex-col items-center">
                <Avatar 
                  isSpeaking={isSpeaking} 
                  emotion={avatarEmotion} 
                  isListening={isListening}
                  isIdle={!isSpeaking && !isListening && !isThinking}
                  size="hero"
                />
                
                {/* AI Status Premium */}
                <div className="mt-6 text-center">
                  <h2 className="text-3xl font-bold text-white mb-2">LEAP AI 3.0</h2>
                  <p className="text-leap-green-400 text-lg font-medium mb-4">
                    Sua Consultora Digital Inteligente
                  </p>
                  
                  {/* Status dinâmico */}
                  <div className="bg-black/40 rounded-full px-4 py-2 backdrop-blur-sm border border-gray-600">
                    <p className="text-sm text-gray-300">
                      {isThinking ? '🧠 Analisando sua pergunta...' : 
                       isSpeaking ? '🗣️ Falando com você...' :
                       isListening ? '👂 Escutando atentamente...' :
                       '💭 Pronta para ajudar você'}
                    </p>
                  </div>

                  {/* Intent e confiança */}
                  <div className="mt-3 flex justify-center items-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${
                        isThinking ? 'bg-purple-400 animate-pulse' :
                        isSpeaking ? 'bg-green-500 animate-pulse' :
                        isListening ? 'bg-cyan-400 animate-pulse' :
                        'bg-gray-500'
                      }`} />
                      <span className="text-gray-400 capitalize">
                        {currentIntent.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-gray-500">•</div>
                    <span className="text-gray-400">IA Neural Ativa</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Chat Interface Otimizado */}
            <div className="h-[500px] bg-gray-800 rounded-2xl shadow-xl border border-gray-700">
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

          {/* Right Column - Serviços Compactos (2/5 = 40%) */}
          <div className="lg:col-span-2 space-y-4">
            {/* AI Insights Panel */}
            <AIInsights
              currentIntent={currentIntent}
              emotion={avatarEmotion}
              isThinking={isThinking}
              isSpeaking={isSpeaking}
              isListening={isListening}
              messagesCount={messages.length}
            />

            {/* Services Compactos */}
            <ServiceOptions onSelectService={handleSelectService} />

            {/* Vehicles Cards Menores */}
            <VehicleCards onSelectVehicle={handleSelectVehicle} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black text-white py-8 mt-16 border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-sm text-gray-400">
              © 2024 Leapmotor Brasil - Demo Técnico de Recepcionista Digital com IA
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Desenvolvido para demonstração de conceito
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
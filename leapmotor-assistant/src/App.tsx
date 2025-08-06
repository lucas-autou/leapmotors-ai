import { useState, useEffect } from 'react';
import { Avatar, type AvatarEmotion } from './components/Avatar';
import { ChatInterface } from './components/ChatInterface';
import { VehicleCards } from './components/VehicleCards';
import { ServiceOptions } from './components/ServiceOptions';
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
      speed: 0.95, // Velocidade otimizada para clareza
      voice: 'nova' // Voz feminina energética por padrão
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
    setAvatarEmotion('thinking');
    
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
      
      // Map intent to emotion
      const intentToEmotion: Record<Intent, AvatarEmotion> = {
        'greeting': 'welcoming',
        'vehicle_inquiry': 'curious',
        'test_drive_request': 'excited',
        'coffee_request': 'happy',
        'consultant_request': 'happy',
        'appointment_request': 'excited',
        'financing_inquiry': 'concerned',
        'sustainability_question': 'curious',
        'general_conversation': 'neutral',
        'goodbye': 'happy'
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-leap-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">L</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Leapmotor</h1>
                <p className="text-sm text-gray-600">Recepção Digital com IA</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                Online
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Avatar and Chat */}
          <div className="lg:col-span-1 space-y-6">
            {/* Avatar Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <Avatar 
                isSpeaking={isSpeaking} 
                emotion={avatarEmotion} 
                isListening={isListening}
                isIdle={!isSpeaking && !isListening && !isThinking}
              />
              <div className="mt-4 text-center">
                <h3 className="text-xl font-semibold text-gray-800">LEAP AI v2.0</h3>
                <p className="text-sm text-gray-600">
                  {isThinking ? 'Pensando...' : 
                   isSpeaking ? 'Falando...' :
                   isListening ? 'Escutando...' :
                   'Sua assistente virtual inteligente'}
                </p>
                {/* Status indicator adicional */}
                <div className="mt-2 flex justify-center items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    isThinking ? 'bg-blue-400 animate-pulse' :
                    isSpeaking ? 'bg-green-500 animate-pulse' :
                    isListening ? 'bg-purple-500 animate-pulse' :
                    'bg-gray-300'
                  }`} />
                  <span className="text-xs text-gray-500 capitalize">
                    {currentIntent.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>

            {/* Chat Interface */}
            <div className="h-[500px]">
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

          {/* Right Column - Services and Vehicles */}
          <div className="lg:col-span-2 space-y-8">
            {/* Services */}
            <ServiceOptions onSelectService={handleSelectService} />

            {/* Vehicles */}
            <VehicleCards onSelectVehicle={handleSelectVehicle} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
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
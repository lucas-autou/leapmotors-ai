import { useState, useEffect } from 'react';
import { Avatar } from './components/Avatar';
import { ChatInterface } from './components/ChatInterface';
import { VehicleCards } from './components/VehicleCards';
import { ServiceOptions } from './components/ServiceOptions';
import { openAIService } from './services/openai';
import { speechService } from './services/speech';
import { Message, Vehicle } from './types';

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [avatarEmotion, setAvatarEmotion] = useState<'neutral' | 'happy' | 'thinking'>('neutral');

  useEffect(() => {
    // Initialize OpenAI with demo mode (no API key required for demo)
    openAIService.initialize('demo');
    
    // Send welcome message
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: 'Olá! Bem-vindo à Leapmotor! 😊 Eu sou a LEAP AI, sua assistente virtual. Como posso ajudá-lo hoje?',
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
    
    if (audioEnabled) {
      speakMessage(welcomeMessage.content);
    }
  }, []);

  const speakMessage = (text: string) => {
    setIsSpeaking(true);
    setAvatarEmotion('happy');
    speechService.speak(text, () => {
      setIsSpeaking(false);
      setAvatarEmotion('neutral');
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
    
    // Set thinking emotion
    setAvatarEmotion('thinking');
    
    // Get AI response
    const conversationHistory = messages.map(m => ({
      role: m.role,
      content: m.content
    }));
    
    const response = await openAIService.getResponse(content, conversationHistory);
    
    // Add assistant response
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, assistantMessage]);
    
    // Speak response if audio is enabled
    if (audioEnabled) {
      speakMessage(response);
    } else {
      setAvatarEmotion('neutral');
    }
  };

  const handleToggleListening = () => {
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
    } else {
      setIsListening(true);
      speechService.startListening(
        (transcript) => {
          setIsListening(false);
          handleSendMessage(transcript);
        },
        (error) => {
          console.error('Speech recognition error:', error);
          setIsListening(false);
          alert(error);
        },
        () => {
          setIsListening(false);
        }
      );
    }
  };

  const handleToggleSpeaking = () => {
    if (audioEnabled) {
      speechService.stopSpeaking();
      setAudioEnabled(false);
      setIsSpeaking(false);
    } else {
      setAudioEnabled(true);
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
              <Avatar isSpeaking={isSpeaking} emotion={avatarEmotion} />
              <div className="mt-4 text-center">
                <h3 className="text-xl font-semibold text-gray-800">LEAP AI</h3>
                <p className="text-sm text-gray-600">Sua assistente virtual</p>
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
import { motion } from 'framer-motion';
import { Brain, Target, Heart, Zap, MessageCircle } from 'lucide-react';
import type { Intent } from '../services/openai';
import type { AvatarEmotion } from './Avatar';

interface AIInsightsProps {
  currentIntent: Intent;
  emotion: AvatarEmotion;
  isThinking: boolean;
  isSpeaking: boolean;
  isListening: boolean;
  messagesCount: number;
}

export const AIInsights: React.FC<AIInsightsProps> = ({
  currentIntent,
  emotion,
  isThinking,
  isSpeaking,
  isListening,
  messagesCount
}) => {
  // Mapear intent para descrição amigável
  const intentDescriptions: Record<Intent, string> = {
    'greeting': 'Recepcionando visitante',
    'vehicle_inquiry': 'Consulta sobre veículos',
    'test_drive_request': 'Interesse em test-drive',
    'coffee_request': 'Solicitação de café',
    'consultant_request': 'Pedido de consultor',
    'appointment_request': 'Agendamento de visita',
    'financing_inquiry': 'Dúvida sobre financiamento',
    'sustainability_question': 'Questão sobre sustentabilidade',
    'general_conversation': 'Conversa geral',
    'goodbye': 'Despedida'
  };

  // Mapear emoções para cores e ícones
  const emotionConfig: Record<AvatarEmotion, { color: string; bgColor: string; description: string }> = {
    'welcoming': { color: 'text-green-400', bgColor: 'bg-green-400/20', description: 'Acolhedora' },
    'professional': { color: 'text-blue-400', bgColor: 'bg-blue-400/20', description: 'Profissional' },
    'curious': { color: 'text-cyan-400', bgColor: 'bg-cyan-400/20', description: 'Curiosa' },
    'excited': { color: 'text-yellow-400', bgColor: 'bg-yellow-400/20', description: 'Animada' },
    'thinking': { color: 'text-purple-400', bgColor: 'bg-purple-400/20', description: 'Pensativa' },
    'concerned': { color: 'text-orange-400', bgColor: 'bg-orange-400/20', description: 'Preocupada' },
    'happy': { color: 'text-green-400', bgColor: 'bg-green-400/20', description: 'Feliz' },
    'confident': { color: 'text-indigo-400', bgColor: 'bg-indigo-400/20', description: 'Confiante' },
    'empathetic': { color: 'text-pink-400', bgColor: 'bg-pink-400/20', description: 'Empática' },
    'processing': { color: 'text-purple-400', bgColor: 'bg-purple-400/20', description: 'Processando' },
    'surprised': { color: 'text-yellow-400', bgColor: 'bg-yellow-400/20', description: 'Surpresa' },
    'satisfied': { color: 'text-green-400', bgColor: 'bg-green-400/20', description: 'Satisfeita' },
    'neutral': { color: 'text-gray-400', bgColor: 'bg-gray-400/20', description: 'Neutra' }
  };

  // Calcular nível de confiança baseado no estado
  const getConfidenceLevel = (): number => {
    if (isThinking) return 45;
    if (currentIntent === 'general_conversation') return 75;
    if (['vehicle_inquiry', 'test_drive_request', 'financing_inquiry'].includes(currentIntent)) return 95;
    return 85;
  };

  const confidenceLevel = getConfidenceLevel();
  const emotionData = emotionConfig[emotion];

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-4 h-4 text-purple-400" />
        <h3 className="text-sm font-semibold text-white">AI Insights</h3>
      </div>

      <div className="space-y-3">
        {/* Estado Mental */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-400">Estado:</span>
          </div>
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${emotionData.bgColor}`}>
            <div className={`w-2 h-2 rounded-full ${emotionData.color.replace('text-', 'bg-')}`} />
            <span className={emotionData.color}>{emotionData.description}</span>
          </div>
        </div>

        {/* Intenção Detectada */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-400">Intenção:</span>
          </div>
          <span className="text-xs text-leap-green-400 font-medium">
            {intentDescriptions[currentIntent]}
          </span>
        </div>

        {/* Nível de Confiança */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Zap className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-400">Confiança:</span>
            </div>
            <span className="text-xs text-white font-medium">{confidenceLevel}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-1.5">
            <motion.div
              className="bg-gradient-to-r from-leap-green-500 to-leap-green-400 h-1.5 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${confidenceLevel}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Status de Atividade */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-400">Status:</span>
          </div>
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${
              isThinking ? 'bg-purple-400 animate-pulse' :
              isSpeaking ? 'bg-green-500 animate-pulse' :
              isListening ? 'bg-cyan-400 animate-pulse' :
              'bg-gray-500'
            }`} />
            <span className="text-xs text-white">
              {isThinking ? 'Processando' :
               isSpeaking ? 'Falando' :
               isListening ? 'Escutando' :
               'Ativo'}
            </span>
          </div>
        </div>

        {/* Contador de Mensagens */}
        <div className="pt-2 border-t border-gray-700/50">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Conversas:</span>
            <span className="text-xs text-gray-400">{messagesCount} mensagens</span>
          </div>
        </div>

        {/* Próxima Ação Sugerida */}
        {!isThinking && !isSpeaking && !isListening && (
          <div className="mt-3 p-2 bg-leap-green-500/10 rounded-lg border border-leap-green-500/20">
            <p className="text-xs text-leap-green-400">
              💡 Sugestão: {
                currentIntent === 'vehicle_inquiry' ? 'Oferecer test-drive' :
                currentIntent === 'test_drive_request' ? 'Agendar horário' :
                currentIntent === 'financing_inquiry' ? 'Conectar com consultor' :
                'Perguntar como mais posso ajudar'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
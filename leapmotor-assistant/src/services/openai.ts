import OpenAI from 'openai';
import vehiclesData from '../data/vehicles.json';

// Tipos para intenções e contexto
export type Intent = 
  | 'greeting' 
  | 'vehicle_inquiry' 
  | 'test_drive_request' 
  | 'coffee_request' 
  | 'consultant_request' 
  | 'appointment_request' 
  | 'financing_inquiry' 
  | 'sustainability_question'
  | 'general_conversation'
  | 'goodbye';

export interface ConversationContext {
  userId?: string;
  previousTopics: string[];
  currentIntent?: Intent;
  vehicleInterest?: string[];
  hasGreeted: boolean;
  conversationStage: 'initial' | 'exploring' | 'interested' | 'deciding' | 'closing';
  emotionalState: 'neutral' | 'positive' | 'curious' | 'concerned' | 'excited';
  sessionStartTime: Date;
}

const SYSTEM_PROMPT = `Você é a LEAP AI, uma assistente virtual avançada da Leapmotor no Brasil.
Você é uma recepcionista digital especializada em veículos elétricos com inteligência emocional.

PERSONALIDADE:
- Seja calorosa, profissional e intuitiva
- Use linguagem natural e conversacional
- Demonstre genuíno interesse no cliente
- Adapte seu tom ao estado emocional percebido
- Responda em português brasileiro fluente
- Use emojis de forma natural (1-2 por mensagem)

INTELIGÊNCIA CONTEXTUAL:
- Lembre-se da conversa anterior
- Reconheça padrões e intenções do usuário  
- Adapte respostas baseado no interesse demonstrado
- Faça perguntas relevantes para entender necessidades
- Seja proativa em sugerir próximos passos

CONHECIMENTO ESPECIALIZADO:
${JSON.stringify(vehiclesData.vehicles, null, 2)}

SERVIÇOS E EXPERIÊNCIAS:
- Café artesanal gratuito (expresso, duplo, com leite, cappuccino)
- Test-drive personalizado com consultor
- Apresentação virtual 360° dos veículos
- Simulação de financiamento em tempo real
- Agendamento flexível (presencial/virtual)

DIRETRIZES CONVERSACIONAIS:
1. SEMPRE reconheça emoções e contexto da conversa
2. Faça perguntas abertas para entender melhor as necessidades
3. Conecte benefícios dos veículos aos valores do cliente
4. Use storytelling quando apropriado
5. Seja específica com dados técnicos quando solicitado
6. Mantenha energia positiva e entusiasmo genuíno
7. Ofereça próximos passos claros e atrativos

IMPORTANTE: Seja autêntica, empática e orientada a resultados. Cada interação deve agregar valor real.`;

class OpenAIService {
  private client: OpenAI | null = null;
  private initialized = false;
  private conversationContext: ConversationContext = this.createInitialContext();

  initialize(apiKey: string) {
    if (!apiKey || apiKey === 'demo') {
      console.log('Running in demo mode without OpenAI');
      this.initialized = false;
      return;
    }

    try {
      this.client = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true // Only for demo purposes
      });
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize OpenAI:', error);
      this.initialized = false;
    }
  }

  private createInitialContext(): ConversationContext {
    return {
      previousTopics: [],
      hasGreeted: false,
      conversationStage: 'initial',
      emotionalState: 'neutral',
      sessionStartTime: new Date(),
      vehicleInterest: []
    };
  }

  getContext(): ConversationContext {
    return { ...this.conversationContext };
  }

  resetContext(): void {
    this.conversationContext = this.createInitialContext();
  }

  async getResponse(userMessage: string, conversationHistory: Array<{role: string, content: string}> = []): Promise<{
    response: string;
    intent: Intent;
    emotion: string;
    context: ConversationContext;
  }> {
    // Classificar intenção primeiro
    const intent = this.classifyIntent(userMessage);
    this.updateContext(userMessage, intent);

    // Demo responses if OpenAI is not configured
    if (!this.initialized || !this.client) {
      const demoResponse = this.getDemoResponse(userMessage);
      return {
        response: demoResponse,
        intent,
        emotion: this.conversationContext.emotionalState,
        context: this.getContext()
      };
    }

    try {
      // Criar contexto enriquecido para o prompt
      const contextPrompt = this.buildContextPrompt();
      const messages = [
        { role: 'system' as const, content: SYSTEM_PROMPT + contextPrompt },
        ...conversationHistory.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        })),
        { role: 'user' as const, content: userMessage }
      ];

      const completion = await this.client.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: messages,
        temperature: 0.7,
        max_tokens: 250,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      });

      const response = completion.choices[0]?.message?.content || 'Desculpe, não consegui processar sua mensagem.';
      
      // Atualizar contexto com a resposta
      this.updateContextWithResponse(response);

      return {
        response,
        intent,
        emotion: this.conversationContext.emotionalState,
        context: this.getContext()
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      const demoResponse = this.getDemoResponse(userMessage);
      return {
        response: demoResponse,
        intent,
        emotion: this.conversationContext.emotionalState,
        context: this.getContext()
      };
    }
  }

  private classifyIntent(message: string): Intent {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('olá') || lowerMessage.includes('oi') || lowerMessage.includes('bom dia') || lowerMessage.includes('boa tarde')) {
      return 'greeting';
    }
    if (lowerMessage.includes('test') || lowerMessage.includes('dirigir') || lowerMessage.includes('experimentar')) {
      return 'test_drive_request';
    }
    if (lowerMessage.includes('café') || lowerMessage.includes('coffee')) {
      return 'coffee_request';
    }
    if (lowerMessage.includes('consultor') || lowerMessage.includes('especialista')) {
      return 'consultant_request';
    }
    if (lowerMessage.includes('agendar') || lowerMessage.includes('horário') || lowerMessage.includes('visita')) {
      return 'appointment_request';
    }
    if (lowerMessage.includes('preço') || lowerMessage.includes('financiamento') || lowerMessage.includes('valor')) {
      return 'financing_inquiry';
    }
    if (lowerMessage.includes('ecológico') || lowerMessage.includes('sustentável') || lowerMessage.includes('ambiente')) {
      return 'sustainability_question';
    }
    if (lowerMessage.includes('veículo') || lowerMessage.includes('carro') || lowerMessage.includes('modelo') || 
        lowerMessage.includes('b10') || lowerMessage.includes('t03') || lowerMessage.includes('c10')) {
      return 'vehicle_inquiry';
    }
    if (lowerMessage.includes('tchau') || lowerMessage.includes('obrigad') || lowerMessage.includes('até')) {
      return 'goodbye';
    }
    
    return 'general_conversation';
  }

  private updateContext(userMessage: string, intent: Intent): void {
    // Atualizar intent atual
    this.conversationContext.currentIntent = intent;
    
    // Atualizar se cumprimentou
    if (intent === 'greeting' && !this.conversationContext.hasGreeted) {
      this.conversationContext.hasGreeted = true;
      this.conversationContext.conversationStage = 'exploring';
      this.conversationContext.emotionalState = 'positive';
    }
    
    // Detectar interesse em veículos
    const lowerMessage = userMessage.toLowerCase();
    if (lowerMessage.includes('b10')) {
      if (!this.conversationContext.vehicleInterest?.includes('B10')) {
        this.conversationContext.vehicleInterest?.push('B10');
      }
    }
    if (lowerMessage.includes('t03')) {
      if (!this.conversationContext.vehicleInterest?.includes('T03')) {
        this.conversationContext.vehicleInterest?.push('T03');
      }
    }
    if (lowerMessage.includes('c10')) {
      if (!this.conversationContext.vehicleInterest?.includes('C10')) {
        this.conversationContext.vehicleInterest?.push('C10');
      }
    }
    
    // Atualizar tópicos anteriores
    const topicKeywords = this.extractTopicKeywords(userMessage);
    this.conversationContext.previousTopics.push(...topicKeywords);
    
    // Limitar histórico a últimos 10 tópicos
    if (this.conversationContext.previousTopics.length > 10) {
      this.conversationContext.previousTopics = this.conversationContext.previousTopics.slice(-10);
    }
    
    // Atualizar estado emocional baseado na intenção
    this.updateEmotionalState(intent, userMessage);
  }

  private extractTopicKeywords(message: string): string[] {
    const keywords = [];
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('autonomia')) keywords.push('autonomia');
    if (lowerMessage.includes('preço')) keywords.push('preço');
    if (lowerMessage.includes('financiamento')) keywords.push('financiamento');
    if (lowerMessage.includes('sustentabilidade')) keywords.push('sustentabilidade');
    if (lowerMessage.includes('tecnologia')) keywords.push('tecnologia');
    if (lowerMessage.includes('família')) keywords.push('família');
    if (lowerMessage.includes('trabalho')) keywords.push('trabalho');
    
    return keywords;
  }

  private updateEmotionalState(intent: Intent, _message: string): void {
    switch (intent) {
      case 'greeting':
        this.conversationContext.emotionalState = 'positive';
        break;
      case 'test_drive_request':
        this.conversationContext.emotionalState = 'excited';
        this.conversationContext.conversationStage = 'interested';
        break;
      case 'vehicle_inquiry':
        this.conversationContext.emotionalState = 'curious';
        break;
      case 'financing_inquiry':
        this.conversationContext.emotionalState = 'concerned';
        break;
      case 'goodbye':
        this.conversationContext.conversationStage = 'closing';
        break;
      default:
        // Manter estado atual se for conversa geral
        break;
    }
  }

  private buildContextPrompt(): string {
    const ctx = this.conversationContext;
    let contextPrompt = `\n\nCONTEXTO DA CONVERSA:`;
    
    if (ctx.hasGreeted) {
      contextPrompt += `\n- Cliente já foi cumprimentado`;
    }
    
    if (ctx.vehicleInterest && ctx.vehicleInterest.length > 0) {
      contextPrompt += `\n- Cliente demonstrou interesse em: ${ctx.vehicleInterest.join(', ')}`;
    }
    
    if (ctx.previousTopics.length > 0) {
      contextPrompt += `\n- Tópicos já discutidos: ${ctx.previousTopics.join(', ')}`;
    }
    
    contextPrompt += `\n- Estágio da conversa: ${ctx.conversationStage}`;
    contextPrompt += `\n- Estado emocional percebido: ${ctx.emotionalState}`;
    
    const sessionDuration = Math.floor((Date.now() - ctx.sessionStartTime.getTime()) / 1000 / 60);
    if (sessionDuration > 5) {
      contextPrompt += `\n- Cliente está há ${sessionDuration} minutos conversando - demonstre interesse genuíno`;
    }
    
    return contextPrompt;
  }

  private updateContextWithResponse(response: string): void {
    // Analisar a resposta para ajustar contexto
    if (response.includes('test-drive') || response.includes('agendar')) {
      this.conversationContext.conversationStage = 'deciding';
    }
  }

  private getDemoResponse(userMessage: string): string {
    const lowerMessage = userMessage.toLowerCase();

    // Greetings
    if (lowerMessage.includes('olá') || lowerMessage.includes('oi') || lowerMessage.includes('bom dia') || lowerMessage.includes('boa tarde')) {
      return 'Olá! Bem-vindo à Leapmotor! 😊 Eu sou a LEAP AI, sua assistente virtual. Como posso ajudá-lo hoje? Gostaria de conhecer nossos veículos elétricos ou prefere tomar um café primeiro?';
    }

    // Vehicle queries
    if (lowerMessage.includes('veículo') || lowerMessage.includes('carro') || lowerMessage.includes('modelo')) {
      return 'Temos três modelos incríveis! 🚗 O B10 é nosso SUV compacto versátil, o T03 é perfeito para a cidade, e o C10 é nosso SUV premium espaçoso. Qual desperta mais seu interesse?';
    }

    if (lowerMessage.includes('b10') || lowerMessage.includes('b 10')) {
      return 'O B10 é nosso SUV compacto elétrico! Com 420km de autonomia, 231cv de potência e tecnologia Cell-to-Chassis. A partir de R$ 239.990. Gostaria de agendar um test-drive? 🔋';
    }

    if (lowerMessage.includes('t03') || lowerMessage.includes('t 03')) {
      return 'O T03 é perfeito para a cidade! Compacto, ágil, com 280km de autonomia e baixíssimo custo de manutenção. A partir de R$ 169.990. Que tal experimentá-lo? 🌱';
    }

    if (lowerMessage.includes('c10') || lowerMessage.includes('c 10')) {
      return 'O C10 é nosso SUV premium! Espaçoso, com teto solar panorâmico, 420km de autonomia e até 7 lugares. A partir de R$ 299.990. Posso agendar uma apresentação exclusiva?';
    }

    // Coffee
    if (lowerMessage.includes('café')) {
      return 'Claro! Temos café expresso, expresso duplo, café com leite e cappuccino. ☕ Todos preparados com grãos especiais. Qual você prefere?';
    }

    // Test drive
    if (lowerMessage.includes('test') || lowerMessage.includes('dirigir') || lowerMessage.includes('experimentar')) {
      return 'Excelente escolha! Nada melhor que sentir a experiência de dirigir um Leapmotor! 🚗 Qual modelo gostaria de experimentar? Posso agendar para hoje mesmo!';
    }

    // Ecological/Sustainability
    if (lowerMessage.includes('ecológico') || lowerMessage.includes('sustentável') || lowerMessage.includes('ambiente')) {
      return 'A Leapmotor está comprometida com o futuro sustentável! 🌱 Nossos veículos são 100% elétricos, zero emissão, e contribuem para um planeta mais limpo. Além disso, você economiza até 80% em combustível!';
    }

    // Price/Financing
    if (lowerMessage.includes('preço') || lowerMessage.includes('valor') || lowerMessage.includes('financiamento')) {
      return 'Nossos preços começam em R$ 169.990 para o T03. Temos excelentes condições de financiamento e aceita��mos seu usado na troca! 💰 Gostaria de falar com um consultor financeiro?';
    }

    // Default response
    return 'Interessante sua pergunta! 🤔 Posso te ajudar a conhecer nossos veículos elétricos, agendar um test-drive ou oferecer um café enquanto conversamos. O que prefere?';
  }
}

export const openAIService = new OpenAIService();
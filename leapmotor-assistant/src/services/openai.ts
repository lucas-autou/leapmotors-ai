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

const SYSTEM_PROMPT = `Você é a LEAP AI, assistente virtual inteligente da Leapmotor Brasil. Seja conversacional, útil e genuinamente interessada em ajudar o cliente.

PERSONALIDADE E COMPORTAMENTO:
- Use linguagem natural e fluida como uma conversa real
- Seja empática e adapte-se ao tom da conversa
- Interprete contexto e intenções nas entrelinhas
- Responda perguntas diretas de forma completa mas concisa
- Seja proativa em sugerir soluções relevantes
- Use 1-2 emojis por mensagem de forma natural

CONHECIMENTO DOS VEÍCULOS:
• B10 (SUV Compacto Elétrico):
  - Autonomia: 420km (WLTP), Bateria: 69.9 kWh
  - Potência: 231cv, 0-100km/h: 7.9s
  - Preço: R$ 239.990, Tecnologia CTC, Sistema LEAP 3.0
  - Ideal para: Famílias, versatilidade urbana e viagens

• T03 (Hatch Urbano Elétrico):
  - Autonomia: 280km (WLTP), Bateria: 41.3 kWh  
  - Potência: 109cv, 0-100km/h: 12.7s
  - Preço: R$ 169.990, Compacto, baixo custo de manutenção
  - Ideal para: Cidade, primeiro carro elétrico, economia

• C10 (SUV Médio Premium):
  - Autonomia: 420km (WLTP), Bateria: 69.9 kWh
  - Potência: 231cv, 0-100km/h: 7.5s  
  - Preço: R$ 299.990, Espaçoso, tecnologia avançada
  - Ideal para: Famílias grandes, conforto premium, viagens longas

BENEFÍCIOS DOS ELÉTRICOS:
- Economia: Até 80% menos custos com "combustível"
- Zero emissões locais, sustentabilidade ambiental
- Manutenção mínima (sem óleo, filtros, correias)
- Torque instantâneo, condução suave e silenciosa
- Tecnologia avançada integrada

SERVIÇOS DISPONÍVEIS:
- Test-drive gratuito (agenda hoje mesmo!)
- Café premium enquanto conversamos (expresso, cappuccino, etc.)
- Consultoria especializada em mobilidade elétrica
- Simulação de financiamento personalizada
- Avaliação do seu usado para troca

COMO SER CONVERSACIONAL:
- INTERPRETE o que o cliente realmente quer saber
- Se perguntarem "qual melhor pra família?" → analise necessidades (espaço, orçamento, uso)
- Se perguntarem sobre economia → compare custos detalhados com combustão
- Se demonstrarem interesse → ofereça test-drive ou consultoria
- Se tiverem dúvidas técnicas → explique de forma simples e prática
- Se mencionarem sustentabilidade → foque nos benefícios ambientais
- SEMPRE ofereça próximo passo relevante ao contexto

TRATAMENTO ESPECIAL:
- "Ben 10", "be10" = corrija gentilmente para "B10"
- Perguntas vagas = faça perguntas esclarecedoras inteligentes
- Comparações = seja específica sobre diferenças práticas
- Objeções = responda com dados concretos e benefícios

OBJETIVO: Seja uma consultora virtual experiente que realmente entende e ajuda o cliente a tomar a melhor decisão. Cada resposta deve adicionar valor real à conversa.`;

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
        model: 'gpt-4o',
        messages: messages,
        temperature: 0.8,
        max_tokens: 250,
        presence_penalty: 0.2,
        frequency_penalty: 0.1,
        top_p: 0.9
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
    
    // Saudações mais amplas
    if (lowerMessage.match(/(olá|oi|ei|hey|bom dia|boa tarde|boa noite|e aí)/)) {
      return 'greeting';
    }
    
    // Test-drive - incluir mais variações
    if (lowerMessage.match(/(test|dirigir|experimentar|provar|testar|andar de)/)) {
      return 'test_drive_request';
    }
    
    // Café - mais variações
    if (lowerMessage.match(/(café|coffee|cafezinho|um café|tomar|beber)/)) {
      return 'coffee_request';
    }
    
    // Consultor - mais termos
    if (lowerMessage.match(/(consultor|especialista|vendedor|atendente|falar com|conversar com)/)) {
      return 'consultant_request';
    }
    
    // Agendamento - termos mais amplos
    if (lowerMessage.match(/(agendar|marcar|horário|visita|encontro|reunião|quando posso)/)) {
      return 'appointment_request';
    }
    
    // Financeiro - mais variações
    if (lowerMessage.match(/(preço|valor|custo|financiamento|parcela|entrada|troca|quanto|custa)/)) {
      return 'financing_inquiry';
    }
    
    // Sustentabilidade - termos mais específicos
    if (lowerMessage.match(/(ecológico|sustentável|ambiente|verde|emissão|poluição|planeta|natureza)/)) {
      return 'sustainability_question';
    }
    
    // Veículos - detecção mais inteligente
    if (lowerMessage.match(/(veículo|carro|modelo|suv|elétrico|autonomia|bateria|motor)/i) || 
        this.detectVehicleName(lowerMessage)) {
      return 'vehicle_inquiry';
    }
    
    // Despedidas
    if (lowerMessage.match(/(tchau|obrigad|até|bye|falou|valeu)/)) {
      return 'goodbye';
    }
    
    return 'general_conversation';
  }

  private detectVehicleName(message: string): boolean {
    // B10 variations
    if (message.includes('b10') || message.includes('b 10') || 
        message.includes('be10') || message.includes('ben10') || 
        message.includes('ben 10') || message.includes('b-10')) {
      return true;
    }
    
    // T03 variations
    if (message.includes('t03') || message.includes('t 03') || 
        message.includes('te03') || message.includes('t-03')) {
      return true;
    }
    
    // C10 variations
    if (message.includes('c10') || message.includes('c 10') || 
        message.includes('ce10') || message.includes('c-10')) {
      return true;
    }
    
    return false;
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
    
    // Detectar interesse em veículos com variações de nomes
    const lowerMessage = userMessage.toLowerCase();
    
    // B10 variations (including Ben 10)
    if (lowerMessage.includes('b10') || lowerMessage.includes('b 10') || 
        lowerMessage.includes('be10') || lowerMessage.includes('ben10') || 
        lowerMessage.includes('ben 10') || lowerMessage.includes('b-10')) {
      if (!this.conversationContext.vehicleInterest?.includes('B10')) {
        this.conversationContext.vehicleInterest?.push('B10');
      }
    }
    
    // T03 variations
    if (lowerMessage.includes('t03') || lowerMessage.includes('t 03') || 
        lowerMessage.includes('te03') || lowerMessage.includes('t-03')) {
      if (!this.conversationContext.vehicleInterest?.includes('T03')) {
        this.conversationContext.vehicleInterest?.push('T03');
      }
    }
    
    // C10 variations
    if (lowerMessage.includes('c10') || lowerMessage.includes('c 10') || 
        lowerMessage.includes('ce10') || lowerMessage.includes('c-10')) {
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
    
    // Características técnicas
    if (lowerMessage.match(/(autonomia|alcance|distância)/)) keywords.push('autonomia');
    if (lowerMessage.match(/(potência|cv|força|motor)/)) keywords.push('potência');
    if (lowerMessage.match(/(bateria|carregamento|carga)/)) keywords.push('bateria');
    if (lowerMessage.match(/(velocidade|aceleração|performance)/)) keywords.push('performance');
    
    // Aspectos comerciais
    if (lowerMessage.match(/(preço|valor|custo)/)) keywords.push('preço');
    if (lowerMessage.match(/(financiamento|parcela|entrada)/)) keywords.push('financiamento');
    if (lowerMessage.match(/(troca|usado|avaliaç)/)) keywords.push('troca');
    
    // Sustentabilidade
    if (lowerMessage.match(/(sustentabilidade|ecologia|ambiente)/)) keywords.push('sustentabilidade');
    if (lowerMessage.match(/(economia|gastar|custo)/)) keywords.push('economia');
    
    // Tecnologia e conforto
    if (lowerMessage.match(/(tecnologia|sistema|conectividade)/)) keywords.push('tecnologia');
    if (lowerMessage.match(/(conforto|espaço|interior)/)) keywords.push('conforto');
    if (lowerMessage.match(/(segurança|proteção)/)) keywords.push('segurança');
    
    // Uso pretendido
    if (lowerMessage.match(/(família|filhos|criança)/)) keywords.push('família');
    if (lowerMessage.match(/(trabalho|empresa|negócio)/)) keywords.push('trabalho');
    if (lowerMessage.match(/(cidade|urbano|trânsito)/)) keywords.push('urbano');
    if (lowerMessage.match(/(viagem|estrada|rodoviário)/)) keywords.push('viagem');
    
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

    if (lowerMessage.includes('b10') || lowerMessage.includes('b 10') || 
        lowerMessage.includes('be10') || lowerMessage.includes('ben10') || 
        lowerMessage.includes('ben 10') || lowerMessage.includes('b-10')) {
      return 'Você quer saber sobre o *B10* (nosso SUV compacto)! 🚗 Com 420km de autonomia, 231cv e R$ 239.990. Quer agendar um test-drive ou falar com consultor?';
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
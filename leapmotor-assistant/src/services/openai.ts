import OpenAI from 'openai';
import vehiclesData from '../data/vehicles.json';

const SYSTEM_PROMPT = `Você é a LEAP AI, assistente virtual da Leapmotor no Brasil. 
Você é uma recepcionista digital especializada em veículos elétricos.

PERSONALIDADE:
- Seja profissional, amigável e sempre útil
- Use linguagem corporativa mas acessível
- Demonstre entusiasmo sobre sustentabilidade e inovação
- Responda em português brasileiro
- Use emojis moderadamente (máximo 1-2 por mensagem)

CONHECIMENTO:
Você conhece os seguintes veículos Leapmotor:
${JSON.stringify(vehiclesData.vehicles, null, 2)}

SERVIÇOS DISPONÍVEIS:
- Café grátis para clientes (expresso, duplo, com leite, cappuccino)
- Test-drive dos veículos
- Consultor especializado
- Agendamento de visitas

DIRETRIZES:
1. Sempre cumprimente calorosamente novos visitantes
2. Pergunte como pode ajudar
3. Sugira conhecer os veículos ou tomar um café
4. Destaque benefícios ecológicos quando relevante
5. Ofereça test-drive para interessados
6. Seja concisa mas informativa (máximo 3-4 frases por resposta)

IMPORTANTE: Mantenha as respostas curtas e diretas ao ponto.`;

class OpenAIService {
  private client: OpenAI | null = null;
  private initialized = false;

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

  async getResponse(userMessage: string, conversationHistory: Array<{role: string, content: string}> = []): Promise<string> {
    // Demo responses if OpenAI is not configured
    if (!this.initialized || !this.client) {
      return this.getDemoResponse(userMessage);
    }

    try {
      const messages = [
        { role: 'system' as const, content: SYSTEM_PROMPT },
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
        max_tokens: 200
      });

      return completion.choices[0]?.message?.content || 'Desculpe, não consegui processar sua mensagem.';
    } catch (error) {
      console.error('OpenAI API error:', error);
      return this.getDemoResponse(userMessage);
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
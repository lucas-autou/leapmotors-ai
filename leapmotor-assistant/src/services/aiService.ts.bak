// Simplified AI service that works reliably
class AIService {
  private demoResponses: { [key: string]: string[] } = {
    greeting: [
      'Oi, tudo bem? Bem-vindo à Leapmotor! Eu sou a Leap AI. Como posso te ajudar hoje?',
      'Olá! Que bom te ver por aqui! Sou a assistente virtual da Leapmotor. No que posso ajudar?',
      'E aí! Seja muito bem-vindo! Estou aqui pra falar sobre nossos carros elétricos incríveis!'
    ],
    vehicles: [
      'Nossa, temos uns carros sensacionais! Temos o B10 que é um SUV compacto, o T03 perfeito pra cidade, e o C10 que é premium. Qual te chama mais atenção?',
      'Olha, nossos carros são todos elétricos e super modernos! O B10 sai por duzentos e trinta e nove mil, o T03 por cento e sessenta e nove mil, e o C10 por duzentos e noventa e nove mil. Quer conhecer algum?',
      'Cara, são todos sustentáveis e cheios de tecnologia! Qual você gostaria de conhecer melhor?'
    ],
    b10: [
      'Ah, o B10 é demais! É um SUV compacto super tecnológico. Ele faz quatrocentos e vinte quilômetros com uma carga, tem duzentos e trinta e um cavalos. Custa duzentos e trinta e nove mil. Que tal fazer um test drive?',
      'O B10 é perfeito pra família! Tem uma autonomia incrível e acelera bem rápido. Quer experimentar?'
    ],
    t03: [
      'O T03 é perfeito para cidade! Compacto, ágil, 280km de autonomia e baixíssimo custo. A partir de R$ 169.990. Que tal um test-drive? 🌱',
      'T03: nosso urbano elétrico! Econômico, prático e sustentável. Ideal para o dia a dia na cidade!'
    ],
    c10: [
      'O C10 é nosso SUV premium! Espaçoso, teto panorâmico, 420km de autonomia e até 7 lugares. A partir de R$ 299.990. Posso agendar uma apresentação? ✨',
      'C10: luxo e sustentabilidade! Premium, confortável e com toda tecnologia Leapmotor.'
    ],
    coffee: [
      'Claro! Que tal um cafézinho? Temos expresso, cappuccino, café com leite, americano. O que você tá afim?',
      'Oba! Nosso café é uma delícia! Enquanto você toma, a gente pode conversar sobre os carros. Qual você prefere?',
      'Perfeito! Um café sempre cai bem. Temos várias opções gostosas aqui. Qual é o seu favorito?'
    ],
    testdrive: [
      'Excelente escolha! Test-drive é a melhor forma de sentir a experiência Leapmotor! 🚗 Qual modelo gostaria de dirigir?',
      'Perfeito! Vou agendar seu test-drive. Prefere o B10, T03 ou C10? Quando seria melhor pra você?',
      'Ótima ideia! Nada melhor que experimentar a dirigibilidade elétrica. Qual veículo te interessa mais?'
    ],
    ecological: [
      'A Leapmotor está comprometida com sustentabilidade! 🌱 Veículos 100% elétricos, zero emissão, economia de até 80% em combustível!',
      'Nossos carros são ecológicos! Sem poluição, energia renovável, futuro sustentável. Você economiza e o planeta agradece! 🌍'
    ],
    financing: [
      'Temos ótimas condições! 💰 Financiamento facilitado, entrada flexível, aceita seu usado na troca. Quer falar com consultor financeiro?',
      'Condições especiais de financiamento! Parcelas que cabem no seu bolso. Posso conectar você com nosso especialista financeiro?'
    ],
    default: [
      'Interessante! 🤔 Posso ajudá-lo com informações sobre veículos, agendar test-drive ou servir um café. O que prefere?',
      'Que pergunta legal! Estou aqui para falar sobre nossos veículos elétricos, serviços e tudo mais. Como posso ajudar?',
      'Hmm, deixe-me pensar... Posso te apresentar nossos carros, marcar um test-drive ou oferecer um café. O que te interessaria mais?'
    ]
  };

  async getResponse(message: string, context: any[] = []): Promise<string> {
    // Simulate thinking time
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    const lowerMessage = message.toLowerCase();
    
    // Determine response category
    let category = 'default';
    
    if (lowerMessage.includes('olá') || lowerMessage.includes('oi') || lowerMessage.includes('bom dia') || lowerMessage.includes('boa tarde')) {
      category = 'greeting';
    } else if (lowerMessage.includes('veículo') || lowerMessage.includes('carro') || lowerMessage.includes('modelo')) {
      category = 'vehicles';
    } else if (lowerMessage.includes('b10') || lowerMessage.includes('b 10')) {
      category = 'b10';
    } else if (lowerMessage.includes('t03') || lowerMessage.includes('t 03')) {
      category = 't03';
    } else if (lowerMessage.includes('c10') || lowerMessage.includes('c 10')) {
      category = 'c10';
    } else if (lowerMessage.includes('café')) {
      category = 'coffee';
    } else if (lowerMessage.includes('test') || lowerMessage.includes('dirigir') || lowerMessage.includes('experimentar')) {
      category = 'testdrive';
    } else if (lowerMessage.includes('ecológico') || lowerMessage.includes('sustentável') || lowerMessage.includes('ambiente')) {
      category = 'ecological';
    } else if (lowerMessage.includes('financiamento') || lowerMessage.includes('preço') || lowerMessage.includes('valor')) {
      category = 'financing';
    }

    // Get random response from category
    const responses = this.demoResponses[category];
    const randomIndex = Math.floor(Math.random() * responses.length);
    return responses[randomIndex];
  }
}

export const aiService = new AIService();
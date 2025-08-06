# recepcionista digital Leapmotor v2.0 - CLAUDE.md

## 🎯 Visão Geral
Este projeto é uma recepcionista digital avançada com IA para a Leapmotor, apresentando a **LEAP AI v2.0** - um agente conversacional inteligente com avatar expressivo, reconhecimento de contexto emocional e síntese de voz neural. Capaz de conversar naturalmente com clientes, interpretar intenções, adaptar-se ao contexto conversacional e oferecer uma experiência verdadeiramente interativa.

## 🤖 LEAP AI v2.0 - Nova Geração

### Nome: LEAP AI v2.0
### Características Avançadas:
- **Inteligência Emocional**: Reconhece e adapta-se ao estado emocional do cliente
- **Contextual**: Mantém memória conversacional e aprende preferências
- **Expressiva**: Avatar com 7 estados emocionais diferentes e animações naturais
- **Voz Neural**: Síntese de fala com controle de prosódia e emoção
- **Proativa**: Classifica intenções e sugere ações personalizadas
- **Responsiva**: Interface adaptativa com feedback visual em tempo real

### Estados Emocionais do Avatar:
- **Welcoming** (Acolhedor): Recepção calorosa de novos visitantes
- **Curious** (Curiosa): Interesse genuíno em perguntas sobre veículos
- **Excited** (Animada): Entusiasmo durante agendamentos e test-drives
- **Happy** (Feliz): Estado padrão de satisfação e alegria
- **Thinking** (Pensativa): Processamento de informações complexas
- **Concerned** (Preocupada): Atenção a dúvidas sobre financiamento
- **Neutral** (Neutra): Estado de espera e escuta ativa

## 🚗 Base de Conhecimento - Veículos

### Leapmotor B10
- **Tipo**: SUV compacto elétrico
- **Autonomia**: 420 km (WLTP)
- **Bateria**: 69.9 kWh
- **Potência**: 231 cv
- **0-100 km/h**: 7.9 segundos
- **Preço base**: A partir de R$ 239.990
- **Diferenciais**: Design moderno, tecnologia Cell-to-Chassis (CTC), sistema LEAP 3.0

### Leapmotor T03
- **Tipo**: Hatch urbano elétrico
- **Autonomia**: 280 km (WLTP)
- **Bateria**: 41.3 kWh
- **Potência**: 109 cv
- **0-100 km/h**: 12.7 segundos
- **Preço base**: A partir de R$ 169.990
- **Diferenciais**: Compacto, ideal para cidade, baixo custo de manutenção

### Leapmotor C10
- **Tipo**: SUV médio elétrico
- **Autonomia**: 420 km (WLTP)
- **Bateria**: 69.9 kWh
- **Potência**: 231 cv
- **0-100 km/h**: 7.5 segundos
- **Preço base**: A partir de R$ 299.990
- **Diferenciais**: Espaçoso, tecnologia avançada, design premium

## 💬 Fluxos Conversacionais

### Saudação Inicial
```
"Olá! Bem-vindo à Leapmotor! 👋
Eu sou a LEAP AI, sua recepcionista digital.
Como posso ajudá-lo hoje?"
```

### Apresentação de Veículos
```
"Ótima escolha em conhecer nossos veículos elétricos!
Temos três modelos incríveis:
- B10: Nosso SUV compacto versátil
- T03: Perfeito para a cidade
- C10: SUV premium com máximo conforto
Qual desperta mais seu interesse?"
```

### Oferta de Café
```
"Que tal uma pausa para um café enquanto conversamos?
Temos várias opções deliciosas:
☕ Expresso | Expresso duplo | Café com leite | Cappuccino
Posso pedir um para você?"
```

### Agendamento Test-Drive
```
"Excelente! Nada melhor que sentir a experiência de dirigir um Leapmotor!
Vou agendar seu test-drive.
Qual modelo gostaria de experimentar?
E qual o melhor horário para você?"
```

## 🧠 Tecnologias Avançadas v2.0

### Sistema de Inteligência Artificial
- **Motor de IA**: OpenAI GPT-4 Turbo com contexto conversacional
- **Classificação de Intenções**: 10 tipos de intenção automaticamente detectados
- **Contexto Emocional**: Rastreamento de estado emocional do usuário
- **Memória Conversacional**: Histórico de tópicos e interesses do cliente
- **Estágio de Conversa**: Progressão inteligente (inicial → explorando → interessado → decidindo)

### Inteligência Emocional
```typescript
interface ConversationContext {
  previousTopics: string[];
  currentIntent: Intent;
  vehicleInterest: string[];
  conversationStage: 'initial' | 'exploring' | 'interested' | 'deciding' | 'closing';
  emotionalState: 'neutral' | 'positive' | 'curious' | 'concerned' | 'excited';
  sessionStartTime: Date;
}
```

### Avatar Expressivo Avançado
- **Animações Idle**: Respiração natural, piscadas aleatórias, micro-movimentos
- **Expressões Dinâmicas**: Sobrancelhas, olhos e boca sincronizados com emoções
- **Cores Adaptativas**: Background muda cor baseado no estado emocional
- **Lip-Sync Básico**: Simulação de movimento labial durante a fala
- **Indicadores Visuais**: Status de listening, speaking, thinking em tempo real

### Síntese de Voz Neural OpenAI
- **OpenAI TTS**: Vozes neurais de última geração com qualidade premium
- **6 Vozes Disponíveis**: Alloy, Echo, Fable, Onyx, Nova, Shimmer
- **Voz Padrão**: Nova (feminina, energética, ideal para assistente)
- **Fallback Inteligente**: Web Speech API quando OpenAI não disponível
- **Controle de Prosódia**: Velocidade (0.25x - 4.0x) e emoção adaptáveis
- **Mapeamento Emocional**: Seleção automática de voz baseada no contexto

### Reconhecimento de Voz Híbrido
- **Método Principal**: Web Speech Recognition (instantâneo, local)
- **Futuro**: OpenAI Whisper (em desenvolvimento)
- **Confiança Adaptativa**: Processa transcrições com >20% confiança
- **Feedback Visual**: Avatar demonstra que está escutando
- **Tratamento de Erros**: Mensagens amigáveis para problemas de microfone

## 🎯 Integrações

### OpenAI All-in-One
- **GPT-4 Turbo**: Conversação inteligente com contexto
- **TTS (Text-to-Speech)**: Síntese de voz neural premium
- **Whisper STT**: Reconhecimento de voz (futuro)
- **Uma Conta Só**: Simplicidade máxima de configuração

### System Prompt Avançado
```
Você é a LEAP AI, uma recepcionista digital avançada da Leapmotor no Brasil.
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
```

## 📊 Métricas e Analytics

### KPIs a Rastrear:
- Número de interações
- Taxa de conversão para test-drive
- Veículo mais consultado
- Tempo médio de conversa
- Satisfação do usuário

## 🔧 Comandos de Desenvolvimento

### Instalar dependências:
```bash
yarn install
```

### Rodar em desenvolvimento:
```bash
yarn dev
```

### Build para produção:
```bash
yarn build
```

### Configurar variáveis de ambiente:
```env
# 🚀 SUPER SIMPLES - SÓ UMA CHAVE!
VITE_OPENAI_API_KEY=sk-proj-sua_chave_openai_aqui

# Isso é tudo! OpenAI fornece:
# ✅ GPT-4 Turbo (IA Conversacional)
# ✅ TTS Neural (Síntese de Voz)
# ✅ Whisper STT (Reconhecimento - futuro)
```

### Como Obter a Chave OpenAI:
1. **Criar conta**: https://platform.openai.com/
2. **Adicionar $5-10**: https://platform.openai.com/account/billing
3. **Criar chave**: https://platform.openai.com/api-keys
4. **Copiar chave**: Formato `sk-proj-...`

### Modos de Operação:
1. **🏆 Modo Premium**: Com OpenAI (IA real + voz neural)
2. **🎭 Modo Demo**: Sem chave (respostas demo + voz nativa)

### Custos Estimados:
- **IA**: ~$0.01 por conversa
- **Voz**: ~$0.015 por minuto
- **Total mensal**: $5-15 (uso normal)

## 📱 Responsividade

O sistema deve funcionar perfeitamente em:
- Desktop (1920x1080 e superiores)
- Tablet (768x1024)
- Mobile (375x667 e superiores)
- Totem interativo vertical (1080x1920)

## 🎨 Identidade Visual

### Cores Principais:
- Verde Leapmotor: #00B74F
- Cinza escuro: #1a1a1a
- Branco: #ffffff
- Cinza claro: #f5f5f5

### Tipografia:
- Fonte principal: Inter, system-ui
- Títulos: Bold
- Corpo: Regular
- Destaques: Medium

## ✨ Melhorias Implementadas v2.0

### 🧠 Inteligência Artificial
- ✅ Motor GPT-4 Turbo com contexto conversacional
- ✅ Sistema de classificação de 10 intenções diferentes
- ✅ Rastreamento de estado emocional do cliente
- ✅ Memória de tópicos e preferências discutidos
- ✅ Progressão inteligente de estágios da conversa

### 🎭 Avatar Expressivo
- ✅ 7 estados emocionais com transições suaves
- ✅ Animações de respiração e piscadas naturais
- ✅ Micro-movimentos idle para parecer vivo
- ✅ Sincronização básica lip-sync com a fala
- ✅ Cores adaptativas baseadas na emoção
- ✅ Indicadores visuais de status em tempo real

### 🎙️ Sistema de Voz OpenAI TTS
- ✅ Integração nativa OpenAI TTS (sem Azure!)
- ✅ 6 vozes neurais premium (Alloy, Echo, Fable, Nova, Onyx, Shimmer)
- ✅ Controle de prosódia (0.25x-4.0x velocidade, emoção)
- ✅ Fallback inteligente para Web Speech API
- ✅ Mapeamento emocional automático da voz
- ✅ Bundle 53% menor (442KB vs 938KB)

### 👂 Reconhecimento Inteligente
- ✅ Sistema de confiança adaptativa (>30%)
- ✅ Feedback visual durante escuta
- ✅ Tratamento amigável de erros de microfone
- ✅ Integração híbrida Azure/Web Speech

### 📱 Interface Responsiva
- ✅ Status dinâmicos (Pensando, Falando, Escutando)
- ✅ Indicadores de intenção detectada
- ✅ Animações fluídas e feedback visual
- ✅ Otimização para diferentes dispositivos

### 🚀 Migração OpenAI v2.0
- ✅ **Simplicidade**: 1 chave vs 2 contas
- ✅ **Performance**: Bundle 53% menor
- ✅ **Qualidade**: Vozes neurais premium
- ✅ **Custo**: Setup mais barato
- ✅ **Manutenção**: Muito mais simples

## 🚀 Próximas Melhorias v3.0

1. **Integração com CRM**
   - Capturar dados do cliente
   - Histórico de interações

2. **Sistema de Filas**
   - Gerenciar atendimento presencial
   - Estimativa de tempo de espera

3. **Realidade Aumentada**
   - Visualizar veículo em 3D
   - Personalizar cores e acessórios

4. **Integração WhatsApp**
   - Continuar conversa no celular
   - Enviar materiais e propostas

5. **Analytics Avançado**
   - Heatmap de interações
   - Análise de sentimento
   - Relatórios automáticos

## 📝 Notas de Manutenção

- Atualizar base de conhecimento mensalmente
- Revisar respostas da IA semanalmente
- Backup de conversas diariamente
- Monitorar performance em tempo real
- Treinar novos fluxos baseado em feedback

## 🔒 Segurança e Privacidade

- Não armazenar dados pessoais sem consentimento
- Criptografar todas as comunicações
- Seguir LGPD rigorosamente
- Logs anônimos para análise
- Timeout de sessão após 15 minutos de inatividade

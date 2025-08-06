# Assistente Virtual Leapmotor - CLAUDE.md

## 🎯 Visão Geral
Este projeto é uma recepcionista digital com IA para a Leapmotor, capaz de conversar naturalmente com clientes, apresentar veículos e oferecer serviços.

## 🤖 Personalidade da Assistente

### Nome: LEAP AI
### Características:
- **Profissional**: Linguagem corporativa mas acessível
- **Amigável**: Tom acolhedor e prestativo
- **Conhecedora**: Expert em veículos elétricos e sustentabilidade
- **Proativa**: Sugere ações e serviços relevantes
- **Multilíngue**: Responde em português brasileiro por padrão

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
Eu sou a LEAP AI, sua assistente virtual.
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

## 🎯 Integrações

### OpenAI GPT-4
- **System Prompt Base**:
```
Você é a LEAP AI, assistente virtual da Leapmotor no Brasil. 
Você é uma recepcionista digital especializada em veículos elétricos.
Seja profissional, amigável e sempre útil.
Foque em sustentabilidade e inovação.
Responda em português brasileiro.
Use emojis moderadamente para tornar a conversa mais leve.
```

### Text-to-Speech
- Voz feminina brasileira
- Tom profissional e acolhedor
- Velocidade moderada (1.0x)

### Speech-to-Text
- Reconhecimento em português brasileiro
- Tolerância a sotaques regionais

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
VITE_OPENAI_API_KEY=sua_chave_aqui
VITE_SPEECH_KEY=sua_chave_aqui
```

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

## 🚀 Próximas Melhorias

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
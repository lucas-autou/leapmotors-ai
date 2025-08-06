# 🚗 Leapmotor - Recepcionista Digital com IA

Demo técnico de uma recepcionista digital conversacional para a Leapmotor, desenvolvida com React, TypeScript e integração com IA.

## 🎯 Funcionalidades

- ✅ **Avatar Animado**: Assistente visual com animações sincronizadas
- ✅ **Chat Conversacional**: Interface de chat moderna e responsiva
- ✅ **IA Integrada**: Respostas inteligentes usando OpenAI GPT-4 (ou modo demo)
- ✅ **Text-to-Speech**: Voz sintetizada em português brasileiro
- ✅ **Speech-to-Text**: Reconhecimento de voz para comandos
- ✅ **Catálogo de Veículos**: Cards interativos dos modelos Leapmotor
- ✅ **Serviços Integrados**: Café, test-drive, consultor e agendamento
- ✅ **100% Responsivo**: Funciona em desktop, tablet e mobile

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+ instalado
- Yarn ou npm

### Instalação

1. Entre no diretório do projeto:
```bash
cd leapmotor-assistant
```

2. Instale as dependências:
```bash
yarn install
# ou
npm install
```

3. Configure as variáveis de ambiente (opcional):
```bash
cp .env.example .env
# Edite o arquivo .env com sua chave da OpenAI (opcional)
```

4. Execute o projeto:
```bash
yarn dev
# ou
npm run dev
```

5. Acesse no navegador:
```
http://localhost:5173
```

## 🎮 Como Usar

### Interações Disponíveis

1. **Chat por Texto**: Digite mensagens no campo de entrada
2. **Chat por Voz**: Clique no ícone de microfone para falar
3. **Cards de Veículos**: Clique nos cards para saber mais
4. **Botões de Serviço**: Solicite café, test-drive ou consultor
5. **Áudio**: Ative/desative a voz da assistente

### Exemplos de Perguntas

- "Olá, como você está?"
- "Quais veículos vocês têm?"
- "Me fale sobre o B10"
- "Quanto custa o T03?"
- "Quero fazer um test-drive"
- "Pode me servir um café?"
- "Quais os benefícios ecológicos?"

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 18 + TypeScript
- **Estilização**: Tailwind CSS
- **Animações**: Framer Motion
- **IA**: OpenAI GPT-4 (opcional)
- **Voz**: Web Speech API
- **Build**: Vite
- **Ícones**: Lucide React

## 📁 Estrutura do Projeto

```
leapmotor-assistant/
├── src/
│   ├── components/
│   │   ├── Avatar.tsx         # Avatar animado da assistente
│   │   ├── ChatInterface.tsx  # Interface de chat
│   │   ├── VehicleCards.tsx   # Cards dos veículos
│   │   └── ServiceOptions.tsx # Opções de serviços
│   ├── services/
│   │   ├── openai.ts          # Integração com GPT
│   │   └── speech.ts          # Text-to-Speech e Speech-to-Text
│   ├── data/
│   │   └── vehicles.json      # Dados dos veículos
│   ├── types/
│   │   └── index.ts           # TypeScript types
│   └── App.tsx                # Componente principal
├── CLAUDE.md                  # Documentação da assistente
└── README.md                  # Este arquivo
```

## 🔧 Configuração Avançada

### Modo Demo vs Produção

O projeto funciona em dois modos:

1. **Modo Demo** (padrão): Usa respostas pré-programadas, não requer API key
2. **Modo Produção**: Integra com OpenAI GPT-4 para respostas dinâmicas

Para usar o modo produção:
1. Obtenha uma API key da OpenAI
2. Adicione ao arquivo `.env`:
```env
VITE_OPENAI_API_KEY=sua_chave_aqui
```

### Personalização

- **Cores**: Edite o tema em `tailwind.config.js`
- **Veículos**: Atualize `src/data/vehicles.json`
- **Personalidade da IA**: Modifique o prompt em `src/services/openai.ts`
- **Avatar**: Customize em `src/components/Avatar.tsx`

## 📱 Responsividade

O sistema é otimizado para:
- Desktop: 1920x1080+
- Tablet: 768x1024
- Mobile: 375x667+
- Totem: 1080x1920 (vertical)

## 🔐 Segurança

- Não armazena dados pessoais
- Comunicação local (demo)
- API keys protegidas via env
- Timeout de sessão configurável

## 🚀 Deploy

Para deploy em produção:

```bash
# Build otimizado
yarn build

# Preview local
yarn preview

# Deploy (exemplo com Vercel)
vercel deploy dist/
```

## 📈 Próximos Passos

- [ ] Integração com CRM
- [ ] Analytics avançado
- [ ] Múltiplos idiomas
- [ ] Avatar 3D realista
- [ ] Integração WhatsApp
- [ ] Sistema de filas
- [ ] Dashboard administrativo

## 📝 Licença

Demo técnico - Uso interno Leapmotor

## 🤝 Suporte

Para dúvidas ou sugestões sobre este demo, entre em contato com a equipe de desenvolvimento.

---

**Desenvolvido com 💚 para Leapmotor Brasil**

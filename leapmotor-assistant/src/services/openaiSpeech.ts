import OpenAI from 'openai';

export interface VoiceConfig {
  name: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  style: 'natural' | 'expressive';
  speed?: number; // 0.25 to 4.0
}

export interface SpeechOptions {
  voice?: VoiceConfig['name'];
  emotion?: 'neutral' | 'happy' | 'excited' | 'concerned' | 'cheerful' | 'friendly';
  speed?: number; // 0.25 to 4.0
  pitch?: number; // Simulated through voice selection
}

class OpenAISpeechService {
  private client: OpenAI | null = null;
  private audioContext: AudioContext | null = null;
  private currentAudio: HTMLAudioElement | null = null;
  private isInitialized = false;

  // Vozes OpenAI otimizadas para português brasileiro
  private readonly voices: Record<VoiceConfig['name'], { gender: 'female' | 'male', tone: string }> = {
    'alloy': { gender: 'female', tone: 'balanced' },
    'echo': { gender: 'male', tone: 'calm' },
    'fable': { gender: 'female', tone: 'expressive' },
    'onyx': { gender: 'male', tone: 'deep' },
    'nova': { gender: 'female', tone: 'energetic' },
    'shimmer': { gender: 'female', tone: 'soft' }
  };

  // Voz padrão para assistente feminina brasileira (alloy é mais neutra e soa mais brasileira)
  private currentVoice: VoiceConfig['name'] = 'alloy';

  initialize(apiKey?: string): boolean {
    if (!apiKey || apiKey === 'demo') {
      console.log('OpenAI Speech não configurado, usando Web Speech API como fallback');
      return this.initializeWebSpeech();
    }

    try {
      this.client = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true
      });

      // Inicializar contexto de áudio para Web Audio API
      if (typeof window !== 'undefined') {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      this.isInitialized = true;
      console.log('OpenAI Speech Service inicializado com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao inicializar OpenAI Speech:', error);
      return this.initializeWebSpeech();
    }
  }

  private initializeWebSpeech(): boolean {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.isInitialized = true;
      return true;
    }
    return false;
  }

  async speak(text: string, options: SpeechOptions = {}, onEnd?: () => void, onAudioStart?: () => void): Promise<void> {
    if (!this.isInitialized) {
      console.warn('Serviço de fala não inicializado');
      if (onEnd) onEnd();
      return;
    }

    // Garantir que Web Speech está parado antes de começar
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    // Limpar emojis e símbolos do texto antes da síntese
    const cleanText = this.cleanTextForSpeech(text);
    console.log(`🧹 Texto limpo para fala: "${cleanText}"`);

    // Se tem OpenAI configurado, usar TTS premium
    if (this.client) {
      return this.speakWithOpenAI(cleanText, options, onEnd, onAudioStart);
    } else {
      // Fallback para Web Speech API
      return this.speakWithWebAPI(cleanText, options, onEnd, onAudioStart);
    }
  }

  private cleanTextForSpeech(text: string): string {
    return text
      // Remover emojis (todos os símbolos Unicode de emoji)
      .replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '')
      // Remover asteriscos de formatação (*texto*)
      .replace(/\*([^*]+)\*/g, '$1')
      // Remover quebras de linha duplas
      .replace(/\n\n+/g, '. ')
      // Remover quebras de linha simples
      .replace(/\n/g, ' ')
      // Limpar espaços extras
      .replace(/\s+/g, ' ')
      .trim();
  }

  private optimizeTextForBrazilian(text: string): string {
    // Otimizações para sotaque brasileiro - substituir termos técnicos e estrangeirismos
    return text
      // Termos automotivos
      .replace(/\btest[\s-]*drive\b/gi, 'teste drive')
      .replace(/\bSUV\b/gi, 'S-U-V')
      .replace(/\bhatchback\b/gi, 'hatch')
      .replace(/\bairbag\b/gi, 'airbágue')
      .replace(/\bfeedback\b/gi, 'retorno')
      .replace(/\bajudar\b/gi, 'ajudar')
      // Marca e modelos
      .replace(/\bLeapmotor\b/gi, 'Líip-mótor')
      .replace(/\bLEAP\b/gi, 'Líp')
      .replace(/\bT03\b/gi, 'T zero três')
      .replace(/\bB10\b/gi, 'B dez')
      .replace(/\bC10\b/gi, 'C dez')
      // Unidades técnicas
      .replace(/\bkWh\b/gi, 'quilowatt-hora')
      .replace(/\bkm\/h\b/gi, 'quilômetros por hora')
      .replace(/\bcv\b/gi, 'cavalos')
      .replace(/\bWLTP\b/gi, 'W-L-T-P')
      // Tecnologia
      .replace(/\bemail\b/gi, 'e-mail')
      .replace(/\bapp\b/gi, 'aplicativo')
      .replace(/\bonline\b/gi, 'on-line')
      .replace(/\bwifi\b/gi, 'wi-fi')
      .replace(/\bsmartphone\b/gi, 'celular')
      .replace(/\bokay\b/gi, 'ok')
      .replace(/\bok\b/gi, 'ok')
      // Números e medidas
      .replace(/\b0-100\b/gi, 'zero a cem')
      .replace(/\bR\$\s*(\d+)/gi, '$1 reais')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private async speakWithOpenAI(text: string, options: SpeechOptions, onEnd?: () => void, onAudioStart?: () => void): Promise<void> {
    if (!this.client) return;

    try {
      // Parar qualquer áudio em reprodução
      this.stopSpeaking();

      // Selecionar voz baseada na emoção e configurações
      const voice = this.selectVoiceForEmotion(options.emotion || 'neutral', options.voice);
      const speed = this.calculateSpeed(options);

      // Otimizar texto para pronúncia brasileira
      const brazilianText = this.optimizeTextForBrazilian(text);

      console.log(`🎙️ OpenAI TTS: voz=${voice}, velocidade=${speed}, emoção=${options.emotion}`);
      console.log(`🇧🇷 Texto otimizado para brasileiro: "${brazilianText}"`);

      // Chamada para API OpenAI TTS - usar tts-1 para velocidade máxima
      const mp3Response = await this.client.audio.speech.create({
        model: 'tts-1', // Modelo mais rápido (vs tts-1-hd) para reduzir delay
        voice: voice,
        input: brazilianText,
        speed: speed,
        response_format: 'mp3'
      });

      // Converter resposta para blob de áudio
      const arrayBuffer = await mp3Response.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(blob);

      // Reproduzir áudio com otimizações para velocidade máxima
      this.currentAudio = new Audio(audioUrl);
      this.currentAudio.preload = 'auto'; // Carregar imediatamente

      // Callback quando áudio efetivamente começa a tocar
      this.currentAudio.onplay = () => {
        console.log('🎵 Áudio OpenAI TTS começou a tocar - sincronizando vídeo');
        if (onAudioStart) onAudioStart();
      };

      this.currentAudio.onended = () => {
        URL.revokeObjectURL(audioUrl); // Limpar memória
        this.currentAudio = null;
        if (onEnd) onEnd();
      };

      this.currentAudio.onerror = (error) => {
        console.error('Erro na reprodução OpenAI TTS:', error);
        URL.revokeObjectURL(audioUrl);
        this.currentAudio = null;
        // Se falhar, ainda chama onAudioStart para não travar vídeo
        if (onAudioStart) onAudioStart();
        if (onEnd) onEnd();
      };

      // Reprodução imediata sem await para reduzir delay
      this.currentAudio.play().catch(error => {
        console.error('Erro ao iniciar áudio:', error);
        if (onAudioStart) onAudioStart();
        if (onEnd) onEnd();
      });
      console.log('✅ OpenAI TTS iniciado - aguardando callback de sincronização');

    } catch (error) {
      console.error('Erro OpenAI TTS:', error);
      // Só usar fallback se realmente não conseguir usar OpenAI
      console.log('⚠️ Tentando fallback para Web Speech API...');
      this.speakWithWebAPI(text, options, onEnd, onAudioStart);
    }
  }

  private selectVoiceForEmotion(emotion: string, preferredVoice?: VoiceConfig['name']): VoiceConfig['name'] {
    if (preferredVoice) return preferredVoice;

    // Mapeamento inteligente de emoções para vozes (priorizando alloy como mais brasileira)
    const emotionToVoice: Record<string, VoiceConfig['name']> = {
      'excited': 'nova',      // Energética para animação
      'happy': 'alloy',       // Balanceada para alegria
      'cheerful': 'alloy',    // Balanceada para receptividade
      'friendly': 'alloy',    // Balanceada para conversa amigável
      'concerned': 'fable',   // Expressiva para preocupação
      'neutral': 'alloy'      // Balanceada para neutralidade
    };

    return emotionToVoice[emotion] || 'alloy';
  }

  private calculateSpeed(options: SpeechOptions): number {
    let baseSpeed = options.speed || 1.1; // Velocidade rápida por padrão

    // Ajustar velocidade baseado na emoção (sempre rápido, mas com variações)
    const emotion = options.emotion || 'neutral';
    const emotionSpeedModifier: Record<string, number> = {
      'excited': 1.2,     // Muito rápido para animação
      'happy': 1.1,       // Rápido para alegria
      'concerned': 1.1,   // Rápido mas um pouco mais devagar para preocupação
      'neutral': 1.1,     // Rápido padrão
      'cheerful': 1.1,   // Bem rápido para receptividade
      'friendly': 1.1     // Rápido para cordialidade
    };

    baseSpeed = emotionSpeedModifier[emotion] || 1.1;

    // Manter dentro dos limites da OpenAI (0.25 - 4.0)
    return Math.max(0.25, Math.min(4.0, baseSpeed));
  }

  private speakWithWebAPI(text: string, options: SpeechOptions, onEnd?: () => void, onAudioStart?: () => void): void {
    if (!window.speechSynthesis) {
      if (onEnd) onEnd();
      return;
    }

    console.log('⚠️ ATENÇÃO: Usando Web Speech API (não OpenAI) - Isso causa sotaque PT-PT!');

    // Parar qualquer síntese em andamento
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = options.speed || 1.3;
    utterance.pitch = options.pitch || 1.1;
    utterance.volume = 1.0;

    // Tentar usar voz feminina brasileira ou portuguesa fluida
    const voices = window.speechSynthesis.getVoices();

    // Priorizar Joana (se disponível) ou outras vozes brasileiras/portuguesas femininas
    const preferredVoice = voices.find(voice =>
      voice.name.toLowerCase().includes('joana')
    ) || voices.find(voice =>
      voice.lang === 'pt-BR' && voice.name.toLowerCase().includes('female')
    ) || voices.find(voice =>
      voice.lang === 'pt-BR' && voice.name.toLowerCase().includes('feminina')
    ) || voices.find(voice =>
      voice.lang === 'pt-BR'
    ) || voices.find(voice =>
      voice.lang === 'pt-PT' && voice.name.toLowerCase().includes('female')
    ) || voices.find(voice =>
      voice.lang === 'pt-PT'
    ) || voices[0];

    if (preferredVoice) {
      utterance.voice = preferredVoice;
      console.log(`🔊 Usando voz Web Speech: ${preferredVoice.name} (${preferredVoice.lang})`);
    }

    // Callback quando áudio Web Speech efetivamente começa
    utterance.onstart = () => {
      console.log('🎵 Web Speech API começou a tocar - sincronizando vídeo');
      if (onAudioStart) onAudioStart();
    };

    if (onEnd) {
      utterance.onend = onEnd;
    }

    utterance.onerror = (event) => {
      console.error('Erro Web Speech:', event);
      // Se falhar, ainda chama onAudioStart para não travar vídeo
      if (onAudioStart) onAudioStart();
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
  }

  stopSpeaking(): void {
    // Parar OpenAI TTS se estiver reproduzindo
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }

    // Parar Web Speech API também
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }

  isSpeaking(): boolean {
    // Verificar se OpenAI TTS está reproduzindo
    if (this.currentAudio && !this.currentAudio.paused) {
      return true;
    }

    // Verificar se Web Speech está falando
    if (window.speechSynthesis && window.speechSynthesis.speaking) {
      return true;
    }

    return false;
  }

  // Reconhecimento de voz com OpenAI Whisper
  async startListening(
    onResult: (transcript: string, confidence: number) => void,
    onError: (error: string) => void,
    onEnd?: () => void
  ): Promise<void> {
    // Se tem OpenAI, tentar usar Whisper primeiro
    if (this.client) {
      return this.startOpenAIRecognition(onResult, onError, onEnd);
    } else {
      // Fallback para Web Speech
      return this.startWebRecognition(onResult, onError, onEnd);
    }
  }

  private async startOpenAIRecognition(
    onResult: (transcript: string, confidence: number) => void,
    onError: (error: string) => void,
    onEnd?: () => void
  ): Promise<void> {
    try {
      console.log('🎤 Tentando usar OpenAI Whisper para reconhecimento...');

      // Por enquanto, usar Web Speech como principal
      // OpenAI Whisper requer gravação de arquivo, mais complexo para tempo real
      // Implementação futura: gravar áudio e enviar para Whisper

      this.startWebRecognition(onResult, onError, onEnd);

    } catch (error) {
      console.error('Erro OpenAI Whisper:', error);
      this.startWebRecognition(onResult, onError, onEnd);
    }
  }

  private startWebRecognition(
    onResult: (transcript: string, confidence: number) => void,
    onError: (error: string) => void,
    onEnd?: () => void
  ): void {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      onError('Reconhecimento de voz não disponível neste navegador');
      return;
    }

    console.log('🎤 Usando Web Speech Recognition');

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const result = event.results[0][0];
      onResult(result.transcript, result.confidence);
    };

    recognition.onerror = (event: any) => {
      let errorMessage = 'Erro no reconhecimento de voz';
      switch(event.error) {
        case 'no-speech':
          errorMessage = 'Nenhuma fala detectada';
          break;
        case 'audio-capture':
          errorMessage = 'Microfone não detectado';
          break;
        case 'not-allowed':
          errorMessage = 'Permissão de microfone negada';
          break;
        case 'network':
          errorMessage = 'Erro de rede';
          break;
      }
      onError(errorMessage);
    };

    recognition.onend = () => {
      if (onEnd) onEnd();
    };

    try {
      recognition.start();
    } catch (error) {
      onError('Falha ao iniciar reconhecimento de voz');
    }
  }

  stopListening(): void {
    // Web Speech Recognition é gerenciado pela instância individual
    // Não há instância persistente para parar
  }

  setVoice(voiceName: VoiceConfig['name']): void {
    if (this.voices[voiceName]) {
      this.currentVoice = voiceName;
      console.log(`Voz alterada para: ${voiceName} (${this.voices[voiceName].tone})`);
    }
  }

  getAvailableVoices(): Array<{name: VoiceConfig['name'], gender: string, tone: string}> {
    return Object.entries(this.voices).map(([name, info]) => ({
      name: name as VoiceConfig['name'],
      gender: info.gender,
      tone: info.tone
    }));
  }

  getCurrentVoice(): VoiceConfig['name'] {
    return this.currentVoice;
  }

  dispose(): void {
    this.stopSpeaking();
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}

export const openaiSpeechService = new OpenAISpeechService();

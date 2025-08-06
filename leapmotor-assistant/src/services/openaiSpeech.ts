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

  // Voz padrão para assistente feminina brasileira
  private currentVoice: VoiceConfig['name'] = 'nova';

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

  async speak(text: string, options: SpeechOptions = {}, onEnd?: () => void): Promise<void> {
    if (!this.isInitialized) {
      console.warn('Serviço de fala não inicializado');
      if (onEnd) onEnd();
      return;
    }

    // Se tem OpenAI configurado, usar TTS premium
    if (this.client) {
      return this.speakWithOpenAI(text, options, onEnd);
    } else {
      // Fallback para Web Speech API
      return this.speakWithWebAPI(text, options, onEnd);
    }
  }

  private async speakWithOpenAI(text: string, options: SpeechOptions, onEnd?: () => void): Promise<void> {
    if (!this.client) return;

    try {
      // Parar qualquer áudio em reprodução
      this.stopSpeaking();

      // Selecionar voz baseada na emoção e configurações
      const voice = this.selectVoiceForEmotion(options.emotion || 'neutral', options.voice);
      const speed = this.calculateSpeed(options);

      console.log(`🎙️ OpenAI TTS: voz=${voice}, velocidade=${speed}, emoção=${options.emotion}`);

      // Chamada para API OpenAI TTS
      const mp3Response = await this.client.audio.speech.create({
        model: 'tts-1', // Modelo mais rápido, tts-1-hd para qualidade máxima
        voice: voice,
        input: text,
        speed: speed,
        response_format: 'mp3'
      });

      // Converter resposta para blob de áudio
      const arrayBuffer = await mp3Response.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(blob);

      // Reproduzir áudio
      this.currentAudio = new Audio(audioUrl);
      
      this.currentAudio.onended = () => {
        URL.revokeObjectURL(audioUrl); // Limpar memória
        this.currentAudio = null;
        if (onEnd) onEnd();
      };

      this.currentAudio.onerror = (error) => {
        console.error('Erro na reprodução OpenAI TTS:', error);
        URL.revokeObjectURL(audioUrl);
        this.currentAudio = null;
        // Fallback para Web Speech em caso de erro
        this.speakWithWebAPI(text, options, onEnd);
      };

      await this.currentAudio.play();

    } catch (error) {
      console.error('Erro OpenAI TTS:', error);
      // Fallback para Web Speech API
      this.speakWithWebAPI(text, options, onEnd);
    }
  }

  private selectVoiceForEmotion(emotion: string, preferredVoice?: VoiceConfig['name']): VoiceConfig['name'] {
    if (preferredVoice) return preferredVoice;

    // Mapeamento inteligente de emoções para vozes
    const emotionToVoice: Record<string, VoiceConfig['name']> = {
      'excited': 'nova',      // Energética para animação
      'happy': 'fable',       // Expressiva para alegria
      'cheerful': 'nova',     // Energética para receptividade
      'friendly': 'alloy',    // Balanceada para conversa amigável
      'concerned': 'shimmer', // Suave para preocupação
      'neutral': 'alloy'      // Balanceada para neutralidade
    };

    return emotionToVoice[emotion] || 'alloy';
  }

  private calculateSpeed(options: SpeechOptions): number {
    let baseSpeed = options.speed || 1.0;
    
    // Ajustar velocidade baseado na emoção
    const emotion = options.emotion || 'neutral';
    const emotionSpeedModifier: Record<string, number> = {
      'excited': 1.1,     // Um pouco mais rápido para animação
      'happy': 1.05,      // Ligeiramente mais rápido para alegria
      'concerned': 0.9,   // Mais devagar para preocupação
      'neutral': 1.0,     // Velocidade normal
      'cheerful': 1.05,   // Ligeiramente mais rápido
      'friendly': 1.0     // Velocidade normal
    };

    baseSpeed *= emotionSpeedModifier[emotion] || 1.0;

    // Manter dentro dos limites da OpenAI (0.25 - 4.0)
    return Math.max(0.25, Math.min(4.0, baseSpeed));
  }

  private speakWithWebAPI(text: string, options: SpeechOptions, onEnd?: () => void): void {
    if (!window.speechSynthesis) {
      if (onEnd) onEnd();
      return;
    }

    console.log('🔊 Usando Web Speech API como fallback');

    // Parar qualquer síntese em andamento
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = options.speed || 0.95;
    utterance.pitch = options.pitch || 1.1;
    utterance.volume = 1.0;

    // Tentar usar voz feminina brasileira
    const voices = window.speechSynthesis.getVoices();
    const brazilianVoice = voices.find(voice => 
      voice.lang === 'pt-BR' && voice.name.toLowerCase().includes('female')
    ) || voices.find(voice => voice.lang === 'pt-BR') || voices[0];

    if (brazilianVoice) {
      utterance.voice = brazilianVoice;
    }

    if (onEnd) {
      utterance.onend = onEnd;
    }

    utterance.onerror = (event) => {
      console.error('Erro Web Speech:', event);
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
class SpeechService {
  private synthesis: SpeechSynthesis | null = null;
  private recognition: any = null;
  private voice: SpeechSynthesisVoice | null = null;

  constructor() {
    // Initialize only if browser supports it
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
      
      // Initialize Speech Recognition
      const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognitionAPI) {
        try {
          this.recognition = new SpeechRecognitionAPI();
          this.recognition.lang = 'pt-BR';
          this.recognition.continuous = false;
          this.recognition.interimResults = false;
        } catch (error) {
          console.log('Speech recognition not available:', error);
        }
      }

      // Load Brazilian Portuguese voice
      this.loadVoice();
      
      // Reload voice when voices change
      if (this.synthesis && this.synthesis.onvoiceschanged !== undefined) {
        this.synthesis.onvoiceschanged = () => this.loadVoice();
      }
    }
  }

  private loadVoice() {
    if (!this.synthesis) return;
    const voices = this.synthesis.getVoices();
    // Try to find a Brazilian Portuguese voice
    this.voice = voices.find(voice => voice.lang === 'pt-BR' && voice.name.includes('Female')) ||
                 voices.find(voice => voice.lang === 'pt-BR') ||
                 voices.find(voice => voice.lang.startsWith('pt')) ||
                 voices[0];
  }

  speak(text: string, onEnd?: () => void): void {
    if (!this.synthesis) {
      console.log('Speech synthesis not available');
      if (onEnd) onEnd();
      return;
    }
    
    // Cancel any ongoing speech
    this.synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 1.0;
    utterance.pitch = 1.1;
    utterance.volume = 1.0;

    if (this.voice) {
      utterance.voice = this.voice;
    }

    if (onEnd) {
      utterance.onend = onEnd;
    }

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      if (onEnd) onEnd();
    };

    this.synthesis.speak(utterance);
  }

  stopSpeaking(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }

  isSpeaking(): boolean {
    return this.synthesis ? this.synthesis.speaking : false;
  }

  startListening(
    onResult: (transcript: string) => void,
    onError: (error: string) => void,
    onEnd?: () => void
  ): void {
    if (!this.recognition) {
      onError('Reconhecimento de voz não disponível neste navegador');
      return;
    }

    this.recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };

    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event);
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

    this.recognition.onend = () => {
      if (onEnd) onEnd();
    };

    try {
      this.recognition.start();
    } catch (error) {
      console.error('Failed to start recognition:', error);
      onError('Falha ao iniciar reconhecimento de voz');
    }
  }

  stopListening(): void {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }
    }
  }

  async requestMicrophonePermission(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      return false;
    }
  }
}

export const speechService = new SpeechService();
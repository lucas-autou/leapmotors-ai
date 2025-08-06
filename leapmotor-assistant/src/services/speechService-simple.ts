// Simplified and safe Speech Service
class SimpleSpeechService {
  private synthesis: SpeechSynthesis | null = null;
  private isAvailable = false;
  private bestVoice: SpeechSynthesisVoice | null = null;

  constructor() {
    this.checkAvailability();
    this.loadBestBrazilianVoice();
  }

  private checkAvailability() {
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        this.synthesis = window.speechSynthesis;
        this.isAvailable = true;
      }
    } catch (error) {
      console.log('Speech synthesis not available:', error);
      this.isAvailable = false;
    }
  }

  private loadBestBrazilianVoice() {
    if (!this.synthesis) return;

    // Function to load voices
    const loadVoices = () => {
      const voices = this.synthesis!.getVoices();
      console.log('Available voices:', voices.map(v => `${v.name} (${v.lang})`));

      // Show all Portuguese voices for debugging
      const portugueseVoices = voices.filter(v => v.lang.includes('pt'));
      console.log('Portuguese voices found:', portugueseVoices.map(v => `${v.name} (${v.lang}) - Local: ${v.localService}`));

      // Priority order for Brazilian Portuguese voices (young and fluid preference)
      const brazilianVoicePreferences = [
        // Prefer younger-sounding names first (Eddy, Flo are often more natural)
        (v: SpeechSynthesisVoice) => v.name.includes('Eddy') && v.lang === 'pt-BR',
        (v: SpeechSynthesisVoice) => v.name.includes('Flo') && v.lang === 'pt-BR',
        
        // Joana is high-quality even if pt-PT - we'll force it to pt-BR
        (v: SpeechSynthesisVoice) => v.name.includes('Joana'),
        
        // Google voices (good quality but may sound robotic)
        (v: SpeechSynthesisVoice) => v.name.includes('Google') && v.lang === 'pt-BR',
        
        // Avoid older-sounding names like Grandpa/Grandma but allow any pt-BR
        (v: SpeechSynthesisVoice) => v.lang === 'pt-BR' && !v.name.includes('Grand') && !v.name.includes('Old'),
        
        // Apple/macOS voices (generally good quality)
        (v: SpeechSynthesisVoice) => (v.name.includes('Luciana') || v.name.includes('Francisca')) && v.lang.includes('pt'),
        
        // Microsoft/Windows voices
        (v: SpeechSynthesisVoice) => v.name.includes('Microsoft') && v.lang === 'pt-BR',
        
        // Any Brazilian Portuguese voice
        (v: SpeechSynthesisVoice) => v.lang === 'pt-BR',
        
        // Fallback to Portuguese (including pt-PT if good names)
        (v: SpeechSynthesisVoice) => v.lang.startsWith('pt') && !v.name.includes('Grand'),
      ];

      // Try each preference in order
      for (const preference of brazilianVoicePreferences) {
        const voice = voices.find(preference);
        if (voice) {
          this.bestVoice = voice;
          console.log('Selected voice:', voice.name, voice.lang);
          break;
        }
      }

      // If no specific voice found, use first available
      if (!this.bestVoice && voices.length > 0) {
        this.bestVoice = voices[0];
        console.log('Using fallback voice:', this.bestVoice.name);
      }
    };

    // Load voices immediately if available
    loadVoices();

    // Also load when voices change (some browsers load asynchronously)
    if (this.synthesis.onvoiceschanged !== undefined) {
      this.synthesis.onvoiceschanged = loadVoices;
    }

    // Fallback: try loading voices after a delay
    setTimeout(loadVoices, 1000);
  }

  speak(text: string, onEnd?: () => void): void {
    if (!this.isAvailable || !this.synthesis) {
      console.log('Speech synthesis not available');
      if (onEnd) onEnd();
      return;
    }

    try {
      // Cancel any ongoing speech
      this.synthesis.cancel();

      // Clean text for better pronunciation
      let cleanText = this.cleanTextForSpeech(text);
      
      // If using Joana (Portuguese), make text more Brazilian
      if (this.bestVoice?.name.includes('Joana')) {
        cleanText = this.makeBrazilian(cleanText);
      }

      const utterance = new SpeechSynthesisUtterance(cleanText);
      
      // Use the best Brazilian voice if available
      if (this.bestVoice) {
        utterance.voice = this.bestVoice;
        utterance.lang = this.bestVoice.lang;
      } else {
        utterance.lang = 'pt-BR';
      }

      // Force Brazilian Portuguese pronunciation for all voices
      utterance.lang = 'pt-BR';
      
      // Optimize speech parameters for more natural, youthful sound
      if (this.bestVoice?.name.includes('Eddy') || this.bestVoice?.name.includes('Flo')) {
        // Eddy/Flo voices - optimize for natural flow
        utterance.rate = 1.1; // Slightly faster for more natural rhythm
        utterance.pitch = 1.0; // Natural pitch
        utterance.volume = 0.95;
      } else if (this.bestVoice?.name.includes('Joana')) {
        // Joana voice - force Brazilian pronunciation and optimize
        utterance.rate = 0.95; // Slightly slower for clarity with Brazilian accent
        utterance.pitch = 1.08; // Slightly higher for younger, Brazilian sound
        utterance.volume = 0.92;
        utterance.lang = 'pt-BR'; // Force Brazilian Portuguese
        console.log('🇧🇷 Forcing Joana to speak Brazilian Portuguese');
      } else {
        // Other voices - make them sound more natural
        utterance.rate = 1.0; // Normal speed for more natural flow
        utterance.pitch = 1.15; // Higher pitch for younger, more energetic sound
        utterance.volume = 0.9;
      }

      utterance.onend = () => {
        if (onEnd) onEnd();
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        if (onEnd) onEnd();
      };

      console.log('Speaking with voice:', this.bestVoice?.name || 'default', 'Text:', cleanText);
      this.synthesis.speak(utterance);
    } catch (error) {
      console.error('Error in speak:', error);
      if (onEnd) onEnd();
    }
  }

  private cleanTextForSpeech(text: string): string {
    return text
      // Remove emojis for better pronunciation
      .replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '')
      // Fix brand name pronunciations (phonetic spelling for Portuguese TTS)
      .replace(/\bLeapmotor\b/g, 'Líp Motor')
      .replace(/\bLeap\s+AI\b/g, 'Líp AI')
      .replace(/\bLEAP\s+AI\b/g, 'Líp AI')
      .replace(/\bLeap\b/g, 'Líp')
      .replace(/\bLEAP\b/g, 'Líp')
      // Replace common abbreviations with full words
      .replace(/\bB10\b/g, 'B dez')
      .replace(/\bT03\b/g, 'T zero três') 
      .replace(/\bC10\b/g, 'C dez')
      .replace(/\bkm\b/g, 'quilômetros')
      .replace(/\bcv\b/g, 'cavalos')
      .replace(/\bR\$\b/g, 'reais')
      .replace(/\bkWh\b/g, 'quilowatts hora')
      // Fix other English tech terms and common mispronunciations
      .replace(/\btest-drive\b/gi, 'teste drive')
      .replace(/\btest drive\b/gi, 'teste drive')
      .replace(/\bCell-to-Chassis\b/g, 'Cell tu Chassis')
      .replace(/\bCTC\b/g, 'C T C')
      .replace(/\bSUV\b/g, 'S U V')
      .replace(/\bAI\b/g, 'A I')
      .replace(/\b0-100\b/g, 'zero a cem')
      // Fix specific model pronunciations in context
      .replace(/\bmodelo B10\b/g, 'modelo B dez')
      .replace(/\bmodelo T03\b/g, 'modelo T zero três')
      .replace(/\bmodelo C10\b/g, 'modelo C dez')
      // Add natural pauses for better flow
      .replace(/\!\s/g, '! ')
      .replace(/\?\s/g, '? ')
      .replace(/\.\s/g, '. ')
      // Make numbers more natural
      .replace(/\b420\s*km\b/g, 'quatrocentos e vinte quilômetros')
      .replace(/\b280\s*km\b/g, 'duzentos e oitenta quilômetros')
      .replace(/\b231\s*cv\b/g, 'duzentos e trinta e um cavalos')
      .replace(/\b109\s*cv\b/g, 'cento e nove cavalos')
      // Make prices more natural
      .replace(/R\$\s*239\.990/g, 'duzentos e trinta e nove mil novecentos e noventa reais')
      .replace(/R\$\s*169\.990/g, 'cento e sessenta e nove mil novecentos e noventa reais')
      .replace(/R\$\s*299\.990/g, 'duzentos e noventa e nove mil novecentos e noventa reais')
      // Add breathing space to long sentences
      .replace(/([.!?])\s*([A-Z])/g, '$1 $2')
      // Clean up extra spaces
      .replace(/\s+/g, ' ')
      .trim();
  }

  stopSpeaking(): void {
    if (this.synthesis && this.isAvailable) {
      try {
        this.synthesis.cancel();
      } catch (error) {
        console.error('Error stopping speech:', error);
      }
    }
  }

  isSpeaking(): boolean {
    return this.synthesis && this.isAvailable ? this.synthesis.speaking : false;
  }

  isSupported(): boolean {
    return this.isAvailable;
  }

  getBrazilianVoices(): SpeechSynthesisVoice[] {
    if (!this.synthesis) return [];
    return this.synthesis.getVoices().filter(voice => 
      voice.lang === 'pt-BR' || voice.lang.startsWith('pt')
    );
  }

  getCurrentVoice(): SpeechSynthesisVoice | null {
    return this.bestVoice;
  }

  setVoice(voice: SpeechSynthesisVoice): void {
    this.bestVoice = voice;
    console.log('Voice changed to:', voice.name, voice.lang);
  }

  // Method to test different "Leap" pronunciations
  testLeapPronunciations(): void {
    const pronunciations = [
      'Líp Motor',      // Current
      'Liip Motor',     // Alternative 1
      'Leep Motor',     // Alternative 2
      'Leap Motor',     // Original (may sound portuguese)
    ];

    pronunciations.forEach((pronunciation, index) => {
      setTimeout(() => {
        this.speak(`Teste ${index + 1}: Bem-vindo à ${pronunciation}!`);
      }, index * 3000);
    });
  }

  // Method to make Portuguese text sound more Brazilian
  private makeBrazilian(text: string): string {
    return text
      // Replace Portuguese pronunciations with Brazilian ones
      .replace(/\bveículo\b/g, 'veículo') // Emphasize Brazilian pronunciation
      .replace(/\bautomóvel\b/g, 'carro') // More Brazilian term
      .replace(/\bestacionamento\b/g, 'estacionamento') // Keep Brazilian
      .replace(/\btelemóvel\b/g, 'celular') // Brazilian term
      .replace(/\bcomboio\b/g, 'trem') // Brazilian term
      .replace(/\bactualizaç\b/g, 'atualizaç') // Brazilian spelling (remove 'c')
      .replace(/\bactualização\b/g, 'atualização') // Brazilian spelling
      // Emphasize Brazilian gerund style
      .replace(/\bestou a ([a-z]+)ar\b/g, 'estou $1ando') // Portuguese -> Brazilian gerund
      .replace(/\bestás a ([a-z]+)ar\b/g, 'está $1ando') // Portuguese -> Brazilian gerund
      // Replace some Portuguese colloquialisms with Brazilian
      .replace(/\bpois claro\b/g, 'claro')
      .replace(/\bde facto\b/g, 'de fato')
      .replace(/\bactualmente\b/g, 'atualmente'); // Brazilian pronunciation emphasis
  }
}

export const simpleSpeechService = new SimpleSpeechService();
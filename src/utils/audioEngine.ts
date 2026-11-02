/**
 * Real-time Web Audio Piezo Buzzer Synthesizer
 */

class AudioEngine {
  private ctx: AudioContext | null = null;
  private osc: OscillatorNode | null = null;
  private gain: GainNode | null = null;
  private currentFreq: number = 0;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public playTone(freq: number) {
    if (freq <= 0) {
      this.stopTone();
      return;
    }

    try {
      this.initCtx();
      if (!this.ctx) return;

      if (!this.osc) {
        this.osc = this.ctx.createOscillator();
        this.gain = this.ctx.createGain();
        this.osc.type = 'square'; // Classic square wave piezo tone
        this.gain.gain.setValueAtTime(0.08, this.ctx.currentTime); // Comfortable volume
        this.osc.connect(this.gain);
        this.gain.connect(this.ctx.destination);
        this.osc.start();
      }

      this.currentFreq = freq;
      this.osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      if (this.gain) {
        this.gain.gain.cancelScheduledValues(this.ctx.currentTime);
        this.gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      }
    } catch {
      // Audio autoplay policy fallback
    }
  }

  public stopTone() {
    if (this.gain && this.ctx) {
      try {
        this.gain.gain.setValueAtTime(0, this.ctx.currentTime);
      } catch {
        // Ignore
      }
    }
    if (this.osc) {
      try {
        this.osc.stop();
        this.osc.disconnect();
      } catch {
        // Ignore
      }
      this.osc = null;
    }
    this.currentFreq = 0;
  }
}

export const soundEngine = new AudioEngine();

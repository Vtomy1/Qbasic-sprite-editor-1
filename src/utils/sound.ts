// Web Audio API synthesizer modeling the classic 8253/8254 PC Speaker chip (square wave)

class PcSpeaker {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    // Lazy initialize on first interaction
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setEnabled(val: boolean) {
    this.enabled = val;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Classic QBasic SOUND freq, duration (where duration 18.2 ≈ 1 sec)
   */
  public playSound(freq: number, durationMs: number = 80, type: OscillatorType = 'square', vol: number = 0.15) {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + durationMs / 1000);
    } catch {
      // Audio autoplay policy catch
    }
  }

  // Pre-baked retro sound effects
  public playStep() {
    this.playSound(220, 30, 'square', 0.1);
  }

  public playDraw() {
    this.playSound(440, 25, 'triangle', 0.08);
  }

  public playCoin() {
    if (!this.enabled) return;
    this.playSound(987, 60, 'square', 0.12);
    setTimeout(() => {
      this.playSound(1318, 120, 'square', 0.12);
    }, 60);
  }

  public playBump() {
    this.playSound(110, 80, 'square', 0.2);
  }

  public playLaser() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {
      // ignore
    }
  }

  public playBootBeep() {
    this.playSound(800, 150, 'square', 0.15);
  }
}

export const pcSpeaker = new PcSpeaker();

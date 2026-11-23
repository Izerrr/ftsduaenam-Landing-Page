import { useSyncExternalStore } from "react";

type Listener = () => void;

/**
 * Pure Web Audio API tactile micro-sound synthesizer.
 * Zero external audio files, zero network cost, muted cleanly by default until toggled ON.
 */
class StudioSoundEngine {
  private enabled = false;
  private ctx: AudioContext | null = null;
  private listeners = new Set<Listener>();

  subscribe = (listener: Listener) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = () => this.enabled;

  isEnabled = () => this.enabled;

  toggle = (): boolean => {
    this.enabled = !this.enabled;
    if (this.enabled) {
      this.ensureContext();
      this.playSuccess();
    }
    this.listeners.forEach((fn) => fn());
    return this.enabled;
  };

  private ensureContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === "suspended") {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  private getReadyContext(): AudioContext | null {
    if (!this.enabled) return null;
    return this.ensureContext();
  }

  /** Crisp studio tick on buttons, tabs, and menu triggers */
  playClick() {
    const ctx = this.getReadyContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(340, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.04);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.05);
  }

  /** Whisper-soft metallic tick on menu rows */
  playHover() {
    const ctx = this.getReadyContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(680, now);
    osc.frequency.exponentialRampToValueAtTime(520, now + 0.02);

    gain.gain.setValueAtTime(0.022, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.024);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.03);
  }

  /** Deep resonant swell when Scene 02 cobalt flood activates/releases */
  playFlood(active: boolean) {
    const ctx = this.getReadyContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = "sine";
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(active ? 320 : 180, now);

    if (active) {
      osc.frequency.setValueAtTime(64, now);
      osc.frequency.exponentialRampToValueAtTime(118, now + 0.18);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.085, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
    } else {
      osc.frequency.setValueAtTime(110, now);
      osc.frequency.exponentialRampToValueAtTime(58, now + 0.14);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
    }

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.26);
  }

  /** Hero overdrive turbine charge & release */
  playOverdrive(active: boolean) {
    const ctx = this.getReadyContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = "sawtooth";
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(active ? 220 : 420, now);
    filter.frequency.exponentialRampToValueAtTime(active ? 640 : 140, now + 0.22);

    osc.frequency.setValueAtTime(active ? 72 : 128, now);
    osc.frequency.exponentialRampToValueAtTime(active ? 132 : 66, now + 0.22);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.045, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.27);
  }

  /** Fast cobalt shutter sweep when jumping between scenes */
  playShutter() {
    const ctx = this.getReadyContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(190, now);
    osc.frequency.exponentialRampToValueAtTime(58, now + 0.16);

    gain.gain.setValueAtTime(0.07, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.17);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.19);
  }

  /** Crisp two-note harmonic confirmation (copy email / sound enable) */
  playSuccess() {
    const ctx = this.getReadyContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    [520, 780].forEach((freq, idx) => {
      const start = now + idx * 0.055;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.045, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.11);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.12);
    });
  }

  /** Tactile mechanical key-switch "thock" with subtle studio tonal variation (non-piano) */
  playTypeThock(normX: number, isHeavy = false) {
    const ctx = this.getReadyContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const baseFreq = (isHeavy ? 112 : 138) + normX * 42 + (Math.random() - 0.5) * 14;

    // 1. Deep gasket-mount body thock
    const bodyOsc = ctx.createOscillator();
    const bodyGain = ctx.createGain();
    bodyOsc.type = "triangle";
    bodyOsc.frequency.setValueAtTime(baseFreq, now);
    bodyOsc.frequency.exponentialRampToValueAtTime(48, now + 0.045);

    bodyGain.gain.setValueAtTime(0.085, now);
    bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    bodyOsc.connect(bodyGain);
    bodyGain.connect(ctx.destination);
    bodyOsc.start(now);
    bodyOsc.stop(now + 0.055);

    // 2. Crisp short keycap transient tick
    const tickOsc = ctx.createOscillator();
    const tickFilter = ctx.createBiquadFilter();
    const tickGain = ctx.createGain();

    tickOsc.type = "sine";
    tickOsc.frequency.setValueAtTime(1450 + normX * 480, now);
    tickOsc.frequency.exponentialRampToValueAtTime(420, now + 0.014);

    tickFilter.type = "bandpass";
    tickFilter.frequency.setValueAtTime(1600, now);
    tickFilter.Q.setValueAtTime(1.4, now);

    tickGain.gain.setValueAtTime(0.032, now);
    tickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.016);

    tickOsc.connect(tickFilter);
    tickFilter.connect(tickGain);
    tickGain.connect(ctx.destination);
    tickOsc.start(now);
    tickOsc.stop(now + 0.02);
  }

  /** Warm lush D-minor 9 chord shimmer triggered by secret keyword easter eggs */
  playChord() {
    const ctx = this.getReadyContext();
    if (!ctx) return;

    const chord = [293.66, 349.23, 440.0, 523.25, 659.25];
    const now = ctx.currentTime;

    chord.forEach((freq, idx) => {
      const start = now + idx * 0.032;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.001, start);
      gain.gain.linearRampToValueAtTime(0.04, start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.65);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.68);
    });
  }
}

export const studioSound = new StudioSoundEngine();

export function useSoundEnabled(): boolean {
  return useSyncExternalStore(
    studioSound.subscribe,
    studioSound.getSnapshot,
    () => false
  );
}

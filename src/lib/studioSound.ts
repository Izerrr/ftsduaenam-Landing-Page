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

  /** Warm pentatonic electric-piano note mapped to horizontal key position (0..1) */
  playNote(normX: number) {
    const ctx = this.getReadyContext();
    if (!ctx) return;

    const scale = [
      293.66, // D4
      349.23, // F4
      392.0,  // G4
      440.0,  // A4
      523.25, // C5
      587.33, // D5
      698.46, // F5
      783.99, // G5
      880.0,  // A5
      1046.5, // C6
      1174.66, // D6
    ];
    const index = Math.max(
      0,
      Math.min(scale.length - 1, Math.round(normX * (scale.length - 1)))
    );
    const freq = scale[index];
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const overtone = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now);

    overtone.type = "triangle";
    overtone.frequency.setValueAtTime(freq * 2, now);

    const overtoneGain = ctx.createGain();
    overtoneGain.gain.setValueAtTime(0.18, now);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(2400, now);
    filter.frequency.exponentialRampToValueAtTime(680, now + 0.35);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.055, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);

    osc.connect(filter);
    overtone.connect(overtoneGain);
    overtoneGain.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    overtone.start(now);
    osc.stop(now + 0.44);
    overtone.stop(now + 0.44);
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

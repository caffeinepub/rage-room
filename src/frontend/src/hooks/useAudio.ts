import { useCallback, useRef } from "react";

export function useAudio() {
  const ctxRef = useRef<AudioContext | null>(null);

  const getCtx = useCallback(() => {
    if (!ctxRef.current || ctxRef.current.state === "closed") {
      ctxRef.current = new AudioContext();
    }
    if (ctxRef.current.state === "suspended") {
      ctxRef.current.resume();
    }
    return ctxRef.current;
  }, []);

  const playSmash = useCallback(() => {
    try {
      const ctx = getCtx();
      const now = ctx.currentTime;

      // White noise burst
      const bufLen = Math.floor(ctx.sampleRate * 0.18);
      const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1;

      const src = ctx.createBufferSource();
      src.buffer = buf;

      // Filter: low-pass + distortion feel
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(3000, now);
      filter.frequency.exponentialRampToValueAtTime(200, now + 0.18);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(1.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      // Second oscillator for thud feel
      const osc = ctx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.12);

      const oscGain = ctx.createGain();
      oscGain.gain.setValueAtTime(0.8, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      src.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);

      src.start(now);
      src.stop(now + 0.18);
      osc.start(now);
      osc.stop(now + 0.12);
    } catch {
      // audio not available
    }
  }, [getCtx]);

  const playCombo = useCallback(
    (level: number) => {
      try {
        const ctx = getCtx();
        const now = ctx.currentTime;
        const baseFreq = 440 + (level - 2) * 120;

        for (let i = 0; i < 2; i++) {
          const osc = ctx.createOscillator();
          osc.type = "sine";
          osc.frequency.setValueAtTime(
            baseFreq * (i === 1 ? 1.5 : 1),
            now + i * 0.08,
          );

          const gain = ctx.createGain();
          gain.gain.setValueAtTime(0.4, now + i * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.15);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.08);
          osc.stop(now + i * 0.08 + 0.15);
        }
      } catch {
        // audio not available
      }
    },
    [getCtx],
  );

  const playRage = useCallback(() => {
    try {
      const ctx = getCtx();
      const now = ctx.currentTime;
      const duration = 1.2;

      // Low rumble
      const bufLen = Math.floor(ctx.sampleRate * duration);
      const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1;

      const src = ctx.createBufferSource();
      src.buffer = buf;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 120;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0, now);
      gain.gain.linearRampToValueAtTime(1.0, now + 0.1);
      gain.gain.setValueAtTime(1.0, now + duration - 0.3);
      gain.gain.linearRampToValueAtTime(0.0, now + duration);

      // Screech
      const osc = ctx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(80, now);
      osc.frequency.linearRampToValueAtTime(40, now + duration);

      const oscGain = ctx.createGain();
      oscGain.gain.setValueAtTime(0.5, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      src.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.connect(oscGain);
      oscGain.connect(ctx.destination);

      src.start(now);
      src.stop(now + duration);
      osc.start(now);
      osc.stop(now + duration);
    } catch {
      // audio not available
    }
  }, [getCtx]);

  const playEnter = useCallback(() => {
    try {
      const ctx = getCtx();
      const now = ctx.currentTime;

      // Punchy impact: low thud + rising whoosh
      // 1. Sub-bass thud
      const osc1 = ctx.createOscillator();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(120, now);
      osc1.frequency.exponentialRampToValueAtTime(40, now + 0.15);

      const g1 = ctx.createGain();
      g1.gain.setValueAtTime(1.0, now);
      g1.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc1.connect(g1);
      g1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.2);

      // 2. Distorted mid impact
      const osc2 = ctx.createOscillator();
      osc2.type = "sawtooth";
      osc2.frequency.setValueAtTime(220, now);
      osc2.frequency.exponentialRampToValueAtTime(60, now + 0.1);

      const g2 = ctx.createGain();
      g2.gain.setValueAtTime(0.7, now);
      g2.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc2.connect(g2);
      g2.connect(ctx.destination);
      osc2.start(now);
      osc2.stop(now + 0.12);

      // 3. Whoosh: filtered noise sweep
      const bufLen = Math.floor(ctx.sampleRate * 0.35);
      const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < bufLen; i++) d[i] = Math.random() * 2 - 1;

      const nSrc = ctx.createBufferSource();
      nSrc.buffer = buf;

      const band = ctx.createBiquadFilter();
      band.type = "bandpass";
      band.frequency.setValueAtTime(400, now);
      band.frequency.exponentialRampToValueAtTime(3000, now + 0.25);
      band.Q.value = 1.5;

      const gNoise = ctx.createGain();
      gNoise.gain.setValueAtTime(0.0, now);
      gNoise.gain.linearRampToValueAtTime(0.5, now + 0.04);
      gNoise.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      nSrc.connect(band);
      band.connect(gNoise);
      gNoise.connect(ctx.destination);
      nSrc.start(now);
      nSrc.stop(now + 0.35);

      // 4. High metallic ping for impact sheen
      const osc3 = ctx.createOscillator();
      osc3.type = "triangle";
      osc3.frequency.setValueAtTime(880, now + 0.02);
      osc3.frequency.exponentialRampToValueAtTime(440, now + 0.2);

      const g3 = ctx.createGain();
      g3.gain.setValueAtTime(0.3, now + 0.02);
      g3.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc3.connect(g3);
      g3.connect(ctx.destination);
      osc3.start(now + 0.02);
      osc3.stop(now + 0.22);
    } catch {
      // audio not available
    }
  }, [getCtx]);

  return { playSmash, playCombo, playRage, playEnter };
}

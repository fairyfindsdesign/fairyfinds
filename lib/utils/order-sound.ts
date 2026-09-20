/**
 * Plays a short 3-tone ascending chime using the Web Audio API.
 * No audio files needed. Respects browser autoplay policies.
 */
export function playOrderPing(): void {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();
    const now = ctx.currentTime;

    const tones = [523.25, 659.25, 783.99]; // C5, E5, G5 — a gentle major chord

    tones.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.12);

      gain.gain.setValueAtTime(0, now + i * 0.12);
      gain.gain.linearRampToValueAtTime(0.18, now + i * 0.12 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + i * 0.12);
      osc.stop(now + i * 0.12 + 0.3);
    });

    // Close context after all tones finish
    setTimeout(() => ctx.close(), 1200);
  } catch {
    // Silently ignore if autoplay is blocked or browser doesn't support
  }
}

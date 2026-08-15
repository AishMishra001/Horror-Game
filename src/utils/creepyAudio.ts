'use client';

// Web Audio API helper for playing audio with a creepy echo & pitch effect
let activeAudioContext: AudioContext | null = null;

export async function playCreepyAudio(audioUrl: string = '/koteshwaraye-ravi-kishan.mp3') {
  if (typeof window === 'undefined') return;

  try {
    const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!activeAudioContext || activeAudioContext.state === 'closed') {
      activeAudioContext = new AudioCtxClass();
    }
    const audioCtx = activeAudioContext;

    if (audioCtx.state === 'suspended') {
      await audioCtx.resume();
    }

    // Fetch the audio file
    const response = await fetch(audioUrl);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

    const source = audioCtx.createBufferSource();
    source.buffer = audioBuffer;

    // Pitch drop / slow down for eerie haunted voice (0.9x speed)
    source.playbackRate.value = 0.9;

    // Lowpass filter for cavernous, hollow mansion acoustics
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1500;
    filter.Q.value = 3.0;

    // Echo Delay 1 (380ms tap)
    const delay1 = audioCtx.createDelay();
    delay1.delayTime.value = 0.38;

    const feedback1 = audioCtx.createGain();
    feedback1.gain.value = 0.52;

    // Echo Delay 2 (740ms tap for multi-echo spookiness)
    const delay2 = audioCtx.createDelay();
    delay2.delayTime.value = 0.74;

    const feedback2 = audioCtx.createGain();
    feedback2.gain.value = 0.38;

    // Master Gain
    const masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.85;

    // Connect graph:
    // Source -> Filter
    source.connect(filter);

    // Dry signal -> Master
    filter.connect(masterGain);

    // Echo 1 Feedback Loop -> Master
    filter.connect(delay1);
    delay1.connect(feedback1);
    feedback1.connect(delay1);
    delay1.connect(masterGain);

    // Echo 2 Feedback Loop -> Master
    filter.connect(delay2);
    delay2.connect(feedback2);
    feedback2.connect(delay2);
    delay2.connect(masterGain);

    // Master -> Speaker output
    masterGain.connect(audioCtx.destination);

    source.start(0);
  } catch (err) {
    console.error('Error playing creepy audio:', err);
  }
}

/**
 * High-fidelity, zero-latency mechanical flashlight toggle switch click sound
 */
export function playFlashlightClickSound(isOn?: boolean) {
  if (typeof window === 'undefined') return;

  try {
    const AudioCtxClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!activeAudioContext || activeAudioContext.state === 'closed') {
      activeAudioContext = new AudioCtxClass();
    }
    const audioCtx = activeAudioContext;
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const t = audioCtx.currentTime;

    // 1. Initial mechanical contact click (high frequency snap)
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(isOn ? 2400 : 1800, t);
    osc1.frequency.exponentialRampToValueAtTime(120, t + 0.025);

    gain1.gain.setValueAtTime(0.5, t);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.025);

    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    osc1.start(t);
    osc1.stop(t + 0.03);

    // 2. Secondary metallic switch lock thump (delayed by 12ms)
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(isOn ? 850 : 650, t + 0.012);
    osc2.frequency.exponentialRampToValueAtTime(60, t + 0.045);

    gain2.gain.setValueAtTime(0, t);
    gain2.gain.setValueAtTime(0.65, t + 0.012);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    // Filter for muffled plastic/metal casing resonance
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1200;
    filter.Q.value = 2.0;

    osc2.connect(filter);
    filter.connect(gain2);
    gain2.connect(audioCtx.destination);

    osc2.start(t + 0.012);
    osc2.stop(t + 0.055);
  } catch (err) {
    console.error('Error playing flashlight click:', err);
  }
}

/**
 * Satisfying survival horror item acquisition chime
 */
export function playItemPickupSound() {
  if (typeof window === 'undefined') return;

  try {
    const AudioCtxClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!activeAudioContext || activeAudioContext.state === 'closed') {
      activeAudioContext = new AudioCtxClass();
    }
    const audioCtx = activeAudioContext;
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const t = audioCtx.currentTime;

    // Harmonic 1: 587.33 Hz (D5)
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, t);
    osc1.frequency.exponentialRampToValueAtTime(880, t + 0.12);

    gain1.gain.setValueAtTime(0.4, t);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    osc1.start(t);
    osc1.stop(t + 0.65);

    // Harmonic 2: 1174.66 Hz (D6 chime)
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1174.66, t + 0.08);
    osc2.frequency.exponentialRampToValueAtTime(1760, t + 0.25);

    gain2.gain.setValueAtTime(0, t);
    gain2.gain.setValueAtTime(0.35, t + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.8);

    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);
    osc2.start(t + 0.08);
    osc2.stop(t + 0.85);
  } catch (err) {
    console.error('Error playing item pickup sound:', err);
  }
}


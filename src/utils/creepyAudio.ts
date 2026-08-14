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

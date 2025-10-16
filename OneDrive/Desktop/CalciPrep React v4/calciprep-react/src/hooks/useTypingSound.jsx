import { useState, useCallback, useRef } from 'react';

/**
 * A custom hook to manage the logic for creating and playing typing sounds.
 * It programmatically generates a click sound, so no audio files are needed.
 * @param {boolean} initialEnabled - Whether the sound should be enabled initially.
 * @returns {{soundEnabled: boolean, toggleSound: Function, playKeySound: Function}}
 */
export const useTypingSound = (initialEnabled = false) => {
  const [soundEnabled, setSoundEnabled] = useState(initialEnabled);
  const audioCtxRef = useRef(null);
  const clickBufferRef = useRef(null);

  // This function creates the audio context and sound buffer only once.
  const initializeAudio = useCallback(async () => {
    if (audioCtxRef.current && clickBufferRef.current) return;

    try {
      const context = new (window.AudioContext || window.webkitAudioContext)();
      audioCtxRef.current = context;

      // Programmatically create a simple click sound buffer, similar to the original site's logic
      const sampleRate = context.sampleRate;
      const durationSec = 0.06;
      const toneFreq = 1600 + Math.random() * 400;
      const noiseGain = 0.25;
      const toneGain = 0.6;
      const decay = 20;
      const len = Math.floor(sampleRate * durationSec);
      
      const offline = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(1, len, sampleRate);
      
      const osc = offline.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = toneFreq;
      
      const toneGainNode = offline.createGain();
      toneGainNode.gain.setValueAtTime(0.0001, 0);
      toneGainNode.gain.linearRampToValueAtTime(toneGain, 0.002);
      toneGainNode.gain.exponentialRampToValueAtTime(0.0001, durationSec);
      
      osc.connect(toneGainNode);
      toneGainNode.connect(offline.destination);

      const noiseBuf = offline.createBuffer(1, len, sampleRate);
      const nd = noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) {
        const t = i / len;
        nd[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, decay) * noiseGain;
      }
      const noiseSrc = offline.createBufferSource();
      noiseSrc.buffer = noiseBuf;
      noiseSrc.connect(offline.destination);

      osc.start(0);
      noiseSrc.start(0);
      
      clickBufferRef.current = await offline.startRendering();

    } catch (e) {
      console.error("Could not create typing sounds:", e);
      audioCtxRef.current = null;
      clickBufferRef.current = null;
    }
  }, []);

  // The function that components will call to play the sound
  const playKeySound = useCallback(() => {
    if (!soundEnabled || !audioCtxRef.current || !clickBufferRef.current) return;

    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }

    const source = audioCtxRef.current.createBufferSource();
    source.buffer = clickBufferRef.current;
    source.playbackRate.value = 1.0 + Math.random() * 0.2;
    source.connect(audioCtxRef.current.destination);
    source.start();
  }, [soundEnabled]);

  // Function to enable or disable the sound
  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => {
      const isNowEnabled = !prev;
      if (isNowEnabled) {
        initializeAudio();
      }
      return isNowEnabled;
    });
  }, [initializeAudio]);

  return { soundEnabled, toggleSound, playKeySound };
};

"use client";

import { useRef, useCallback } from 'react';

type OscillatorType = "sine" | "square" | "sawtooth" | "triangle";

/**
 * A custom hook to play a procedural typing sound.
 * This avoids loading an audio file and provides instant feedback.
 * @param volume - The volume of the sound (0 to 1).
 * @param frequency - The frequency of the sound in Hz.
 * @param type - The shape of the sound wave.
 * @returns A function to call to play the sound.
 */
const useTypingSound = (
  volume: number = 0.5, 
  frequency: number = 440, 
  type: OscillatorType = 'sine'
) => {
    // useRef is used to persist the AudioContext instance across re-renders.
    const audioContextRef = useRef<AudioContext | null>(null);

    const playSound = useCallback(() => {
        // Initialize AudioContext on first play to comply with browser audio policies.
        if (!audioContextRef.current) {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContext) {
                audioContextRef.current = new AudioContext();
            } else {
                console.error("AudioContext is not supported in this browser.");
                return;
            }
        }
        
        const oscillator = audioContextRef.current.createOscillator();
        const gainNode = audioContextRef.current.createGain();

        // Configure the sound properties
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);
        
        // Configure the volume and a quick fade-out to create a "click" sound
        gainNode.gain.setValueAtTime(volume, audioContextRef.current.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContextRef.current.currentTime + 0.05);

        // Connect the nodes and play the sound
        oscillator.connect(gainNode);
        gainNode.connect(audioContextRef.current.destination);
        oscillator.start(0);
        oscillator.stop(audioContextRef.current.currentTime + 0.05);
    }, [volume, frequency, type]);

    return playSound;
};

export default useTypingSound;

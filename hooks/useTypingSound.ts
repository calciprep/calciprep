"use client";

import { useRef, useCallback } from 'react';

type OscillatorType = "sine" | "square" | "sawtooth" | "triangle";

// Define an interface extending the global Window type
// to include BOTH standard and vendor-prefixed AudioContext
interface WindowWithAudioContext extends Window {
  AudioContext?: typeof AudioContext; // Add the standard AudioContext here
  webkitAudioContext?: typeof AudioContext;
}

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
        // Ensure this code runs only in the browser
        if (typeof window === 'undefined') return;

        // Initialize AudioContext on first play to comply with browser audio policies.
        if (!audioContextRef.current) {
            // Use the extended Window type for the assertion
            const win = window as WindowWithAudioContext;
            // Now TypeScript knows both properties might exist on 'win'
            const AudioContextClass = win.AudioContext || win.webkitAudioContext;
            if (AudioContextClass) {
                try {
                    audioContextRef.current = new AudioContextClass();
                } catch (e) {
                     console.error("Error creating AudioContext:", e);
                     return; // Don't proceed if context creation fails
                }
            } else {
                console.error("AudioContext is not supported in this browser.");
                return; // Don't proceed if not supported
            }
        }

        // Check if context was successfully created before using it
        if (!audioContextRef.current) return;

        const context = audioContextRef.current; // Use a local variable for clarity
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();

        // Configure the sound properties
        oscillator.type = type;
        // Check if setValueAtTime exists before calling
        if (oscillator.frequency.setValueAtTime) {
            oscillator.frequency.setValueAtTime(frequency, context.currentTime);
        } else {
            // Fallback for older browsers if needed, though unlikely with modern AudioContext
            (oscillator.frequency as unknown as { value: number }).value = frequency;
        }


        // Configure the volume and a quick fade-out
        // Check if gain methods exist
        if (gainNode.gain.setValueAtTime && gainNode.gain.exponentialRampToValueAtTime) {
            gainNode.gain.setValueAtTime(volume, context.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.00001, context.currentTime + 0.05);
        } else {
             // Basic fallback
             (gainNode.gain as unknown as { value: number }).value = volume;
             // Simple stop might be the only option here for fade out
        }


        // Connect the nodes and play the sound
        oscillator.connect(gainNode);
        gainNode.connect(context.destination);
        oscillator.start(context.currentTime); // Start immediately
        oscillator.stop(context.currentTime + 0.05); // Stop after 50ms
    }, [volume, frequency, type]);

    return playSound;
};

export default useTypingSound;


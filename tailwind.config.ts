import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-eb-garamond)'], // Body text
        serif: ['var(--font-oswald)'],    // Heading text
        mono: ['var(--font-roboto-mono)'], // Typing/code text
        helios: ['var(--font-oswald)', 'sans-serif'], // Helios Extended display typography
      },
      colors: {
        // Helios Extended Dark Theme Tokens (Extracted directly from Canva Brand Template)
        helios: {
          black: '#000000',
          surface: '#08080C',
          card: '#0D0C15',
          border: '#1F1E2E',
          borderSubtle: '#27272A',
          borderHover: '#A78BFA',
          accent: '#C4B5FD',         // Luminous Lavender (Signature Canva accent)
          accentHover: '#DDD6FE',
          cyan: '#38BDF8',           // Secondary 3D geometric highlight
          pink: '#F472B6',           // Secondary accent
          purple: {
            deep: '#1E103A',
            glow: '#2E1065',
            vibrant: '#7C3AED',
            light: '#A78BFA',
            lavender: '#C4B5FD',
          },
          text: {
            primary: '#FFFFFF',
            secondary: '#A1A1AA',
            muted: '#71717A',
          }
        }
      },
      backgroundImage: {
        'helios-pill': 'linear-gradient(90deg, #000000 0%, #1A0B2E 50%, #4C1D95 100%)',
        'helios-card': 'linear-gradient(135deg, rgba(46,16,101,0.3) 0%, rgba(13,7,34,0.7) 50%, #000000 100%)',
        'helios-accent-gradient': 'linear-gradient(135deg, #A78BFA 0%, #38BDF8 100%)',
        'helios-radial': 'radial-gradient(circle at 50% 0%, rgba(196, 181, 253, 0.12), transparent 70%)',
      },
      boxShadow: {
        'helios-glow': '0 0 25px -5px rgba(167, 139, 250, 0.35)',
        'helios-card': '0 10px 30px -10px rgba(0, 0, 0, 0.8), 0 0 1px 1px rgba(255, 255, 255, 0.05)',
        'helios-pill': '0 4px 14px 0 rgba(124, 58, 237, 0.35)',
      },
      borderRadius: {
        'helios-card': '1.75rem',
      }
    },
  },
  plugins: [],
};
export default config;

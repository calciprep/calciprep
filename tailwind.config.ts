import type { Config } from "tailwindcss";

const config: Config = {
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
      },
    },
  },
  plugins: [],
};
export default config;


"use client";

import React, { createContext, useEffect } from 'react';
import { ReactLenis, useLenis } from "@studio-freight/react-lenis";
import type Lenis from '@studio-freight/lenis';

// The context to hold the Lenis instance remains the same.
export const LenisContext = createContext<Lenis | null>(null);

/**
 * @name LenisContent
 * @description A new wrapper component that lives inside ReactLenis.
 * Because it's a child of ReactLenis, it can use the `useLenis` hook
 * to get the smooth-scrolling instance and provide it to our custom context.
 */
const LenisContent = ({ children }: { children: React.ReactNode }) => {
  const lenis = useLenis();

  return (
    // FIX: Provide `lenis || null` to satisfy the context's type.
    <LenisContext.Provider value={lenis || null}>
      {children}
    </LenisContext.Provider>
  );
};

/**
 * @name LenisProvider
 * @description This component now wraps everything in the main ReactLenis component
 * and uses the LenisContent wrapper to correctly provide the context.
 */
function LenisProvider({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis root>
      <LenisContent>
        {children}
      </LenisContent>
    </ReactLenis>
  );
}

export default LenisProvider;


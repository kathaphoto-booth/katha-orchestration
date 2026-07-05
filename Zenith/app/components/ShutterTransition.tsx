'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { KathaLogomark } from './KathaLogomark';

gsap.registerPlugin(useGSAP);

interface ShutterContextType {
  shutterPush: (href: string) => void;
  isTransitioning: boolean;
}

const ShutterContext = createContext<ShutterContextType | undefined>(undefined);

export function useShutter() {
  const context = useContext(ShutterContext);
  if (!context) {
    throw new Error('useShutter must be used within a ShutterProvider');
  }
  return context;
}

export function ShutterProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [targetHref, setTargetHref] = useState<string | null>(null);

  const leftPanelRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const emblemRef = useRef<HTMLDivElement>(null);

  // Function to trigger the shutter close and subsequent route change
  const shutterPush = (href: string) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTargetHref(href);

    // Timeline for closing the shutter blades
    const tl = gsap.timeline({
      onComplete: () => {
        // Shutter is fully closed. Push the route!
        router.push(href);
      }
    });

    // Animate panels from offscreen to meeting in the middle
    tl.fromTo(leftPanelRef.current,
      { xPercent: -100 },
      { xPercent: 0, duration: 0.9, ease: 'power4.inOut' }
    );

    tl.fromTo(rightPanelRef.current,
      { xPercent: 100 },
      { xPercent: 0, duration: 0.9, ease: 'power4.inOut' },
      '<=' // Run concurrently
    );

    // Fade in the premium center logomark as blades meet
    tl.fromTo(emblemRef.current,
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1.1, duration: 0.6, ease: 'back.out(1.7)' },
      '-=0.4'
    );

    // Settle rotation/scale of center logomark slightly
    tl.to(emblemRef.current, {
      scale: 1.0,
      duration: 0.3,
      ease: 'power2.out'
    });
  };

  // Listen to pathname changes to trigger the shutter opening animation
  useEffect(() => {
    if (!isTransitioning) return;

    // Timeline for opening the shutter blades after page route update
    const tl = gsap.timeline({
      onComplete: () => {
        setIsTransitioning(false);
        setTargetHref(null);
      }
    });

    // Fade out the center logomark first
    tl.to(emblemRef.current, {
      opacity: 0,
      scale: 0.8,
      duration: 0.4,
      ease: 'power3.in'
    });

    // Part the shutter blades
    tl.to(leftPanelRef.current, {
      xPercent: -100,
      duration: 1.1,
      ease: 'power4.inOut'
    }, '-=0.2');

    tl.to(rightPanelRef.current, {
      xPercent: 100,
      duration: 1.1,
      ease: 'power4.inOut'
    }, '<'); // Run concurrently
  }, [pathname]);

  return (
    <ShutterContext.Provider value={{ shutterPush, isTransitioning }}>
      {children}

      {/* Shutter Blade Overlays */}
      <div 
        style={{ 
          position: 'fixed', 
          inset: 0, 
          pointerEvents: isTransitioning ? 'all' : 'none', 
          zIndex: 99999,
          display: 'flex'
        }}
      >
        {/* Left Blade */}
        <div
          ref={leftPanelRef}
          style={{
            width: '50vw',
            height: '100dvh',
            background: '#110F0D', // Kamagong
            borderRight: '1px solid #9A3D2A', // Achuete contact seam
            transform: 'translateX(-100%)',
            willChange: 'transform'
          }}
        />

        {/* Right Blade */}
        <div
          ref={rightPanelRef}
          style={{
            width: '50vw',
            height: '100dvh',
            background: '#110F0D', // Kamagong
            borderLeft: '1px solid #9A3D2A', // Achuete contact seam
            transform: 'translateX(100%)',
            willChange: 'transform'
          }}
        />

        {/* Splitted Center Emblem Reveal */}
        <div
          ref={emblemRef}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            opacity: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
            pointerEvents: 'none',
            zIndex: 100000
          }}
        >
          <KathaLogomark style={{ width: 84, height: 84, color: '#E8E1D3' }} />
          <span 
            style={{ 
              fontFamily: "'Courier Prime', monospace", 
              fontSize: 9, 
              letterSpacing: '0.2em', 
              textTransform: 'uppercase', 
              color: '#A39B8E' 
            }}
          >
            Katha Shutter
          </span>
        </div>
      </div>
    </ShutterContext.Provider>
  );
}

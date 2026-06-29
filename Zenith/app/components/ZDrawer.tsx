'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

type ZDrawerProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  width?: number;
  align?: 'right' | 'left';
};

export function ZDrawer({ open, onClose, children, width = 600, align = 'right' }: ZDrawerProps) {
  useEffect(() => {
    if (open) document.body.classList.add('drawer');
    else document.body.classList.remove('drawer');
    return () => document.body.classList.remove('drawer');
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      if (open) {
        gsap.to('.zdrawer-container', { x: '0%', duration: 0.7, ease: 'expo.out' });
        gsap.to('.zdrawer-overlay', { opacity: 1, duration: 0.6, ease: 'power2.out' });
      } else {
        gsap.to('.zdrawer-container', { x: align === 'right' ? '100%' : '-100%', duration: 0.7, ease: 'expo.out' });
        gsap.to('.zdrawer-overlay', { opacity: 0, duration: 0.6, ease: 'power2.out' });
      }
    });
    mm.add('(prefers-reduced-motion: reduce)', () => {
      gsap.set('.zdrawer-container', { x: open ? '0%' : align === 'right' ? '100%' : '-100%' });
      gsap.set('.zdrawer-overlay', { opacity: open ? 1 : 0 });
    });
  }, [open, align]);

  const sideStyle = align === 'right' ? { right: 0 } : { left: 0 };
  const initialX = align === 'right' ? '100%' : '-100%';

  return (
    <>
      <div
        data-testid="zdrawer-overlay"
        className="zdrawer-overlay"
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 300,
          background: 'rgba(0,0,0,0.55)', opacity: 0,
          pointerEvents: open ? 'auto' : 'none',
        }}
      />
      <div
        className="zdrawer-container"
        role="dialog"
        aria-modal="true"
        style={{
          position: 'fixed', top: 0, bottom: 0, ...sideStyle,
          width: '100%', maxWidth: width,
          background: '#3D352E', zIndex: 301, overflowY: 'auto',
          transform: `translateX(${initialX})`,
          boxShadow: align === 'right' ? '-60px 0 120px rgba(0,0,0,0.9)' : '60px 0 120px rgba(0,0,0,0.9)',
        }}
      >
        {children}
      </div>
    </>
  );
}

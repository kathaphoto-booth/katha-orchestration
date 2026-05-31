'use client';

import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

import { KathaWordmark } from '@/components/marks/KathaWordmark';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [scrollPercentage, setScrollPercentage] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }

      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        setScrollPercentage((window.scrollY / totalScroll) * 100);
      } else {
        setScrollPercentage(0);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Calculate initial progress on mount
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const sections = ['home', 'process', 'booth', 'events', 'founders'];
    
    const observerOptions = {
      root: null,
      rootMargin: '-30% 0px -55% 0px',
      threshold: 0,
    };

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, observerOptions);

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      sections.forEach((id) => {
        const el = document.getElementById(id);
        if (el) observer.unobserve(el);
      });
    };
  }, []);

  const navLinks = [
    { name: 'Home', href: '#home', active: activeSection === 'home' },
    { name: 'Process', href: '#process', active: activeSection === 'process' },
    { name: 'Photo Booth', href: '#booth', active: activeSection === 'booth' },
    { name: 'Events', href: '#events', active: activeSection === 'events' },
    { name: 'Founders', href: '#founders', active: activeSection === 'founders' },
  ];

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.substring(1);
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
      window.history.pushState(null, '', href);
    }
  };

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 w-full z-50 flex justify-between items-center px-margin-mobile md:px-margin-desktop py-6 bg-background border-b border-katha-iron-bark/12 transition-all duration-300',
          scrolled && 'bg-background/90 backdrop-blur-md'
        )}
      >
        <KathaWordmark />
        <nav className="hidden md:flex gap-element-gap items-center">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={(e) => handleLinkClick(e, link.href)}
              className={cn(
                'font-label-caps text-label-caps transition-colors duration-300',
                link.active
                  ? 'text-primary font-bold border-b border-primary pb-1 opacity-70'
                  : 'text-on-surface-variant hover:text-primary'
              )}
            >
              {link.name}
            </Link>
          ))}
        </nav>
        <button 
          onClick={(e) => {
            e.preventDefault();
            document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="hidden md:block font-ui bg-cta-sacred text-text-on-dark px-6 py-3 rounded-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-cta-sacred focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary transition-all"
        >
          Begin
        </button>
        {/* Mobile Menu Icon */}
        <button 
          className="md:hidden text-primary z-50 cursor-pointer"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Scroll Progress Indicator Line */}
        <div 
          className="absolute bottom-0 left-0 h-[1.5px] bg-primary transition-all duration-75 ease-out"
          style={{ width: `${scrollPercentage}%` }}
        />
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-surface-bright/95 backdrop-blur-md pt-[100px] px-margin-mobile md:hidden flex flex-col items-center justify-center tactile-bg transition-all duration-300 ease-in-out',
          mobileMenuOpen ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-4 invisible'
        )}
      >
        <nav className="flex flex-col gap-8 items-center w-full">
          {navLinks.map((link) => (
            <div key={link.name}>
              <Link
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className={cn(
                  'font-headline-md text-3xl tracking-tighter transition-colors',
                  link.active ? 'text-primary' : 'text-on-surface-variant hover:text-primary'
                )}
              >
                {link.name}
              </Link>
            </div>
          ))}
          <div className="mt-8 w-full max-w-xs">
            <button 
              className="w-full font-ui bg-cta-sacred text-text-on-dark px-6 py-4 rounded-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-cta-sacred focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary transition-all"
              onClick={() => {
                setMobileMenuOpen(false);
                document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Begin
            </button>
          </div>
        </nav>
      </div>
    </>
  );
}

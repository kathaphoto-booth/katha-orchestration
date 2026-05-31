'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  venue: string;
  index: string;
}

const testimonials: Testimonial[] = [
  {
    id: 't1',
    quote: 'The installation did not merely capture our guests; it framed the entire architectural intent of the pavilion. An absolute masterpiece of photographic integration.',
    author: 'Claire Sterling',
    role: 'Creative Director at Sterling Events',
    venue: 'Amangiri Resort, Utah',
    index: '01'
  },
  {
    id: 't2',
    quote: 'To call it a photo booth is a complete understatement. Katha Booth is an editorially graded studio that respects scale, raw lighting, and structural presence.',
    author: 'Harrison Vance',
    role: 'Architect at Vance Associates',
    venue: 'The Broad, Los Angeles',
    index: '02'
  },
  {
    id: 't3',
    quote: 'The physical archival prints are rare artifacts that our guests still display in their design studios. Pure tactile memory, captured with absolute technical precision.',
    author: 'Marcelle Moreau',
    role: 'Founder of Moreau Fine Art',
    venue: 'The Glass House, New Canaan',
    index: '03'
  }
];

export function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [activeIndex]);

  const nextTestimonial = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="w-full px-margin-mobile md:px-margin-desktop py-[120px] md:py-[180px] bg-surface-container-low border-t border-b border-outline-variant/30 relative overflow-hidden">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-start md:justify-between gap-12 md:gap-24">
        
        {/* Left Column: Heading and Indicator */}
        <div className="flex flex-col justify-between h-auto md:h-[280px] md:w-1/3">
          <div>
            <div className="mb-4 flex items-center gap-4">
              <span className="font-label-caps text-label-caps text-on-surface-variant">Client Perspectives</span>
              <div className="h-[0.5px] bg-primary w-8"></div>
            </div>
            <h3 className="font-headline-md text-headline-md text-primary tracking-tight md:max-w-xs">
              Echoes of the Architectural Moment.
            </h3>
          </div>
          
          {/* Timeline indicator for current slide */}
          <div className="hidden md:flex items-center gap-6 mt-12">
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className={cn(
                    'h-[2px] transition-all duration-500 cursor-pointer',
                    activeIndex === i ? 'w-12 bg-primary' : 'w-4 bg-outline-variant'
                  )}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
            <span className="font-mono text-xs text-on-surface-variant">
              {testimonials[activeIndex].index} / 0{testimonials.length}
            </span>
          </div>
        </div>

        {/* Right Column: Carousel Quote and Controls */}
        <div className="flex-1 flex flex-col justify-between h-auto md:min-h-[280px]">
          {/* Active Testimonial Card */}
          <div className="relative min-h-[160px] md:min-h-[200px]">
            {testimonials.map((item, idx) => (
              <div
                key={item.id}
                className={cn(
                  'transition-all duration-700 ease-in-out',
                  idx === activeIndex
                    ? 'opacity-100 translate-x-0 relative pointer-events-auto'
                    : 'opacity-0 absolute top-0 -translate-x-4 pointer-events-none'
                )}
              >
                <blockquote className="font-quote-display text-quote-display text-3xl md:text-4xl text-primary leading-relaxed font-light mb-8">
                  &ldquo;{item.quote}&rdquo;
                </blockquote>
                <div className="border-t border-outline-variant/50 pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <cite className="font-headline-md text-lg text-primary not-italic block font-medium">
                      {item.author}
                    </cite>
                    <span className="font-label-caps text-[11px] tracking-widest text-katha-terracotta-earth block mt-1 uppercase">
                      {item.role}
                    </span>
                  </div>
                  <span className="font-label-caps text-label-caps text-on-surface-variant uppercase sm:self-start bg-surface-container px-3 py-1.5 text-[10px]">
                    {item.venue}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between mt-12 md:mt-8 pt-6 border-t border-outline-variant/30">
            {/* Mobile indicator */}
            <div className="flex items-center gap-4 md:hidden">
              <span className="font-mono text-xs text-on-surface-variant">
                {testimonials[activeIndex].index} / 0{testimonials.length}
              </span>
            </div>
            
            <div className="flex gap-4 ml-auto">
              <button
                onClick={prevTestimonial}
                className="btn-emboss p-4 rounded-none cursor-pointer flex items-center justify-center border border-outline-variant hover:bg-surface-container transitions-colors duration-300"
                aria-label="Previous testimonial"
              >
                <ArrowLeft className="w-4 h-4 text-primary" />
              </button>
              <button
                onClick={nextTestimonial}
                className="btn-emboss p-4 rounded-none cursor-pointer flex items-center justify-center border border-outline-variant hover:bg-surface-container transitions-colors duration-300"
                aria-label="Next testimonial"
              >
                <ArrowRight className="w-4 h-4 text-primary" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

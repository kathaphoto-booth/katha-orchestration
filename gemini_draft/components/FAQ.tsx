'use client';

import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FAQItem {
  id: string;
  num: string;
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    id: 'f1',
    num: '01',
    question: 'What are the physical footprint and power requirements for the installation?',
    answer: 'The Structural Installation requires a minimum clear footprint of 10x10 feet with a ceiling height of at least 8.5 feet. We require a dedicated, standard 110V/15A circuit within 25 feet of the designated installation position. All power, structural brackets, and signal cabling are completely concealed inside our matte graphite-toned architectural framing.',
  },
  {
    id: 'f2',
    num: '02',
    question: 'How far in advance do we need to initiate the spatial inquiry and blueprint?',
    answer: 'To guarantee a seamless physical and tone integration, we recommend starting the inquiry phase 4 to 6 weeks prior to the event, with a strict deadline of 2 weeks prior. This enables our design team to collaborate with your architect or producer, analyze lighting characteristics, and draft the custommatic layout plan.',
  },
  {
    id: 'f3',
    num: '03',
    question: 'How does your signature editorial illumination interact with ambient venue lighting?',
    answer: 'The Katha Booth incorporates premium studio strobes equipped with custom-engineered diffusion panels. We sculpt the strobe angle during installation to complement—rather than compete with—the venue\'s natural light or architectural lighting. This structural illumination ensures a striking, high-contrast portrait grade with natural skin tones, grain, and absolute subject-background isolation.',
  },
  {
    id: 'f4',
    num: '04',
    question: 'What is the delivery timeline for physical archival prints and digital galleries?',
    answer: 'Our editorial team processes and delivers the curated, responsive digital gallery within 48 hours of the event conclusion. The physical archival prints are individual museum-grade monochrome plates printed on unbleached, heavy-duty fibrous stock, arriving safely in a bespoke custom-bound studio catalog within 14 business days.',
  }
];

export function FAQ() {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggle = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section className="w-full px-margin-mobile md:px-margin-desktop py-[100px] bg-katha-pina-ecru/50 border-t border-b border-katha-iron-bark/12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12 flex items-center gap-4">
          <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest text-[11px]">
            Technical Parameters & FAQ
          </span>
          <div className="h-[0.5px] bg-primary w-12"></div>
        </div>

        <h3 className="font-headline-md text-headline-md text-primary max-w-xl mb-16 tracking-tight">
          Delivering precision as standard. Addressing core requirements with architectural accuracy.
        </h3>

        <div className="border-t border-outline-variant">
          {faqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div 
                key={faq.id} 
                className="border-b border-outline-variant/60 overflow-hidden"
              >
                <button
                  onClick={() => toggle(faq.id)}
                  className="w-full py-8 text-left flex items-start justify-between gap-6 hover:text-secondary group transition-colors duration-300 cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <div className="flex gap-6 sm:gap-12-desktop items-baseline">
                    <span className="font-mono text-xs text-on-surface-variant/70 select-none">
                      {faq.num}
                    </span>
                    <span className="font-headline-md text-xl md:text-2xl text-primary font-normal tracking-tight group-hover:text-primary transition-colors">
                      {faq.question}
                    </span>
                  </div>
                  <span className="flex-shrink-0 mt-1.5 p-1 border border-outline-variant group-hover:border-primary transition-colors">
                    {isOpen ? (
                      <Minus className="w-3 h-3 text-primary" />
                    ) : (
                      <Plus className="w-3 h-3 text-primary" />
                    )}
                  </span>
                </button>

                <div
                  className={cn(
                    'transition-all duration-500 ease-in-out',
                    isOpen ? 'max-h-[300px] opacity-100 pb-10' : 'max-h-0 opacity-0 pointer-events-none'
                  )}
                >
                  <div className="pl-12 sm:pl-[76px] pr-8">
                    <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed max-w-2xl">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

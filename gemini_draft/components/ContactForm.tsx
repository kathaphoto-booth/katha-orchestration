'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { DeckledCard } from '@/components/DeckledCard';

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    date: '',
    venue: '',
    description: '',
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setTimeout(() => {
      setStatus('success');
      setFormData({
        name: '',
        email: '',
        date: '',
        venue: '',
        description: '',
      });
      setTimeout(() => setStatus('idle'), 5000);
    }, 1500);
  };

  return (
    <section className="px-margin-mobile md:px-margin-desktop py-section-gap flex flex-col items-center border-t border-outline-variant/30">
      <div className="w-full max-w-xl mx-auto">
        <h2 className="font-headline-md text-headline-md text-primary mb-2 text-center">
          Ready to integrate sculptural photography into your next event?
        </h2>
        <p className="font-body-md text-on-surface-variant text-center mb-12 max-w-md mx-auto">
          Please provide details regarding your event below. Our studio team will review your blueprint inquiry within forty-eight hours.
        </p>

        {status === 'success' ? (
          <DeckledCard className="p-8 text-center animate-fade-in">
            <span className="font-label-caps text-label-caps text-katha-terracotta-earth block mb-2 uppercase">
              Inquiry Registered
            </span>
            <p className="font-body-md text-primary">
              Thank you. Your request has been queued in our registry system.
            </p>
          </DeckledCard>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Name */}
            <div className="flex flex-col">
              <label 
                htmlFor="form-name" 
                className="font-mono text-[11px] tracking-[0.16em] text-on-surface-variant uppercase mb-2 font-light"
              >
                01 / Full Name
              </label>
              <input
                id="form-name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-transparent border-b border-katha-iron-bark/20 focus:border-primary pb-2 font-body-md text-primary outline-none transition-[border-color] duration-300 rounded-none h-10 px-0 shadow-none ring-0 placeholder:text-katha-abel-slate/30 focus:ring-0 focus:outline-none"
                placeholder="e.g. Sterling H. Althorp"
                disabled={status === 'submitting'}
              />
            </div>

            {/* Email Address */}
            <div className="flex flex-col">
              <label 
                htmlFor="form-email" 
                className="font-mono text-[11px] tracking-[0.16em] text-on-surface-variant uppercase mb-2 font-light"
              >
                02 / Email Address
              </label>
              <input
                id="form-email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-transparent border-b border-katha-iron-bark/20 focus:border-primary pb-2 font-body-md text-primary outline-none transition-[border-color] duration-300 rounded-none h-10 px-0 shadow-none ring-0 placeholder:text-katha-abel-slate/30 focus:ring-0 focus:outline-none"
                placeholder="e.g. sterling@althorparchitects.com"
                disabled={status === 'submitting'}
              />
            </div>

            {/* Event Details Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
              {/* Event Date */}
              <div className="flex flex-col">
                <label 
                  htmlFor="form-date" 
                  className="font-mono text-[11px] tracking-[0.16em] text-on-surface-variant uppercase mb-2 font-light"
                >
                  03 / Event Date
                </label>
                <input
                  id="form-date"
                  type="text"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-transparent border-b border-katha-iron-bark/20 focus:border-primary pb-2 font-body-md text-primary outline-none transition-[border-color] duration-300 rounded-none h-10 px-0 shadow-none ring-0 placeholder:text-katha-abel-slate/30 focus:ring-0 focus:outline-none"
                  placeholder="e.g. June 18, 2026"
                  disabled={status === 'submitting'}
                />
              </div>

              {/* Venue / Location */}
              <div className="flex flex-col">
                <label 
                  htmlFor="form-venue" 
                  className="font-mono text-[11px] tracking-[0.16em] text-on-surface-variant uppercase mb-2 font-light"
                >
                  04 / Proposed Venue
                </label>
                <input
                  id="form-venue"
                  type="text"
                  required
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  className="w-full bg-transparent border-b border-katha-iron-bark/20 focus:border-primary pb-2 font-body-md text-primary outline-none transition-[border-color] duration-300 rounded-none h-10 px-0 shadow-none ring-0 placeholder:text-katha-abel-slate/30 focus:ring-0 focus:outline-none"
                  placeholder="e.g. Amangiri Resort, Utah"
                  disabled={status === 'submitting'}
                />
              </div>
            </div>

            {/* Project / Event Description */}
            <div className="flex flex-col">
              <label 
                htmlFor="form-description" 
                className="font-mono text-[11px] tracking-[0.16em] text-on-surface-variant uppercase mb-2 font-light"
              >
                05 / Project Description & Scope
              </label>
              <textarea
                id="form-description"
                rows={3}
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-transparent border-b border-katha-iron-bark/20 focus:border-primary pb-1 font-body-md text-primary outline-none transition-[border-color] duration-300 rounded-none resize-none px-0 shadow-none ring-0 placeholder:text-katha-abel-slate/30 focus:ring-0 focus:outline-none"
                placeholder="Detailed scale of the installation, thematic palette, and venue attributes..."
                disabled={status === 'submitting'}
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4 flex justify-center">
              <button
                type="submit"
                disabled={status === 'submitting'}
                className={cn(
                  'font-label-caps text-label-caps btn-emboss px-12 py-5 rounded-none text-sm tracking-widest cursor-pointer uppercase transition-all duration-300 w-full sm:w-auto',
                  status === 'submitting' && 'opacity-50 cursor-not-allowed'
                )}
              >
                {status === 'submitting' ? 'Registering...' : 'Request a Quote'}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}

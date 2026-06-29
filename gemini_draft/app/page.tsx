'use client';

import Image from 'next/image';
import Link from 'next/link';
import { CaladoDivider } from '@/components/marks/CaladoDivider';
import { KthaMark } from '@/components/marks/KthaMark';
import { DeckledCard } from '@/components/DeckledCard';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Testimonials } from '@/components/Testimonials';
import { FadeIn } from '@/components/FadeIn';
import { ContactForm } from '@/components/ContactForm';
import { KathaThread } from '@/components/marks/KathaThread';

export default function Page() {
  return (
    <>
      <Navbar />

      {/*
        Page-wide SVG thread — runs behind all sections.
        Closes with the KTHA glyph when Φ(s) = 1.0.
      */}
      <KathaThread className="fixed inset-0 z-0 pointer-events-none" />

      <main className="relative z-10 flex-grow">

        {/* ─────────────────────────────────────────────
            1. HERO SECTION
            Eyebrow + H1 display + founding statement.
            ───────────────────────────────────────────── */}
        <FadeIn
          id="home"
          className="scroll-mt-[80px] min-h-[92vh] flex flex-col justify-center
                     px-margin-mobile md:px-margin-desktop pt-[120px] pb-section-gap"
        >
          {/* Eyebrow */}
          <p
            className="text-label-ui text-text-muted mb-8"
            style={{ fontSize: '0.7rem' }}
          >
            THE BOOTH · KATHABOOTH.COM
          </p>

          {/* H1 — Fraunces SOFT/WONK, asymmetric weight */}
          <h1
            className="font-display text-[clamp(3rem,7vw,6.5rem)] leading-[1.05]
                       text-text-primary max-w-4xl mb-10"
          >
            {/* COPY PENDING — Misty */}
            Perseverance<br />
            composed<br />
            into thread.
          </h1>

          {/* Founding statement — EB Garamond body */}
          <p
            className="font-body text-[1.125rem] leading-[1.55] text-text-muted
                       max-w-xl mb-14"
          >
            {/* COPY PENDING — Misty: one-sentence origin, ties wabi-sabi + keepsake + Filipino heritage */}
            A wooden loom. An unbleached fiber. A hand that knows when to press harder.
            Katha is built from the same material as the things it preserves.
          </p>

          {/* CTA row */}
          <div className="flex items-center gap-8">
            <button
              onClick={() =>
                document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
              }
              className="font-ui bg-cta-sacred text-text-on-dark px-8 py-4
                         rounded-none cursor-pointer
                         focus-visible:outline-none focus-visible:ring-2
                         focus-visible:ring-cta-sacred focus-visible:ring-offset-2
                         focus-visible:ring-offset-bg-primary
                         transition-colors duration-300"
              style={{ fontSize: '0.875rem', letterSpacing: '0.04em' }}
            >
              Begin
            </button>
            <Link
              href="/process"
              className="font-ui text-text-muted hover:text-text-primary
                         underline underline-offset-4 transition-colors duration-300"
              style={{ fontSize: '0.875rem', letterSpacing: '0.04em' }}
            >
              See the process
            </Link>
          </div>
        </FadeIn>

        <CaladoDivider />

        {/* ─────────────────────────────────────────────
            2. PHILOSOPHY SECTION
            The wabi-sabi / handcraft / passed-down narrative.
            ───────────────────────────────────────────── */}
        <FadeIn
          id="philosophy"
          className="scroll-mt-[80px] px-margin-mobile md:px-margin-desktop py-section-gap"
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter items-start">
            {/* Eyebrow + pull-quote — 5-col left */}
            <div className="md:col-span-5">
              <p className="text-label-ui text-text-muted mb-6" style={{ fontSize: '0.7rem' }}>
                THE PHILOSOPHY
              </p>
              <blockquote
                className="font-display text-[1.875rem] leading-[1.2] text-text-primary"
              >
                {/* COPY PENDING — Misty: the wabi-sabi distillation, 1–2 lines */}
                &ldquo;Katha: the act of composing something
                from earth, through the hand,
                into an heirloom.&rdquo;
              </blockquote>
            </div>

            {/* Body copy — 5-col right, offset */}
            <div className="md:col-span-5 md:col-start-8 md:pt-16">
              <p className="font-body text-[1rem] leading-[1.55] text-text-muted mb-8">
                {/* COPY PENDING — Misty: Barong Nipis + perseverance thread */}
                Piña fiber cannot be spun. Every filament is knotted end-to-end by hand,
                leaving microscopic knots as the maker&apos;s signature — a slow inheritance of patience
                woven into every warp and weft.
              </p>
              <p className="font-body text-[1rem] leading-[1.55] text-text-muted">
                {/* COPY PENDING — Misty: T'nalak / brass-ring metaphor */}
                The T&apos;boli call it the brass ring: permission for the cloth to leave the loom.
                Every portrait we make carries the same weight. It does not leave our hands
                until it is ready to be passed down.
              </p>
            </div>
          </div>
        </FadeIn>

        <CaladoDivider />

        {/* ─────────────────────────────────────────────
            3. PHYSICAL PRESENCE
            The booth as object. Links to /installation.
            ───────────────────────────────────────────── */}
        <FadeIn
          id="booth"
          className="scroll-mt-[80px] px-margin-mobile md:px-margin-desktop py-section-gap"
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter items-center">
            {/* Image — 7-col, variant 'b' mask (right-edge torn, Fukinsei) */}
            <div className="md:col-span-7 mb-10 md:mb-0">
              <DeckledCard variant="b" className="aspect-[4/5] bg-katha-champagne-heirloom relative overflow-hidden">
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBTRxSGdnmikqcYLwH-Ov-zCHSJzl9jekU3nUEP_qPBgAbwHX2uJc2MWzFN8lk5Uprl-H8natufMBht8Lad10_U2qbMxjjHmkDLe7ZhY4zZG4s8JqticTv_efoDe6mHqMJt9iztZuDcWtFh4VnjShCI_38E6FLcc3Ct2mrpvjmAt6Z1QDJmiQuoA_GWIXukWFd3bYVc5ky0O_15_yM7NXeBL_Ihb2rHSr1awCn2akR1Wi-c4A-94X4_EfRS8PbxJpz-MDmT7u4LKX1Y"
                  alt="The Katha booth — weathered oak frame against a raw lime-plaster wall."
                  fill
                  referrerPolicy="no-referrer"
                  className="object-cover grayscale mix-blend-multiply opacity-80"
                />
              </DeckledCard>
            </div>

            {/* Copy — 4-col right */}
            <div className="md:col-span-4 md:col-start-9">
              <p className="text-label-ui text-text-muted mb-6" style={{ fontSize: '0.7rem' }}>
                THE STRUCTURE
              </p>
              <h2 className="font-display text-[2.5rem] leading-[1.1] text-text-primary mb-6">
                {/* COPY PENDING — Misty */}
                Built like a loom,<br />not a prop.
              </h2>
              <p className="font-body text-[1rem] leading-[1.55] text-text-muted mb-8">
                {/* COPY PENDING — Misty: booth-as-object, weathered oak, iron hardware, abacá textile backdrop */}
                Sustainably sourced weathered oak. Raw iron frames.
                A woven abacá and piña textile backdrop that holds light
                the way fabric holds shadow — the sombrado effect, full scale.
              </p>
              <Link
                href="/installation"
                className="font-ui text-text-muted hover:text-text-primary
                           underline underline-offset-4 transition-colors duration-300"
                style={{ fontSize: '0.875rem', letterSpacing: '0.04em' }}
              >
                See it in action
              </Link>
            </div>
          </div>
        </FadeIn>

        <CaladoDivider />

        {/* ─────────────────────────────────────────────
            4. PROCESS TEASER
            Three phases, brief. Links to /process.
            ───────────────────────────────────────────── */}
        <FadeIn
          id="process"
          className="scroll-mt-[80px] px-margin-mobile md:px-margin-desktop py-section-gap"
        >
          <div className="mb-16">
            <p className="text-label-ui text-text-muted mb-4" style={{ fontSize: '0.7rem' }}>
              THE PROCESS
            </p>
            <h2 className="font-display text-[2.5rem] leading-[1.1] text-text-primary max-w-lg">
              {/* COPY PENDING — Misty */}
              Three passes.<br />One keeper.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-gutter gap-y-16">
            {[
              {
                ordinal: '01',
                title: 'Inquiry & Blueprint',
                body: 'Spatial analysis. Venue architecture. Lighting study. We arrive knowing the room before we enter it.',
              },
              {
                ordinal: '02',
                title: 'Structural Installation',
                body: 'The booth is erected as builders, not attendants. Cables concealed. Light sculpted. Footprint minimal.',
              },
              {
                ordinal: '03',
                title: 'The Edition',
                body: 'Archival cotton prints, debossed with the KTHA mark. A digital vault, not a gallery link. Passed down, not deleted.',
              },
            ].map((phase) => (
              <div key={phase.ordinal} className="border-t border-katha-hammered-sequin pt-8">
                <span
                  className="font-mono text-text-muted block mb-4"
                  style={{ fontSize: '0.75rem', letterSpacing: '0.25em' }}
                >
                  {phase.ordinal}
                </span>
                <h3
                  className="font-display text-[1.5rem] leading-[1.2] text-text-primary mb-4"
                >
                  {phase.title}
                </h3>
                <p className="font-body text-[0.875rem] leading-[1.55] text-text-muted">
                  {phase.body}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-16">
            <Link
              href="/process"
              className="font-ui text-text-muted hover:text-text-primary
                         underline underline-offset-4 transition-colors duration-300"
              style={{ fontSize: '0.875rem', letterSpacing: '0.04em' }}
            >
              Full methodology
            </Link>
          </div>
        </FadeIn>

        <CaladoDivider />

        {/* ─────────────────────────────────────────────
            5. EVIDENCE SECTION — testimonials / past keepsakes
            ───────────────────────────────────────────── */}
        <FadeIn id="events" className="scroll-mt-[80px]">
          <Testimonials />
        </FadeIn>

        <CaladoDivider />

        {/* ─────────────────────────────────────────────
            6. ACQUISITION FOOTER — contact + closing KTHA stroke
            ───────────────────────────────────────────── */}
        <FadeIn id="contact" className="scroll-mt-[80px]">
          <ContactForm />
        </FadeIn>

        {/* KTHA closing mark — the brass ring, final stroke of the thread */}
        <div className="flex flex-col items-center py-16 gap-2">
          <KthaMark variant="default" caption="KTHA · woven" />
        </div>

      </main>

      <div id="founders" className="scroll-mt-[80px] relative z-10">
        <Footer />
      </div>
    </>
  );
}

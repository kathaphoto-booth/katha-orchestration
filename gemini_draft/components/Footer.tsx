import Link from 'next/link';
import { KathaThread } from '@/components/marks/KathaThread';
import { KthaMark } from '@/components/marks/KthaMark';
import { KathaLogomark } from '../../Zenith/app/components/KathaLogomark';

export function Footer() {
  return (
    <footer className="w-full relative px-margin-mobile md:px-margin-desktop py-section-gap flex flex-col md:flex-row justify-between items-start gap-element-gap bg-surface border-t border-outline-variant flat no shadows">
      <KathaThread />
      <div className="flex flex-col gap-6 relative z-10">
        <div className="flex items-center gap-4">
          <KathaLogomark />
          <KthaMark className="items-start" />
        </div>
        <div className="font-label-caps text-label-caps text-primary uppercase">
          © 2024 KATHA BOOTH · ARCHITECTURAL EDITORIAL
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-8 md:gap-12">
        <Link
          href="#"
          className="font-body-md text-body-md md:font-label-caps md:text-label-caps text-on-surface-variant hover:text-primary transition-colors duration-300 hover:border-b hover:border-primary uppercase"
        >
          424-215-1450
        </Link>
        <Link
          href="#"
          className="font-body-md text-body-md md:font-label-caps md:text-label-caps text-on-surface-variant hover:text-primary transition-colors duration-300 hover:border-b hover:border-primary uppercase"
        >
          hello@kathabooth.com
        </Link>
        <Link
          href="#"
          className="font-body-md text-body-md md:font-label-caps md:text-label-caps text-on-surface-variant hover:text-primary transition-colors duration-300 hover:border-b hover:border-primary uppercase"
        >
          @kathabooth
        </Link>
        <Link
          href="#"
          className="font-body-md text-body-md md:font-label-caps md:text-label-caps text-on-surface-variant hover:text-primary transition-colors duration-300 hover:border-b hover:border-primary uppercase"
        >
          LA/OC
        </Link>
        <Link
          href="#"
          className="font-body-md text-body-md md:font-label-caps md:text-label-caps text-on-surface-variant hover:text-primary transition-colors duration-300 hover:border-b hover:border-primary uppercase"
        >
          RESERVE ON HONEYBOOK
        </Link>
      </div>
    </footer>
  );
}

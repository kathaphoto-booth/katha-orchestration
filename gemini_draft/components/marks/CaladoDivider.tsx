import { cn } from '@/lib/utils';

export function CaladoDivider({ className }: { className?: string }) {
  return (
    <div className={cn("w-[150%] max-w-[150vw] -ml-[25%] flex justify-center overflow-hidden my-16", className)}>
      <svg
        width="100%"
        height="12"
        viewBox="0 0 1000 12"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
        className="text-frame opacity-40"
      >
        <defs>
          <filter id="calado-openwork">
            <feMorphology operator="dilate" radius="0.5" in="SourceGraphic" result="dilated" />
            <feTurbulence type="fractalNoise" baseFrequency="0.2" numOctaves="2" result="noise" />
            <feComposite operator="in" in="dilated" in2="noise" />
          </filter>
        </defs>
        {/* Openwork dot and bridge */}
        <line x1="0" y1="6" x2="1000" y2="6" stroke="currentColor" strokeWidth="2" strokeDasharray="1 8" filter="url(#calado-openwork)" />
        <line x1="0" y1="6" x2="1000" y2="6" stroke="currentColor" strokeWidth="1" strokeDasharray="12 4" opacity="0.3" />
      </svg>
    </div>
  );
}

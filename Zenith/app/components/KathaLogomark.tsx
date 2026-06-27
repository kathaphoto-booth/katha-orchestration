import React from 'react';

export function KathaLogomark(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 1066 1066" preserveAspectRatio="xMidYMid meet" {...props}>
      {/* 
        The potrace transform handles the mathematical flip so 
        the paths render right-side up. 
        fill="currentColor" ensures it respects your Next.js text colors.
      */}
      <g transform="translate(0, 1066) scale(0.1, -0.1)" fill="currentColor" stroke="none">
        <path d="M533 1000 C 275 1000, 66 791, 66 533 C 66 275, 275 66, 533 66 C 791 66, 1000 275, 1000 533 C 1000 791, 791 1000, 533 1000 Z M533 933 C 754 933, 933 754, 933 533 C 933 312, 754 133, 533 133 C 312 133, 133 312, 133 533 C 133 754, 312 933, 533 933 Z" />
        <path d="M350 250 L350 750 M350 500 L650 250 M350 500 L650 750" stroke="currentColor" strokeWidth="15" />
      </g>
    </svg>
  );
}

import type {Metadata} from 'next';
import { Fraunces, EB_Garamond, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { WoodGrainEmboss } from '@/components/WoodGrainEmboss';
import { KathaThread } from '@/components/marks/KathaThread';
import { KBinakulField } from '@/components/shell/KBinakulField';

const fraunces = Fraunces({
  subsets: ['latin'],
  axes: ['SOFT', 'WONK'],
  style: ['normal', 'italic'],
  variable: '--font-fraunces',
});

const garamond = EB_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-garamond',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'Katha Photo Booth',
  description: 'Premium DSLR photo booth rooted in Filipino heritage.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${fraunces.variable} ${garamond.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="antialiased min-h-screen flex flex-col tactile-bg bg-bg-primary text-text-primary" suppressHydrationWarning>
        <WoodGrainEmboss />
        <KathaThread className="fixed inset-0 z-0" />
        <KBinakulField />
        {children}
      </body>
    </html>
  );
}


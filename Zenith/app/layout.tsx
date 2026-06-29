import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';

const fhRonaldsonDisplay = localFont({
  src: [
    { path: '../public/fonts/fh-ronaldson/FHRonaldsonDisplayTest-Light.otf',           weight: '300', style: 'normal' },
    { path: '../public/fonts/fh-ronaldson/FHRonaldsonDisplayTest-LightItalic.otf',     weight: '300', style: 'italic' },
    { path: '../public/fonts/fh-ronaldson/FHRonaldsonDisplayTest-Regular.otf',         weight: '400', style: 'normal' },
    { path: '../public/fonts/fh-ronaldson/FHRonaldsonDisplayTest-RegularItalic.otf',   weight: '400', style: 'italic' },
    { path: '../public/fonts/fh-ronaldson/FHRonaldsonDisplayTest-Medium.otf',          weight: '500', style: 'normal' },
    { path: '../public/fonts/fh-ronaldson/FHRonaldsonDisplayTest-MediumItalic.otf',    weight: '500', style: 'italic' },
    { path: '../public/fonts/fh-ronaldson/FHRonaldsonDisplayTest-SemiBold.otf',        weight: '600', style: 'normal' },
    { path: '../public/fonts/fh-ronaldson/FHRonaldsonDisplayTest-SemiBoldItalic.otf',  weight: '600', style: 'italic' },
    { path: '../public/fonts/fh-ronaldson/FHRonaldsonDisplayTest-Bold.otf',            weight: '700', style: 'normal' },
    { path: '../public/fonts/fh-ronaldson/FHRonaldsonDisplayTest-BoldItalic.otf',      weight: '700', style: 'italic' },
    { path: '../public/fonts/fh-ronaldson/FHRonaldsonDisplayTest-Black.otf',           weight: '900', style: 'normal' },
    { path: '../public/fonts/fh-ronaldson/FHRonaldsonDisplayTest-BlackItalic.otf',     weight: '900', style: 'italic' },
  ],
  display: 'swap',
  variable: '--font-fh-ronaldson-display',
});

export const metadata: Metadata = {
  title: 'Katha Booth — Booking',
  description: 'Heritage photo booth installations · Southern California',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fhRonaldsonDisplay.variable}>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}

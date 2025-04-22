// app/layout.tsx
import type { Metadata } from 'next';
import { Nunito } from 'next/font/google';
import './globals.css';

export const metadata: Metadata = {
  title: 'Terapie AI',
  description: 'Conversează cu terapeutul tău personal AI',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',                 // <link rel="icon" href="/favicon.ico"/>
    shortcut: '/favicon.ico',             // pentru unele browsere
    apple: [
      '/icons/apple-touch-icon.png'       // <link rel="apple-touch-icon" .../>
    ],
  },
  appleWebApp: {
    capable: true,
    title: 'Terapie AI',
    statusBarStyle: 'default'
  },
  other: {
    'msapplication-TileColor': '#D2A38A',
    'theme-color': '#D2A38A',
  }
};

const nunito = Nunito({ subsets: ['latin'], weight: ['400','600','700'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro">
      <head>
        {/* Nu mai ai nevoie de link-uri manuale pentru icon-uri sau manifest */}
      </head>
      <body className={nunito.className}>
        {children}
      </body>
    </html>
  );
}

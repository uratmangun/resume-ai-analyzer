import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Read farcaster config at build time
const getFarcasterConfig = () => {
  try {
    const fs = require('fs');
    const path = require('path');
    const configPath = path.join(process.cwd(), 'public/.well-known/farcaster.json');
    const configContent = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(configContent);
  } catch (error) {
    // Fallback config if file read fails
    return {
      miniapp: {
        name: 'Next.js Mini App',
        buttonTitle: 'Launch App',
        homeUrl: process.env.NEXT_PUBLIC_APP_DOMAIN || 'https://example.com',
        imageUrl: process.env.NEXT_PUBLIC_APP_DOMAIN 
          ? `https://${process.env.NEXT_PUBLIC_APP_DOMAIN}/og-image.png`
          : 'https://example.com/og-image.png',
        splashImageUrl: process.env.NEXT_PUBLIC_APP_DOMAIN 
          ? `https://${process.env.NEXT_PUBLIC_APP_DOMAIN}/splash.png`
          : 'https://example.com/splash.png',
        splashBackgroundColor: '#0ea5e9'
      }
    };
  }
};

const farcasterConfig = getFarcasterConfig();

export const metadata: Metadata = {
  title: {
    default: 'Farcaster Mini App',
    template: '%s | Farcaster Mini App',
  },
  description: 'A Farcaster mini app built with Next.js and deployed on Cloudflare Pages',
  keywords: ['Farcaster', 'Mini App', 'Web3', 'Social', 'Decentralized'],
  authors: [{ name: 'Your Name' }],
  creator: 'Your Name',
  publisher: 'Your Company',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'Farcaster Mini App',
    description: 'A Farcaster mini app built with Next.js',
    url: '/',
    siteName: 'Farcaster Mini App',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Farcaster Mini App',
    description: 'A Farcaster mini app built with Next.js',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  other: {
    // Farcaster Mini App metadata for sharing
    'fc:miniapp': JSON.stringify({
      version: '1',
      imageUrl: farcasterConfig.miniapp.imageUrl,
      button: {
        title: farcasterConfig.miniapp.buttonTitle,
        action: {
          type: 'launch_miniapp',
          name: farcasterConfig.miniapp.name,
          url: farcasterConfig.miniapp.homeUrl,
          splashImageUrl: farcasterConfig.miniapp.splashImageUrl,
          splashBackgroundColor: farcasterConfig.miniapp.splashBackgroundColor
        }
      }
    }),
    // Backward compatibility with Frames v2
    'fc:frame': JSON.stringify({
      version: '1',
      imageUrl: farcasterConfig.miniapp.imageUrl,
      button: {
        title: farcasterConfig.miniapp.buttonTitle,
        action: {
          type: 'launch_frame',
          name: farcasterConfig.miniapp.name,
          url: farcasterConfig.miniapp.homeUrl,
          splashImageUrl: farcasterConfig.miniapp.splashImageUrl,
          splashBackgroundColor: farcasterConfig.miniapp.splashBackgroundColor
        }
      }
    })
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

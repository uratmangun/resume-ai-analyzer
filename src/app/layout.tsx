import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Farcaster config - using inline config since API routes can't be read at build time
const farcasterConfig = {
  miniapp: {
    name: 'Developer Resume AI Creator',
    buttonTitle: 'Launch App',
    homeUrl: 'https://8468d4091961.ngrok-free.app',
    imageUrl: 'https://8468d4091961.ngrok-free.app/images/screenshot-embed-2025-09-02T05-37-57-650Z.png',
    splashImageUrl: 'https://8468d4091961.ngrok-free.app/images/gemini-splash-2025-09-06T00-34-02-489Z.png',
    splashBackgroundColor: '#0ea5e9'
  }
};

export const metadata: Metadata = {
  title: {
    default: 'Developer Resume AI Creator',
    template: '%s | Developer Resume AI Creator',
  },
  description: 'Build minimal, focused resumes for software developers with this Farcaster-powered Next.js mini app.',
  keywords: ['Farcaster', 'Mini App', 'Software Developer Resume', 'AI Resume Builder'],
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
    title: 'Developer Resume AI Creator',
    description: 'Create minimal resumes tailored for software developers with AI assistance.',
    url: '/',
    siteName: 'Developer Resume AI Creator',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Developer Resume AI Creator',
    description: 'Generate minimal resumes for software developers using AI and MCP.',
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
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
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
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

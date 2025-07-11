import './globals.css'
import '@rainbow-me/rainbowkit/styles.css';

export const metadata = {
  title: 'University Blockchain & Crypto Investing Club',
  description: 'A student-driven academic society empowering members to learn, invest, and lead in blockchain and digital assets. Join us for hands-on experience, real portfolio management, and collaborative research.',
  keywords: 'blockchain, cryptocurrency, investing, university, student club, DeFi, NFT, portfolio management, crypto education',
  authors: [{ name: 'University Blockchain Club' }],
  creator: 'University Blockchain Club',
  publisher: 'University Blockchain Club',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://blockchain-club.vercel.app'),
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-180.svg', sizes: '32x32', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/favicon-180.svg', sizes: '180x180', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.svg',
  },
  manifest: '/manifest.json',
  openGraph: {
    title: 'University Blockchain & Crypto Investing Club',
    description: 'A student-driven academic society empowering members to learn, invest, and lead in blockchain and digital assets.',
    url: 'https://blockchain-club.vercel.app',
    siteName: 'University Blockchain Club',
    images: [
      {
        url: '/abstract-blockchain-network.png',
        width: 1200,
        height: 630,
        alt: 'University Blockchain & Crypto Investing Club',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'University Blockchain & Crypto Investing Club',
    description: 'A student-driven academic society empowering members to learn, invest, and lead in blockchain and digital assets.',
    images: ['/abstract-blockchain-network.png'],
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
}

import { WagmiConfigProvider } from "@/components/providers/wagmi-provider"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

if (typeof window !== "undefined") {
  localStorage.setItem("debug", "walletconnect:*");
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <WagmiConfigProvider>
          <Navbar />
          {children}
          <Footer />
        </WagmiConfigProvider>
      </body>
    </html>
  )
}

"use client"
import { WagmiConfigProvider } from "@/components/providers/wagmi-provider"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

if (typeof window !== "undefined") {
  localStorage.setItem("debug", "walletconnect:*");
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiConfigProvider>
      <Navbar />
      {children}
      <Footer />
    </WagmiConfigProvider>
  );
}

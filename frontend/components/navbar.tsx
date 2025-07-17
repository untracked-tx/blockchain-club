"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, Building2, Zap } from "lucide-react"
import { Button } from "./ui/button"
import ConnectWalletButton from "./connect-wallet-button"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }
  
  const navLinks = [
    { name: "Gallery", href: "/gallery" },
    { name: "Governance", href: "/governance" },
    { name: "Research", href: "/research" },
    { name: "Meet The Club", href: "/meet" },
    { name: "Members", href: "/members" },
    { name: "Officers", href: "/officers" },
    { name: "Portfolio", href: "/portfolio" },
  ]

  const isActiveLink = (href: string) => {
    if (href === "/" && pathname === "/") return true
    if (href !== "/" && pathname.startsWith(href)) return true
    return false
  }

  return (
    <nav className="border-b border-[#CFB87C]/20 bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center group">
              <div className="relative rounded-lg bg-black p-2.5 mr-3 transition-all group-hover:scale-110 shadow-lg border border-[#CFB87C]/30">
                {/* University style building with CU Gold accent */}
                <div className="relative">
                  <Building2 className="h-5 w-5 text-[#CFB87C]" />
                  <Zap className="absolute -top-1 -right-1 h-3 w-3 text-[#CFB87C]" />
                </div>
              </div>
              <span className="text-xl font-bold text-[#CFB87C] whitespace-nowrap">
                Blockchain Club
              </span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-1 whitespace-nowrap overflow-x-auto">
              {navLinks.map((link) => {
                const isActive = isActiveLink(link.href)
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`
                      relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ease-in-out
                      group overflow-hidden
                      ${isActive 
                        ? 'text-[#CFB87C] bg-[#CFB87C]/10 border border-[#CFB87C]/30 shadow-md' 
                        : 'text-[#565A5C] hover:text-[#CFB87C] border border-transparent hover:border-[#CFB87C]/20'
                      }
                    `}
                  >
                    {/* Cool hover/active background effect */}
                    <div className={`
                      absolute inset-0 bg-gradient-to-r from-[#CFB87C]/5 to-[#CFB87C]/10 
                      transition-all duration-300 ease-in-out
                      ${isActive 
                        ? 'opacity-100 scale-100' 
                        : 'opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100'
                      }
                    `} />
                    
                    {/* Animated border glow */}
                    <div className={`
                      absolute inset-0 rounded-lg 
                      transition-all duration-300 ease-in-out
                      ${isActive 
                        ? 'shadow-[0_0_20px_rgba(207,184,124,0.3)] ring-1 ring-[#CFB87C]/20' 
                        : 'group-hover:shadow-[0_0_15px_rgba(207,184,124,0.2)] group-hover:ring-1 group-hover:ring-[#CFB87C]/15'
                      }
                    `} />
                    
                    {/* Text content */}
                    <span className="relative z-10 font-semibold tracking-wide">
                      {link.name}
                    </span>
                    
                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-[#CFB87C] rounded-full" />
                    )}
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="hidden md:block">
            <ConnectWalletButton />
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <Button variant="ghost" size="icon" onClick={toggleMenu} aria-label="Toggle menu" className="hover:bg-[#CFB87C]/10 text-[#565A5C] hover:text-[#CFB87C]">
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white/95 border-t border-[#CFB87C]/20 backdrop-blur-md">
          <div className="space-y-1 px-4 pb-4 pt-2">
            {navLinks.map((link) => {
              const isActive = isActiveLink(link.href)
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`
                    relative block px-3 py-3 text-base font-medium rounded-lg 
                    transition-all duration-300 ease-in-out group overflow-hidden
                    ${isActive 
                      ? 'text-[#CFB87C] bg-[#CFB87C]/10 border border-[#CFB87C]/30 shadow-md' 
                      : 'text-[#565A5C] hover:text-[#CFB87C] border border-transparent hover:border-[#CFB87C]/20'
                    }
                  `}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {/* Mobile hover/active background effect */}
                  <div className={`
                    absolute inset-0 bg-gradient-to-r from-[#CFB87C]/5 to-[#CFB87C]/10 
                    transition-all duration-300 ease-in-out
                    ${isActive 
                      ? 'opacity-100 scale-100' 
                      : 'opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100'
                    }
                  `} />
                  
                  {/* Mobile animated border glow */}
                  <div className={`
                    absolute inset-0 rounded-lg 
                    transition-all duration-300 ease-in-out
                    ${isActive 
                      ? 'shadow-[0_0_15px_rgba(207,184,124,0.2)] ring-1 ring-[#CFB87C]/20' 
                      : 'group-hover:shadow-[0_0_10px_rgba(207,184,124,0.15)] group-hover:ring-1 group-hover:ring-[#CFB87C]/15'
                    }
                  `} />
                  
                  {/* Text content */}
                  <span className="relative z-10 font-semibold tracking-wide">
                    {link.name}
                  </span>
                  
                  {/* Mobile active indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-[#CFB87C] rounded-r-full" />
                  )}
                </Link>
              )
            })}
            <div className="mt-4 px-3">
              <ConnectWalletButton />
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

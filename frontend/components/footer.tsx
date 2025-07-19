import Link from "next/link"

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">University Blockchain Club</h3>
            <p className="mt-2 text-sm text-gray-600">
              Empowering students through blockchain education, research, and community.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900">Quick Links</h3>
            <ul className="mt-2 space-y-2">
              <li>
                <Link href="/portfolio" className="text-sm text-gray-600 hover:text-blue-600">
                  Portfolio
                </Link>
              </li>
              <li>
                <Link href="/research" className="text-sm text-gray-600 hover:text-blue-600">
                  Research
                </Link>
              </li>
              <li>
                <Link href="/governance" className="text-sm text-gray-600 hover:text-blue-600">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900">Resources</h3>
            <ul className="mt-2 space-y-2">
              <li>
                <a
                  href="https://github.com/untracked-tx/blockchain-club/blob/master/docs/whitepaper.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 hover:text-blue-600"
                >
                  Whitepaper
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/untracked-tx/blockchain-club"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 hover:text-blue-600"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="https://snapshot.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 hover:text-blue-600"
                >
                  Snapshot
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900">Connect</h3>
            <div className="mt-2">
              <a
                href="mailto:liam.murphy@ucdenver.edu"
                className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200"
              >
                <svg 
                  className="w-4 h-4" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
                  />
                </svg>
                Email Us
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-8 text-center">
          <p className="text-sm text-gray-600">
            © 2025 Blockchain Club • Open source and built with ❤️ & ☕ • Released under the {" "}
            <a 
              href="https://opensource.org/licenses/MIT" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#CFB87C] hover:text-[#CFB87C]/80 transition-colors underline"
            >
              MIT License
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}

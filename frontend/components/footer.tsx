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
                <Link href="/mint" className="text-sm text-gray-600 hover:text-blue-600">
                  Mint Tokens
                </Link>
              </li>
              <li>
                <Link href="/governance" className="text-sm text-gray-600 hover:text-blue-600">
                  Governance
                </Link>
              </li>              <li>
                <Link href="/#about" className="text-sm text-gray-600 hover:text-blue-600">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900">Resources</h3>
            <ul className="mt-2 space-y-2">              <li>
                <Link href="/#about" className="text-sm text-gray-600 hover:text-blue-600">
                  Whitepaper
                </Link>
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
            <ul className="mt-2 space-y-2">
              <li>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 hover:text-blue-600"
                >
                  Twitter
                </a>
              </li>
              <li>
                <a
                  href="https://discord.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 hover:text-blue-600"
                >
                  Discord
                </a>
              </li>
              <li>
                <a
                  href="mailto:contact@universityblockchainclub.edu"
                  className="text-sm text-gray-600 hover:text-blue-600"
                >
                  Email Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-8 text-center">
          <p className="text-sm text-gray-600">
            Released under the{" "}
            <a 
              href="https://opensource.org/licenses/MIT" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#CFB87C] hover:text-[#CFB87C]/80 transition-colors underline"
            >
              MIT License
            </a>
            {" "}• Open source and built with ❤️ & ☕
          </p>
        </div>
      </div>
    </footer>
  )
}

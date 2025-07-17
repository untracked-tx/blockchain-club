# 🎓 CU Denver Blockchain Club Protocol

![Club](https://img.shields.io/badge/Blockchain%20Club-%F0%9F%92%99-blue)
![Solidity](https://img.shields.io/badge/Solidity-0.8.20-363636?style=flat&logo=solidity)
![License](https://img.shields.io/github/license/untracked-tx/blockchain-club)
![Next.js](https://img.shields.io/badge/built%20with-Next.js-000?style=flat&logo=next.js)
![Hardhat](https://img.shields.io/badge/built%20with-Hardhat-f4e04d?style=flat&logo=ethereum)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![Polygon](https://img.shields.io/badge/Polygon-8247E5?style=flat&logo=polygon&logoColor=white)
![Code Compliance](https://img.shields.io/badge/Code%20Compliance-95%25-brightgreen)

A decentralized membership and governance system for university blockchain clubs, built on Ethereum/Polygon.

## ✨ Features

- **NFT-Based Membership**: Role-based access control with soulbound governance tokens
- **Transparent Treasury**: Multi-signature treasury with time-locked transactions
- **On-Chain Governance**: Voting system with role-based voting power
- **Token Management**: Multiple membership tiers and POAP event tokens
- **Whitelist System**: Democratic member approval process

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/untracked-tx/blockchain-club
cd blockchain-club

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Add your private keys and RPC URLs

# Compile contracts
npx hardhat compile

# Deploy to testnet
npx hardhat run scripts/deployAll.ts --network amoy
```

## 📚 Documentation

- **[Technical Docs](./docs/README.md)** - Complete documentation
- **[Whitepaper](./docs/whitepaper.md)** - System overview and specifications
- **[Security](./docs/security.md)** - Security architecture and audits
- **[Contributing](./docs/CONTRIBUTING.MD)** - How to contribute

## 🏗️ Architecture

- **Smart Contracts**: Upgradeable proxy pattern with role-based access
- **Frontend**: Next.js with Web3 integration
- **Treasury**: Multi-sig with 24-hour time locks
- **Governance**: On-chain voting with role-based power

## 🤝 Contributing

We welcome contributions! This project started as a solo effort by [Liam Murphy](mailto:Liam.Murphy@ucdenver.edu) but is open to community involvement.

- See our [Contributing Guide](./docs/CONTRIBUTING.MD)
- Check out the [Humans behind the code](./docs/HUMANS.md)
- Join our weekly meetings (Thursdays 6pm)

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙋‍♂️ Contact

- **Project Lead**: Liam Murphy
- **Email**: Liam.Murphy@ucdenver.edu
- **GitHub**: [@untracked-tx](https://github.com/untracked-tx)

---

*Built with ❤️ for the University of Colorado Denver Blockchain Club*

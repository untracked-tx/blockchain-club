# Contributing to CU Denver Blockchain Club Protocol

First off, thank you for considering contributing! This project started as a solo effort by Liam Murphy but welcomes community involvement.

## 🎯 Project Vision

This protocol aims to provide transparent, on-chain governance for university blockchain clubs. Contributions should align with this educational mission.

## Documentation Style Guide

### Headers
- H1 (#): Document title only
- H2 (##): Major sections
- H3 (###): Subsections
- H4 (####): Rarely used

### Voice
- Professional but accessible
- Active voice preferred
- Present tense for current features
- Future tense for roadmap items

### Code Examples
Always include language identifier:
\```solidity
\```typescript
\```bash

### Emojis
Use sparingly for navigation:
- 🚀 Getting started
- 📚 Documentation
- 🔐 Security
- ⚡ Performance


## 🤝 How to Contribute

### For CU Denver Students
- Join our Discord: [link coming soon]
- Attend weekly meetings: Thursdays 6pm
- Request whitelist access through the dApp

### For External Contributors

1. **Report Bugs**
   - Use GitHub Issues
   - Include: contract version, network, transaction hash
   - Tag as `bug`

2. **Suggest Features**
   - Open a discussion first (not an issue)
   - Explain the use case
   - Consider gas costs

3. **Submit PRs**
   - Fork the repo
   - Create feature branch: `git checkout -b feature/amazing-feature`
   - Test thoroughly: `npm test`
   - Commit with clear messages
   - Push and create PR

## 🧪 Development Setup

```bash
# Clone repo
git clone https://github.com/untracked-tx/blockchain-club
cd blockchain-club

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Add your keys

# Compile contracts
npx hardhat compile

# Run tests
npm test

# Deploy locally
npx hardhat run scripts/deployAll.ts --network localhost
## 📋 Code Standards

- **Solidity**: Follow [Solidity Style Guide](https://docs.soliditylang.org/en/latest/style-guide.html)
- **TypeScript**: Prettier + ESLint config included
- **Comments**: NatSpec for all public functions
- **Tests**: Aim for >95% coverage

## 🔍 Pull Request Process

1. Update README.md with any new env variables
2. Add tests for new features
3. Update documentation
4. Ensure all tests pass
5. Request review from @liammurphy (project lead)

## 📚 Learning Resources

New to blockchain development? Start here:

- [Ethereum.org tutorials](https://ethereum.org/en/developers/tutorials/)
- [OpenZeppelin docs](https://docs.openzeppelin.com/)
- Our [technical docs](./README.md)

## 🎖️ Recognition

Contributors will be:

- Listed in [HUMANS.md](../HUMANS.md)
- Credited in release notes
- Eligible for club membership NFTs
- Invited to present at club meetings

## 💬 Questions?

- **Technical**: Open a GitHub discussion
- **Direct**: Liam.Murphy@ucdenver.edu




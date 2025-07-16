# System Diagrams

This document contains all architectural and flow diagrams for the UCD Blockchain Club Protocol.

## Table of Contents
1. [System Architecture](#system-architecture)
2. [User Journey](#user-journey)
3. [Treasury Flow](#treasury-flow)
4. [Role Hierarchy](#role-hierarchy)
5. [Token Type Mapping](#token-type-mapping)
6. [Gas Analysis](#gas-analysis)
7. [State Machines](#state-machines)

---

## System Architecture

### Complete System Overview

```mermaid
graph TB
    subgraph "User Layer"
        U1[Students/Members]
        U2[Officers]
        U3[Alumni]
    end

    subgraph "Frontend dApp"
        W1[Next.js Interface]
        W2[RainbowKit Wallet]
        W3[Member Dashboard]
    end

    subgraph "Smart Contract Layer"
        SC1[BlockchainClubMembership.sol<br/>ERC-721 Soulbound NFTs]
        SC2[Roles.sol<br/>Access Control Hub]
        SC3[TreasuryRouter.sol<br/>24h Time-Lock Escrow]
        
        SC1 -->|reads roles| SC2
        SC3 -->|checks permissions| SC2
        SC1 -->|auto-assigns roles| SC2
    end

    subgraph "Governance Layer"
        G1[Snapshot Voting]
        G2[Proposal System]
        G3[Token-Weighted Polls]
    end

    subgraph "External Integrations"
        E1[Polygon Network]
        E2[IPFS Metadata]
        E3[Gnosis Safe]
        E4[ENS Domains]
    end

    U1 --> W1
    U2 --> W1
    U3 --> W1
    
    W1 --> SC1
    W1 --> SC3
    W3 --> SC2
    
    SC1 --> G1
    SC2 --> G1
    
    SC1 --> E2
    SC3 --> E3
    SC1 --> E1
    
    style SC1 fill:#e1f5fe
    style SC2 fill:#fff3e0
    style SC3 fill:#f3e5f5
    style G1 fill:#e8f5e9
```

### Simplified Architecture (README Version)

```mermaid
graph TB
    subgraph "Frontend"
        A[Web Interface]
    end
    
    subgraph "Smart Contracts"
        B[Membership NFTs]
        C[Access Control]
        D[Treasury Router]
    end
    
    subgraph "External"
        E[Polygon Network]
        F[Snapshot Voting]
    end
    
    A --> B
    B --> C
    D --> C
    B --> F
    
    style B fill:#e1f5fe
    style C fill:#fff3e0
    style D fill:#f3e5f5
```

---

## User Journey

### Member Onboarding Journey

```mermaid
journey
    title Member Onboarding Journey
    section Discovery
      Find Club Website: 5: Student
      Read About Benefits: 4: Student
    section Application
      Request Whitelist: 3: Student
      Wait for Approval: 2: Student
      Get Approved: 5: Student, Officer
    section Activation
      Connect Wallet: 3: Student
      Mint Membership NFT: 4: Student
      Access Dashboard: 5: Student
    section Participation
      Vote on Proposals: 5: Student
      Attend Meetings: 5: Student
      Earn Achievements: 5: Student
```

---

## Treasury Flow

### Treasury Transaction Flow

```mermaid
sequenceDiagram
    participant User
    participant TreasuryRouter
    participant Roles
    participant Treasury
    
    User->>TreasuryRouter: Deposit Funds
    TreasuryRouter->>TreasuryRouter: Start 24h Timer
    Note over TreasuryRouter: Funds Locked for 24 hours
    
    User->>TreasuryRouter: Request Execution (after 24h)
    TreasuryRouter->>Roles: Check Permissions
    Roles-->>TreasuryRouter: Permission Granted
    TreasuryRouter->>Treasury: Transfer Funds
    Treasury-->>User: Confirmation
```

---

## Role Hierarchy

### Access Control Structure

```mermaid
graph TD
    A[ADMIN_ROLE]
    B[OFFICER_ROLE]
    C[MEMBER_ROLE]
    
    A -->|manages| B
    A -->|manages| C
    B -->|operates| C
    
    A -.->|Can: Upgrade Contracts<br/>Set Voting Power<br/>Emergency Controls| A1[Admin Powers]
    B -.->|Can: Mint Tokens<br/>Process Whitelist<br/>Create Token Types| B1[Officer Powers]
    C -.->|Can: Vote<br/>Hold NFTs<br/>Make Proposals| C1[Member Powers]
    
    style A fill:#ff6b6b
    style B fill:#4ecdc4
    style C fill:#45b7d1
```

---

## Token Type Mapping

### NFT Token Types to Smart Contract Roles

```mermaid
graph LR
    subgraph "Smart Contract Roles"
        SCR1[MEMBER_ROLE]
        SCR2[OFFICER_ROLE]
    end
    
    subgraph "NFT Token Types"
        T1[President]
        T2[Vice President]
        T3[Treasurer]
        T4[Trader]
        T5[Rhodes Scholar]
        T6[The Graduate]
    end
    
    T1 -->|maps to| SCR2
    T2 -->|maps to| SCR2
    T3 -->|maps to| SCR2
    T4 -->|maps to| SCR1
    T5 -->|maps to| SCR1
    T6 -->|maps to| SCR1
    
    style T1 fill:#ffd93d
    style T2 fill:#ffd93d
    style T3 fill:#ffd93d
    style T4 fill:#a8e6cf
    style T5 fill:#a8e6cf
    style T6 fill:#a8e6cf
```

---

## Gas Analysis

### Contract Deployment Costs

```mermaid
pie title Contract Deployment Costs (in thousands of gas)
    "BlockchainClubMembership" : 2277
    "TreasuryRouter" : 1453
    "Roles" : 671
    "Other Operations" : 599
```

---

## State Machines

### Whitelist Request State Machine

```mermaid
stateDiagram-v2
    [*] --> NotWhitelisted
    NotWhitelisted --> RequestSubmitted: requestWhitelist()
    RequestSubmitted --> UnderReview: 24h cooldown
    UnderReview --> Approved: Officer approves
    UnderReview --> Rejected: Officer rejects
    Approved --> Whitelisted: Added to whitelist
    Rejected --> NotWhitelisted: Can retry after cooldown
    Whitelisted --> [*]
```

### NFT Lifecycle State Machine

```mermaid
stateDiagram-v2
    [*] --> NotMinted
    NotMinted --> Minting: mint()
    Minting --> Active: Success
    Active --> Paused: Contract paused
    Paused --> Active: Contract unpaused
    Active --> Burned: burn() [if allowed]
    Burned --> [*]
    
    note right of Active
        Soulbound: Cannot transfer
        Can update metadata
        Can change roles
    end note
```

---

## Integration Flow

### External Service Integration

```mermaid
graph LR
    subgraph "Blockchain Club Protocol"
        BC[Smart Contracts]
        FE[Frontend dApp]
    end
    
    subgraph "External Services"
        IPFS[IPFS Network]
        Polygon[Polygon Network]
        Snapshot[Snapshot Voting]
        Gnosis[Gnosis Safe]
        ENS[ENS Domains]
    end
    
    BC --> IPFS
    BC --> Polygon
    FE --> Snapshot
    BC --> Gnosis
    FE --> ENS
    
    style BC fill:#e1f5fe
    style FE fill:#fff3e0
```

---

*These diagrams provide comprehensive visual documentation of the UCD Blockchain Club Protocol architecture and workflows.*

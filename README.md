# Coordinals Open Source Project

This project implements a Bitcoin Layer 2 solution for minting and managing tokens and NFTs using Coordinals protocol. It's built with Next.js and integrates with Anduro wallet.

## Features

- **Anduro Wallet Integration**: Seamlessly interact with the Anduro wallet for transaction management.
- **Coordinals Indexer Implementation**: Utilize key functionalities of the Coordinals protocol: - getBlockCount - getBlockHash - getTransactionHex - getUtxos - sendTransactionToRpc [View example implementations here](https://github.com/numadlabs/coordinals-opensource/blob/main/src/utils/libs.ts)
- **Token/NFT Minting**: Support for three types of assets: 1. Collectible: Single NFT minting 2. Collection: Multiple NFTs with the same ticker 3. Token: Fungible token creation

## Getting Started

### Prerequisites

- Node.js (version 20 or higher)
- npm or yarn
- [An Anduro wallet](https://chromewebstore.google.com/detail/anduro-wallet/khebhoaoppjeidmdkpdglmlhghnooijn?hl=en-US)

### Installation

1. Clone the repository:
   git clone [https://github.com/numadlabs/coordinals-opensource.git](https://github.com/your-repo/coordinals-opensource.git)

2. Install dependencies:
   cd coordinals-opensource
   npm install

### Configuration

Create a `.env.local` file in the root directory and add the following:

    NEXT_PUBLIC_MOCK_MENOMIC="your-anduro-wallet-seed-phrase"

Note: These are used to simulate the minting process. In future updates, we plan to implement direct transaction signing with Anduro wallet.
You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

### Running the Development Server

```
 npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application

### Contributing

We welcome contributions! Please see our [Contribution Guidelines](CONTRIBUTING.md) for details on how to get started.

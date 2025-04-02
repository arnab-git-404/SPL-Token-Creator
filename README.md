# Solana Token Creator - README

## Overview
Solana Token Creator is a web application that allows users to easily create, mint, and manage tokens on the Solana blockchain. This dApp provides an intuitive interface for interacting with Solana's token program without requiring deep technical knowledge of blockchain development.

## Features
- **Wallet Integration**: Connect with various Solana wallets
- **Create Token**: Mint your own custom SPL tokens with configurable parameters
- **Mint Tokens**: Add supply to existing tokens you own
- **Send Tokens**: Transfer tokens to other Solana wallets
- **Transaction History**: View your past transactions
- **Responsive Design**: Works on both desktop and mobile devices

## Tech Stack
- **Frontend**: React.js with Tailwind CSS
- **Blockchain Integration**: Solana Web3.js and SPL-Token libraries
- **Wallet Connection**: Solana Wallet Adapter
- **Notifications**: React-Toastify
- **Icons**: React-Icons
- **Responsive Design**: React-Responsive

## Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- A Solana wallet (Phantom, Solflare, etc.)
- Some SOL tokens for transaction fees (use devnet faucet for testing)

## Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/arnab-git-404/SPL-Token-Creator.git
   cd solana-token-creator
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure environment variables**
   Create a `.env` file in the root directory and add:
   ```
   REACT_APP_SOLANA_NETWORK=devnet  # Use 'mainnet-beta' for production
   ```

4. **Start the development server**
   ```bash
   npm start
   # or
   yarn start
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## Usage Guide

### Connecting Your Wallet
1. Click on the wallet button in the top-right corner
2. Select your preferred wallet provider
3. Approve the connection request in your wallet

### Creating a Token
1. Navigate to the "Create Token" page
2. Fill in the token details:
   - **Token Name**: The full name of your token (e.g., "My Awesome Token")
   - **Token Symbol**: A short identifier for your token (e.g., "MAT")
   - **Decimals**: Number of decimal places (0-9, with 9 being standard for most tokens)
3. Click "Create Token"
4. Approve the transaction in your wallet
5. Wait for confirmation (this may take a few moments)

### Minting Tokens
1. Navigate to the "Mint Token" page
2. Select the token you want to mint more of
3. Enter the amount to mint
4. Click "Mint" and approve the transaction

### Sending Tokens
1. Navigate to the "Send Token" page
2. Select the token you want to send
3. Enter the recipient's Solana wallet address
4. Specify the amount to send
5. Click "Send" and approve the transaction

### Viewing Transactions
1. Navigate to the "Transactions" page
2. View your transaction history with status updates

## Project Structure

```
solana-app/
├── public/
├── src/
│   ├── components/
│   │   ├── Layout/
│   │   │   └── Header.jsx       # Navigation and wallet connection
│   │   ├── Token/
│   │   │   └── CreateTokenForm.jsx  # Token creation functionality
│   │   ├── UI/                  # Reusable UI components
│   │   └── Wallet/              # Wallet connection components
│   ├── pages/                   # Route pages
│   ├── utils/                   # Helper functions
│   ├── App.js                   # Main app component
│   └── index.js                 # Entry point
└── package.json                 # Dependencies
```

## Development Notes

### Solana Token Creation Process
1. Generate a new keypair for the token mint
2. Create a system account for the mint
3. Initialize the mint with the desired decimals
4. Set the mint authority (defaults to your wallet)
5. Create an Associated Token Account (ATA) for your wallet
6. Transaction confirmation and metadata storage

### Error Handling
The application includes comprehensive error handling for:
- Wallet connection issues
- Insufficient SOL balance
- Failed transactions
- Network issues

## Security Considerations
- The app never stores your private keys
- All transactions require explicit approval in your wallet
- Always verify transaction details before signing
- Use devnet for testing before moving to mainnet

## Troubleshooting

### Common Issues
- **Transaction Failed**: Check your SOL balance for transaction fees
- **Wallet Connection Error**: Try refreshing the page or reconnecting your wallet
- **Token Not Showing**: Some wallets require manual token imports

## Future Enhancements
- Token metadata support (images, descriptions)
- Token burning functionality
- Token swap integration
- Advanced token configurations (freezing, minting limits)
---

*Note: This project is for educational purposes. Always conduct proper testing before using on mainnet with real funds.*

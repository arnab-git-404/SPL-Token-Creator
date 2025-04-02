import React from 'react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';

const WalletConnectButton = () => {
  const { setVisible } = useWalletModal();
  const { wallet } = useWallet();

  const handleClick = () => {
    setVisible(true);
  };

  return (
    <button 
      onClick={handleClick} 
      className="btn-primary flex items-center"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm1 2a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
      </svg>
      Connect Wallet
    </button>
  );
};

export default WalletConnectButton;
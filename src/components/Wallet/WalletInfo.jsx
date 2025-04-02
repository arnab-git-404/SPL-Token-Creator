import React, { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';



const WalletInfo = () => {
  const { publicKey, disconnect } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!publicKey) return;
      try {
        setLoading(true);
        const bal = await connection.getBalance(publicKey);
        setBalance(bal / LAMPORTS_PER_SOL);
      } catch (error) {
        console.error('Error fetching balance:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
    const id = setInterval(fetchBalance, 10000); // Refresh every 10 seconds

    return () => clearInterval(id);
  }, [publicKey, connection]);

  const formatAddress = (address) => {
    return `${address.toString().slice(0, 4)}...${address.toString().slice(-4)}`;
  };

  return (
    <div className="flex items-center space-x-4">
      
{ publicKey ?  
      <> <div className=" px-4 py-2 rounded-md flex items-center">
        <div>
          <p className="text-sm text-gray-300 hover:text-white">Wallet</p>
          <p className="font-medium">{publicKey ? formatAddress(publicKey) : 'Not connected'}</p>
        </div>
      </div>
      

      <div className=" px-4 py-2 rounded-md">
        <p className="text-sm text-gray-300 hover:text-white">Balance</p>
        <p className="font-medium">
          {loading ? 'Loading...' : `${balance.toFixed(4)} SOL`}
        </p>
      </div>
       </> : <></> }
      <WalletMultiButton 
          className={`
            !bg-gradient-to-r !from-indigo-600 !to-indigo-500 !transition-all
            !rounded-lg !border-0 !h-auto 
            md:!py-2 md:!px-4 
            !py-1.5 !px-2 !text-sm md:!text-base
            hover:!shadow-md hover:!from-indigo-700 hover:!to-indigo-600
            flex items-center
          `}
        >


          <span className='hidden md:inline' >
            {publicKey ? "Connected" : "Connect Wallet"}
          </span>

          <span className='md:hidden'>
            {publicKey ? "Connected" : "Connect"}
          </span>


        
        </WalletMultiButton>


    </div>
  );
};

export default WalletInfo;





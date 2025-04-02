import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiSend, FiCopy, FiCheckCircle, FiArrowLeft, FiDollarSign, FiExternalLink } from 'react-icons/fi';
import MintTokenForm from '../components/Token/MintTokenForm';
import Card from '../components/UI/Card';
import Notification from '../components/UI/Notification';
import useNotification from '../hooks/useNotification';
import WalletConnectButton from '../components/Wallet/WalletConnectButton';
import { useTokenContext } from '../context/TokenContext';

const MintToken = () => {
  const { connected } = useWallet();
  const { tokenData } = useTokenContext();
  const [mintedToken, setMintedToken] = useState(null);
  const [copiedField, setCopiedField] = useState(null);
  
  const { 
    notification, 
    hideNotification, 
    notifySuccess, 
    notifyError 
  } = useNotification();

  const handleMintSuccess = (mintResult) => {
    setMintedToken(mintResult);
    notifySuccess('Token minted successfully!');
  };

  const handleCopy = (text, fieldName) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopiedField(fieldName);
        toast.success(`${fieldName} copied to clipboard!`);
        setTimeout(() => setCopiedField(null), 2000);
      })
      .catch(err => {
        toast.error(`Failed to copy: ${err.message}`);
      });
  };

  const openExplorer = (signature) => {
    const explorerUrl = `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
    window.open(explorerUrl, '_blank');
  };

  const handleMintMore = () => {
    setMintedToken(null);
  };

  return (
    <div className="max-w-3xl mx-auto">

      {/* <h1 className="text-3xl font-bold mb-6 flex items-center">
        <FiDollarSign className="mr-2 text-indigo-600" /> 
        Mint Tokens
      </h1> */}
      
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          autoClose={notification.autoClose}
          onClose={hideNotification}
        />
      )}

      {/* <div className="mb-4">
        <Link 
          to="/create-token" 
          className="inline-flex items-center text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          <FiArrowLeft className="mr-1" /> Back to Token Creation
        </Link>
      </div> */}
      
      {!connected ? (
        <Card className="mb-6 transition-all hover:shadow-lg">
          <div className="flex flex-col items-center space-y-6 py-8">
            <h2 className="text-2xl font-bold text-indigo-700">Connect Your Wallet</h2>
            <p className="text-gray-600 text-center max-w-md">
              Connect your Solana wallet to mint tokens on the Solana blockchain.
            </p>
            <WalletConnectButton />
          </div>
        </Card>
      ) : mintedToken ? (
        <Card className="mb-6 transition-all hover:shadow-lg border-t-4 border-green-500">
          <h2 className="text-xl font-bold mb-4 text-green-700 flex items-center">
            <FiCheckCircle className="mr-2" /> Tokens Minted Successfully!
          </h2>
          
          <div className="bg-green-50 p-5 rounded-md mb-6 border border-green-200">
            <h3 className="font-medium text-green-800 mb-3 border-b pb-2 border-green-200">Transaction Details:</h3>
            <div className="grid grid-cols-1 gap-3">
              <div className="p-2 hover:bg-green-100 rounded-md transition-colors">
                <span className="font-medium text-gray-700">Amount: {mintedToken.amount} </span> 
              </div>
              
              {mintedToken.recipient && (
                <div className="p-2 hover:bg-green-100 rounded-md transition-colors">
                  <span className="font-medium text-gray-700">Recipient: </span>
                  <span className="break-all text-indigo-700 font-mono text-sm">
                    {mintedToken.recipient}
                  </span>
                </div>
              )}
              
              <div className="p-2 hover:bg-green-100 rounded-md flex flex-col sm:flex-row sm:items-center gap-2 transition-colors">
                <div className="font-medium text-gray-700">Transaction:</div>
                <div className="flex items-center flex-1">
                  <span className="break-all mr-2 text-indigo-700 font-mono text-sm">
                    {mintedToken.signature}
                  </span>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => handleCopy(mintedToken.signature, 'Transaction ID')}
                      className="text-gray-500 hover:cursor-pointer hover:text-indigo-600 transition-colors focus:outline-none"
                      title="Copy to clipboard"
                    >
                      {copiedField === 'Transaction ID' ? 
                        <FiCheckCircle className="text-green-600" /> : 
                        <FiCopy />
                      }
                    </button>
                    <button 
                      onClick={() => openExplorer(mintedToken.signature)}
                      className="text-gray-500 hover:cursor-pointer hover:text-indigo-600 transition-colors focus:outline-none"
                      title="View on Explorer"
                    >
                      <FiExternalLink />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-md mb-6 border border-blue-200">
            <p className="text-gray-700">
              Your tokens have been minted on the Solana Devnet. You can mint more tokens or transfer them to other addresses.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            <button 
              onClick={handleMintMore} 
              className="h-12 px-4 rounded-md hover:cursor-pointer flex items-center justify-center bg-white text-indigo-600 border-2 border-indigo-600 hover:bg-indigo-50 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <FiDollarSign className="mr-2" /> Mint More Tokens
            </button>
            
            <Link to="/send-token" className="w-full sm:w-auto">
              <button className="h-12 w-full px-4 rounded-md flex items-center justify-center hover:cursor-pointer bg-indigo-600 text-white hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                <FiSend className="mr-2" /> Transfer Tokens
              </button>
            </Link>
          </div>
        </Card>
      ) : (
        <MintTokenForm 
          onSuccess={handleMintSuccess} 
          initialTokenMint={tokenData?.address} 
        />
      )}
    </div>
  );
};

export default MintToken;
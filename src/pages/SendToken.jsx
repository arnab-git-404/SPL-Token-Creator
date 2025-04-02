// Final 
import React, { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PublicKey } from '@solana/web3.js';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SendTokenForm from '../components/Token/SendTokenForm';
import Card from '../components/UI/Card';
import Loader from '../components/UI/Loader';

const SendToken = () => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [solBalance, setSolBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [transactionHistory, setTransactionHistory] = useState([]);
  
  // Fetch SOL balance
  useEffect(() => {
    const fetchSolBalance = async () => {
      if (!publicKey) {
        setSolBalance(0);
        return;
      }
      
      try {
        const balance = await connection.getBalance(publicKey);
        setSolBalance(balance / 1000000000); // Convert lamports to SOL
      } catch (error) {
        console.error('Error fetching SOL balance:', error);
      }
    };

    fetchSolBalance();
    const intervalId = setInterval(fetchSolBalance, 30000); // Update every 30 seconds
    
    return () => clearInterval(intervalId);
  }, [publicKey, connection]);

  const handleTransactionSuccess = (result) => {
    const { signature, amount, recipient } = result;
    
    // Add to transaction history
    setTransactionHistory(prev => [
      {
        type: 'Token Transfer',
        signature,
        timestamp: new Date(),
        amount,
        recipient,
        status: 'confirmed'
      },
      ...prev
    ]);
    
    toast.success('Token transfer successful!');
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header Section with improved visibility */}



      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form Section */}
        <div className="lg:col-span-2">
          <SendTokenForm onSuccess={handleTransactionSuccess} />
        </div>
        
        {/* Transaction History Section - Improved readability */}
        <div className="lg:col-span-1">
          <Card title="Recent Transactions">
            {transactionHistory.length === 0 ? (
              <div className="text-center py-10 text-gray-800">
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <p className="font-medium">No recent transactions</p>
                <p className="text-sm mt-1">Transfers will appear here</p>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                {transactionHistory.map((tx, index) => (
                  <div key={index} className="mb-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-800">{tx.type}</span>
                      <span className={`px-3 py-1 rounded-full font-medium ${
                        tx.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                        tx.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {tx.status}
                      </span>
                    </div>
                    
                    <div className="mt-3 pb-2 border-b border-gray-100">
                      <div className="flex justify-between">
                        <div className="text-gray-600">Date:</div>
                        <div className="font-medium text-gray-900">{formatTimestamp(tx.timestamp)}</div>
                      </div>
                    </div>
                    
                    <div className="mt-3 pb-2 border-b border-gray-100">
                      <div className="flex justify-between items-center">
                        <div className="text-gray-600">Amount:</div>
                        <div className="font-semibold text-gray-900">{tx.amount}</div>
                      </div>
                    </div>
                    
                    <div className="mt-3 pb-2 border-b border-gray-100">
                      <div className="flex justify-between">
                        <div className="text-gray-600">To:</div>
                        <div className="font-medium text-gray-900" title={tx.recipient}>
                          {formatAddress(tx.recipient)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3 text-center">
                      <a 
                        href={`https://explorer.solana.com/tx/${tx.signature}?cluster=devnet`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className=" hover:cursor-pointer inline-flex items-center text-purple-600 hover:text-purple-800 font-medium"
                      >
                        View on Explorer
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                        </svg>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Tips Section - Improved readability */}
          <div className="mt-6">
            <Card title="Tips">
              <ul className="space-y-3 text-gray-800">

                <li className="flex items-start">
                  <svg className="w-15 h-15 text-purple-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span>Double-check recipient addresses before sending</span>
                </li>
                
                <li className="flex items-start">
                  <svg className="w-15 h-15 text-purple-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span>Make sure you have enough SOL for transaction fees</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-15 h-15 text-purple-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span>Some tokens may require the recipient to have an associated token account</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-15 h-15 text-purple-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"></path>
                  </svg>
                  <span>Click on your tokens below the form to auto-fill the token address</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
      
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default SendToken;
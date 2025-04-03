import React, { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FiTrash2, FiCheckCircle, FiExternalLink, FiArrowLeft } from "react-icons/fi";
import Card from "../components/UI/Card";
import Button from "../components/UI/Button";
import Notification from "../components/UI/Notification";
import useNotification from "../hooks/useNotification";
import WalletConnectButton from "../components/Wallet/WalletConnectButton";
import { useTokenContext } from "../context/TokenContext";
import BurnTokenForm from "../components/Token/BurnTokenForm";




const BurnToken = () => {

  const { tokenData } = useTokenContext();
  const { publicKey, connected } = useWallet();
  const { notification, hideNotification, notifySuccess, notifyError } = useNotification();

  const [burnedToken, setBurnedToken] = useState(null);
  const [selectedToken, setSelectedToken] = useState(null);

  // Pre-select token if coming from token context
  useEffect(() => {
    if (tokenData) {
      setSelectedToken(tokenData);
    }
  }, [tokenData]);

  const handleTokenBurned = (burnData) => {
    setBurnedToken(burnData);
    notifySuccess("Tokens burned successfully!");
  };

  const handleBurnMore = () => {
    setBurnedToken(null);
  };

  const openExplorer = (txId) => {
    const explorerUrl = `https://explorer.solana.com/tx/${txId}?cluster=devnet`;
    window.open(explorerUrl, "_blank");
  };

  return (
    <div className="max-w-3xl mx-auto">

      
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          autoClose={notification.autoClose}
          onClose={hideNotification}
        />
      )}

      {!connected ? (
        <Card className="mb-6 transition-all hover:shadow-lg">
          <div className="flex flex-col items-center space-y-6 py-8">
            <h2 className="text-2xl font-bold text-indigo-700">
              Connect Your Wallet
            </h2>
            <p className="text-gray-600 text-center max-w-md">
              Connect your Solana wallet to burn tokens on the Solana
              blockchain.
            </p>
            <WalletConnectButton />
          </div>
        </Card>
      ) : burnedToken ? (
        <Card className="mb-6 transition-all hover:shadow-lg border-t-4 border-red-500">
          <h2 className="text-xl font-bold mb-4 text-red-700 flex items-center">
            <FiCheckCircle className="mr-2" /> Tokens Burned Successfully!
          </h2>

          <div className="bg-red-50 p-5 rounded-md mb-6 border border-red-200">
            
            <h3 className="font-medium text-red-800 mb-3 border-b pb-2 border-red-200">
              Burn Details:
            </h3>

            <div className="grid grid-cols-1 gap-3">
              <div className="p-2 hover:bg-red-100 rounded-md transition-colors">

                <span className="font-medium text-gray-700">  
                  Token: {burnedToken.tokenName}  ({burnedToken.tokenSymbol} )
                </span>
              
              </div>
              <div className="p-2 hover:bg-red-100 rounded-md transition-colors">
                <span className="font-medium text-gray-700">
                  Amount Burned: {burnedToken.amount}
                </span>
              </div>
              <div className="p-2 hover:bg-red-100 rounded-md flex flex-col sm:flex-row sm:items-center gap-2 transition-colors">
                <div className="font-medium text-gray-700">Transaction ID:</div>
                <div className="flex items-center flex-1">
                  
                  <span className="break-all mr-2 text-indigo-700 font-mono text-sm">
                    {burnedToken.signature}
                  </span>

                  <button
                    onClick={() => openExplorer(burnedToken.signature)}
                    className="text-gray-500 hover:cursor-pointer hover:text-indigo-600 transition-colors focus:outline-none"
                    title="View on Explorer"
                  >
                    <FiExternalLink />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-md mb-6 border border-blue-200">
            <p className="text-gray-700">
              The tokens have been permanently removed from circulation. This action cannot be undone.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            <button
              onClick={handleBurnMore}
              className="h-12 px-4 rounded-md hover:cursor-pointer flex items-center justify-center bg-white text-indigo-600 border-2 border-indigo-600 hover:bg-indigo-50 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <FiTrash2 className="mr-2" /> Burn More Tokens
            </button>


            <Link to="/home" className="w-full sm:w-auto">
              <button className="h-12 w-full px-4 rounded-md flex items-center justify-center hover:cursor-pointer bg-indigo-600 text-white hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                <FiArrowLeft className="mr-2" /> Back to Home
              </button>
            </Link>
          </div>
        </Card>
      ) : (
        <BurnTokenForm 
          onSuccess={handleTokenBurned}
          selectedToken={selectedToken}
        />
      )}
    </div>
  );
};

export default BurnToken;



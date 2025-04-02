import React, { useState, useEffect } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { Link } from "react-router-dom";
import { requestAirdrop } from "../utils/solana";
import Card from "../components/UI/Card";
import Button from "../components/UI/Button";
import WalletConnectButton from "../components/Wallet/WalletConnectButton";
import Notification from "../components/UI/Notification";
import useNotification from "../hooks/useNotification";
import WalletInfo from "../components/Wallet/WalletInfo";


const Home = () => {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const { notification, hideNotification, notifySuccess, notifyError } =
    useNotification();
  const [isAirdropping, setIsAirdropping] = useState(false);

  const handleAirdrop = async () => {
    if (!publicKey) return;

    try {
      setIsAirdropping(true);
      const result = await requestAirdrop(publicKey);



      if (result.success) {
        notifySuccess(
          "Airdrop successful! 1 SOL has been added to your wallet."
        );
      } else {

        if(result.error){
          notifyError(`Airdrop failed: try again later. `);
        }

        // notifyError(`Airdrop failed: ${result.error}`);
      }



    } catch (error) {
      console.error("Error during airdrop:", error);

      if (error.message) {
        notifyError(`Airdrop failed: You've either reached your airdrop limit today.`);
      }
      



    } finally {
      setIsAirdropping(false);
    }
  };




  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-5xl font-bold mb-8 text-center">
        Solana Token Creator
      </h1>

      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          autoClose={notification.autoClose}
          onClose={hideNotification}
        />
      )}

      {!connected ? (
        <div className="text-center">
          <Card className="mb-6">
            <div className="flex flex-col items-center space-y-6 py-8">
              <h2 className="text-2xl font-bold text-gray-800">Connect Your Wallet</h2>
              <p className="text-black font-medium ">
                Connect your Solana wallet to create, mint, and send tokens on
                the Solana blockchain.
              </p>
              <WalletInfo />
            </div>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6  ">

          <Card className="flex flex-col h-full">

            <h2 className="text-xl text-gray-800 font-bold mb-4">Create Tokens</h2>

            <p className="text-gray-600 mb-6">
              Create your own custom tokens on the Solana blockchain. Define the
              name, symbol, and decimals.
            </p>
            <div className="mt-auto">
              <Link to="/create-token">
                <button className="h-12 w-full hover:cursor-pointer bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-indigo-500">
                  Create Token
                </button>
              </Link>
            </div>
          </Card>

          <Card className="flex flex-col h-full">
            <h2 className="text-xl font-bold mb-4 text-gray-800 ">Mint Tokens</h2>
            <p className="text-gray-600 mb-6">
              Mint new tokens to any wallet. Add supply to your existing tokens.
            </p>
            <div className="mt-auto">
              <Link to="/mint-token">
                <button className="h-12 w-full hover:cursor-pointer bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-indigo-500">
                  Mint Tokens
                </button>
              </Link>
            </div>
          </Card>

          <Card className="flex flex-col h-full">
            <h2 className="text-xl font-bold mb-4 text-gray-800 ">Send Tokens</h2>
            <p className="text-gray-600 mb-6">
              Transfer your tokens to other wallets. Send tokens to friends or
              customers.
            </p>
            <div className="mt-auto">
              <Link to="/send-token">
                <button className="h-12 w-full hover:cursor-pointer bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-indigo-500">
                  Send Tokens
                </button>
              </Link>
            </div>
          </Card>

          <Card className="flex flex-col h-full">
            <h2 className="text-xl font-bold mb-4 text-gray-800 ">Transaction History</h2>
            <p className="text-gray-600 mb-6">
              View your transaction history. See all your token creations,
              mints, and transfers.
            </p>
            <div className="mt-auto">
              <Link to="/transactions">
                <button className="h-12 w-full hover:cursor-pointer bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-indigo-500">
                  View History
                </button>
              </Link>
            </div>
          </Card>

          <Card className="md:col-span-2">
            <h2 className="text-xl font-bold mb-4 text-gray-800 ">Need SOL for Testing?</h2>
            <p className="text-gray-600 mb-4">
              Get SOL tokens on the Solana Devnet for testing purposes. This
              will add 1 SOL to your wallet.
            </p>

            <button
              onClick={handleAirdrop}
              className="h-12 w-full hover:cursor-pointer bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-indigo-500"
            >
              {isAirdropping ? "Processing..." : " Request Airdrop"}
            </button>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Home;

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

import {
  FiHome,
  FiTrendingUp,
  FiClock,
  FiGift,
  FiTrash2,
  FiPlus,
  FiRepeat,
  FiInfo,
  FiArrowRight,
  FiBox,
  FiHelpCircle,
  FiChevronDown,
  FiChevronUp,
  FiSend,
  FiDatabase,
} from "react-icons/fi";
import {
  BsCoin,
  BsLightningCharge,
  BsShieldCheck,
  BsStars,
  BsCashCoin,
} from "react-icons/bs";
import { AiOutlineFire, AiOutlineSwap } from "react-icons/ai";
import { IoWalletOutline, IoPeopleOutline } from "react-icons/io5";

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
        if (result.error) {
          notifyError(`Airdrop failed: try again later. `);
        }

        // notifyError(`Airdrop failed: ${result.error}`);
      }
    } catch (error) {
      console.error("Error during airdrop:", error);

      if (error.message) {
        notifyError(
          `Airdrop failed: You've either reached your airdrop limit today.`
        );
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
              <h2 className="text-2xl font-bold text-gray-800">
                Connect Your Wallet
              </h2>
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
  <div className="flex items-center gap-2 mb-2">
    <div className="bg-indigo-100 p-2 rounded-full">
      <BsCoin className="h-6 w-6 text-indigo-600" />
    </div>
    <h2 className="text-xl font-bold text-gray-800">
      Create Tokens
    </h2>
    <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
      Create
    </span>
  </div>
  
  <div className="bg-indigo-50 p-3 rounded-lg mb-4 border border-indigo-200">
    <div className="flex items-start gap-2">
      <FiInfo className="h-5 w-5 text-indigo-600 mt-0.5" />
      <p className="text-sm text-indigo-700">
        Define your token's name, symbol, and decimals. Create SPL tokens with your own custom parameters.
      </p>
    </div>
  </div>
  
  <p className="text-gray-600 mb-4">
    Create your own custom tokens on the Solana blockchain. Define the
    name, symbol, and decimals.
  </p>
  
  <div className="mt-auto">
    <Link to="/create-token">
      <button className="h-12 w-full hover:cursor-pointer bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-indigo-500 flex items-center justify-center gap-2">
        <FiPlus className="h-5 w-5" />
        <span>Create Token</span>
      </button>
    </Link>
  </div>
            </Card>

<Card className="flex flex-col h-full">
  <div className="flex items-center gap-2 mb-2">
    <div className="bg-purple-100 p-2 rounded-full">
      <BsStars className="h-6 w-6 text-purple-600" />
    </div>
    <h2 className="text-xl font-bold text-gray-800">
      Mint Tokens
    </h2>
    <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
      Mint
    </span>
  </div>
  
  <div className="bg-purple-50 p-3 rounded-lg mb-4 border border-purple-200">
    <div className="flex items-start gap-2">
      <FiInfo className="h-5 w-5 text-purple-600 mt-0.5" />
      <p className="text-sm text-purple-700">
        Increase the supply of your existing tokens. Mint to any wallet address.
      </p>
    </div>
  </div>
  
  <p className="text-gray-600 mb-4">
    Mint new tokens to any wallet. Add supply to your existing tokens.
  </p>
  
  <div className="mt-auto">
    <Link to="/mint-token">
      <button className="h-12 w-full hover:cursor-pointer bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-indigo-500 flex items-center justify-center gap-2">
        <FiGift className="h-5 w-5" />
        <span>Mint Tokens</span>
      </button>
    </Link>
  </div>
</Card>

<Card className="flex flex-col h-full">
  <div className="flex items-center gap-2 mb-2">
    <div className="bg-green-100 p-2 rounded-full">
      <FiSend className="h-6 w-6 text-green-600" />
    </div>
    <h2 className="text-xl font-bold text-gray-800">
      Send Tokens
    </h2>
    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
      Transfer
    </span>
  </div>
  
  <div className="bg-green-50 p-3 rounded-lg mb-4 border border-green-200">
    <div className="flex items-start gap-2">
      <FiInfo className="h-5 w-5 text-green-600 mt-0.5" />
      <p className="text-sm text-green-700">
        Transfer your tokens to any Solana wallet address quickly and with minimal fees.
      </p>
    </div>
  </div>
  
  <p className="text-gray-600 mb-4">
    Transfer your tokens to other wallets. Send tokens to friends or
    customers.
  </p>
  
  <div className="mt-auto">
    <Link to="/send-token">
      <button className="h-12 w-full hover:cursor-pointer bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-indigo-500 flex items-center justify-center gap-2">
        <AiOutlineSwap className="h-5 w-5" />
        <span>Send Tokens</span>
      </button>
    </Link>
  </div>
</Card>

<Card className="flex flex-col h-full">
  <div className="flex items-center gap-2 mb-2">
    
    <div className="bg-blue-100 p-2 rounded-full">
      <FiClock className="h-6 w-6 text-blue-600" />
    </div>

    <h2 className="text-xl font-bold text-gray-800">
      Transaction History
    </h2>
    
    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
      History
    </span>
  </div>
  
  <div className="bg-blue-50 p-3 rounded-lg mb-4 border border-blue-200">
    <div className="flex items-start gap-2">
      <FiInfo className="h-5 w-5 text-blue-600 mt-0.5" />
      <p className="text-sm text-blue-700">
        Track all your token actions in one place. Monitor creations, mints, and transfers.
      </p>
    </div>
  </div>
  
  <p className="text-gray-600 mb-4">
    View your transaction history. See all your token creations,
    mints, and transfers.
  </p>
  
  <div className="mt-auto">
    <Link to="/transactions">
      <button className="h-12 w-full hover:cursor-pointer bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-indigo-500 flex items-center justify-center gap-2">
        <FiDatabase className="h-5 w-5" />
        <span>View History</span>
      </button>
    </Link>
  </div>
</Card>

  

          <Card className="md:col-span-2">

            <div className="flex flex-col">

              <div className="flex items-center gap-2 mb-2">

                <div className="bg-amber-100 p-2 rounded-full">
                  <BsCashCoin className="h-6 w-6 text-amber-600" />
                </div>

                <h2 className="text-xl font-bold text-gray-800">
                  Need Devnet SOL for Testing?
                </h2>

                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  Devnet
                </span>

              </div>

              <div className="bg-amber-50 p-3 rounded-lg mb-4 border border-amber-200">
                <div className="flex items-start gap-2">
                  <FiInfo className="h-5 w-5 text-amber-600 mt-0.5" />
                  <p className="text-sm text-amber-700">
                    SOL tokens are required to pay for transaction fees and
                    create new tokens on Solana. These are test tokens on
                    Solana's Devnet and have no real value.
                  </p>
                </div>
              </div>

              <p className="text-gray-600 mb-4">
                Get SOL tokens on the Solana Devnet for testing purposes. This
                will add 1 SOL to your wallet.
              </p>

              <button
                onClick={handleAirdrop}
                className="h-12 w-full hover:cursor-pointer bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-indigo-500 flex items-center justify-center gap-2"
              >
                {isAirdropping ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <BsLightningCharge className="h-5 w-5" />
                    <span>Request 1 SOL Airdrop</span>
                  </>
                )}
              </button>
            </div>
          </Card>


        </div>
      )}
    </div>
  );
};

export default Home;

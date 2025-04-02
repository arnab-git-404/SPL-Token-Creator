

import React, { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FiCopy, FiCheckCircle, FiExternalLink, FiAward } from "react-icons/fi";
import CreateTokenForm from "../components/Token/CreateTokenForm";
import Card from "../components/UI/Card";
import Button from "../components/UI/Button";
import Notification from "../components/UI/Notification";
import useNotification from "../hooks/useNotification";
import WalletConnectButton from "../components/Wallet/WalletConnectButton";
import { useTokenContext } from "../context/TokenContext";

const CreateToken = () => {
  const { updateTokenData } = useTokenContext();
  const { publicKey, connected } = useWallet();

  const handleTokenCreated = (tokenData) => {
    setCreatedToken(tokenData);
    updateTokenData(tokenData); // Store in context
    notifySuccess("Token created successfully!");
  };

  const { notification, hideNotification, notifySuccess, notifyError } =
    useNotification();

  const [createdToken, setCreatedToken] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

  const handleCreateAnother = () => {
    setCreatedToken(null);
  };

  const handleCopy = (text, fieldName) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopiedField(fieldName);
        toast.success(`${fieldName} copied to clipboard!`);
        setTimeout(() => setCopiedField(null), 2000);
      })
      .catch((err) => {
        toast.error(`Failed to copy: ${err.message}`);
      });
  };

  const openExplorer = (address) => {
    const explorerUrl = `https://explorer.solana.com/address/${address}?cluster=devnet`;
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
              Connect your Solana wallet to create tokens on the Solana
              blockchain.
            </p>
            <WalletConnectButton />
          </div>
        </Card>
      ) : createdToken ? (
        <Card className="mb-6 transition-all hover:shadow-lg border-t-4 border-green-500">
          <h2 className="text-xl font-bold mb-4 text-green-700 flex items-center">
            <FiCheckCircle className="mr-2" /> Token Created Successfully!
          </h2>

          <div className="bg-green-50 p-5 rounded-md mb-6 border border-green-200">
            <h3 className="font-medium text-green-800 mb-3 border-b pb-2 border-green-200">
              Token Details:
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <div className="p-2 hover:bg-green-100 rounded-md transition-colors">
                <span className="font-medium text-gray-700">
                  Name: {createdToken.name}{" "}
                </span>
              </div>
              <div className="p-2 hover:bg-green-100 rounded-md transition-colors">
                <span className="font-medium text-gray-700">
                  Symbol: {createdToken.symbol}{" "}
                </span>
              </div>
              <div className="p-2 hover:bg-green-100 rounded-md transition-colors">
                <span className="font-medium text-gray-700">
                  Decimals: {createdToken.decimals}{" "}
                </span>
              </div>

              <div className="p-2 hover:bg-green-100 rounded-md flex flex-col sm:flex-row sm:items-center gap-2 transition-colors">
                <div className="font-medium text-gray-700">Token Address:</div>
                <div className="flex items-center flex-1">
                  <span className="break-all mr-2 text-indigo-700 font-mono text-sm">
                    {createdToken.address}
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() =>
                        handleCopy(createdToken.address, "Token Address")
                      }
                      className="text-gray-500 hover:cursor-pointer hover:text-indigo-600 transition-colors focus:outline-none"
                      title="Copy to clipboard"
                    >
                      {copiedField === "Token Address" ? (
                        <FiCheckCircle className="text-green-600" />
                      ) : (
                        <FiCopy />
                      )}
                    </button>
                    <button
                      onClick={() => openExplorer(createdToken.address)}
                      className="text-gray-500 hover:cursor-pointer hover:text-indigo-600 transition-colors focus:outline-none"
                      title="View on Explorer"
                    >
                      <FiExternalLink />
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-2 hover:bg-green-100 rounded-md flex flex-col sm:flex-row sm:items-center gap-2 transition-colors">
                <div className="font-medium text-gray-700">
                  Associated Token Account:
                </div>
                <div className="flex items-center flex-1">
                  <span className="break-all mr-2 text-indigo-700 font-mono text-sm">
                    {createdToken.associatedTokenAccount}
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() =>
                        handleCopy(
                          createdToken.associatedTokenAccount,
                          "Associated Token Account"
                        )
                      }
                      className="text-gray-500 hover:cursor-pointer hover:text-indigo-600 transition-colors focus:outline-none"
                      title="Copy to clipboard"
                    >
                      {copiedField === "Associated Token Account" ? (
                        <FiCheckCircle className="text-green-600" />
                      ) : (
                        <FiCopy />
                      )}
                    </button>
                    <button
                      onClick={() =>
                        openExplorer(createdToken.associatedTokenAccount)
                      }
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
              Your token has been created on the Solana Devnet. You can now mint
              tokens and send them to other addresses. Use the buttons below to
              continue.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            <button
              onClick={handleCreateAnother}
              className="h-12 px-4 rounded-md hover:cursor-pointer flex items-center justify-center bg-white text-indigo-600 border-2 border-indigo-600 hover:bg-indigo-50 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <FiAward className="mr-2" /> Create Another Token
            </button>

            <Link to="/mint-token" className="w-full sm:w-auto"
                onClick={() => updateTokenData(createdToken)}

            >
              <button className="h-12 w-full px-4 rounded-md flex items-center justify-center hover:cursor-pointer bg-indigo-600 text-white hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                Mint Tokens <FiExternalLink className="ml-2" />
              </button>
            </Link>
          </div>
        </Card>
      ) : (
        <CreateTokenForm onSuccess={handleTokenCreated} />
      )}
    </div>
  );
};

export default CreateToken;

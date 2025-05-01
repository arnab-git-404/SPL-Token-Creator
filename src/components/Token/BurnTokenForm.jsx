// import React, { useState, useEffect } from "react";
// import { useWallet } from "@solana/wallet-adapter-react";
// import { toast } from "react-toastify";
// import { FiTrash2 } from "react-icons/fi";
// import Card from "../UI/Card";
// import Button from "../UI/Button";
// import { burnTokens } from "../../utils/solana";
// import useNotification from "../../hooks/useNotification";
// import TokenSelector from "./TokenSelector";

// const BurnTokenForm = ({ onSuccess, selectedToken }) => {
//   const { publicKey } = useWallet();
//   const { notifyError, notifyInfo } = useNotification();

//   const [isLoading, setIsLoading] = useState(false);
//   const [token, setToken] = useState(selectedToken || null);
//   const [amount, setAmount] = useState("");
//   const [error, setError] = useState("");

//   useEffect(() => {
//     if (selectedToken) {
//       setToken(selectedToken);

//     if (value === "" || (/^\d*\.?\d*$/.test(value) && !isNaN(parseFloat(value)))) {
//       setAmount(value);


//     if (!amount || parseFloat(amount) <= 0) {


//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!validateForm()) return;

//     setIsLoading(true);
//     notifyInfo("Burning tokens... Please approve the transaction in your wallet.");

//     try {
//       // This function would need to be implemented in your tokenService
//       const result = await burnTokens({
//         tokenAddress: token.address,
//         amount: parseFloat(amount),
//         decimals: token.decimals,
//         wallet: publicKey

//         signature: result.signature,
//       });

//           <label className="block text-gray-700 text-sm font-bold mb-2">
//             Select Token *
//           </label>

//           <TokenSelector
//             selectedToken={token}
//             onTokenSelect={handleTokenChange}

//         </Button>


import React, { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { toast } from "react-toastify";
import { FiTrash2, FiCheck } from "react-icons/fi";
import Card from "../UI/Card";
import Button from "../UI/Button";
import { burnTokens, fetchUserTokens } from "../../utils/solana";
import useNotification from "../../hooks/useNotification";
import Loader from "../UI/Loader";
import Notification from "../../components/UI/Notification";

const BurnTokenForm = ({ onSuccess, selectedToken }) => {
  const { publicKey } = useWallet();
  // const { notifyError, notifyInfo } = useNotification();

  const {
    notification,
    hideNotification,
    notifySuccess,
    notifyError,
    notifyInfo,
  } = useNotification();

  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingTokens, setIsFetchingTokens] = useState(false);
  const [token, setToken] = useState(selectedToken || null);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [tokens, setTokens] = useState([]);
  const [tokenError, setTokenError] = useState("");
  const [transactionState, setTransactionState] = useState("idle"); // idle, verifying, processing, success

  // Load user tokens when component mounts or when publicKey changes
  useEffect(() => {
    const loadTokens = async () => {
      if (!publicKey) return;

      setIsFetchingTokens(true);
      setTokenError("");

      try {
        const userTokens = await fetchUserTokens(publicKey);
        // console.log("User tokens:", userTokens);

        setTokens(userTokens);

        // If selectedToken is not in the list, clear selection
        if (token && !userTokens.some((t) => t.mint === token.mint)) {
          setToken(null);
        }
      } catch (err) {
        console.error("Error loading tokens:", err);
        setTokenError("Failed to load your tokens. Please try again.");
      } finally {
        setIsFetchingTokens(false);
      }
    };

    loadTokens();
  }, [publicKey]);

  // Update token if selectedToken prop changes
  useEffect(() => {
    if (selectedToken) {
      setToken(selectedToken);
    }
  }, [selectedToken]);

  const handleTokenChange = (e) => {
    const selectedMintAddress = e.target.value;
    if (selectedMintAddress === "") {
      setToken(null);
    } else {
      const selectedToken = tokens.find((t) => t.mint === selectedMintAddress);
      setToken(selectedToken || null);
    }
    setError("");
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (
      value === "" ||
      (/^\d*\.?\d*$/.test(value) && !isNaN(parseFloat(value)))
    ) {
      setAmount(value);
      setError("");
    }
  };


  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  const validateForm = () => {
    if (!token) {
      setError("Please select a token to burn");
      return false;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount to burn");
      return false;
    }

    if (parseFloat(amount) > token.amount) {
      setError("You cannot burn more tokens than you have, please check your balance.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setTransactionState("verifying");

    try {
      // Short delay to show the verifying state
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setTransactionState("processing");

      notifyInfo(
        "Burning tokens... Please approve the transaction in your wallet."
      );

      const result = await burnTokens({
        tokenAddress: token.mint,
        amount: parseFloat(amount),
        decimals: token.decimals,
        wallet: publicKey,
      });

      setTransactionState("success");

      // Wait a moment before calling onSuccess for better UX
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log("Burn result:", result);

      onSuccess({
        tokenName: token.name,
        tokenSymbol: token.symbol,
        amount: amount,
        signature: result.signature,
      });

      // Reset form after success
      setTimeout(() => {
        setTransactionState("idle");
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      console.error("Error burning tokens:", error);
      notifyError(error.message || "Failed to burn tokens. Please try again.");
      setTransactionState("idle");
    } finally {
      setIsLoading(false);
    }
  };

  // Get button content based on transaction state
  const getButtonContent = () => {
    switch (transactionState) {
      case "verifying":
        return (
          <>
            <span className="mr-2 inline-block animate-spin">⟳</span>
            <span>Verifying...</span>
          </>
        );
      case "processing":
        return (
          <>
            <span className="mr-2 inline-block animate-pulse">🔥</span>
            <span>Processing Transaction...</span>
          </>
        );
      case "success":
        return (
          <>
            <FiCheck className="mr-2 text-xl" />
            <span>Tokens Burned!</span>
          </>
        );
      default:
        return (
          <>
            <FiTrash2
              className={`mr-2 text-xl ${!isLoading && "animate-pulse"}`}
            />
            <span className="uppercase tracking-wider">Burn Tokens</span>
          </>
        );
    }
  };

  // Render token selector content based on state
  const renderTokenSelector = () => {
    if (isFetchingTokens) {
      return (
        <div className="mt-2 text-gray-900">
          <Loader size="small" message="Fetching your tokens..." />
        </div>
      );
    }

    if (tokenError) {
      return (
        <div className="border border-red-200 rounded-md p-3 bg-red-50 text-red-600">
          {tokenError}
        </div>
      );
    }

    if (tokens.length === 0) {
      return (
        <div className="border rounded-md p-3 bg-yellow-50 text-yellow-700">
          No tokens found in your wallet. Create a token first.
        </div>
      );
    }

    return (
      <div className="relative">
        {notification && (
          <Notification
            type={notification.type}
            message={notification.message}
            autoClose={notification.autoClose}
            onClose={hideNotification}
          />
        )}

        <select
          className="text-gray-500 block appearance-none w-full bg-white border border-gray-300 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
          value={token ? token.mint : ""}
          onChange={handleTokenChange}
        >
          <option value="">-- Select a token --</option>
          {tokens.map((token) => (
            <option key={token.mint} value={token.mint}>
              {formatAddress(token.mint)} 
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <svg
            className="fill-current h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>
    );
  };

  return (
    <Card className="mb-6 transition-all hover:shadow-lg">
      <h2 className="text-xl font-bold mb-6 text-indigo-700 flex items-center">
        <FiTrash2 className="mr-2" /> Burn Tokens
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Select Token *
          </label>
          {renderTokenSelector()}
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Amount to Burn *
          </label>
          <input
            type="text"
            value={amount}
            onChange={handleAmountChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-indigo-500"
            placeholder="Enter amount to burn"
          />
          {token && (
            <p className="text-sm text-gray-500 mt-1">
              Total Supply : {token.amount}
            </p>
          )}
        </div>

        {error && <div className="mb-4 text-red-500 text-sm">{error}</div>}

        <div className="bg-yellow-50 p-4 rounded-md mb-6 border border-yellow-200">
          <p className="text-gray-700 text-sm">
            <strong>Warning:</strong> Burning tokens permanently removes them
            from circulation. This action cannot be undone. Please verify the
            token and amount before proceeding.
          </p>
        </div>

        <Button
          type="submit"
          // isLoading={isLoading}
          isLoading={isLoading}
          disabled={isLoading}
          className="hover:cursor-pointer bg-red-600 hover:bg-red-700 shadow-lg hover:shadow-red-400/30 transition-all duration-200 
  border border-red-500 py-3 px-6 text-white font-bold rounded-lg w-full md:w-auto flex items-center 
  justify-center transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-red-500 
  focus:ring-opacity-50"
        >
          {/* <FiTrash2 className="mr-2 text-xl animate-pulse" />

          <span className="uppercase tracking-wider">Burn Tokens </span> */}

          {getButtonContent()}
        </Button>
      </form>
    </Card>
  );
};

export default BurnTokenForm;

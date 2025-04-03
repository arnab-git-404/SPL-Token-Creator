import React, { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { fetchUserTokens } from "../../utils/solana";
import Loader from "../UI/Loader";

const TokenSelector = ({ selectedToken, onTokenSelect }) => {
  const { publicKey } = useWallet();
  const [tokens, setTokens] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {

    const loadTokens = async () => {
      if (!publicKey) return;

      setIsLoading(true);
      setError("");

      try {
        // This function would need to be implemented in your tokenService
        const userTokens = await fetchUserTokens(publicKey);
        console.log("User tokens:", userTokens);

        setTokens(userTokens);

        // If selectedToken is not tn the list, clear selection
        if (
          selectedToken &&
          !userTokens.some((t) => t.mintAddress === selectedToken.mintAddress)
        ) {
          onTokenSelect(null);
        }
      } catch (err) {
        console.error("Error loading tokens:", err);
        setError("Failed to load your tokens. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    loadTokens();
  }, [publicKey, selectedToken, onTokenSelect]);

  if (isLoading) {
    return (
      //   <div className="flex items-center justify-center h-20 border rounded-md bg-gray-50">
      //     <div className="animate-pulse text-gray-500">Loading tokens...</div>
      //   </div>

      <div className="mt-6 text-gray-900 ">
        <Loader size="small" message="Fetching your tokens..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-red-200 rounded-md p-3 bg-red-50 text-red-600">
        {error}
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
      <select
        className=" text-gray-500 block appearance-none w-full bg-white border border-gray-300 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
        value={selectedToken ? selectedToken.mintAddress : ""}
        onChange={(e) => {
          const selected = tokens.find((t) => t.address === e.target.value);
          onTokenSelect(selected || null);
        }}
      >
        <option value="">-- Select a token --</option>

        {tokens.map((token) => (
          <option key={token.mintAddress} value={token.mintAddress}>
            {token.mintAddress}  - {token.amount} available
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

export default TokenSelector;

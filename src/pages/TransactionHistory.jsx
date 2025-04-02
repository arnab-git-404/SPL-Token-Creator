import React, { useState, useEffect, useCallback } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { FaHistory, FaSync, FaNetworkWired, FaWallet } from "react-icons/fa";
import { BiErrorCircle } from "react-icons/bi";

const RealTimeTransactionDashboard = () => {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();

  const [transactions, setTransactions] = useState([]);
  const [solBalance, setSolBalance] = useState(0);
  const [network, setNetwork] = useState("devnet"); // Default to devnet
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds
  const [lastUpdated, setLastUpdated] = useState(null);

  // Detect network from connection endpoint
  // useEffect(() => {
  //   if (connection) {
  //     const endpoint = connection.rpcEndpoint;
  //     if (endpoint.includes("mainnet")) {
  //       setNetwork("mainnet");
  //     } else {
  //       setNetwork("devnet");
  //     }
  //     console.log("Detected network:", endpoint.includes("mainnet") ? "mainnet" : "devnet");
  //   }
  // }, [connection]);

  useEffect(() => {
    if (connection) {
      const endpoint = connection.rpcEndpoint.toLowerCase();
      // Check for various mainnet indicators
      const isMainnet =
        endpoint.includes("mainnet") ||
        endpoint.includes("main-beta") ||
        endpoint.includes("api.mainnet") ||
        endpoint.includes("main.solana");

      setNetwork(isMainnet ? "mainnet" : "devnet");

      console.log("Connected to:", connection.rpcEndpoint);
      console.log("Detected network:", isMainnet ? "mainnet" : "devnet");
    }
  }, [connection]);





  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp * 1000).toLocaleString();
  };

  const shortenAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const fetchTransactionHistory = useCallback(async () => {
    if (!publicKey || !connection) return;

    setLoading(true);
    setError(null);

    try {
      console.log("Fetching transactions from", connection.rpcEndpoint);

      // Get transaction signatures
      const signatures = await connection.getSignaturesForAddress(publicKey, {
        limit: 10,
      });

      if (signatures.length === 0) {
        setTransactions([]);
        setLoading(false);
        setLastUpdated(new Date());
        return;
      }

      // Get transaction details
      const transactionDetails = await Promise.all(
        signatures.map(async (sig) => {
          try {
            // For faster loading, we'll use the signature info directly
            // and only load full transaction details when needed
            return {
              signature: sig.signature,
              blockTime: sig.blockTime,
              slot: sig.slot,
              status: sig.err ? "Failed" : "Confirmed",
              fee: sig.err ? "N/A" : "~0.000005", // Approximate fee
            };
          } catch (err) {
            console.error("Error processing transaction:", err);
            return {
              signature: sig.signature,
              blockTime: sig.blockTime,
              slot: sig.slot,
              status: "Unknown",
              fee: "N/A",
            };
          }
        })
      );

      setTransactions(transactionDetails);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError("Failed to load transactions. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [publicKey, connection]);

  const fetchBalance = useCallback(async () => {
    if (!publicKey || !connection) return;

    try {
      console.log(`Fetching balance for ${publicKey.toString()} on ${network}`);

      const balance = await connection.getBalance(publicKey);
      setSolBalance(balance / LAMPORTS_PER_SOL);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Error fetching SOL balance:", err);
    }
  }, [publicKey, connection]);

  // Initial data fetch
  useEffect(() => {
    if (connected && publicKey) {
      fetchTransactionHistory();
      fetchBalance();
    } else {
      setTransactions([]);
      setSolBalance(0);
    }
  }, [connected, publicKey, fetchTransactionHistory, fetchBalance]);

  // Setup refresh interval
  useEffect(() => {
    if (!connected || !publicKey) return;

    const intervalId = setInterval(() => {
      fetchBalance();
      fetchTransactionHistory();
    }, refreshInterval * 1000);

    return () => clearInterval(intervalId);
  }, [
    connected,
    publicKey,
    refreshInterval,
    fetchBalance,
    fetchTransactionHistory,
  ]);

  const handleRefresh = () => {
    fetchTransactionHistory();
    fetchBalance();
  };

  const handleRefreshIntervalChange = (e) => {
    setRefreshInterval(Number(e.target.value));
  };

  return (
    <div className="p-4 max-w-5xl mx-auto bg-gray-50 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">

        <h1 className="text-2xl font-bold text-indigo-600 flex items-center">
          <FaWallet className="mr-2" /> Solana Dashboard
        </h1>

        <div className="flex items-center text-sm bg-gray-100 p-2 rounded">
          <FaNetworkWired className="mr-1 text-black " />
          <span
            className={`font-medium ${
              network === "mainnet" ? "text-green-600" : "text-purple-600"
            }`}
          >
            {network === "mainnet" ? "Mainnet" : "Devnet"}
          </span>
        </div>
      </div>

      {!connected ? (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex items-center">
            <BiErrorCircle className="text-yellow-500 text-xl mr-2" />
            <p className="text-yellow-700">
              Please connect your wallet to view transaction history and
              balances
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                  <FaWallet className="mr-2 text-blue-500" /> Wallet Balance
                </h2>
                <p className="text-sm text-gray-500">
                  {shortenAddress(publicKey?.toString())}
                </p>
              </div>

              <div className="mt-2 sm:mt-0">
                <span className="text-2xl font-bold text-gray-900">
                  {solBalance.toFixed(6)}
                </span>
                <span className="ml-1 text-gray-600">SOL</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <FaHistory className="mr-2 text-blue-500" /> Transaction History
              </h2>

              <div className="flex items-center space-x-2">
                <select
                  value={refreshInterval}
                  onChange={handleRefreshIntervalChange}
                  className="text-sm border rounded p-1"
                >
                  <option value={10}>10s</option>
                  <option value={30}>30s</option>
                  <option value={60}>1m</option>
                  <option value={300}>5m</option>
                </select>

                <button
                  onClick={handleRefresh}
                  className="flex items-center bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition"
                >
                  <FaSync className={`mr-1 ${loading ? "animate-spin" : ""}`} />
                  Refresh
                </button>
              </div>
            </div>

            {lastUpdated && (
              <p className="text-xs text-gray-500 mb-2">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}

            {loading && transactions.length === 0 ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                <p className="mt-2 text-gray-600">Loading transactions...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 p-4 rounded text-red-700">{error}</div>
            ) : (
              <div className="overflow-x-auto">
                {transactions.length > 0 ? (
                  <table className="min-w-full bg-white rounded-lg overflow-hidden">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Signature
                        </th>
                        <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Time
                        </th>
                        <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fee (SOL)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {transactions.map((tx) => (
                        <tr key={tx.signature} className="hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <a
                              href={`https://explorer.solana.com/tx/${
                                tx.signature
                              }?cluster=${
                                network === "mainnet"
                                  ? "mainnet-beta"
                                  : "devnet"
                              }`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 hover:underline"
                              title={tx.signature}
                            >
                              {tx.signature.slice(0, 8)}...
                              {tx.signature.slice(-8)}
                            </a>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-700">
                            {formatDate(tx.blockTime)}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
                              ${
                                tx.status === "Confirmed"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {tx.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-700">
                            {tx.fee}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No transactions found for this address on {network}
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default RealTimeTransactionDashboard;

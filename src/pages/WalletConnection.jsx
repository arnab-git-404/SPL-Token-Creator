import React, { useState, useEffect, useCallback } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PublicKey, Transaction, SystemProgram, Keypair } from '@solana/web3.js';
import {
  createInitializeMintInstruction,
  getMinimumBalanceForRentExemptMint,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  getAccount,
  createTransferInstruction,
} from '@solana/spl-token';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';



 const WalletConnection = () => {
  const { connection } = useConnection();
  const { publicKey, signTransaction } = useWallet();
  const [solBalance, setSolBalance] = useState(0);
  const [tokenMint, setTokenMint] = useState(null);
  const [tokenAccount, setTokenAccount] = useState(null);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [recipientAddress, setRecipientAddress] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [transactionHistory, setTransactionHistory] = useState([]);
  
  // New state variables for token details
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [tokenDecimals, setTokenDecimals] = useState('9');
  const [tokenMetadata, setTokenMetadata] = useState(null);

  const fetchSolBalance = useCallback(async () => {
    if (!publicKey) return;
    try {
      const balance = await connection.getBalance(publicKey);
      setSolBalance(balance / 1e9);
    } catch (error) {
      toast.error(`Failed to fetch balance: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, [publicKey, connection]);

  const fetchTokenBalance = useCallback(async () => {
    if (!publicKey || !tokenAccount) return;
    try {
      const accountInfo = await getAccount(connection, tokenAccount);
      // Use the custom decimals for accurate display
      const decimals = tokenMetadata ? tokenMetadata.decimals : 9;
      setTokenBalance(Number(accountInfo.amount) / Math.pow(10, decimals));
    } catch {
      setTokenBalance(0);
    }
  }, [publicKey, tokenAccount, connection, tokenMetadata]);

  useEffect(() => {
    const interval = setInterval(fetchSolBalance, 15000);
    fetchSolBalance();
    return () => clearInterval(interval);
  }, [fetchSolBalance]);

  useEffect(() => {
    fetchTokenBalance();
  }, [fetchTokenBalance]);

  const createToken = async () => {
    if (!publicKey || !signTransaction) {
      toast.error('Wallet not connected');
      return;
    }

    if (!tokenName.trim()) {
      toast.error('Token name is required');
      return;
    }

    if (!tokenSymbol.trim()) {
      toast.error('Token symbol is required');
      return;
    }

    // Validate decimals
    const decimals = parseInt(tokenDecimals);
    if (isNaN(decimals) || decimals < 0 || decimals > 9) {
      toast.error('Decimals must be a number between 0 and 9');
      return;
    }

    setIsLoading(true);
    try {
      const mintKeypair = Keypair.generate();
      const lamports = await getMinimumBalanceForRentExemptMint(connection);

      const { blockhash: recentBlockhash } = await connection.getLatestBlockhash();

      const transaction = new Transaction().add(
        SystemProgram.createAccount({
          fromPubkey: publicKey,
          newAccountPubkey: mintKeypair.publicKey,
          space: MINT_SIZE,
          lamports,
          programId: TOKEN_PROGRAM_ID,
        }),
        createInitializeMintInstruction(
          mintKeypair.publicKey,
          decimals,  // Use the user-defined decimals
          publicKey,
          publicKey,
          TOKEN_PROGRAM_ID
        )
      );

      transaction.recentBlockhash = recentBlockhash;
      transaction.feePayer = publicKey;

      const signed = await signTransaction(transaction);
      signed.partialSign(mintKeypair);
      const signature = await connection.sendRawTransaction(signed.serialize());

      setTransactionHistory(prev => [...prev, {
        type: 'Token Creation',
        signature,
        timestamp: new Date(),
        status: 'pending'
      }]);

      await connection.confirmTransaction(signature, 'confirmed');
      
      const ata = await getAssociatedTokenAddress(
        mintKeypair.publicKey,
        publicKey
      );

      const { blockhash: ataBlockhash } = await connection.getLatestBlockhash();
      const ataTransaction = new Transaction().add(
        createAssociatedTokenAccountInstruction(
          publicKey,
          ata,
          publicKey,
          mintKeypair.publicKey
        )
      );

      ataTransaction.recentBlockhash = ataBlockhash;
      ataTransaction.feePayer = publicKey;

      const signedAta = await signTransaction(ataTransaction);
      const ataSignature = await connection.sendRawTransaction(signedAta.serialize());
      await connection.confirmTransaction(ataSignature, 'confirmed');

      // Store token metadata
      const newTokenMetadata = {
        name: tokenName,
        symbol: tokenSymbol,
        decimals: decimals
      };

      setTokenMint(mintKeypair.publicKey);
      setTokenAccount(ata);
      setTokenMetadata(newTokenMetadata);
      await fetchTokenBalance();

      setTransactionHistory(prev => 
        prev.map(tx => 
          tx.signature === signature ? { ...tx, status: 'confirmed' } : tx
        )
      );

      toast.success(`Token ${tokenName} (${tokenSymbol}) created successfully!`);
    } catch (error) {
      toast.error(`Token creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setTransactionHistory(prev => 
        prev.map(tx => 
          tx.type === 'Token Creation' ? { ...tx, status: 'failed' } : tx
        )
      );
    } finally {
      setIsLoading(false);
    }
  };



  const mintTokens = async () => {
    if (!publicKey || !signTransaction || !tokenMint || !tokenAccount) {
      toast.error('Missing required parameters');
      return;
    }

    setIsLoading(true);
    try {
      // Calculate the amount based on decimals
      const decimals = tokenMetadata ? tokenMetadata.decimals : 9;
      const mintAmount = BigInt(1 * Math.pow(10, decimals));

      const transaction = new Transaction().add(
        createMintToInstruction(
          tokenMint,
          tokenAccount,
          publicKey,
          mintAmount
        )
      );

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      const signed = await signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signed.serialize());

      setTransactionHistory(prev => [...prev, {
        type: 'Token Mint',
        signature,
        timestamp: new Date(),
        amount: 1,
        status: 'pending'
      }]);

      await connection.confirmTransaction(signature, 'confirmed');
      await fetchTokenBalance();

      setTransactionHistory(prev => 
        prev.map(tx => 
          tx.signature === signature ? { ...tx, status: 'confirmed' } : tx
        )
      );

      toast.success(`Successfully minted 1 ${tokenMetadata?.symbol || 'token'}!`);
    } catch (error) {
      toast.error(`Failed to mint tokens: ${error instanceof Error ? error.message : String(error)}`);
      setTransactionHistory(prev => 
        prev.map(tx => 
          tx.type === 'Token Mint' ? { ...tx, status: 'failed' } : tx
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const transferTokens = async () => {
    if (!publicKey || !signTransaction || !tokenMint || !tokenAccount || !recipientAddress || !transferAmount) {
      toast.error('Please connect wallet and fill all fields');
      return;
    }

    const amount = parseFloat(transferAmount);
    if (isNaN(amount)) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (amount <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }

    if (amount > tokenBalance) {
      toast.error(`Insufficient balance. You only have ${tokenBalance} ${tokenMetadata?.symbol || 'tokens'}`);
      return;
    }

    setIsLoading(true);
    try {
      const recipientPubkey = new PublicKey(recipientAddress);
      const recipientTokenAccount = await getAssociatedTokenAddress(
        tokenMint,
        recipientPubkey
      );

      const transaction = new Transaction();

      try {
        await getAccount(connection, recipientTokenAccount);
      } catch {
        transaction.add(
          createAssociatedTokenAccountInstruction(
            publicKey,
            recipientTokenAccount,
            recipientPubkey,
            tokenMint
          )
        );
      }

      // Calculate the amount based on decimals
      const decimals = tokenMetadata ? tokenMetadata.decimals : 9;
      const transferAmountBigInt = BigInt(Math.floor(amount * Math.pow(10, decimals)));

      transaction.add(
        createTransferInstruction(
          tokenAccount,
          recipientTokenAccount,
          publicKey,
          transferAmountBigInt,
          [],
          TOKEN_PROGRAM_ID
        )
      );

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      const signed = await signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signed.serialize());

      setTransactionHistory(prev => [...prev, {
        type: 'Token Transfer',
        signature,
        timestamp: new Date(),
        amount: amount,
        recipient: recipientAddress,
        status: 'pending'
      }]);

      await connection.confirmTransaction(signature, 'confirmed');
      await fetchTokenBalance();

      setTransactionHistory(prev => 
        prev.map(tx => 
          tx.signature === signature ? { ...tx, status: 'confirmed' } : tx
        )
      );

      toast.success(`Transferred ${amount} ${tokenMetadata?.symbol || 'tokens'} successfully!`);
      setTransferAmount('');
    } catch (error) {
      toast.error(`Transfer failed: ${error instanceof Error ? error.message : String(error)}`);
      setTransactionHistory(prev => 
        prev.map(tx => 
          tx.type === 'Token Transfer' ? { ...tx, status: 'failed' } : tx
        )
      );
    } finally {
      setIsLoading(false);
    }
  };





  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        toastStyle={{
          borderRadius: '12px',
          fontFamily: 'Inter, sans-serif'
        }}
      />
      
      <div className="min-h-[calc(100vh-2rem)] mx-auto bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden flex flex-col">
        {/* Header with glass effect */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl font-bold">Solana Token Manager</h1>
              <p className="text-blue-100 mt-1">
                Create, mint and manage your custom SPL tokens
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <WalletMultiButton 
                className="!bg-white/10 hover:!bg-white/20 !text-white !font-medium !py-3 !px-6 !rounded-xl !transition-all"
                style={{ backdropFilter: 'blur(10px)' }}
              />
            </div>
          </div>
        </div>

        {publicKey ? (
          <div className="flex-1 p-6 space-y-6 overflow-auto bg-gray-800 ">
            {/* Wallet Info and Token Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Wallet Info Card */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm h-full">
                <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                  <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                  Wallet Information
                </h2>
                <div className="space-y-3 h-[calc(100%-3rem)]">
                  <div>
                    <p className="text-sm text-gray-500">Wallet Address</p>
                    <p className="font-mono text-sm break-all bg-gray-500 p-2 rounded mt-1">
                      {publicKey.toBase58()}
                    </p>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                    <p className="text-sm text-gray-500">SOL Balance</p>
                    <p className="font-medium text-black ">{solBalance.toFixed(6)} SOL</p>
                  </div>
                  {tokenMint && (
                    <>
                      <div className="pt-2 border-t border-gray-100">
                        <p className="text-sm text-gray-500">Token Mint</p>
                        <p className="font-mono text-sm break-all bg-gray-500 p-2 rounded mt-1">
                          {tokenMint.toBase58()}
                        </p>
                      </div>
                      {tokenMetadata && (
                        <>
                          <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                            <p className="text-sm text-gray-500">Token Name</p>
                            <p className="font-medium">{tokenMetadata.name}</p>
                          </div>
                          <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                            <p className="text-sm text-gray-500">Token Symbol</p>
                            <p className="font-medium">{tokenMetadata.symbol}</p>
                          </div>
                          <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                            <p className="text-sm text-gray-500">Decimals</p>
                            <p className="font-medium">{tokenMetadata.decimals}</p>
                          </div>
                        </>
                      )}
                      <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                        <p className="text-sm text-gray-500">Token Balance</p>
                        <p className="font-medium">
                          {tokenBalance.toFixed(tokenMetadata?.decimals || 6)} {tokenMetadata?.symbol || ''}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Token Actions Card */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm h-full">
                <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                  <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                  Token Actions
                </h2>
                <div className="space-y-4 h-[calc(100%-3rem)] flex flex-col justify-between">
                  {!tokenMint ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Token Name
                        </label>
                        <input
                          type="text"
                          value={tokenName}
                          onChange={(e) => setTokenName(e.target.value)}
                          placeholder="My Token"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Token Symbol
                        </label>
                        <input
                          type="text"
                          value={tokenSymbol}
                          onChange={(e) => setTokenSymbol(e.target.value)}
                          placeholder="MTK"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Decimals
                        </label>
                        <input
                          type="number"
                          value={tokenDecimals}
                          onChange={(e) => setTokenDecimals(e.target.value)}
                          placeholder="9"
                          min="0"
                          max="9"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Range 0-9. Default is 9 (like SOL).
                        </p>
                      </div>
                      <button
                        onClick={createToken}
                        disabled={isLoading || !tokenName || !tokenSymbol}
                        className={`w-full py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center ${
                          isLoading || !tokenName || !tokenSymbol
                            ? 'bg-gray-300 text-gray-600'
                            : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-md hover:shadow-lg'
                        }`}
                      >
                        {isLoading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                          </>
                        ) : (
                          'Create New Token'
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <button
                        onClick={mintTokens}
                        disabled={isLoading}
                        className={`w-full py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center ${
                          isLoading
                            ? 'bg-gray-300 text-gray-600'
                            : 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-md hover:shadow-lg'
                        }`}
                      >
                        {isLoading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                          </>
                        ) : (
                          `Mint 1 ${tokenMetadata?.symbol || 'Token'}`
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Transfer Card */}
              {tokenMint && (
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm h-full">
                  <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                    <span className="w-3 h-3 bg-amber-500 rounded-full mr-2"></span>
                    Transfer Tokens
                  </h2>
                  <div className="space-y-4 h-[calc(100%-3rem)] flex flex-col justify-between">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Recipient Address
                        </label>
                        <input
                          type="text"
                          value={recipientAddress}
                          onChange={(e) => setRecipientAddress(e.target.value)}
                          placeholder="Enter wallet address"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Amount to Send
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            value={transferAmount}
                            onChange={(e) => setTransferAmount(e.target.value)}
                            placeholder="0.00"
                            min="0"
                            step={`0.${'0'.repeat((tokenMetadata?.decimals || 9) - 1)}1`}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <span className="absolute right-3 top-3 text-gray-500">
                            {tokenMetadata?.symbol || 'Tokens'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={transferTokens}
                      disabled={isLoading || !transferAmount || !recipientAddress}
                      className={`w-full py-3 px-4 rounded-xl font-medium transition-all ${
                        isLoading || !transferAmount || !recipientAddress
                          ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white shadow-md hover:shadow-lg'
                      }`}
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </span>
                      ) : (
                        `Send ${tokenMetadata?.symbol || 'Tokens'}`
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Transaction History */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex-1">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                <span className="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
                Transaction History
              </h2>
              {transactionHistory.length > 0 ? (
                <div className="overflow-x-auto h-[calc(100%-3rem)]">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipient</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Link</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {transactionHistory.map((tx, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {tx.type}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            {tx.amount ? `${tx.amount.toFixed(tokenMetadata?.decimals || 6)} ${tokenMetadata?.symbol || ''}` : '-'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            {tx.recipient ? (
                              <span className="font-mono">
                                {tx.recipient.slice(0, 4)}...{tx.recipient.slice(-4)}
                              </span>
                            ) : '-'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            {tx.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              tx.status === 'confirmed' 
                                ? 'bg-green-100 text-green-800'
                                : tx.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                            <a
                              href={`https://explorer.solana.com/tx/${tx.signature}?cluster=devnet`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-900 hover:underline"
                            >
                              View
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg
                    className="mx-auto h-16 w-16 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="mt-2 text-gray-500">No transactions yet</p>
                  <p className="mt-1 text-sm text-gray-500">Transaction history will appear here after you create, mint, or transfer tokens.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center max-w-md">
              <svg
                className="mx-auto h-16 w-16 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z"
                />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">Connect your wallet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Connect your Solana wallet to create and manage SPL tokens.
              </p>
              <div className="mt-6">
                <WalletMultiButton 
                  className="!bg-gradient-to-r !from-blue-500 !to-purple-600 hover:!from-blue-600 hover:!to-purple-700 !border-0 !text-white !font-medium !py-3 !px-6 !rounded-xl !shadow-md !transition-all"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletConnection;
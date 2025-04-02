import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { sendToken, fetchUserTokens } from '../../utils/solana';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Card from '../UI/Card';
import Loader from '../UI/Loader';
import { FiCopy, FiCheckCircle, FiExternalLink, FiAward } from "react-icons/fi";
import { FaCoins } from 'react-icons/fa';




const SendTokenForm = ({ onSuccess }) => {
  
  const { publicKey, signTransaction } = useWallet();
  const [formData, setFormData] = useState({
    tokenAddress: '',
    amount: '',
    destinationAddress: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [fetchingTokens, setFetchingTokens] = useState(false);
  const [userTokens, setUserTokens] = useState([]);
  const [error, setError] = useState('');

  // Fetch user tokens when wallet is connected
  useEffect(() => {
    const getUserTokens = async () => {
      if (!publicKey) return;
      
      try {
        setFetchingTokens(true);
        const tokens = await fetchUserTokens(publicKey);
        setUserTokens(tokens);
      } catch (error) {
        console.error('Error fetching user tokens:', error);
      } finally {
        setFetchingTokens(false);
      }
    };

    getUserTokens();
  }, [publicKey]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.tokenAddress.trim()) {
      setError('Token address is required');
      return false;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Amount must be greater than 0');
      return false;
    }
    if (!formData.destinationAddress.trim()) {
      setError('Destination address is required');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!publicKey) {
      setError('Please connect your wallet first');
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      
      const result = await sendToken(
        {
          publicKey,
          signTransaction
        },
        formData.tokenAddress,
        parseFloat(formData.amount),
        formData.destinationAddress
      );

      if (result.success) {
        // Reset form
        setFormData({
          tokenAddress: '',
          amount: '',
          destinationAddress: ''
        });
        
        // Call success callback with transfer data
        if (onSuccess) {
          onSuccess(result);
        }
      }
    } catch (err) {
      console.error('Error sending token:', err);
      setError(err.message || 'Failed to send token');
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
    <Card >
      
            <h1 className="text-3xl font-bold mb-6 flex items-center text-indigo-600   ">
              <FaCoins className="mr-2 text-indigo-600" />
              Send Token
              
            </h1>
            <p className="text-gray-400 mb-6 text-lg">Securely transfer SPL tokens to any Solana wallet</p>


      <form onSubmit={handleSubmit}>
        <Input
          label="Token Address"
          name="tokenAddress"
          value={formData.tokenAddress}
          onChange={handleChange}
          placeholder="Enter token mint address"
          required
        />
        
        <Input
          label="Amount"
          name="amount"
          type="number"
          value={formData.amount}
          onChange={handleChange}
          placeholder="Amount to send"
          min="0.000000001"
          step="0.000000001"
          required
        />
        
        <Input
          label="Destination Address"
          name="destinationAddress"
          value={formData.destinationAddress}
          onChange={handleChange}
          placeholder="Enter recipient wallet address"
          required
        />
        
        {error && <p className="text-red-500 mb-4">{error}</p>}
        
        <button 
          type="submit" 
          disabled={!publicKey || isLoading}
          loading={isLoading}
          className=' bg-indigo-600 text-white px-4 py-2 hover:cursor-pointer rounded-md hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed'
        >
          Send Tokens
        </button>
      </form>



      {fetchingTokens ? (
        <div className="mt-6 text-gray-900 ">
          <Loader size="small" message="Fetching your tokens..." />
        </div>
      ) : userTokens.length > 0 ? (
        <div className="mt-6">

          <h3 className="text-lg font-bold mb-2 text-gray-800">Your Tokens</h3>
          <div className="bg-gray-300 p-3 rounded-md max-h-56 overflow-y-auto border border-gray-200">
            {userTokens.map((token, index) => (
              <div 
                key={index} 
                className="mb-2 p-3 bg-white rounded border border-gray-200 cursor-pointer hover:bg-indigo-50 transition-all hover:border-indigo-300"
                onClick={() => setFormData(prev => ({ ...prev, tokenAddress: token.mint }))}
              >
                <p className="font-medium text-gray-800">{token.mint.slice(0, 8)}...{token.mint.slice(-8)}</p>
                <p className="text-sm text-gray-600">Balance: {token.amount}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}



    </Card>
  );
};

export default SendTokenForm;
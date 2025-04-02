// 4th 

import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { mintToken, fetchUserTokens, checkMintAuthority } from '../../utils/solana';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Card from '../UI/Card';
import Loader from '../UI/Loader';
import { FiDollarSign, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';

const MintTokenForm = ({ onSuccess, initialTokenMint }) => {
  const { publicKey, signTransaction } = useWallet();
  const [formData, setFormData] = useState({
    tokenAddress: '',
    amount: '',
    recipientAddress: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [fetchingTokens, setFetchingTokens] = useState(false);
  const [userTokens, setUserTokens] = useState([]);
  const [error, setError] = useState('');
  const [isCheckingAuthority, setIsCheckingAuthority] = useState(false);
  const [hasAuthority, setHasAuthority] = useState(null);

  // Initialize with token from context if available
  useEffect(() => {
    if (initialTokenMint) {
      setFormData(prev => ({
        ...prev,
        tokenAddress: initialTokenMint
      }));
    }
  }, [initialTokenMint]);

  // Check mint authority when token address changes
  useEffect(() => {
    const checkAuthority = async () => {
      if (!publicKey || !formData.tokenAddress.trim()) {
        setHasAuthority(null);
        return;
      }
      
      try {
        setIsCheckingAuthority(true);
        // Note: You'll need to implement this function in your solana.js utils
        const authority = await checkMintAuthority(publicKey, formData.tokenAddress);
        setHasAuthority(authority);
      } catch (error) {
        console.error('Error checking mint authority:', error);
        setHasAuthority(false);
      } finally {
        setIsCheckingAuthority(false);
      }
    };

    if (formData.tokenAddress) {
      checkAuthority();
    }
  }, [formData.tokenAddress, publicKey]);

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
    
    // Clear previous error when changing fields
    if (error) setError('');
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
    if (hasAuthority === false) {
      setError('Your wallet does not have authority to mint this token');
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

      const recipient = formData.recipientAddress.trim() || null;
      
      const result = await mintToken(
        {
          publicKey,
          signTransaction
        },
        formData.tokenAddress,
        parseFloat(formData.amount),
        recipient
      );

      if (result.success) {
        // Reset form
        setFormData({
          tokenAddress: '',
          amount: '',
          recipientAddress: ''
        });
        
        // Call success callback with mint data
        if (onSuccess) {
          onSuccess(result);
        }
      }
    } catch (err) {
      console.error('Error minting token:', err);
      
      // Custom error handling for common issues
      if (err.message && err.message.includes("0x4")) {
        setError('You do not have authority to mint this token. You must use the wallet that created the token.');
      } else if (err.logs && err.logs.some(log => log.includes("owner does not match"))) {
        setError('Owner does not match: Your wallet is not authorized to mint this token.');
      } else {
        setError(err.message || 'Failed to mint token');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="border border-gray-200 shadow-md hover:shadow-lg transition-shadow">
      <h1 className="text-3xl font-bold mb-6 text-indigo-700 flex items-center">
        <FiDollarSign className="mr-2" /> Mint Tokens
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            label="Token Address"
            name="tokenAddress"
            value={formData.tokenAddress}
            onChange={handleChange}
            placeholder="Enter token mint address"
            required
            className="mb-1"
          />
          {formData.tokenAddress && (
            <div className="mt-1 ml-1">
              {isCheckingAuthority ? (
                <span className="text-sm text-gray-500">Checking mint authority...</span>
              ) : hasAuthority === true ? (
                <span className="text-sm text-green-600 flex items-center">
                  <FiCheckCircle className="mr-1" /> You have mint authority
                </span>
              ) : hasAuthority === false ? (
                <span className="text-sm text-red-600 flex items-center">
                  <FiAlertTriangle className="mr-1" /> You don't have mint authority
                </span>
              ) : null}
            </div>
          )}
        </div>
        
        <Input
          label="Amount"
          name="amount"
          type="number"
          value={formData.amount}
          onChange={handleChange}
          placeholder="Amount to mint"
          min="0.000000001"
          step="0.000000001"
          required
          className="mb-3"
        />
        
        <Input
          label="Recipient Address (optional - defaults to your wallet)"
          name="recipientAddress"
          value={formData.recipientAddress}
          onChange={handleChange}
          placeholder="Enter recipient wallet address"
          className="mb-3"
        />
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
            {error}
          </div>
        )}
        
        <button 
          type="submit" 
          disabled={isLoading || !publicKey}
          className={`h-12 w-full px-4 rounded-md hover:cursor-pointer flex items-center justify-center ${
            isLoading || !publicKey ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'
          } text-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
        >
          {isLoading ? (
            <Loader size="small" className="text-white" />
          ) : (
            <span className="flex items-center">
              <FiDollarSign className="mr-2" /> Mint Tokens
            </span>
          )}
        </button>
      </form>

      <div className="mt-6 bg-indigo-50 p-4 rounded-md border border-indigo-200">
        <h3 className="font-medium text-indigo-700 mb-2">Important Note:</h3>
        <p className="text-sm text-gray-700">
          You can only mint tokens that you created or for which you have mint authority.
          If you're trying to mint a token created by another wallet, the transaction will fail.
        </p>
      </div>


      {fetchingTokens ? (
        <div className="mt-6">
          <Loader size="small" message="Fetching your tokens..." />
        </div>
      ) : userTokens.length > 0 ? (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2 text-indigo-700">Your Tokens</h3>
          <div className="bg-gray-100 p-3 rounded-md max-h-56 overflow-y-auto border border-gray-200">
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

export default MintTokenForm;

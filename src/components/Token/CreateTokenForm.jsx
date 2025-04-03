
// components/Token/CreateTokenForm.jsx

import React, { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { FiCopy, FiCheckCircle, FiExternalLink, FiAward } from "react-icons/fi";
import { 
  TOKEN_PROGRAM_ID, 
  MINT_SIZE, 
  createInitializeMintInstruction, 
  getAssociatedTokenAddress, 
  createAssociatedTokenAccountInstruction 
} from '@solana/spl-token';
import { 
  SystemProgram, 
  Transaction, 
  Keypair 
} from '@solana/web3.js';
import { toast } from 'react-toastify';
import Input from '../UI/Input';
import Card from '../UI/Card';


const CreateTokenForm = ({ onSuccess }) => {
  const { connection } = useConnection();
  const { publicKey, signTransaction } = useWallet();
  
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    decimals: 9,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [transactionHistory, setTransactionHistory] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'decimals' ? parseInt(value) : value
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Token name is required');
      return false;
    }
    if (!formData.symbol.trim()) {
      setError('Token symbol is required');
      return false;
    }
    if (formData.decimals < 0 || formData.decimals > 9) {
      setError('Decimals must be between 0 and 9');
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

    await createToken();
  };

  const getMinimumBalanceForRentExemptMint = async (connection) => {
    return await connection.getMinimumBalanceForRentExemption(MINT_SIZE);
  };

  const createToken = async () => {
    if (!publicKey || !signTransaction) {
      toast.error('Wallet not connected');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const mintKeypair = Keypair.generate();
      const lamports = await getMinimumBalanceForRentExemptMint(connection);

      const { blockhash: recentBlockhash } = await connection.getLatestBlockhash();

      // console.log("Token creation: Mint account generated", mintAccount.publicKey.toString());
      console.log("Token creation: Wallet public key", publicKey.toString());


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
          formData.decimals,
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

      // Create token metadata to return to the parent component
      const tokenData = {
        name: formData.name,
        symbol: formData.symbol,
        decimals: formData.decimals,
        address: mintKeypair.publicKey.toString(),
        associatedTokenAccount: ata.toString()
      };

      setTransactionHistory(prev => 
        prev.map(tx => 
          tx.signature === signature ? { ...tx, status: 'confirmed' } : tx
        )
      );

      // toast.success(`Token ${formData.name} (${formData.symbol}) created successfully!`);
      
      // Call the onSuccess callback with token data
      if (onSuccess) {
        onSuccess(tokenData);
      }
      
      // Reset form
      setFormData({
        name: '',
        symbol: '',
        decimals: 9
      });
      
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

  return (
    <Card >

            <h1 className="text-3xl font-bold mb-6 flex items-center text-indigo-600   ">
              <FiAward className="mr-2 text-indigo-600" />
              Create New Token
            </h1>
    
      <p className="text-gray-600 mb-4">Create a new token on the Solana blockchain.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Token Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="My Token"
          required
        />
        
        <Input
          label="Token Symbol"
          name="symbol"
          value={formData.symbol}
          onChange={handleChange}
          placeholder="MTK"
          required
        />
        
        <Input
          label="Decimals"
          name="decimals"
          type="number"
          value={formData.decimals}
          onChange={handleChange}
          min={0}
          max={9}
          required
        />
        
        {error && <p className="text-red-500">{error}</p>}
        
        <button 
          type="submit" 
          disabled={!publicKey || isLoading}
          className={` h-12 w-full hover:cursor-pointer bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-indigo-500 ${isLoading ? 'opacity-70' : ''}`}
        >
          {isLoading ? 'Creating...' : 'Create Token'}
        </button>
      </form>
    </Card>
  );
};

export default CreateTokenForm;
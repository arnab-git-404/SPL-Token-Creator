import {
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  clusterApiUrl,
  Connection,
  Keypair,
} from "@solana/web3.js";
import {
  getMint,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  MintLayout,
  AccountLayout, // Added missing import
  getAssociatedTokenAddress, // Added for more efficient token account handling
  createMintToCheckedInstruction, // Better than deprecated methods
  createAssociatedTokenAccountInstruction, // Added for proper token account setup
} from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import * as splToken from '@solana/spl-token';

// Create a Solana connection to the devnet
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

// Function to airdrop SOL to a wallet for testing
export const requestAirdrop = async (publicKey) => {
  try {
    const signature = await connection.requestAirdrop(
      publicKey,
      LAMPORTS_PER_SOL
    );
    await connection.confirmTransaction(signature);
    return { success: true, signature };
  } catch (error) {
    console.error("Error requesting airdrop:", error);
    return { success: false, error: error.message };
  }
};

// Function to create a new token
export const createToken = async (wallet, name, symbol, decimals = 9) => {
  if (!wallet.publicKey) {
    throw new Error("Wallet not connected");
  }
  
  const payer = {
    publicKey: wallet.publicKey,
    signTransaction: wallet.signTransaction
  };

  try {
    // Create mint transaction
    const mintKeypair = Keypair.generate();
    const mintPubkey = mintKeypair.publicKey;

    // Use the SPL Token program to create the mint
    const mintTransaction = new Transaction();

    // Add necessary system instruction to create account
    const lamports = await connection.getMinimumBalanceForRentExemption(
      splToken.MintLayout.span
    );

    mintTransaction.add(
      // First create account - Fix: use toString() properly on wallet.publicKey without conversion
      SystemProgram.createAccount({
        fromPubkey: wallet.publicKey,
        newAccountPubkey: mintPubkey,
        space: splToken.MintLayout.span,
        lamports,
        programId: splToken.TOKEN_PROGRAM_ID,
      })
    );

    // Create token mint account
    mintTransaction.add(
      splToken.createInitializeMint2Instruction(
        mintPubkey,
        decimals,
        payer.publicKey,
        payer.publicKey,
        splToken.TOKEN_PROGRAM_ID
      )
    );

    // Set recent blockhash
    mintTransaction.recentBlockhash = (
      await connection.getLatestBlockhash()
    ).blockhash;

    // Set fee payer
    mintTransaction.feePayer = payer.publicKey;

    // Setup partial sign with the mint keypair
    mintTransaction.partialSign(mintKeypair);

    // Get wallet to sign transaction
    const signedTransaction = await payer.signTransaction(mintTransaction);

    // Send the transaction
    const transactionId = await connection.sendRawTransaction(
      signedTransaction.serialize()
    );

    // Wait for confirmation
    await connection.confirmTransaction(transactionId);

    console.log(`Token mint created: ${mintPubkey.toString()}`);

    return {
      tokenMint: mintPubkey,
      tokenName: name,
      tokenSymbol: symbol,
      tokenDecimals: decimals,
    };
  } catch (error) {
    console.error("Error creating token:", error);
    throw error;
  }
};

// Function to mint tokens - Updated to use modern SPL Token methods
export const mintToken = async (
  wallet,
  tokenAddress,
  amount,
  recipientAddress = null
) => {
  if (!wallet.publicKey) {
    throw new Error("Wallet not connected");
  }

  try {
    const mintPublicKey = new PublicKey(tokenAddress);
    const recipient = recipientAddress
      ? new PublicKey(recipientAddress)
      : wallet.publicKey;

    // Get the token mint information to determine decimals
    const mintInfo = await splToken.getMint(
      connection,
      mintPublicKey,
      'confirmed',
      TOKEN_PROGRAM_ID
    );

    // Get the associated token account for the recipient or create it if it doesn't exist
    const associatedTokenAccount = await getAssociatedTokenAddress(
      mintPublicKey,
      recipient,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    const mintTransaction = new Transaction();

    // Check if the token account exists
    const accountInfo = await connection.getAccountInfo(associatedTokenAccount);
    if (!accountInfo) {
      // Create the associated token account if it doesn't exist
      mintTransaction.add(
        createAssociatedTokenAccountInstruction(
          wallet.publicKey,
          associatedTokenAccount,
          recipient,
          mintPublicKey,
          TOKEN_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID
        )
      );
    }

    // Calculate the token amount based on decimals
    const mintAmount = amount * Math.pow(10, mintInfo.decimals);

    // Add mint instruction
    mintTransaction.add(
      splToken.createMintToInstruction(
        mintPublicKey,
        associatedTokenAccount,
        wallet.publicKey,
        BigInt(mintAmount),
        [],
        TOKEN_PROGRAM_ID
      )
    );

    // Set recent blockhash and fee payer
    mintTransaction.recentBlockhash = (
      await connection.getLatestBlockhash()
    ).blockhash;
    mintTransaction.feePayer = wallet.publicKey;

    // Sign the transaction
    const signedTransaction = await wallet.signTransaction(mintTransaction);

    // Send the transaction
    const signature = await connection.sendRawTransaction(
      signedTransaction.serialize()
    );

    // Wait for confirmation
    await connection.confirmTransaction(signature);

    return {
      success: true,
      signature,
      mint: mintPublicKey.toString(),
      recipient: recipient.toString(),
      amount,
    };
  } catch (error) {
    console.error("Error minting token:", error);
    throw error;
  }
};

// Function to send tokens - Updated to use modern SPL Token methods
export const sendToken = async (
  wallet,
  tokenAddress,
  amount,
  destinationAddress
) => {
  if (!wallet.publicKey) {
    throw new Error("Wallet not connected");
  }

  try {
    const mintPublicKey = new PublicKey(tokenAddress);
    const destinationPublicKey = new PublicKey(destinationAddress);

    // Get mint info
    const mintInfo = await splToken.getMint(
      connection, 
      mintPublicKey,
      'confirmed',
      TOKEN_PROGRAM_ID
    );

    // Get the associated token addresses
    const senderTokenAccount = await getAssociatedTokenAddress(
      mintPublicKey,
      wallet.publicKey,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    const destinationTokenAccount = await getAssociatedTokenAddress(
      mintPublicKey,
      destinationPublicKey,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    // Create transaction
    const transaction = new Transaction();

    // Check if destination token account exists
    const destinationAccountInfo = await connection.getAccountInfo(destinationTokenAccount);
    if (!destinationAccountInfo) {
      // Create the destination token account if it doesn't exist
      transaction.add(
        createAssociatedTokenAccountInstruction(
          wallet.publicKey,
          destinationTokenAccount,
          destinationPublicKey,
          mintPublicKey,
          TOKEN_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID
        )
      );
    }

    // Calculate the token amount based on decimals
    const transferAmount = amount * Math.pow(10, mintInfo.decimals);

    // Add transfer instruction
    transaction.add(
      splToken.createTransferInstruction(
        senderTokenAccount,
        destinationTokenAccount,
        wallet.publicKey,
        BigInt(transferAmount),
        [],
        TOKEN_PROGRAM_ID
      )
    );

    // Set recent blockhash and fee payer
    transaction.recentBlockhash = (
      await connection.getLatestBlockhash()
    ).blockhash;
    transaction.feePayer = wallet.publicKey;

    // Sign and send the transaction
    const signedTransaction = await wallet.signTransaction(transaction);
    const signature = await connection.sendRawTransaction(
      signedTransaction.serialize()
    );

    // Wait for confirmation
    await connection.confirmTransaction(signature);

    return {
      success: true,
      signature,
      source: wallet.publicKey.toString(),
      destination: destinationAddress,
      amount,
    };
  } catch (error) {
    console.error("Error sending token:", error);
    throw error;
  }
};

// Function to fetch user tokens - Fixed to use correct imports and modern methods
export const fetchUserTokens = async (publicKey) => {
  if (!publicKey) {
    throw new Error("Wallet not connected");
  }

  try {
    const tokenAccounts = await connection.getTokenAccountsByOwner(
      publicKey, 
      {
        programId: TOKEN_PROGRAM_ID,
      }
    );

    const tokens = [];
    for (const { pubkey, account } of tokenAccounts.value) {
      const accountInfo = account.data;
      const tokenAccountInfo = AccountLayout.decode(accountInfo);

      // Get mint and amount
      const mint = new PublicKey(tokenAccountInfo.mint);
      
      // Get token info - using modern API
      const mintInfo = await splToken.getMint(
        connection,
        mint,
        'confirmed',
        TOKEN_PROGRAM_ID
      );

      // Convert amount from raw to decimal representation
      const rawAmount = tokenAccountInfo.amount;
      const decimals = mintInfo.decimals;
      const amount = Number(rawAmount) / Math.pow(10, decimals);

      tokens.push({
        mint: mint.toString(),
        tokenAccount: pubkey.toString(),
        amount,
        decimals,
      });
    }

    return tokens;
  } catch (error) {
    console.error("Error fetching user tokens:", error);
    throw error;
  }
};

// Helper function to check if a transaction is confirmed
export const confirmTransaction = async (signature) => {
  try {
    await connection.confirmTransaction(signature, "confirmed");
    return true;
  } catch (error) {
    console.error("Error confirming transaction:", error);
    return false;
  }
};

// Helper function to get transaction details
export const getTransactionDetails = async (signature) => {
  try {
    const transaction = await connection.getTransaction(signature, {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 0,
    });
    return transaction;
  } catch (error) {
    console.error("Error getting transaction details:", error);
    throw error;
  }
};

// Helper to format public key
export const formatPublicKey = (publicKey, length = 4) => {
  if (!publicKey) return "";
  const pkString = typeof publicKey === 'string' ? publicKey : publicKey.toString();
  return `${pkString.slice(0, length)}...${pkString.slice(-length)}`;
};

// Check if a wallet has mint authority for a specific token
export async function checkMintAuthority(walletPublicKey, mintAddress) {
  try {
    
    const mintPubkey = new PublicKey(mintAddress);
    
    console.log("Checking mint authority for:", mintPubkey.toString());
    console.log("Wallet public key:", walletPublicKey.toString());


    // Get the mint info
    const mintInfo = await getMint(connection, mintPubkey);
    

    // Check if the wallet is the mint authority
    if (mintInfo.mintAuthority) {
      return mintInfo.mintAuthority.equals(walletPublicKey);
    }
    
    // If mintAuthority is null, no one can mint (token is frozen/immutable)
    return false;
  } catch (error) {
    console.error("Error checking mint authority:", error);
    return false;
  }
}
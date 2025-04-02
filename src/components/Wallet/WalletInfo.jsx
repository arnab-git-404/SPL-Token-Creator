// import React, { useState, useEffect } from "react";
// import { useWallet, useConnection } from "@solana/wallet-adapter-react";
// import { LAMPORTS_PER_SOL } from "@solana/web3.js";
// import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

// const WalletInfo = () => {
//   const { publicKey, disconnect } = useWallet();
//   const { connection } = useConnection();
//   const [balance, setBalance] = useState(0);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchBalance = async () => {
//       if (!publicKey) return;
//       try {
//         setLoading(true);
//         const bal = await connection.getBalance(publicKey);
//         setBalance(bal / LAMPORTS_PER_SOL);
//       } catch (error) {
//         console.error("Error fetching balance:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchBalance();
//     const id = setInterval(fetchBalance, 10000); // Refresh every 10 seconds

//     return () => clearInterval(id);
//   }, [publicKey, connection]);

//   const formatAddress = (address) => {
//     return `${address.toString().slice(0, 4)}...${address
//       .toString()
//       .slice(-4)}`;
//   };

//   return (
//     <div className="flex items-center space-x-4">
//       {publicKey ? (
//         <>
//           {" "}
//           <div className=" px-4 py-2 rounded-md flex items-center hover:border-white hover:cursor-pointer   transition-all duration-200 ease-in-out">
//             <div>
//               <p className="text-sm text-gray-300 hover:text-white  ">Wallet</p>
//               <p className="font-medium">
//                 {publicKey ? formatAddress(publicKey) : "Not connected"}
//               </p>
//             </div>
//           </div>

//           <div className=" px-4 py-2 rounded-md">
//             <p className="text-sm text-gray-300 hover:text-white">Balance</p>
//             <p className="font-medium">
//               {loading ? "Loading..." : `${balance.toFixed(4)} SOL`}
//             </p>
//           </div>

//         </>
//       ) : (
//         <></>
//       )}
//       <WalletMultiButton
//         className={`
//             !bg-gradient-to-r !from-indigo-600 !to-indigo-500 !transition-all
//             !rounded-lg !border-0 !h-auto 
//             md:!py-2 md:!px-4 
//             !py-1.5 !px-2 !text-sm md:!text-base
//             hover:!shadow-md hover:!from-indigo-700 hover:!to-indigo-600
//             flex items-center
//           `}
//       >
//         <span className="hidden md:inline">
//           {publicKey ? "Connected" : "Connect Wallet"}
//         </span>

//         <span className="md:hidden">{publicKey ? "Connected" : "Connect"}</span>
//       </WalletMultiButton>
//     </div>
//   );
// };

// export default WalletInfo;


import React, { useState, useEffect } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { FiCopy, FiCheck } from "react-icons/fi";

const WalletInfo = () => {
  const { publicKey, disconnect } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {

    const fetchBalance = async () => {
      if (!publicKey) return; 
      try {
        setLoading(true);
        const bal = await connection.getBalance(publicKey);
        setBalance(bal / LAMPORTS_PER_SOL);
      } catch (error) {
        console.error("Error fetching balance:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
    const id = setInterval(fetchBalance, 10000); 

    return () => clearInterval(id);
  }, [publicKey, connection]);


  const refreshBalance = async () => {
    if (!publicKey) return;
    try {
      setLoading(true); // Show loading state
      const bal = await connection.getBalance(publicKey);
      setBalance(bal / LAMPORTS_PER_SOL);
    } catch (error) {
      console.error("Error refreshing balance:", error);
    } finally {
      setLoading(false);
    }
  };


  const formatAddress = (address) => {
    return `${address.toString().slice(0, 4)}...${address
      .toString()
      .slice(-4)}`;
  };



  const copyAddressToClipboard = async () => {
    if (publicKey) {
      try {
        await navigator.clipboard.writeText(publicKey.toString());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error("Failed to copy address:", error);
      }
    }
  };

  return (
    <div className="flex items-center space-x-4">
      {publicKey ? (
        <>
          <div 
            onClick={copyAddressToClipboard}
            className="px-4 py-2 rounded-md flex items-center border border-transparent hover:border-white hover:cursor-pointer transition-all duration-200 ease-in-out"
            title="Click to copy address"
          >
            <div>
              <p className="text-sm text-gray-300 hover:text-white flex items-center">
                Wallet {copied ? <FiCheck className="ml-1 text-green-400" /> : <FiCopy className="ml-1" />}
              </p>
              <p className="font-medium">
                {publicKey ? formatAddress(publicKey) : "Not connected"}
              </p>
            </div>
          </div>

          <div 
          onClick={ refreshBalance }
          className="px-4 py-2 rounded-md border border-transparent hover:border-white hover:cursor-pointer transition-all duration-200 ease-in-out "  >
            <p className="text-sm text-gray-300 hover:text-white">Balance</p>
            <p className="font-medium">
              {loading ? "Loading..." : `${balance.toFixed(4)} SOL`}
            </p>
          </div>
        </>
      ) : (
        <></>
      )}
      <WalletMultiButton
        className={`
            !bg-gradient-to-r !from-indigo-600 !to-indigo-500 !transition-all
            !rounded-lg !border-0 !h-auto 
            md:!py-2 md:!px-4 
            !py-1.5 !px-2 !text-sm md:!text-base
            hover:!shadow-md hover:!from-indigo-700 hover:!to-indigo-600
            flex items-center
          `}
      >
        <span className="hidden md:inline">
          {publicKey ? "Connected" : "Connect Wallet"}
        </span>

        <span className="md:hidden">{publicKey ? "Connected" : "Connect"}</span>
      </WalletMultiButton>
    </div>
  );
};

export default WalletInfo;
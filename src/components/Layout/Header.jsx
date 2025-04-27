
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import WalletInfo from "../Wallet/WalletInfo";
import { HiMenu, HiX } from "react-icons/hi";
import WalletConnectButton from "../Wallet/WalletConnectButton";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useMediaQuery } from "react-responsive";
import { SiSolana } from "react-icons/si";
import { FaCoins } from 'react-icons/fa';


const Header = () => {
  const { connected, publicKey, disconnect } = useWallet();
  const { connection } = useConnection();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  const isMobile = useMediaQuery({ maxWidth: 767 });
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 991 });

  // Fixed: using useEffect to handle the sidebar state based on responsive conditions
  useEffect(() => {
    if (isMobile && isTablet) {
      setIsSidebarOpen(true);
    }
  }, [isMobile, isTablet]);

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
    const id = setInterval(fetchBalance, 10000); // Refresh every 10 seconds

    return () => clearInterval(id);
  }, [publicKey, connection]);


  const navLinks = [
    
    { path: "/home", label: "Home" },
    { path: "/create-token", label: "Create Token" },
    { path: "/burn-token", label: "Burn Token" },
    { path: "/mint-token", label: "Mint Token" },
    { path: "/send-token", label: "Send Token" },
    { path: "/transactions", label: "Transactions" },

  ];


  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };


  // Close sidebar when clicking outside
  const handleOutsideClick = () => {
    setIsSidebarOpen(false);
  };


  // Prevent body scrolling when sidebar is open
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isSidebarOpen]);

  const formatAddress = (address) => {
    if (!address) return "Not connected";
    return `${address.toString().slice(0, 4)}...${address
      .toString()
      .slice(-4)}`;
  };

  return (
    <header className="border-b border-gray-700 bg-gray-900/50 backdrop-blur-sm relative z-30">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8 text-white">

            <Link to="/" className="text-2xl font-bold flex items-center">
              <SiSolana className="mr-2 text-purple-500" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-cyan-400 to-green-400">
                Solana Token Creator
              </span>
            
            
            </Link>

            {connected && (
              <nav className="hidden md:flex space-x-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="text-gray-300 hover:text-white relative group"
                  >
                    <span>{link.label}</span>
                    <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gray-300 group-hover:bg-indigo-500 group-hover:w-full group-hover:left-0 transition-all duration-300 transform -translate-x-1/2 group-hover:translate-x-0"></span>
                  </Link>
                ))}
              </nav>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {connected && !isMobile && <WalletInfo />}

            {/* Hamburger menu icon - only visible on mobile when connected */}
            {connected && (
              <button
                className="md:hidden p-2 rounded-md text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={toggleSidebar}
                aria-label="Open mobile menu"
              >
                <HiMenu className="h-6 w-6" />
              </button>
            )}

            {!connected ? <WalletInfo /> : ""}
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      {isSidebarOpen && (
        <div className="fixed top-0 right-0 h-full w-64 bg-gray-800 z-50 md:hidden transition-transform duration-300 ease-in-out translate-x-0">
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h2 className="text-lg font-medium text-white">Menu</h2>

            <button
              className="text-white hover:text-gray-300 focus:outline-none"
              onClick={toggleSidebar}
              aria-label="Close menu"
            >
              <HiX className="h-6 w-6" />
            </button>
          </div>

          <nav className="flex flex-col w-full space-y-2 p-4 bg-gray-700 ">
            <div className="px-4 py-3 rounded-md bg-gray-700">
              <p className="text-sm text-gray-300">Balance</p>
              <p className="font-medium text-white">
                {loading ? "Loading..." : `${balance.toFixed(4)} SOL`}
              </p>
            </div>

            <div className="px-4 py-3 rounded-md bg-gray-700">
              <p className="text-sm text-gray-300">Wallet</p>
              <p className="font-medium text-white">
                {formatAddress(publicKey)}
              </p>
            </div>

            <div className="space-y-1 mt-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="block py-3 px-4 text-white font-medium bg-gray-700 hover:bg-gray-600 rounded-md transition-colors duration-200"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <button
              className="mt-2 px-4 py-3 rounded-md bg-red-700 hover:bg-red-600 text-white font-medium transition-colors duration-200"
              onClick={disconnect}
            >
              Disconnect
            </button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;

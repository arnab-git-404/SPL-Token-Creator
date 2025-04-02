import React, { useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';

// Import styles for wallet modal
import '@solana/wallet-adapter-react-ui/styles.css';

// Import pages
import Home from './pages/Home';
import CreateToken from './pages/CreateToken';
// import { CreateToken } from './pages/CreateToken';
import MintToken from './pages/MintToken';
import SendToken from './pages/SendToken';
import TransactionHistory from './pages/TransactionHistory';

// Import layout
import Layout from './components/Layout/Layout';
import WalletConnection from './pages/WalletConnection';
import { ToastContainer } from 'react-toastify';
import {TokenProvider} from './context/TokenContext';
import { Buffer } from 'buffer';
import { Navigate } from 'react-router-dom';

window.Buffer = Buffer;

function App() {

  const network = WalletAdapterNetwork.Devnet; // Change to 'testnet' or 'mainnet-beta' as needed
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  
  // Initialize wallets
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <TokenProvider>
          <Router>
            <Layout>
              <ToastContainer />
              <Routes>

                
                <Route path="/" element={<Home />} />
                <Route path="/create-token" element={<CreateToken />} />
                {/* <Route path="/mint-token" element={<WalletConnection />} /> */}
                <Route path="/mint-token" element={<MintToken />} />
                <Route path="/send-token" element={<SendToken />} />
                <Route path="/transactions" element={<TransactionHistory />} />
     
                <Route path="*" element={<Navigate to="/" />} />

              </Routes>
            </Layout>
          </Router>
          </TokenProvider>  
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;
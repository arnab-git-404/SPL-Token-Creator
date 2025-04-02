import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-solana-dark text-white py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p>Solana Token Creator &copy; {new Date().getFullYear()}</p>
          </div>
          <div className="flex space-x-4">
            <a href="https://solana.com" target="_blank" rel="noopener noreferrer" className="hover:text-solana-green">
              Solana
            </a>
            <a href="https://phantom.app" target="_blank" rel="noopener noreferrer" className="hover:text-solana-green">
              Phantom
            </a>
            <a href="https://solflare.com" target="_blank" rel="noopener noreferrer" className="hover:text-solana-green">
              Solflare
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
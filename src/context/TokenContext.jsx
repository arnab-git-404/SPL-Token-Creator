import React, { createContext, useContext, useState } from 'react';

const TokenContext = createContext();

export const TokenProvider = ({ children }) => {
  const [tokenData, setTokenData] = useState(null);
  const [connected, setConnected] = useState(false);


  const updateTokenData = (data) => {
    setTokenData(data);
  };

  const clearTokenData = () => {
    setTokenData(null);
  };


  return (
    <TokenContext.Provider value={{ tokenData, updateTokenData, clearTokenData, connected, setConnected }}>
      {children}
    </TokenContext.Provider>
  );
};

export const useTokenContext = () => useContext(TokenContext);
import React from 'react';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ children }) => {
  return (
    <div className=" min-h-screen flex flex-col bg-gradient-to-b from-gray-900 to-gray-800 text-white ">
      <Header />   
         
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>

      <Footer />
    </div>
  );
};

export default Layout;
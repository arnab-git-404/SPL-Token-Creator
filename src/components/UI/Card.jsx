import React from 'react';

const Card = ({ children, title, className = '' }) => {
  return (
    <div className={`bg-gray-50 p-6 rounded-lg shadow`}>
      
      {title && <h2 className="text-xl font-bold mb-4 text-gray-800 ">{title}</h2>}
      {children}
    </div>
  );
};

export default Card;
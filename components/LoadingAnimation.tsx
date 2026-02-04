
import React from 'react';

const LoadingAnimation: React.FC = () => {
  return (
    <div className="flex items-center space-x-2 p-4">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
      </div>
      <span className="text-xs font-medium text-purple-600 animate-pulse">Lumina is thinking...</span>
    </div>
  );
};

export default LoadingAnimation;

import React from 'react';

const HangmanFigure = ({ wrongGuesses }) => {
  const errors = wrongGuesses;
  
  return (
    <div className="relative w-48 h-48">
      {/* Base */}
      <div className="absolute bottom-0 w-32 h-2 transform -translate-x-1/2 bg-gray-800 left-1/2"></div>
      
      {/* Pole */}
      <div className="absolute bottom-0 w-2 h-48 transform -translate-x-1/2 bg-gray-800 left-1/2"></div>
      
      {/* Top bar */}
      <div className="absolute top-0 w-32 h-2 bg-gray-800 left-1/2"></div>
      
      {/* Rope */}
      <div className="absolute top-0 right-0 w-8 h-10 bg-gray-800"></div>
      
      {/* Head */}
      {errors > 0 && (
        <div className="absolute right-0 w-10 h-10 border-4 border-gray-800 rounded-full top-10"></div>
      )}
      {/* Body */}
      {errors > 1 && (
        <div className="absolute w-2 h-20 bg-gray-800 top-20 right-4"></div> 
      )}
      
      {/* Left Arm */}
      {errors > 2 && (
        <div className="absolute w-10 h-2 origin-right transform -rotate-45 bg-gray-800 top-24 right-5"></div>
      )}
      
      {/* Right Arm */}
      {errors > 3 && (
        <div className="absolute w-10 h-2 origin-left transform rotate-45 bg-gray-800 top-24 right-[-18px]"></div>
      )}
      
      {/* Left Leg */}
      {errors > 4 && (
        <div className="absolute w-10 h-2 origin-right transform -rotate-45 bg-gray-800 top-36 right-5"></div>
      )}
      
      {/* Right Leg */}
      {errors > 5 && (
        <div className="absolute w-10 h-2 origin-left transform rotate-45 bg-gray-800 top-36 right-[-18px]"></div>
      )}
    </div>
  );
};

export default HangmanFigure;
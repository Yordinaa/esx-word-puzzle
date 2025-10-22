import React from 'react';

const HangmanFigure = ({ wrongGuesses }) => {
  const errors = wrongGuesses;
  
  return (
    <div className="relative h-48 w-48">
      {/* Base */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-2 bg-gray-800"></div>
      
      {/* Pole */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2 h-48 bg-gray-800"></div>
      
      {/* Top bar */}
      <div className="absolute top-0 left-1/2 w-32 h-2 bg-gray-800"></div>
      
      {/* Rope */}
      <div className="absolute top-0 right-0 w-8 h-10 bg-gray-800"></div>
      
      {/* Head */}
      {errors > 0 && (
        <div className="absolute top-10 right-2 w-10 h-10 rounded-full border-4 border-gray-800"></div>
      )}
      
      {/* Body */}
      {errors > 1 && (
        <div className="absolute top-20 right-6 w-2 h-16 bg-gray-800"></div>
      )}
      
      {/* Left Arm */}
      {errors > 2 && (
        <div className="absolute top-24 right-6 w-10 h-2 bg-gray-800 transform -rotate-45 origin-center"></div>
      )}
      
      {/* Right Arm */}
      {errors > 3 && (
        <div className="absolute top-24 right-6 w-10 h-2 bg-gray-800 transform rotate-45 origin-left"></div>
      )}
      
      {/* Left Leg */}
      {errors > 4 && (
        <div className="absolute top-36 right-6 w-10 h-2 bg-gray-800 transform -rotate-45 origin-right"></div>
      )}
      
      {/* Right Leg */}
      {errors > 5 && (
        <div className="absolute top-36 right-6 w-10 h-2 bg-gray-800 transform rotate-45 origin-left"></div>
      )}
    </div>
  );
};

export default HangmanFigure;

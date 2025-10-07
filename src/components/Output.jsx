import React from 'react';

const Output = ({ word, guessed }) => {
  const displayWord = word.split('').map((letter, index) => {
    const isSpace = letter === ' ';
    const isPunctuation = /[^A-Z]/.test(letter);
    const isGuessed = guessed.has(letter) || isSpace || isPunctuation;
    
    return (
      <span 
        key={index} 
        className={`inline-block w-8 h-10 mx-1 text-2xl font-bold text-center border-b-2 ${
          isSpace ? 'border-transparent' : 'border-gray-300'
        }`}
      >
        {isGuessed ? letter : ''}
      </span>
    );
  });

  return (
    <div className="flex justify-center items-center flex-wrap">
      {displayWord}
    </div>
  );
};

export default Output;

import React from 'react';

const Letters = ({ onLetterClick, guessed, wrongGuesses, disabled }) => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  return (
    <div className="flex flex-wrap justify-center gap-2">
      {alphabet.map((letter) => {
        const isGuessed = guessed.has(letter);
        const isWrong = wrongGuesses.has(letter);
        let buttonClass = "w-10 h-10 flex items-center justify-center rounded-md font-bold ";
        
        if (isGuessed) {
          buttonClass += "bg-green-100 text-green-800 cursor-default";
        } else if (isWrong) {
          buttonClass += "bg-red-100 text-red-800 cursor-default";
        } else if (disabled) {
          buttonClass += "bg-gray-200 text-gray-400 cursor-not-allowed";
        } else {
          buttonClass += "bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer";
        }

        return (
          <button
            key={letter}
            className={buttonClass}
            onClick={() => onLetterClick(letter)}
            disabled={isGuessed || isWrong || disabled}
          >
            {letter}
          </button>
        );
      })}
    </div>
  );
};

export default Letters;

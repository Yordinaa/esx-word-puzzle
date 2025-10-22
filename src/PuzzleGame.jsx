import React, { useState, useEffect } from "react";
import HangmanFigure from "./components/hangman-figure.jsx";
import Letters from "./components/Letters";
import Output from "./components/Output";
import words from "./components/words";

const MAX_WRONG_GUESSES = 6;

function PuzzleGame() {
  const [gameState, setGameState] = useState({
    currentWord: null,
    guessed: new Set(),
    wrongGuesses: new Set(),
    status: "playing", // playing | won | lost
    showHint: false,
    wins: Number(localStorage.getItem("esx_wins") || 0),
    currentStreak: 0,
    maxStreak: Number(localStorage.getItem("esx_max_streak") || 0)
  });

  // Initialize game with a random word
  useEffect(() => {
    startNewGame();
    
    // Load saved stats from localStorage
    const savedWins = Number(localStorage.getItem("esx_wins") || 0);
    const savedMaxStreak = Number(localStorage.getItem("esx_max_streak") || 0);
    
    setGameState(prev => ({
      ...prev,
      wins: savedWins,
      maxStreak: savedMaxStreak
    }));
  }, []);

  const startNewGame = () => {
    const randomIndex = Math.floor(Math.random() * words.length);
    const word = words[randomIndex].word.toUpperCase();
    const hint = words[randomIndex].hint;
    
    setGameState(prev => ({
      ...prev,
      currentWord: { word, hint },
      guessed: new Set(),
      wrongGuesses: new Set(),
      status: "playing",
      showHint: false
    }));
  };

  // Check win/lose conditions
  useEffect(() => {
    if (!gameState.currentWord || gameState.status !== 'playing') return;
    
    const { word } = gameState.currentWord;
    const uniqueLetters = new Set(word.replace(/[^A-Z]/g, "").split(""));
    const isWon = Array.from(uniqueLetters).every(letter => 
      gameState.guessed.has(letter)
    );
    
    const isLost = gameState.wrongGuesses.size >= MAX_WRONG_GUESSES;
    
    if (isWon || isLost) {
      setGameState(prev => {
        if (isWon) {
          // When winning:
          // 1. Increment total wins by 1
          // 2. Increment current streak by 1
          // 3. Update max streak if current streak is higher
          const newWins = prev.wins + 1;
          const newCurrentStreak = prev.currentStreak + 1;
          const newMaxStreak = Math.max(prev.maxStreak, newCurrentStreak);
          
          // Save to localStorage
          localStorage.setItem("esx_wins", newWins);
          localStorage.setItem("esx_max_streak", newMaxStreak);
          
          return {
            ...prev,
            status: "won",
            wins: newWins,
            currentStreak: newCurrentStreak,
            maxStreak: newMaxStreak
          };
        } else {
          // When losing:
          // 1. Keep total wins the same
          // 2. Reset current streak to 0
          // 3. Keep max streak as is
          localStorage.setItem("esx_max_streak", prev.maxStreak);
          
          return {
            ...prev,
            status: "lost",
            currentStreak: 0
          };
        }
      });
    }
  }, [gameState.guessed, gameState.wrongGuesses, gameState.currentWord, gameState.status]);

  // Keyboard support
  useEffect(() => {
    function handleKeyDown(e) {
      if (gameState.status !== "playing") {
        if (e.key === "Enter") startNewGame();
        return;
      }
      
      const key = e.key.toUpperCase();
      if (/^[A-Z]$/.test(key)) handleGuess(key);
      if (key === "H") toggleHint();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState.status]);

  const handleGuess = (letter) => {
    if (gameState.status !== "playing" || 
        gameState.guessed.has(letter) || 
        gameState.wrongGuesses.has(letter) ||
        !gameState.currentWord) {
      return;
    }

    const { word } = gameState.currentWord;
    const isCorrect = word.includes(letter);
    
    setGameState(prev => ({
      ...prev,
      guessed: isCorrect ? new Set([...prev.guessed, letter]) : prev.guessed,
      wrongGuesses: !isCorrect ? new Set([...prev.wrongGuesses, letter]) : prev.wrongGuesses
    }));
  };

  const toggleHint = () => {
    setGameState(prev => ({
      ...prev,
      showHint: !prev.showHint
    }));
  };

  const { currentWord, guessed, wrongGuesses, status, showHint, wins, currentStreak, maxStreak } = gameState;

  if (!currentWord) return <div className="loading">Loading game...</div>;
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      <div className="w-full max-w-2xl p-6 bg-white rounded-lg shadow-lg">
        <h1 className="mb-6 text-3xl font-bold text-center text-blue-600">ESX Word Puzzle</h1>
        
        {/* Game Status */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-lg">
            <span className="font-semibold">Wins:</span> {wins}
          </div>
          <div className="text-lg">
            <span className="font-semibold">Current Streak:</span> {currentStreak}
            <span className="mx-2">|</span>
            <span className="font-semibold">Best Streak:</span> {maxStreak}
          </div>
        </div>
        
        {/* Hangman Figure */}
        <div className="flex justify-center mb-8">
          <HangmanFigure wrongGuesses={wrongGuesses.size} />
        </div>
        
        {/* Word Display */}
        <div className="mb-8 text-center">
          <Output word={currentWord.word} guessed={guessed} />
        </div>
        
        {/* Keyboard */}
        <div className="mb-6">
          <Letters 
            onLetterClick={handleGuess} 
            guessed={guessed} 
            wrongGuesses={wrongGuesses}
            disabled={status !== "playing"}
          />
        </div>
        
        {/* Hint */}
        <div className="mb-6 text-center">
          <button 
            onClick={toggleHint}
            className="px-4 py-2 text-yellow-800 transition-colors bg-yellow-100 rounded hover:bg-yellow-200"
          >
            {showHint ? 'Hide Hint' : 'Show Hint (H)'}
          </button>
          {showHint && (
            <p className="mt-2 italic text-gray-700">{currentWord.hint}</p>
          )}
        </div>
        
        {/* Game Over Message */}
        {status !== "playing" && (
          <div className="p-4 mt-6 text-center rounded-md">
            <p className={`text-xl font-bold mb-4 ${
              status === "won" ? "text-green-600" : "text-red-600"
            }`}>
              {status === "won" 
                ? "🎉 Congratulations! You won! 🎉" 
                : `Game Over! The word was: ${currentWord.word}`}
            </p>
            <button
              onClick={startNewGame}
              className="px-6 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Play Again (Press Enter)
            </button>
          </div>
        )}
        
        <div className="mt-4 text-xs text-center text-gray-400">
          <p>Press keyboard letters to guess | Press H for hint</p>
        </div>
      </div>
    </div>
  );
}

export default PuzzleGame;

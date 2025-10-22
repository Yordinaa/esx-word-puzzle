import React, { useState, useEffect, useRef } from "react";
import HangmanFigure from "./components/hangman-figure.jsx";
import Letters from "./components/Letters";
import Output from "./components/Output";
import words from "./components/words";

// Fisher-Yates shuffle algorithm
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

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
    maxStreak: Number(localStorage.getItem("esx_max_streak") || 0),
    skipped: Number(localStorage.getItem("esx_skipped") || 0)
  });

  const shuffledWords = useRef(null);
  const currentWordIndex = useRef(-1);

  // Initialize game with shuffled words
  useEffect(() => {
    // Only shuffle words once when component mounts
    if (!shuffledWords.current) {
      shuffledWords.current = shuffleArray([...words]);
    }
    
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
    // Move to next word, reshuffle if we've gone through all words
    currentWordIndex.current = (currentWordIndex.current + 1) % words.length;
    
    // If we've looped back to the start, reshuffle for next time
    if (currentWordIndex.current === 0) {
      shuffledWords.current = shuffleArray([...words]);
    }
    
    const currentWordObj = shuffledWords.current[currentWordIndex.current];
    const word = currentWordObj.word.toUpperCase();
    const hint = currentWordObj.hint;
    
    setGameState(prev => ({
      ...prev,
      currentWord: { word, hint },
      guessed: new Set(),
      wrongGuesses: new Set(),
      status: "playing",
      showHint: false,
      // Reset skipped count if we're not in the middle of a game
      ...(gameState.status === 'playing' ? {} : { skipped: prev.skipped })
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

  const handleSkip = () => {
    // Save the updated skipped count to localStorage
    const newSkipped = gameState.skipped + 1;
    localStorage.setItem("esx_skipped", newSkipped);
    
    // Update state and move to next word
    setGameState(prev => ({
      ...prev,
      skipped: newSkipped
    }));
    
    startNewGame();
  };

  const handlePlayAgain = () => {
    startNewGame();
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
        
        {/* Game Controls */}
        <div className="flex gap-2 justify-center mt-4">
          {status !== "playing" ? (
            <button
              onClick={handlePlayAgain}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Play Again
            </button>
          ) : (
            <button
              onClick={handleSkip}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Skip Word
            </button>
          )}
        </div>

        {/* Game Over Message */}
        {status !== "playing" && (
          <div className="p-4 mt-4 text-center rounded-md">
            <p className={`text-xl font-bold mb-4 ${
              status === "won" ? "text-green-600" : "text-red-600"
            }`}>
              {status === "won" 
                ? "🎉 Congratulations! You won! 🎉" 
                : `Game Over! The word was: ${currentWord.word}`}
            </p>
          </div>
        )}
        
        <div className="mt-4 text-xs text-center text-gray-400">
          <p>Press keyboard letters to guess | Press H for hint | Words skipped: {gameState.skipped}</p>
        </div>
      </div>
    </div>
  );
}

export default PuzzleGame;

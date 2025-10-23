import React, { useState, useEffect, useRef } from "react";
import HangmanFigure from "./components/hangman-figure.jsx";
import Letters from "./components/Letters";
import Output from "./components/Output";

const MAX_WRONG_GUESSES = 6;

const API_URL = "https://wordpuzzle-backend-production.up.railway.app/wordbatch";

// 
// Fisher-Yates shuffle
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

function PuzzleGame() {
  const [gameState, setGameState] = useState({
    currentWord: null,
    guessed: new Set(),
    wrongGuesses: new Set(),
    status: "loading", // loading | playing | won | lost | finished
    showHint: false,
    wins: Number(localStorage.getItem("esx_wins") || 0),
    currentStreak: Number(localStorage.getItem("esx_current_streak") || 0),
    maxStreak: Number(localStorage.getItem("esx_max_streak") || 0),
    skipped: Number(localStorage.getItem("esx_skipped") || 0),
  });

  const wordsList = useRef([]);
  const currentWordIndex = useRef(-1);

  // ✅ Fetch all words once
  useEffect(() => {
    const fetchWords = async () => {
      try {
        const res = await fetch(API_URL); // Directly using the full URL
        const data = await res.json();
        wordsList.current = shuffleArray(
          data.map((w) => ({
            word: w.word.toUpperCase(),
            hint: w.hint,
          }))
        );
        currentWordIndex.current = -1;
        startNewGame();
      } catch (err) {
        console.error("Failed to fetch words:", err);
      }
    };
    fetchWords();
  }, []);

  const startNewGame = () => {
    if (!wordsList.current.length) return;

    // ✅ Check if all words have been played
    if (currentWordIndex.current + 1 >= wordsList.current.length) {
      setGameState((prev) => ({
        ...prev,
        status: "finished",
      }));
      return;
    }

    currentWordIndex.current += 1;
    const currentWordObj = wordsList.current[currentWordIndex.current];

    setGameState((prev) => ({
      ...prev,
      currentWord: currentWordObj,
      guessed: new Set(),
      wrongGuesses: new Set(),
      status: "playing",
      showHint: false,
    }));
  };

  const restartGame = () => {
    wordsList.current = shuffleArray(wordsList.current);
    currentWordIndex.current = -1;
    startNewGame();
  };

  // ✅ Check win/loss
  useEffect(() => {
    if (!gameState.currentWord || gameState.status !== "playing") return;

    const { word } = gameState.currentWord;
    const uniqueLetters = new Set(word.replace(/[^A-Z]/g, "").split(""));
    const isWon = Array.from(uniqueLetters).every((l) => gameState.guessed.has(l));
    const isLost = gameState.wrongGuesses.size >= MAX_WRONG_GUESSES;

    if (isWon || isLost) {
      setGameState((prev) => {
        if (isWon) {
          const newWins = prev.wins + 1;
          const newCurrentStreak = prev.currentStreak + 1;
          const newMaxStreak = Math.max(prev.maxStreak, newCurrentStreak);

          localStorage.setItem("esx_wins", newWins);
          localStorage.setItem("esx_current_streak", newCurrentStreak);
          localStorage.setItem("esx_max_streak", newMaxStreak);

          return {
            ...prev,
            status: "won",
            wins: newWins,
            currentStreak: newCurrentStreak,
            maxStreak: newMaxStreak,
          };
        } else {
          localStorage.setItem("esx_current_streak", 0);
          return { ...prev, status: "lost", currentStreak: 0 };
        }
      });
    }
  }, [gameState.guessed, gameState.wrongGuesses, gameState.currentWord, gameState.status]);

  // ✅ Keyboard support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState.status === "finished" && e.key === "Enter") restartGame();
      if (gameState.status !== "playing") {
        if (e.key === "Enter") startNewGame();
        return;
      }

      const key = e.key.toUpperCase();
      if (/^[A-Z]$/.test(key)) handleGuess(key);
      if (key === "H") toggleHint();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState.status]);

  const handleGuess = (letter) => {
    if (gameState.status !== "playing" || !gameState.currentWord) return;

    const { word } = gameState.currentWord;
    const isCorrect = word.includes(letter);

    setGameState((prev) => ({
      ...prev,
      guessed: isCorrect ? new Set([...prev.guessed, letter]) : prev.guessed,
      wrongGuesses: !isCorrect ? new Set([...prev.wrongGuesses, letter]) : prev.wrongGuesses,
    }));
  };

  const handleSkip = () => {
    const newSkipped = gameState.skipped + 1;
    localStorage.setItem("esx_skipped", newSkipped);
    setGameState((prev) => ({ ...prev, skipped: newSkipped }));
    startNewGame();
  };

  const toggleHint = () =>
    setGameState((prev) => ({ ...prev, showHint: !prev.showHint }));

  const { currentWord, guessed, wrongGuesses, status, showHint, wins, currentStreak, maxStreak, skipped } = gameState;

  if (status === "loading") return <div className="loading">Loading game...</div>;

  // ✅ All words completed
  if (status === "finished") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="max-w-md p-8 text-center bg-white rounded-lg shadow-lg">
          <h1 className="mb-4 text-3xl font-bold text-green-600">
            🎉 You’ve completed all {wordsList.current.length} words! 🎉
          </h1>
          <p className="mb-6 text-gray-600">
            Fantastic job! You can restart the game to play again with reshuffled words.
          </p>
          <button
            onClick={restartGame}
            className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
          >
            Restart Game
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      <div className="w-full max-w-2xl p-6 bg-white rounded-lg shadow-lg">
        <h1 className="mb-6 text-3xl font-bold text-center text-blue-600">
          ESX Word Puzzle
        </h1>

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

        <div className="flex justify-center mb-8">
          <HangmanFigure wrongGuesses={wrongGuesses.size} />
        </div>

        <div className="mb-8 text-center">
          <Output word={currentWord.word} guessed={guessed} />
        </div>

        <div className="mb-6">
          <Letters
            onLetterClick={handleGuess}
            guessed={guessed}
            wrongGuesses={wrongGuesses}
            disabled={status !== "playing"}
          />
        </div>

        <div className="mb-6 text-center">
          <button
            onClick={toggleHint}
            className="px-4 py-2 text-yellow-800 bg-yellow-100 rounded hover:bg-yellow-200"
          >
            {showHint ? "Hide Hint" : "Show Hint (H)"}
          </button>
          {showHint && (
            <p className="mt-2 italic text-gray-700">{currentWord.hint}</p>
          )}
        </div>

        <div className="flex justify-center gap-2 mt-4">
          {status !== "playing" ? (
            <button
              onClick={startNewGame}
              className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
            >
              Play Again
            </button>
          ) : (
            <button
              onClick={handleSkip}
              className="px-4 py-2 text-white bg-gray-500 rounded hover:bg-gray-600"
            >
              Skip Word
            </button>
          )}
        </div>

        {status !== "playing" && (
          <div className="p-4 mt-4 text-center rounded-md">
            <p
              className={`text-xl font-bold mb-4 ${
                status === "won" ? "text-green-600" : "text-red-600"
              }`}
            >
              {status === "won"
                ? "🎉 Congratulations! You won! 🎉"
                : `Game Over! The word was: ${currentWord.word}`}
            </p>
          </div>
        )}

        <div className="mt-4 text-xs text-center text-gray-400">
          <p>
            Press keyboard letters to guess | Press H for hint | Words skipped:{" "}
            {skipped}
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Word {currentWordIndex.current + 1} of {wordsList.current.length}
          </p>
        </div>
      </div>
    </div>
  );
}

export default PuzzleGame;

import React, { useState, useEffect, useRef } from "react";
import HangmanFigure from "./components/hangman-figure.jsx";
import Letters from "./components/Letters";
import Output from "./components/Output";

const MAX_WRONG_GUESSES = 6;
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const API_PREFIX = import.meta.env.DEV ? '/api' : '/api';

const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};



function PuzzleGame() {
  const [difficulty, setDifficulty] = useState('beginner');
  const [gameState, setGameState] = useState({
    currentWord: null,
    guessed: new Set(),
    wrongGuesses: new Set(),
    status: "loading",
    showHint: true,
    wins: Number(localStorage.getItem("esx_wins") || 0),
    currentStreak: Number(localStorage.getItem("esx_current_streak") || 0),
    maxStreak: Number(localStorage.getItem("esx_max_streak") || 0),
    skipped: Number(localStorage.getItem("esx_skipped") || 0),
  });
 
  const [user, setUser] = useState({
  username: localStorage.getItem("username") || "",
  userId: localStorage.getItem("userId") || "",
  uscore: Number(localStorage.getItem("wins") || 0),
});

useEffect(() => {
  if(user.userId) {
    fetchUserScore(user.userId);
  }
},[user.userId]);

  const [tempName, setTempName] = useState("");



  const wordsList = useRef([]);
  const currentWordIndex = useRef(-1);

  const handleSetName = async () => {
    if (!tempName.trim()) return;

    const res = await fetch(`${API_URL}${API_PREFIX}/user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: tempName }),
    });
    const data = await res.json();
    localStorage.setItem("username", data.username);
    localStorage.setItem("userId", data.userId);
    setUser({ username: data.username, userId: data.userId});
  };


  // Fetch words based on selected difficulty
  const fetchWords = useRef(async () => {
    if(!user.username || !user.userId) return;
    try {
      // Log the difficulty being used
      console.log('Selected difficulty:', difficulty);
      
      const url = `${API_URL}${API_PREFIX}/wordbatch?difficulty=${encodeURIComponent(difficulty)}`;
      console.log('Fetching words from:', url);
      
      const res = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('API Error:', {
          status: res.status,
          statusText: res.statusText,
          errorText,
          url,
        });
        throw new Error(`HTTP error! status: ${res.status}: ${errorText}`);
      }
      
      const data = await res.json();
      console.log('API Response:', { 
        dataCount: data.length,
        status: res.status, 
        ok: res.ok,
        difficulty,
        url
      });
      
      if (!Array.isArray(data)) {
        console.error('API did not return an array:', data);
        throw new Error('Expected an array of words from the API');
      }
      
      // Log the first few words to verify difficulty
      console.log('Sample words:', data.slice(0, 3).map(w => ({
        word: w.word,
        difficulty: w.difficulty,
        length: w.word.length
      })));
      
      // Just ensure word and hint exist, no additional filtering
      const wordsToUse = data.filter(w => w && w.word && w.hint);
      
      // Process the words
      const finalWords = wordsToUse
        .filter(w => w && w.word && w.hint)
        .map(w => {
          const wordObj = {
            word: String(w.word).toUpperCase().trim(),
            hint: String(w.hint).trim()
          };
          console.log('Processing word:', wordObj);
          return wordObj;
        });

      if (finalWords.length === 0) {
        throw new Error('No valid words received from the API');
      }
      
      wordsList.current = shuffleArray(finalWords);
      currentWordIndex.current = -1;
      startNewGame();
    } catch (err) {
      console.error("Failed to fetch words:", err);
      setGameState(prev => ({ ...prev, status: "error", error: err.message }));
    }
  });

  // Load words when component mounts or difficulty changes
  useEffect(() => {
    const fetchWordsByDifficulty = async () => {
      try {
        setGameState(prev => ({ ...prev, status: "loading" }));
        
        const url = `${API_URL}${API_PREFIX}/wordbatch?difficulty=${encodeURIComponent(difficulty)}`;
        console.log('Fetching words from:', url);
        
        const res = await fetch(url, {
          headers: { 'Content-Type': 'application/json' },
        });
        
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`HTTP error! status: ${res.status}: ${errorText}`);
        }
        
        const data = await res.json();
        
        if (!Array.isArray(data)) {
          throw new Error('Expected an array of words from the API');
        }
        
        const wordsToUse = data.filter(w => w && w.word && w.hint);
        const finalWords = wordsToUse.map(w => ({
          word: String(w.word).toUpperCase().trim(),
          hint: String(w.hint || '').trim()
        }));

        if (finalWords.length === 0) {
          throw new Error('No valid words received for the selected difficulty');
        }
        
        wordsList.current = shuffleArray(finalWords);
        currentWordIndex.current = -1;
        startNewGame();
      } catch (err) {
        console.error("Failed to fetch words:", err);
        setGameState(prev => ({ 
          ...prev, 
          status: "error", 
          error: err.message 
        }));
      }
    };

    // Store the function in the ref and call it
    fetchWords.current = fetchWordsByDifficulty;
    fetchWords.current();
  }, [difficulty]);

  const startNewGame = () => {
    if (!user.username || !user.userId) return;
    console.log('Starting new game with words list:', wordsList.current);
    console.log('Current word index before increment:', currentWordIndex.current);
    
    if (!wordsList.current || !Array.isArray(wordsList.current) || wordsList.current.length === 0) {
      const errorMsg = 'No words available for the selected difficulty level';
      console.error(errorMsg, { wordsList: wordsList.current });
      setGameState(prev => ({ 
        ...prev, 
        status: "error",
        error: errorMsg 
      }));
      return;
    }
    
    if (currentWordIndex.current + 1 >= wordsList.current.length) {
      currentWordIndex.current = -1;
      setGameState(prev => ({
        ...prev,
        status: "finished",
      }));
      return;
    }
    
    currentWordIndex.current += 1;
    const currentWordObj = wordsList.current[currentWordIndex.current];
    
    if (!currentWordObj) {
      console.error('Invalid word object at index:', currentWordIndex.current);
      return;
    }

    setGameState((prev) => ({
      ...prev,
      currentWord: {
        word: String(currentWordObj.word).toUpperCase().trim(),
        hint: String(currentWordObj.hint || '').trim()
      },
      guessed: new Set(),
      wrongGuesses: new Set(),
      status: "playing",
      showHint: true,
    }));
  };

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

  const toggleHint = () => setGameState((prev) => ({ ...prev, showHint: !prev.showHint }));

  // Check win/loss conditions
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

          updateScoreOnServer(user.userId, newCurrentStreak);

          return {
            ...prev,
            status: "won",
            wins: newWins,
            currentStreak: newCurrentStreak,
            maxStreak: newMaxStreak,
          };
        } else {
          localStorage.setItem("esx_current_streak", 0);
          return { 
            ...prev, 
            status: "lost", 
            currentStreak: 0,
            showHint: true
          };
        }
      });
    }
  }, [gameState,user.username, user.userId]);

  const {status, showHint, currentStreak, maxStreak, skipped } = gameState;

  if (!user.username || !user.userId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="max-w-sm p-8 text-center bg-white rounded-lg shadow-lg">
          <h2 className="mb-4 text-2xl font-bold text-blue-600">
            Welcome to ESX Word Puzzle 🎯
          </h2>
          <p className="mb-4 text-gray-600">
            Enter your name to start and join the leaderboard:
          </p>
          <input
            type="text"
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            className="w-full px-3 py-2 mb-4 text-center border rounded"
            placeholder="Your name"
          />
          <button
            onClick={handleSetName}
            className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
          >
            Start Game
          </button>
        </div>
      </div>
    );
  }

  const updateScoreOnServer = async (userId, score) => {
  try {
    const res = await fetch(`${API_URL}${API_PREFIX}/user/score`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, score }),
    });

    const data = await res.json();
    console.log("Score updated:", data);
  } catch (err) {
    console.error("Failed to update score:", err);
  }
};

const fetchUserScore = async (userId) => {
  console.log("Fetching score for userId:", userId);
  try {
    const res = await fetch(`${API_URL}${API_PREFIX}/user/${userId}/score`);
    if (!res.ok) throw new Error("Failed to fetch score");
    const data = await res.json();
    console.log("Fetched user score:", data);
    localStorage.setItem("wins", data.score || 0);
    setUser((prev) => ({ ...prev, uscore: data.score || 0 }));
  } catch (err) {
    console.error("Error fetching user score:", err);
  }
};



  // Debug info
  console.log('Current game state:', {
    status,
    currentWord: gameState.currentWord,
    wordsListLength: wordsList.current?.length,
    currentWordIndex: currentWordIndex.current
  });

  // if (status === "loading") {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen">
  //       <div className="text-xl font-semibold">Loading game...</div>
  //     </div>
  //   );
  // }

  if (gameState.status === "error") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
        <h1 className="mb-2 text-3xl font-bold text-center text-blue-600">
          ESX Word Puzzle
        </h1>
        
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="relative w-full max-w-xs">
            <select
              value={difficulty}
              onChange={(e) => {
                console.log('Difficulty changed to:', e.target.value);
                setDifficulty(e.target.value);
              }}
              className="block w-full px-4 py-2 pr-8 text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="beginner">Beginner (≤7 letters)</option>
              <option value="intermediate">Intermediate (8-10 letters)</option>
              <option value="advanced">Advanced (11+ letters)</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 pointer-events-none">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
        
        <p className="mb-4 text-gray-700">
          {gameState.error || 'Failed to load words. Please try again later.'}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      <div className="w-full max-w-2xl p-6 bg-white rounded-lg shadow-lg">
        <h1 className="mb-2 text-3xl font-bold text-center text-blue-600">
          ESX Word Puzzle
        </h1>

        <div className="flex items-center justify-between mb-6">
          <div className="text-lg">
            <span className="font-semibold"> {user.username}</span> <br></br> 
            <span className="font-semibold">Wins:</span> {user.uscore}
          </div>
          <div className="text-lg font-medium">
            <span className="text-gray-600">Current Streak:</span> {currentStreak} 
            <span className="mx-2 text-gray-300">|</span>
            <span className="text-gray-600">Best Streak:</span> {maxStreak}
          </div>
        </div>
        
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="relative w-full max-w-xs">
            <select
              id="difficulty"
              value={difficulty}
              onChange={(e) => {
                console.log('Difficulty changed to:', e.target.value);
                setDifficulty(e.target.value);
              }}
              className="block w-full px-4 py-2 pr-10 text-base border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        {gameState.status === "finished" ? (
          <div className="text-center">
            <h2 className="mb-4 text-2xl font-bold text-green-600">
              🎉 You've completed all words! 🎉
            </h2>
            <button
              onClick={startNewGame}
              className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
            >
              Play Again
            </button>
          </div>
        ) : (
          <div className="w-full">
            <div className="flex justify-center mb-8">
              <HangmanFigure wrongGuesses={gameState.wrongGuesses.size} />
            </div>

            <div className="w-full mb-6 text-center">
              <Output word={gameState.currentWord?.word || ''} guessed={gameState.guessed} />
              
              {gameState.status === 'won' && (
                <div className="p-3 mt-4 text-green-700 bg-green-100 rounded-md">
                  🎉 Congratulations! You won! 🎉
                </div>
              )}
              
              {gameState.status === 'lost' && gameState.currentWord && (
                <div className="p-3 mt-4 text-red-700 bg-red-100 rounded-md">
                  Game Over! The word was: {gameState.currentWord.word}
                </div>
              )}
            </div>

            <div className="mb-6">
              <Letters
                onLetterClick={handleGuess}
                guessed={gameState.guessed}
                wrongGuesses={gameState.wrongGuesses}
                disabled={gameState.status !== "playing"}
              />
            </div>

            <div className="mb-6 text-center">
              <button
                onClick={toggleHint}
                className="px-4 py-2 text-yellow-800 bg-yellow-100 rounded hover:bg-yellow-200"
              >
                {gameState.showHint ? 'Hide Hint' : 'Show Hint (H)'}
              </button>
              {gameState.showHint && gameState.currentWord?.hint && (
                <p className="mt-2 text-sm text-gray-600">
                  <span className="font-medium">Hint:</span> {gameState.currentWord.hint}
                </p>
              )}
            </div>

            <div className="flex justify-end mt-4 text-sm text-gray-600">
              <div>Words Skipped: {skipped}</div>
            </div>

            <div className="flex justify-center mt-6">
              <button
                onClick={gameState.status === "playing" ? handleSkip : startNewGame}
                className={`px-4 py-2 text-white rounded ${
                  gameState.status === "playing" 
                    ? 'bg-gray-500 hover:bg-gray-600' 
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                {gameState.status === "playing" ? 'Skip Word' : 'Next Word'}
              </button>
            </div>
          </div>
        )}

        <div className="pt-4 mt-6 border-t border-gray-200">
          <div className="text-sm text-center text-gray-500">
            <p>Word {currentWordIndex.current + 1} of {wordsList.current.length}</p>
          </div>
          <p className="mt-2 text-xs text-center text-gray-400">
            Press keyboard letters to guess | Press H to {showHint ? 'hide' : 'show'} hint
          </p>
        </div>
      </div>
    </div>
  );
}

export default PuzzleGame;
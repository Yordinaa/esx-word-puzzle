import React, { useState, useMemo, useEffect } from "react";

/* ESX word bank — add more terms + hints as you learn modules */
const WORDS = [
  { word: "TRADING", hint: "Buying and selling securities" },
  { word: "BROKER", hint: "Person who executes trades for clients" },
  { word: "SETTLEMENT", hint: "Transfer of ownership and payment (T+2)" },
  { word: "CLEARING", hint: "Process that confirms obligations after a trade" },
  { word: "EQUITY", hint: "Ownership share in a company" },
  { word: "BOND", hint: "Debt instrument issued by governments/companies" },
  { word: "IPO", hint: "Initial Public Offering — selling shares to the public" },
  { word: "EXCHANGE", hint: "Organized marketplace where securities trade" },
  { word: "DIVIDEND", hint: "Payment companies give to shareholders" },
  { word: "SECURITIES", hint: "Financial instruments like stocks and bonds" },
];

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function PuzzleGame() {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * WORDS.length));
  const current = useMemo(() => WORDS[index], [index]);

  const [guessed, setGuessed] = useState(new Set()); // correct guesses
  const [wrong, setWrong] = useState(new Set()); // wrong letters
  const maxWrong = 6;

  const [showHint, setShowHint] = useState(false);
  const [status, setStatus] = useState("playing"); // playing | won | lost
  const [wins, setWins] = useState(() => Number(localStorage.getItem("esx_wins") || 0));

  // unique letters to win (ignoring non-letters)
  const uniqueLetters = useMemo(
    () => new Set(current.word.replace(/[^A-Z]/g, "").split("")),
    [current]
  );

  // Reset per-word state when index changes
  useEffect(() => {
    setGuessed(new Set());
    setWrong(new Set());
    setShowHint(false);
    setStatus("playing");
  }, [index]);

  // Keyboard support
  useEffect(() => {
    function onKey(e) {
      if (status !== "playing") return;
      const key = e.key.toUpperCase();
      if (/^[A-Z]$/.test(key)) handleGuess(key);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // we intentionally include status so it reattaches when status changes
  }, [status, guessed, wrong, current]);

  function handleGuess(letter) {
    if (status !== "playing") return;
    // prevent re-guessing
    if (guessed.has(letter) || wrong.has(letter)) return;

    if (current.word.includes(letter)) {
      // correct
      setGuessed((prev) => {
        const next = new Set(prev);
        next.add(letter);
        // check win
        const allGuessed = [...uniqueLetters].every((l) => next.has(l));
        if (allGuessed) {
          setStatus("won");
          const newWins = wins + 1;
          setWins(newWins);
          localStorage.setItem("esx_wins", String(newWins));
        }
        return next;
      });
    } else {
      // wrong
      setWrong((prev) => {
        const next = new Set(prev);
        next.add(letter);
        if (next.size >= maxWrong) {
          setStatus("lost");
        }
        return next;
      });
    }
  }

  function nextWord() {
    let next = Math.floor(Math.random() * WORDS.length);
    if (next === index) next = (next + 1) % WORDS.length;
    setIndex(next);
  }

  function resetScore() {
    setWins(0);
    localStorage.removeItem("esx_wins");
  }

  // masked display
  const masked = current.word.split("").map((ch, i) => {
    if (ch === " ") return " ";
    return guessed.has(ch) || status === "lost" ? ch : "_";
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow p-6">
        <div className="flex justify-between items-start">
          <h1 className="text-2xl font-bold">ESX Word Puzzle</h1>
          <div className="text-sm text-gray-600">Wins: <span className="font-semibold">{wins}</span></div>
        </div>

        <p className="mt-2 text-gray-600">
          Guess the ESX term — choose letters or press keys on your keyboard. Wrong attempts left:
          <span className="font-semibold ml-1">{maxWrong - wrong.size}</span>
        </p>

        {/* Masked word */}
        <div className="mt-6 flex justify-center">
          <div className="flex flex-wrap gap-2 items-center">
            {masked.map((ch, i) => (
              <div
                key={i}
                className="w-10 h-12 flex items-center justify-center border-b-2 border-gray-300 text-lg bg-white"
              >
                {ch}
              </div>
            ))}
          </div>
        </div>

        {/* On-screen keyboard */}
        <div className="mt-6">
          <div className="grid grid-cols-7 gap-2">
            {ALPHABET.map((letter) => {
              const used = guessed.has(letter) || wrong.has(letter);
              const correct = guessed.has(letter);
              return (
                <button
                  key={letter}
                  onClick={() => handleGuess(letter)}
                  disabled={used || status !== "playing"}
                  className={
                    "py-2 rounded focus:outline-none " +
                    (used
                      ? correct
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                      : "bg-gray-100 hover:bg-gray-200")
                  }
                  aria-label={`Letter ${letter}`}
                >
                  {letter}
                </button>
              );
            })}
          </div>
        </div>

        {/* Controls and status */}
        <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex gap-2">
            <button onClick={() => setShowHint((s) => !s)} className="px-3 py-2 bg-blue-600 text-white rounded">Hint</button>
            <button onClick={nextWord} className="px-3 py-2 bg-yellow-500 text-white rounded">Next</button>
            <button onClick={resetScore} className="px-3 py-2 bg-gray-200 rounded">Reset Score</button>
            <button onClick={() => { setIndex(index); setShowHint(false); setGuessed(new Set()); setWrong(new Set()); setStatus("playing"); }} className="px-3 py-2 bg-indigo-100 rounded">Restart Word</button>
          </div>

          <div className="text-sm text-gray-500">
            <span className="mr-2">Status:</span>
            <span className={
              "font-semibold " +
              (status === "won" ? "text-green-600" : status === "lost" ? "text-red-600" : "text-gray-700")
            }>
              {status.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Hint / results */}
        {showHint && <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded">Hint: {current.hint}</div>}
        {status === "lost" && <div className="mt-4 p-3 bg-red-50 text-red-800 rounded">You lost — the word was <strong>{current.word}</strong></div>}
        {status === "won" && <div className="mt-4 p-3 bg-green-50 text-green-800 rounded">Nice! You found the word: <strong>{current.word}</strong></div>}

        <div className="mt-4 text-xs text-gray-400">Tip: Press keyboard letters to guess. Add more words in <code className="bg-gray-100 px-1 rounded">src/PuzzleGame.jsx</code>.</div>
      </div>
    </div>
    
  );
}

export default PuzzleGame;

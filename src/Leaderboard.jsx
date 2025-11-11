import React, { useState, useEffect } from 'react';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const response = await fetch(`${API_URL}/api/leaderboard?limit=5`); // Get top 5
        
        if (!response.ok) {
          throw new Error('Failed to fetch leaderboard');
        }
        
        const data = await response.json();
        setLeaderboard(data);
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
        setError("Failed to load leaderboard");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) return <div className="py-2 text-center">Loading leaderboard...</div>;
  if (error) return <div className="py-2 text-center text-red-500">{error}</div>;

  return (
    <div className="p-4 mt-8 bg-white rounded-lg shadow-md">
      <h3 className="mb-3 text-lg font-bold text-center">🏆 Leaderboard</h3>
      <div className="space-y-2">
        {leaderboard.map((entry, index) => (
          <div key={index} className="flex items-center justify-between px-2 py-1">
            <div className="flex items-center">
              <span className="w-6 text-center">
                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
              </span>
              <span className="ml-2">{entry.username}</span>
            </div>
            <span className="font-medium">{entry.score} pts</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;
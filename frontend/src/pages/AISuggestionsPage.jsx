// frontend/src/pages/AISuggestionsPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AISuggestionsPage() {
  const [insights, setInsights] = useState([]); // New state for insights
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const token = userInfo?.token;

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
  }, [token, navigate]);

  const fetchSuggestions = async () => {
    setError('');
    setInsights([]); // Clear previous insights
    setSuggestions([]); // Clear previous suggestions
    setLoading(true);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const { data } = await axios.get('http://localhost:5000/api/ai/habit-suggestions', config);
      setInsights(data.insights || []);
      setSuggestions(data.suggestions || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch AI suggestions. Make sure you have some productivity data logged!');
      if (err.response?.status === 401) {
          navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-4xl font-bold mb-6 text-center">AI Habit Suggestions</h1>

      <div className="card bg-base-100 shadow-xl mb-8 p-6">
        <p className="mb-4 text-center">
          Click the button below to get personalized insights and habit suggestions based on your
          Pomodoro sessions, habit tracking, and completed to-dos from the last 30 days.
        </p>
        <div className="form-control mt-4">
          <button
            onClick={fetchSuggestions}
            className="btn btn-primary btn-lg"
            disabled={loading}
          >
            {loading ? <span className="loading loading-spinner"></span> : 'Get AI Insights & Suggestions'}
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error shadow-lg mb-4">
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>{error}</span>
          </div>
        </div>
      )}

      {(insights.length > 0 || suggestions.length > 0) && (
        <div className="card bg-base-100 shadow-xl p-6 mb-6">
          {insights.length > 0 && (
            <>
              <h2 className="card-title text-2xl mb-3">Insights:</h2>
              <ul className="list-disc list-inside space-y-2 mb-4">
                {insights.map((insight, index) => (
                  <li key={`insight-${index}`} className="text-lg">{insight}</li>
                ))}
              </ul>
            </>
          )}

          {suggestions.length > 0 && (
            <>
              <h2 className="card-title text-2xl mb-3">Personalized Habit Suggestions:</h2>
              <ul className="list-decimal list-inside space-y-3">
                {suggestions.map((suggestion, index) => (
                  <li key={`suggestion-${index}`} className="text-lg">
                    {suggestion}
                    {/* Add a button here to easily add a suggested habit to the habit tracker */}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      {insights.length === 0 && suggestions.length === 0 && !loading && !error && (
          <p className="text-center text-lg text-base-content/70">Insights and suggestions will appear here after you click the button.</p>
      )}
    </div>
  );
}

export default AISuggestionsPage;
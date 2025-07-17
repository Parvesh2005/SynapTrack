import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import TodoPage from './pages/TodoPage'; // We'll create this
import HabitPage from './pages/HabitPage';
import PomodoroPage from './pages/PomodoroPage';
import AISuggestionsPage from './pages/AISuggestionsPage';
import ReportPage from './pages/ReportPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-base-200 text-base-content">
        <nav className="navbar bg-base-100 shadow-lg">
          <div className="container mx-auto">
            <div className="flex-1">
              <Link to="/" className="btn btn-ghost text-xl normal-case">SynapTrack</Link>
            </div>
            <div className="flex-none">
              <ul className="menu menu-horizontal px-1">
                <li><Link to="/todos">Todos</Link></li>
                <li><Link to="/habits">Habits</Link></li>
                <li><Link to="/pomodoro">Pomodoro</Link></li>
                <li><Link to="/ai-suggestions">AI Suggestions</Link></li>
                <li><Link to="/report">Report</Link></li> 
                <li><Link to="/register">Register</Link></li>
                <li><Link to="/login">Login</Link></li>
              </ul>
            </div>
          </div>
        </nav>

        <main className="container mx-auto p-4 mt-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/todos" element={<TodoPage />} />
            <Route path="/habits" element={<HabitPage />} />
            <Route path="/pomodoro" element={<PomodoroPage />} />
            <Route path="/ai-suggestions" element={<AISuggestionsPage />} />
            <Route path="/report" element={<ReportPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
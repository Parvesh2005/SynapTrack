import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';


function HabitPage() {
  const [habits, setHabits] = useState([]);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitFrequency, setNewHabitFrequency] = useState('daily');
  const [newHabitSpecificDays, setNewHabitSpecificDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const token = userInfo?.token;

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchHabits();
  }, [token, navigate]);

  const fetchHabits = async () => {
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.get('http://localhost:5000/api/habits', config);
      setHabits(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch habits');
      if (err.response?.status === 401) { navigate('/login'); }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateHabit = async (e) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    try {
      const config = { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } };
      const payload = {
        habitName: newHabitName,
        targetFrequency: newHabitFrequency,
        specificDays: newHabitFrequency === 'specific_days' ? newHabitSpecificDays : [],
      };
      const { data } = await axios.post('http://localhost:5000/api/habits', payload, config);
      setHabits([data, ...habits]);
      setNewHabitName('');
      setNewHabitFrequency('daily');
      setNewHabitSpecificDays([]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create habit');
    }
  };

  const handleMarkComplete = async (habitId) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.put(`http://localhost:5000/api/habits/${habitId}/complete`, {}, config);
      setHabits(habits.map((habit) => (habit._id === habitId ? data : habit)));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to mark habit complete');
    }
  };

  const handleDeleteHabit = async (habitId) => {
    if (window.confirm('Are you sure you want to delete this habit?')) {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        await axios.delete(`http://localhost:5000/api/habits/${habitId}`, config);
        setHabits(habits.filter((habit) => habit._id !== habitId));
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete habit');
      }
    }
  };

  const isHabitCompletedToday = (lastCompletedDate) => {
    if (!lastCompletedDate) return false;
    const today = new Date();
    const lastComp = new Date(lastCompletedDate);
    return today.getDate() === lastComp.getDate() &&
           today.getMonth() === lastComp.getMonth() &&
           today.getFullYear() === lastComp.getFullYear();
  };

  const toggleDaySelection = (dayIndex) => {
    setNewHabitSpecificDays(prev =>
      prev.includes(dayIndex)
        ? prev.filter(d => d !== dayIndex)
        : [...prev, dayIndex].sort((a, b) => a - b)
    );
  };

  if (loading) return <div className="text-center"><span className="loading loading-spinner loading-lg"></span></div>;
  if (error) return <div className="alert alert-error shadow-lg"><div><svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg><span>{error}</span></div></div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-4xl font-bold mb-6">Your Habits</h1>

      <div className="card bg-base-100 shadow-xl mb-8">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-4">Add New Habit</h2>
          <form onSubmit={handleCreateHabit}>
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">Habit Name</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Read for 30 mins"
                className="input input-bordered w-full"
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                required
              />
            </div>

            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">Frequency</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={newHabitFrequency}
                onChange={(e) => setNewHabitFrequency(e.target.value)}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="specific_days">Specific Days of Week</option>
                {/* <option value="x_times_a_week">X Times a Week (More complex)</option> */}
              </select>
            </div>

            {newHabitFrequency === 'specific_days' && (
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Select Days</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {daysOfWeek.map((day, index) => (
                    <button
                      key={index}
                      type="button"
                      className={`btn ${newHabitSpecificDays.includes(index) ? 'btn-primary' : 'btn-outline'}`}
                      onClick={() => toggleDaySelection(index)}
                    >
                      {day.substring(0, 3)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="form-control mt-6">
              <button type="submit" className="btn btn-primary">Add Habit</button>
            </div>
          </form>
        </div>
      </div>

      {habits.length === 0 ? (
        <p className="text-center text-lg text-base-content/70">No habits yet. Add a new habit above!</p>
      ) : (
        <ul className="space-y-4">
          {habits.map((habit) => (
            <li key={habit._id} className="card bg-base-100 shadow-md p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">{habit.habitName}</h3>
                <button
                  onClick={() => handleMarkComplete(habit._id)}
                  className={`btn ${isHabitCompletedToday(habit.lastCompletedDate) ? 'btn-success' : 'btn-outline btn-primary'}`}
                  disabled={isHabitCompletedToday(habit.lastCompletedDate)}
                >
                  {isHabitCompletedToday(habit.lastCompletedDate) ? 'Completed Today!' : 'Mark Complete'}
                </button>
              </div>

              <div className="flex justify-between text-sm text-base-content/70">
                <span>Frequency: {habit.targetFrequency.replace(/_/g, ' ')}</span>
                <span>Current Streak: <span className="font-bold text-primary">{habit.currentStreak}</span></span>
                <span>Longest Streak: <span className="font-bold text-secondary">{habit.longestStreak}</span></span>
              </div>

              {habit.targetFrequency === 'specific_days' && (
                  <div className="text-sm text-base-content/70">
                      Days: {habit.specificDays.map(dayIndex => daysOfWeek[dayIndex].substring(0,3)).join(', ')}
                  </div>
              )}

              <div className="card-actions justify-end mt-2">
                {/* <button className="btn btn-sm btn-ghost">Edit</button> {/* Implement edit later if needed */}
                <button onClick={() => handleDeleteHabit(habit._id)} className="btn btn-sm btn-error">
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default HabitPage;
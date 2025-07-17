import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const WORK_TIME = 25 * 60;
const SHORT_BREAK_TIME = 5 * 60;
const LONG_BREAK_TIME = 15 * 60;
const POMODOROS_UNTIL_LONG_BREAK = 4;

function PomodoroPage() {
  const [timeLeft, setTimeLeft] = useState(WORK_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionType, setSessionType] = useState('work');
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [taskAssociated, setTaskAssociated] = useState('');
  const [startTime, setStartTime] = useState(null);
  const intervalRef = useRef(null);
  const navigate = useNavigate();

  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const token = userInfo?.token;

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
  }, [token, navigate]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(intervalRef.current);
            setIsRunning(false);
            handleSessionEnd();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, timeLeft]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes < 10 ? '0' : ''}${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const startTimer = () => {
    setIsRunning(true);
    setStartTime(new Date());
  };

  const pauseTimer = () => {
    setIsRunning(false);
    setStartTime(null);
  };

  const resetTimer = () => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
    setTimeLeft(WORK_TIME);
    setSessionType('work');
    setPomodoroCount(0);
    setTaskAssociated('');
    setStartTime(null);
  };

  const switchSession = (type) => {
    setSessionType(type);
    let newTime;
    if (type === 'work') {
      newTime = WORK_TIME;
    } else if (type === 'short_break') {
      newTime = SHORT_BREAK_TIME;
    } else if (type === 'long_break') {
      newTime = LONG_BREAK_TIME;
    }
    setTimeLeft(newTime);
    setIsRunning(false);
    setStartTime(null);
  };

  const handleSessionEnd = async () => {
    const endTime = new Date();
    const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));

    if (sessionType === 'work') {
      await logPomodoroSessionToServer(startTime, endTime, durationMinutes, sessionType, taskAssociated);
      setPomodoroCount((prevCount) => prevCount + 1);
      if ((pomodoroCount + 1) % POMODOROS_UNTIL_LONG_BREAK === 0) {
        switchSession('long_break');
        alert('Work session finished! Time for a long break!');
      } else {
        switchSession('short_break');
        alert('Work session finished! Time for a short break!');
      }
    } else {
      await logPomodoroSessionToServer(startTime, endTime, durationMinutes, sessionType, taskAssociated);
      switchSession('work');
      alert('Break finished! Time to work!');
    }
    setTaskAssociated('');
    setStartTime(null);
  };

  const logPomodoroSessionToServer = async (start, end, duration, type, task) => {
    if (!token) return;

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };
      await axios.post('http://localhost:5000/api/pomodoro-sessions', {
        startTime: start,
        endTime: end,
        durationMinutes: duration,
        sessionType: type,
        taskAssociated: task,
      }, config);
      console.log(`Logged ${type} session to server.`);
    } catch (err) {
      console.error('Error logging Pomodoro session:', err.response?.data?.message || err.message);
    }
  };


  return (
    <div className="flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-8">Pomodoro Timer</h1>

      <div className="stats shadow-lg mb-8">
        <div className="stat place-items-center">
          <div className="stat-title">Current Session</div>
          <div className="stat-value text-primary">{sessionType.replace('_', ' ')}</div>
        </div>
        <div className="stat place-items-center">
          <div className="stat-title">Pomodoros Done</div>
          <div className="stat-value text-secondary">{pomodoroCount}</div>
        </div>
      </div>

      <div className="text-8xl font-mono countdown mb-8">
        <span style={{ '--value': Math.floor(timeLeft / 60) }}></span>:
        <span style={{ '--value': timeLeft % 60 }}></span>
      </div>

      <div className="flex gap-4 mb-6">
        {!isRunning ? (
          <button className="btn btn-primary btn-lg" onClick={startTimer}>Start</button>
        ) : (
          <button className="btn btn-warning btn-lg" onClick={pauseTimer}>Pause</button>
        )}
        <button className="btn btn-ghost btn-lg" onClick={resetTimer}>Reset</button>
      </div>

      <div className="tabs tabs-boxed mb-6">
        <a className={`tab ${sessionType === 'work' ? 'tab-active' : ''}`} onClick={() => switchSession('work')}>Work ({WORK_TIME / 60}m)</a>
        <a className={`tab ${sessionType === 'short_break' ? 'tab-active' : ''}`} onClick={() => switchSession('short_break')}>Short Break ({SHORT_BREAK_TIME / 60}m)</a>
        <a className={`tab ${sessionType === 'long_break' ? 'tab-active' : ''}`} onClick={() => switchSession('long_break')}>Long Break ({LONG_BREAK_TIME / 60}m)</a>
      </div>

      {/* <div className="form-control w-full max-w-xs">
        <label className="label">
          <span className="label-text">Task for this session (optional)</span>
        </label>
        <input
          type="text"
          placeholder="e.g., Code API endpoints"
          className="input input-bordered w-full"
          value={taskAssociated}
          onChange={(e) => setTaskAssociated(e.target.value)}
          disabled={isRunning}
        />
      </div> */}

    </div>
  );
}

export default PomodoroPage;
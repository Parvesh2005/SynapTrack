// frontend/src/pages/ReportPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2'; // For bar charts
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components. This is crucial for charts to work.
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function ReportPage() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const token = userInfo?.token;

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchReport();
  }, [token, navigate]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const { data } = await axios.get('http://localhost:5000/api/reports/weekly', config);
      console.log('Received Report Data:', data); // IMPORTANT: Check your browser's console (F12) for this data
      setReportData(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch weekly report. Please ensure your backend is running and you have logged some activities.');
      if (err.response?.status === 401) {
          navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  // Prepare data for "Work Minutes by Hour" chart
  const workMinutesByHourChartData = {
    labels: Array.from({ length: 24 }, (_, i) => `${i}:00`), // Generates labels "0:00", "1:00", ..., "23:00"
    datasets: [
      {
        label: 'Work Minutes',
        data: reportData?.workMinutesByHour || [], // Directly uses the array from backend
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const workMinutesByHourChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Work Minutes by Hour of Day (Last 7 Days)',
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Hour of Day',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Total Minutes',
        },
        beginAtZero: true,
      },
    },
  };

  // Prepare data for "Work Minutes by Day" chart
  const workMinutesByDayChartData = {
    labels: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    datasets: [
      {
        label: 'Work Minutes',
        data: reportData?.workMinutesByDay || [], // CORRECTED: Directly uses the array from backend
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      },
    ],
  };

  const workMinutesByDayChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Work Minutes by Day of Week (Last 7 Days)',
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Day of Week',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Total Minutes',
        },
        beginAtZero: true,
      },
    },
  };

  if (loading) return <div className="text-center"><span className="loading loading-spinner loading-lg"></span></div>;
  if (error) return <div className="alert alert-error shadow-lg"><div><svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg><span>{error}</span></div></div>;
  // Display a message if no report data is available (e.g., first time user)
  if (!reportData || (reportData.totalWorkMinutes === 0 && reportData.totalHabitsCompletedInLast7Days === 0 && reportData.totalTodosCompletedInLast7Days === 0)) {
    return (
        <div className="text-center text-lg text-base-content/70 mt-8">
            <h1 className="text-4xl font-bold mb-4">Weekly Productivity Report</h1>
            <p className="mb-8">No report data available for the last 7 days. Start logging your Pomodoro sessions, habits, and to-dos to see your productivity report here!</p>
            <p>Go to the Pomodoro page, start a 'Work' session, and let it complete to see data populate.</p>
        </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-4xl font-bold mb-8 text-center">Weekly Productivity Report</h1>

      <div className="stats stats-vertical lg:stats-horizontal shadow-lg w-full mb-8">
        <div className="stat place-items-center">
          <div className="stat-title">Total Work Time</div>
          <div className="stat-value text-primary">{reportData.totalWorkMinutes} min</div>
          <div className="stat-desc">in last 7 days</div>
        </div>

        <div className="stat place-items-center">
          <div className="stat-title">Habits Completed</div>
          <div className="stat-value text-secondary">{reportData.totalHabitsCompletedInLast7Days}</div>
          <div className="stat-desc">in last 7 days</div>
        </div>

        <div className="stat place-items-center">
          <div className="stat-title">To-Dos Completed</div>
          <div className="stat-value text-accent">{reportData.totalTodosCompletedInLast7Days}</div>
          <div className="stat-desc">in last 7 days</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="card bg-base-100 shadow-xl p-6">
          <h2 className="card-title text-xl mb-4">Productivity by Hour</h2>
          <Bar data={workMinutesByHourChartData} options={workMinutesByHourChartOptions} />
        </div>

        <div className="card bg-base-100 shadow-xl p-6">
          <h2 className="card-title text-xl mb-4">Productivity by Day of Week</h2>
          <Bar data={workMinutesByDayChartData} options={workMinutesByDayChartOptions} />
        </div>
      </div>

      {reportData.habitsCompletedLast7Days && Object.keys(reportData.habitsCompletedLast7Days).length > 0 && (
        <div className="card bg-base-100 shadow-xl p-6 mb-8">
          <h2 className="card-title text-xl mb-4">Habit Completion Breakdown (Last 7 Days)</h2>
          <ul className="list-disc list-inside space-y-2">
            {Object.entries(reportData.habitsCompletedLast7Days).map(([habitName, count]) => (
              <li key={habitName} className="text-lg">
                <span className="font-semibold">{habitName}:</span> {count} times
              </li>
            ))}
          </ul>
        </div>
      )}

    </div>
  );
}

export default ReportPage;
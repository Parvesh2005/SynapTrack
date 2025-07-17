import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function TodoPage() {
  const [todos, setTodos] = useState([]);
  const [newTask, setNewTask] = useState('');
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
    fetchTodos();
  }, [token, navigate]);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const { data } = await axios.get('http://localhost:5000/api/todos', config);
      setTodos(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch todos');
      if (err.response?.status === 401) {
          navigate('/login'); // Redirect to login if token is expired/invalid
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTodo = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };
      const { data } = await axios.post('http://localhost:5000/api/todos', { taskName: newTask }, config);
      setTodos([data, ...todos]); // Add new todo to the top
      setNewTask('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create todo');
    }
  };

  const handleUpdateTodo = async (id, currentIsCompleted) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };
      const { data } = await axios.put(`http://localhost:5000/api/todos/${id}`, { isCompleted: !currentIsCompleted }, config);
      setTodos(todos.map((todo) => (todo._id === id ? data : todo)));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update todo');
    }
  };

  const handleDeleteTodo = async (id) => {
    if (window.confirm('Are you sure you want to delete this todo?')) {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        await axios.delete(`http://localhost:5000/api/todos/${id}`, config);
        setTodos(todos.filter((todo) => todo._id !== id));
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete todo');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  if (loading) return <div className="text-center"><span className="loading loading-spinner loading-lg"></span></div>;
  if (error) return <div className="alert alert-error shadow-lg"><div><svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg><span>{error}</span></div></div>;


  return (
    <div className="max-w-xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold">Your Todos</h1>
        <button onClick={handleLogout} className="btn btn-warning">Logout</button>
      </div>

      <form onSubmit={handleCreateTodo} className="input-group mb-6">
        <input
          type="text"
          placeholder="Add a new task..."
          className="input input-bordered w-full"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
        />
        <button type="submit" className="btn btn-primary">Add Task</button>
      </form>

      {todos.length === 0 ? (
        <p className="text-center text-lg text-base-content/70">No todos yet. Start adding some!</p>
      ) : (
        <ul className="space-y-3">
          {todos.map((todo) => (
            <li key={todo._id} className="card bg-base-100 shadow-md p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center flex-1">
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary mr-3"
                  checked={todo.isCompleted}
                  onChange={() => handleUpdateTodo(todo._id, todo.isCompleted)}
                />
                <span className={`text-lg ${todo.isCompleted ? 'line-through text-base-content/60' : ''}`}>
                  {todo.taskName}
                </span>
              </div>
              <div className="flex gap-2 self-end sm:self-auto">
                {/* <button className="btn btn-sm btn-ghost">Edit</button> {/* Optional: implement edit functionality */}
                <button
                  onClick={() => handleDeleteTodo(todo._id)}
                  className="btn btn-sm btn-error"
                >
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

export default TodoPage;
const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const userRoutes = require('./routes/userRoutes');
const todoRoutes = require('./routes/todoRoutes');
const habitRoutes = require('./routes/habitRoutes');
const pomodoroRoutes = require('./routes/pomodoroRoutes');
const aiRoutes = require('./routes/aiRoutes');
const reportRoutes = require('./routes/reportRoutes');


const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/todos', todoRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/pomodoro-sessions', pomodoroRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/reports', reportRoutes);

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

app.get('/', (req, res) => {
    res.send('FocusUp Backend API is running!');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
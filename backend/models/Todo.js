const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    taskName: {
        type: String,
        required: true,
        trim: true,
    },
    isCompleted: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    completedAt: {
        type: Date,
    },
});

const Todo = mongoose.model('Todo', todoSchema);
module.exports = Todo;
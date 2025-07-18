# SynapTrack – AI-Powered Productivity Suite

## 🧠 Overview

SynapTrack is an innovative, full-stack productivity web application designed to help users optimize their focus, track progress, and build effective habits. Leveraging the power of Artificial Intelligence, it provides personalized insights and habit suggestions, turning raw productivity data into actionable guidance.

## ✨ Features

* **Pomodoro Timer:** A customizable timer to facilitate focused work sessions and structured breaks, with logging to track productivity.
* **To-Do List:** Intuitive task management with full CRUD (Create, Read, Update, Delete) functionality.
* **Habit Tracker:** Comprehensive tracking for daily, weekly, or specific-day habits, including streak calculations and visual progress indicators.
* **AI-Powered Habit Suggestions:**
    * Utilizes the **Google Gemini API (gemini-1.5-flash)** to analyze user productivity data (Pomodoro sessions, habit consistency, task completion times).
    * Generates **personalized insights** into productivity patterns.
    * Provides **actionable habit recommendations** tailored to individual strengths and areas for improvement.
* **Weekly Productivity Report:** A dynamic dashboard featuring visual charts (powered by Chart.js) that display work time distribution by hour and day, total habits completed, and to-dos finished, enhancing self-awareness.
* **Social Accountability Mode (Planned/Implemented):** Allows users to share their goals and progress with friends, fostering a supportive environment.
* **Local Storage + MongoDB Syncing (Implemented):** Provides an optimized user experience with optimistic UI updates and seamless data synchronization.

## 🚀 Technologies Used

**Frontend:**
* **React.js:** A JavaScript library for building user interfaces.
* **React Router DOM:** For declarative routing in React applications.
* **Axios:** Promise-based HTTP client for making API requests.
* **Tailwind CSS:** A utility-first CSS framework for rapid UI development.
* **DaisyUI:** A Tailwind CSS component library for modern UI elements.
* **React Chart.js 2 & Chart.js:** For creating interactive data visualizations.
* **React Datepicker:** For intuitive date selection.

**Backend:**
* **Node.js:** JavaScript runtime environment.
* **Express.js:** Fast, unopinionated, minimalist web framework for Node.js.
* **MongoDB:** NoSQL database for flexible data storage.
* **Mongoose:** MongoDB object data modeling (ODM) for Node.js.
* **JSON Web Tokens (JWT):** For secure user authentication.
* **Bcrypt.js:** For password hashing and security.
* **CORS:** Middleware for enabling Cross-Origin Resource Sharing.
* **Dotenv:** For loading environment variables from a `.env` file.
* **Google Generative AI SDK:** For interacting with the Google Gemini API.

**Database:**
* **MongoDB Atlas:** Cloud-hosted MongoDB service.

## 💻 Installation and Setup

Follow these steps to get SynapTrack running on your local machine.

## 📁 Project Structure

```
SynapTrack/
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.js
│   ├── index.html
│   ├── index.js
│   ├── index.css
│   ├── tailwind.config.js
│   └── postcss.config.cjs
└── README.md
```

### Prerequisites

* Node.js (v18 or higher recommended)
* npm (Node Package Manager)
* MongoDB Atlas Account (for cloud database)
* Google AI Studio API Key (for Gemini API access)

### Backend Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Parvesh2005/SynapTrack
    cd SynapTrack/backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Create a `.env` file:**
    In the `backend` directory, create a file named `.env` and add your environment variables:
    ```env
    MONGO_URI=YOUR_MONGO_URI
    JWT_SECRET=your_super_secret_jwt_key_here # Use a strong, random string
    GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
    ```
    * **`MONGO_URI`**: Get this from your MongoDB Atlas cluster. Ensure the database user has read/write access.
    * **`JWT_SECRET`**: Generate a strong, random string.
    * **`GEMINI_API_KEY`**: Obtain this from [Google AI Studio](https://aistudio.google.com/). Ensure it has access to the `gemini-1.5-flash` model.

4.  **Start the backend server:**
    ```bash
    npm run dev
    ```
    The server should start on `http://localhost:5000`. You should see "MongoDB connected successfully" in your console.

### Frontend Setup

1.  **Navigate to the frontend directory:**
    ```bash
    cd ../frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Start the frontend development server:**
    ```bash
    npm run dev # or npm start
    ```
    The application should open in your browser at `http://localhost:3000`.

## 🚀 Usage

1.  **Register/Login:** Create a new account or log in with existing credentials.
2.  **Log Activities:**
    * Use the Pomodoro Timer to log focused work sessions.
    * Add and complete tasks in the To-Do list.
    * Set up and track your daily or weekly habits.
3.  **View Reports:** Check the "Report" page for visual summaries of your productivity.
4.  **Get AI Suggestions:** Visit the "AI Suggestions" page to receive personalized habit recommendations based on your logged data. The more data you log, the better the insights!
---

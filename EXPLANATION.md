# Daily Todo: How It Works

## Structure

- `frontend/src/App.jsx` contains the student task dashboard and progress calculation.
- `frontend/src/services/taskService.js` is the frontend API client.
- `backend/server.js` starts Express, enables CORS/JSON parsing, and mounts the task routes.
- `backend/routes/taskRoutes.js` exposes task list, create, and completion-update endpoints.
- `backend/models/Task.js` defines the MongoDB task document.

## Frontend to backend connection

1. The frontend asks `GET http://localhost:5000/api/tasks?date=YYYY-MM-DD` when it opens.
2. Adding a task sends its title, due time, and date to `POST /api/tasks`.
3. Checking a task sends `{ completed: true/false }` to `PATCH /api/tasks/:id`.
4. The returned MongoDB documents update the screen. Progress is calculated as completed tasks divided by today's total tasks.
5. Browser notifications still run in the frontend. The browser checks unfinished tasks every minute and notifies when a due time is within 15 minutes.
6. Because tasks are stored in MongoDB instead of browser storage, they remain available after closing and reopening the application.

## Run locally

### 1. Start MongoDB

MongoDB must be running locally at `mongodb://127.0.0.1:27017`, or update `backend/.env` with your MongoDB connection string.

### 2. Start the backend

```bash
cd daily-todo/backend
npm install
npm run dev
```

The API runs at `http://localhost:5000`.

### 3. Start the frontend

```bash
cd daily-todo/frontend
npm install
npm run dev
```

Open the Vite URL shown in the terminal. The database starts empty; tasks appear only after the student adds them.
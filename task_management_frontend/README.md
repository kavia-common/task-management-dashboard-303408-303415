# Task Management Frontend (React)

React dashboard UI for managing tasks (create/update/assign/filter) and viewing a summary.

## Environment variables

This frontend expects the backend API to be reachable at **http://localhost:3001** in development.

Supported env vars (see `.env.example`):

- `REACT_APP_API_BASE` (preferred)  
  Example: `http://localhost:3001`

- `REACT_APP_BACKEND_URL` (fallback)  
  Example: `http://localhost:3001`

The API client will use `REACT_APP_API_BASE`, then `REACT_APP_BACKEND_URL`, and finally default to `http://localhost:3001`.

## CORS requirement

The backend must allow the frontend dev origin:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`

CORS is configured in the backend at `task_management_backend/src/api/main.py` and already allows `http://localhost:3000`.

## Getting Started

In the project directory, you can run:

### `npm start`

Runs the app in development mode.  
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## Troubleshooting

- If API calls fail, confirm:
  - Backend is running on `http://localhost:3001`
  - Backend `/api/health/db` returns `{ "ok": true }`
  - Your `.env` (or `.env.local`) sets `REACT_APP_API_BASE=http://localhost:3001`
  - CORS allows `http://localhost:3000`

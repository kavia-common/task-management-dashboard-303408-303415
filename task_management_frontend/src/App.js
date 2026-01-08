import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import Sidebar from "./components/Sidebar";
import DashboardPage from "./pages/DashboardPage";
import TasksPage from "./pages/TasksPage";
import { TasksProvider } from "./state/TasksContext";

/**
 * PUBLIC_INTERFACE
 * App entry component for the Task Management Dashboard UI.
 */
function App() {
  return (
    <TasksProvider>
      <BrowserRouter>
        <div className="appShell">
          <Sidebar />
          <main className="main">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/tasks" element={<TasksPage />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </TasksProvider>
  );
}

export default App;

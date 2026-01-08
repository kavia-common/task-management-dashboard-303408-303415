import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import {
  createTask,
  deleteTask,
  getDashboardSummary,
  listStatuses,
  listTasks,
  listUsers,
  updateTask,
} from "../api/tasksApi";

const TasksContext = createContext(null);

function normalizeError(e) {
  if (!e) return "Unknown error";
  if (typeof e === "string") return e;
  return e.message || "Request failed";
}

/**
 * PUBLIC_INTERFACE
 * Provider holding task app state (tasks, users, statuses) and API actions.
 */
export function TasksProvider({ children }) {
  const [statuses, setStatuses] = useState([]);
  const [users, setUsers] = useState([]);

  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [tasksError, setTasksError] = useState("");

  const [dashboard, setDashboard] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState("");

  const bootstrap = useCallback(async () => {
    // Load lookup tables in parallel.
    const [s, u] = await Promise.all([listStatuses(), listUsers()]);
    setStatuses(s);
    setUsers(u);
  }, []);

  const refreshTasks = useCallback(async (filters) => {
    setTasksLoading(true);
    setTasksError("");
    try {
      const rows = await listTasks(filters);
      setTasks(rows);
    } catch (e) {
      setTasksError(normalizeError(e));
    } finally {
      setTasksLoading(false);
    }
  }, []);

  const refreshDashboard = useCallback(async (upcomingLimit = 5) => {
    setDashboardLoading(true);
    setDashboardError("");
    try {
      const d = await getDashboardSummary(upcomingLimit);
      setDashboard(d);
    } catch (e) {
      setDashboardError(normalizeError(e));
    } finally {
      setDashboardLoading(false);
    }
  }, []);

  const createOne = useCallback(async (payload) => {
    const created = await createTask(payload);
    return created;
  }, []);

  const updateOne = useCallback(async (taskId, patch) => {
    const updated = await updateTask(taskId, patch);
    return updated;
  }, []);

  const deleteOne = useCallback(async (taskId) => {
    await deleteTask(taskId);
  }, []);

  const value = useMemo(
    () => ({
      statuses,
      users,

      tasks,
      tasksLoading,
      tasksError,

      dashboard,
      dashboardLoading,
      dashboardError,

      bootstrap,
      refreshTasks,
      refreshDashboard,

      createOne,
      updateOne,
      deleteOne,
    }),
    [
      statuses,
      users,
      tasks,
      tasksLoading,
      tasksError,
      dashboard,
      dashboardLoading,
      dashboardError,
      bootstrap,
      refreshTasks,
      refreshDashboard,
      createOne,
      updateOne,
      deleteOne,
    ]
  );

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
}

/**
 * PUBLIC_INTERFACE
 * Access the Tasks context.
 */
export function useTasks() {
  const ctx = useContext(TasksContext);
  if (!ctx) {
    throw new Error("useTasks must be used within TasksProvider");
  }
  return ctx;
}

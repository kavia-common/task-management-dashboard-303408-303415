import { apiFetch } from "./client";

/**
 * PUBLIC_INTERFACE
 * List task statuses (lookup table).
 */
export function listStatuses() {
  return apiFetch("/api/statuses");
}

/**
 * PUBLIC_INTERFACE
 * List users (assignees).
 */
export function listUsers() {
  return apiFetch("/api/users");
}

/**
 * PUBLIC_INTERFACE
 * List tasks with optional filters:
 * - status_id
 * - assignee_id
 * - due_before (YYYY-MM-DD)
 */
export function listTasks(filters) {
  return apiFetch("/api/tasks", { params: filters || {} });
}

/**
 * PUBLIC_INTERFACE
 * Get a single task by id.
 */
export function getTask(taskId) {
  return apiFetch(`/api/tasks/${taskId}`);
}

/**
 * PUBLIC_INTERFACE
 * Create a new task.
 * payload: { title, description?, status_id, due_date?, assignee_id? }
 */
export function createTask(payload) {
  return apiFetch("/api/tasks", { method: "POST", body: payload });
}

/**
 * PUBLIC_INTERFACE
 * Update a task (PATCH).
 * payload can include: title?, description?, status_id?, due_date?, assignee_id?
 */
export function updateTask(taskId, payload) {
  return apiFetch(`/api/tasks/${taskId}`, { method: "PATCH", body: payload });
}

/**
 * PUBLIC_INTERFACE
 * Delete a task.
 */
export function deleteTask(taskId) {
  return apiFetch(`/api/tasks/${taskId}`, { method: "DELETE" });
}

/**
 * PUBLIC_INTERFACE
 * Get dashboard summary:
 * returns { total_tasks, by_status: [{status_id,status,count}], upcoming_deadlines: Task[] }
 */
export function getDashboardSummary(upcomingLimit = 5) {
  return apiFetch("/api/dashboard/summary", { params: { upcoming_limit: upcomingLimit } });
}

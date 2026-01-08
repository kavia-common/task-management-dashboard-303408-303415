import React, { useEffect, useMemo, useState } from "react";
import Modal from "../components/Modal";
import StatusPill from "../components/StatusPill";
import { useTasks } from "../state/TasksContext";

function toInputDate(dateStr) {
  // backend uses YYYY-MM-DD; input expects the same
  return dateStr || "";
}

function isDueSoon(dueDate) {
  if (!dueDate) return false;
  const today = new Date();
  const due = new Date(`${dueDate}T00:00:00`);
  const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
  return diffDays <= 3;
}

function groupByStatus(tasks) {
  const groups = {
    todo: [],
    inprogress: [],
    done: [],
    other: [],
  };

  tasks.forEach((t) => {
    const s = (t.status || "").toLowerCase();
    if (s.includes("to do")) groups.todo.push(t);
    else if (s.includes("progress")) groups.inprogress.push(t);
    else if (s.includes("done")) groups.done.push(t);
    else groups.other.push(t);
  });

  return groups;
}

/**
 * PUBLIC_INTERFACE
 * Tasks page: filters + list/kanban + create/edit/detail modal.
 */
export default function TasksPage() {
  const {
    statuses,
    users,
    tasks,
    tasksLoading,
    tasksError,
    bootstrap,
    refreshTasks,
    createOne,
    updateOne,
    deleteOne,
    refreshDashboard,
  } = useTasks();

  const [view, setView] = useState("kanban"); // kanban | list

  // Filters (backend expects: status_id, assignee_id, due_before)
  const [statusId, setStatusId] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [dueBefore, setDueBefore] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [formStatusId, setFormStatusId] = useState("1");
  const [formAssigneeId, setFormAssigneeId] = useState("");
  const [formDueDate, setFormDueDate] = useState("");

  const effectiveFilters = useMemo(
    () => ({
      status_id: statusId ? Number(statusId) : undefined,
      assignee_id: assigneeId ? Number(assigneeId) : undefined,
      due_before: dueBefore || undefined,
    }),
    [statusId, assigneeId, dueBefore]
  );

  useEffect(() => {
    (async () => {
      await bootstrap();
      await refreshTasks(effectiveFilters);
    })();
  }, [bootstrap]); // bootstrap once

  useEffect(() => {
    refreshTasks(effectiveFilters);
  }, [effectiveFilters, refreshTasks]);

  const grouped = useMemo(() => groupByStatus(tasks), [tasks]);

  const openCreate = () => {
    setEditingTask(null);
    setTitle("");
    setDescription("");
    setFormStatusId("1");
    setFormAssigneeId("");
    setFormDueDate("");
    setSaveError("");
    setModalOpen(true);
  };

  const openEdit = (task) => {
    setEditingTask(task);
    setTitle(task.title || "");
    setDescription(task.description || "");
    setFormStatusId(String(task.status_id || 1));
    setFormAssigneeId(task.assignee_id ? String(task.assignee_id) : "");
    setFormDueDate(toInputDate(task.due_date));
    setSaveError("");
    setModalOpen(true);
  };

  const onSave = async () => {
    setSaving(true);
    setSaveError("");

    try {
      if (!title.trim()) {
        setSaveError("Title is required.");
        return;
      }

      const payload = {
        title: title.trim(),
        description: description.trim() ? description.trim() : null,
        status_id: Number(formStatusId || 1),
        assignee_id: formAssigneeId ? Number(formAssigneeId) : null,
        due_date: formDueDate ? formDueDate : null,
      };

      if (editingTask?.id) {
        await updateOne(editingTask.id, payload);
      } else {
        await createOne(payload);
      }

      setModalOpen(false);
      await refreshTasks(effectiveFilters);
      // Keep dashboard KPIs reasonably up-to-date
      await refreshDashboard(5);
    } catch (e) {
      setSaveError(e?.message || "Could not save task.");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!editingTask?.id) return;
    setSaving(true);
    setSaveError("");
    try {
      await deleteOne(editingTask.id);
      setModalOpen(false);
      await refreshTasks(effectiveFilters);
      await refreshDashboard(5);
    } catch (e) {
      setSaveError(e?.message || "Could not delete task.");
    } finally {
      setSaving(false);
    }
  };

  const StatusSelect = ({ value, onChange, id }) => (
    <select id={id} className="select" value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">All statuses</option>
      {statuses.map((s) => (
        <option key={s.id} value={String(s.id)}>
          {s.name}
        </option>
      ))}
    </select>
  );

  const AssigneeSelect = ({ value, onChange, id }) => (
    <select id={id} className="select" value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">All assignees</option>
      {users.map((u) => (
        <option key={u.id} value={String(u.id)}>
          {u.name}
        </option>
      ))}
    </select>
  );

  const TaskCard = ({ task }) => (
    <div
      className="taskCard"
      role="button"
      tabIndex={0}
      onClick={() => openEdit(task)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") openEdit(task);
      }}
    >
      <p className="taskCardTitle">{task.title}</p>
      <div className="taskCardMeta">
        <StatusPill status={task.status} />
        <span className="pill pillMuted">{task.assignee_name || "Unassigned"}</span>
        {task.due_date ? (
          <span className={isDueSoon(task.due_date) ? "pill pillPrimary" : "pill pillMuted"}>
            Due {task.due_date}
          </span>
        ) : (
          <span className="pill pillMuted">No due date</span>
        )}
      </div>
    </div>
  );

  return (
    <div className="container">
      <div className="pageHeader">
        <div>
          <h1 className="h1">Tasks</h1>
          <div className="subtle">Filter tasks, manage status, and update assignments.</div>
        </div>

        <div className="controlsRow">
          <button className="btn" onClick={() => setView(view === "kanban" ? "list" : "kanban")}>
            View: {view === "kanban" ? "Kanban" : "List"}
          </button>
          <button className="btn btnPrimary" onClick={openCreate}>
            + New Task
          </button>
        </div>
      </div>

      <div className="card">
        <div className="cardHeader">
          <h2 className="cardTitle">Filters</h2>
          <span className="smallHelp">Filters apply instantly</span>
        </div>
        <div className="cardBody">
          <div className="controlsRow">
            <div>
              <div className="smallHelp">Status</div>
              <StatusSelect value={statusId} onChange={setStatusId} id="filter-status" />
            </div>

            <div>
              <div className="smallHelp">Assignee</div>
              <AssigneeSelect value={assigneeId} onChange={setAssigneeId} id="filter-assignee" />
            </div>

            <div>
              <div className="smallHelp">Due before</div>
              <input
                className="input"
                type="date"
                value={dueBefore}
                onChange={(e) => setDueBefore(e.target.value)}
              />
            </div>

            <button className="btn" onClick={() => refreshTasks(effectiveFilters)}>
              Refresh
            </button>

            <button
              className="btn"
              onClick={() => {
                setStatusId("");
                setAssigneeId("");
                setDueBefore("");
              }}
            >
              Clear
            </button>
          </div>

          {tasksError ? <div className="alert" style={{ marginTop: 12 }}>{tasksError}</div> : null}
          {tasksLoading ? <div className="loading" style={{ marginTop: 12 }}>Loading tasks…</div> : null}
        </div>
      </div>

      {view === "kanban" ? (
        <div className="kanban" aria-label="Kanban board">
          <div className="kanbanCol">
            <div className="kanbanColHeader">
              <div className="kanbanColTitle">To Do</div>
              <span className="pill pillMuted">{grouped.todo.length}</span>
            </div>
            {grouped.todo.map((t) => (
              <TaskCard key={t.id} task={t} />
            ))}
          </div>

          <div className="kanbanCol">
            <div className="kanbanColHeader">
              <div className="kanbanColTitle">In Progress</div>
              <span className="pill pillPrimary">{grouped.inprogress.length}</span>
            </div>
            {grouped.inprogress.map((t) => (
              <TaskCard key={t.id} task={t} />
            ))}
          </div>

          <div className="kanbanCol">
            <div className="kanbanColHeader">
              <div className="kanbanColTitle">Done</div>
              <span className="pill pillSuccess">{grouped.done.length}</span>
            </div>
            {grouped.done.map((t) => (
              <TaskCard key={t.id} task={t} />
            ))}
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="cardHeader">
            <h2 className="cardTitle">Task list</h2>
            <span className="smallHelp">{tasks.length} tasks</span>
          </div>
          <div className="cardBody">
            {!tasks.length ? (
              <div className="smallHelp">No tasks found for the selected filters.</div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th className="th">Task</th>
                    <th className="th">Status</th>
                    <th className="th">Assignee</th>
                    <th className="th">Due</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((t) => (
                    <tr
                      key={t.id}
                      style={{ cursor: "pointer" }}
                      onClick={() => openEdit(t)}
                      title="Click to edit"
                    >
                      <td className="td">
                        <div className="rowTitle">{t.title}</div>
                        {t.description ? <div className="rowMeta">{t.description}</div> : null}
                      </td>
                      <td className="td">
                        <StatusPill status={t.status} />
                      </td>
                      <td className="td">{t.assignee_name || "Unassigned"}</td>
                      <td className="td">{t.due_date || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      <Modal
        open={modalOpen}
        title={editingTask ? `Task #${editingTask.id}` : "Create task"}
        onClose={() => !saving && setModalOpen(false)}
        footer={
          <>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {editingTask ? (
                <button className="btn btnDanger" onClick={onDelete} disabled={saving}>
                  Delete
                </button>
              ) : null}
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button className="btn" onClick={() => setModalOpen(false)} disabled={saving}>
                Cancel
              </button>
              <button className="btn btnPrimary" onClick={onSave} disabled={saving}>
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </>
        }
      >
        {saveError ? <div className="alert">{saveError}</div> : null}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div style={{ gridColumn: "1 / -1" }}>
            <div className="smallHelp">Title</div>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <div className="smallHelp">Description</div>
            <textarea
              className="textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional"
            />
          </div>

          <div>
            <div className="smallHelp">Status</div>
            <select
              className="select"
              value={formStatusId}
              onChange={(e) => setFormStatusId(e.target.value)}
            >
              {statuses.map((s) => (
                <option key={s.id} value={String(s.id)}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="smallHelp">Assignee</div>
            <select
              className="select"
              value={formAssigneeId}
              onChange={(e) => setFormAssigneeId(e.target.value)}
            >
              <option value="">Unassigned</option>
              {users.map((u) => (
                <option key={u.id} value={String(u.id)}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="smallHelp">Due date</div>
            <input
              className="input"
              type="date"
              value={formDueDate}
              onChange={(e) => setFormDueDate(e.target.value)}
            />
          </div>

          {editingTask ? (
            <div>
              <div className="smallHelp">Updated</div>
              <div className="input" style={{ display: "flex", alignItems: "center" }}>
                {editingTask.updated_at}
              </div>
            </div>
          ) : (
            <div />
          )}
        </div>
      </Modal>
    </div>
  );
}

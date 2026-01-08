import React, { useEffect } from "react";
import { useTasks } from "../state/TasksContext";
import StatusPill from "../components/StatusPill";

function formatDate(d) {
  if (!d) return "—";
  // Backend returns YYYY-MM-DD for date fields
  return d;
}

/**
 * PUBLIC_INTERFACE
 * Dashboard page: KPI counts by status + upcoming deadlines widget.
 */
export default function DashboardPage() {
  const {
    statuses,
    dashboard,
    dashboardLoading,
    dashboardError,
    refreshDashboard,
    bootstrap,
  } = useTasks();

  useEffect(() => {
    (async () => {
      // Ensure lookups exist (optional, but useful for stable ordering).
      await bootstrap();
      await refreshDashboard(5);
    })();
  }, [bootstrap, refreshDashboard]);

  const byStatusMap = new Map((dashboard?.by_status || []).map((x) => [x.status_id, x]));
  const orderedKpis =
    statuses.length > 0
      ? statuses.map((s) => ({
          id: s.id,
          name: s.name,
          count: byStatusMap.get(s.id)?.count ?? 0,
        }))
      : (dashboard?.by_status || []).map((x) => ({
          id: x.status_id,
          name: x.status,
          count: x.count,
        }));

  return (
    <div className="container">
      <div className="pageHeader">
        <div>
          <h1 className="h1">Dashboard</h1>
          <div className="subtle">Quick view of workload and upcoming deadlines.</div>
        </div>
        <button className="btn btnPrimary" onClick={() => refreshDashboard(5)}>
          Refresh
        </button>
      </div>

      {dashboardError ? <div className="alert">{dashboardError}</div> : null}
      {dashboardLoading ? <div className="loading">Loading dashboard…</div> : null}

      <div className="grid3">
        <div className="kpi">
          <div className="kpiLabel">Total Tasks</div>
          <div className="kpiValue">{dashboard?.total_tasks ?? "—"}</div>
        </div>

        {orderedKpis.slice(0, 2).map((k) => (
          <div key={k.id} className={k.name.toLowerCase().includes("done") ? "kpi kpiAccent" : "kpi"}>
            <div className="kpiLabel">{k.name}</div>
            <div className="kpiValue">{k.count}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="cardHeader">
          <h2 className="cardTitle">Upcoming deadlines</h2>
          <span className="smallHelp">Soonest due tasks</span>
        </div>
        <div className="cardBody">
          {!dashboard?.upcoming_deadlines?.length ? (
            <div className="smallHelp">No upcoming deadlines found.</div>
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
                {dashboard.upcoming_deadlines.map((t) => (
                  <tr key={t.id}>
                    <td className="td">
                      <div className="rowTitle">{t.title}</div>
                      {t.description ? <div className="rowMeta">{t.description}</div> : null}
                    </td>
                    <td className="td">
                      <StatusPill status={t.status} />
                    </td>
                    <td className="td">{t.assignee_name || "Unassigned"}</td>
                    <td className="td">{formatDate(t.due_date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

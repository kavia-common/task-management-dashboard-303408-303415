import React from "react";

function pillClass(statusName) {
  const name = (statusName || "").toLowerCase();
  if (name.includes("done")) return "pill pillSuccess";
  if (name.includes("progress")) return "pill pillPrimary";
  return "pill pillMuted";
}

/**
 * PUBLIC_INTERFACE
 * Render a status pill (To Do/In Progress/Done).
 */
export default function StatusPill({ status }) {
  return <span className={pillClass(status)}>{status || "Unknown"}</span>;
}

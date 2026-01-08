import React from "react";
import { NavLink } from "react-router-dom";

/**
 * PUBLIC_INTERFACE
 * Sidebar navigation for the app.
 */
export default function Sidebar() {
  const linkClassName = ({ isActive }) => (isActive ? "navLink navLinkActive" : "navLink");

  return (
    <aside className="sidebar" aria-label="Primary navigation">
      <div className="brand">
        <div className="brandTitle">Task Dashboard</div>
        <div className="brandSub">Track, assign, and deliver</div>
      </div>

      <nav className="nav">
        <NavLink to="/" end className={linkClassName}>
          <span className="navDot navDotPrimary" aria-hidden="true" />
          Dashboard
        </NavLink>

        <NavLink to="/tasks" className={linkClassName}>
          <span className="navDot" aria-hidden="true" />
          Tasks
        </NavLink>
      </nav>
    </aside>
  );
}

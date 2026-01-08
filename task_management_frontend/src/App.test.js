import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders sidebar navigation", () => {
  render(<App />);

  // Sidebar uses NavLink, so validate via role+name to avoid ambiguous matches
  // (e.g., "Task Dashboard" brand title + "Dashboard" link + page <h1>).
  expect(screen.getByRole("link", { name: /^Dashboard$/i })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /^Tasks$/i })).toBeInTheDocument();
});

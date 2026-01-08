import React, { useEffect } from "react";

/**
 * PUBLIC_INTERFACE
 * Accessible modal with ESC + backdrop close.
 */
export default function Modal({ open, title, onClose, children, footer }) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="modalOverlay"
      role="dialog"
      aria-modal="true"
      aria-label={title || "Dialog"}
      onMouseDown={(e) => {
        // Close only if the overlay itself was clicked.
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className="modal">
        <div className="modalHeader">
          <div>
            <h2 className="modalTitle">{title}</h2>
          </div>
          <button className="btn" onClick={onClose} aria-label="Close dialog">
            Close
          </button>
        </div>

        <div className="modalBody">{children}</div>

        {footer ? <div className="modalFooter">{footer}</div> : null}
      </div>
    </div>
  );
}

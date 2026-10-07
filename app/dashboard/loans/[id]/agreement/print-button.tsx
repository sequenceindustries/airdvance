"use client";

export function PrintButton() {
  return (
    <button onClick={() => window.print()} className="btn-ghost btn-sm">
      Print or save as PDF
    </button>
  );
}

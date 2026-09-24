import React from "react"
import type { ConfigProps } from "../types"

export default function TopRightUI(config: ConfigProps) {

  return () => (
    <label
      title="Wróć"
      onClick={() => {if (config.IS_READONLY_MODE) {window.location.href = "/boards/shared"} else {window.location.href = "/boards"}}}
      className="zen-mode-transition"
    >
      {/* Ukryty checkbox, aby zachować styl Excalidraw */}
      <input
        className="ToolIcon_type_checkbox"
        type="checkbox"
        aria-label="Wróć"
      />

      {/*
        Te same klasy i struktura co przycisk "Biblioteka" w Excalidraw, dzięki czemu
        oba przyciski mają identyczną wysokość, odstępy i położenie. Kolor i cień
        bierzemy z "wyspy" (Island), żeby przycisk zachował swój biały wygląd.
      */}
      <div
        className="sidebar-trigger default-sidebar-trigger"
        style={{
          backgroundColor: "var(--island-bg-color)",
          boxShadow: "var(--shadow-island)",
        }}
      >
        {/* Ikona strzałki powrotu */}
        <svg
          aria-hidden="true"
          focusable="false"
          role="img"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.25"
          width="20"
          height="20"
        >
          <path d="M7.5 10.833 4.167 7.5 7.5 4.167M4.167 7.5h9.166a3.333 3.333 0 0 1 0 6.667H12.5"></path>
        </svg>

        <div className="sidebar-trigger__label">Wróć</div>
      </div>
    </label>
  )
}

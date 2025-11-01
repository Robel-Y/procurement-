import React, { useState } from "react";
import "./side-bar.css";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button className="toggle-btn" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? "✖" : "☰"}
      </button>

      <aside className={`sidebar ${isOpen ? "open" : "closed"}`}>
        <h2 className="sidebar-title">Navigation</h2>
        <ul className="sidebar-menu">
          <li><a href="#home">🏠 Home</a></li>
          <li><a href="#about">ℹ️ About</a></li>
          <li><a href="#services">🛠️ Services</a></li>
          <li><a href="#contact">📞 Contact</a></li>
        </ul>
      </aside>
    </>
  );
}

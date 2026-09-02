import React from 'react';

function Sidebar({ activeSection, onNavigate }) {
  const navItems = [
    { id: 'home', label: 'Home', icon: 'fa-home' },
    { id: 'prediction', label: 'Prediction', icon: 'fa-chart-line' },
    { id: 'explainability', label: 'Explainability', icon: 'fa-brain' },
    { id: 'about', label: 'About', icon: 'fa-circle-info' }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-content">
        {navItems.map(item => (
          <a
            key={item.id}
            href="#"
            className={`sidebar-nav-item ${activeSection === item.id ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              onNavigate(item.id);
            }}
          >
            <i className={`fas ${item.icon}`}></i> {item.label}
          </a>
        ))}
      </div>
      <div className="sidebar-footer">
        © 2026 Quantum Heart
      </div>
    </aside>
  );
}

export default Sidebar;

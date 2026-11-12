import React from 'react';

export const AdminSidebar = ({ navItems, activeTab, setActiveTab }) => {
  return (
    <aside className="admin-sidebar">
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
        {navItems.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`admin-nav-item ${isActive ? 'is-active' : ''}`}
            >
              <div className="admin-nav-item__content">
                {tab.faIcon ? (
                  <i
                    className={tab.faIcon}
                    style={{
                      fontSize: '1.15rem',
                      width: '24px',
                      display: 'inline-grid',
                      placeItems: 'center',
                      color: isActive ? 'hsl(var(--brand))' : 'var(--mut)'
                    }}
                  ></i>
                ) : Icon ? (
                  <Icon className="i" />
                ) : null}
                <span>{tab.label}</span>
              </div>
              {typeof tab.count === 'number' && (
                <span className="admin-nav-item__badge">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

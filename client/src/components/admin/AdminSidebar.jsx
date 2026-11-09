import React from 'react';

export const AdminSidebar = ({ navItems, activeTab, setActiveTab }) => {
  return (
    <aside style={{ borderRight: '1px solid var(--line)', padding: '1.5rem', background: 'var(--surface-2)' }}>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {navItems.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1.1rem',
                borderRadius: '12px',
                fontWeight: 600,
                fontSize: '0.95rem',
                background: isActive ? 'hsl(var(--brand) / 0.15)' : 'transparent',
                color: isActive ? 'hsl(var(--brand))' : 'var(--mut)',
                border: isActive ? '1px solid hsl(var(--brand) / 0.3)' : '1px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <Icon className="i" />
                <span>{tab.label}</span>
              </div>
              {typeof tab.count === 'number' && (
                <span style={{
                  fontSize: '0.75rem',
                  padding: '0.1rem 0.5rem',
                  borderRadius: '10px',
                  background: isActive ? 'hsl(var(--brand) / 0.25)' : 'rgba(255,255,255,0.06)',
                  color: isActive ? 'hsl(var(--brand))' : 'var(--mut)'
                }}>
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


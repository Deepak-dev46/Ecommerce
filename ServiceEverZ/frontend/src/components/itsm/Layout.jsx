import React from 'react';

const NAV_BY_CONTEXT = {
  'dashboard':   ['GENERAL','TICKETS'],
  'catalog':     ['GENERAL','TICKETS'],
  'create':      ['GENERAL','TICKETS'],
  'my-tickets':  ['GENERAL','TICKETS'],
  'detail':      ['GENERAL','TICKETS'],
  // Approval pages
  'l1-pending':  ['GENERAL','TICKETS','APPROVALS'],
  'l1-history':  ['GENERAL','TICKETS','APPROVALS'],
  'l2-pending':  ['GENERAL','TICKETS','APPROVALS'],
  'l2-history':  ['GENERAL','TICKETS','APPROVALS'],
  // Resource Owner pages — separate section
  'ro-pending':  ['GENERAL','TICKETS','RESOURCE_OWNER'],
  'ro-history':  ['GENERAL','TICKETS','RESOURCE_OWNER'],
  // Support pages
  'support-assigned': ['GENERAL','TICKETS','SUPPORT'],
  'support-open':     ['GENERAL','TICKETS','SUPPORT'],
  'support-history':  ['GENERAL','TICKETS','SUPPORT'],
  // Manager pages
  'manager-approvals':   ['GENERAL','TICKETS','MANAGER'],
  'manager-assignments': ['GENERAL','TICKETS','MANAGER'],
  'manager-unack':       ['GENERAL','TICKETS','MANAGER'],
  'manager-manual':      ['GENERAL','TICKETS','MANAGER'],
};

const ALL_NAV = [
  {
    section: 'GENERAL',
    items: [{ id:'dashboard', label:'Dashboard' }],
  },
  {
    section: 'TICKETS',
    items: [
      { id:'catalog',    label:'Create Ticket' },
      { id:'my-tickets', label:'My Tickets'    },
    ],
  },
  {
    section: 'APPROVALS',
    items: [
      { id:'l1-pending', label:'L1 Pending'  },
      { id:'l1-history', label:'L1 History'  },
      { id:'l2-pending', label:'L2 Pending'  },
      { id:'l2-history', label:'L2 History'  },
    ],
  },
  {
    section: 'RESOURCE_OWNER',
    items: [
      { id:'ro-pending', label:'RO Pending' },
      { id:'ro-history', label:'RO History' },
    ],
  },
  {
    section: 'SUPPORT',
    items: [
      { id:'support-assigned', label:'Need Acknowledgement' },
      { id:'support-open',     label:'Open / In Progress'   },
      { id:'support-history',  label:'Timeout History'      },
    ],
  },
  {
    section: 'MANAGER',
    items: [
      { id:'manager-approvals',   label:'Approval Queue'   },
      { id:'manager-assignments', label:'Assignments'      },
      { id:'manager-unack',       label:'Not Acknowledged' },
      { id:'manager-manual',      label:'Manual Assign'    },
    ],
  },
];

export default function Layout({ page, setPage, currentUser, children }) {
  const name     = currentUser?.fullName || [currentUser?.firstName, currentUser?.lastName].filter(Boolean).join(' ') || 'User';
  const initials = name.split(' ').map(w => w[0]).filter(Boolean).join('').toUpperCase().slice(0, 2) || 'U';

  const allowedSections = NAV_BY_CONTEXT[page] || ['GENERAL','TICKETS'];
  const visibleNav      = ALL_NAV.filter(s => allowedSections.includes(s.section));

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar__logo">
          <div className="topbar__logo-icon">S</div>
          <span className="topbar__logo-text">ServiceEverZ</span>
        </div>
        <div className="topbar__spacer" />
        <div className="topbar__actions">
          <button className="topbar__icon-btn" title="Notifications">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </button>
          <div className="topbar__avatar" title={name}>{initials}</div>
        </div>
      </header>

      <nav className="sidebar">
        {visibleNav.map(section => (
          <div key={section.section} className="sidebar__section">
            <div className="sidebar__section-label">{section.section.replace('_', ' ')}</div>
            {section.items.map(item => (
              <div key={item.id}
                className={`sidebar__item${page === item.id ? ' active' : ''}`}
                onClick={() => setPage(item.id)}>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        ))}
        {currentUser && (
          <div style={{ padding:'12px 16px', borderTop:'1px solid rgba(255,255,255,0.08)', marginTop:8 }}>
            <div style={{ fontSize:12, color:'rgba(255,255,255,0.7)', fontWeight:600 }}>{name}</div>
            {currentUser.email && <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginTop:2 }}>{currentUser.email}</div>}
          </div>
        )}
        <div className="sidebar__footer">© 2026 ServiceEverZ v1.0</div>
      </nav>

      <main className="main-content">{children}</main>
    </div>
  );
}

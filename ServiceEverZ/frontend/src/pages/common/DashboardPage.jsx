import React from 'react';

const CARDS = [
  { id:'catalog',          label:'Create Ticket',        sub:'Submit a new service request',            color:'var(--primary-800)' },
  { id:'my-tickets',       label:'My Tickets',           sub:'Track and manage your requests',          color:'var(--primary-800)' },
  { id:'l1-pending',       label:'L1 Approval Queue',    sub:'First-level pending approvals',           color:'#7C3AED' },
  { id:'l2-pending',       label:'L2 Approval Queue',    sub:'Second-level pending approvals',          color:'#7C3AED' },
  { id:'ro-pending',       label:'Resource Owner Queue', sub:'Final approval for "Others" item tickets',color:'#B45309' },
  { id:'support-assigned', label:'Support — Need Ack.',  sub:'Tickets requiring acknowledgement',       color:'var(--success)' },
  { id:'support-open',     label:'Support — Open',       sub:'Open and in-progress tickets',            color:'var(--success)' },
];

const MANAGER_LINK = { id:'manager-approvals', label:'ITSM Manager', sub:'Approval queue, assignments, unacknowledged, manual assign' };

export default function DashboardPage({ setPage, currentUser }) {
  const firstName = currentUser?.firstName || currentUser?.fullName?.split(' ')[0] || 'there';

  return (
    <div>
      <div className="page-header">
        <div className="page-header__title">Welcome, {firstName}</div>
        <div className="page-header__sub">
          {currentUser?.fullName && <span>{currentUser.fullName}</span>}
          {currentUser?.email && <span style={{ marginLeft:8, color:'var(--gray-4)' }}>· {currentUser.email}</span>}
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))', gap:'var(--space-4)', marginTop:'var(--space-4)', marginBottom:'var(--space-5)' }}>
        {CARDS.map(c => (
          <div key={c.id} className="card card--hoverable" onClick={() => setPage(c.id)}
            style={{ borderLeft:`3px solid ${c.color}` }}>
            <div style={{ fontWeight:700, color:'var(--primary-900)', marginBottom:4 }}>{c.label}</div>
            <div style={{ fontSize:12, color:'var(--gray-5)' }}>{c.sub}</div>
          </div>
        ))}
      </div>

      {/* ITSM Manager — separate link */}
      <div style={{ padding:'var(--space-4)', background:'var(--primary-50)', borderRadius:'var(--radius-md)', border:'1px solid var(--primary-100)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <div style={{ fontSize:14, fontWeight:700, color:'var(--primary-800)', marginBottom:2 }}>ITSM Manager Dashboard</div>
          <div style={{ fontSize:12, color:'var(--gray-6)' }}>Approval queue · Assignments · Not acknowledged · Manual assign</div>
        </div>
        <button className="btn btn--primary btn--sm" onClick={() => setPage('manager-approvals')}>
          Open Manager →
        </button>
      </div>
    </div>
  );
}

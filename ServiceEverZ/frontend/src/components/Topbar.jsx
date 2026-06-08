import React from 'react'
export default function Topbar({ userName, roleName }) {
  return (
    <div className="topbar">
      <div className="topbar-title">Knowledge Base</div>
      <div className="topbar-actions">
        <div className="topbar-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        </div>
        <div className="topbar-icon" style={{position:'relative'}}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          <div className="notif-badge">3</div>
        </div>
        <div className="user-chip">
          <div className="avatar">{userName?.charAt(0)}</div>
          <div className="user-info">
            <div className="name">{userName}</div>
            <div className="role">{roleName}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

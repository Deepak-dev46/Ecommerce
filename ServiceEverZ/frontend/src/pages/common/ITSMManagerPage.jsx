import React, { useState, useEffect, useCallback } from 'react';
import { approvalApi, assignmentApi, masterApi, ticketApi } from '../api';
import { apiFetch, SERVICE_URLS } from '../api/config';
import { formatDate, PAGE_SIZE } from '../utils/helpers';
import { Chip, Spinner, Button, InfoField, Pagination } from '../components/UI';

function BlurModal({ title, children, onClose, actionLabel, onAction, actionLoading, actionVariant = 'primary' }) {
  return (
    <div style={{ position:'fixed', inset:0, zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(6px)', WebkitBackdropFilter:'blur(6px)', background:'rgba(0,0,0,0.35)' }} onClick={onClose}>
      <div style={{ background:'var(--surface)', borderRadius:'var(--radius-lg, 12px)', boxShadow:'0 24px 60px rgba(0,0,0,0.25)', width:'90%', maxWidth:640, maxHeight:'85vh', overflowY:'auto', position:'relative' }} onClick={e => e.stopPropagation()}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 24px 16px', borderBottom:'1px solid var(--gray-1)' }}>
          <div style={{ fontWeight:700, fontSize:16, color:'var(--primary-900)' }}>{title}</div>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', fontSize:20, color:'var(--gray-5)', lineHeight:1, padding:'0 4px' }}>×</button>
        </div>
        <div style={{ padding:'20px 24px' }}>{children}</div>
        {onAction && (
          <div style={{ display:'flex', justifyContent:'flex-end', gap:12, padding:'12px 24px 20px', borderTop:'1px solid var(--gray-1)' }}>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button variant={actionVariant} onClick={onAction} loading={actionLoading}>{actionLabel || 'Action'}</Button>
          </div>
        )}
      </div>
    </div>
  );
}

const MANAGER_TABS = [
  { id:'approvals',   label:'Approval Queue'   },
  { id:'assignments', label:'Assignments'      },
  { id:'unack',       label:'Not Acknowledged' },
  { id:'manual',      label:'Manual Assign'    },
];

export default function ITSMManagerPage({ showSnack, defaultTab = 'approvals' }) {
  const [tab, setTab] = useState(defaultTab);
  useEffect(() => { setTab(defaultTab); }, [defaultTab]);

  return (
    <div>
      <div className="page-header" style={{ marginBottom:'var(--space-4)' }}>
        <div className="page-header__title">
          {MANAGER_TABS.find(t => t.id === tab)?.label}
        </div>
      </div>
      {tab === 'approvals'   && <ApprovalQueue   showSnack={showSnack} />}
      {tab === 'assignments' && <AssignmentView  showSnack={showSnack} />}
      {tab === 'unack'       && <Unacknowledged  showSnack={showSnack} />}
      {tab === 'manual'      && <ManualAssign    showSnack={showSnack} />}
    </div>
  );
}

/* ── Approval Queue ─────────────────────────────────────────────── */
function ApprovalQueue({ showSnack }) {
  const [l1, setL1]               = useState([]);
  const [l2, setL2]               = useState([]);
  const [loading, setLoading]     = useState(true);
  const [popup, setPopup]         = useState(null);
  const [popupLoading, setPL]     = useState(false);
  // View-only — no action state needed
  const [filter, setFilter]       = useState('ALL');
  const [page, setPage]           = useState(1);

  const load = useCallback(() => {
    setLoading(true);
    Promise.allSettled([approvalApi.getPendingL1(), approvalApi.getPendingL2()])
      .then(([r1, r2]) => {
        setL1(r1.status === 'fulfilled' ? (Array.isArray(r1.value) ? r1.value : []) : []);
        setL2(r2.status === 'fulfilled' ? (Array.isArray(r2.value) ? r2.value : []) : []);
      }).finally(() => setLoading(false));
  }, []);
  useEffect(() => { load(); }, [load]);

  const all      = [...l1.map(a => ({...a, level:'L1'})), ...l2.filter(a => !l1.find(x => x.ticketId === a.ticketId)).map(a => ({...a, level:'L2'}))];
  const filtered = filter === 'ALL' ? all : all.filter(a => a.level === filter);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openPopup = async (a) => {
    setPopup({ approval: a, ticket: null }); setPL(true);
    try { const t = await ticketApi.getById(a.ticketId); setPopup({ approval: a, ticket: t }); } catch {}
    finally { setPL(false); }
  };



  return (
    <div>
      <div className="tab-bar">
        {['ALL','L1','L2'].map(f => (
          <button key={f} className={`tab-btn${filter === f ? ' active' : ''}`} onClick={() => { setFilter(f); setPage(1); }}>{f}</button>
        ))}
      </div>
      {loading ? <Spinner /> : (
        <>
          <div style={{ background:'var(--surface)', border:'1px solid var(--gray-1)', borderRadius:'var(--radius-md)', overflow:'hidden' }}>
            <div style={{ display:'grid', gridTemplateColumns:'170px 60px 1fr 130px 100px 100px', padding:'10px 16px', background:'var(--primary-50)', borderBottom:'2px solid var(--primary-100)' }}>
              {['Ticket No.','Lvl','Subject','Requester','L1 Status','L2 Status'].map(h => (
                <div key={h} style={{ fontSize:11, fontWeight:700, color:'var(--primary-800)', textTransform:'uppercase', letterSpacing:0.5 }}>{h}</div>
              ))}
            </div>
            {paginated.length === 0 && <div style={{ padding:32, textAlign:'center', color:'var(--gray-4)' }}>No pending approvals</div>}
            {paginated.map(a => (
              <div key={a.approvalId} onClick={() => openPopup(a)}
                style={{ display:'grid', gridTemplateColumns:'170px 60px 1fr 130px 100px 100px', padding:'11px 16px', borderBottom:'1px solid var(--gray-1)', cursor:'pointer', transition:'background 0.12s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                onMouseLeave={e => e.currentTarget.style.background = ''}>
                <div style={{ fontSize:12, fontFamily:'monospace', color:'var(--primary-800)', fontWeight:700 }}>{a.ticketNumber || `#${a.ticketId}`}</div>
                <div style={{ alignSelf:'center' }}><span style={{ background:a.level==='L1'?'var(--primary-100)':'var(--accent-300)', color:a.level==='L1'?'var(--primary-800)':'var(--accent-900)', fontSize:10, fontWeight:700, padding:'2px 5px', borderRadius:3 }}>{a.level}</span></div>
                <div style={{ fontSize:13, color:'var(--gray-8)', alignSelf:'center' }}>{a.ticketSubject || `Ticket #${a.ticketId}`}</div>
                <div style={{ fontSize:12, color:'var(--gray-6)', alignSelf:'center' }}>{a.requesterName || '—'}</div>
                <div style={{ alignSelf:'center' }}><Chip status={a.l1Status} /></div>
                <div style={{ alignSelf:'center' }}><Chip status={a.l2Status || 'PENDING'} /></div>
              </div>
            ))}
          </div>
          <Pagination page={page} total={filtered.length} pageSize={PAGE_SIZE} onChange={setPage} />
        </>
      )}

      {popup && (
        <BlurModal
          title={`Ticket ${popup.approval.ticketNumber || '#' + popup.approval.ticketId} — ${popup.approval.level} Approval`}
          onClose={() => setPopup(null)}>
          {popupLoading ? <Spinner /> : <>
            {popup.ticket && (
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'var(--space-3)', marginBottom:'var(--space-4)' }}>
                <InfoField label="Subject"      value={popup.ticket.subject} />
                <InfoField label="Requested By" value={popup.ticket.requestedByName} />
                <InfoField label="Category"     value={popup.ticket.category} />
                <InfoField label="Sub-Category" value={popup.ticket.subCategory} />
                <InfoField label="Item"         value={popup.ticket.item} />
                <InfoField label="Priority"     value={popup.ticket.priority} />
                <InfoField label="Location"     value={popup.ticket.location} />
                <InfoField label="Mobile"       value={popup.ticket.mobileNumber} />
                <InfoField label="L1 Approver"  value={popup.approval.l1ApproverName || '—'} />
                <InfoField label="L2 Approver"  value={popup.approval.l2ApproverName || '—'} />
              </div>
            )}
            {/* View only — L1 and L2 status display */}
            <div style={{ borderTop:'1px solid var(--gray-1)', paddingTop:'var(--space-3)', display:'flex', gap:'var(--space-4)' }}>
              <div><div className="info-field__label">L1 Status</div><Chip status={popup.approval.l1Status}/></div>
              <div><div className="info-field__label">L2 Status</div><Chip status={popup.approval.l2Status||'PENDING'}/></div>
            </div>
          </>}
        </BlurModal>
      )}
    </div>
  );
}

/* ── Assignment View ────────────────────────────────────────────── */
function AssignmentView({ showSnack }) {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [filter, setFilter]           = useState('ALL');
  const [page, setPage]               = useState(1);
  const [popup, setPopup]             = useState(null);
  const [popupLoading, setPL]         = useState(false);

  useEffect(() => {
    setLoading(true);
    masterApi.getUsers('ACTIVE')
      .then(async users => {
        const arr = Array.isArray(users) ? users : [];
        const all = [];
        await Promise.allSettled(arr.map(async u => {
          try { const a = await assignmentApi.getByPerson(u.id); if (Array.isArray(a)) all.push(...a.map(x => ({...x, personEmail: u.email}))); } catch {}
        }));
        setAssignments(all.sort((a,b)=>new Date(b.assignedAt)-new Date(a.assignedAt)));
      })
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered  = filter === 'ALL' ? assignments.filter(a => ['ASSIGNED','OPEN'].includes(a.status)) : assignments.filter(a => a.status === filter);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openPopup = async (a) => {
    setPopup({ assignment: a, ticket: null }); setPL(true);
    try { const t = await ticketApi.getById(a.ticketId); setPopup({ assignment: a, ticket: t }); } catch {}
    finally { setPL(false); }
  };

  return (
    <div>
      <div className="tab-bar">
        {['ALL','ASSIGNED','OPEN'].map(f => (
          <button key={f} className={`tab-btn${filter === f ? ' active' : ''}`} onClick={() => { setFilter(f); setPage(1); }}>{f}</button>
        ))}
      </div>
      {loading ? <Spinner /> : (
        <>
          <div style={{ background:'var(--surface)', border:'1px solid var(--gray-1)', borderRadius:'var(--radius-md)', overflow:'hidden' }}>
            <div style={{ display:'grid', gridTemplateColumns:'170px 220px 90px 160px 100px', padding:'10px 16px', background:'var(--primary-50)', borderBottom:'2px solid var(--primary-100)' }}>
              {['Ticket No.','Assigned To','Priority','Assigned At','Status'].map(h => (
                <div key={h} style={{ fontSize:11, fontWeight:700, color:'var(--primary-800)', textTransform:'uppercase', letterSpacing:0.5 }}>{h}</div>
              ))}
            </div>
            {paginated.length === 0 && <div style={{ padding:32, textAlign:'center', color:'var(--gray-4)' }}>No records found</div>}
            {paginated.map(a => (
              <div key={a.assignmentId} onClick={() => openPopup(a)}
                style={{ display:'grid', gridTemplateColumns:'170px 220px 90px 160px 100px', padding:'11px 16px', borderBottom:'1px solid var(--gray-1)', cursor:'pointer', transition:'background 0.12s', background:'' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                onMouseLeave={e => e.currentTarget.style.background = ''}>
                <div style={{ fontSize:12, fontFamily:'monospace', color:'var(--primary-800)', fontWeight:700 }}>{a.ticketNumber || `#${a.ticketId}`}</div>
                <div>
                  <div style={{ fontSize:12, fontWeight:600, color:'var(--gray-8)' }}>{a.supportPersonName || '—'}</div>
                  {a.personEmail && <div style={{ fontSize:11, color:'var(--gray-4)', marginTop:1 }}>{a.personEmail}</div>}
                </div>
                <div style={{ alignSelf:'center' }}>{a.priority ? <Chip status={a.priority} label={a.priority} /> : '—'}</div>
                <div style={{ fontSize:12, color:'var(--gray-6)', alignSelf:'center' }}>{formatDate(a.assignedAt)}</div>
                <div style={{ alignSelf:'center' }}><Chip status={a.status} /></div>
              </div>
            ))}
          </div>
          <Pagination page={page} total={filtered.length} pageSize={PAGE_SIZE} onChange={setPage} />
        </>
      )}
      {popup && (
        <BlurModal title={`Assignment — ${popup.assignment.ticketNumber || '#' + popup.assignment.ticketId}`} onClose={() => setPopup(null)}>
          {popupLoading ? <Spinner /> : (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'var(--space-3)' }}>
              <InfoField label="Ticket No."   value={popup.assignment.ticketNumber || `#${popup.assignment.ticketId}`} />
              <InfoField label="Assigned To"  value={popup.assignment.supportPersonName} />
              <InfoField label="Priority"     value={popup.assignment.priority} />
              <InfoField label="Assigned At"  value={formatDate(popup.assignment.assignedAt)} />
              <InfoField label="Est. Hours"   value={popup.assignment.estimatedHours != null ? String(popup.assignment.estimatedHours) : '—'} />
              <InfoField label="Status"       value={popup.assignment.status} />
              {popup.ticket && <>
                <InfoField label="Subject"      value={popup.ticket.subject} />
                <InfoField label="Category"     value={popup.ticket.category} />
                <InfoField label="Sub-Category" value={popup.ticket.subCategory} />
                <InfoField label="Item"         value={popup.ticket.item} />
              </>}
            </div>
          )}
        </BlurModal>
      )}
    </div>
  );
}

/* ── Unacknowledged ─────────────────────────────────────────────── */
function Unacknowledged({ showSnack }) {
  const [items, setItems]   = useState([]);
  const [loading, setLoad]  = useState(true);
  const [page, setPage]     = useState(1);
  const [popup, setPopup]   = useState(null);
  const [popupLoading, setPL] = useState(false);

  const load = useCallback(() => {
    setLoad(true);
    masterApi.getUsers('ACTIVE')
      .then(async users => {
        const arr = Array.isArray(users) ? users : [];
        const unack = [];
        await Promise.allSettled(arr.map(async u => {
          try {
            const a = await assignmentApi.getByPerson(u.id);
            if (Array.isArray(a)) unack.push(...a.filter(x => x.status === 'ASSIGNED').map(x => ({...x, personEmail: u.email})));
          } catch {}
        }));
        setItems(unack);
      })
      .catch(() => {}).finally(() => setLoad(false));
  }, []);
  useEffect(() => { load(); }, [load]);

  const paginated = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const getTimeLeft = (assignedAt) => {
    if (!assignedAt) return { label:'—', expired:false };
    const diff = new Date(assignedAt).getTime() + 30 * 60 * 1000 - Date.now();
    if (diff <= 0) return { label:'TIMED OUT', expired:true };
    const m = Math.floor(diff / 60000), s = Math.floor((diff % 60000) / 1000);
    return { label:`${m}m ${s}s`, expired:false };
  };

  const openPopup = async (a) => {
    setPopup({ assignment: a, ticket: null }); setPL(true);
    try { const t = await ticketApi.getById(a.ticketId); setPopup({ assignment: a, ticket: t }); } catch {}
    finally { setPL(false); }
  };

  return (
    <div>
      <div className="alert alert--warning" style={{ marginBottom:'var(--space-4)' }}>
        These tickets are assigned but not yet acknowledged. Support personnel must acknowledge within 30 minutes. If timed out, the ITSM manager is notified automatically.
      </div>
      {loading ? <Spinner /> : items.length === 0 ? (
        <div className="card"><div className="empty-state"><div className="empty-state__title">All tickets acknowledged</div></div></div>
      ) : (
        <>
          <div style={{ background:'var(--surface)', border:'1px solid var(--gray-1)', borderRadius:'var(--radius-md)', overflow:'hidden' }}>
            <div style={{ display:'grid', gridTemplateColumns:'170px 60px 200px 160px 120px', padding:'10px 16px', background:'var(--error-bg)', borderBottom:'2px solid #F5AABA' }}>
              {['Ticket No.','Priority','Assigned To','Assigned At','Time Remaining'].map(h => (
                <div key={h} style={{ fontSize:11, fontWeight:700, color:'var(--error)', textTransform:'uppercase', letterSpacing:0.5 }}>{h}</div>
              ))}
            </div>
            {paginated.map(a => {
              const { label, expired } = getTimeLeft(a.assignedAt);
              return (
                <div key={a.assignmentId} onClick={() => openPopup(a)}
                  style={{ display:'grid', gridTemplateColumns:'170px 60px 200px 160px 120px', padding:'11px 16px', borderBottom:'1px solid var(--gray-1)', cursor:'pointer', transition:'background 0.12s', background:expired ? 'var(--error-bg)' : '#FFFDF0' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                  onMouseLeave={e => e.currentTarget.style.background = expired ? 'var(--error-bg)' : '#FFFDF0'}>
                  <div style={{ fontSize:12, fontFamily:'monospace', color:'var(--primary-800)', fontWeight:700 }}>{a.ticketNumber || `#${a.ticketId}`}</div>
                  <div style={{ alignSelf:'center' }}>{a.priority ? <Chip status={a.priority} label={a.priority} /> : '—'}</div>
                  <div>
                    <div style={{ fontSize:12, fontWeight:600, color:'var(--gray-8)' }}>{a.supportPersonName || '—'}</div>
                    {a.personEmail && <div style={{ fontSize:11, color:'var(--gray-4)', marginTop:1, wordBreak:'break-all' }}>{a.personEmail}</div>}
                  </div>
                  <div style={{ fontSize:12, color:'var(--gray-6)', alignSelf:'center' }}>{formatDate(a.assignedAt)}</div>
                  <div style={{ fontSize:12, fontWeight:700, color:expired ? 'var(--error)' : 'var(--warning)', alignSelf:'center' }}>{label}</div>
                </div>
              );
            })}
          </div>
          <Pagination page={page} total={items.length} pageSize={PAGE_SIZE} onChange={setPage} />
        </>
      )}
      {popup && (
        <BlurModal title={`Not Acknowledged — ${popup.assignment.ticketNumber || '#' + popup.assignment.ticketId}`} onClose={() => setPopup(null)}>
          {popupLoading ? <Spinner /> : (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'var(--space-3)' }}>
              <InfoField label="Ticket No."  value={popup.assignment.ticketNumber || `#${popup.assignment.ticketId}`} />
              <InfoField label="Assigned To" value={popup.assignment.supportPersonName} />
              <InfoField label="Email"       value={popup.assignment.personEmail || '—'} />
              <InfoField label="Priority"    value={popup.assignment.priority} />
              <InfoField label="Assigned At" value={formatDate(popup.assignment.assignedAt)} />
              {popup.ticket && <>
                <InfoField label="Subject"      value={popup.ticket.subject} />
                <InfoField label="Category"     value={popup.ticket.category} />
                <InfoField label="Sub-Category" value={popup.ticket.subCategory} />
                <InfoField label="Item"         value={popup.ticket.item} />
                <InfoField label="Requester"    value={popup.ticket.requestedByName} />
              </>}
            </div>
          )}
        </BlurModal>
      )}
    </div>
  );
}

/* ── Manual Assign ──────────────────────────────────────────────── */
function ManualAssign({ showSnack }) {
  const [persons, setPersons]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [processing, setProcessing]     = useState(false);
  const [ticketId, setTicketId]         = useState('');
  const [selectedPerson, setPerson]     = useState('');
  const [priority, setPriority]         = useState('MEDIUM');
  const [estimatedHours, setEstHours]   = useState('');
  const [log, setLog] = useState(() => {
    try { return JSON.parse(localStorage.getItem('itsm_manual_assign_log') || '[]'); } catch { return []; }
  });

  useEffect(() => {
    masterApi.getUsers('ACTIVE').then(d => setPersons(Array.isArray(d) ? d : [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleAssign = async () => {
    if (!ticketId || !selectedPerson) { showSnack('Enter ticket ID and select a person', 'warning'); return; }
    setProcessing(true);
    try {
      await apiFetch(SERVICE_URLS.ASSIGNMENT, '/api/assignments/trigger', {
        method: 'POST',
        body: {
          ticketId:        Number(ticketId),
          supportPersonId: Number(selectedPerson),
          priority,
          estimatedHours:  estimatedHours ? Number(estimatedHours) : null,
          responseTimeHours: 0.5,
        },
      });
      const person = persons.find(p => String(p.id) === String(selectedPerson));
      const entry  = { ticketId, personName: person?.fullName || `#${selectedPerson}`, personEmail: person?.email || '—', priority, estimatedHours: estimatedHours || '—', assignedAt: new Date().toISOString() };
      const newLog = [entry, ...log];
      setLog(newLog);
      try { localStorage.setItem('itsm_manual_assign_log', JSON.stringify(newLog.slice(0, 100))); } catch {}
      showSnack(`Ticket #${ticketId} assigned to ${person?.fullName || 'selected person'}. Email notification sent.`, 'success');
      setTicketId(''); setPerson(''); setPriority('MEDIUM'); setEstHours('');
    } catch (e) { showSnack(e.message || 'Assignment failed', 'error'); }
    finally { setProcessing(false); }
  };

  return (
    <div style={{ display:'grid', gridTemplateColumns:'360px 1fr', gap:'var(--space-5)', alignItems:'start' }}>
      <div className="card">
        <div className="card__title" style={{ marginBottom:'var(--space-5)' }}>Manual Assignment</div>
        <div className="alert alert--info" style={{ marginBottom:'var(--space-4)' }}>
          Assigning manually sends an email to the support person. They must acknowledge within 30 minutes; if not, the ticket is auto-reassigned and the ITSM manager is notified.
        </div>
        {loading ? <Spinner /> : <>
          <div className="form-group">
            <label className="form-label">Ticket ID <span className="required">*</span></label>
            <input className="form-control" type="number" min="1" value={ticketId} onChange={e => setTicketId(e.target.value)} placeholder="e.g. 21" />
          </div>
          <div className="form-group">
            <label className="form-label">Assign To <span className="required">*</span></label>
            <select className="form-control" value={selectedPerson} onChange={e => setPerson(e.target.value)}>
              <option value="">— Select support person —</option>
              {persons.map(p => <option key={p.id} value={p.id}>{p.fullName} ({p.email})</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Priority</label>
            <select className="form-control" value={priority} onChange={e => setPriority(e.target.value)}>
              {['HIGH','MEDIUM','LOW'].map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Estimated Hours</label>
            <input type="number" className="form-control" min="0.5" step="0.5" value={estimatedHours} onChange={e => setEstHours(e.target.value)} placeholder="e.g. 4" />
          </div>
          <Button variant="primary" fullWidth onClick={handleAssign} loading={processing}>Assign &amp; Notify</Button>
        </>}
      </div>

      <div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'var(--space-4)' }}>
          <div style={{ fontWeight:700, color:'var(--primary-900)', fontSize:15 }}>Assignment History ({log.length})</div>
          {log.length > 0 && <button className="btn btn--ghost btn--sm" onClick={() => { setLog([]); try { localStorage.removeItem('itsm_manual_assign_log'); } catch {} }}>Clear</button>}
        </div>
        {log.length === 0 ? (
          <div className="card" style={{ textAlign:'center', padding:'var(--space-8)' }}><div style={{ color:'var(--gray-4)', fontSize:13 }}>No manual assignments yet</div></div>
        ) : (
          <div style={{ background:'var(--surface)', border:'1px solid var(--gray-1)', borderRadius:'var(--radius-md)', overflow:'hidden' }}>
            <div style={{ display:'grid', gridTemplateColumns:'90px 1fr 90px 80px 140px', padding:'10px 14px', background:'var(--primary-50)', borderBottom:'2px solid var(--primary-100)' }}>
              {['Ticket','Assigned To','Priority','Est. Hrs','Assigned At'].map(h => (
                <div key={h} style={{ fontSize:11, fontWeight:700, color:'var(--primary-800)', textTransform:'uppercase', letterSpacing:0.5 }}>{h}</div>
              ))}
            </div>
            {log.map((a, i) => (
              <div key={i} style={{ display:'grid', gridTemplateColumns:'90px 1fr 90px 80px 140px', padding:'11px 14px', borderBottom:'1px solid var(--gray-1)', alignItems:'center' }}>
                <div style={{ fontFamily:'monospace', fontWeight:700, color:'var(--primary-800)' }}>{`#${a.ticketId}`}</div>
                <div><div style={{ fontSize:12, fontWeight:600 }}>{a.personName}</div><div style={{ fontSize:11, color:'var(--gray-4)' }}>{a.personEmail}</div></div>
                <div><Chip status={a.priority} label={a.priority} /></div>
                <div style={{ fontSize:12, color:'var(--gray-7)' }}>{a.estimatedHours}</div>
                <div style={{ fontSize:12, color:'var(--gray-5)' }}>{formatDate(a.assignedAt)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

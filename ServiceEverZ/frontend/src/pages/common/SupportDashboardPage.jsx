import React, { useState, useEffect, useCallback, useRef } from 'react';
import { assignmentApi, masterApi, ticketApi } from '../api';
import { formatDate, PAGE_SIZE, getAckTimeLeft } from '../utils/helpers';
import { Chip, Spinner, Button, InfoField, Pagination } from '../components/UI';

/* ── Blur Popup Modal ─────────────────────────────────────────── */
function BlurModal({ title, children, onClose, actionLabel, onAction, actionLoading, actionVariant = 'success' }) {
  return (
    <div style={{ position:'fixed', inset:0, zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(6px)', WebkitBackdropFilter:'blur(6px)', background:'rgba(0,0,0,0.35)' }} onClick={onClose}>
      <div style={{ background:'var(--surface)', borderRadius:12, boxShadow:'0 24px 60px rgba(0,0,0,0.25)', width:'90%', maxWidth:560, maxHeight:'88vh', overflowY:'auto' }} onClick={e => e.stopPropagation()}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 24px 16px', borderBottom:'1px solid var(--gray-1)', position:'sticky', top:0, background:'var(--surface)', zIndex:1 }}>
          <div style={{ fontWeight:700, fontSize:16, color:'var(--primary-900)' }}>{title}</div>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', fontSize:22, color:'var(--gray-5)', lineHeight:1, padding:'0 4px' }}>×</button>
        </div>
        <div style={{ padding:'20px 24px' }}>{children}</div>
        {onAction && (
          <div style={{ display:'flex', justifyContent:'flex-end', gap:12, padding:'12px 24px 20px', borderTop:'1px solid var(--gray-1)' }}>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button variant={actionVariant} onClick={onAction} loading={actionLoading}>{actionLabel}</Button>
          </div>
        )}
      </div>
    </div>
  );
}

function AckCountdown({ assignedAt, onTimeout }) {
  const [info, setInfo]   = useState(() => getAckTimeLeft(assignedAt));
  const timedRef          = useRef(false);
  useEffect(() => {
    const t = setInterval(() => {
      const i = getAckTimeLeft(assignedAt);
      setInfo(i);
      if (i?.timed && !timedRef.current) { timedRef.current = true; onTimeout?.(); }
    }, 1000);
    return () => clearInterval(t);
  }, [assignedAt, onTimeout]);
  if (!info) return null;
  return (
    <span style={{ fontSize:11, fontWeight:600, color:info.timed ? 'var(--error)' : 'var(--warning)', background:info.timed ? 'var(--error-bg)' : 'var(--warning-bg)', padding:'2px 7px', borderRadius:4, display:'inline-block' }}>
      {info.label}
    </span>
  );
}

const HISTORY_KEY = 'itsm_support_timeout_history';
const loadTimeoutHistory = () => { try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); } catch { return []; } };
const saveTimeoutHistory = h => { try { localStorage.setItem(HISTORY_KEY, JSON.stringify(h.slice(0, 200))); } catch {} };

export default function SupportDashboardPage({ showSnack, defaultTab = 'ASSIGNED' }) {
  const [supportPersons,   setSupportPersons]   = useState([]);
  const [selectedPersonId, setSelectedPersonId] = useState(null);
  const [selectedPerson,   setSelectedPerson]   = useState(null);
  const [assignments,      setAssignments]      = useState([]);
  const [loading,          setLoading]          = useState(false);
  const [personLoading,    setPersonLoading]    = useState(true);
  const [tab,              setTab]              = useState(defaultTab);
  const [currentPage,      setCurrentPage]      = useState(1);
  const [timedOut,         setTimedOut]         = useState({});
  const [timeoutHistory,   setTimeoutHistory]   = useState(loadTimeoutHistory);

  // Popup state
  const [popup,        setPopup]        = useState(null);  // { assignment, ticket, isTimedOut }
  const [popupLoading, setPopupLoading] = useState(false);
  const [processing,   setProcessing]   = useState(false);
  const [detailPopup,  setDetailPopup]  = useState(null);
  const [detailLoading,setDetailLoading]= useState(false);

  useEffect(() => { setTab(defaultTab); setCurrentPage(1); }, [defaultTab]);

  useEffect(() => {
    setPersonLoading(true);
    masterApi.getUsers('ACTIVE')
      .then(users => {
        const arr = Array.isArray(users) ? users : [];
        setSupportPersons(arr);
        if (arr.length > 0) { setSelectedPersonId(arr[0].id); setSelectedPerson(arr[0]); }
      })
      .catch(() => {})
      .finally(() => setPersonLoading(false));
  }, []);

  const load = useCallback(() => {
    if (!selectedPersonId) return;
    setLoading(true);
    assignmentApi.getByPerson(selectedPersonId)
      .then(d => { setAssignments(Array.isArray(d) ? d : []); setCurrentPage(1); setTimedOut({}); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedPersonId]);

  useEffect(() => { load(); }, [load]);

  const handlePersonChange = (e) => {
    const id = Number(e.target.value);
    const p  = supportPersons.find(x => x.id === id);
    setSelectedPersonId(id); setSelectedPerson(p || null);
    setAssignments([]); setTimedOut({}); setPopup(null); setDetailPopup(null);
  };

  // When countdown hits zero, add to timeout history
  const handleTimeout = useCallback((a) => {
    setTimedOut(prev => {
      if (prev[a.assignmentId]) return prev;
      const entry = {
        assignmentId:      a.assignmentId,
        ticketId:          a.ticketId,
        ticketNumber:      a.ticketNumber,
        supportPersonName: selectedPerson?.fullName || a.supportPersonName,
        priority:          a.priority,
        assignedAt:        a.assignedAt,
        timedOutAt:        new Date().toISOString(),
      };
      const nh = [entry, ...timeoutHistory];
      setTimeoutHistory(nh); saveTimeoutHistory(nh);
      return { ...prev, [a.assignmentId]: true };
    });
  }, [selectedPerson, timeoutHistory]);

  const openAckPopup = async (a) => {
    const isTO = !!timedOut[a.assignmentId];
    setPopup({ assignment: a, ticket: null, isTimedOut: isTO });
    setPopupLoading(true);
    try { const t = await ticketApi.getById(a.ticketId); setPopup(prev => ({ ...prev, ticket: t })); } catch {}
    finally { setPopupLoading(false); }
  };

  const openDetailPopup = async (a) => {
    setDetailPopup({ assignment: a, ticket: null });
    setDetailLoading(true);
    try { const t = await ticketApi.getById(a.ticketId); setDetailPopup(prev => ({ ...prev, ticket: t })); } catch {}
    finally { setDetailLoading(false); }
  };

  const openHistoryDetail = async (entry) => {
    setDetailPopup({ assignment: entry, ticket: null });
    setDetailLoading(true);
    try { const t = await ticketApi.getById(entry.ticketId); setDetailPopup(prev => ({ ...prev, ticket: t })); } catch {}
    finally { setDetailLoading(false); }
  };

  const acknowledge = async () => {
    setProcessing(true);
    try {
      await assignmentApi.acknowledge({ ticketId: popup.assignment.ticketId, supportPersonId: selectedPersonId });
      showSnack('Ticket acknowledged. Status updated to OPEN.', 'success');
      setPopup(null); load();
    } catch (e) { showSnack(e.message || 'Failed', 'error'); }
    finally { setProcessing(false); }
  };

  const displayed = assignments.filter(a =>
    tab === 'ASSIGNED' ? a.status === 'ASSIGNED' :
    tab === 'OPEN'     ? a.status === 'OPEN'     : false
  );
  const counts = {
    ASSIGNED: assignments.filter(a => a.status === 'ASSIGNED').length,
    OPEN:     assignments.filter(a => a.status === 'OPEN').length,
    HISTORY:  timeoutHistory.length,
  };
  const paginated = displayed.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const historyPaged = timeoutHistory.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div>
      <div className="page-header" style={{ marginBottom:'var(--space-4)' }}>
        <div className="page-header__title">Support Dashboard</div>
        <div className="page-header__sub">{counts['ASSIGNED'] || 0} ticket(s) need acknowledgement within 30 minutes</div>
      </div>

      {/* Person selector */}
      <div className="card mb-4" style={{ padding:'var(--space-4)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'var(--space-5)', flexWrap:'wrap' }}>
          <div>
            <div className="form-label" style={{ marginBottom:4 }}>Viewing dashboard for:</div>
            {personLoading ? <div style={{ fontSize:13, color:'var(--gray-5)' }}>Loading...</div> : (
              <select className="form-control" value={selectedPersonId || ''} onChange={handlePersonChange} style={{ minWidth:260 }}>
                <option value="" disabled>Select support person</option>
                {supportPersons.map(p => <option key={p.id} value={p.id}>{p.fullName} ({p.email})</option>)}
              </select>
            )}
          </div>
          {selectedPerson && (
            <div style={{ fontSize:13, color:'var(--gray-6)' }}>
              <div><strong>{selectedPerson.fullName}</strong></div>
              <div>{selectedPerson.email}</div>
              {selectedPerson.designation && <div style={{ fontSize:12, color:'var(--gray-4)' }}>{selectedPerson.designation}</div>}
            </div>
          )}
        </div>
      </div>

      {/* ASSIGNED tab */}
      {tab === 'ASSIGNED' && (
        loading ? <Spinner /> : paginated.length === 0 ? (
          <div className="card"><div className="empty-state"><div className="empty-state__title">No tickets needing acknowledgement</div></div></div>
        ) : (
          <>
            <div style={{ background:'var(--surface)', border:'1px solid var(--gray-1)', borderRadius:'var(--radius-md)', overflow:'hidden' }}>
              <div style={{ display:'grid', gridTemplateColumns:'160px 90px 160px 90px 140px 130px', background:'var(--primary-50)', borderBottom:'2px solid var(--primary-100)', padding:'10px 14px' }}>
                {['Ticket No.','Priority','Assigned At','Est. Hrs','Timer','Action'].map(h => (
                  <div key={h} style={{ fontSize:11, fontWeight:700, color:'var(--primary-800)', textTransform:'uppercase', letterSpacing:0.5 }}>{h}</div>
                ))}
              </div>
              {paginated.map(a => {
                const isTO = !!timedOut[a.assignmentId];
                return (
                  <div key={a.assignmentId} onClick={() => openAckPopup(a)}
                    style={{ display:'grid', gridTemplateColumns:'160px 90px 160px 90px 140px 130px', padding:'12px 14px', borderBottom:'1px solid var(--gray-1)', alignItems:'center', cursor:'pointer', transition:'background 0.12s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}>
                    <div style={{ fontWeight:700, color:'var(--primary-900)', fontSize:12, fontFamily:'monospace' }}>{a.ticketNumber || `#${a.ticketId}`}</div>
                    <div>{a.priority ? <Chip status={a.priority} label={a.priority} /> : '—'}</div>
                    <div style={{ fontSize:12, color:'var(--gray-6)' }}>{formatDate(a.assignedAt)}</div>
                    <div style={{ fontSize:13, color:'var(--gray-7)' }}>{a.estimatedHours != null ? `${a.estimatedHours} hrs` : (a.responseTimeHours != null ? `${a.responseTimeHours} hrs` : '—')}</div>
                    <div>{a.assignedAt && <AckCountdown assignedAt={a.assignedAt} onTimeout={() => handleTimeout(a)} />}</div>
                    <div style={{ display:'flex', justifyContent:'flex-end' }}>
                      <Button size="sm" variant={isTO ? 'ghost' : 'success'}
                        onClick={e => { e.stopPropagation(); openAckPopup(a); }}>
                        {isTO ? 'View Details' : 'Acknowledge'}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
            <Pagination page={currentPage} total={displayed.length} pageSize={PAGE_SIZE} onChange={setCurrentPage} />
          </>
        )
      )}

      {/* OPEN tab */}
      {tab === 'OPEN' && (
        loading ? <Spinner /> : paginated.length === 0 ? (
          <div className="card"><div className="empty-state"><div className="empty-state__title">No open tickets</div></div></div>
        ) : (
          <>
            <div style={{ background:'var(--surface)', border:'1px solid var(--gray-1)', borderRadius:'var(--radius-md)', overflow:'hidden' }}>
              <div style={{ display:'grid', gridTemplateColumns:'160px 90px 160px 90px 130px', background:'var(--primary-50)', borderBottom:'2px solid var(--primary-100)', padding:'10px 14px' }}>
                {['Ticket No.','Priority','Assigned At','Est. Hrs','Status'].map(h => (
                  <div key={h} style={{ fontSize:11, fontWeight:700, color:'var(--primary-800)', textTransform:'uppercase', letterSpacing:0.5 }}>{h}</div>
                ))}
              </div>
              {paginated.map(a => (
                <div key={a.assignmentId} onClick={() => openDetailPopup(a)}
                  style={{ display:'grid', gridTemplateColumns:'160px 90px 160px 90px 130px', padding:'12px 14px', borderBottom:'1px solid var(--gray-1)', alignItems:'center', cursor:'pointer', transition:'background 0.12s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <div style={{ fontWeight:700, color:'var(--primary-900)', fontSize:12, fontFamily:'monospace' }}>{a.ticketNumber || `#${a.ticketId}`}</div>
                  <div>{a.priority ? <Chip status={a.priority} label={a.priority} /> : '—'}</div>
                  <div style={{ fontSize:12, color:'var(--gray-6)' }}>{formatDate(a.assignedAt)}</div>
                  <div style={{ fontSize:13, color:'var(--gray-7)' }}>{a.estimatedHours != null ? `${a.estimatedHours} hrs` : '—'}</div>
                  <div><Chip status={a.status} /></div>
                </div>
              ))}
            </div>
            <Pagination page={currentPage} total={displayed.length} pageSize={PAGE_SIZE} onChange={setCurrentPage} />
          </>
        )
      )}

      {/* ── HISTORY tab — timed-out / not acknowledged ── */}
      {tab === 'HISTORY' && (
        timeoutHistory.length === 0 ? (
          <div className="card"><div className="empty-state">
            <div className="empty-state__title">No timeout history</div>
            <div className="empty-state__sub">Tickets that time out without acknowledgement appear here</div>
          </div></div>
        ) : (
          <>
            <div className="alert alert--warning" style={{ marginBottom:'var(--space-4)' }}>
              These tickets were not acknowledged within 30 minutes. They have been auto-reassigned.
            </div>
            <div style={{ background:'var(--surface)', border:'1px solid var(--gray-1)', borderRadius:'var(--radius-md)', overflow:'hidden' }}>
              <div style={{ display:'grid', gridTemplateColumns:'160px 90px 200px 160px 160px', background:'var(--error-bg)', borderBottom:'2px solid #F5AABA', padding:'10px 14px' }}>
                {['Ticket No.','Priority','Assigned To','Assigned At','Timed Out At'].map(h => (
                  <div key={h} style={{ fontSize:11, fontWeight:700, color:'var(--error)', textTransform:'uppercase', letterSpacing:0.5 }}>{h}</div>
                ))}
              </div>
              {historyPaged.map((entry, i) => (
                <div key={i} onClick={() => openHistoryDetail(entry)}
                  style={{ display:'grid', gridTemplateColumns:'160px 90px 200px 160px 160px', padding:'12px 14px', borderBottom:'1px solid var(--gray-1)', alignItems:'center', cursor:'pointer', transition:'background 0.12s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <div style={{ fontWeight:700, color:'var(--primary-900)', fontSize:12, fontFamily:'monospace' }}>{entry.ticketNumber || `#${entry.ticketId}`}</div>
                  <div>{entry.priority ? <Chip status={entry.priority} label={entry.priority} /> : '—'}</div>
                  <div style={{ fontSize:12, color:'var(--gray-7)' }}>{entry.supportPersonName || '—'}</div>
                  <div style={{ fontSize:12, color:'var(--gray-6)' }}>{formatDate(entry.assignedAt)}</div>
                  <div style={{ fontSize:12, color:'var(--error)', fontWeight:600 }}>{formatDate(entry.timedOutAt)}</div>
                </div>
              ))}
            </div>
            <Pagination page={currentPage} total={timeoutHistory.length} pageSize={PAGE_SIZE} onChange={setCurrentPage} />
          </>
        )
      )}

      {/* Acknowledge popup — blur modal with ticket details */}
      {popup && (
        <BlurModal
          title={popup.isTimedOut
            ? `Ticket Details — ${popup.assignment.ticketNumber || '#' + popup.assignment.ticketId}`
            : `Acknowledge — ${popup.assignment.ticketNumber || '#' + popup.assignment.ticketId}`}
          onClose={() => setPopup(null)}
          actionLabel="Acknowledge"
          onAction={popup.isTimedOut ? null : acknowledge}
          actionLoading={processing}
          actionVariant="success">
          {popupLoading ? <Spinner /> : (
            <>
              {popup.isTimedOut && (
                <div className="alert alert--warning" style={{ marginBottom:'var(--space-4)' }}>
                  This ticket timed out without acknowledgement and has been auto-reassigned.
                </div>
              )}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'var(--space-3)', marginBottom:'var(--space-4)' }}>
                <InfoField label="Ticket No."     value={popup.assignment.ticketNumber || `#${popup.assignment.ticketId}`} />
                <InfoField label="Priority"        value={popup.assignment.priority} />
                {popup.ticket && <>
                  <InfoField label="Category"      value={popup.ticket.category} />
                  <InfoField label="Sub-Category"  value={popup.ticket.subCategory} />
                  <InfoField label="Item"          value={popup.ticket.item} />
                  <InfoField label="Requested By"  value={popup.ticket.requestedByName} />
                </>}
                <InfoField label="Assigned At"    value={formatDate(popup.assignment.assignedAt)} />
                <InfoField label="Assigned To"    value={selectedPerson?.fullName || '—'} />
                <InfoField label="Estimated Hours" value={
                  popup.assignment.estimatedHours != null
                    ? `${popup.assignment.estimatedHours} hrs`
                    : popup.assignment.responseTimeHours != null
                      ? `${popup.assignment.responseTimeHours} hrs`
                      : 'Not specified'
                } />
              </div>
              {!popup.isTimedOut && (
                <div className="alert alert--success">
                  Acknowledging updates this ticket to <strong>OPEN</strong> and notifies the requester.
                </div>
              )}
            </>
          )}
        </BlurModal>
      )}

      {/* Detail popup for OPEN / History rows */}
      {detailPopup && (
        <BlurModal
          title={`Ticket Details — ${detailPopup.assignment.ticketNumber || '#' + detailPopup.assignment.ticketId}`}
          onClose={() => setDetailPopup(null)}>
          {detailLoading ? <Spinner /> : (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'var(--space-3)' }}>
              <InfoField label="Ticket No."   value={detailPopup.assignment.ticketNumber || `#${detailPopup.assignment.ticketId}`} />
              <InfoField label="Priority"     value={detailPopup.assignment.priority} />
              {detailPopup.ticket && <>
                <InfoField label="Subject"      value={detailPopup.ticket.subject} />
                <InfoField label="Category"     value={detailPopup.ticket.category} />
                <InfoField label="Sub-Category" value={detailPopup.ticket.subCategory} />
                <InfoField label="Item"         value={detailPopup.ticket.item} />
                <InfoField label="Requested By" value={detailPopup.ticket.requestedByName} />
                <InfoField label="Priority"     value={detailPopup.ticket.priority} />
              </>}
              <InfoField label="Assigned At"  value={formatDate(detailPopup.assignment.assignedAt)} />
              {detailPopup.assignment.timedOutAt && (
                <InfoField label="Timed Out At" value={formatDate(detailPopup.assignment.timedOutAt)} />
              )}
              <InfoField label="Est. Hours"   value={
                detailPopup.assignment.estimatedHours != null
                  ? `${detailPopup.assignment.estimatedHours} hrs`
                  : 'Not specified'
              } />
            </div>
          )}
        </BlurModal>
      )}
    </div>
  );
}

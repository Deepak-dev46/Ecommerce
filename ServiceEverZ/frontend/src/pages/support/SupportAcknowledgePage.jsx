import React, { useState, useEffect, useCallback, useRef } from 'react';
import { formatDate, PAGE_SIZE, getAckTimeLeft } from '../../utils/helpers';
import { Chip, Spinner, Button, InfoField, Pagination } from '../../components/itsm/UI';
import { assignmentApi, ticketApi } from '../../api/ourApi';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
 
function BlurModal({ title, children, onClose, actionLabel, onAction, actionLoading, actionVariant = 'success' }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', background: 'rgba(0,0,0,0.35)' }} onClick={onClose}>
      <div style={{ background: 'var(--surface)', borderRadius: 12, boxShadow: '0 24px 60px rgba(0,0,0,0.25)', width: '90%', maxWidth: 560, maxHeight: '88vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 16px', borderBottom: '1px solid var(--gray-1)', position: 'sticky', top: 0, background: 'var(--surface)', zIndex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--primary-900)' }}>{title}</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: 'var(--gray-5)', lineHeight: 1, padding: '0 4px' }}>×</button>
        </div>
        <div style={{ padding: '20px 24px' }}>{children}</div>
        {onAction && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, padding: '12px 24px 20px', borderTop: '1px solid var(--gray-1)' }}>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button variant={actionVariant} onClick={onAction} loading={actionLoading}>{actionLabel}</Button>
          </div>
        )}
      </div>
    </div>
  );
}
 
function AckCountdown({ assignedAt, onTimeout }) {
  const [info, setInfo] = useState(() => getAckTimeLeft(assignedAt));
  const timedRef = useRef(false);
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
    <span style={{ fontSize: 11, fontWeight: 600, color: info.timed ? 'var(--error)' : 'var(--warning)', background: info.timed ? 'var(--error-bg)' : 'var(--warning-bg)', padding: '2px 7px', borderRadius: 4, display: 'inline-block' }}>
      {info.label}
    </span>
  );
}
 
const HISTORY_KEY = 'itsm_support_timeout_history';
const loadTimeoutHistory = () => { try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); } catch { return []; } };
const saveTimeoutHistory = h => { try { localStorage.setItem(HISTORY_KEY, JSON.stringify(h.slice(0, 200))); } catch { } };
 
export default function SupportAcknowledgePage({ showSnack, defaultTab = 'ASSIGNED' }) {
  const { user } = useAuth();
  const loggedInUserId = user?.userId;
  const loggedInName = user?.fullName || user?.email || 'You';
 
  // Safe notification — works whether showSnack prop is passed or not
  const notify = useCallback((msg, type = 'success') => {
    if (typeof showSnack === 'function') {
      showSnack(msg, type);
    } else {
      type === 'error' ? toast.error(msg) : toast.success(msg);
    }
  }, [showSnack]);
 
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState(defaultTab);
  const [currentPage, setCurrentPage] = useState(1);
  const [timedOut, setTimedOut] = useState({});
  const [timeoutHistory, setTimeoutHistory] = useState(loadTimeoutHistory);
 
  const [popup, setPopup] = useState(null);
  const [popupLoading, setPopupLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [detailPopup, setDetailPopup] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
 
  useEffect(() => { setTab(defaultTab); setCurrentPage(1); }, [defaultTab]);
 
  const load = useCallback(() => {
    if (!loggedInUserId) return;
    setLoading(true);
    assignmentApi.getByPerson(loggedInUserId)
      .then(d => {
        setAssignments(Array.isArray(d) ? d : []);
        setCurrentPage(1);
        setTimedOut({});
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [loggedInUserId]);
 
  useEffect(() => { load(); }, [load]);
 
  const handleTimeout = useCallback((a) => {
    setTimedOut(prev => {
      if (prev[a.assignmentId]) return prev;
      const entry = {
        assignmentId: a.assignmentId, ticketId: a.ticketId,
        ticketNumber: a.ticketNumber, supportPersonName: loggedInName,
        priority: a.priority, assignedAt: a.assignedAt,
        timedOutAt: new Date().toISOString(),
      };
      const nh = [entry, ...timeoutHistory];
      setTimeoutHistory(nh);
      saveTimeoutHistory(nh);
      return { ...prev, [a.assignmentId]: true };
    });
  }, [loggedInName, timeoutHistory]);
 
  const openAckPopup = async (a) => {
    setPopup({ assignment: a, ticket: null, isTimedOut: !!timedOut[a.assignmentId] });
    setPopupLoading(true);
    try { const t = await ticketApi.getById(a.ticketId); setPopup(prev => ({ ...prev, ticket: t })); } catch { }
    finally { setPopupLoading(false); }
  };
 
  const openDetailPopup = async (a) => {
    setDetailPopup({ assignment: a, ticket: null });
    setDetailLoading(true);
    try { const t = await ticketApi.getById(a.ticketId); setDetailPopup(prev => ({ ...prev, ticket: t })); } catch { }
    finally { setDetailLoading(false); }
  };
 
  const openHistoryDetail = async (entry) => {
    setDetailPopup({ assignment: entry, ticket: null });
    setDetailLoading(true);
    try { const t = await ticketApi.getById(entry.ticketId); setDetailPopup(prev => ({ ...prev, ticket: t })); } catch { }
    finally { setDetailLoading(false); }
  };
 
  // const acknowledge = async () => {
  //   setProcessing(true);
  //   try {
  //     await assignmentApi.acknowledge({
  //       ticketId: popup.assignment.ticketId,
  //       supportPersonId: loggedInUserId,
  //     });
 
  //     // FIX: show success toast immediately
  //     toast.success('✅ Ticket acknowledged successfully! Status updated to In Progress.');
 
  //     // FIX: close popup, reload assignments, then switch to OPEN tab so user sees it
  //     setPopup(null);
  //     setCurrentPage(1);
 
  //     assignmentApi.getByPerson(loggedInUserId)
  //       .then(d => {
  //         setAssignments(Array.isArray(d) ? d : []);
  //         setTab('OPEN');   // auto-switch so the acknowledged ticket is visible immediately
  //       })
  //       .catch(() => {
  //         notify('Acknowledged, but failed to refresh list', 'error');
  //       });
 
  //   } catch (e) {
  //     notify(e?.response?.data?.message || e.message || 'Failed to acknowledge', 'error');
  //   } finally {
  //     setProcessing(false);
  //   }
  // };
 
 
  const acknowledge = async () => {
    setProcessing(true);
    try {
      await assignmentApi.acknowledge({
        ticketId:        popup.assignment.ticketId,
        supportPersonId: loggedInUserId,
      });
 
      toast.success('✅ Ticket acknowledged! It is now In Progress.');
      setPopup(null);
      setCurrentPage(1);
 
      // FIX: reload assignments first, then switch tab — ensures OPEN list is populated
      const d = await assignmentApi.getByPerson(loggedInUserId);
      setAssignments(Array.isArray(d) ? d : []);
      setTab('OPEN');   // now tab switches AFTER data is set
 
    } catch (e) {
      notify(e?.response?.data?.message || e.message || 'Failed to acknowledge', 'error');
    } finally {
      setProcessing(false);
    }
  };
 
 
 
  // const displayed = assignments.filter(a =>
  //   tab === 'ASSIGNED' ? a.status === 'ASSIGNED' :
  //   tab === 'OPEN'     ? a.status === 'OPEN'     : false
  // );
  // const counts = {
  //   ASSIGNED: assignments.filter(a => a.status === 'ASSIGNED').length,
  //   OPEN:     assignments.filter(a => a.status === 'OPEN').length,
  //   HISTORY:  timeoutHistory.length,
  // };
 
  const displayed = assignments.filter(a =>
    // FIX: REASSIGNED means the 30-min scheduler fired and re-assigned.
    // Show it in Pending Ack so the new assignee can still acknowledge.
    tab === 'ASSIGNED' ? (a.status === 'ASSIGNED' || a.status === 'REASSIGNED') :
      tab === 'OPEN' ? a.status === 'OPEN' : false
  );
  const counts = {
    ASSIGNED: assignments.filter(a => a.status === 'ASSIGNED' || a.status === 'REASSIGNED').length,
    OPEN: assignments.filter(a => a.status === 'OPEN').length,
    HISTORY: timeoutHistory.length,
  };
 
 
  const paginated = displayed.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const historyPaged = timeoutHistory.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
 
  return (
    <div>
      <div className="page-header" style={{ marginBottom: 'var(--space-4)' }}>
        <div className="page-header__title">Support Dashboard — {loggedInName}</div>
        <div className="page-header__sub">{counts.ASSIGNED} ticket(s) need acknowledgement within 30 minutes</div>
      </div>
 
      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 'var(--space-4)' }}>
        {[
          { key: 'ASSIGNED', label: `Pending Ack (${counts.ASSIGNED})` },
          { key: 'OPEN', label: `In Progress (${counts.OPEN})` },
          { key: 'HISTORY', label: `Timeout History (${counts.HISTORY})` },
        ].map(t => (
          <button key={t.key} onClick={() => { setTab(t.key); setCurrentPage(1); }}
            className={`btn btn--sm ${tab === t.key ? 'btn--primary' : 'btn--ghost'}`}>
            {t.label}
          </button>
        ))}
      </div>
 
      {/* ASSIGNED tab */}
      {tab === 'ASSIGNED' && (
        loading ? <Spinner /> : paginated.length === 0 ? (
          <div className="card"><div className="empty-state">
            <div className="empty-state__title">No tickets needing acknowledgement</div>
            <div className="empty-state__sub">New assignments will appear here automatically after approval.</div>
          </div></div>
        ) : (
          <>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--gray-1)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '160px 90px 160px 90px 140px 130px', background: 'var(--primary-50)', borderBottom: '2px solid var(--primary-100)', padding: '10px 14px' }}>
                {['Ticket No.', 'Priority', 'Assigned At', 'Est. Hrs', 'Timer', 'Action','assignee'].map(h => (
                  <div key={h} style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary-800)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</div>
                ))}
              </div>
              {paginated.map(a => {
                const isTO = !!timedOut[a.assignmentId];
                return (
                  <div key={a.assignmentId} onClick={() => openAckPopup(a)}
                    style={{ display: 'grid', gridTemplateColumns: '160px 90px 160px 90px 140px 130px', padding: '12px 14px', borderBottom: '1px solid var(--gray-1)', alignItems: 'center', cursor: 'pointer', transition: 'background 0.12s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}>
                    <div style={{ fontWeight: 700, color: 'var(--primary-900)', fontSize: 12, fontFamily: 'monospace' }}>{a.ticketNumber || `#${a.ticketId}`}</div>
                    <div>{a.priority ? <Chip status={a.priority} label={a.priority} /> : '—'}</div>
                    <div style={{ fontSize: 12, color: 'var(--gray-6)' }}>{formatDate(a.assignedAt)}</div>
                    <div style={{ fontSize: 13, color: 'var(--gray-7)' }}>{a.estimatedHours != null ? `${a.estimatedHours} hrs` : (a.responseTimeHours != null ? `${a.responseTimeHours} hrs` : '—')}</div>
                    <div>{a.assignedAt && <AckCountdown assignedAt={a.assignedAt} onTimeout={() => handleTimeout(a)} />}</div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
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
          <div className="card"><div className="empty-state"><div className="empty-state__title">No in-progress tickets</div><div className="empty-state__sub">Acknowledged tickets appear here</div></div></div>
        ) : (
          <>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--gray-1)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '160px 90px 160px 90px 130px', background: 'var(--primary-50)', borderBottom: '2px solid var(--primary-100)', padding: '10px 14px' }}>
                {['Ticket No.', 'Priority', 'Assigned At', 'Est. Hrs', 'Status'].map(h => (
                  <div key={h} style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary-800)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</div>
                ))}
              </div>
              {paginated.map(a => (
                <div key={a.assignmentId} onClick={() => openDetailPopup(a)}
                  style={{ display: 'grid', gridTemplateColumns: '160px 90px 160px 90px 130px', padding: '12px 14px', borderBottom: '1px solid var(--gray-1)', alignItems: 'center', cursor: 'pointer', transition: 'background 0.12s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <div style={{ fontWeight: 700, color: 'var(--primary-900)', fontSize: 12, fontFamily: 'monospace' }}>{a.ticketNumber || `#${a.ticketId}`}</div>
                  <div>{a.priority ? <Chip status={a.priority} label={a.priority} /> : '—'}</div>
                  <div style={{ fontSize: 12, color: 'var(--gray-6)' }}>{formatDate(a.assignedAt)}</div>
                  <div style={{ fontSize: 13, color: 'var(--gray-7)' }}>{a.estimatedHours != null ? `${a.estimatedHours} hrs` : '—'}</div>
                  <div><Chip status={a.status} /></div>
                </div>
              ))}
            </div>
            <Pagination page={currentPage} total={displayed.length} pageSize={PAGE_SIZE} onChange={setCurrentPage} />
          </>
        )
      )}
 
      {/* HISTORY tab */}
      {tab === 'HISTORY' && (
        timeoutHistory.length === 0 ? (
          <div className="card"><div className="empty-state">
            <div className="empty-state__title">No timeout history</div>
            <div className="empty-state__sub">Tickets that expire without acknowledgement appear here</div>
          </div></div>
        ) : (
          <>
            <div className="alert alert--warning" style={{ marginBottom: 'var(--space-4)' }}>
              These tickets were not acknowledged within 30 minutes and have been auto-reassigned.
            </div>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--gray-1)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '160px 90px 200px 160px 160px', background: 'var(--error-bg)', borderBottom: '2px solid #F5AABA', padding: '10px 14px' }}>
                {['Ticket No.', 'Priority', 'Assigned To', 'Assigned At', 'Timed Out At'].map(h => (
                  <div key={h} style={{ fontSize: 11, fontWeight: 700, color: 'var(--error)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</div>
                ))}
              </div>
              {historyPaged.map((entry, i) => (
                <div key={i} onClick={() => openHistoryDetail(entry)}
                  style={{ display: 'grid', gridTemplateColumns: '160px 90px 200px 160px 160px', padding: '12px 14px', borderBottom: '1px solid var(--gray-1)', alignItems: 'center', cursor: 'pointer', transition: 'background 0.12s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <div style={{ fontWeight: 700, color: 'var(--primary-900)', fontSize: 12, fontFamily: 'monospace' }}>{entry.ticketNumber || `#${entry.ticketId}`}</div>
                  <div>{entry.priority ? <Chip status={entry.priority} label={entry.priority} /> : '—'}</div>
                  <div style={{ fontSize: 12, color: 'var(--gray-7)' }}>{entry.supportPersonName || '—'}</div>
                  <div style={{ fontSize: 12, color: 'var(--gray-6)' }}>{formatDate(entry.assignedAt)}</div>
                  <div style={{ fontSize: 12, color: 'var(--error)', fontWeight: 600 }}>{formatDate(entry.timedOutAt)}</div>
                </div>
              ))}
            </div>
            <Pagination page={currentPage} total={timeoutHistory.length} pageSize={PAGE_SIZE} onChange={setCurrentPage} />
          </>
        )
      )}
 
      {/* Acknowledge popup */}
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
                <div className="alert alert--warning" style={{ marginBottom: 'var(--space-4)' }}>
                  This ticket timed out without acknowledgement and has been auto-reassigned.
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                <InfoField label="Ticket No." value={popup.assignment.ticketNumber || `#${popup.assignment.ticketId}`} />
                <InfoField label="Priority" value={popup.assignment.priority} />
                {popup.ticket && <>
                  <InfoField label="Subject" value={popup.ticket.subject} />
                  <InfoField label="Category" value={popup.ticket.category || popup.ticket.categoryName} />
                  <InfoField label="Sub-Category" value={popup.ticket.subCategory || popup.ticket.subCategoryName} />
                  <InfoField label="Item" value={popup.ticket.item || popup.ticket.itemName} />
                  <InfoField label="Location" value={popup.ticket.location} />
                  <InfoField label="Mobile" value={popup.ticket.mobileNumber} />
                  <InfoField label="Requested By" value={popup.ticket.requesterName || popup.ticket.requestedByName} />
                </>}
                <InfoField label="Assigned At" value={formatDate(popup.assignment.assignedAt)} />
                <InfoField label="Assigned To" value={loggedInName} />
                <InfoField label="Estimated Hours" value={
                  popup.assignment.estimatedHours != null ? `${popup.assignment.estimatedHours} hrs`
                    : popup.assignment.responseTimeHours != null ? `${popup.assignment.responseTimeHours} hrs`
                      : 'Not specified'
                } />
              </div>
              {!popup.isTimedOut && (
                <div className="alert alert--success">
                  Acknowledging updates this ticket to <strong>In Progress</strong> and notifies the requester.
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
              <InfoField label="Ticket No." value={detailPopup.assignment.ticketNumber || `#${detailPopup.assignment.ticketId}`} />
              <InfoField label="Priority" value={detailPopup.assignment.priority} />
              {detailPopup.ticket && <>
                <InfoField label="Subject" value={detailPopup.ticket.subject} />
                <InfoField label="Category" value={detailPopup.ticket.category || detailPopup.ticket.categoryName} />
                <InfoField label="Sub-Category" value={detailPopup.ticket.subCategory || detailPopup.ticket.subCategoryName} />
                <InfoField label="Item" value={detailPopup.ticket.item || detailPopup.ticket.itemName} />
                <InfoField label="Location" value={detailPopup.ticket.location} />
                <InfoField label="Mobile" value={detailPopup.ticket.mobileNumber} />
                <InfoField label="Requested By" value={detailPopup.ticket.requesterName || detailPopup.ticket.requestedByName} />
                <InfoField label="Priority" value={
                  typeof detailPopup.ticket.priority === 'object'
                    ? detailPopup.ticket.priority?.name?.()
                    : detailPopup.ticket.priority
                } />
              </>}
              <InfoField label="Assigned At" value={formatDate(detailPopup.assignment.assignedAt)} />
              {detailPopup.assignment.timedOutAt && (
                <InfoField label="Timed Out At" value={formatDate(detailPopup.assignment.timedOutAt)} />
              )}
              <InfoField label="Est. Hours" value={
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
 
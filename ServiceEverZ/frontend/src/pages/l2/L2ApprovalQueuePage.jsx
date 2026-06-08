import React, { useState, useEffect, useCallback } from 'react';
import { formatDate, PAGE_SIZE } from '../../utils/helpers';
import { Chip, Spinner, Button, InfoField, Pagination } from '../../components/itsm/UI';
import { approvalApi, ticketApi } from '../../api/ourApi';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

/* ─── Role badge shown on each row ─────────────────────────────────────── */
function RoleBadge({ approval, approverId }) {
  const id = String(approverId);
  const isL1 = String(approval.l1ApproverId) === id && approval.l1Status === 'PENDING';
  const isL2 = String(approval.l2ApproverId) === id && approval.l1Status === 'APPROVED' && approval.l2Status === 'PENDING';
  if (isL1 && isL2) return (
    <span style={{ fontSize: '0.65rem', fontWeight: 700, background: '#EDE9FE', color: '#5B21B6',
      borderRadius: 5, padding: '2px 7px', letterSpacing: '0.04em' }}>L1 + L2</span>
  );
  if (isL1) return (
    <span style={{ fontSize: '0.65rem', fontWeight: 700, background: '#DBEAFE', color: '#1D4ED8',
      borderRadius: 5, padding: '2px 7px', letterSpacing: '0.04em' }}>L1</span>
  );
  if (isL2) return (
    <span style={{ fontSize: '0.65rem', fontWeight: 700, background: '#D1FAE5', color: '#065F46',
      borderRadius: 5, padding: '2px 7px', letterSpacing: '0.04em' }}>L2</span>
  );
  return null;
}

/* ─── Blur Modal ─────────────────────────────────────────────────────────── */
function BlurModal({ title, children, onClose }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center',
      justifyContent: 'center', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
      background: 'rgba(0,0,0,0.35)' }} onClick={onClose}>
      <div style={{ background: 'var(--surface)', borderRadius: 12,
        boxShadow: '0 24px 60px rgba(0,0,0,0.25)', width: '90%', maxWidth: 700,
        maxHeight: '88vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px 16px', borderBottom: '1px solid var(--gray-1)',
          position: 'sticky', top: 0, background: 'var(--surface)', zIndex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--primary-900)' }}>{title}</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 22, color: 'var(--gray-5)', lineHeight: 1, padding: '0 4px' }}>×</button>
        </div>
        <div style={{ padding: '20px 24px' }}>{children}</div>
      </div>
    </div>
  );
}

/* ─── Confirmation Overlay ───────────────────────────────────────────────── */
function OverlayModal({ children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1200, display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
      <div style={{ background: '#fff', borderRadius: 14, padding: '32px 28px', width: 460,
        maxWidth: '94vw', boxShadow: '0 24px 60px rgba(0,0,0,0.22)' }}
        onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════════════════ */
export default function ApprovalQueuePage({ showSnack, defaultTab = 'PENDING' }) {
  const { user } = useAuth();
  const approverId = user?.userId ? String(user.userId) : null;

  const [tab, setTab]         = useState(defaultTab);
  const [pending, setPending] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [histLoading, setHistLoading] = useState(false);
  const [pendingPage, setPP]  = useState(1);
  const [historyPage, setHP]  = useState(1);

  // Ticket detail modal
  const [modal, setModal]               = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [processing, setProcessing]     = useState(false);

  // Confirmation overlays
  const [overlay, setOverlay]           = useState(null); // 'approve'|'reject'|'needinfo'
  const [rejectReason, setRejectReason] = useState('');
  const [needInfoText, setNeedInfoText] = useState('');

  useEffect(() => { setTab(defaultTab); }, [defaultTab]);

  /* ── data loaders ── */
  const load = useCallback(() => {
    setLoading(true);
    approvalApi.getPendingForApprover(approverId)
      .then(d => setPending((Array.isArray(d) ? d : []).sort((a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt))))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [approverId]);

  const loadHistory = useCallback(() => {
    setHistLoading(true);
    approvalApi.getHistoryForApprover(approverId)
      .then(d => setHistory(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setHistLoading(false));
  }, [approverId]);

  useEffect(() => { load(); loadHistory(); }, [load, loadHistory]);

  /* ── open modal ── */
  const openModal = async (a, mode) => {
    setModal({ approval: a, ticket: null, mode });
    setOverlay(null);
    setModalLoading(true);
    try {
      const t = await ticketApi.getById(a.ticketId);
      setModal(prev => ({ ...prev, ticket: t }));
    } catch {
      setModal(prev => ({ ...prev, ticket: null }));
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal   = () => { setModal(null); setOverlay(null); };
  const closeOverlay = () => setOverlay(null);

  /* ── determine which approver level to use for this action ── */
  const getApproverLevel = (approval) => {
    if (!approval || !approverId) return 'L1';
    const isL2Pending = String(approval.l2ApproverId) === approverId
      && approval.l1Status === 'APPROVED'
      && approval.l2Status === 'PENDING';
    return isL2Pending ? 'L2' : 'L1';
  };

  /* ── confirm handlers ── */
  const handleApproveConfirm = async () => {
    setProcessing(true);
    try {
      const level = getApproverLevel(modal.approval);
      await approvalApi.processAction({
        ticketId: modal.approval.ticketId,
        approverLevel: level,
        action: 'APPROVED',
        remarks: ''
      });
      setPending(prev => prev.filter(a => a.ticketId !== modal.approval.ticketId));
      closeModal();
      loadHistory();
      toast.success(`Ticket ${level} Approved`);
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Approval failed');
    } finally { setProcessing(false); }
  };

  const handleRejectConfirm = async () => {
    if (!rejectReason.trim()) { toast.error('Rejection reason is mandatory'); return; }
    setProcessing(true);
    try {
      const level = getApproverLevel(modal.approval);
      await approvalApi.processAction({
        ticketId: modal.approval.ticketId,
        approverLevel: level,
        action: 'REJECTED',
        remarks: rejectReason
      });
      setPending(prev => prev.filter(a => a.ticketId !== modal.approval.ticketId));
      closeModal();
      loadHistory();
      toast.error(`Ticket ${level} Rejected`);
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Rejection failed');
    } finally { setProcessing(false); }
  };

  const handleNeedInfoConfirm = async () => {
    if (!needInfoText.trim()) { toast.error('Please enter your message'); return; }
    setProcessing(true);
    try {
      const level = getApproverLevel(modal.approval);
      await approvalApi.processAction({
        ticketId: modal.approval.ticketId,
        approverLevel: level,
        action: 'NEED_INFO',
        remarks: needInfoText
      });
      toast.success('Message sent to end user');
      closeOverlay(); // ticket stays in queue
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to send message');
    } finally { setProcessing(false); }
  };

  const getVal = (t, ...keys) => {
    for (const k of keys) {
      if (t && k in t && t[k] !== null && t[k] !== '') return t[k];
    }
    return '—';
  };

  const pendingPaged = pending.slice((pendingPage - 1) * PAGE_SIZE, pendingPage * PAGE_SIZE);
  const histPaged    = history.slice((historyPage - 1) * PAGE_SIZE, historyPage * PAGE_SIZE);

  /* ── render ── */
  return (
    <div>
      <div className="page-header">
        <div className="page-header__title">{tab === 'PENDING' ? 'Approval Queue' : 'Approval History'}</div>
        <div className="page-header__sub">
          {tab === 'PENDING'
            ? `${pending.length} ticket${pending.length !== 1 ? 's' : ''} pending your approval`
            : `${history.length} ticket${history.length !== 1 ? 's' : ''} in history`}
        </div>
      </div>

      {/* ── PENDING TAB ── */}
      {tab === 'PENDING' && (loading ? <Spinner /> : (
        pending.length === 0
          ? <div className="card"><div className="empty-state">
              <div className="empty-state__title">No pending approvals</div>
              <div className="empty-state__sub">Tickets assigned to you for L1 or L2 approval appear here</div>
            </div></div>
          : <>
              <div style={{ background: 'var(--surface)', border: '1px solid var(--gray-1)',
                borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '190px 1fr 140px 80px 80px',
                  padding: '10px 16px', background: 'var(--primary-50)',
                  borderBottom: '2px solid var(--primary-100)' }}>
                  {['Ticket No.', 'Subject', 'Requester', 'Submitted', 'Role'].map(h => (
                    <div key={h} style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary-800)',
                      textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</div>
                  ))}
                </div>
                {pendingPaged.map(a => (
                  <div key={a.approvalId} onClick={() => openModal(a, 'pending')}
                    style={{ display: 'grid', gridTemplateColumns: '190px 1fr 140px 80px 80px',
                      padding: '12px 16px', borderBottom: '1px solid var(--gray-1)',
                      cursor: 'pointer', transition: 'background 0.12s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}>
                    <div style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--primary-800)', fontWeight: 700 }}>
                      {a.ticketNumber || `#${a.ticketId}`}
                      <div style={{ fontSize: 11, color: 'var(--gray-4)', fontFamily: 'sans-serif', fontWeight: 400 }}>
                        {formatDate(a.createdAt)}
                      </div>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--gray-8)', alignSelf: 'center' }}>
                      {a.ticketSubject || `Ticket #${a.ticketId}`}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--gray-6)', alignSelf: 'center' }}>
                      {a.requesterName || '—'}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--gray-5)', alignSelf: 'center' }}>
                      {formatDate(a.createdAt)}
                    </div>
                    <div style={{ alignSelf: 'center' }}>
                      <RoleBadge approval={a} approverId={approverId} />
                    </div>
                  </div>
                ))}
              </div>
              <Pagination page={pendingPage} total={pending.length} pageSize={PAGE_SIZE} onChange={setPP} />
            </>
      ))}

      {/* ── HISTORY TAB ── */}
      {tab === 'HISTORY' && (
        histLoading ? <Spinner /> :
          history.length === 0
            ? <div className="card"><div className="empty-state">
                <div className="empty-state__title">No history yet</div>
                <div className="empty-state__sub">Approved and rejected tickets appear here</div>
              </div></div>
            : <>
                <div style={{ background: 'var(--surface)', border: '1px solid var(--gray-1)',
                  borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '190px 80px 80px 1fr 160px',
                    padding: '10px 14px', background: 'var(--primary-50)',
                    borderBottom: '2px solid var(--primary-100)' }}>
                    {['Ticket No.', 'L1', 'L2', 'Subject', 'Updated At'].map(h => (
                      <div key={h} style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary-800)',
                        textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</div>
                    ))}
                  </div>
                  {histPaged.map((a, i) => (
                    <div key={i} onClick={() => openModal(a, 'history')}
                      style={{ display: 'grid', gridTemplateColumns: '190px 80px 80px 1fr 160px',
                        padding: '11px 14px', borderBottom: '1px solid var(--gray-1)',
                        cursor: 'pointer', transition: 'background 0.12s', alignItems: 'center' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}>
                      <div style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--primary-800)', fontWeight: 700 }}>
                        {a.ticketNumber || `#${a.ticketId}`}
                      </div>
                      <div><Chip status={a.l1Status} /></div>
                      <div><Chip status={a.l2Status || 'PENDING'} /></div>
                      <div style={{ fontSize: 12, color: 'var(--gray-6)' }}>{a.ticketSubject || '—'}</div>
                      <div style={{ fontSize: 12, color: 'var(--gray-5)' }}>{formatDate(a.updatedAt)}</div>
                    </div>
                  ))}
                </div>
                <Pagination page={historyPage} total={history.length} pageSize={PAGE_SIZE} onChange={setHP} />
              </>
      )}

      {/* ── TICKET DETAIL MODAL ── */}
      {modal && (
        <BlurModal
          title={`Ticket ${modal.approval.ticketNumber || '#' + modal.approval.ticketId}`}
          onClose={closeModal}
        >
          {modalLoading ? <Spinner /> : (
            <>
              {modal.mode === 'pending' && (
                <div style={{ marginBottom: 'var(--space-4)', display: 'flex', gap: 8, alignItems: 'center' }}>
                  <RoleBadge approval={modal.approval} approverId={approverId} />
                  <span style={{ fontSize: 12, color: 'var(--gray-5)' }}>
                    {getApproverLevel(modal.approval) === 'L2'
                      ? `L1 approved by ${modal.approval.l1ApproverName || '—'}`
                      : 'Waiting for your L1 approval'}
                  </span>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr',
                gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                <InfoField label="Subject"
                  value={modal.ticket ? getVal(modal.ticket, 'subject') : (modal.approval.ticketSubject || '—')} />
                <InfoField label="Requested By"
                  value={modal.ticket ? getVal(modal.ticket, 'requesterName', 'requestedByName') : (modal.approval.requesterName || '—')} />
                {modal.ticket && <>
                  <InfoField label="Category"     value={getVal(modal.ticket, 'category', 'categoryName')} />
                  <InfoField label="Sub-Category" value={getVal(modal.ticket, 'subCategory', 'subCategoryName')} />
                  <InfoField label="Item"         value={getVal(modal.ticket, 'item', 'itemName')} />
                  <InfoField label="Priority"
                    value={typeof modal.ticket.priority === 'object'
                      ? (modal.ticket.priority?.name || modal.ticket.priority?.priorityName || '—')
                      : (modal.ticket.priority || modal.ticket.priorityName || '—')} />
                  <InfoField label="Location"     value={getVal(modal.ticket, 'location')} />
                  <InfoField label="Mobile"       value={getVal(modal.ticket, 'mobileNumber')} />
                </>}
                <InfoField label="L1 Approver" value={modal.approval.l1ApproverName || '—'} />
                <InfoField label="L2 Approver" value={modal.approval.l2ApproverName || '—'} />
              </div>

              {modal.ticket?.description && (
                <div style={{ padding: 'var(--space-3)', background: 'var(--surface-2)',
                  borderRadius: 'var(--radius-sm)', border: '1px solid var(--gray-1)',
                  marginBottom: 'var(--space-4)' }}>
                  <div className="info-field__label" style={{ marginBottom: 4 }}>Description</div>
                  <div style={{ fontSize: 13, lineHeight: 1.7 }}
                    dangerouslySetInnerHTML={{ __html: modal.ticket.description }} />
                </div>
              )}

              {modal.mode === 'pending' && (
                <div style={{ borderTop: '1px solid var(--gray-1)', paddingTop: 'var(--space-4)',
                  marginTop: 'var(--space-2)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                  <Button variant="ghost" onClick={closeModal}>Cancel</Button>
                  <button className="btn btn--sm btn--ghost"
                    onClick={() => { setNeedInfoText(''); setOverlay('needinfo'); }}>Need Info</button>
                  <button className="btn btn--sm btn--danger"
                    onClick={() => { setRejectReason(''); setOverlay('reject'); }}>Reject</button>
                  <button className="btn btn--sm btn--success"
                    onClick={() => setOverlay('approve')}>Approve</button>
                </div>
              )}

              {modal.mode === 'history' && (
                <div style={{ borderTop: '1px solid var(--gray-1)', paddingTop: 'var(--space-3)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
                    <div><div className="info-field__label">L1</div><Chip status={modal.approval.l1Status} /></div>
                    <div><div className="info-field__label">L2</div><Chip status={modal.approval.l2Status || 'PENDING'} /></div>
                    {modal.approval.remarks && (
                      <div><div className="info-field__label">Remarks</div>
                        <div style={{ fontSize: 13 }}>{modal.approval.remarks}</div></div>
                    )}
                  </div>
                  <Button variant="ghost" onClick={closeModal}>Close</Button>
                </div>
              )}
            </>
          )}
        </BlurModal>
      )}

      {/* ── APPROVE OVERLAY ── */}
      {overlay === 'approve' && (
        <OverlayModal>
          <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 10, color: '#1a1a2e' }}>Confirm Approval</div>
          <div style={{ fontSize: 14, color: '#6B7280', marginBottom: 28 }}>
            Are you sure you want to <strong>approve</strong> this ticket?
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button className="btn btn--ghost btn--sm" onClick={closeOverlay} disabled={processing}>No, Cancel</button>
            <Button variant="success" loading={processing} onClick={handleApproveConfirm}>Yes, Approve</Button>
          </div>
        </OverlayModal>
      )}

      {/* ── REJECT OVERLAY ── */}
      {overlay === 'reject' && (
        <OverlayModal>
          <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 8, color: '#1a1a2e' }}>Confirm Rejection</div>
          <div style={{ fontSize: 14, color: '#6B7280', marginBottom: 14 }}>
            Provide a reason — this is <strong>mandatory</strong>.
          </div>
          <textarea className="form-control" value={rejectReason}
            onChange={e => setRejectReason(e.target.value)}
            placeholder="Enter rejection reason..."
            style={{ minHeight: 90, marginBottom: 20, width: '100%', boxSizing: 'border-box' }} />
          <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 20 }}>
            Are you sure you want to <strong>reject</strong> this ticket?
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button className="btn btn--ghost btn--sm" onClick={closeOverlay} disabled={processing}>No, Cancel</button>
            <Button variant="danger" loading={processing} onClick={handleRejectConfirm}>Yes, Reject</Button>
          </div>
        </OverlayModal>
      )}

      {/* ── NEED INFO OVERLAY ── */}
      {overlay === 'needinfo' && (
        <OverlayModal>
          <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 8, color: '#1a1a2e' }}>
            Request Additional Information
          </div>
          <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 14 }}>
            Your message will be sent to the end user and visible in their My Tickets page.
            The ticket stays in your queue until you approve or reject it.
          </div>
          <textarea className="form-control" value={needInfoText}
            onChange={e => setNeedInfoText(e.target.value)}
            placeholder="What information do you need from the user?"
            style={{ minHeight: 100, marginBottom: 20, width: '100%', boxSizing: 'border-box' }} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button className="btn btn--ghost btn--sm" onClick={closeOverlay} disabled={processing}>Cancel</button>
            <Button variant="primary" loading={processing} onClick={handleNeedInfoConfirm}>Send Message</Button>
          </div>
        </OverlayModal>
      )}
    </div>
  );
}

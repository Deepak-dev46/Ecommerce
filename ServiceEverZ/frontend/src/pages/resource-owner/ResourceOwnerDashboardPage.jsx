import React, { useState, useEffect, useCallback } from 'react';
import { formatDate, PAGE_SIZE } from '../../utils/helpers';
import { Chip, Spinner, Button, InfoField, Pagination } from '../../components/itsm/UI';
import { approvalApi, ticketApi } from '../../api/ourApi';
import toast from 'react-hot-toast';

/* ── Blur Modal ──────────────────────────────────────────────────── */
function BlurModal({ title, children, onClose }) {
  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', background: 'rgba(0,0,0,0.35)' }}
      onClick={onClose}
    >
      <div
        style={{ background: 'var(--surface)', borderRadius: 12, boxShadow: '0 24px 60px rgba(0,0,0,0.25)', width: '90%', maxWidth: 700, maxHeight: '88vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 16px', borderBottom: '1px solid var(--gray-1)', position: 'sticky', top: 0, background: 'var(--surface)', zIndex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--primary-900)' }}>{title}</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: 'var(--gray-5)', lineHeight: 1, padding: '0 4px' }}>×</button>
        </div>
        <div style={{ padding: '20px 24px' }}>{children}</div>
      </div>
    </div>
  );
}

/* ── Confirmation / Info Overlay ─────────────────────────────────── */
function OverlayModal({ children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
      <div
        style={{ background: '#fff', borderRadius: 14, padding: '32px 28px', width: 460, maxWidth: '94vw', boxShadow: '0 24px 60px rgba(0,0,0,0.22)' }}
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

/* ── Main Component ──────────────────────────────────────────────── */
export default function ResourceOwnerPage({ showSnack, defaultTab = 'PENDING' }) {

  /* ── State ── */
  const [tab, setTab]               = useState(defaultTab);
  const [approvals, setApprovals]   = useState([]);
  const [history, setHistory]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [pendingPage, setPP]        = useState(1);
  const [historyPage, setHP]        = useState(1);

  // Ticket detail modal
  const [modal, setModal]               = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [processing, setProcessing]     = useState(false);

  // Overlay: 'approve' | 'reject' | 'needinfo' | null
  const [overlay, setOverlay]           = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [needInfoText, setNeedInfoText] = useState('');

  useEffect(() => { setTab(defaultTab); }, [defaultTab]);

  /* ── Data loaders ── */
  const load = useCallback(() => {
    setLoading(true);
    approvalApi.getPendingResourceOwner()
      .then(d => setApprovals((Array.isArray(d) ? d : []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const loadHistory = useCallback(() => {
    approvalApi.getResourceOwnerHistory?.()
      .then(d => setHistory(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  useEffect(() => { load(); loadHistory(); }, [load, loadHistory]);

  /* ── Open ticket detail modal ── */
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

  /* ── Button click handlers ── */
  const onApproveClick  = () => setOverlay('approve');
  const onRejectClick   = () => { setRejectReason(''); setOverlay('reject'); };
  const onNeedInfoClick = () => { setNeedInfoText(''); setOverlay('needinfo'); };

  /* ── Confirm actions ── */
  const handleApproveConfirm = async () => {
    setProcessing(true);
    try {
      await approvalApi.processAction({
        ticketId: modal.approval.ticketId,
        approverLevel: 'RESOURCE',
        action: 'APPROVED',
        remarks: ''
      });
      setApprovals(prev => prev.filter(a => a.ticketId !== modal.approval.ticketId));
      setHistory(prev => [{ ...modal.approval, resourceOwnerStatus: 'APPROVED', processedAt: new Date().toISOString() }, ...prev]);
      closeModal();
      toast.success('Resource Owner Approved — Assignment triggered automatically!');
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Approval failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectReason.trim()) { toast.error('Rejection reason is mandatory'); return; }
    setProcessing(true);
    try {
      await approvalApi.processAction({
        ticketId: modal.approval.ticketId,
        approverLevel: 'RESOURCE',
        action: 'REJECTED',
        remarks: rejectReason
      });
      setApprovals(prev => prev.filter(a => a.ticketId !== modal.approval.ticketId));
      setHistory(prev => [{ ...modal.approval, resourceOwnerStatus: 'REJECTED', remarks: rejectReason, processedAt: new Date().toISOString() }, ...prev]);
      closeModal();
      toast.error('Resource Owner Rejected — Requester notified.');
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Rejection failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleNeedInfoConfirm = async () => {
    if (!needInfoText.trim()) { toast.error('Please enter your message'); return; }
    setProcessing(true);
    try {
      await approvalApi.processAction({
        ticketId: modal.approval.ticketId,
        approverLevel: 'RESOURCE',
        action: 'NEED_INFO',
        remarks: needInfoText
      });
      toast.success('Message sent to end user');
      closeOverlay();
      // Ticket stays in the pending queue — do NOT remove it
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to send message');
    } finally {
      setProcessing(false);
    }
  };

  /* ── Helper ── */
  const getTicketField = (ticket, ...keys) => {
    for (const k of keys) {
      if (ticket && k in ticket) {
        const v = ticket[k];
        if (v !== null && v !== '') return v;
      }
    }
    return '—';
  };

  const pendingPaged = approvals.slice((pendingPage - 1) * PAGE_SIZE, pendingPage * PAGE_SIZE);
  const historyPaged = history.slice((historyPage - 1) * PAGE_SIZE, historyPage * PAGE_SIZE);

  /* ── Render ── */
  return (
    <div>
      <div className="page-header">
        <div className="page-header__title">{tab === 'PENDING' ? 'Resource Owner — Pending' : 'Resource Owner — History'}</div>
        <div className="page-header__sub">{tab === 'PENDING' ? `${approvals.length} tickets awaiting decision` : `${history.length} decisions in history`}</div>
      </div>

      {/* ── PENDING TAB ── */}
      {tab === 'PENDING' && (loading ? <Spinner /> : (
        approvals.length === 0
          ? <div className="card"><div className="empty-state">
              <div className="empty-state__title">No pending resource owner approvals</div>
              <div className="empty-state__sub">Tickets appear here after L1 + L2 approval</div>
            </div></div>
          : <>
              <div className="alert alert--info" style={{ marginBottom: 'var(--space-4)' }}>
                These tickets have been approved by L1 and L2. Your approval is the final step before auto-assignment.
              </div>
              <div style={{ background: 'var(--surface)', border: '1px solid var(--gray-1)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '190px 1fr 120px 120px 100px', padding: '10px 16px', background: 'var(--primary-50)', borderBottom: '2px solid var(--primary-100)' }}>
                  {['Ticket No.', 'Subject', 'L1 Status', 'L2 Status', 'RO Status'].map(h => (
                    <div key={h} style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary-800)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</div>
                  ))}
                </div>
                {pendingPaged.map(a => (
                  <div key={a.approvalId} onClick={() => openModal(a, 'pending')}
                    style={{ display: 'grid', gridTemplateColumns: '190px 1fr 120px 120px 100px', padding: '12px 16px', borderBottom: '1px solid var(--gray-1)', cursor: 'pointer', transition: 'background 0.12s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}>
                    <div style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--primary-800)', fontWeight: 700 }}>
                      {a.ticketNumber || `#${a.ticketId}`}
                      <div style={{ fontSize: 11, color: 'var(--gray-4)', fontFamily: 'sans-serif', fontWeight: 400 }}>{formatDate(a.createdAt)}</div>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--gray-8)', alignSelf: 'center' }}>{a.ticketSubject || `Ticket #${a.ticketId}`}</div>
                    <div style={{ alignSelf: 'center' }}><Chip status={a.l1Status} /></div>
                    <div style={{ alignSelf: 'center' }}><Chip status={a.l2Status} /></div>
                    <div style={{ alignSelf: 'center' }}><Chip status={a.resourceOwnerStatus || 'PENDING'} /></div>
                  </div>
                ))}
              </div>
              <Pagination page={pendingPage} total={approvals.length} pageSize={PAGE_SIZE} onChange={setPP} />
            </>
      ))}

      {/* ── HISTORY TAB ── */}
      {tab === 'HISTORY' && (
        history.length === 0
          ? <div className="card"><div className="empty-state">
              <div className="empty-state__title">No history yet</div>
              <div className="empty-state__sub">Your approval decisions will appear here</div>
            </div></div>
          : <>
              <div style={{ background: 'var(--surface)', border: '1px solid var(--gray-1)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '190px 100px 100px 100px 1fr 160px', padding: '10px 14px', background: 'var(--primary-50)', borderBottom: '2px solid var(--primary-100)' }}>
                  {['Ticket No.', 'L1', 'L2', 'RO Decision', 'Remarks', 'Processed At'].map(h => (
                    <div key={h} style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary-800)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</div>
                  ))}
                </div>
                {historyPaged.map((a, i) => (
                  <div key={i} onClick={() => openModal(a, 'history')}
                    style={{ display: 'grid', gridTemplateColumns: '190px 100px 100px 100px 1fr 160px', padding: '11px 14px', borderBottom: '1px solid var(--gray-1)', cursor: 'pointer', transition: 'background 0.12s', alignItems: 'center' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}>
                    <div style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--primary-800)', fontWeight: 700 }}>{a.ticketNumber || `#${a.ticketId}`}</div>
                    <div><Chip status={a.l1Status} /></div>
                    <div><Chip status={a.l2Status} /></div>
                    <div>
                      <Chip status={a.resourceOwnerStatus || 'PENDING'} />
                      {a.resourceOwnerName && <div style={{ fontSize: 10, color: 'var(--gray-5)', marginTop: 2 }}>({a.resourceOwnerName})</div>}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--gray-6)' }}>{a.remarks || '—'}</div>
                    <div style={{ fontSize: 12, color: 'var(--gray-5)' }}>{formatDate(a.processedAt)}</div>
                  </div>
                ))}
              </div>
              <Pagination page={historyPage} total={history.length} pageSize={PAGE_SIZE} onChange={setHP} />
            </>
      )}

      {/* ── TICKET DETAIL MODAL ── */}
      {modal && (
        <BlurModal
          title={`${modal.mode === 'history' ? 'History — ' : ''}Ticket ${modal.approval.ticketNumber || '#' + modal.approval.ticketId}`}
          onClose={closeModal}
        >
          {modalLoading ? <Spinner /> : (
            <>
              {/* L1 + L2 approval banner */}
              {modal.mode === 'pending' && (
                <div className="alert alert--success" style={{ marginBottom: 'var(--space-4)' }}>
                  Approved by L1: <strong>{modal.approval.l1ApproverName || '—'}</strong>
                  &nbsp;&nbsp;|&nbsp;&nbsp;
                  Approved by L2: <strong>{modal.approval.l2ApproverName || '—'}</strong>
                </div>
              )}

              {/* Ticket fields grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                <InfoField label="Subject"      value={modal.ticket ? getTicketField(modal.ticket, 'subject')                          : (modal.approval.ticketSubject || '—')} />
                <InfoField label="Requested By" value={modal.ticket ? getTicketField(modal.ticket, 'requesterName', 'requestedByName') : (modal.approval.requesterName  || '—')} />
                {modal.ticket && <>
                  <InfoField label="Type"         value={getTicketField(modal.ticket, 'type', 'typeName')} />
                  <InfoField label="Category"     value={getTicketField(modal.ticket, 'category', 'categoryName')} />
                  <InfoField label="Sub-Category" value={getTicketField(modal.ticket, 'subCategory', 'subCategoryName')} />
                  <InfoField label="Item"         value={getTicketField(modal.ticket, 'item', 'itemName')} />
                  <InfoField label="Priority"     value={typeof modal.ticket.priority === 'object' ? (modal.ticket.priority?.name?.() ?? '—') : (modal.ticket.priority || modal.ticket.priorityName || '—')} />
                  <InfoField label="Location"     value={getTicketField(modal.ticket, 'location')} />
                  <InfoField label="Mobile"       value={getTicketField(modal.ticket, 'mobileNumber')} />
                </>}
                <InfoField label="L1 Approved By" value={modal.approval.l1ApproverName || '—'} />
                <InfoField label="L2 Approved By" value={modal.approval.l2ApproverName || '—'} />
              </div>

              {/* Description */}
              {modal.ticket?.description && (
                <div style={{ padding: 'var(--space-3)', background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--gray-1)', marginBottom: 'var(--space-4)' }}>
                  <div className="info-field__label" style={{ marginBottom: 4 }}>Description</div>
                  <div style={{ fontSize: 13, lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: modal.ticket.description }} />
                </div>
              )}

              {/* ── PENDING: three clean action buttons ── */}
              {modal.mode === 'pending' && (
                <div style={{ borderTop: '1px solid var(--gray-1)', paddingTop: 'var(--space-4)', marginTop: 'var(--space-2)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                  <Button variant="ghost" onClick={closeModal}>Cancel</Button>
                  <button className="btn btn--sm btn--ghost"   onClick={onNeedInfoClick}>Need Info</button>
                  <button className="btn btn--sm btn--danger"  onClick={onRejectClick}>Reject</button>
                  <button className="btn btn--sm btn--success" onClick={onApproveClick}>Approve</button>
                </div>
              )}

              {/* ── HISTORY: decision summary ── */}
              {modal.mode === 'history' && (
                <div style={{ borderTop: '1px solid var(--gray-1)', paddingTop: 'var(--space-3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
                    <div><div className="info-field__label">L1 Status</div><Chip status={modal.approval.l1Status} /></div>
                    <div><div className="info-field__label">L2 Status</div><Chip status={modal.approval.l2Status} /></div>
                    <div><div className="info-field__label">RO Decision</div><Chip status={modal.approval.resourceOwnerStatus || 'PENDING'} /></div>
                    {modal.approval.remarks && (
                      <div><div className="info-field__label">Remarks</div><div style={{ fontSize: 13 }}>{modal.approval.remarks}</div></div>
                    )}
                  </div>
                  <Button variant="ghost" onClick={closeModal}>Close</Button>
                </div>
              )}
            </>
          )}
        </BlurModal>
      )}

      {/* ── APPROVE CONFIRMATION OVERLAY ── */}
      {overlay === 'approve' && (
        <OverlayModal>
          <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 10, color: '#1a1a2e' }}>Confirm Approval</div>
          <div style={{ fontSize: 14, color: '#6B7280', marginBottom: 28 }}>
            Are you sure you want to <strong>approve</strong> this ticket?
            This is the final approval — assignment will be triggered automatically.
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button className="btn btn--ghost btn--sm" onClick={closeOverlay} disabled={processing}>No, Cancel</button>
            <Button variant="success" loading={processing} onClick={handleApproveConfirm}>Yes, Approve</Button>
          </div>
        </OverlayModal>
      )}

      {/* ── REJECT CONFIRMATION OVERLAY ── */}
      {overlay === 'reject' && (
        <OverlayModal>
          <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 8, color: '#1a1a2e' }}>Confirm Rejection</div>
          <div style={{ fontSize: 14, color: '#6B7280', marginBottom: 14 }}>
            Please provide a reason for rejection. This is <strong>mandatory</strong>.
          </div>
          <textarea
            className="form-control"
            value={rejectReason}
            onChange={e => setRejectReason(e.target.value)}
            placeholder="Enter rejection reason..."
            style={{ minHeight: 90, marginBottom: 20, width: '100%', boxSizing: 'border-box' }}
          />
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
          <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 8, color: '#1a1a2e' }}>Request Additional Information</div>
          <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 14 }}>
            Your message will be sent to the end user and visible in their My Tickets page.
            The ticket will <strong>remain in your approval queue</strong> until you approve or reject it.
          </div>
          <textarea
            className="form-control"
            value={needInfoText}
            onChange={e => setNeedInfoText(e.target.value)}
            placeholder="What information do you need from the user?"
            style={{ minHeight: 100, marginBottom: 20, width: '100%', boxSizing: 'border-box' }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button className="btn btn--ghost btn--sm" onClick={closeOverlay} disabled={processing}>Cancel</button>
            <Button variant="primary" loading={processing} onClick={handleNeedInfoConfirm}>Send Message</Button>
          </div>
        </OverlayModal>
      )}
    </div>
  );
}

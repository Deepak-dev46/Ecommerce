import React, { useState, useEffect, useCallback } from 'react';
import { approvalApi, ticketApi } from '../api';
import { formatDate, PAGE_SIZE } from '../utils/helpers';
import { Chip, Spinner, Button, InfoField, Pagination } from '../components/UI';

function BlurModal({ title, children, onClose }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', background: 'rgba(0,0,0,0.35)' }} onClick={onClose}>
      <div style={{ background: 'var(--surface)', borderRadius: 12, boxShadow: '0 24px 60px rgba(0,0,0,0.25)', width: '90%', maxWidth: 680, maxHeight: '88vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 16px', borderBottom: '1px solid var(--gray-1)', position: 'sticky', top: 0, background: 'var(--surface)', zIndex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--primary-900)' }}>{title}</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: 'var(--gray-5)', lineHeight: 1, padding: '0 4px' }}>×</button>
        </div>
        <div style={{ padding: '20px 24px' }}>{children}</div>
      </div>
    </div>
  );
}

const HISTORY_KEY = 'itsm_l2_history';
const loadHistory = () => { try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); } catch { return []; } };
const saveHistory = h => { try { localStorage.setItem(HISTORY_KEY, JSON.stringify(h.slice(0, 200))); } catch { } };

export default function L2ApprovalPage({ showSnack, defaultTab = 'PENDING' }) {
  const [tab, setTab] = useState(defaultTab);
  const [approvals, setApprovals] = useState([]);
  const [history, setHistory] = useState(loadHistory);
  const [loading, setLoading] = useState(true);
  const [pendingPage, setPP] = useState(1);
  const [historyPage, setHP] = useState(1);

  const [modal, setModal] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [action, setAction] = useState('');
  const [remarks, setRemarks] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => { setTab(defaultTab); }, [defaultTab]);

  const load = useCallback(() => {
    setLoading(true);
    approvalApi.getPendingL2()
      .then(d => setApprovals((Array.isArray(d) ? d : []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => { load(); }, [load]);

  const openModal = async (a, mode) => {
    setModal({ approval: a, ticket: null, mode });
    setAction(''); setRemarks('');
    setModalLoading(true);
    try { const t = await ticketApi.getById(a.ticketId); setModal(prev => ({ ...prev, ticket: t })); } catch { }
    finally { setModalLoading(false); }
  };

  const closeModal = () => { setModal(null); setAction(''); setRemarks(''); };

  const handleSubmit = async () => {
    if (!action) { showSnack('Select Approve or Reject', 'warning'); return; }
    setProcessing(true);
    try {
      await approvalApi.processAction({ ticketId: modal.approval.ticketId, approverLevel: 'L2', action, remarks });
      showSnack(action === 'APPROVED' ? 'L2 Approved — Assignment triggered' : 'L2 Rejected', action === 'APPROVED' ? 'success' : 'error');
      const entry = { ...modal.approval, l2Status: action, remarks, processedAt: new Date().toISOString() };
      const nh = [entry, ...history]; setHistory(nh); saveHistory(nh);
      setApprovals(prev => prev.filter(a => a.ticketId !== modal.approval.ticketId));
      closeModal();
    } catch (e) { showSnack(e.message || 'Failed', 'error'); }
    finally { setProcessing(false); }
  };


  const pendingPaged = approvals.slice((pendingPage - 1) * PAGE_SIZE, pendingPage * PAGE_SIZE);
  const historyPaged = history.slice((historyPage - 1) * PAGE_SIZE, historyPage * PAGE_SIZE);

  useEffect(() => {
    console.log(pendingPaged);

  }, []) 
  return (
    <div>
      <div className="page-header">
        <div className="page-header__title">{tab === 'PENDING' ? 'L2 Pending Approvals' : 'L2 Approval History'}</div>
        <div className="page-header__sub">{tab === 'PENDING' ? `${approvals.length} pending` : `${history.length} in history`}</div>
      </div>

      {tab === 'PENDING' && (loading ? <Spinner /> : (
        approvals.length === 0
          ? <div className="card"><div className="empty-state"><div className="empty-state__title">No pending L2 approvals</div><div className="empty-state__sub">Tickets appear here after L1 approval</div></div></div>
          : <>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--gray-1)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '190px 1fr 100px 100px 90px', padding: '10px 16px', background: 'var(--primary-50)', borderBottom: '2px solid var(--primary-100)' }}>
                {['Ticket No.', 'Subject', 'L1 Status', 'Priority', 'L2 Status'].map(h => (
                  <div key={h} style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary-800)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</div>
                ))}
              </div>
              {pendingPaged.map(a => (
                <div key={a.approvalId} onClick={() => openModal(a, 'pending')}
                  style={{ display: 'grid', gridTemplateColumns: '190px 1fr 100px 100px 90px', padding: '12px 16px', borderBottom: '1px solid var(--gray-1)', cursor: 'pointer', transition: 'background 0.12s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <div style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--primary-800)', fontWeight: 700 }}>
                    {a.ticketNumber || `#${a.ticketId}`}
                    <div style={{ fontSize: 11, color: 'var(--gray-4)', fontFamily: 'sans-serif', fontWeight: 400 }}>{formatDate(a.createdAt)}</div>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--gray-8)', alignSelf: 'center' }}>{a.ticketSubject || `Ticket #${a.ticketId}`}</div>
                  <div style={{ alignSelf: 'center' }}><Chip status={a.l1Status} /></div>
                  <div style={{ fontSize: 12, color: 'var(--gray-6)', alignSelf: 'center' }}>—</div>
                  <div style={{ alignSelf: 'center' }}><Chip status={a.l2Status} /></div>
                </div>
              ))}
            </div>
            <Pagination page={pendingPage} total={approvals.length} pageSize={PAGE_SIZE} onChange={setPP} />
          </>
      ))}

      {tab === 'HISTORY' && (
        history.length === 0
          ? <div className="card"><div className="empty-state"><div className="empty-state__title">No history yet</div><div className="empty-state__sub">Decisions appear here permanently</div></div></div>
          : <>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--gray-1)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '190px 100px 100px 1fr 160px', padding: '10px 14px', background: 'var(--primary-50)', borderBottom: '2px solid var(--primary-100)' }}>
                {['Ticket No.', 'L1 Status', 'L2 Decision', 'Remarks', 'Processed At'].map(h => (
                  <div key={h} style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary-800)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</div>
                ))}
              </div>
              {historyPaged.map((a, i) => (
                <div key={i} onClick={() => openModal(a, 'history')}
                  style={{ display: 'grid', gridTemplateColumns: '190px 100px 100px 1fr 160px', padding: '11px 14px', borderBottom: '1px solid var(--gray-1)', cursor: 'pointer', transition: 'background 0.12s', alignItems: 'center' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <div style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--primary-800)', fontWeight: 700 }}>{a.ticketNumber || `#${a.ticketId}`}</div>
                  <div>
                    <Chip status={a.l1Status} />
                    {a.l1ApproverName && <div style={{ fontSize: 10, color: 'var(--gray-5)', marginTop: 2 }}>({a.l1ApproverName})</div>}
                  </div>
                  <div>
                    <Chip status={a.l2Status || 'PENDING'} />
                    {a.l2ApproverName && <div style={{ fontSize: 10, color: 'var(--gray-5)', marginTop: 2 }}>({a.l2ApproverName})</div>}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--gray-6)' }}>{a.remarks || '—'}</div>
                  <div style={{ fontSize: 12, color: 'var(--gray-5)' }}>{formatDate(a.processedAt)}</div>
                </div>
              ))}
            </div>
            <Pagination page={historyPage} total={history.length} pageSize={PAGE_SIZE} onChange={setHP} />
          </>
      )}

      {modal && (
        <BlurModal
          title={`${modal.mode === 'history' ? 'History — ' : ''}Ticket ${modal.approval.ticketNumber || '#' + modal.approval.ticketId}`}
          onClose={closeModal}>
          {modalLoading ? <Spinner /> : (
            <>
              {/* L1 approved banner for pending */}
              {modal.mode === 'pending' && (
                <div className="alert alert--success" style={{ marginBottom: 'var(--space-4)' }}>
                  L1 approved by <strong>{modal.approval.l1ApproverName || '—'}</strong>
                </div>
              )}

              {modal.ticket && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                  <InfoField label="Subject" value={modal.ticket.subject} />
                  <InfoField label="Requested By" value={modal.ticket.requestedByName} />
                  <InfoField label="Category" value={modal.ticket.category} />
                  <InfoField label="Sub-Category" value={modal.ticket.subCategory} />
                  <InfoField label="Item" value={modal.ticket.item} />
                  <InfoField label="Priority" value={modal.ticket.priority} />
                  <InfoField label="Location" value={modal.ticket.location} />
                  <InfoField label="Mobile" value={modal.ticket.mobileNumber} />
                  <InfoField label="L2 Approver" value={modal.approval.l2ApproverName || '—'} />
                </div>
              )}
              {modal.ticket?.description && (
                <div style={{ padding: 'var(--space-3)', background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--gray-1)', marginBottom: 'var(--space-4)' }}>
                  <div className="info-field__label" style={{ marginBottom: 4 }}>Description</div>
                  <div style={{ fontSize: 13, lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: modal.ticket.description }} />
                </div>
              )}

              {/* Pending: action buttons RIGHT-aligned */}
              {modal.mode === 'pending' && (
                <div style={{ borderTop: '1px solid var(--gray-1)', paddingTop: 'var(--space-4)' }}>
                  {action === 'REJECTED' && (
                    <div className="form-group" style={{ maxWidth: 480, marginBottom: 'var(--space-3)' }}>
                      <label className="form-label">Reason for Rejection <span className="required">*</span></label>
                      <textarea className="form-control" value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Provide reason..." style={{ minHeight: 72 }} />
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, alignItems: 'center' }}>
                    <Button variant="ghost" onClick={closeModal}>Cancel</Button>
                    <button className={`btn btn--sm${action === 'REJECTED' ? ' btn--danger' : ' btn--ghost'}`} onClick={() => setAction(action === 'REJECTED' ? '' : 'REJECTED')}>Reject</button>
                    <button className={`btn btn--sm${action === 'APPROVED' ? ' btn--success' : ' btn--ghost'}`} onClick={() => setAction(action === 'APPROVED' ? '' : 'APPROVED')}>Approve</button>
                    {action && <Button variant={action === 'APPROVED' ? 'success' : 'danger'} onClick={handleSubmit} loading={processing}>Confirm {action === 'APPROVED' ? 'Approval' : 'Rejection'}</Button>}
                  </div>
                </div>
              )}

              {modal.mode === 'history' && (
                <div style={{ borderTop: '1px solid var(--gray-1)', paddingTop: 'var(--space-3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
                    <div><div className="info-field__label">L1 Status</div><Chip status={modal.approval.l1Status} /></div>
                    <div><div className="info-field__label">L2 Decision</div><Chip status={modal.approval.l2Status || 'PENDING'} /></div>
                    {modal.approval.remarks && <div><div className="info-field__label">Remarks</div><div style={{ fontSize: 13 }}>{modal.approval.remarks}</div></div>}
                  </div>
                  <Button variant="ghost" onClick={closeModal}>Close</Button>
                </div>
              )}
            </>
          )}
        </BlurModal>
      )}
    </div>
  );
}

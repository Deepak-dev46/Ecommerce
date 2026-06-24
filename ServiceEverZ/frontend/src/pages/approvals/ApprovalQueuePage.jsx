// import React, { useState, useEffect, useCallback } from 'react';
// import { formatDate, PAGE_SIZE } from '../../utils/helpers';
// import { Chip, Spinner, Button, InfoField, Pagination } from '../../components/itsm/UI';
// import { approvalApi, ticketApi } from '../../api/ourApi';
// import { useAuth } from '../../context/AuthContext';
// import toast from 'react-hot-toast';

// /* ─── Role badge shown on each row ─────────────────────────────────────── */
// function RoleBadge({ approval, approverId }) {
//   const id = String(approverId);
//   const isL1 = String(approval.l1ApproverId) === id && approval.l1Status === 'PENDING';
//   const isL2 = String(approval.l2ApproverId) === id && approval.l1Status === 'APPROVED' && approval.l2Status === 'PENDING';
//   if (isL1 && isL2) return (
//     <span style={{
//       fontSize: '0.65rem', fontWeight: 700, background: '#EDE9FE', color: '#5B21B6',
//       borderRadius: 5, padding: '2px 7px', letterSpacing: '0.04em'
//     }}>L1 + L2</span>
//   );
//   if (isL1) return (
//     <span style={{
//       fontSize: '0.65rem', fontWeight: 700, background: '#DBEAFE', color: '#1D4ED8',
//       borderRadius: 5, padding: '2px 7px', letterSpacing: '0.04em'
//     }}>L1</span>
//   );
//   if (isL2) return (
//     <span style={{
//       fontSize: '0.65rem', fontWeight: 700, background: '#D1FAE5', color: '#065F46',
//       borderRadius: 5, padding: '2px 7px', letterSpacing: '0.04em'
//     }}>L2</span>
//   );
//   return null;
// }

// /* ─── Blur Modal ─────────────────────────────────────────────────────────── */
// function BlurModal({ title, children, onClose }) {
//   return (
//     <div style={{
//       position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center',
//       justifyContent: 'center', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
//       background: 'rgba(0,0,0,0.35)'
//     }} onClick={onClose}>
//       <div style={{
//         background: 'var(--surface)', borderRadius: 12,
//         boxShadow: '0 24px 60px rgba(0,0,0,0.25)', width: '90%', maxWidth: 700,
//         maxHeight: '88vh', overflowY: 'auto'
//       }} onClick={e => e.stopPropagation()}>
//         <div style={{
//           display: 'flex', alignItems: 'center', justifyContent: 'space-between',
//           padding: '20px 24px 16px', borderBottom: '1px solid var(--gray-1)',
//           position: 'sticky', top: 0, background: 'var(--surface)', zIndex: 1
//         }}>
//           <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--primary-900)' }}>{title}</div>
//           <button onClick={onClose} style={{
//             background: 'none', border: 'none', cursor: 'pointer',
//             fontSize: 22, color: 'var(--gray-5)', lineHeight: 1, padding: '0 4px'
//           }}>×</button>
//         </div>
//         <div style={{ padding: '20px 24px' }}>{children}</div>
//       </div>
//     </div>
//   );
// }

// /* ─── Confirmation Overlay ───────────────────────────────────────────────── */
// function OverlayModal({ children }) {
//   return (
//     <div style={{
//       position: 'fixed', inset: 0, zIndex: 1200, display: 'flex', alignItems: 'center',
//       justifyContent: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)'
//     }}>
//       <div style={{
//         background: '#fff', borderRadius: 14, padding: '32px 28px', width: 460,
//         maxWidth: '94vw', boxShadow: '0 24px 60px rgba(0,0,0,0.22)'
//       }}
//         onClick={e => e.stopPropagation()}>
//         {children}
//       </div>
//     </div>
//   );
// }

// /* ══════════════════════════════════════════════════════════════════════════
//    MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════ */
// export default function ApprovalQueuePage({ showSnack, defaultTab = 'PENDING' }) {
//   const { user } = useAuth();
//   const approverId = user?.userId ? String(user.userId) : null;

//   const [tab, setTab] = useState(defaultTab);
//   const [pending, setPending] = useState([]);
//   const [history, setHistory] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [histLoading, setHistLoading] = useState(false);
//   const [pendingPage, setPP] = useState(1);
//   const [historyPage, setHP] = useState(1);

//   // Ticket detail modal
//   const [modal, setModal] = useState(null);
//   const [modalLoading, setModalLoading] = useState(false);
//   const [processing, setProcessing] = useState(false);

//   // Confirmation overlays
//   const [overlay, setOverlay] = useState(null); // 'approve'|'reject'|'needinfo'
//   const [rejectReason, setRejectReason] = useState('');
//   const [needInfoText, setNeedInfoText] = useState('');

//   const [modalComments, setModalComments] = useState([]);
//   const [modalTab, setModalTab] = useState('details'); // 'details' | 'conversation'

//   useEffect(() => { setTab(defaultTab); }, [defaultTab]);

//   /* ── data loaders ── */
//   const load = useCallback(() => {
//     setLoading(true);
//     approvalApi.getPendingForApprover(approverId)
//       .then(d => setPending((Array.isArray(d) ? d : []).sort((a, b) =>
//         new Date(b.createdAt) - new Date(a.createdAt))))
//       .catch(() => { })
//       .finally(() => setLoading(false));
//   }, [approverId]);

//   const loadHistory = useCallback(() => {
//     setHistLoading(true);
//     approvalApi.getHistoryForApprover(approverId)
//       .then(d => setHistory(Array.isArray(d) ? d : []))
//       .catch(() => { })
//       .finally(() => setHistLoading(false));
//   }, [approverId]);

//   useEffect(() => { load(); loadHistory(); }, [load, loadHistory]);

//   /* ── determine which approver level to use for this action ── */
//   const getApproverLevel = (approval) => {
//     if (!approval || !approverId) return 'L1';
//     const isL2Pending = String(approval.l2ApproverId) === approverId
//       && approval.l1Status === 'APPROVED'
//       && approval.l2Status === 'PENDING';
//     return isL2Pending ? 'L2' : 'L1';
//   };

//   /* ── open modal ── */
//   const openModal = async (a, mode) => {
//     setModal({ approval: a, ticket: null, mode });
//     setModalComments([]);
//     setModalTab('details');
//     setOverlay(null);
//     setModalLoading(true);
//     try {
//       const level = getApproverLevel(a);
//       const [t, comments] = await Promise.all([
//         ticketApi.getById(a.ticketId),
//         ticketApi.getCommentsByChannel(a.ticketId, `${level}_USER`).catch(() => []),
//       ]);
//       setModal(prev => ({ ...prev, ticket: t }));
//       setModalComments(Array.isArray(comments) ? comments : []);
//     } catch {
//       setModal(prev => ({ ...prev, ticket: null }));
//     } finally {
//       setModalLoading(false);
//     }
//   };

//   const closeModal = () => { setModal(null); setOverlay(null); setModalComments([]); };
//   const closeOverlay = () => setOverlay(null);

//   /* ── confirm handlers ── */
//   const handleApproveConfirm = async () => {
//     setProcessing(true);
//     try {
//       const level = getApproverLevel(modal.approval);
//       await approvalApi.processAction({
//         ticketId: modal.approval.ticketId,
//         approverLevel: level,
//         action: 'APPROVED',
//         remarks: ''
//       });
//       setPending(prev => prev.filter(a => a.ticketId !== modal.approval.ticketId));
//       closeModal();
//       loadHistory();
//       toast.success(`Ticket ${level} Approved`);
//     } catch (e) {
//       toast.error(e?.response?.data?.message || 'Approval failed');
//     } finally { setProcessing(false); }
//   };

//   const handleRejectConfirm = async () => {
//     if (!rejectReason.trim()) { toast.error('Rejection reason is mandatory'); return; }
//     setProcessing(true);
//     try {
//       const level = getApproverLevel(modal.approval);
//       await approvalApi.processAction({
//         ticketId: modal.approval.ticketId,
//         approverLevel: level,
//         action: 'REJECTED',
//         remarks: rejectReason
//       });
//       setPending(prev => prev.filter(a => a.ticketId !== modal.approval.ticketId));
//       closeModal();
//       loadHistory();
//       toast.error(`Ticket ${level} Rejected`);
//     } catch (e) {
//       toast.error(e?.response?.data?.message || 'Rejection failed');
//     } finally { setProcessing(false); }
//   };

//   /* FIX: removed duplicate `const level` declaration */
//   const handleNeedInfoConfirm = async () => {
//     if (!needInfoText.trim()) { toast.error('Please enter your message'); return; }
//     setProcessing(true);
//     try {
//       const level = getApproverLevel(modal.approval);
//       await approvalApi.processAction({
//         ticketId: modal.approval.ticketId,
//         approverLevel: level,
//         action: 'NEED_INFO',
//         remarks: needInfoText
//       });
//       toast.success('Message sent to end user');
//       const fresh = await ticketApi.getCommentsByChannel(modal.approval.ticketId, `${level}_USER`).catch(() => []);
//       setModalComments(Array.isArray(fresh) ? fresh : []);
//       setModalTab('conversation');
//       setNeedInfoText('');
//       closeOverlay();
//     } catch (e) {
//       toast.error(e?.response?.data?.message || 'Failed to send message');
//     } finally { setProcessing(false); }
//   };

//   const getVal = (t, ...keys) => {
//     for (const k of keys) {
//       if (t && k in t && t[k] !== null && t[k] !== '') return t[k];
//     }
//     return '—';
//   };

//   const pendingPaged = pending.slice((pendingPage - 1) * PAGE_SIZE, pendingPage * PAGE_SIZE);
//   const histPaged = history.slice((historyPage - 1) * PAGE_SIZE, historyPage * PAGE_SIZE);

//   /* ── render ── */
//   return (
//     <div>
//       <div className="page-header">
//         <div className="page-header__title">{tab === 'PENDING' ? 'Pending Tickets' : 'Approval History'}</div>
//         <div className="page-header__sub">
//           {tab === 'PENDING'
//             ? `${pending.length} ticket${pending.length !== 1 ? 's' : ''} pending your approval`
//             : `${history.length} ticket${history.length !== 1 ? 's' : ''} in history`}
//         </div>
//       </div>

//       {/* ── PENDING TAB ── */}
//       {tab === 'PENDING' && (loading ? <Spinner /> : (
//         pending.length === 0
//           ? <div className="card"><div className="empty-state">
//             <div className="empty-state__title">No pending approvals</div>
//             <div className="empty-state__sub">Tickets assigned to you for L1 or L2 approval appear here</div>
//           </div></div>
//           : <>
//             <div style={{
//               background: 'var(--surface)', border: '1px solid var(--gray-1)',
//               borderRadius: 'var(--radius-md)', overflow: 'hidden'
//             }}>
//               <div style={{
//                 display: 'grid', gridTemplateColumns: '190px 1fr 140px 80px 80px',
//                 padding: '10px 16px', background: 'var(--primary-50)',
//                 borderBottom: '2px solid var(--primary-100)'
//               }}>
//                 {['Ticket No.', 'Subject', 'Requester', 'Submitted'].map(h => (
//                   <div key={h} style={{
//                     fontSize: 11, fontWeight: 700, color: 'var(--primary-800)',
//                     textTransform: 'uppercase', letterSpacing: 0.5
//                   }}>{h}</div>
//                 ))}
//               </div>
//               {pendingPaged.map(a => (
//                 <div key={a.approvalId} onClick={() => openModal(a, 'pending')}
//                   style={{
//                     display: 'grid', gridTemplateColumns: '190px 1fr 140px 80px 80px',
//                     padding: '12px 16px', borderBottom: '1px solid var(--gray-1)',
//                     cursor: 'pointer', transition: 'background 0.12s'
//                   }}
//                   onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
//                   onMouseLeave={e => e.currentTarget.style.background = ''}>
//                   <div style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--primary-800)', fontWeight: 700 }}>
//                     {a.ticketNumber || `#${a.ticketId}`}
//                     <div style={{ fontSize: 11, color: 'var(--gray-4)', fontFamily: 'sans-serif', fontWeight: 400 }}>
//                       {formatDate(a.createdAt)}
//                     </div>
//                   </div>
//                   <div style={{ fontSize: 13, color: 'var(--gray-8)', alignSelf: 'center' }}>
//                     {a.ticketSubject || `Ticket #${a.ticketId}`}
//                   </div>
//                   <div style={{ fontSize: 12, color: 'var(--gray-6)', alignSelf: 'center' }}>
//                     {a.requesterName || '—'}
//                   </div>
//                   <div style={{ fontSize: 12, color: 'var(--gray-5)', alignSelf: 'center' }}>
//                     {formatDate(a.createdAt)}
//                   </div>
//                 </div>
//               ))}
//             </div>
//             <Pagination page={pendingPage} total={pending.length} pageSize={PAGE_SIZE} onChange={setPP} />
//           </>
//       ))}

//       {/* ── HISTORY TAB ── */}
//       {tab === 'HISTORY' && (
//         histLoading ? <Spinner /> :
//           history.length === 0
//             ? <div className="card"><div className="empty-state">
//               <div className="empty-state__title">No history yet</div>
//               <div className="empty-state__sub">Approved and rejected tickets appear here</div>
//             </div></div>
//             : <>
//               <div style={{
//                 background: 'var(--surface)', border: '1px solid var(--gray-1)',
//                 borderRadius: 'var(--radius-md)', overflow: 'hidden'
//               }}>
//                 <div style={{
//                   display: 'grid', gridTemplateColumns: '280px 190px 1fr 160px',
//                   padding: '10px 14px', background: 'var(--primary-50)',
//                   borderBottom: '2px solid var(--primary-100)'
//                 }}>
//                   {['Ticket No.', 'Status', 'Subject', 'Updated At'].map(h => (
//                     <div key={h} style={{
//                       fontSize: 11, fontWeight: 700, color: 'var(--primary-800)',
//                       textTransform: 'uppercase', letterSpacing: 0.5
//                     }}>{h}</div>
//                   ))}
//                 </div>
//                 {histPaged.map((a, i) => (
//                   <div key={i} onClick={() => openModal(a, 'history')}
//                     style={{
//                       display: 'grid', gridTemplateColumns: '280px 140px 1fr 220px',
//                       padding: '11px 14px', borderBottom: '1px solid var(--gray-1)',
//                       cursor: 'pointer', transition: 'background 0.12s', alignItems: 'center'
//                     }}
//                     onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
//                     onMouseLeave={e => e.currentTarget.style.background = ''}>
//                     <div style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--primary-800)', fontWeight: 700 }}>
//                       {a.ticketNumber || `#${a.ticketId}`}
//                     </div>
//                     <div>
//                       <Chip status={String(a.l1ApproverId) === approverId ? a.l1Status : a.l2Status} />
//                     </div>
//                     <div style={{ fontSize: 12, color: 'var(--gray-6)' }}>
//                       {a.ticketSubject || a.subject || '—'}
//                     </div>
//                     <div style={{ fontSize: 12, color: 'var(--gray-5)' }}>
//                       {formatDate(a.updatedAt)}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//               <Pagination page={historyPage} total={history.length} pageSize={PAGE_SIZE} onChange={setHP} />
//             </>
//       )}

//       {/* ── TICKET DETAIL MODAL ── */}
//       {modal && (
//         <BlurModal
//           title={`Ticket ${modal.approval.ticketNumber || '#' + modal.approval.ticketId}`}
//           onClose={closeModal}
//         >
//           {modalLoading ? <Spinner /> : (
//             <>
//               {/* ── TAB BAR — show if NEED_INFO was ever sent ── */}
//               {modal.approval.remarks?.startsWith('NEED_INFO') && (
//                 <div style={{ display: 'flex', gap: 0, marginBottom: 16, borderBottom: '1px solid var(--gray-1)' }}>
//                   {['details', 'conversation'].map(t => (
//                     <button key={t} onClick={() => setModalTab(t)}
//                       style={{
//                         padding: '7px 18px', fontSize: 13, fontWeight: 600, border: 'none',
//                         background: 'none', cursor: 'pointer', textTransform: 'capitalize',
//                         color: modalTab === t ? 'var(--primary-700)' : 'var(--gray-5)',
//                         borderBottom: modalTab === t ? '2px solid var(--primary-700)' : '2px solid transparent',
//                         marginBottom: -1,
//                       }}>
//                       {t === 'conversation'
//                         ? `Conversation${modalComments.length ? ` (${modalComments.length})` : ''}`
//                         : 'Details'}
//                     </button>
//                   ))}
//                 </div>
//               )}

//               {/* ══ DETAILS TAB ══ */}
//               {modalTab === 'details' && (
//                 <>
//                   {modal.mode === 'pending' && modal.approval.remarks?.startsWith('NEED_INFO') && (
//                     <div style={{
//                       display: 'flex', alignItems: 'center', gap: 8,
//                       marginBottom: 'var(--space-4)',
//                       padding: '8px 12px', background: '#FFFBEB',
//                       borderRadius: 8, border: '1px solid #FDE68A'
//                     }}>
//                       <span style={{
//                         fontSize: 11, background: '#FEF3C7', color: '#92400E',
//                         borderRadius: 6, padding: '2px 8px', fontWeight: 700
//                       }}>
//                         ⏳ Awaiting User Reply
//                       </span>
//                       <span style={{ fontSize: 12, color: '#78350F' }}>
//                         Info requested: {modal.approval.remarks.replace(/^NEED_INFO:\s*/, '')}
//                       </span>
//                     </div>
//                   )}

//                   <div style={{
//                     display: 'grid', gridTemplateColumns: '1fr 1fr',
//                     gap: 'var(--space-3)', marginBottom: 'var(--space-4)'
//                   }}>
//                     <InfoField label="Subject"
//                       value={modal.ticket ? getVal(modal.ticket, 'subject') : (modal.approval.ticketSubject || '—')} />
//                     <InfoField label="Requested By"
//                       value={modal.ticket ? getVal(modal.ticket, 'requesterName', 'requestedByName') : (modal.approval.requesterName || '—')} />
//                     {modal.ticket && <>
//                       <InfoField label="Category"     value={getVal(modal.ticket, 'category', 'categoryName')} />
//                       <InfoField label="Sub-Category" value={getVal(modal.ticket, 'subCategory', 'subCategoryName')} />
//                       <InfoField label="Item"         value={getVal(modal.ticket, 'item', 'itemName')} />
//                       <InfoField label="Priority"
//                         value={typeof modal.ticket.priority === 'object'
//                           ? (modal.ticket.priority?.name || modal.ticket.priority?.priorityName || '—')
//                           : (modal.ticket.priority || modal.ticket.priorityName || '—')} />
//                       <InfoField label="Location"     value={getVal(modal.ticket, 'location')} />
//                       <InfoField label="Mobile"       value={getVal(modal.ticket, 'mobileNumber')} />
//                     </>}
//                     <InfoField label="L1 Approver" value={modal.approval.l1ApproverName || '—'} />
//                     <InfoField label="L2 Approver" value={modal.approval.l2ApproverName || '—'} />
//                   </div>

//                   {modal.ticket?.description && (
//                     <div style={{
//                       padding: 'var(--space-3)', background: 'var(--surface-2)',
//                       borderRadius: 'var(--radius-sm)', border: '1px solid var(--gray-1)',
//                       marginBottom: 'var(--space-4)'
//                     }}>
//                       <div className="info-field__label" style={{ marginBottom: 4 }}>Description</div>
//                       <div style={{ fontSize: 13, lineHeight: 1.7 }}
//                         dangerouslySetInnerHTML={{ __html: modal.ticket.description }} />
//                     </div>
//                   )}

//                   {modal.mode === 'pending' && (
//                     <div style={{
//                       borderTop: '1px solid var(--gray-1)', paddingTop: 'var(--space-4)',
//                       marginTop: 'var(--space-2)', display: 'flex', justifyContent: 'flex-end', gap: 10
//                     }}>
//                       <Button variant="ghost" onClick={closeModal}>Cancel</Button>
//                       <button className="btn btn--sm btn--ghost"
//                         onClick={() => { setNeedInfoText(''); setOverlay('needinfo'); }}>Need Info</button>
//                       <button className="btn btn--sm btn--danger"
//                         onClick={() => { setRejectReason(''); setOverlay('reject'); }}>Reject</button>
//                       <button className="btn btn--sm btn--success"
//                         onClick={() => setOverlay('approve')}>Approve</button>
//                     </div>
//                   )}

//                   {modal.mode === 'history' && (
//                     <div style={{
//                       borderTop: '1px solid var(--gray-1)', paddingTop: 'var(--space-3)',
//                       display: 'flex', justifyContent: 'space-between', alignItems: 'center'
//                     }}>
//                       <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
//                         {modal.approval.remarks && (
//                           <div>
//                             <div className="info-field__label">Remarks</div>
//                             <div style={{ fontSize: 13 }}>{modal.approval.remarks}</div>
//                           </div>
//                         )}
//                       </div>
//                       <Button variant="ghost" onClick={closeModal}>Close</Button>
//                     </div>
//                   )}
//                 </>
//               )}

//               {/* ══ CONVERSATION TAB ══ */}
//               {modalTab === 'conversation' && (
//                 <div>
//                   <div style={{ fontSize: 12, color: 'var(--gray-5)', marginBottom: 14 }}>
//                     Conversation with the requester — only visible to you.
//                   </div>
//                   {modalComments.length === 0 ? (
//                     <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--gray-4)', fontSize: 13 }}>
//                       No replies yet — the user has been notified by email.
//                     </div>
//                   ) : (
//                     <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 340, overflowY: 'auto', paddingRight: 4 }}>
//                       {modalComments.map((c, i) => {
//                         const isUser = c.authRole === 'END_USER' || c.authorRole === 'END_USER';
//                         return (
//                           <div key={c.id || i} style={{
//                             display: 'flex',
//                             flexDirection: isUser ? 'row' : 'row-reverse',
//                             alignItems: 'flex-start', gap: 8,
//                           }}>
//                             <div style={{
//                               width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
//                               background: isUser ? '#EFF6FF' : '#F0FDF4',
//                               display: 'flex', alignItems: 'center', justifyContent: 'center',
//                               fontSize: 12, fontWeight: 700,
//                               color: isUser ? '#1D4ED8' : '#15803D',
//                             }}>
//                               {(c.authorName || 'U')[0].toUpperCase()}
//                             </div>
//                             <div style={{
//                               maxWidth: '75%', padding: '9px 13px',
//                               background: isUser ? '#EFF6FF' : '#F0FDF4',
//                               borderRadius: isUser ? '4px 12px 12px 12px' : '12px 4px 12px 12px',
//                               border: `1px solid ${isUser ? '#BFDBFE' : '#BBF7D0'}`,
//                             }}>
//                               <div style={{
//                                 fontSize: 11, fontWeight: 700, marginBottom: 4,
//                                 color: isUser ? '#1D4ED8' : '#15803D'
//                               }}>
//                                 {c.authorName || 'Unknown'} · {isUser ? 'End User' : 'Approver'}
//                               </div>
//                               <div style={{ fontSize: 13, color: '#1F2937', lineHeight: 1.5 }}>
//                                 {c.comment}
//                               </div>
//                               <div style={{ fontSize: 10, color: 'var(--gray-4)', marginTop: 4, textAlign: 'right' }}>
//                                 {c.createdAt ? new Date(c.createdAt).toLocaleString() : ''}
//                               </div>
//                             </div>
//                           </div>
//                         );
//                       })}
//                     </div>
//                   )}

//                   {/* Reply box — only in pending mode */}
//                   {modal.mode === 'pending' && (
//                     <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
//                       <textarea
//                         className="form-control"
//                         value={needInfoText}
//                         onChange={e => setNeedInfoText(e.target.value)}
//                         placeholder="Send another message to the user..."
//                         style={{ flex: 1, minHeight: 60, fontSize: 12, resize: 'vertical' }}
//                       />
//                       <button
//                         className="btn btn--primary btn--sm"
//                         disabled={processing || !needInfoText.trim()}
//                         onClick={handleNeedInfoConfirm}
//                         style={{ alignSelf: 'flex-end' }}
//                       >
//                         Send
//                       </button>
//                     </div>
//                   )}

//                   <div style={{
//                     borderTop: '1px solid var(--gray-1)', paddingTop: 12, marginTop: 16,
//                     display: 'flex', justifyContent: 'flex-end'
//                   }}>
//                     <Button variant="ghost" onClick={closeModal}>Close</Button>
//                   </div>
//                 </div>
//               )}
//             </>
//           )}
//         </BlurModal>
//       )}

//       {/* ── APPROVE OVERLAY ── */}
//       {overlay === 'approve' && (
//         <OverlayModal>
//           <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 10, color: '#1a1a2e' }}>Confirm Approval</div>
//           <div style={{ fontSize: 14, color: '#6B7280', marginBottom: 28 }}>
//             Are you sure you want to <strong>approve</strong> this ticket?
//           </div>
//           <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
//             <button className="btn btn--ghost btn--sm" onClick={closeOverlay} disabled={processing}>No, Cancel</button>
//             <Button variant="success" loading={processing} onClick={handleApproveConfirm}>Yes, Approve</Button>
//           </div>
//         </OverlayModal>
//       )}

//       {/* ── REJECT OVERLAY ── */}
//       {overlay === 'reject' && (
//         <OverlayModal>
//           <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 8, color: '#1a1a2e' }}>Confirm Rejection</div>
//           <div style={{ fontSize: 14, color: '#6B7280', marginBottom: 14 }}>
//             Provide a reason — this is <strong>mandatory</strong>.
//           </div>
//           <textarea className="form-control" value={rejectReason}
//             onChange={e => setRejectReason(e.target.value)}
//             placeholder="Enter rejection reason..."
//             style={{ minHeight: 90, marginBottom: 20, width: '100%', boxSizing: 'border-box' }} />
//           <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 20 }}>
//             Are you sure you want to <strong>reject</strong> this ticket?
//           </div>
//           <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
//             <button className="btn btn--ghost btn--sm" onClick={closeOverlay} disabled={processing}>No, Cancel</button>
//             <Button variant="danger" loading={processing} onClick={handleRejectConfirm}>Yes, Reject</Button>
//           </div>
//         </OverlayModal>
//       )}

//       {/* ── NEED INFO OVERLAY ── */}
//       {overlay === 'needinfo' && (
//         <OverlayModal>
//           <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 8, color: '#1a1a2e' }}>
//             Request Additional Information
//           </div>
//           <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 14 }}>
//             Your message will be sent to the end user and visible in their My Tickets page.
//             The ticket stays in your queue until you approve or reject it.
//           </div>
//           <textarea className="form-control" value={needInfoText}
//             onChange={e => setNeedInfoText(e.target.value)}
//             placeholder="What information do you need from the user?"
//             style={{ minHeight: 100, marginBottom: 20, width: '100%', boxSizing: 'border-box' }} />
//           <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
//             <button className="btn btn--ghost btn--sm" onClick={closeOverlay} disabled={processing}>Cancel</button>
//             <Button variant="primary" loading={processing} onClick={handleNeedInfoConfirm}>Send Message</Button>
//           </div>
//         </OverlayModal>
//       )}
//     </div>
//   );
// }

// import React, { useState, useEffect, useCallback } from 'react';
// import { formatDate, PAGE_SIZE } from '../../utils/helpers';
// import { Chip, Spinner, Button, InfoField, Pagination } from '../../components/itsm/UI';
// import { approvalApi, ticketApi } from '../../api/ourApi';
// import { useAuth } from '../../context/AuthContext';
// import toast from 'react-hot-toast';

// /* ─── Role badge ─────────────────────────────────────────────────────────── */
// function RoleBadge({ approval, approverId }) {
//   const id = String(approverId);
//   const isL1 = String(approval.l1ApproverId) === id && approval.l1Status === 'PENDING';
//   const isL2 = String(approval.l2ApproverId) === id && approval.l1Status === 'APPROVED' && approval.l2Status === 'PENDING';
//   if (isL1 && isL2) return <span style={{ fontSize: '0.65rem', fontWeight: 700, background: '#EDE9FE', color: '#5B21B6', borderRadius: 5, padding: '2px 7px', letterSpacing: '0.04em' }}>L1 + L2</span>;
//   if (isL1) return <span style={{ fontSize: '0.65rem', fontWeight: 700, background: '#DBEAFE', color: '#1D4ED8', borderRadius: 5, padding: '2px 7px', letterSpacing: '0.04em' }}>L1</span>;
//   if (isL2) return <span style={{ fontSize: '0.65rem', fontWeight: 700, background: '#D1FAE5', color: '#065F46', borderRadius: 5, padding: '2px 7px', letterSpacing: '0.04em' }}>L2</span>;
//   return null;
// }

// /* ─── Blur Modal ─────────────────────────────────────────────────────────── */
// function BlurModal({ title, children, onClose }) {
//   return (
//     <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', background: 'rgba(0,0,0,0.35)' }} onClick={onClose}>
//       <div style={{ background: 'var(--surface)', borderRadius: 12, boxShadow: '0 24px 60px rgba(0,0,0,0.25)', width: '90%', maxWidth: 700, maxHeight: '88vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
//         <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 16px', borderBottom: '1px solid var(--gray-1)', position: 'sticky', top: 0, background: 'var(--surface)', zIndex: 1 }}>
//           <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--primary-900)' }}>{title}</div>
//           <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: 'var(--gray-5)', lineHeight: 1, padding: '0 4px' }}>×</button>
//         </div>
//         <div style={{ padding: '20px 24px' }}>{children}</div>
//       </div>
//     </div>
//   );
// }

// /* ─── Confirmation Overlay ───────────────────────────────────────────────── */
// function OverlayModal({ children }) {
//   return (
//     <div style={{ position: 'fixed', inset: 0, zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
//       <div style={{ background: '#fff', borderRadius: 14, padding: '32px 28px', width: 460, maxWidth: '94vw', boxShadow: '0 24px 60px rgba(0,0,0,0.22)' }} onClick={e => e.stopPropagation()}>
//         {children}
//       </div>
//     </div>
//   );
// }

// /* ─── Filter Select ──────────────────────────────────────────────────────── */
// function FilterSelect({ value, onChange, children }) {
//   return (
//     <select
//       value={value}
//       onChange={e => onChange(e.target.value)}
//       style={{ height: 32, padding: '0 10px', borderRadius: 6, border: '1.5px solid var(--gray-3)', fontSize: 12, background: '#fff', color: 'var(--gray-8)', cursor: 'pointer', minWidth: 130 }}
//     >
//       {children}
//     </select>
//   );
// }

// /* ══════════════════════════════════════════════════════════════════════════
//    MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════ */
// export default function ApprovalQueuePage({ showSnack, defaultTab = 'PENDING' }) {
//   const { user } = useAuth();
//   const approverId = user?.userId ? String(user.userId) : null;

//   const [tab, setTab] = useState(defaultTab);
//   const [pending, setPending] = useState([]);
//   const [history, setHistory] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [histLoading, setHistLoading] = useState(false);
//   const [pendingPage, setPP] = useState(1);
//   const [historyPage, setHP] = useState(1);

//   // Ticket detail modal
//   const [modal, setModal] = useState(null);
//   const [modalLoading, setModalLoading] = useState(false);
//   const [processing, setProcessing] = useState(false);

//   // Confirmation overlays
//   const [overlay, setOverlay] = useState(null);
//   const [rejectReason, setRejectReason] = useState('');
//   const [needInfoText, setNeedInfoText] = useState('');

//   // ── Filter & Sort states ──
//   const [filterPriority, setFilterPriority] = useState('');
//   const [filterCategory, setFilterCategory] = useState('');
//   const [filterDays, setFilterDays] = useState('');
//   const [sortOldest, setSortOldest] = useState(false);

//   useEffect(() => { setTab(defaultTab); }, [defaultTab]);

//   /* ── data loaders ── */
//   // const load = useCallback(() => {
//   //   setLoading(true);
//   //   approvalApi.getPendingForApprover(approverId)
//   //     .then(d => setPending((Array.isArray(d) ? d : []).sort((a, b) =>
//   //       new Date(b.createdAt) - new Date(a.createdAt))))
//   //     .catch(() => {})
//   //     .finally(() => setLoading(false));
//   // }, [approverId]);

//   const load = useCallback(() => {
//     setLoading(true);
//     approvalApi.getPendingForApprover(approverId)
//       .then(async (d) => {
//         const list = (Array.isArray(d) ? d : []).sort((a, b) =>
//           new Date(b.createdAt) - new Date(a.createdAt));
//         // Enrich each approval with priority + category from ticket details
//         const enriched = await Promise.all(list.map(async (a) => {
//           try {
//             const t = await ticketApi.getById(a.ticketId);
//             return {
//               ...a,
//               priority: typeof t.priority === 'object'
//                 ? (t.priority?.priorityName || t.priority?.name || '')
//                 : (t.priority || t.priorityName || ''),
//               categoryName: t.category || t.categoryName || '',
//             };
//           } catch {
//             return a;
//           }
//         }));
//         setPending(enriched);
//       })
//       .catch(() => { })
//       .finally(() => setLoading(false));
//   }, [approverId]);

//   const loadHistory = useCallback(() => {
//     setHistLoading(true);
//     approvalApi.getHistoryForApprover(approverId)
//       .then(d => setHistory(Array.isArray(d) ? d : []))
//       .catch(() => { })
//       .finally(() => setHistLoading(false));
//   }, [approverId]);

//   useEffect(() => { load(); loadHistory(); }, [load, loadHistory]);

//   /* ── open modal ── */
//   const openModal = async (a, mode) => {
//     setModal({ approval: a, ticket: null, mode });
//     setOverlay(null);
//     setModalLoading(true);
//     try {
//       const t = await ticketApi.getById(a.ticketId);
//       setModal(prev => ({ ...prev, ticket: t }));
//     } catch {
//       setModal(prev => ({ ...prev, ticket: null }));
//     } finally {
//       setModalLoading(false);
//     }
//   };

//   const closeModal = () => { setModal(null); setOverlay(null); };
//   const closeOverlay = () => setOverlay(null);

//   /* ── approver level ── */
//   const getApproverLevel = (approval) => {
//     if (!approval || !approverId) return 'L1';
//     const isL2Pending = String(approval.l2ApproverId) === approverId
//       && approval.l1Status === 'APPROVED'
//       && approval.l2Status === 'PENDING';
//     return isL2Pending ? 'L2' : 'L1';
//   };

//   /* ── confirm handlers ── */
//   const handleApproveConfirm = async () => {
//     setProcessing(true);
//     try {
//       const level = getApproverLevel(modal.approval);
//       await approvalApi.processAction({ ticketId: modal.approval.ticketId, approverLevel: level, action: 'APPROVED', remarks: '' });
//       setPending(prev => prev.filter(a => a.ticketId !== modal.approval.ticketId));
//       closeModal(); loadHistory();
//       toast.success(`Ticket ${level} Approved`);
//     } catch (e) { toast.error(e?.response?.data?.message || 'Approval failed'); }
//     finally { setProcessing(false); }
//   };

//   const handleRejectConfirm = async () => {
//     if (!rejectReason.trim()) { toast.error('Rejection reason is mandatory'); return; }
//     setProcessing(true);
//     try {
//       const level = getApproverLevel(modal.approval);
//       await approvalApi.processAction({ ticketId: modal.approval.ticketId, approverLevel: level, action: 'REJECTED', remarks: rejectReason });
//       setPending(prev => prev.filter(a => a.ticketId !== modal.approval.ticketId));
//       closeModal(); loadHistory();
//       toast.error(`Ticket ${level} Rejected`);
//     } catch (e) { toast.error(e?.response?.data?.message || 'Rejection failed'); }
//     finally { setProcessing(false); }
//   };

//   const handleNeedInfoConfirm = async () => {
//     if (!needInfoText.trim()) { toast.error('Please enter your message'); return; }
//     setProcessing(true);
//     try {
//       const level = getApproverLevel(modal.approval);
//       await approvalApi.processAction({ ticketId: modal.approval.ticketId, approverLevel: level, action: 'NEED_INFO', remarks: needInfoText });
//       toast.success('Message sent to end user');
//       closeOverlay();
//     } catch (e) { toast.error(e?.response?.data?.message || 'Failed to send message'); }
//     finally { setProcessing(false); }
//   };

//   const getVal = (t, ...keys) => {
//     for (const k of keys) { if (t && k in t && t[k] !== null && t[k] !== '') return t[k]; }
//     return '—';
//   };

//   /* ── Filter & Sort logic ── */
//   const daysPending = (createdAt) => {
//     if (!createdAt) return 0;
//     return Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));
//   };

//   const categories = [...new Set(pending.map(a => a.categoryName || a.category).filter(Boolean))];
//   const priorities = [...new Set(pending.map(a => a.priority).filter(Boolean))];

//   const filteredPending = pending
//     .filter(a => {
//       if (filterPriority && (a.priority || '').toLowerCase() !== filterPriority.toLowerCase()) return false;
//       if (filterCategory && (a.categoryName || a.category || '').toLowerCase() !== filterCategory.toLowerCase()) return false;
//       if (filterDays) {
//         const days = daysPending(a.createdAt);
//         if (filterDays === '1' && days > 1) return false;
//         if (filterDays === '3' && days > 3) return false;
//         if (filterDays === '7' && days > 7) return false;
//         if (filterDays === '7+' && days <= 7) return false;
//       }
//       return true;
//     })
//     .sort((a, b) => sortOldest
//       ? new Date(a.createdAt) - new Date(b.createdAt)
//       : new Date(b.createdAt) - new Date(a.createdAt)
//     );

//   const clearFilters = () => { setFilterPriority(''); setFilterCategory(''); setFilterDays(''); setPP(1); };
//   const hasFilters = filterPriority || filterCategory || filterDays;

//   const pendingPaged = filteredPending.slice((pendingPage - 1) * PAGE_SIZE, pendingPage * PAGE_SIZE);
//   const histPaged = history.slice((historyPage - 1) * PAGE_SIZE, historyPage * PAGE_SIZE);

//   /* ── render ── */
//   return (
//     <div>
//       <div className="page-header">
//         <div className="page-header__title">{tab === 'PENDING' ? 'Pending Tickets' : 'Approval History'}</div>
//         <div className="page-header__sub">
//           {tab === 'PENDING'
//             ? `${pending.length} ticket${pending.length !== 1 ? 's' : ''} pending your approval`
//             : `${history.length} ticket${history.length !== 1 ? 's' : ''} in history`}
//         </div>
//       </div>

//       {/* ── PENDING TAB ── */}
//       {tab === 'PENDING' && (loading ? <Spinner /> : (
//         pending.length === 0
//           ? <div className="card"><div className="empty-state">
//             <div className="empty-state__title">Your approval queue is empty</div>
//             <div className="empty-state__sub">Tickets assigned to you for L1 or L2 approval appear here</div>
//           </div></div>
//           : <>
//             {/* Filter Bar */}
//             <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
//               <FilterSelect value={filterPriority} onChange={v => { setFilterPriority(v); setPP(1); }}>
//                 <option value="">All Priorities</option>
//                 {priorities.map(p => <option key={p} value={p}>{p}</option>)}
//               </FilterSelect>

//               <FilterSelect value={filterCategory} onChange={v => { setFilterCategory(v); setPP(1); }}>
//                 <option value="">All Categories</option>
//                 {categories.map(c => <option key={c} value={c}>{c}</option>)}
//               </FilterSelect>

//               <FilterSelect value={filterDays} onChange={v => { setFilterDays(v); setPP(1); }}>
//                 <option value="">All</option>
//                 <option value="1">Today (≤ 1 day)</option>
//                 <option value="3">≤ 3 days</option>
//                 <option value="7">≤ 7 days</option>
//                 <option value="7+">Older than 7 days</option>
//               </FilterSelect>

//               <button
//                 onClick={() => { setSortOldest(s => !s); setPP(1); }}
//                 style={{ height: 32, padding: '0 12px', borderRadius: 6, border: '1.5px solid var(--gray-3)', fontSize: 12, background: sortOldest ? '#27235C' : '#fff', color: sortOldest ? '#fff' : 'var(--gray-8)', cursor: 'pointer', fontWeight: sortOldest ? 600 : 400 }}
//               >
//                 {sortOldest ? '↑ Oldest First' : '↓ Newest First'}
//               </button>

//               {hasFilters && (
//                 <button onClick={clearFilters} style={{ height: 32, padding: '0 12px', borderRadius: 6, border: '1.5px solid #fca5a5', fontSize: 12, background: '#fff8f8', color: '#dc2626', cursor: 'pointer' }}>
//                   Clear Filters
//                 </button>
//               )}

//               <span style={{ fontSize: 12, color: 'var(--gray-5)', marginLeft: 'auto' }}>
//                 {filteredPending.length} of {pending.length} ticket{pending.length !== 1 ? 's' : ''}
//               </span>
//             </div>

//             {filteredPending.length === 0
//               ? <div className="card"><div className="empty-state">
//                 <div className="empty-state__title">No tickets match selected filters</div>
//                 <div className="empty-state__sub">Try adjusting or clearing your filters</div>
//               </div></div>
//               : <>
//                 <div style={{ background: 'var(--surface)', border: '1px solid var(--gray-1)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
//                   <div style={{ display: 'grid', gridTemplateColumns: '190px 1fr 140px 100px 80px 80px', padding: '10px 16px', background: 'var(--primary-50)', borderBottom: '2px solid var(--primary-100)' }}>
//                     {/* {['Ticket No.', 'Subject', 'Requester', 'Priority', 'Days', 'Role'].map(h => ( */}
//                     {['Ticket No.', 'Subject', 'Requester', 'Category', 'Priority', 'Days', 'Role'].map(h => (
//                       <div key={h} style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary-800)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</div>
//                     ))}
//                   </div>
//                   {pendingPaged.map(a => (
//                     <div key={a.approvalId} onClick={() => openModal(a, 'pending')}
//                       style={{ display: 'grid', gridTemplateColumns: '190px 1fr 140px 100px 80px 80px', padding: '12px 16px', borderBottom: '1px solid var(--gray-1)', cursor: 'pointer', transition: 'background 0.12s' }}
//                       onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
//                       onMouseLeave={e => e.currentTarget.style.background = ''}>
//                       <div style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--primary-800)', fontWeight: 700 }}>
//                         {a.ticketNumber || `#${a.ticketId}`}
//                         <div style={{ fontSize: 11, color: 'var(--gray-4)', fontFamily: 'sans-serif', fontWeight: 400 }}>{formatDate(a.createdAt)}</div>
//                       </div>
//                       <div style={{ fontSize: 13, color: 'var(--gray-8)', alignSelf: 'center' }}>{a.ticketSubject || `Ticket #${a.ticketId}`}</div>
//                       {/* <div style={{ fontSize: 12, color: 'var(--gray-6)', alignSelf: 'center' }}>{a.requesterName || '—'}</div>
//                       <div style={{ fontSize: 12, color: 'var(--gray-6)', alignSelf: 'center' }}>{a.priority || '—'}</div> */}
//                       <div style={{ fontSize: 12, color: 'var(--gray-6)', alignSelf: 'center' }}>{a.requesterName || '—'}</div>
//                       <div style={{ fontSize: 12, color: 'var(--gray-6)', alignSelf: 'center' }}>{a.categoryName || '—'}</div>
//                       <div style={{ fontSize: 12, color: 'var(--gray-6)', alignSelf: 'center' }}>{a.priority || '—'}</div>
//                       <div style={{ fontSize: 12, alignSelf: 'center' }}>
//                         {(() => {
//                           const d = daysPending(a.createdAt);
//                           const color = d > 7 ? '#dc2626' : d > 3 ? '#d97706' : 'var(--gray-6)';
//                           return <span style={{ color, fontWeight: d > 3 ? 600 : 400 }}>{d}d</span>;
//                         })()}
//                       </div>
//                       <div style={{ alignSelf: 'center' }}><RoleBadge approval={a} approverId={approverId} /></div>
//                     </div>
//                   ))}
//                 </div>
//                 <Pagination page={pendingPage} total={filteredPending.length} pageSize={PAGE_SIZE} onChange={setPP} />
//               </>
//             }
//           </>
//       ))}

//       {/* ── HISTORY TAB ── */}
//       {tab === 'HISTORY' && (
//         histLoading ? <Spinner /> :
//           history.length === 0
//             ? <div className="card"><div className="empty-state">
//               <div className="empty-state__title">No history yet</div>
//               <div className="empty-state__sub">Approved and rejected tickets appear here</div>
//             </div></div>
//             : <>
//               <div style={{ background: 'var(--surface)', border: '1px solid var(--gray-1)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
//                 <div style={{ display: 'grid', gridTemplateColumns: '190px 80px 80px 1fr 160px', padding: '10px 14px', background: 'var(--primary-50)', borderBottom: '2px solid var(--primary-100)' }}>
//                   {['Ticket No.', 'L1', 'L2', 'Subject', 'Updated At'].map(h => (
//                     <div key={h} style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary-800)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</div>
//                   ))}
//                 </div>
//                 {histPaged.map((a, i) => (
//                   <div key={i} onClick={() => openModal(a, 'history')}
//                     style={{ display: 'grid', gridTemplateColumns: '190px 80px 80px 1fr 160px', padding: '11px 14px', borderBottom: '1px solid var(--gray-1)', cursor: 'pointer', transition: 'background 0.12s', alignItems: 'center' }}
//                     onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
//                     onMouseLeave={e => e.currentTarget.style.background = ''}>
//                     <div style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--primary-800)', fontWeight: 700 }}>{a.ticketNumber || `#${a.ticketId}`}</div>
//                     <div><Chip status={a.l1Status} /></div>
//                     <div><Chip status={a.l2Status || 'PENDING'} /></div>
//                     <div style={{ fontSize: 12, color: 'var(--gray-6)' }}>{a.ticketSubject || '—'}</div>
//                     <div style={{ fontSize: 12, color: 'var(--gray-5)' }}>{formatDate(a.updatedAt)}</div>
//                   </div>
//                 ))}
//               </div>
//               <Pagination page={historyPage} total={history.length} pageSize={PAGE_SIZE} onChange={setHP} />
//             </>
//       )}

//       {/* ── TICKET DETAIL MODAL ── */}
//       {modal && (
//         <BlurModal title={`Ticket ${modal.approval.ticketNumber || '#' + modal.approval.ticketId}`} onClose={closeModal}>
//           {modalLoading ? <Spinner /> : (
//             <>
//               {modal.mode === 'pending' && (
//                 <div style={{ marginBottom: 'var(--space-4)', display: 'flex', gap: 8, alignItems: 'center' }}>
//                   <RoleBadge approval={modal.approval} approverId={approverId} />
//                   <span style={{ fontSize: 12, color: 'var(--gray-5)' }}>
//                     {getApproverLevel(modal.approval) === 'L2'
//                       ? `L1 approved by ${modal.approval.l1ApproverName || '—'}`
//                       : 'Waiting for your L1 approval'}
//                   </span>
//                 </div>
//               )}
//               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
//                 <InfoField label="Subject" value={modal.ticket ? getVal(modal.ticket, 'subject') : (modal.approval.ticketSubject || '—')} />
//                 <InfoField label="Requested By" value={modal.ticket ? getVal(modal.ticket, 'requesterName', 'requestedByName') : (modal.approval.requesterName || '—')} />
//                 {modal.ticket && <>
//                   <InfoField label="Category" value={getVal(modal.ticket, 'category', 'categoryName')} />
//                   <InfoField label="Sub-Category" value={getVal(modal.ticket, 'subCategory', 'subCategoryName')} />
//                   <InfoField label="Item" value={getVal(modal.ticket, 'item', 'itemName')} />
//                   <InfoField label="Priority"
//                     value={typeof modal.ticket.priority === 'object'
//                       ? (modal.ticket.priority?.name || modal.ticket.priority?.priorityName || '—')
//                       : (modal.ticket.priority || modal.ticket.priorityName || '—')} />
//                   <InfoField label="Location" value={getVal(modal.ticket, 'location')} />
//                   <InfoField label="Mobile" value={getVal(modal.ticket, 'mobileNumber')} />
//                 </>}
//                 <InfoField label="L1 Approver" value={modal.approval.l1ApproverName || '—'} />
//                 <InfoField label="L2 Approver" value={modal.approval.l2ApproverName || '—'} />
//               </div>
//               {modal.ticket?.description && (
//                 <div style={{ padding: 'var(--space-3)', background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--gray-1)', marginBottom: 'var(--space-4)' }}>
//                   <div className="info-field__label" style={{ marginBottom: 4 }}>Description</div>
//                   <div style={{ fontSize: 13, lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: modal.ticket.description }} />
//                 </div>
//               )}
//               {modal.mode === 'pending' && (
//                 <div style={{ borderTop: '1px solid var(--gray-1)', paddingTop: 'var(--space-4)', marginTop: 'var(--space-2)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
//                   <Button variant="ghost" onClick={closeModal}>Cancel</Button>
//                   <button className="btn btn--sm btn--ghost" onClick={() => { setNeedInfoText(''); setOverlay('needinfo'); }}>Need Info</button>
//                   <button className="btn btn--sm btn--danger" onClick={() => { setRejectReason(''); setOverlay('reject'); }}>Reject</button>
//                   <button className="btn btn--sm btn--success" onClick={() => setOverlay('approve')}>Approve</button>
//                 </div>
//               )}
//               {modal.mode === 'history' && (
//                 <div style={{ borderTop: '1px solid var(--gray-1)', paddingTop: 'var(--space-3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                   <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
//                     <div><div className="info-field__label">L1</div><Chip status={modal.approval.l1Status} /></div>
//                     <div><div className="info-field__label">L2</div><Chip status={modal.approval.l2Status || 'PENDING'} /></div>
//                     {modal.approval.remarks && (
//                       <div><div className="info-field__label">Remarks</div><div style={{ fontSize: 13 }}>{modal.approval.remarks}</div></div>
//                     )}
//                   </div>
//                   <Button variant="ghost" onClick={closeModal}>Close</Button>
//                 </div>
//               )}
//             </>
//           )}
//         </BlurModal>
//       )}

//       {/* ── APPROVE OVERLAY ── */}
//       {overlay === 'approve' && (
//         <OverlayModal>
//           <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 10, color: '#1a1a2e' }}>Confirm Approval</div>
//           <div style={{ fontSize: 14, color: '#6B7280', marginBottom: 28 }}>Are you sure you want to <strong>approve</strong> this ticket?</div>
//           <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
//             <button className="btn btn--ghost btn--sm" onClick={closeOverlay} disabled={processing}>No, Cancel</button>
//             <Button variant="success" loading={processing} onClick={handleApproveConfirm}>Yes, Approve</Button>
//           </div>
//         </OverlayModal>
//       )}

//       {/* ── REJECT OVERLAY ── */}
//       {overlay === 'reject' && (
//         <OverlayModal>
//           <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 8, color: '#1a1a2e' }}>Confirm Rejection</div>
//           <div style={{ fontSize: 14, color: '#6B7280', marginBottom: 14 }}>Provide a reason — this is <strong>mandatory</strong>.</div>
//           <textarea className="form-control" value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Enter rejection reason..." style={{ minHeight: 90, marginBottom: 20, width: '100%', boxSizing: 'border-box' }} />
//           <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 20 }}>Are you sure you want to <strong>reject</strong> this ticket?</div>
//           <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
//             <button className="btn btn--ghost btn--sm" onClick={closeOverlay} disabled={processing}>No, Cancel</button>
//             <Button variant="danger" loading={processing} onClick={handleRejectConfirm}>Yes, Reject</Button>
//           </div>
//         </OverlayModal>
//       )}

//       {/* ── NEED INFO OVERLAY ── */}
//       {overlay === 'needinfo' && (
//         <OverlayModal>
//           <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 8, color: '#1a1a2e' }}>Request Additional Information</div>
//           <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 14 }}>Your message will be sent to the end user and visible in their My Tickets page. The ticket stays in your queue until you approve or reject it.</div>
//           <textarea className="form-control" value={needInfoText} onChange={e => setNeedInfoText(e.target.value)} placeholder="What information do you need from the user?" style={{ minHeight: 100, marginBottom: 20, width: '100%', boxSizing: 'border-box' }} />
//           <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
//             <button className="btn btn--ghost btn--sm" onClick={closeOverlay} disabled={processing}>Cancel</button>
//             <Button variant="primary" loading={processing} onClick={handleNeedInfoConfirm}>Send Message</Button>
//           </div>
//         </OverlayModal>
//       )}
//     </div>
//   );
// }


import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { formatDate, PAGE_SIZE } from '../../utils/helpers';
import { Chip, Spinner, Button, InfoField, Pagination } from '../../components/itsm/UI';
import { approvalApi, ticketApi } from '../../api/ourApi';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
 
/* ─────────────────────────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────────────────────────── */
const HIST_PAGE_SIZE = 10;
 
/* ─────────────────────────────────────────────────────────────────────────────
   ROLE BADGE  (L1 / L2 / L1+L2)
───────────────────────────────────────────────────────────────────────────── */
function RoleBadge({ approval, approverId }) {
  const id = String(approverId);
  const isL1 = String(approval.l1ApproverId) === id && approval.l1Status === 'PENDING';
  const isL2 = String(approval.l2ApproverId) === id
    && approval.l1Status === 'APPROVED'
    && approval.l2Status === 'PENDING';
  if (isL1 && isL2) return (
    <span style={{ fontSize: '0.65rem', fontWeight: 700, background: '#EDE9FE', color: '#5B21B6', borderRadius: 5, padding: '2px 7px', letterSpacing: '0.04em' }}>
      L1 + L2
    </span>
  );
  if (isL1) return (
    <span style={{ fontSize: '0.65rem', fontWeight: 700, background: '#DBEAFE', color: '#1D4ED8', borderRadius: 5, padding: '2px 7px', letterSpacing: '0.04em' }}>
      L1
    </span>
  );
  if (isL2) return (
    <span style={{ fontSize: '0.65rem', fontWeight: 700, background: '#D1FAE5', color: '#065F46', borderRadius: 5, padding: '2px 7px', letterSpacing: '0.04em' }}>
      L2
    </span>
  );
  return null;
}
 
/* ─────────────────────────────────────────────────────────────────────────────
   STATUS BADGE  (for history - richer than Chip)
───────────────────────────────────────────────────────────────────────────── */
function StatusBadge({ status }) {
  const map = {
    APPROVED:  { bg: '#D1FAE5', color: '#065F46', label: 'Approved' },
    REJECTED:  { bg: '#FEE2E2', color: '#991B1B', label: 'Rejected' },
    PENDING:   { bg: '#FEF3C7', color: '#92400E', label: 'Pending'  },
    NEED_INFO: { bg: '#EDE9FE', color: '#5B21B6', label: 'Info Req' },
    SKIPPED:   { bg: '#F3F4F6', color: '#6B7280', label: 'Skipped'  },
    NA:        { bg: '#F3F4F6', color: '#9CA3AF', label: 'N/A'      },
  };
  const s = map[status] || map.NA;
  return (
    <span style={{ fontSize: 11, fontWeight: 700, background: s.bg, color: s.color, borderRadius: 5, padding: '3px 8px', letterSpacing: '0.03em', whiteSpace: 'nowrap' }}>
      {s.label}
    </span>
  );
}
 
/* ─────────────────────────────────────────────────────────────────────────────
   PRIORITY BADGE
───────────────────────────────────────────────────────────────────────────── */
function PriorityBadge({ priority }) {
  if (!priority) return <span style={{ color: 'var(--gray-4)', fontSize: 12 }}>—</span>;
  const p = priority.toUpperCase();
  const map = {
    CRITICAL: { bg: '#FEE2E2', color: '#991B1B', dot: '#EF4444' },
    HIGH:     { bg: '#FEF3C7', color: '#92400E', dot: '#F59E0B' },
    MEDIUM:   { bg: '#E0F2FE', color: '#0369A1', dot: '#38BDF8' },
    LOW:      { bg: '#F0FDF4', color: '#166534', dot: '#4ADE80' },
  };
  const s = map[p] || { bg: '#F3F4F6', color: '#6B7280', dot: '#9CA3AF' };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, background: s.bg, color: s.color, borderRadius: 5, padding: '3px 8px' }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
      {priority}
    </span>
  );
}
 
/* ─────────────────────────────────────────────────────────────────────────────
   AGEING BADGE  (days pending)
───────────────────────────────────────────────────────────────────────────── */
function AgeingBadge({ createdAt }) {
  const days = createdAt
    ? Math.floor((Date.now() - new Date(createdAt).getTime()) / 86400000)
    : 0;
  if (days > 7)  return <span style={{ fontSize: 11, fontWeight: 700, background: '#FEE2E2', color: '#991B1B', borderRadius: 5, padding: '3px 7px' }}>{days}d ⚠</span>;
  if (days > 3)  return <span style={{ fontSize: 11, fontWeight: 700, background: '#FEF3C7', color: '#92400E', borderRadius: 5, padding: '3px 7px' }}>{days}d</span>;
  return <span style={{ fontSize: 12, color: 'var(--gray-5)' }}>{days}d</span>;
}
 
/* ─────────────────────────────────────────────────────────────────────────────
   BLUR MODAL
───────────────────────────────────────────────────────────────────────────── */
function BlurModal({ title, subtitle, children, onClose }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', background: 'rgba(0,0,0,0.35)' }} onClick={onClose}>
      <div style={{ background: 'var(--surface)', borderRadius: 14, boxShadow: '0 24px 60px rgba(0,0,0,0.25)', width: '92%', maxWidth: 720, maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '20px 24px 16px', borderBottom: '1px solid var(--gray-1)', position: 'sticky', top: 0, background: 'var(--surface)', zIndex: 1 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--primary-900)' }}>{title}</div>
            {subtitle && <div style={{ fontSize: 12, color: 'var(--gray-5)', marginTop: 2 }}>{subtitle}</div>}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: 'var(--gray-5)', lineHeight: 1, padding: '0 4px', marginTop: 2 }}>×</button>
        </div>
        <div style={{ padding: '20px 24px' }}>{children}</div>
      </div>
    </div>
  );
}
 
/* ─────────────────────────────────────────────────────────────────────────────
   OVERLAY MODAL  (confirm / reject / need-info)
───────────────────────────────────────────────────────────────────────────── */
function OverlayModal({ children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
      <div style={{ background: '#fff', borderRadius: 14, padding: '32px 28px', width: 460, maxWidth: '94vw', boxShadow: '0 24px 60px rgba(0,0,0,0.22)' }} onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
 
/* ─────────────────────────────────────────────────────────────────────────────
   FILTER SELECT
───────────────────────────────────────────────────────────────────────────── */
function FilterSelect({ value, onChange, placeholder, children, minWidth = 130 }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{ height: 34, padding: '0 10px', borderRadius: 7, border: '1.5px solid var(--gray-2)', fontSize: 12.5, background: value ? 'var(--primary-50)' : '#fff', color: 'var(--gray-8)', cursor: 'pointer', minWidth, fontWeight: value ? 600 : 400, outline: 'none' }}
    >
      <option value="">{placeholder}</option>
      {children}
    </select>
  );
}
 
/* ─────────────────────────────────────────────────────────────────────────────
   SECTION HEADER  (inside modal)
───────────────────────────────────────────────────────────────────────────── */
function SectionLabel({ children }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--primary-700)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, marginTop: 18, borderBottom: '1px solid var(--gray-1)', paddingBottom: 5 }}>
      {children}
    </div>
  );
}
 
/* ─────────────────────────────────────────────────────────────────────────────
   APPROVAL HISTORY TABLE  (extracted for clarity)
───────────────────────────────────────────────────────────────────────────── */
function HistoryTable({ history, approverId, onRowClick }) {
 
  /* ── filter state ── */
  const [filterDecision, setFilterDecision]   = useState('');
  const [filterLevel,    setFilterLevel]       = useState('');
  const [filterPriority, setFilterPriority]    = useState('');
  const [filterDateFrom, setFilterDateFrom]    = useState('');
  const [filterDateTo,   setFilterDateTo]      = useState('');
  const [search,         setSearch]            = useState('');
  const [sortField,      setSortField]         = useState('decidedAt');  // decidedAt | submittedAt | ticketNo
  const [sortDir,        setSortDir]           = useState('desc');
 
  /* ── pagination state ── */
  const [page, setPage] = useState(1);
 
  /* ── derived: build one row per decision this approver actually made ──
     A single approval record holds BOTH an l1Status and l2Status. If the
     same person is the approver for both stages on a ticket, that's two
     separate decisions and must become two separate rows — collapsing to
     "L2 only" was the bug that hid L1 history. */
  const enriched = useMemo(() => {
    const id = String(approverId);
    const rows = [];
    history.forEach(a => {
      const isL1Approver = String(a.l1ApproverId) === id;
      const isL2Approver = String(a.l2ApproverId) === id;
 
      if (isL1Approver && a.l1Status) {
        rows.push({
          ...a,
          _rowKey: `${a.approvalId}-L1`,
          myLevel: 'L1',
          myDecision: a.l1Status,
          decidedAt: a.l1UpdatedAt || a.l1DecidedAt || a.updatedAt || null,
        });
      }
      if (isL2Approver && a.l2Status) {
        rows.push({
          ...a,
          _rowKey: `${a.approvalId}-L2`,
          myLevel: 'L2',
          myDecision: a.l2Status,
          decidedAt: a.l2UpdatedAt || a.l2DecidedAt || a.updatedAt || null,
        });
      }
      // Fallback: neither id matched (e.g. backend already pre-filtered to
      // just this approver's stage) — show whatever status is present.
      if (!isL1Approver && !isL2Approver) {
        rows.push({
          ...a,
          _rowKey: `${a.approvalId}-NA`,
          myLevel: a.l2Status ? 'L2' : 'L1',
          myDecision: a.l1Status || a.l2Status || 'PENDING',
          decidedAt: a.updatedAt || null,
        });
      }
    });
    return rows;
  }, [history, approverId]);
 
  /* ── priority options derived from data ── */
  const priorityOptions = useMemo(() =>
    [...new Set(enriched.map(r => r.priority).filter(Boolean))], [enriched]);
 
  /* ── filtered + sorted ── */
  const filtered = useMemo(() => {
    let rows = [...enriched];
 
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter(r =>
        (r.ticketNumber || '').toLowerCase().includes(q) ||
        (r.ticketSubject || '').toLowerCase().includes(q) ||
        (r.requesterName || '').toLowerCase().includes(q) ||
        (r.categoryName  || '').toLowerCase().includes(q)
      );
    }
    if (filterDecision) rows = rows.filter(r => r.myDecision === filterDecision);
    if (filterLevel)    rows = rows.filter(r => r.myLevel    === filterLevel);
    if (filterPriority) rows = rows.filter(r => (r.priority || '').toLowerCase() === filterPriority.toLowerCase());
    if (filterDateFrom) {
      const from = new Date(filterDateFrom).getTime();
      rows = rows.filter(r => r.decidedAt && new Date(r.decidedAt).getTime() >= from);
    }
    if (filterDateTo) {
      const to = new Date(filterDateTo).getTime() + 86399999; // end of day
      rows = rows.filter(r => r.decidedAt && new Date(r.decidedAt).getTime() <= to);
    }
 
    rows.sort((a, b) => {
      let va, vb;
      if (sortField === 'decidedAt')   { va = new Date(a.decidedAt  || 0); vb = new Date(b.decidedAt  || 0); }
      if (sortField === 'submittedAt') { va = new Date(a.createdAt  || 0); vb = new Date(b.createdAt  || 0); }
      if (sortField === 'ticketNo')    { va = a.ticketNumber || '';        vb = b.ticketNumber || ''; }
      if (sortDir === 'asc') return va > vb ? 1 : va < vb ? -1 : 0;
      return va < vb ? 1 : va > vb ? -1 : 0;
    });
 
    return rows;
  }, [enriched, search, filterDecision, filterLevel, filterPriority, filterDateFrom, filterDateTo, sortField, sortDir]);
 
  const totalPages = Math.max(1, Math.ceil(filtered.length / HIST_PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const paged      = filtered.slice((safePage - 1) * HIST_PAGE_SIZE, safePage * HIST_PAGE_SIZE);
 
  const clearFilters = () => {
    setFilterDecision(''); setFilterLevel(''); setFilterPriority('');
    setFilterDateFrom(''); setFilterDateTo(''); setSearch(''); setPage(1);
  };
  const hasFilters = filterDecision || filterLevel || filterPriority || filterDateFrom || filterDateTo || search;
 
  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };
  const sortIcon = (field) => sortField === field ? (sortDir === 'asc' ? ' ↑' : ' ↓') : '';
 
  /* ── render ── */
  return (
    <div>
      {/* ── FILTER BAR ── */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 14, padding: '12px 14px', background: 'var(--surface-2)', borderRadius: 10, border: '1px solid var(--gray-1)' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 180, maxWidth: 280 }}>
          <span style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: 'var(--gray-4)', pointerEvents: 'none' }}>🔍</span>
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Ticket No., Subject, Requester…"
            style={{ width: '100%', height: 34, paddingLeft: 30, paddingRight: 10, borderRadius: 7, border: '1.5px solid var(--gray-2)', fontSize: 12.5, outline: 'none', boxSizing: 'border-box', background: search ? 'var(--primary-50)' : '#fff' }}
          />
        </div>
 
        <FilterSelect value={filterDecision} onChange={v => { setFilterDecision(v); setPage(1); }} placeholder="All Decisions">
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="NEED_INFO">Info Requested</option>
          <option value="PENDING">Pending</option>
        </FilterSelect>
 
        <FilterSelect value={filterLevel} onChange={v => { setFilterLevel(v); setPage(1); }} placeholder="All Levels" minWidth={110}>
          <option value="L1">L1 Approver</option>
          <option value="L2">L2 Approver</option>
        </FilterSelect>
 
        {priorityOptions.length > 0 && (
          <FilterSelect value={filterPriority} onChange={v => { setFilterPriority(v); setPage(1); }} placeholder="All Priorities" minWidth={120}>
            {priorityOptions.map(p => <option key={p} value={p}>{p}</option>)}
          </FilterSelect>
        )}
 
        {/* Date Range */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 11.5, color: 'var(--gray-5)', whiteSpace: 'nowrap' }}>Decided:</span>
          <input
            type="date"
            value={filterDateFrom}
            onChange={e => { setFilterDateFrom(e.target.value); setPage(1); }}
            style={{ height: 34, padding: '0 8px', borderRadius: 7, border: `1.5px solid ${filterDateFrom ? 'var(--primary-400)' : 'var(--gray-2)'}`, fontSize: 12, background: filterDateFrom ? 'var(--primary-50)' : '#fff', color: 'var(--gray-8)', outline: 'none' }}
          />
          <span style={{ fontSize: 11, color: 'var(--gray-4)' }}>–</span>
          <input
            type="date"
            value={filterDateTo}
            onChange={e => { setFilterDateTo(e.target.value); setPage(1); }}
            style={{ height: 34, padding: '0 8px', borderRadius: 7, border: `1.5px solid ${filterDateTo ? 'var(--primary-400)' : 'var(--gray-2)'}`, fontSize: 12, background: filterDateTo ? 'var(--primary-50)' : '#fff', color: 'var(--gray-8)', outline: 'none' }}
          />
        </div>
 
        {hasFilters && (
          <button onClick={clearFilters} style={{ height: 34, padding: '0 12px', borderRadius: 7, border: '1.5px solid #fca5a5', fontSize: 12, background: '#fff8f8', color: '#dc2626', cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap' }}>
            ✕ Clear Filters
          </button>
        )}
 
        <span style={{ fontSize: 12, color: 'var(--gray-5)', marginLeft: 'auto', whiteSpace: 'nowrap' }}>
          {filtered.length} of {history.length} record{history.length !== 1 ? 's' : ''}
        </span>
      </div>
 
      {filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state__title">No records match the selected filters</div>
            <div className="empty-state__sub">Try adjusting or clearing your filters</div>
          </div>
        </div>
      ) : (
        <>
          {/* ── TABLE ── */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--gray-1)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr 130px 95px 90px 90px 155px', padding: '10px 16px', background: 'var(--primary-50)', borderBottom: '2px solid var(--primary-100)', gap: 4 }}>
              {[
                { label: 'Ticket No.',    field: 'ticketNo'    },
                { label: 'Subject / Requester', field: null },
                { label: 'Category',      field: null          },
                { label: 'Priority',      field: null          },
                { label: 'Level',         field: 'level'       },
                { label: 'Decision',      field: null          },
                { label: 'Decided On',    field: 'decidedAt'   },
              ].map(({ label, field }) => (
                <div key={label}
                  onClick={() => field && toggleSort(field)}
                  style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary-800)', textTransform: 'uppercase', letterSpacing: 0.5, cursor: field ? 'pointer' : 'default', userSelect: 'none', display: 'flex', alignItems: 'center', gap: 2 }}>
                  {label}{field ? <span style={{ color: 'var(--primary-500)' }}>{sortIcon(field)}</span> : null}
                </div>
              ))}
            </div>
 
            {/* Rows */}
            {paged.map((a, i) => (
              <div key={a._rowKey || a.approvalId || i}
                onClick={() => onRowClick(a)}
                style={{ display: 'grid', gridTemplateColumns: '160px 1fr 130px 95px 90px 90px 155px', padding: '12px 16px', borderBottom: '1px solid var(--gray-1)', cursor: 'pointer', transition: 'background 0.1s', alignItems: 'center', gap: 4 }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                onMouseLeave={e => e.currentTarget.style.background = ''}>
 
                {/* Ticket No. */}
                <div>
                  <div style={{ fontSize: 12.5, fontFamily: 'monospace', color: 'var(--primary-800)', fontWeight: 700 }}>
                    {a.ticketNumber || `#${a.ticketId}`}
                  </div>
                  <div style={{ fontSize: 10.5, color: 'var(--gray-4)', marginTop: 2 }}>
                    Submitted {formatDate(a.createdAt)}
                  </div>
                </div>
 
                {/* Subject / Requester */}
                <div>
                  <div style={{ fontSize: 12.5, color: 'var(--gray-8)', fontWeight: 500, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {a.ticketSubject || `Ticket #${a.ticketId}`}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--gray-5)' }}>
                    👤 {a.requesterName || '—'}
                  </div>
                </div>
 
                {/* Category */}
                <div style={{ fontSize: 12, color: 'var(--gray-6)' }}>
                  {a.categoryName || a.category || '—'}
                </div>
 
                {/* Priority */}
                <div>
                  <PriorityBadge priority={a.priority} />
                </div>
 
                {/* Level */}
                <div>
                  <span style={{
                    fontSize: 11, fontWeight: 700,
                    background: a.myLevel === 'L2' ? '#D1FAE5' : '#DBEAFE',
                    color:      a.myLevel === 'L2' ? '#065F46' : '#1D4ED8',
                    borderRadius: 5, padding: '3px 8px'
                  }}>
                    {a.myLevel}
                  </span>
                </div>
 
                {/* Decision */}
                <div>
                  <StatusBadge status={a.myDecision} />
                </div>
 
                {/* Decided On */}
                <div style={{ fontSize: 11.5, color: 'var(--gray-5)' }}>
                  {a.decidedAt ? formatDate(a.decidedAt) : '—'}
                </div>
              </div>
            ))}
          </div>
 
          {/* ── PAGINATION ── */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, padding: '0 2px' }}>
            <span style={{ fontSize: 12, color: 'var(--gray-5)' }}>
              Showing {Math.min((safePage - 1) * HIST_PAGE_SIZE + 1, filtered.length)}–{Math.min(safePage * HIST_PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                onClick={() => setPage(1)} disabled={safePage === 1}
                style={{ height: 30, padding: '0 10px', borderRadius: 6, border: '1px solid var(--gray-2)', fontSize: 12, background: '#fff', cursor: safePage === 1 ? 'not-allowed' : 'pointer', color: safePage === 1 ? 'var(--gray-3)' : 'var(--gray-7)' }}>
                «
              </button>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1}
                style={{ height: 30, padding: '0 12px', borderRadius: 6, border: '1px solid var(--gray-2)', fontSize: 12, background: '#fff', cursor: safePage === 1 ? 'not-allowed' : 'pointer', color: safePage === 1 ? 'var(--gray-3)' : 'var(--gray-7)' }}>
                ‹ Prev
              </button>
 
              {/* Page number pills */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
                .reduce((acc, p, idx, arr) => {
                  if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, idx) =>
                  p === '...'
                    ? <span key={`ellipsis-${idx}`} style={{ fontSize: 12, color: 'var(--gray-4)', padding: '0 4px' }}>…</span>
                    : <button key={p} onClick={() => setPage(p)}
                        style={{ width: 30, height: 30, borderRadius: 6, border: '1px solid', borderColor: p === safePage ? 'var(--primary-700)' : 'var(--gray-2)', background: p === safePage ? 'var(--primary-800)' : '#fff', color: p === safePage ? '#fff' : 'var(--gray-7)', cursor: 'pointer', fontSize: 12, fontWeight: p === safePage ? 700 : 400 }}>
                        {p}
                      </button>
                )}
 
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}
                style={{ height: 30, padding: '0 12px', borderRadius: 6, border: '1px solid var(--gray-2)', fontSize: 12, background: '#fff', cursor: safePage === totalPages ? 'not-allowed' : 'pointer', color: safePage === totalPages ? 'var(--gray-3)' : 'var(--gray-7)' }}>
                Next ›
              </button>
              <button
                onClick={() => setPage(totalPages)} disabled={safePage === totalPages}
                style={{ height: 30, padding: '0 10px', borderRadius: 6, border: '1px solid var(--gray-2)', fontSize: 12, background: '#fff', cursor: safePage === totalPages ? 'not-allowed' : 'pointer', color: safePage === totalPages ? 'var(--gray-3)' : 'var(--gray-7)' }}>
                »
              </button>
            </div>
            <span style={{ fontSize: 12, color: 'var(--gray-4)' }}>Page {safePage} of {totalPages}</span>
          </div>
        </>
      )}
    </div>
  );
}
 
/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════════════ */
export default function ApprovalQueuePage({ showSnack, defaultTab = 'PENDING' }) {
  const { user } = useAuth();
  const approverId = user?.userId ? String(user.userId) : null;
 
  const [tab,        setTab]        = useState(defaultTab);
  const [pending,    setPending]    = useState([]);
  const [history,    setHistory]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [histLoading,setHistLoading]= useState(false);
  const [pendingPage, setPP]        = useState(1);
 
  /* ── ticket detail modal ── */
  const [modal,        setModal]       = useState(null);
  const [modalLoading, setModalLoading]= useState(false);
  const [processing,   setProcessing]  = useState(false);
 
  /* ── action overlays ── */
  const [overlay,      setOverlay]     = useState(null);
  const [rejectReason, setRejectReason]= useState('');
  const [needInfoText, setNeedInfoText]= useState('');
 
  /* ── pending queue filters ── */
  const [filterPriority, setFilterPriority] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterLevel,    setFilterLevel]    = useState('');
  const [filterDays,     setFilterDays]     = useState('');
  const [sortOldest,     setSortOldest]     = useState(false);
  const [pendingSearch,  setPendingSearch]  = useState('');
 
  useEffect(() => { setTab(defaultTab); }, [defaultTab]);
 
  /* ── data loaders ── */
  const load = useCallback(() => {
    setLoading(true);
    approvalApi.getPendingForApprover(approverId)
      .then(async (d) => {
        const list = (Array.isArray(d) ? d : []).sort((a, b) =>
          new Date(b.createdAt) - new Date(a.createdAt));
        const enriched = await Promise.all(list.map(async (a) => {
          try {
            const t = await ticketApi.getById(a.ticketId);
            return {
              ...a,
              priority: typeof t.priority === 'object'
                ? (t.priority?.priorityName || t.priority?.name || '')
                : (t.priority || t.priorityName || ''),
              categoryName: t.category || t.categoryName || '',
            };
          } catch { return a; }
        }));
        setPending(enriched);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [approverId]);
 
  const loadHistory = useCallback(() => {
    setHistLoading(true);
    approvalApi.getHistoryForApprover(approverId)
      .then(async (d) => {
        const list = Array.isArray(d) ? d : [];
        // Enrich each record with priority + category from the ticket —
        // the approval record itself doesn't carry these fields.
        const enriched = await Promise.all(list.map(async (a) => {
          try {
            const t = await ticketApi.getById(a.ticketId);
            return {
              ...a,
              priority: typeof t.priority === 'object'
                ? (t.priority?.priorityName || t.priority?.name || '')
                : (t.priority || t.priorityName || ''),
              categoryName: t.category || t.categoryName || '',
            };
          } catch { return a; }
        }));
        setHistory(enriched);
      })
      .catch(() => {})
      .finally(() => setHistLoading(false));
  }, [approverId]);
 
  useEffect(() => { load(); loadHistory(); }, [load, loadHistory]);
 
  /* ── approver level helper ── */
  const getApproverLevel = (approval) => {
    if (!approval || !approverId) return 'L1';
    const isL2 = String(approval.l2ApproverId) === approverId
      && approval.l1Status === 'APPROVED'
      && approval.l2Status === 'PENDING';
    return isL2 ? 'L2' : 'L1';
  };
 
  /* ── modal open/close ── */
  const openModal = async (a, mode) => {
    setModal({ approval: a, ticket: null, mode });
    setOverlay(null);
    setModalLoading(true);
    try {
      const t = await ticketApi.getById(a.ticketId);
      setModal(prev => ({ ...prev, ticket: t }));
    } catch {
      setModal(prev => ({ ...prev, ticket: null }));
    } finally { setModalLoading(false); }
  };
 
  const closeModal   = () => { setModal(null); setOverlay(null); };
  const closeOverlay = () => setOverlay(null);
 
  /* ── action handlers ── */
  const handleApproveConfirm = async () => {
    setProcessing(true);
    try {
      const level = getApproverLevel(modal.approval);
      await approvalApi.processAction({ ticketId: modal.approval.ticketId, approverLevel: level, action: 'APPROVED', remarks: '' });
      setPending(prev => prev.filter(a => a.ticketId !== modal.approval.ticketId));
      closeModal(); loadHistory();
      toast.success(`Ticket ${level} Approved`);
    } catch (e) { toast.error(e?.response?.data?.message || 'Approval failed'); }
    finally { setProcessing(false); }
  };
 
  const handleRejectConfirm = async () => {
    if (!rejectReason.trim()) { toast.error('Rejection reason is mandatory'); return; }
    setProcessing(true);
    try {
      const level = getApproverLevel(modal.approval);
      await approvalApi.processAction({ ticketId: modal.approval.ticketId, approverLevel: level, action: 'REJECTED', remarks: rejectReason });
      setPending(prev => prev.filter(a => a.ticketId !== modal.approval.ticketId));
      closeModal(); loadHistory();
      toast.error(`Ticket ${level} Rejected`);
    } catch (e) { toast.error(e?.response?.data?.message || 'Rejection failed'); }
    finally { setProcessing(false); }
  };
 
  const handleNeedInfoConfirm = async () => {
    if (!needInfoText.trim()) { toast.error('Please enter your message'); return; }
    setProcessing(true);
    try {
      const level = getApproverLevel(modal.approval);
      await approvalApi.processAction({ ticketId: modal.approval.ticketId, approverLevel: level, action: 'NEED_INFO', remarks: needInfoText });
      toast.success('Message sent to end user');
      closeOverlay();
    } catch (e) { toast.error(e?.response?.data?.message || 'Failed to send message'); }
    finally { setProcessing(false); }
  };
 
  const getVal = (t, ...keys) => {
    for (const k of keys) { if (t && k in t && t[k] !== null && t[k] !== '') return t[k]; }
    return '—';
  };
 
  /* ── pending queue filter logic ── */
  const daysPending = (createdAt) =>
    createdAt ? Math.floor((Date.now() - new Date(createdAt).getTime()) / 86400000) : 0;
 
  const pendingCategories = useMemo(() => [...new Set(pending.map(a => a.categoryName || a.category).filter(Boolean))], [pending]);
  const pendingPriorities = useMemo(() => [...new Set(pending.map(a => a.priority).filter(Boolean))], [pending]);
 
  const filteredPending = useMemo(() => {
    let rows = [...pending];
    if (pendingSearch.trim()) {
      const q = pendingSearch.trim().toLowerCase();
      rows = rows.filter(r =>
        (r.ticketNumber || '').toLowerCase().includes(q) ||
        (r.ticketSubject || '').toLowerCase().includes(q) ||
        (r.requesterName || '').toLowerCase().includes(q)
      );
    }
    if (filterPriority) rows = rows.filter(a => (a.priority || '').toLowerCase() === filterPriority.toLowerCase());
    if (filterCategory) rows = rows.filter(a => (a.categoryName || a.category || '').toLowerCase() === filterCategory.toLowerCase());
    if (filterLevel) {
      rows = rows.filter(a => {
        const id = String(approverId);
        const isL1Act = String(a.l1ApproverId) === id && a.l1Status === 'PENDING';
        const isL2Act = String(a.l2ApproverId) === id && a.l1Status === 'APPROVED' && a.l2Status === 'PENDING';
        if (filterLevel === 'L1') return isL1Act && !isL2Act;
        if (filterLevel === 'L2') return isL2Act;
        return true;
      });
    }
    if (filterDays) {
      rows = rows.filter(a => {
        const d = daysPending(a.createdAt);
        if (filterDays === '1')   return d <= 1;
        if (filterDays === '3')   return d <= 3;
        if (filterDays === '7')   return d <= 7;
        if (filterDays === '7+')  return d > 7;
        return true;
      });
    }
    rows.sort((a, b) => sortOldest
      ? new Date(a.createdAt) - new Date(b.createdAt)
      : new Date(b.createdAt) - new Date(a.createdAt));
    return rows;
  }, [pending, pendingSearch, filterPriority, filterCategory, filterLevel, filterDays, sortOldest, approverId]);
 
  const clearPendingFilters = () => {
    setFilterPriority(''); setFilterCategory(''); setFilterLevel('');
    setFilterDays(''); setPendingSearch(''); setPP(1);
  };
  const hasPendingFilters = filterPriority || filterCategory || filterLevel || filterDays || pendingSearch;
 
  const pendingPaged = filteredPending.slice((pendingPage - 1) * PAGE_SIZE, pendingPage * PAGE_SIZE);
 
  /* ─────────────────────────────────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────────────────────────────────── */
  return (
    <div>
      {/* ── PAGE HEADER ── */}
      <div className="page-header">
        <div className="page-header__title">
          {tab === 'PENDING' ? 'Approval Queue' : 'Approval History'}
        </div>
        <div className="page-header__sub">
          {tab === 'PENDING'
            ? `${pending.length} ticket${pending.length !== 1 ? 's' : ''} awaiting your decision`
            : `${history.length} decision${history.length !== 1 ? 's' : ''} recorded`}
        </div>
      </div>
 
      {/* ── TAB SWITCHER ── */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 18, borderBottom: '2px solid var(--gray-1)' }}>
        {[
          { key: 'PENDING', label: `Pending${pending.length ? ` (${pending.length})` : ''}` },
          { key: 'HISTORY', label: `History${history.length ? ` (${history.length})` : ''}` },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key)}
            style={{ padding: '10px 22px', fontSize: 13.5, fontWeight: 600, border: 'none', background: 'none', cursor: 'pointer', color: tab === key ? 'var(--primary-700)' : 'var(--gray-5)', borderBottom: tab === key ? '2px solid var(--primary-700)' : '2px solid transparent', marginBottom: -2, transition: 'color 0.15s' }}>
            {label}
          </button>
        ))}
      </div>
 
      {/* ══════════════════════════════════════════════════════════════════
          PENDING TAB
      ══════════════════════════════════════════════════════════════════ */}
      {tab === 'PENDING' && (
        loading ? <Spinner /> : (
          pending.length === 0
            ? (
              <div className="card">
                <div className="empty-state">
                  <div className="empty-state__title">Your approval queue is empty</div>
                  <div className="empty-state__sub">Tickets assigned to you for L1 or L2 approval will appear here</div>
                </div>
              </div>
            )
            : (
              <>
                {/* Filter Bar */}
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 14, padding: '10px 14px', background: 'var(--surface-2)', borderRadius: 10, border: '1px solid var(--gray-1)' }}>
                  {/* Search */}
                  <div style={{ position: 'relative', flex: '1 1 180px', minWidth: 160, maxWidth: 260 }}>
                    <span style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: 'var(--gray-4)', pointerEvents: 'none' }}></span>
                    <input
                      type="text" value={pendingSearch}
                      onChange={e => { setPendingSearch(e.target.value); setPP(1); }}
                      placeholder="Search tickets…"
                      style={{ width: '100%', height: 34, paddingLeft: 28, paddingRight: 10, borderRadius: 7, border: '1.5px solid var(--gray-2)', fontSize: 12.5, outline: 'none', boxSizing: 'border-box', background: pendingSearch ? 'var(--primary-50)' : '#fff' }}
                    />
                  </div>
 
                  <FilterSelect value={filterPriority} onChange={v => { setFilterPriority(v); setPP(1); }} placeholder="All Priorities" minWidth={120}>
                    {pendingPriorities.map(p => <option key={p} value={p}>{p}</option>)}
                  </FilterSelect>
 
                  <FilterSelect value={filterCategory} onChange={v => { setFilterCategory(v); setPP(1); }} placeholder="All Categories">
                    {pendingCategories.map(c => <option key={c} value={c}>{c}</option>)}
                  </FilterSelect>
 
                  <FilterSelect value={filterLevel} onChange={v => { setFilterLevel(v); setPP(1); }} placeholder="All Levels" minWidth={110}>
                    <option value="L1">L1 Only</option>
                    <option value="L2">L2 Only</option>
                  </FilterSelect>
 
                  <FilterSelect value={filterDays} onChange={v => { setFilterDays(v); setPP(1); }} placeholder="All Days" minWidth={130}>
                    <option value="1">Today (≤ 1 day)</option>
                    <option value="3">≤ 3 days</option>
                    <option value="7">≤ 7 days</option>
                    <option value="7+">Overdue (&gt; 7 days)</option>
                  </FilterSelect>
 
                  <button
                    onClick={() => { setSortOldest(s => !s); setPP(1); }}
                    style={{ height: 34, padding: '0 12px', borderRadius: 7, border: '1.5px solid var(--gray-2)', fontSize: 12, background: sortOldest ? '#27235C' : '#fff', color: sortOldest ? '#fff' : 'var(--gray-7)', cursor: 'pointer', fontWeight: sortOldest ? 600 : 400 }}>
                    {sortOldest ? '↑ Oldest First' : '↓ Newest First'}
                  </button>
 
                  {hasPendingFilters && (
                    <button onClick={clearPendingFilters} style={{ height: 34, padding: '0 12px', borderRadius: 7, border: '1.5px solid #fca5a5', fontSize: 12, background: '#fff8f8', color: '#dc2626', cursor: 'pointer', fontWeight: 600 }}>
                      ✕ Clear
                    </button>
                  )}
 
                  <span style={{ fontSize: 12, color: 'var(--gray-5)', marginLeft: 'auto', whiteSpace: 'nowrap' }}>
                    {filteredPending.length} of {pending.length} ticket{pending.length !== 1 ? 's' : ''}
                  </span>
                </div>
 
                {filteredPending.length === 0 ? (
                  <div className="card">
                    <div className="empty-state">
                      <div className="empty-state__title">No tickets match the selected filters</div>
                      <div className="empty-state__sub">Try adjusting or clearing your filters</div>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Table */}
                    <div style={{ background: 'var(--surface)', border: '1px solid var(--gray-1)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '170px 1fr 130px 110px 90px 70px 60px', padding: '10px 16px', background: 'var(--primary-50)', borderBottom: '2px solid var(--primary-100)', gap: 4 }}>
                        {['Ticket No.', 'Subject', 'Requester', 'Category', 'Priority', 'Days', 'Role'].map(h => (
                          <div key={h} style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary-800)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</div>
                        ))}
                      </div>
                      {pendingPaged.map(a => (
                        <div key={a.approvalId}
                          onClick={() => openModal(a, 'pending')}
                          style={{ display: 'grid', gridTemplateColumns: '170px 1fr 130px 110px 90px 70px 60px', padding: '13px 16px', borderBottom: '1px solid var(--gray-1)', cursor: 'pointer', transition: 'background 0.1s', alignItems: 'center', gap: 4 }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                          onMouseLeave={e => e.currentTarget.style.background = ''}>
                          {/* Ticket No. */}
                          <div>
                            <div style={{ fontSize: 12.5, fontFamily: 'monospace', color: 'var(--primary-800)', fontWeight: 700 }}>
                              {a.ticketNumber || `#${a.ticketId}`}
                            </div>
                            <div style={{ fontSize: 10.5, color: 'var(--gray-4)', marginTop: 2 }}>
                              {formatDate(a.createdAt)}
                            </div>
                          </div>
                          {/* Subject */}
                          <div style={{ fontSize: 13, color: 'var(--gray-8)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {a.ticketSubject || `Ticket #${a.ticketId}`}
                          </div>
                          {/* Requester */}
                          <div style={{ fontSize: 12, color: 'var(--gray-6)' }}>{a.requesterName || '—'}</div>
                          {/* Category */}
                          <div style={{ fontSize: 12, color: 'var(--gray-6)' }}>{a.categoryName || '—'}</div>
                          {/* Priority */}
                          <div><PriorityBadge priority={a.priority} /></div>
                          {/* Age */}
                          <div><AgeingBadge createdAt={a.createdAt} /></div>
                          {/* Role */}
                          <div><RoleBadge approval={a} approverId={approverId} /></div>
                        </div>
                      ))}
                    </div>
 
                    {/* Pagination */}
                    <Pagination
                      page={pendingPage}
                      total={filteredPending.length}
                      pageSize={PAGE_SIZE}
                      onChange={setPP}
                    />
                  </>
                )}
              </>
            )
        )
      )}
 
      {/* ══════════════════════════════════════════════════════════════════
          HISTORY TAB
      ══════════════════════════════════════════════════════════════════ */}
      {tab === 'HISTORY' && (
        histLoading ? <Spinner /> : (
          history.length === 0
            ? (
              <div className="card">
                <div className="empty-state">
                  <div className="empty-state__title">No approval history yet</div>
                  <div className="empty-state__sub">Approved, rejected, or info-requested tickets will appear here</div>
                </div>
              </div>
            )
            : <HistoryTable history={history} approverId={approverId} onRowClick={a => openModal(a, 'history')} />
        )
      )}
 
      {/* ══════════════════════════════════════════════════════════════════
          TICKET DETAIL MODAL
      ══════════════════════════════════════════════════════════════════ */}
      {modal && (
        <BlurModal
          title={`Ticket ${modal.approval.ticketNumber || '#' + modal.approval.ticketId}`}
          subtitle={modal.approval.ticketSubject || null}
          onClose={closeModal}
        >
          {modalLoading ? <Spinner /> : (
            <>
              {/* Approval status banner */}
              {/* {modal.mode === 'pending' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, padding: '10px 14px', background: '#FFFBEB', borderRadius: 8, border: '1px solid #FDE68A' }}>
                  <RoleBadge approval={modal.approval} approverId={approverId} />
                  <span style={{ fontSize: 12, color: '#78350F' }}>
                    {getApproverLevel(modal.approval) === 'L2'
                      ? `L1 already approved by ${modal.approval.l1ApproverName || '—'}. Awaiting your L2 decision.`
                      : 'Awaiting your L1 approval decision.'}
                  </span>
                </div>
              )} */}
 
              {/* {modal.mode === 'history' && (
                <div style={{ display: 'flex', gap: 16, marginBottom: 16, padding: '10px 14px', background: 'var(--surface-2)', borderRadius: 8, border: '1px solid var(--gray-1)' }}>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--gray-5)', textTransform: 'uppercase', marginBottom: 4 }}>L1 Decision</div>
                    <StatusBadge status={modal.approval.l1Status} />
                    {modal.approval.l1ApproverName && (
                      <div style={{ fontSize: 11, color: 'var(--gray-5)', marginTop: 3 }}>by {modal.approval.l1ApproverName}</div>
                    )}
                  </div>
                  <div style={{ borderLeft: '1px solid var(--gray-2)', paddingLeft: 16 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--gray-5)', textTransform: 'uppercase', marginBottom: 4 }}>L2 Decision</div>
                    <StatusBadge status={modal.approval.l2Status || 'PENDING'} />
                    {modal.approval.l2ApproverName && (
                      <div style={{ fontSize: 11, color: 'var(--gray-5)', marginTop: 3 }}>by {modal.approval.l2ApproverName}</div>
                    )}
                  </div>
                  {modal.approval.remarks && (
                    <div style={{ borderLeft: '1px solid var(--gray-2)', paddingLeft: 16, flex: 1 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--gray-5)', textTransform: 'uppercase', marginBottom: 4 }}>Remarks</div>
                      <div style={{ fontSize: 12.5, color: 'var(--gray-7)', lineHeight: 1.5 }}>{modal.approval.remarks}</div>
                    </div>
                  )}
                </div>
              )}
  */}
              {/* Ticket Info */}
              <SectionLabel>Ticket Details</SectionLabel>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
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
              </div>
 
              {/* <SectionLabel>Approval Chain</SectionLabel>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                <InfoField label="L1 Approver" value={modal.approval.l1ApproverName || '—'} />
                <InfoField label="L2 Approver" value={modal.approval.l2ApproverName || '—'} />
              </div> */}
 
              {modal.ticket?.description && (
                <>
                  <SectionLabel>Description</SectionLabel>
                  <div style={{ padding: 'var(--space-3)', background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--gray-1)', marginBottom: 'var(--space-4)' }}>
                    <div style={{ fontSize: 13, lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: modal.ticket.description }} />
                  </div>
                </>
              )}
 
              {/* Action buttons */}
              {modal.mode === 'pending' && (
                <div style={{ borderTop: '1px solid var(--gray-1)', paddingTop: 'var(--space-4)', marginTop: 'var(--space-2)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                  {/* <Button variant="ghost" onClick={closeModal}>Cancel</Button> */}
                  <button className="btn btn--sm btn--ghost" onClick={() => { setNeedInfoText(''); setOverlay('needinfo'); }}>Need Info</button>
                  <button className="btn btn--sm btn--danger" onClick={() => { setRejectReason(''); setOverlay('reject'); }}>Reject</button>
                  <button className="btn btn--sm btn--success" onClick={() => setOverlay('approve')}>Approve</button>
                </div>
              )}
              {modal.mode === 'history' && (
                <div style={{ borderTop: '1px solid var(--gray-1)', paddingTop: 'var(--space-3)', display: 'flex', justifyContent: 'flex-end' }}>
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
            Are you sure you want to <strong>approve</strong> ticket <strong>{modal?.approval?.ticketNumber || '#' + modal?.approval?.ticketId}</strong>?
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
          <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 8, color: '#1a1a2e' }}>Reject Ticket</div>
          <div style={{ fontSize: 14, color: '#6B7280', marginBottom: 14 }}>
            Provide a rejection reason — this is <strong>mandatory</strong> and will be visible to the requester.
          </div>
          <textarea className="form-control" value={rejectReason}
            onChange={e => setRejectReason(e.target.value)}
            placeholder="Enter rejection reason…"
            style={{ minHeight: 90, marginBottom: 20, width: '100%', boxSizing: 'border-box' }} />
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
            Your message will be sent to the end user. The ticket stays in your queue until you approve or reject it.
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
import React, { useState, useRef, useEffect } from 'react';
import { incidentApi } from '../../api';
import { Button } from '../../components/itsm/UI';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { userApi } from '../../api/userApi';
import { getAllLocations } from '../../api/LocationApi';
import toast from 'react-hot-toast';
import {
    Dialog, DialogTitle, DialogContent,
    Stack, Box, Typography, IconButton, CircularProgress
} from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
 
/* ── Inline styles ───────────────────────────────────────────────────────── */
const styles = `
  .ci-form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0 var(--space-5, 24px);
    align-items: start;
  }
  .ci-form-grid .span-full {
    grid-column: 1 / -1;
  }
  .ci-form-group {
    display: flex;
    flex-direction: column;
    gap: 2px;
    margin-bottom: 8px;
  }
  .ci-form-group label,
  .ci-form-group .ci-form-label {
    font-size: 12px;
    font-weight: 600;
    color: var(--gray-7, #374151);
    letter-spacing: 0.01em;
  }
  .ci-form-control {
    width: 100%;
    box-sizing: border-box;
    height: 32px;
    padding: 0 10px;
    border: 1.5px solid var(--gray-3, #d1d5db);
    border-radius: 5px;
    font-size: 12px;
    color: var(--gray-8, #1f2937);
    background: #fff;
    transition: border-color 0.15s, box-shadow 0.15s;
    outline: none;
  }
  .ci-form-control:focus {
    border-color: #27235C;
    box-shadow: 0 0 0 3px rgba(39,35,92,0.10);
  }
  .ci-form-control.error {
    border-color: #dc2626;
    background: #fff8f8;
  }
  .ci-form-control.error:focus {
    box-shadow: 0 0 0 3px rgba(220,38,38,0.10);
  }
  .ci-readonly-field {
    height: 32px;
    padding: 0 10px;
    border: 1.5px solid var(--gray-2, #e5e7eb);
    border-radius: 5px;
    font-size: 12px;
    color: var(--gray-6, #4b5563);
    background: var(--gray-1, #f9fafb);
    display: flex;
    align-items: center;
    box-sizing: border-box;
  }
  .ci-form-error {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    color: #dc2626;
    font-weight: 500;
    min-height: 14px;
    animation: ci-shake 0.25s ease;
  }
  .ci-form-error::before {
    content: '⚠';
    font-size: 10px;
  }
  .ci-section-title {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #27235C;
    border-bottom: 2px solid #ede9fe;
    padding-bottom: 4px;
    margin: 10px 0 8px;
    grid-column: 1 / -1;
  }
  @keyframes ci-shake {
    0%,100% { transform: translateX(0); }
    25%      { transform: translateX(-3px); }
    75%      { transform: translateX(3px); }
  }
  select.ci-form-control { cursor: pointer; }
  .ci-required { color: #dc2626; margin-left: 2px; }
  .ci-section-title-block {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #27235C;
    border-bottom: 2px solid #ede9fe;
    padding-bottom: 4px;
    margin: 10px 0 8px;
    display: block;
    width: 100%;
    text-align: left;
  }
`;
 
/* ── StyleInjector ───────────────────────────────────────────────────────── */
function StyleInjector() {
    useEffect(() => {
        const el = document.createElement('style');
        el.id = 'ci-styles';
        if (!document.getElementById('ci-styles')) document.head.appendChild(el);
        el.textContent = styles;
        return () => { if (el.parentNode) el.parentNode.removeChild(el); };
    }, []);
    return null;
}
 
/* ── Field wrapper ───────────────────────────────────────────────────────── */
function Field({ label, required, error, children, className = '' }) {
    return (
        <div className={`ci-form-group ${className}`}>
            {label && (
                <label className="ci-form-label">
                    {label}{required && <span className="ci-required">*</span>}
                </label>
            )}
            {children}
            {error && <div className="ci-form-error">{error}</div>}
        </div>
    );
}
 
/* ── Rich Text Editor ────────────────────────────────────────────────────── */
function RTE({ value, onChange, error, placeholder }) {
    const ref = useRef(null);
    const initialized = useRef(false);
 
    useEffect(() => {
        if (ref.current && !initialized.current) {
            ref.current.innerHTML = value || '';
            initialized.current = true;
        }
        // eslint-disable-next-line
    }, []);
 
    const exec = (cmd, val) => {
        ref.current?.focus();
        document.execCommand(cmd, false, val ?? null);
        onChange(ref.current?.innerHTML || '');
    };
 
    return (
        <div style={{ overflow: 'auto', width: '100%', height: '110px' }}>
            <div className={`rte-wrapper${error ? ' error' : ''}`}>
                <div className="rte-toolbar">
                    {[['B', 'bold', 'bold'], ['I', 'italic', 'italic'], ['U', 'underline', 'underline']].map(([l, c, cls]) => (
                        <button key={c} type="button" className={`rte-btn ${cls}`}
                            onMouseDown={e => { e.preventDefault(); exec(c); }}>{l}</button>
                    ))}
                    <div className="rte-divider" />
                    <button type="button" className="rte-btn"
                        onMouseDown={e => { e.preventDefault(); exec('insertUnorderedList'); }}>Bullet List</button>
                    <button type="button" className="rte-btn"
                        onMouseDown={e => { e.preventDefault(); exec('insertOrderedList'); }}>Numbered List</button>
                    <button type="button" className="rte-btn link"
                        onMouseDown={e => { e.preventDefault(); const u = window.prompt('Enter URL:'); if (u) exec('createLink', u); }}>Link</button>
                    <div className="rte-divider" />
                    <button type="button" className="rte-btn"
                        style={{ color: 'var(--gray-5)', fontSize: 11 }}
                        onMouseDown={e => { e.preventDefault(); exec('removeFormat'); }}>Clear</button>
                </div>
                <div
                    ref={ref}
                    className="rte-body"
                    style={{ overflow: 'auto', minHeight: 75 }}
                    contentEditable
                    suppressContentEditableWarning
                    data-placeholder={placeholder || 'Describe the incident in detail...'}
                    onInput={() => onChange(ref.current?.innerHTML || '')}
                />
            </div>
            {error && <div className="ci-form-error">{error}</div>}
        </div>
    );
}
 
/* ── File Uploader ───────────────────────────────────────────────────────── */
function Uploader({ value, onChange }) {
    const [err, setErr] = useState('');
    const [drag, setDrag] = useState(false);
    const ref = useRef(null);
    const EXTS = ['.jpg', '.jpeg', '.png', '.pdf', '.docx'];
    const MAX = 30 * 1024 * 1024;
 
    const handle = (file) => {
        if (!file) return;
        const ext = '.' + file.name.split('.').pop().toLowerCase();
        if (!EXTS.includes(ext)) { setErr(`Invalid: ${EXTS.join(', ')}`); return; }
        if (file.size > MAX) { setErr('Max 30 MB'); return; }
        setErr('');
        onChange({ name: file.name, size: file.size, type: file.type, raw: file });
    };
 
    return (
        <div className="ci-form-group span-full">
            <label className="ci-form-label">Attachments</label>
            <div
                className={`file-uploader${drag ? ' dragging' : ''}`}
                onClick={() => ref.current?.click()}
                onDragOver={e => { e.preventDefault(); setDrag(true); }}
                onDragLeave={() => setDrag(false)}
                onDrop={e => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files[0]); }}
            >
                <input ref={ref} type="file" accept={EXTS.join(',')}
                    style={{ display: 'none' }} onChange={e => handle(e.target.files[0])} />
                <div className="file-uploader__icon">+</div>
                {value
                    ? <>
                        <div className="file-uploader__selected">{value.name}</div>
                        <div className="file-uploader__sub">{(value.size / 1024 / 1024).toFixed(2)} MB</div>
                    </>
                    : <>
                        <div className="file-uploader__text">Drop file here or click to browse</div>
                        <div className="file-uploader__sub">Allowed: {EXTS.join(', ')} — Max 30 MB</div>
                    </>}
            </div>
            {err && <div className="ci-form-error">{err}</div>}
        </div>
    );
}
 
/* ── Attachment Viewer Modal (same as CreateTicketPage) ──────────────────── */
function AttachmentViewerModal({ attachment, onClose }) {
    const [objectUrl, setObjectUrl] = useState(null);
 
    useEffect(() => {
        if (!attachment?.raw) { setObjectUrl(null); return; }
        const url = URL.createObjectURL(attachment.raw);
        setObjectUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [attachment]);
 
    const handleDownload = () => {
        if (!objectUrl) return;
        const link = document.createElement('a');
        link.href = objectUrl;
        link.download = attachment.name || 'attachment';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
 
    const isImage = attachment?.type?.startsWith('image/');
    const isPdf = attachment?.type === 'application/pdf';
 
    return (
        <Dialog
            open={!!attachment}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 24px 64px rgba(0,0,0,0.22)',
                    border: '1px solid #E5E7EB',
                    height: '90vh',
                    display: 'flex',
                    flexDirection: 'column',
                },
            }}
        >
            <DialogTitle sx={{ p: 0 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between"
                    sx={{ px: 3, py: 2, borderBottom: '1px solid #F3F4F6', backgroundColor: '#FAFAFA' }}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box sx={{ width: 36, height: 36, borderRadius: '10px', backgroundColor: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <AttachFileIcon sx={{ fontSize: 18, color: '#4F46E5' }} />
                        </Box>
                        <Box>
                            <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#111827', maxWidth: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {attachment?.name || 'Attachment'}
                            </Typography>
                            <Typography sx={{ fontSize: '0.72rem', color: '#9CA3AF', mt: 0.2 }}>
                                {attachment?.type || 'Unknown type'}
                            </Typography>
                        </Box>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <IconButton
                            onClick={handleDownload}
                            size="small"
                            sx={{ color: '#374151', border: '1px solid #E5E7EB', borderRadius: '8px', p: '5px 10px', fontSize: '0.78rem', '&:hover': { borderColor: '#27235C', color: '#27235C', backgroundColor: '#F5F5FF' } }}
                        >
                            <DownloadIcon fontSize="small" sx={{ mr: 0.5 }} /> Download
                        </IconButton>
                        <IconButton onClick={onClose} size="small" sx={{ color: '#9CA3AF', '&:hover': { backgroundColor: '#F3F4F6' } }}>
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </Stack>
                </Stack>
            </DialogTitle>
 
            <DialogContent sx={{ flex: 1, p: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F1F5F9', overflow: 'hidden' }}>
                {!objectUrl ? (
                    <CircularProgress size={36} sx={{ color: '#27235C' }} />
                ) : isImage ? (
                    <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3, overflow: 'auto' }}>
                        <img
                            src={objectUrl}
                            alt={attachment?.name}
                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 8, boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}
                        />
                    </Box>
                ) : isPdf ? (
                    <iframe
                        src={objectUrl}
                        title={attachment?.name}
                        style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                    />
                ) : (
                    <Stack alignItems="center" spacing={2.5}>
                        <Box sx={{ width: 72, height: 72, borderRadius: '20px', backgroundColor: '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <AttachFileIcon sx={{ fontSize: 34, color: '#9CA3AF' }} />
                        </Box>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography sx={{ fontWeight: 700, color: '#374151', mb: 0.5 }}>Preview not available</Typography>
                            <Typography sx={{ fontSize: '0.83rem', color: '#9CA3AF' }}>This file type cannot be previewed. Download it to view.</Typography>
                        </Box>
                        <IconButton
                            onClick={handleDownload}
                            sx={{ backgroundColor: '#27235C', color: '#fff', borderRadius: '10px', px: 3, py: 1, '&:hover': { backgroundColor: '#1B193F' } }}
                        >
                            <DownloadIcon sx={{ mr: 0.5 }} /> Download File
                        </IconButton>
                    </Stack>
                )}
            </DialogContent>
        </Dialog>
    );
}
 
/* ── Main Page ───────────────────────────────────────────────────────────── */
export default function CreateIncidentPage({ onSuccess, showSnack, onBack }) {
    const { user } = useAuth();
    const { state } = useLocation();
    const { category, subcategory } = state || {};
 
    const location = useLocation();
    const navigate = useNavigate();
 
    const [currentUser, setCurrentUser] = useState(null);
 
    useEffect(() => {
        userApi.getUserById(user.userId)
            .then(res => setCurrentUser(res.data))
            .catch(() => { });
    }, [user.userId]);
 
    const [locations, setLocations] = useState([]);
 
    useEffect(() => {
        getAllLocations()
            .then(res => {
                const arr = Array.isArray(res?.data) ? res.data
                    : Array.isArray(res) ? res : [];
                setLocations(arr);
            })
            .catch(() => {
                setLocations([
                    { id: 1, locationName: 'Bangalore' },
                    { id: 2, locationName: 'Chennai' },
                    { id: 3, locationName: 'Mumbai' },
                    { id: 4, locationName: 'Delhi' },
                    { id: 5, locationName: 'Hyderabad' },
                    { id: 6, locationName: 'Pune' },
                    { id: 7, locationName: 'Kolkata' },
                    { id: 8, locationName: 'Noida' },
                    { id: 9, locationName: 'Gurgaon' },
                ]);
            });
    }, []);
 
    const [allUsers, setAllUsers] = useState([]);
 
    useEffect(() => {
        userApi.getAllUsers()
            .then(res => {
                const arr = res.data?.content || res.data || [];
                setAllUsers(Array.isArray(arr) ? arr : []);
            })
            .catch(() => setAllUsers([]));
    }, []);
 
    const userName = currentUser?.fullName ||
        [currentUser?.firstName, currentUser?.lastName].filter(Boolean).join(' ') || '';
    const userEmail = currentUser?.email || '';
 
    const autoSubject = [category?.name, subcategory?.name, userName]
        .filter(Boolean).join(' | ');
 
    const [form, setForm] = useState({
        description: '',
        priority: '',
        source: '',
        occurredAt: '',
        breachByUser: '',
        incidentLocation: '',
        officeLocation: '',
    });
 
    const [attachment, setAttachment] = useState(null);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [previewAttachment, setPreviewAttachment] = useState(null);
 
    const set = (k, v) => {
        setForm(f => ({ ...f, [k]: v }));
        setErrors(e => { const n = { ...e }; delete n[k]; return n; });
    };
 
    const validate = () => {
        const e = {};
        if (!form.description.trim() || form.description === '<br>')
            e.description = 'Description is required';
        if (!form.priority)
            e.priority = 'Priority is required';
        if (!form.source)
            e.source = 'Source is required';
        return e;
    };
 
    const handleSubmit = async () => {
        const e = validate();
        if (Object.keys(e).length) { setErrors(e); return; }
        setLoading(true);
        try {
            const ticketJson = {
                userId: currentUser?.id,
                requesterName: userName,
                email: userEmail,
                categoryId: category?.categoryId ?? category?.id,
                categoryName: category?.name,
                subCategoryId: subcategory?.subcategoryId ?? subcategory?.id,
                subCategoryName: subcategory?.name,
                subject: autoSubject,
                description: form.description,
                priority: form.priority,
                source: form.source,
                breachByUser: form.breachByUser || null,
                occurredAt: form.occurredAt || null,
                incidentLocation: form.incidentLocation || null,
                officeLocation: form.officeLocation || null,
            };
 
            const formData = new FormData();
            formData.append('data', new Blob([JSON.stringify(ticketJson)], {
                type: 'application/json',
            }));
            if (attachment?.raw) {
                formData.append('file', attachment.raw);
            }
 
            let path = location.pathname;
            navigate(path.substring(0, path.indexOf('service')) + '/tickets');
 
            const result = await incidentApi.createIncident(formData);
            toast.success('Incident reported successfully!');
            if (typeof onSuccess === 'function') onSuccess(result);
        } catch (err) {
            console.error(err);
            const msg = err?.response?.data?.message || err.message || 'Failed to submit incident';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };
 
    /* ── Preview Modal ──────────────────────────────────────────────────── */
    const PreviewModal = () => {
        const previewFields = [
            { label: 'Category', value: category?.name },
            { label: 'Sub Category', value: subcategory?.name },
            { label: 'Requester Name', value: userName },
            { label: 'Employee ID', value: currentUser?.employeeId },
            { label: 'Email', value: userEmail },
            { label: 'Mode', value: 'Web Form' },
            { label: 'Subject', value: autoSubject },
            { label: 'Description', value: form.description, isHtml: true },
            { label: 'Priority', value: form.priority },
            { label: 'Source', value: form.source },
            { label: 'Occurred At', value: form.occurredAt },
            { label: 'Breach By User', value: form.breachByUser },
            { label: 'Incident Location', value: form.incidentLocation },
            { label: 'Office Location', value: form.officeLocation },
        ];
 
        const hasErrors = !form.description || form.description === '<br>' || !form.priority || !form.source;
 
        return (
            <div style={{
                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
                zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                <div style={{
                    background: '#fff', borderRadius: 10, width: '90%', maxWidth: 680,
                    maxHeight: '85vh', overflow: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                }}>
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1.5px solid #ede9fe' }}>
                        <span style={{ fontWeight: 700, fontSize: 14, color: '#27235C' }}>Incident Preview</span>
                        <button onClick={() => setShowPreview(false)} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#6b7280' }}>✕</button>
                    </div>
 
                    {/* Warning */}
                    {hasErrors && (
                        <div style={{ margin: '12px 20px 0', padding: '8px 12px', background: '#fff8f8', border: '1px solid #fca5a5', borderRadius: 6, fontSize: 12, color: '#dc2626' }}>
                            ⚠ Some mandatory fields are missing. Please fill them before submitting.
                        </div>
                    )}
 
                    {/* Fields */}
                    <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 24px' }}>
                        {previewFields.map(({ label, value, isHtml }) => {
                            const isEmpty = !value || (typeof value === 'string' && value.replace(/<[^>]+>/g, '').trim() === '');
                            return (
                                <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <span style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
                                    <div style={{ fontSize: 12, color: isEmpty ? '#dc2626' : '#1f2937', padding: '5px 8px', borderRadius: 5, minHeight: 28, background: isEmpty ? '#fff8f8' : '#f9fafb', border: `1.5px solid ${isEmpty ? '#fca5a5' : '#e5e7eb'}` }}>
                                        {isEmpty
                                            ? <em style={{ color: '#9ca3af' }}>— Not provided —</em>
                                            : isHtml
                                                ? <span dangerouslySetInnerHTML={{ __html: value }} />
                                                : value}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
 
                    {/* Attachment row — clickable to open viewer */}
                    {attachment && (
                        <div style={{ padding: '0 20px 12px' }}>
                            <span style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Attachment</span>
                            <div
                                onClick={() => setPreviewAttachment(attachment)}
                                style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: '#f9fafb', border: '1.5px solid #e5e7eb', borderRadius: 6, cursor: 'pointer' }}
                            >
                                <span style={{ fontSize: 18 }}>📎</span>
                                <div>
                                    <div style={{ fontSize: 12, fontWeight: 600, color: '#4F46E5' }}>{attachment.name}</div>
                                    <div style={{ fontSize: 11, color: '#6b7280' }}>{(attachment.size / 1024 / 1024).toFixed(2)} MB — click to preview</div>
                                </div>
                            </div>
                        </div>
                    )}
 
                    {/* Footer */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '12px 20px', borderTop: '1.5px solid #ede9fe' }}>
                        <Button variant="ghost" onClick={() => setShowPreview(false)}>Edit</Button>
                        <Button variant="primary" onClick={() => { setShowPreview(false); handleSubmit(); }} loading={loading}>
                            Submit Incident
                        </Button>
                    </div>
                </div>
            </div>
        );
    };
 
    return (
        <>
            <StyleInjector />
 
            {/* Preview modal */}
            {showPreview && <PreviewModal />}
 
            {/* Attachment viewer — opens on top of preview modal */}
            {previewAttachment && (
                <AttachmentViewerModal
                    attachment={previewAttachment}
                    onClose={() => setPreviewAttachment(null)}
                />
            )}
 
            {/* ── Page Header ── */}
            <div className="page-header" style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="page-header__breadcrumb" style={{ display: 'block', textAlign: 'left', width: '100%', justifyContent: 'flex-start' }}>
                    <span onClick={onBack} style={{ cursor: 'pointer' }}>Service Catalog</span>
                    <span className="sep"> › </span>
                    <span>{category?.name}</span>
                    <span className="sep"> › </span>
                    <span>{subcategory?.name}</span>
                    <span className="sep"> › </span>
                    <span>Report Incident</span>
                </div>
                <div className="page-header__title" style={{ textAlign: 'left', width: '100%' }}>
                    {category?.name} — {subcategory?.name}
                </div>
            </div>
 
            {/* ── Form Card ── */}
            <div className="card">
 
                {/* Category */}
                <div className="ci-section-title-block">Category</div>
                <div className="ci-form-grid">
                    <Field label="Category" required>
                        <div className="ci-readonly-field">{category?.name || '—'}</div>
                    </Field>
                    <Field label="Sub Category" required>
                        <div className="ci-readonly-field">{subcategory?.name || '—'}</div>
                    </Field>
                </div>
 
                {/* Requester Details */}
                <div className="ci-section-title-block">Requester Details</div>
                <div className="ci-form-grid">
                    <Field label="Requester Name" required>
                        <div className="ci-readonly-field">{userName || '—'}</div>
                    </Field>
                    <Field label="Employee ID">
                        <div className="ci-readonly-field">{currentUser?.employeeId || '—'}</div>
                    </Field>
                    <Field label="Email">
                        <div className="ci-readonly-field">{userEmail || '—'}</div>
                    </Field>
                    <Field label="Mode" required>
                        <div className="ci-readonly-field" style={{ color: 'var(--gray-5)', fontSize: 12 }}>
                            Web Form
                        </div>
                    </Field>
                </div>
 
                {/* Incident Details */}
                <div className="ci-section-title-block">Incident Details</div>
 
                <Field label="Subject" required>
                    <div className="ci-readonly-field" style={{ color: 'var(--gray-7)' }}>
                        {autoSubject || 'Auto-generated'}
                    </div>
                </Field>
 
                <Field label="Description" required error={errors.description}>
                    <RTE
                        value={form.description}
                        onChange={v => set('description', v)}
                        error={errors.description}
                        placeholder="Describe the incident — what happened, impact, steps to reproduce..."
                    />
                </Field>
 
                <div className="ci-form-grid">
                    <Field label="Priority" required error={errors.priority}>
                        <select
                            className={`ci-form-control${errors.priority ? ' error' : ''}`}
                            value={form.priority}
                            onChange={e => set('priority', e.target.value)}
                        >
                            <option value="" disabled>— Select Priority —</option>
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                        </select>
                    </Field>
                    <Field label="Source" required error={errors.source}>
                        <select
                            className={`ci-form-control${errors.source ? ' error' : ''}`}
                            value={form.source}
                            onChange={e => set('source', e.target.value)}
                        >
                            <option value="" disabled>— Select Source —</option>
                            <option value="Internal">Internal</option>
                            <option value="External">External</option>
                        </select>
                    </Field>
                </div>
 
                {/* Additional Info */}
                <div className="ci-section-title-block">Additional Info</div>
                <div className="ci-form-grid">
                    <Field label="Occurred At (Date & Time)">
                        <input
                            type="datetime-local"
                            className="ci-form-control"
                            value={form.occurredAt}
                            onChange={e => set('occurredAt', e.target.value)}
                        />
                    </Field>
                    <Field label="Breach By User">
                        <select
                            className="ci-form-control"
                            value={form.breachByUser}
                            onChange={e => set('breachByUser', e.target.value)}
                        >
                            <option value="">— Select User —</option>
                            {allUsers.length === 0 ? (
                                <option disabled>Loading users...</option>
                            ) : (
                                allUsers.map(u => {
                                    const fullName = u.fullName ||
                                        [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email || '';
                                    const id = u.id || u.userId || u.employeeId || fullName;
                                    return (
                                        <option key={id} value={fullName}>
                                            {fullName}{u.employeeId ? ` (${u.employeeId})` : ''}
                                        </option>
                                    );
                                })
                            )}
                        </select>
                    </Field>
                    <Field label="Incident Location">
                        <input
                            className="ci-form-control"
                            value={form.incidentLocation}
                            onChange={e => set('incidentLocation', e.target.value)}
                            placeholder="e.g. Floor 3, Server Room"
                        />
                    </Field>
                    <Field label="Office Location">
                        <select
                            className="ci-form-control"
                            value={form.officeLocation}
                            onChange={e => set('officeLocation', e.target.value)}
                        >
                            <option value="">— Select Location —</option>
                            {locations.length === 0 ? (
                                <option disabled>Loading locations...</option>
                            ) : (
                                locations.map(l => {
                                    const name = l.locationName || l.name || l;
                                    const id = l.id || name;
                                    return <option key={id} value={name}>{name}</option>;
                                })
                            )}
                        </select>
                    </Field>
                </div>
 
                {/* Attachment */}
                <div className="ci-form-grid">
                    <Uploader value={attachment} onChange={setAttachment} />
                </div>
 
                {/* Actions */}
                <div className="divider" style={{ margin: '8px 0' }} />
                <div className="flex-end flex-gap-3">
                    <Button variant="ghost" onClick={onBack} disabled={loading}>Cancel</Button>
                    <Button variant="secondary" onClick={() => setShowPreview(true)}>Preview</Button>
                    <Button variant="primary" onClick={handleSubmit} loading={loading} disabled={loading}>
                        Submit Incident
                    </Button>
                </div>
 
            </div>
        </>
    );
}
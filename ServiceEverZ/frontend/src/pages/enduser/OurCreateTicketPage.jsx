
import React, { useState, useEffect, useRef } from 'react';
import { masterApi, ticketApi } from '../../api/ourApi';
import { rmoApi } from '../../api/rmoApi';
import { buildSubject, validateMobile } from '../../utils/helpers';
import { userApi } from '../../api/userApi';
import { Button, Spinner } from '../../components/itsm/UI';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getItemsBySubcategory } from '../../api/serviceCatalogApi';
import { getAllLocations } from '../../api/LocationApi';
import { getMappingsByUser } from '../../api/assetApi';
import toast from 'react-hot-toast';
import {
    Dialog, DialogTitle, DialogContent,
    Stack, Box, Typography, IconButton, CircularProgress
} from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
// US-149
import { useDraftGuard, persistDraftToStorage, clearDraftFromStorage } from '../../components/hooks/useDraftGuard';
import DraftNavigationModal from '../../components/itsm/DraftNavigationModal';

/* ── Inline styles ─────────────────────────────────────────────── */
const styles = `
  .ct-form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0 var(--space-5, 24px);
    align-items: start;
  }
  .ct-form-grid.three-col {
    grid-template-columns: 1fr 1fr 1fr;
  }
  .ct-form-grid .span-full {
    grid-column: 1 / -1;
  }
  .ct-form-group {
    display: flex;
    flex-direction: column;
    gap: 2px;
    margin-bottom: 8px;
  }
  .ct-form-group label,
  .ct-form-group .ct-form-label {
    font-size: 12px;
    font-weight: 600;
    color: var(--gray-7, #374151);
    letter-spacing: 0.01em;
  }
  .ct-form-control {
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
  .ct-form-control:focus {
    border-color: #27235C;
    box-shadow: 0 0 0 3px rgba(39,35,92,0.10);
  }
  .ct-form-control.error {
    border-color: #dc2626;
    background: #fff8f8;
  }
  .ct-form-control.error:focus {
    box-shadow: 0 0 0 3px rgba(220,38,38,0.10);
  }
  .ct-readonly-field {
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
  .ct-form-error {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    color: #dc2626;
    font-weight: 500;
    min-height: 14px;
    animation: ct-shake 0.25s ease;
  }
  .ct-form-error::before {
    content: '⚠';
    font-size: 10px;
  }
  .ct-section-title {
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
  @keyframes ct-shake {
    0%,100% { transform: translateX(0); }
    25% { transform: translateX(-3px); }
    75% { transform: translateX(3px); }
  }
  select.ct-form-control { cursor: pointer; }
  .ct-required { color: #dc2626; margin-left: 2px; }
  .ct-card-compact { padding: 12px 16px !important; }
`;

function StyleInjector() {
    useEffect(() => {
        const el = document.createElement('style');
        el.id = 'ct-styles';
        if (!document.getElementById('ct-styles')) document.head.appendChild(el);
        el.textContent = styles;
        return () => { if (el.parentNode) el.parentNode.removeChild(el); };
    }, []);
    return null;
}

function Field({ label, required, error, children, className = '' }) {
    return (
        <div className={`ct-form-group ${className}`}>
            {label && (
                <label className="ct-form-label">
                    {label}{required && <span className="ct-required">*</span>}
                </label>
            )}
            {children}
            {error && <div className="ct-form-error">{error}</div>}
        </div>
    );
}

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
                        <button key={c} type="button" className={`rte-btn ${cls}`} onMouseDown={e => { e.preventDefault(); exec(c); }}>{l}</button>
                    ))}
                    <div className="rte-divider" />
                    <button type="button" className="rte-btn" onMouseDown={e => { e.preventDefault(); exec('insertUnorderedList'); }}>Bullet List</button>
                    <button type="button" className="rte-btn" onMouseDown={e => { e.preventDefault(); exec('insertOrderedList'); }}>Numbered List</button>
                    <button type="button" className="rte-btn link" onMouseDown={e => { e.preventDefault(); const u = window.prompt('Enter URL:'); if (u) exec('createLink', u); }}>Link</button>
                    <div className="rte-divider" />
                    <button type="button" className="rte-btn" style={{ color: 'var(--gray-5)', fontSize: 11 }} onMouseDown={e => { e.preventDefault(); exec('removeFormat'); }}>Clear</button>
                </div>
                <div ref={ref} className="rte-body" style={{ overflow: 'auto', minHeight: 75 }} contentEditable suppressContentEditableWarning
                    data-placeholder={placeholder || 'Describe your request in detail...'}
                    onInput={() => onChange(ref.current?.innerHTML || '')} />
            </div>
            {error && <div className="ct-form-error">{error}</div>}
        </div>
    );
}

function Uploader({ value, onChange }) {
    const [err, setErr] = useState(''); const [drag, setDrag] = useState(false); const ref = useRef(null);
    const EXTS = ['.jpg', '.jpeg', '.png', '.pdf', '.docx']; const MAX = 30 * 1024 * 1024;

    const handle = (file) => {
        if (!file) return;
        const ext = '.' + file.name.split('.').pop().toLowerCase();
        if (!EXTS.includes(ext)) { setErr(`Invalid: ${EXTS.join(', ')}`); return; }
        if (file.size > MAX) { setErr('Max 30 MB'); return; }
        setErr('');
        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result.split(',')[1];
            onChange({ name: file.name, size: file.size, type: file.type, base64 });
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="ct-form-group span-full"><label className="ct-form-label">Attachments</label>
            <div className={`file-uploader${drag ? ' dragging' : ''}`} onClick={() => ref.current?.click()}
                onDragOver={e => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
                onDrop={e => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files[0]); }}>
                <input ref={ref} type="file" accept={EXTS.join(',')} style={{ display: 'none' }} onChange={e => handle(e.target.files[0])} />
                <div className="file-uploader__icon">+</div>
                {value
                    ? <><div className="file-uploader__selected">{value.name}</div><div className="file-uploader__sub">{(value.size / 1024 / 1024).toFixed(2)} MB</div></>
                    : <><div className="file-uploader__text">Drop file here or click to browse</div><div className="file-uploader__sub">Allowed: {EXTS.join(', ')} — Max 30 MB</div></>}
            </div>
            {err && <div className="ct-form-error">{err}</div>}
        </div>
    );
}

function AttachmentViewerModal({ attachment, onClose }) {
    const [objectUrl, setObjectUrl] = useState(null);

    useEffect(() => {
        if (!attachment?.base64) { setObjectUrl(null); return; }
        const byteChars = atob(attachment.base64);
        const byteArray = new Uint8Array(byteChars.length);
        for (let j = 0; j < byteChars.length; j++) byteArray[j] = byteChars.charCodeAt(j);
        const blob = new Blob([byteArray], { type: attachment.type || 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
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

// US-149: restoredForm prop added
export default function CreateTicketPage({ preSelected, onSuccess, showSnack, onBack, draftTicket, overrideUser, restoredForm }) {

    const isDraft = !!draftTicket;
    const navigate = useNavigate();
    let { user } = useAuth();
    const { state } = useLocation();
    const { serviceType, category, subcategory } = state || {};

    // US-149: draft guard hook
    const { markDirty, markClean, showModal, confirmNavigation, cancelNavigation } = useDraftGuard();
    const [draftModalSaving, setDraftModalSaving] = useState(false);

    const [currentUser, setCurrentUser] = useState();

    useEffect(() => {
        if (overrideUser) {
            setCurrentUser(overrideUser);
            return;
        }
        userApi.getUserById(user.userId)
            .then(res => setCurrentUser(res.data))
            .catch(() => { });
    }, [overrideUser]);

    const [items, setItems] = useState([]);
    const [selectedItemObj, setSelectedItemObj] = useState(null);
    const [selectedItem, setSelectedItem] = useState('');

    useEffect(() => {
        if (!subcategory) navigate('/catalog');
    }, [subcategory, navigate]);

    useEffect(() => {
        if (!subcategory) return;
        getItemsBySubcategory(subcategory.id)
            .then(({ data }) => {
                const mapped = (Array.isArray(data) ? data : []).map(i => ({
                    value: i.id,
                    label: i.name,
                    name: i.name,
                    accessDateRequired: i.accessDateRequired === true,
                }));
                setItems(mapped);
                setSelectedItemObj(null);
                console.log(mapped);
            })
            .catch(() => toast.error('Failed to load items'));
    }, [subcategory]);

    const safeSnack = (msg, type) => {
        if (typeof showSnack === 'function') {
            showSnack(msg, type);
        } else {
            type === 'error' ? toast.error(msg) : toast.success(msg);
        }
    };

    const safeSuccess = (data) => {
        if (typeof onSuccess === 'function') {
            onSuccess(data);
        } else {
            console.log('Success:', data);
            navigate('/user/tickets');
        }
    };

    const draftSubcatId =
        draftTicket?.subCategoryId ||
        draftTicket?.subcategoryId ||
        draftTicket?.id ||
        draftTicket?.sub_category_id ||
        null;

    const userName = currentUser?.fullName || [currentUser?.firstName, currentUser?.lastName].filter(Boolean).join(' ') || '';
    const subject = buildSubject(category?.name, subcategory?.name, userName);

    const [disable, setDisable] = useState(false);

    const mode = [
        { name: "Web Form", id: 1, value: 'WEB_FORM' },
        { name: "Call", id: 2, value: 'CALL' },
        { name: "Chat", id: 3, value: 'CHAT' }
    ];

    const [users, setUsers] = useState([]);

    useEffect(() => {
        if (user.roles[0] == 'SUPPORT_PERSONNEL') {
            setDisable(true);
        }
        try {
            let loadUsers = async () => {
                let res = await userApi.getAllUsers();
                console.log(res);
                setUsers(res.data.content);
            };
            loadUsers();
        } catch (error) {
            setUsers([]);
            console.log(error);
        }
    }, []);

    // const [form, setForm] = useState({
    //     item: null, location: null, asset: null, priority: null, mode: null,
    //     mobile: '', description: isDraft ? (draftTicket.description || '') : '',
    //     attachment: null, accessTill: '',
    //     projectId: isDraft && draftTicket.projectId ? String(draftTicket.projectId) : '',
    // });
    const [form, setForm] = useState(() => {
        if (isDraft && draftTicket) {
            return {
                item: draftTicket.itemId ? String(draftTicket.itemId) : null,
                location: draftTicket.location
                    ? { value: draftTicket.location, label: draftTicket.location }
                    : null,
                asset: null,
                priority: null,   // resolved after priorities load
                mode: null,
                mobile: draftTicket.mobileNumber || '',
                description: draftTicket.description || '',
                attachment: null,
                accessTill: '',
                projectId: draftTicket.projectId ? String(draftTicket.projectId) : '',
            };
        }
        return {
            item: null, location: null, asset: null, priority: null, mode: null,
            mobile: '', description: '', attachment: null, accessTill: '', projectId: '',
        };
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [priorities, setPriorities] = useState([]);
    const [projects, setProjects] = useState([]);
    const [itemsLoading, setItemsLoading] = useState(false);
    const [customItemDesc, setCustomItemDesc] = useState('');
    const [showPreview, setShowPreview] = useState(false);
    const [previewAttachment, setPreviewAttachment] = useState(null);

    // US-149: set() marks form as dirty and persists to localStorage on every change
    const set = (k, v) => {
        setForm(f => {
            const next = { ...f, [k.trim()]: v };
            persistDraftToStorage({ form: next, category, subcategory, serviceType, customItemDesc });
            return next;
        });
        markDirty();
        setErrors(e => { const n = { ...e }; delete n[k.trim()]; return n; });
    };

    const showAccess = selectedItemObj?.accessDateRequired === true;
    const isOthersItem = form.item?.label?.toLowerCase() === 'others';

    useEffect(() => {
        try {
            let loadProjects = async () => {
                let res = await rmoApi.getProjectsByUserId(currentUser.id);
                setProjects(res.data);
            };
            loadProjects();
        } catch (error) {
            console.log(error);
        }
    }, [currentUser]);

    useEffect(() => {
        masterApi.getPriorities()
            .then(data => {
                const list = Array.isArray(data) ? data : [];
                const mapped = list.map(p => ({
                    priorityId: p.priorityId || p.id,
                    priorityName: (p.priorityName || p.name || '').toUpperCase()
                })).filter(p => p.priorityId && p.priorityName);
                setPriorities(mapped);
                if (!isDraft) {
                    const medium = mapped.find(p => p.priorityName.toUpperCase() === 'MEDIUM');
                    if (medium) {
                        set('priority', { value: medium.priorityId, label: medium.priorityName });
                    }
                }
            })
            .catch(err => {
                console.error('Priority API failed — using fallback:', err);
                const fallback = [
                    { priorityId: 1, priorityName: 'HIGH' },
                    { priorityId: 2, priorityName: 'MEDIUM' },
                    { priorityId: 3, priorityName: 'LOW' },
                ];
                setPriorities(fallback);
                if (!isDraft) {
                    set('priority', { value: 2, label: 'MEDIUM' });
                }
            });
    }, []);

    useEffect(() => {
        if (!currentUser?.id) return;
        if (currentUser?.preloadedAsset) {
            set('asset', currentUser.preloadedAsset);
            return;
        }
        import('../../api/assetApi').then(({ getAssetsByUser }) => {
            getAssetsByUser(currentUser.id)
                .then(res => {
                    const arr = Array.isArray(res?.data?.data) ? res.data.data
                        : Array.isArray(res?.data) ? res.data
                            : Array.isArray(res) ? res
                                : [];
                    const laptops = arr.filter(a =>
                        a.category === 'LAPTOP' || a.category?.toUpperCase() === 'LAPTOP'
                    );
                    const laptop = laptops.find(a =>
                        a.status === 'IN_USE' || a.status === 'ACTIVE' || a.status === 'AVAILABLE'
                    ) || laptops[0];
                    if (laptop) {
                        set('asset', {
                            value: laptop.id || laptop.assetId,
                            label: `${laptop.name || laptop.assetName || 'Laptop'} (${laptop.assetTag || laptop.serialNumber || ''})`,
                        });
                    } else {
                        set('asset', null);
                    }
                })
                .catch(() => { set('asset', null); });
        });
    }, [currentUser?.id]);

    useEffect(() => {
        if (!isDraft || !draftTicket?.ticketId) return;
        ticketApi.getAttachments(draftTicket.ticketId)
            .then(attachments => {
                const list = Array.isArray(attachments) ? attachments : [];
                if (list.length > 0) {
                    const a = list[0];
                    set('attachment', {
                        name: a.filename,
                        size: a.fileSizeBytes || 0,
                        type: a.mimeType || '',
                        base64: a.file,
                    });
                }
            })
            .catch(err => console.warn('Could not load draft attachment:', err));
        // eslint-disable-next-line
    }, [isDraft, draftTicket?.ticketId]);

    // US-149: restore form from localStorage (browser crash / refresh scenario)
    useEffect(() => {
        if (!restoredForm || isDraft) return;
        if (restoredForm.projectId) set('projectId', restoredForm.projectId);
        if (restoredForm.mobile) set('mobile', restoredForm.mobile);
        if (restoredForm.description) set('description', restoredForm.description);
        if (restoredForm.accessTill) set('accessTill', restoredForm.accessTill);
        if (restoredForm.location) set('location', restoredForm.location);
        if (restoredForm.mode) set('mode', restoredForm.mode);
        if (restoredForm.priority && priorities.length) {
            const found = priorities.find(p => String(p.priorityId) === String(restoredForm.priority?.value));
            if (found) set('priority', { value: found.priorityId, label: found.priorityName });
        }
        if (restoredForm.item && items.length) {
            set('item', restoredForm.item);
            const found = items.find(i => String(i.value) === String(restoredForm.item));
            if (found) setSelectedItemObj(found);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [restoredForm, priorities.length, items.length]);

    const validateDraft = () => {
        if (!form.projectId) {
            setErrors({ projectId: 'Please select a project to save as draft' });
            safeSnack('Please select a project to save as draft', 'error');
            return false;
        }
        setErrors({});
        return true;
    };

    const validateSubmit = () => {
        const e = {};
        if (!form.projectId) e.projectId = 'Please select a project title';
        if (!form.item) e.item = 'Item is required';
        if (isOthersItem && !customItemDesc.trim()) e.item = 'Please describe your item requirement';
        if (!form.location) e.location = 'Location is required';
        if (!form.priority) e.priority = 'Priority is required';
        if (!form.description || form.description.replace(/<[^>]+>/g, '').trim() === '') e.description = 'Description is required';
        const mErr = validateMobile(form.mobile);
        if (mErr) e.mobile = mErr;
        if (showAccess && !form.accessTill) e.accessTill = 'Access Required Till is required for this item';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const buildPayload = () => {
        const payload = {
            requestedById: currentUser?.id || user?.userId || null,
            requestedByName: userName || user?.fullName || '',
            projectId: form.projectId ? Number(form.projectId) : null,
            categoryId: category?.id ? Number(category.id) : null,
            subCategoryId: subcategory?.id ? Number(subcategory.id) : null,
            itemId: form.item ? Number(form.item) : null,
            priorityId: form.priority?.value ? Number(form.priority.value) : null,
            priorityName: form.priority?.label || '',
            assetId: form.asset?.value ? Number(form.asset.value) : null,
            category: category?.name || '',
            subCategory: subcategory?.name || '',
            item: selectedItemObj?.name || selectedItemObj?.label || '',
            priority: form.priority?.label || '',
            asset: form.asset?.label || '',
            subject,
            description: form.description,
            location: form.location?.label || form.location?.value || form.location || '',
            mobileNumber: form.mobile || null,
            attachmentName: form.attachment?.name || null,
            attachmentSizeBytes: form.attachment?.size || null,
            attachmentMimeType: form.attachment?.type || null,
            attachmentBase64: form.attachment?.base64 || null,
            accessRequiredTill: showAccess && form.accessTill
                ? form.accessTill.length === 16
                    ? form.accessTill + ":00"
                    : form.accessTill
                : null,
            createdBy: overrideUser?.raisedBySupportId || user?.userId || null,
            mode: overrideUser?.mode || form.mode || 'PORTAL',
            raisedBySupportId: overrideUser?.raisedBySupportId || null,
        };
        console.log('[buildPayload] item:', payload.item, 'itemId:', payload.itemId);
        return payload;
    };

    const handleDraft = async () => {
        if (!validateDraft()) return;
        setLoading('draft');
        try {
            if (isDraft && draftTicket?.ticketId) {
                await ticketApi.updateDraft(draftTicket.ticketId, buildPayload());
                safeSnack('Draft updated', 'success');
            } else {
                await ticketApi.saveDraft(buildPayload());
                safeSnack('Draft saved', 'success');
            }
            markClean();              // US-149
            clearDraftFromStorage();  // US-149
            if (typeof onBack === 'function') onBack();
            else navigate('/user/drafts');
        } catch (e) {
            const msg = e?.response?.data?.message || e.message || 'Failed to save draft';
            safeSnack(msg, 'error');
        } finally { setLoading(false); }
    };

    const handleSubmit = async () => {
        if (!validateSubmit()) {
            safeSnack('Please fill in all mandatory fields', 'error');
            return;
        }
        setLoading('submit');
        try {
            let t;
            if (isDraft && draftTicket?.ticketId) {
                try {
                    await ticketApi.updateDraft(draftTicket.ticketId, buildPayload());
                } catch (updateErr) {
                    console.warn('Draft update failed, submitting existing draft:', updateErr.message);
                }
                t = await ticketApi.submitDraft({ ticketId: draftTicket.ticketId });
            } else {
                t = await ticketApi.createAndSubmit(buildPayload());
                console.log(buildPayload());
            }
            safeSnack('Ticket submitted.', 'success');
            markClean();              // US-149
            clearDraftFromStorage();  // US-149
            safeSuccess(t);
        } catch (e) {
            const msg = e?.response?.data?.message || e.message || 'Submission failed';
            safeSnack(msg, 'error');
        } finally { setLoading(false); }
    };

    // US-149: modal handlers (triggered by useBlocker when user tries to navigate away)
    const handleModalSaveDraft = async () => {
        if (!form.projectId) {
            safeSnack('Please select a project before saving as draft', 'error');
            cancelNavigation();
            return;
        }
        setDraftModalSaving(true);
        try {
            if (isDraft && draftTicket?.ticketId) {
                await ticketApi.updateDraft(draftTicket.ticketId, buildPayload());
            } else {
                await ticketApi.saveDraft(buildPayload());
            }
            safeSnack('Draft saved', 'success');
            markClean();
            clearDraftFromStorage();
            confirmNavigation();
        } catch (e) {
            const msg = e?.response?.data?.message || e.message || 'Failed to save draft';
            safeSnack(msg, 'error');
            cancelNavigation();
        } finally {
            setDraftModalSaving(false);
        }
    };

    const handleModalDiscard = () => {
        markClean();
        clearDraftFromStorage();
        confirmNavigation();
    };

    const handleModalStay = () => {
        cancelNavigation();
    };

    const [locations, setLocations] = useState([]);

    useEffect(() => {
        try {
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
        } catch (error) {
            console.log(error);
        }
    }, []);

    const PreviewModal = () => {
        const previewFields = [
            { label: 'Category', value: category?.name },
            { label: 'Sub Category', value: subcategory?.name },
            { label: 'Project Title', value: projects.find(p => String(p.id) === String(form.projectId))?.projectName },
            { label: 'Item', value: selectedItemObj?.name || selectedItemObj?.label },
            { label: 'Requester Name', value: userName },
            { label: 'Employee ID', value: currentUser?.employeeId },
            { label: 'Mode', value: overrideUser ? form.mode : 'Web Form' },
            { label: 'Subject', value: subject },
            { label: 'Description', value: form.description, isHtml: true },
            { label: 'Priority', value: form.priority?.label },
            { label: 'Location', value: form.location?.label || form.location?.value },
            { label: 'Mobile Number', value: form.mobile },
            { label: 'Asset', value: form.asset?.label },
            ...(showAccess ? [{ label: 'Access Required Till', value: form.accessTill }] : []),
        ];

        const requiredKeys = ['projectId', 'item', 'location', 'priority', 'description', 'mobile'];
        const hasErrors = requiredKeys.some(k =>
            !form[k] || (k === 'description' && form[k].replace(/<[^>]+>/g, '').trim() === '')
        );

        return (
            <div style={{
                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
                zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                <div style={{
                    background: '#fff', borderRadius: 10, width: '90%', maxWidth: 680,
                    maxHeight: '85vh', overflow: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1.5px solid #ede9fe' }}>
                        <span style={{ fontWeight: 700, fontSize: 14, color: '#27235C' }}>Ticket Preview</span>
                        <button onClick={() => setShowPreview(false)} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#6b7280' }}>✕</button>
                    </div>

                    {hasErrors && (
                        <div style={{ margin: '12px 20px 0', padding: '8px 12px', background: '#fff8f8', border: '1px solid #fca5a5', borderRadius: 6, fontSize: 12, color: '#dc2626' }}>
                            ⚠ Some mandatory fields are missing. Please fill them before submitting.
                        </div>
                    )}

                    <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 24px' }}>
                        {previewFields.map(({ label, value, isHtml }) => {
                            const isEmpty = !value || (typeof value === 'string' && value.replace(/<[^>]+>/g, '').trim() === '');
                            return (
                                <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <span style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
                                    <div style={{ fontSize: 12, color: isEmpty ? '#dc2626' : '#1f2937', padding: '5px 8px', borderRadius: 5, minHeight: 28, background: isEmpty ? '#fff8f8' : '#f9fafb', border: `1.5px solid ${isEmpty ? '#fca5a5' : '#e5e7eb'}` }}>
                                        {isEmpty
                                            ? <em style={{ color: '#dc2626' }}>— Required —</em>
                                            : isHtml
                                                ? <span dangerouslySetInnerHTML={{ __html: value }} />
                                                : value}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {form.attachment && (
                        <div style={{ padding: '0 20px 12px' }}>
                            <span style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Attachment</span>
                            <div
                                onClick={() => setPreviewAttachment(form.attachment)}
                                style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: '#f9fafb', border: '1.5px solid #e5e7eb', borderRadius: 6, cursor: 'pointer' }}
                            >
                                <span style={{ fontSize: 18 }}>📎</span>
                                <div>
                                    <div style={{ fontSize: 12, fontWeight: 600, color: '#4F46E5' }}>{form.attachment.name}</div>
                                    <div style={{ fontSize: 11, color: '#6b7280' }}>{(form.attachment.size / 1024 / 1024).toFixed(2)} MB — click to preview</div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '12px 20px', borderTop: '1.5px solid #ede9fe' }}>
                        <Button variant="ghost" onClick={() => setShowPreview(false)}>Edit</Button>
                        <Button variant="primary" onClick={() => { setShowPreview(false); handleSubmit(); }} loading={loading === 'submit'}>
                            Submit
                        </Button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div>
            <StyleInjector />

            {showPreview && <PreviewModal />}

            {previewAttachment && (
                <AttachmentViewerModal
                    attachment={previewAttachment}
                    onClose={() => setPreviewAttachment(null)}
                />
            )}

            {/* US-149: unsaved-changes modal — fires when user tries to navigate away */}
            <DraftNavigationModal
                open={showModal}
                saving={draftModalSaving}
                onSaveDraft={handleModalSaveDraft}
                onDiscard={handleModalDiscard}
                onStay={handleModalStay}
            />

            <div className="page-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <div className="page-header__breadcrumb">
                    <span onClick={onBack} style={{ cursor: 'pointer' }}>{isDraft ? 'My Tickets' : 'Service Catalog'}</span>
                    <span className="sep"> › </span>
                    <span>{isDraft ? `Edit Draft — ${draftTicket.ticketNumber || ''}` : subcategory?.name || 'New Ticket'}</span>
                </div>
                <div className="page-header__title" style={{ textAlign: 'left' }}>
                    {isDraft ? `Edit Draft — ${draftTicket.ticketNumber || ''}` : category?.name ? `${category.name} — ${subcategory?.name}` : 'New Ticket'}
                </div>
            </div>

            <div className="card ct-card-compact">

                <div className="ct-section-title" style={{ marginTop: 0 }}>Service Classification</div>

                <div className="ct-form-grid">
                    <Field label="Project Title" required error={errors.projectId}>
                        <select
                            className={`ct-form-control${errors.projectId ? ' error' : ''}`}
                            value={form.projectId}
                            onChange={e => set('projectId', e.target.value)}
                        >
                            <option value="">— Select Project —</option>
                            {projects.map(p => <option key={p.id} value={p.id}>{p.projectName}</option>)}
                        </select>
                    </Field>
                    <Field label="Category" required>
                        <div className="ct-readonly-field">{category.name || '—'}</div>
                    </Field>

                    <Field label="Sub Category" required>
                        <div className="ct-readonly-field">{subcategory.name || '—'}</div>
                    </Field>
                    <Field label="Item" required error={errors.item}>
                        {itemsLoading ? (
                            <div className="ct-readonly-field">Loading items...</div>
                        ) : !subcategory.id ? (
                            <div className="ct-readonly-field" style={{ color: 'var(--gray-4)' }}>
                                {isDraft && category.name && subcategory.name ? 'Resolving sub-category...' : '— No sub-category —'}
                            </div>
                        ) : items.length === 0 ? (
                            <div className="ct-readonly-field" style={{ color: 'var(--gray-4)' }}>No items found for this sub-category</div>
                        ) : (
                            <select
                                className={`ct-form-control${errors.item ? ' error' : ''}`}
                                value={form.item ?? ''}
                                onChange={e => {
                                    const f = e.target.value;
                                    set('item', f);
                                    form.item = f;
                                    const found = items.find(i => String(i.value) === String(f));
                                    setSelectedItemObj(found || null);
                                }}
                            >
                                <option value="" disabled>— Select Item —</option>
                                {items.map(i => (<option key={i.value} value={i.value}>{i.name}</option>))}
                            </select>
                        )}
                    </Field>
                    {isOthersItem && (
                        <Field label="Describe your item" required error={errors.item} className="span-full">
                            <input
                                className={`ct-form-control${errors.item ? ' error' : ''}`}
                                value={customItemDesc}
                                onChange={e => setCustomItemDesc(e.target.value)}
                                placeholder="Describe what you need..."
                            />
                        </Field>
                    )}
                </div>

                <div className="ct-section-title">Requester Details</div>

                <div className="ct-form-grid three-col">
                    <Field label="Requester Name" required>
                        {disable ? (
                            <select
                                className={`ct-form-control${errors.item ? ' error' : ''}`}
                                onChange={async (e) => {
                                    let res = await userApi.getUserById(e.target.value);
                                    setCurrentUser(res.data);
                                    const f = (res.data.firstName + ' ' + res.data.lastName);
                                    set('mode', f);
                                    form.item = f;
                                }}
                            >
                                <option value="" disabled>— Select User —</option>
                                {users.map(i => (<option key={i.id} value={i.id}>{i.firstName + ' ' + i.lastName}</option>))}
                            </select>
                        ) : (
                            <div className="ct-readonly-field">{userName || '—'}</div>
                        )}
                    </Field>
                    <Field label="Employee ID">
                        <div className="ct-readonly-field">{currentUser?.employeeId || '—'}</div>
                    </Field>
                    <Field label="Mode" required>
                        {disable ? (
                            <select
                                className={`ct-form-control${errors.item ? ' error' : ''}`}
                                value={form.mode ?? ''}
                                onChange={e => { const f = (e.target.value); set('mode', f); form.item = f; }}
                            >
                                <option value="" disabled>— Select Mode —</option>
                                {mode.map(i => (<option key={i.value} value={i.value}>{i.name}</option>))}
                            </select>
                        ) : (
                            <div className="ct-readonly-field" style={{ color: 'var(--gray-5)', fontSize: 12 }}>Web Form</div>
                        )}
                    </Field>
                </div>

                <div className="ct-section-title">Ticket Details</div>

                <Field label="Subject" required>
                    <div className="ct-readonly-field" style={{ color: 'var(--gray-7)' }}>{subject || 'Auto-generated'}</div>
                </Field>

                <Field label="Description" required error={errors.description}>
                    <RTE
                        value={form.description}
                        onChange={v => set('description', v)}
                        error={errors.description}
                        placeholder="Describe your request..."
                    />
                </Field>

                <div className="ct-section-title">Contact &amp; Asset</div>

                <div className="ct-form-grid">
                    <Field label="Priority" required error={errors.priority}>
                        <select
                            className={`ct-form-control${errors.priority ? ' error' : ''}`}
                            value={form.priority?.value ?? ''}
                            onChange={e => {
                                const f = priorities.find(p => String(p.priorityId) === String(e.target.value));
                                set('priority', f ? { value: f.priorityId, label: f.priorityName } : null);
                            }}
                        >
                            <option value="" disabled>— Select Priority —</option>
                            {priorities.map(p => <option key={p.priorityId} value={p.priorityId}>{p.priorityName}</option>)}
                        </select>
                    </Field>
                    <Field label="Location" required error={errors.location}>
                        <select
                            className={`ct-form-control${errors.location ? ' error' : ''}`}
                            value={form.location?.value ?? ''}
                            onChange={e => set('location', e.target.value ? { value: e.target.value, label: e.target.value } : null)}
                        >
                            <option value="" disabled>— Select Location —</option>
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
                    <Field label="Mobile Number" required error={errors.mobile}>
                        <input
                            maxLength={10}
                            type="tel"
                            className={`ct-form-control${errors.mobile ? ' error' : ''}`}
                            value={form.mobile}
                            onChange={e => set('mobile', e.target.value)}
                            placeholder="10-digit number starting with 6–9"
                        />
                    </Field>
                    <Field label="Asset">
                        <div className="ct-readonly-field">{form.asset?.label || 'No asset assigned'}</div>
                    </Field>
                </div>

                {showAccess && (
                    <>
                        <div className="alert alert--info">Access Required Till is mandatory for this item.</div>
                        <Field label="Access Required Till" required error={errors.accessTill}>
                            <input
                                type="datetime-local"
                                className={`ct-form-control${errors.accessTill ? ' error' : ''}`}
                                value={form.accessTill}
                                style={{ width: "49%" }}
                                min={new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
                                onChange={e => set('accessTill', e.target.value)}
                            />
                        </Field>
                    </>
                )}

                <Uploader value={form.attachment} onChange={v => set('attachment', v)} />

                <div className="divider" style={{ margin: '8px 0' }} />

                <div className="flex-end flex-gap-3">
                    <Button variant="ghost" onClick={() => navigate('/user/dashboard')}>Cancel</Button>
                    <Button variant="secondary" onClick={handleDraft} loading={loading === 'draft'} disabled={!!loading && loading !== 'draft'}>
                        {isDraft ? 'Save Draft' : 'Save as Draft'}
                    </Button>
                    {/* <Button variant="secondary" onClick={() => setShowPreview(true)}>Preview</Button> */}
                    <Button variant="primary" onClick={() => setShowPreview(true)} loading={loading === 'submit'} disabled={!!loading && loading !== 'submit'}>Submit</Button>
                </div>

            </div>

        </div>
    );
}
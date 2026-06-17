import React, { useState, useEffect, useRef } from 'react';

import { masterApi, ticketApi } from '../../api/ourApi';

import { rmoApi } from '../../api/rmoApi';

import { buildSubject, validateMobile } from '../../utils/helpers';
import { userApi } from '../../api/userApi';

import { Button, Spinner } from '../../components/itsm/UI'

import { useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';

import { getItemsBySubcategory } from '../../api/serviceCatalogApi';

import { getAllLocations } from '../../api/LocationApi';

import { getMappingsByUser } from '../../api/assetApi';
import toast from 'react-hot-toast';

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

/* ── Field wrapper ──────────────────────────────────────────────── */
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

/* ── Rich Text Editor ─────────────────────────────────────────── */
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

        // setErr(''); onChange({ name: file.name, size: file.size, file });
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



export default function CreateTicketPage({ preSelected, onSuccess, showSnack, onBack, draftTicket, overrideUser }) {

    const isDraft = !!draftTicket;

    const navigate = useNavigate();

    let { user } = useAuth();

    const { state } = useLocation();

    const { serviceType, category, subcategory } = state || {};

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

    // ── Items — only loaded from getItemsBySubcategory (serviceCatalogApi) ──
    const [items, setItems] = useState([]);
    const [selectedItemObj, setSelectedItemObj] = useState(null); // tracks full item object for accessDateRequired

    const [selectedItem, setSelectedItem] = useState('');

    useEffect(() => {

        if (!subcategory) navigate('/catalog');

    }, [subcategory, navigate]);

    // ── Single item loader: getItemsBySubcategory ──────────────────────────
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

    // ── Subcategory resolution (kept for draft compatibility) ──────────────
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
    ]

    const [users, setUsers] = useState([]);

    useEffect(() => {
        if (user.roles[0] == 'SUPPORT_PERSONNEL') {
            setDisable(true)
        }
        try {
            let loadUsers = async () => {
                let res = await userApi.getAllUsers();
                console.log(res);
                setUsers(res.data.content);
            }
            loadUsers()
        } catch (error) {
            setUsers([])
            console.log(error);
        }
    }, [])

    const [form, setForm] = useState({

        item: null, location: null, asset: null, priority: null, mode: null,

        mobile: '', description: isDraft ? (draftTicket.description || '') : '',

        attachment: null, accessTill: '',

        projectId: isDraft && draftTicket.projectId ? String(draftTicket.projectId) : '',

    });

    const [errors, setErrors] = useState({});

    const [loading, setLoading] = useState(false);

    const [priorities, setPriorities] = useState([]);

    const [projects, setProjects] = useState([]);

    const [itemsLoading, setItemsLoading] = useState(false);

    const [customItemDesc, setCustomItemDesc] = useState('');

    const set = (k, v) => {
        setForm(f => ({ ...f, [k.trim()]: v })); console.log(k, v);
        // Clear the error for this field as user edits
        setErrors(e => { const n = { ...e }; delete n[k.trim()]; return n; });
    };

    // ── Dynamic: show access date field only if selected item requires it ──
    const showAccess = selectedItemObj?.accessDateRequired === true;

    const isOthersItem = form.item?.label?.toLowerCase() === 'others';

    // ── Load projects ──────────────────────────────────────────────────────
    useEffect(() => {
        try {
            let loadProjects = async () => {
                let res = await rmoApi.getProjectsByUserId(currentUser.id);
                setProjects(res.data)
            }
            loadProjects()
        } catch (error) {
            console.log(error);
        }
    }, [currentUser])

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
                    const medium = mapped.find(p =>
                        p.priorityName.toUpperCase() === 'MEDIUM'
                    );
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

    // ── Auto-fill asset ────────────────────────────────────────────────────
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
                .catch(() => {
                    set('asset', null);
                });
        });
    }, [currentUser?.id]);

    // ── Restore draft fields once priorities load ──────────────────────────
    // useEffect(() => {

    //     if (!isDraft || !priorities.length) return;

    //     if (draftTicket.priorityId) {

    //         const p = priorities.find(x => String(x.priorityId) === String(draftTicket.priorityId));

    //         if (p) set('priority', { value: p.priorityId, label: p.priorityName });

    //     }

    //     if (draftTicket.location) set('location', { value: draftTicket.location, label: draftTicket.location });

    //     if (draftTicket.mobileNumber) set('mobile', draftTicket.mobileNumber);

    //     if (draftTicket.accessRequiredTill) set('accessTill', draftTicket.accessRequiredTill);

    //     // eslint-disable-next-line

    // }, [isDraft, priorities.length]);

    // ── Restore draft attachment from DB when editing a draft ──────────────
    useEffect(() => {
        if (!isDraft || !draftTicket?.ticketId) return;

        ticketApi.getAttachments(draftTicket.ticketId)
            .then(attachments => {
                const list = Array.isArray(attachments) ? attachments : [];
                if (list.length > 0) {
                    const a = list[0]; // take the most recent attachment
                    // Restore as an attachment object the Uploader can display
                    set('attachment', {
                        name: a.filename,
                        size: a.fileSizeBytes || 0,
                        type: a.mimeType || '',
                        base64: a.file,         // base64 from DB — used if user saves again without re-uploading
                    });
                }
            })
            .catch(err => console.warn('Could not load draft attachment:', err));

        // eslint-disable-next-line
    }, [isDraft, draftTicket?.ticketId]);


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
            // attachmentName: form.attachment?.name || null,
            // attachmentSizeBytes: form.attachment?.size || null,
            // attachmentMimeType: form.attachment?.type || null,
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

            if (typeof onBack === 'function') onBack();
            else navigate('/user/drafts');

        } catch (e) {
            const msg = e?.response?.data?.message || e.message || 'Failed to save draft';
            safeSnack(msg, 'error');
        }

        finally { setLoading(false); }

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

            safeSuccess(t);

        }
        catch (e) {
            const msg = e?.response?.data?.message || e.message || 'Submission failed';
            safeSnack(msg, 'error');
        }
        finally { setLoading(false); }

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

    return (

        <div>

            <StyleInjector />

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

                {/* ── Section: Service Classification ── */}
                <div className="ct-section-title" style={{ marginTop: 0 }}>Service Classification</div>

                <div className="ct-form-grid">

                    {/* Category (readonly) — left col */}
                    <Field label="Category" required>
                        <div className="ct-readonly-field">{category.name || '—'}</div>
                    </Field>

                    {/* Project Title — right col */}
                    <Field
                        label="Project Title"
                        required
                        error={errors.projectId}
                    >
                        <select
                            className={`ct-form-control${errors.projectId ? ' error' : ''}`}
                            value={form.projectId}
                            onChange={e => set('projectId', e.target.value)}
                        >
                            <option value="">— Select Project —</option>
                            {projects.map(p => <option key={p.id} value={p.id}>{p.projectName}</option>)}
                        </select>
                    </Field>

                    {/* Sub Category (readonly) — left col */}
                    <Field label="Sub Category" required>
                        <div className="ct-readonly-field">{subcategory.name || '—'}</div>
                    </Field>

                    {/* Item — right col */}
                    <Field
                        label="Item"
                        required
                        error={errors.item}
                    >
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

                    {/* Describe item — shown only for "Others" */}
                    {isOthersItem && (
                        <Field
                            label="Describe your item"
                            required
                            error={errors.item}
                            className="span-full"
                        >
                            <input
                                className={`ct-form-control${errors.item ? ' error' : ''}`}
                                value={customItemDesc}
                                onChange={e => setCustomItemDesc(e.target.value)}
                                placeholder="Describe what you need..."
                            />
                        </Field>
                    )}

                </div>

                {/* ── Section: Requester Details ── */}
                <div className="ct-section-title">Requester Details</div>

                <div className="ct-form-grid three-col">

                    {/* Requester Name */}
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

                    {/* Employee ID */}
                    <Field label="Employee ID">
                        <div className="ct-readonly-field">{currentUser?.employeeId || '—'}</div>
                    </Field>

                    {/* Mode */}
                    <Field label="Mode" required>
                        {disable ? (
                            <select
                                className={`ct-form-control${errors.item ? ' error' : ''}`}
                                value={form.mode ?? ''}
                                onChange={e => { const f = (e.target.value); set('mode', f); form.item = f }}
                            >
                                <option value="" disabled>— Select Mode —</option>
                                {mode.map(i => (<option key={i.value} value={i.value}>{i.name}</option>))}
                            </select>
                        ) : (
                            <div className="ct-readonly-field" style={{ color: 'var(--gray-5)', fontSize: 12 }}>Web Form</div>
                        )}
                    </Field>

                </div>

                {/* ── Section: Ticket Details ── */}
                <div className="ct-section-title">Ticket Details</div>

                {/* Subject (full width) */}
                <Field label="Subject" required>
                    <div className="ct-readonly-field" style={{ color: 'var(--gray-7)' }}>{subject || 'Auto-generated'}</div>
                </Field>

                {/* Description (full width) */}
                <Field
                    label="Description"
                    required
                    error={errors.description}
                >
                    <RTE
                        value={form.description}
                        onChange={v => set('description', v)}
                        error={errors.description}
                        placeholder="Describe your request..."
                    />
                </Field>

                {/* ── Section: Contact & Asset ── */}
                <div className="ct-section-title">Contact &amp; Asset</div>

                <div className="ct-form-grid">

                    {/* Priority */}
                    <Field
                        label="Priority"
                        required
                        error={errors.priority}
                    >
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

                    {/* Location */}
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

                    {/* Mobile Number */}
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

                    {/* Asset (auto-filled, readonly) */}
                    <Field label="Asset">
                        <div className="ct-readonly-field">{form.asset?.label || 'No asset assigned'}</div>
                    </Field>

                </div>

                {/* Access Required Till — conditional */}
                {showAccess && (
                    <>
                        <div className="alert alert--info">Access Required Till is mandatory for this item.</div>

                        <Field
                            label="Access Required Till"
                            required
                            error={errors.accessTill}
                        >
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

                    <Button variant="primary" onClick={handleSubmit} loading={loading === 'submit'} disabled={!!loading && loading !== 'submit'}>Submit</Button>

                </div>

            </div>

        </div>

    );

}
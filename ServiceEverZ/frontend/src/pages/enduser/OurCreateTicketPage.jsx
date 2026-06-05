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

        <div style={{ overflow: 'auto', width: '77vw', height: '180px' }}>

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

                <div ref={ref} className="rte-body" style={{ overflow: 'auto', minHeight: 140 }} contentEditable suppressContentEditableWarning

                    data-placeholder={placeholder || 'Describe your request in detail...'}

                    onInput={() => onChange(ref.current?.innerHTML || '')} />

            </div>

            {error && <div className="form-error">{error}</div>}

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

        setErr(''); onChange({ name: file.name, size: file.size, file });

    };

    return (

        <div className="form-group"><label className="form-label">Attachments</label>

            <div className={`file-uploader${drag ? ' dragging' : ''}`} onClick={() => ref.current?.click()}

                onDragOver={e => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}

                onDrop={e => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files[0]); }}>

                <input ref={ref} type="file" accept={EXTS.join(',')} style={{ display: 'none' }} onChange={e => handle(e.target.files[0])} />

                <div className="file-uploader__icon">+</div>

                {value

                    ? <><div className="file-uploader__selected">{value.name}</div><div className="file-uploader__sub">{(value.size / 1024 / 1024).toFixed(2)} MB</div></>

                    : <><div className="file-uploader__text">Drop file here or click to browse</div><div className="file-uploader__sub">Allowed: {EXTS.join(', ')} — Max 30 MB</div></>}

            </div>

            {err && <div className="form-error">{err}</div>}

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

    const [touched, setTouched] = useState(false);

    const itemError = touched && !selectedItem ? 'Please select a service item to continue' : '';

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

    // ── Load priorities ────────────────────────────────────────────────────
    // useEffect(() => {
    //     masterApi.getPriorities()
    //         .then(data => {
    //             const list = Array.isArray(data) ? data : [];
    //             const mapped = list.map(p => ({
    //                 priorityId: p.priorityId || p.id,
    //                 priorityName: p.priorityName || p.name || ''
    //             })).filter(p => p.priorityId && p.priorityName);
    //             setPriorities(mapped);
    //             if (!isDraft) {
    //                 const medium = mapped.find(p => p.priorityName?.toUpperCase() === 'MEDIUM');
    //                 if (medium) set('priority', { value: medium.priorityId, label: medium.priorityName });
    //             }
    //         })
    //         .catch(err => {
    //             console.error('Priority API failed:', err);
    //             const fallback = [
    //                 { priorityId: 1, priorityName: 'HIGH' },
    //                 { priorityId: 2, priorityName: 'MEDIUM' },
    //                 { priorityId: 3, priorityName: 'LOW' }
    //             ];
    //             setPriorities(fallback);
    //             if (!isDraft) {
    //                 set('priority', { value: 2, label: 'MEDIUM' });
    //             }
    //         });
    // }, []);



    useEffect(() => {
        masterApi.getPriorities()
            .then(data => {
                // data is the unwrapped array from priority_sla table
                const list = Array.isArray(data) ? data : [];
                const mapped = list.map(p => ({
                    priorityId: p.priorityId || p.id,
                    priorityName: (p.priorityName || p.name || '').toUpperCase()
                })).filter(p => p.priorityId && p.priorityName);
                setPriorities(mapped);

                // Set MEDIUM as default for new tickets (not drafts)
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
                // Set MEDIUM default even on fallback for new tickets
                if (!isDraft) {
                    set('priority', { value: 2, label: 'MEDIUM' });
                }
            });
    }, []);



    // ── Auto-fill asset ────────────────────────────────────────────────────
    // useEffect(() => {
    //     if (!currentUser?.id) return;
    //     if (currentUser?.preloadedAsset) {
    //         set('asset', currentUser.preloadedAsset);
    //         return;
    //     }
    //     getMappingsByUser(currentUser.id)
    //         .then(res => {
    //             const arr = Array.isArray(res?.data) ? res.data
    //                 : Array.isArray(res) ? res : [];
    //             const active = arr.find(m =>
    //                 m.status === 'MANAGER_APPROVED' || m.status === 'APPROVED' || m.status === 'ACTIVE'
    //             ) || arr[0];
    //             if (active) {
    //                 set('asset', {
    //                     value: active.assetId || active.id,
    //                     label: `${active.assetName || active.asset?.assetName || 'Asset'} (${active.assetTag || active.asset?.assetTag || ''})`,
    //                 });
    //             }
    //         })
    //         .catch(() => { });
    // }, [currentUser?.id]);


    useEffect(() => {
        if (!currentUser?.id) return;

        // If asset was pre-loaded (e.g. from overrideUser), use it directly
        if (currentUser?.preloadedAsset) {
            set('asset', currentUser.preloadedAsset);
            return;
        }

        // Fetch assets assigned to this user from the assets table,
        // filter to LAPTOP category only (the relevant asset for software/IT tickets)
        import('../../api/assetApi').then(({ getAssetsByUser }) => {
            getAssetsByUser(currentUser.id)
                .then(res => {
                    const arr = Array.isArray(res?.data?.data) ? res.data.data
                        : Array.isArray(res?.data) ? res.data
                            : Array.isArray(res) ? res
                                : [];

                    // Filter to LAPTOP category only
                    const laptops = arr.filter(a =>
                        a.category === 'LAPTOP' || a.category?.toUpperCase() === 'LAPTOP'
                    );

                    // Pick first active/available laptop
                    const laptop = laptops.find(a =>
                        a.status === 'IN_USE' || a.status === 'ACTIVE' || a.status === 'AVAILABLE'
                    ) || laptops[0];

                    if (laptop) {
                        set('asset', {
                            value: laptop.id || laptop.assetId,
                            label: `${laptop.name || laptop.assetName || 'Laptop'} (${laptop.assetTag || laptop.serialNumber || ''})`,
                        });
                    } else {
                        // No laptop found — leave asset blank, user may not have one assigned
                        set('asset', null);
                    }
                })
                .catch(() => {
                    // Silently fail — asset is optional for most ticket categories
                    set('asset', null);
                });
        });
    }, [currentUser?.id]);



    // ── Restore draft fields once priorities load ──────────────────────────
    useEffect(() => {

        if (!isDraft || !priorities.length) return;

        if (draftTicket.priorityId) {

            const p = priorities.find(x => String(x.priorityId) === String(draftTicket.priorityId));

            if (p) set('priority', { value: p.priorityId, label: p.priorityName });

        }

        if (draftTicket.location) set('location', { value: draftTicket.location, label: draftTicket.location });

        if (draftTicket.mobileNumber) set('mobile', draftTicket.mobileNumber);

        if (draftTicket.accessRequiredTill) set('accessTill', draftTicket.accessRequiredTill);

        // eslint-disable-next-line

    }, [isDraft, priorities.length]);

    const validateDraft = () => {

        // Project is required before saving as draft
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
            accessRequiredTill: showAccess && form.accessTill
                ? form.accessTill.length === 16
                    ? form.accessTill + ":00"   // "2026-06-12T18:30" → "2026-06-12T18:30:00"
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

    return (

        <div>

            <div className="page-header">

                <div className="page-header__breadcrumb">

                    <span onClick={onBack} style={{ cursor: 'pointer' }}>{isDraft ? 'My Tickets' : 'Service Catalog'}</span>

                    <span className="sep"> › </span>

                    <span>{isDraft ? `Edit Draft — ${draftTicket.ticketNumber || ''}` : subcategory?.name || 'New Ticket'}</span>

                </div>

                <div className="page-header__title">

                    {isDraft ? `Edit Draft — ${draftTicket.ticketNumber || ''}` : category?.name ? `${category.name} — ${subcategory?.name}` : 'New Ticket'}

                </div>

            </div>

            <div className="card">

                {/* Project + Category */}

                <div className="two-col" style={{ marginBottom: 'var(--space-4)' }}>

                    <div className="form-group" style={{ marginBottom: 0 }}>

                        <label className="form-label">Project Title <span className="required">*</span></label>

                        <select className={`form-control${errors.projectId ? ' error' : ''}`} value={form.projectId} onChange={e => set('projectId', e.target.value)}>

                            <option value="">— Select Project —</option>

                            {projects.map(p => <option key={p.id} value={p.id}>{p.projectName}</option>)}

                        </select>

                        {errors.projectId && <div className="form-error">{errors.projectId}</div>}

                    </div>

                    <div><div className="form-label">Category <span className="required">*</span></div><div className="readonly-field">{category.name || '—'}</div></div>

                </div>

                {/* Sub-Category + Item */}

                <div className="two-col" style={{ marginBottom: 'var(--space-4)' }}>

                    <div><div className="form-label">Sub Category <span className="required">*</span></div><div className="readonly-field">{subcategory.name || '—'}</div></div>

                    <div className="form-group" style={{ marginBottom: 0 }}>

                        <label className="form-label">Item <span className="required">*</span></label>

                        {itemsLoading ? (

                            <div className="readonly-field">Loading items...</div>

                        ) : !subcategory.id ? (

                            <div className="readonly-field" style={{ color: 'var(--gray-4)' }}>

                                {isDraft && category.name && subcategory.name ? 'Resolving sub-category...' : '— No sub-category —'}

                            </div>

                        ) : items.length === 0 ? (

                            <div className="readonly-field" style={{ color: 'var(--gray-4)' }}>No items found for this sub-category</div>

                        ) : (

                            <select

                                className={`form-control${errors.item ? ' error' : ''}`}

                                value={form.item ?? ''}

                                onChange={e => {
                                    const f = e.target.value;
                                    set('item', f);
                                    form.item = f;
                                    const found = items.find(i => String(i.value) === String(f));
                                    setSelectedItemObj(found || null);
                                }}>

                                <option value="" disabled>— Select Item —</option>

                                {items.map(i => (<option key={i.value} value={i.value}>{i.name}</option>))}

                            </select>

                        )}

                        {errors.item && <div className="form-error">{errors.item}</div>}

                        {/* If user selects "Others", show a text field to describe their item */}

                        {isOthersItem && (

                            <div className="form-group" style={{ marginTop: 'var(--space-3)' }}>

                                <label className="form-label">Describe your item <span className="required">*</span></label>

                                <input className="form-control" value={customItemDesc} onChange={e => setCustomItemDesc(e.target.value)} placeholder="Describe what you need..." />

                            </div>

                        )}

                    </div>

                </div>

                {/* Requester Details */}

                <div className="section-title">Requester Details</div>

                <div className="two-col" style={{ marginBottom: 'var(--space-4)' }}>

                    {
                        disable ? <div className="form-group" style={{ marginBottom: 0 }}>

                            <label className="form-label">Requester Name <span className="required">*</span></label>
                            <select

                                className={`form-control${errors.item ? ' error' : ''}`}

                                onChange={async (e) => { let res = await userApi.getUserById(e.target.value); setCurrentUser(res.data); const f = (res.data.firstName + ' ' + res.data.lastName); set('mode', f); form.item = f; }}>

                                <option value="" disabled>— Select User —</option>

                                {users.map(i => (<option key={i.id} value={i.id}>{i.firstName + ' ' + i.lastName}</option>))}

                            </select>

                        </div> : <div> <div className="form-label">Requester Name <span className="required">*</span></div><div className="readonly-field">{userName || '—'}</div></div>
                    }

                    <div><div className="form-label">Employee ID</div><div className="readonly-field">{currentUser?.employeeId || '—'}</div></div>

                </div>

                {
                    disable ? <div className="form-group" style={{ marginBottom: 20 }}>

                        <label className="form-label">Mode <span className="required">*</span></label>
                        <select

                            className={`form-control${errors.item ? ' error' : ''}`}

                            value={form.mode ?? ''}

                            onChange={e => { const f = (e.target.value); set('mode', f); form.item = f }}>

                            <option value="" disabled>— Select Item —</option>

                            {mode.map(i => (<option key={i.value} value={i.value}>{i.name}</option>))}

                        </select>
                    </div> : <div style={{ marginBottom: 'var(--space-4)', fontSize: 13, color: 'var(--gray-5)' }}>Mode: Web Form</div>
                }

                {/* Ticket Details */}

                <div className="section-title">Ticket Details</div>

                <div className="form-group">

                    <div className="form-label">Subject <span className="required">*</span></div>

                    <div className="readonly-field" style={{ color: 'var(--gray-7)' }}>{subject || 'Auto-generated'}</div>

                </div>

                <div className="form-group">

                    <label className="form-label">Description <span className="required">*</span></label>

                    <RTE value={form.description} onChange={v => set('description', v)} error={errors.description} placeholder="Describe your request..." />

                </div>

                {/* Priority + Location */}

                <div className="two-col">

                    <div className="form-group">

                        <label className="form-label">Priority <span className="required">*</span></label>

                        <select className={`form-control${errors.priority ? ' error' : ''}`} value={form.priority?.value ?? ''}

                            onChange={e => {
                                const f = priorities.find(p => String(p.priorityId) === String(e.target.value));
                                set('priority', f ? { value: f.priorityId, label: f.priorityName } : null);
                            }}>

                            <option value="" disabled>— Select Priority —</option>

                            {priorities.map(p => <option key={p.priorityId} value={p.priorityId}>{p.priorityName}</option>)}

                        </select>

                        {errors.priority && <div className="form-error">{errors.priority}</div>}

                    </div>

                    <div className="form-group">

                        <label className="form-label">Location <span className="required">*</span></label>

                        <select className={`form-control${errors.location ? ' error' : ''}`} value={form.location?.value ?? ''}

                            onChange={e => set('location', e.target.value ? { value: e.target.value, label: e.target.value } : null)}>

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

                        {errors.location && <div className="form-error">{errors.location}</div>}

                    </div>

                </div>

                {/* Mobile + Asset */}

                <div className="two-col">

                    <div className="form-group">

                        <label className="form-label">Mobile Number <span className="required">*</span></label>

                        <input maxLength={10} type="tel" className={`form-control${errors.mobile ? ' error' : ''}`} value={form.mobile}

                            onChange={e => set('mobile', e.target.value)} placeholder="10-digit mobile starting with 6/7/8/9" />

                        {errors.mobile && <div className="form-error">{errors.mobile}</div>}

                    </div>

                    <div className="form-group">

                        <label className="form-label">Asset (auto-filled from your profile)</label>

                        <div className="readonly-field">{form.asset?.label || 'No asset assigned'}</div>

                    </div>

                </div>

                {/* Access Required Till — shown dynamically based on item's accessDateRequired flag */}

                {showAccess && (<>

                    <div className="alert alert--info">Access Required Till is mandatory for this item.</div>

                    <div className="form-group">

                        <label className="form-label">Access Required Till <span className="required">*</span></label>

                        <input type="datetime-local" className={`form-control${errors.accessTill ? ' error' : ''}`} value={form.accessTill} onChange={e => set('accessTill', e.target.value)} />

                        {errors.accessTill && <div className="form-error">{errors.accessTill}</div>}

                    </div>

                </>)}

                <Uploader value={form.attachment} onChange={v => set('attachment', v)} />

                <div className="divider" />

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

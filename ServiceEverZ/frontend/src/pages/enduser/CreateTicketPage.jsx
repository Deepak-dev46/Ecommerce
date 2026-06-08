// import React, { useState, useEffect, useRef } from 'react';
// import { masterApi, ticketApi } from '../../api/ourApi';
// import { buildSubject, requiresAccessTill, validateMobile } from '../../utils/helpers';
// import { Button, Spinner } from '../../components/UI'
// import { useLocation, useNavigate } from 'react-router-dom';
// import { useAuth } from '../../context/AuthContext';
// import { getItemsBySubcategory } from '../../api/serviceCatalogApi';

// /* ── Rich Text Editor ─────────────────────────────────────────── */
// function RTE({ value, onChange, error, placeholder }) {
//   const ref = useRef(null);
//   const initialized = useRef(false);
//   useEffect(() => {
//     if (ref.current && !initialized.current) {
//       ref.current.innerHTML = value || '';
//       initialized.current = true;
//     }
//     // eslint-disable-next-line
//   }, []);
//   const exec = (cmd, val) => {
//     ref.current?.focus();
//     document.execCommand(cmd, false, val ?? null);
//     onChange(ref.current?.innerHTML || '');
//   };
//   return (
//     <div>
//       <div className={`rte-wrapper${error ? ' error' : ''}`}>
//         <div className="rte-toolbar">
//           {[['B', 'bold', 'bold'], ['I', 'italic', 'italic'], ['U', 'underline', 'underline']].map(([l, c, cls]) => (
//             <button key={c} type="button" className={`rte-btn ${cls}`} onMouseDown={e => { e.preventDefault(); exec(c); }}>{l}</button>
//           ))}
//           <div className="rte-divider" />
//           <button type="button" className="rte-btn" onMouseDown={e => { e.preventDefault(); exec('insertUnorderedList'); }}>Bullet List</button>
//           <button type="button" className="rte-btn" onMouseDown={e => { e.preventDefault(); exec('insertOrderedList'); }}>Numbered List</button>
//           <button type="button" className="rte-btn link" onMouseDown={e => { e.preventDefault(); const u = window.prompt('Enter URL:'); if (u) exec('createLink', u); }}>Link</button>
//           <div className="rte-divider" />
//           <button type="button" className="rte-btn" style={{ color: 'var(--gray-5)', fontSize: 11 }} onMouseDown={e => { e.preventDefault(); exec('removeFormat'); }}>Clear</button>
//         </div>
//         <div ref={ref} className="rte-body" contentEditable suppressContentEditableWarning
//           data-placeholder={placeholder || 'Describe your request in detail...'}
//           onInput={() => onChange(ref.current?.innerHTML || '')} style={{ minHeight: 140 }} />
//       </div>
//       {error && <div className="form-error">{error}</div>}
//     </div>
//   );
// }

// function Uploader({ value, onChange }) {
//   const [err, setErr] = useState(''); const [drag, setDrag] = useState(false); const ref = useRef(null);
//   const EXTS = ['.jpg', '.jpeg', '.png', '.pdf', '.docx']; const MAX = 30 * 1024 * 1024;
//   const handle = (file) => {
//     if (!file) return;
//     const ext = '.' + file.name.split('.').pop().toLowerCase();
//     if (!EXTS.includes(ext)) { setErr(`Invalid: ${EXTS.join(', ')}`); return; }
//     if (file.size > MAX) { setErr('Max 30 MB'); return; }
//     setErr(''); onChange({ name: file.name, size: file.size, file });
//   };
//   return (
//     <div className="form-group"><label className="form-label">Attachments</label>
//       <div className={`file-uploader${drag ? ' dragging' : ''}`} onClick={() => ref.current?.click()}
//         onDragOver={e => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
//         onDrop={e => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files[0]); }}>
//         <input ref={ref} type="file" accept={EXTS.join(',')} style={{ display: 'none' }} onChange={e => handle(e.target.files[0])} />
//         <div className="file-uploader__icon">+</div>
//         {value
//           ? <><div className="file-uploader__selected">{value.name}</div><div className="file-uploader__sub">{(value.size / 1024 / 1024).toFixed(2)} MB</div></>
//           : <><div className="file-uploader__text">Drop file here or click to browse</div><div className="file-uploader__sub">Allowed: {EXTS.join(', ')} — Max 30 MB</div></>}
//       </div>
//       {err && <div className="form-error">{err}</div>}
//     </div>
//   );
// }

// export default function CreateTicketPage({ preSelected, onSuccess, showSnack, onBack, draftTicket }) {
//   const isDraft = !!draftTicket;
//   const navigate = useNavigate();
//   let { user } = useAuth();
//   const { state } = useLocation();
//   const { serviceType, category, subcategory } = state || {};


//   const currentUser = user || '-';
//   const [items, setItems] = useState([]);
//   const [selectedItem, setSelectedItem] = useState('');
//   const [touched, setTouched] = useState(false);

//   const itemError = touched && !selectedItem ? 'Please select a service item to continue' : '';

//   useEffect(() => {
//     if (!subcategory) navigate('/catalog');
//   }, [subcategory, navigate]);

//   useEffect(() => {

//     if (!subcategory) return;
//     getItemsBySubcategory(subcategory.id)
//       .then(({ data }) => setItems(data))
//       .catch(() => toast.error('Failed to load items'));
//   }, [subcategory]);

//   // Category — from preSelected (new ticket) or draft
//   const category = preSelected?.category || (isDraft ? {
//     categoryId: draftTicket.categoryId,
//     categoryName: draftTicket.category,
//   } : null);

// const safeSnack = (msg, type) => {
//   if (typeof showSnack === 'function') {
//     showSnack(msg, type);
//   } else {
//     console.log(`[${type}] ${msg}`);
//   }
// };//added for safesnack to display

// const safeSuccess = (data) => {
//   if (typeof onSuccess === 'function') {
//     onSuccess(data);
//   } else {
//     console.log('Success:', data);

//     // optional navigation fallback
//     navigate('/tickets');   // redirect after submit
//   }
// };

//   // ── Subcategory resolution ──────────────────────────────────────────────────
//   // The backend TicketResponse only returns subCategory (name), NOT subCategoryId.
//   // AFTER the backend fix (TicketResponse.java + TicketMapper_fix.java),
//   // the response will include subCategoryId. Until then, we try all variants.
//   const draftSubcatId =
//     draftTicket?.subCategoryId ||   // after backend fix
//     draftTicket?.subcategoryId ||  // alternative casing
//     draftTicket?.sub_category_id || // snake_case
//     null;

//   const subcategory = preSelected?.subCategory || (isDraft ? {
//     subcategoryId: draftSubcatId ? Number(draftSubcatId) : null,
//     subcategoryName: draftTicket.subCategory,
//   } : null);

//   const userName = currentUser?.fullName || [currentUser?.firstName, currentUser?.lastName].filter(Boolean).join(' ') || '';
//   const subject = buildSubject(category?.name, subcategory?.name, userName);

//   const [form, setForm] = useState({
//     item: null, location: null, asset: null, priority: null,
//     mobile: '', description: isDraft ? (draftTicket.description || '') : '',
//     attachment: null, accessTill: '',
//     projectId: isDraft && draftTicket.projectId ? String(draftTicket.projectId) : '',
//   });
//   const [errors, setErrors] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [priorities, setPriorities] = useState([]);
//   const [projects, setProjects] = useState([]);
//   // const [items, setItems] = useState([]);
//   const [itemsLoading, setItemsLoading] = useState(false);
//   const [customItemDesc, setCustomItemDesc] = useState('');
//   // For draft: resolved subcatId after lookup
//   const [resolvedSubcatId, setResolvedSubcatId] = useState(
//     subcategory?.subcategoryId ? Number(subcategory.subcategoryId) : null
//   );

//   const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
//   const showAccess = requiresAccessTill(form.item?.label || '');
//   const isOthersItem = form.item?.label?.toLowerCase() === 'others';

//   /* Load priorities + projects once */
//   useEffect(() => {
//     masterApi.getPriorities().then(d => setPriorities(Array.isArray(d) ? d : [])).catch(() => { });
//     masterApi.getProjects().then(d => setProjects(Array.isArray(d) ? d : [])).catch(() => { });
//   }, []);

//   /* ── SUBCATEGORY ID RESOLUTION ─────────────────────────────────────────────
//    * For DRAFT tickets: the backend currently doesn't return subCategoryId.
//    * So we look up the subcategory by name using the category's subcategory list.
//    * Once the backend fix is applied, draftSubcatId will be set directly.
//    * ─────────────────────────────────────────────────────────────────────────── */
//   useEffect(() => {
//     if (!isDraft) return;

//     // If we already have the id (after backend fix), use it directly
//     if (draftSubcatId) {
//       setResolvedSubcatId(Number(draftSubcatId));
//       return;
//     }

//     // Fallback: look up subcategoryId by name from backend
//     if (category?.categoryId && subcategory?.subcategoryName) {
//       masterApi.getSubcategories(category.categoryId)
//         .then(d => {
//           const arr = Array.isArray(d) ? d : [];
//           const found = arr.find(s =>
//             s.subcategoryName?.toLowerCase() === subcategory.subcategoryName?.toLowerCase() ||
//             s.name?.toLowerCase() === subcategory.subcategoryName?.toLowerCase()
//           );
//           if (found) {
//             const id = found.subcategoryId || found.id;
//             if (id) setResolvedSubcatId(Number(id));
//           }
//         })
//         .catch(() => { });
//     }
//     // eslint-disable-next-line
//   }, [isDraft, draftSubcatId, category?.categoryId, subcategory?.subcategoryName]);

//   /* ── LOAD ITEMS whenever resolvedSubcatId is known ─────────────────────────
//    * This is the ONLY trigger for item loading.
//    * Works for both new tickets (resolvedSubcatId = subcategory.subcategoryId from preSelected)
//    * and draft edits (resolvedSubcatId resolved above).
//    * ─────────────────────────────────────────────────────────────────────────── */
//   const subcatIdForItems = preSelected ? (subcategory?.subcategoryId ? Number(subcategory.subcategoryId) : null) : resolvedSubcatId;

//   useEffect(() => {
//     if (!subcatIdForItems) { setItems([]); return; }
//     setItemsLoading(true);
//     masterApi.getItems(subcatIdForItems)
//       .then(d => {
//         const arr = (Array.isArray(d) ? d : []).map(i => ({ value: i.serviceId, label: i.serviceName }));

//         // setItems(arr);
//         // For draft: restore previously selected item
//         if (isDraft) {
//           const draftItemId = draftTicket?.itemId;
//           const draftItemName = draftTicket?.item;
//           const found = arr.find(i =>
//             (draftItemId && String(i.value) === String(draftItemId)) ||
//             (draftItemName && i.label?.toLowerCase() === draftItemName?.toLowerCase())
//           );
//           if (found) set('item', found);
//         }
//       })
//       // .catch(() => setItems([]))
//       .finally(() => setItemsLoading(false));
//     // eslint-disable-next-line
//   }, [subcatIdForItems]);

//   /* Auto-fill asset */
//   useEffect(() => {
//     if (!currentUser?.userId) return;
//     masterApi.getAssets(currentUser.id)
//       .then(d => {
//         const arr = Array.isArray(d) ? d : [];
//         if (arr.length > 0) set('asset', { value: arr[0].id, label: `${arr[0].assetName} (${arr[0].assetTag})` });
//       }).catch(() => { });
//     // eslint-disable-next-line
//   }, [currentUser?.userId]);

//   /* Restore other draft fields once priorities load */
//   useEffect(() => {
//     if (!isDraft || !priorities.length) return;
//     if (draftTicket.priorityId) {
//       const p = priorities.find(x => String(x.priorityId) === String(draftTicket.priorityId));
//       if (p) set('priority', { value: p.priorityId, label: p.priorityName });
//     }
//     if (draftTicket.location) set('location', { value: draftTicket.location, label: draftTicket.location });
//     if (draftTicket.mobileNumber) set('mobile', draftTicket.mobileNumber);
//     if (draftTicket.accessRequiredTill) set('accessTill', draftTicket.accessRequiredTill);
//     // eslint-disable-next-line
//   }, [isDraft, priorities.length]);

//   const validateDraft = () => {
//     // Draft can be saved with minimal data — no mandatory fields
//     setErrors({});
//     return true;
//   };

//   const validateSubmit = () => {
//     const e = {};
//     if (!form.projectId) e.projectId = 'Please select a project title';
//     if (!form.item) e.item = 'Item is required';
//     if (isOthersItem && !customItemDesc.trim()) e.item = 'Please describe your item requirement';
//     if (!form.location) e.location = 'Location is required';
//     if (!form.priority) e.priority = 'Priority is required';
//     if (!form.description || form.description.replace(/<[^>]+>/g, '').trim() === '') e.description = 'Description is required';
//     const mErr = validateMobile(form.mobile);
//     if (mErr) e.mobile = mErr;
//     if (showAccess && !form.accessTill) e.accessTill = 'Required for Git / SonarQube items';
//     setErrors(e);
//     return Object.keys(e).length === 0;
//   };

//   const buildPayload = () => ({
//     requestedById: currentUser?.userId,
//     requestedByName: userName,
//     projectId: form.projectId ? Number(form.projectId) : null,
//     categoryId: category?.categoryId ? Number(category.categoryId) : null,
//     subCategoryId: subcatIdForItems ? Number(subcatIdForItems) : null,
//     itemId: form.item?.value ? Number(form.item.value) : null,
//     priorityId: form.priority?.value ? Number(form.priority.value) : null,
//     assetId: form.asset?.value ? Number(form.asset.value) : null,
//     category: category?.categoryName || '',
//     subCategory: subcategory?.subcategoryName || '',
//     item: form.item?.label || '',
//     priority: form.priority?.label || '',
//     asset: form.asset?.label || '',
//     subject,
//     description: form.description,
//     location: form.location?.label || form.location?.value || '',
//     mobileNumber: form.mobile || null,
//     attachmentName: form.attachment?.name || null,
//     attachmentSizeBytes: form.attachment?.size || null,
//     accessRequiredTill: showAccess && form.accessTill ? form.accessTill : null,
//   });

//   const handleDraft = async () => {
//     if (!validateDraft()) return;
//     setLoading('draft');
//     try {
//       if (isDraft && draftTicket?.ticketId) {
//         await ticketApi.updateDraft(draftTicket.ticketId, buildPayload());
//         safeSnack('Draft updated', 'success');
//       } else {
//         await ticketApi.saveDraft(buildPayload());
//         safeSnack('Draft saved', 'success');
//       }
//       onBack();
//     } catch (e) { safeSnack(e.message || 'Failed', 'error'); }
//     finally { setLoading(false); }
//   };

//   const handleSubmit = async () => {
//     if (!validateSubmit()) { safeSnack('Please fill in all mandatory fields', 'error'); return; }
//     setLoading('submit');
//     try {
//       let t;
//       if (isDraft && draftTicket?.ticketId) {
//         // Try update+submit; if update fails (backend 500), just submit the existing draft
//         try {
//           await ticketApi.updateDraft(draftTicket.ticketId, buildPayload());
//         } catch (updateErr) {
//           console.warn('Draft update failed, submitting existing draft:', updateErr.message);
//         }
//         t = await ticketApi.submitDraft(draftTicket.ticketId);
//       } else {
//         t = await ticketApi.createAndSubmit(buildPayload());
//       }
//       safeSnack('Ticket submitted. Approval workflow triggered.', 'success');
//       safeSuccess(t);
//     } catch (e) { safeSnack(e.message || 'Submission failed', 'error'); }
//     finally { setLoading(false); }
//   };

//   const LOCATIONS = ['Bangalore', 'Mumbai', 'Delhi', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata', 'Noida', 'Gurgaon'];

//   return (
//     <div>
//       <div className="page-header">
//         <div className="page-header__breadcrumb">
//           <span onClick={onBack} style={{ cursor: 'pointer' }}>{isDraft ? 'My Tickets' : 'Service Catalog'}</span>
//           <span className="sep"> › </span>
//           <span>{isDraft ? `Edit Draft — ${draftTicket.ticketNumber || ''}` : subcategory?.subcategoryName || 'New Ticket'}</span>
//         </div>
//         <div className="page-header__title">
//           {isDraft ? `Edit Draft — ${draftTicket.ticketNumber || ''}` : category?.categoryName ? `${category.categoryName} — ${subcategory?.subcategoryName}` : 'New Ticket'}
//         </div>
//       </div>

//       <div className="card">
//         {/* Project + Category */}
//         <div className="two-col" style={{ marginBottom: 'var(--space-4)' }}>
//           <div className="form-group" style={{ marginBottom: 0 }}>
//             <label className="form-label">Project Title <span className="required">*</span></label>
//             <select className={`form-control${errors.projectId ? ' error' : ''}`} value={form.projectId} onChange={e => set('projectId', e.target.value)}>
//               <option value="">— Select Project —</option>
//               {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
//             </select>
//             {errors.projectId && <div className="form-error">{errors.projectId}</div>}
//           </div>
//           <div><div className="form-label">Category <span className="required">*</span></div><div className="readonly-field">{category.name || '—'}</div></div>
//         </div>

//         {/* Sub-Category + Item */}
//         <div className="two-col" style={{ marginBottom: 'var(--space-4)' }}>
//           <div><div className="form-label">Sub Category <span className="required">*</span></div><div className="readonly-field">{subcategory.name || '—'}</div></div>
//           <div className="form-group" style={{ marginBottom: 0 }}>
//             <label className="form-label">Item <span className="required">*</span></label>
//             {itemsLoading ? (
//               <div className="readonly-field">Loading items...</div>
//             ) : !subcategory.id ? (
//               <div className="readonly-field" style={{ color: 'var(--gray-4)' }}>
//                 {isDraft && category.name && subcategory.name ? 'Resolving sub-category...' : '— No sub-category —'}
//               </div>
//             ) : items.length === 0 ? (
//               <div className="readonly-field" style={{ color: 'var(--gray-4)' }}>No items found for this sub-category</div>
//             ) : (
//               <select
//                 className={`form-control${errors.item ? ' error' : ''}`}
//                 value={form.item ?? ''}
//                 onChange={e => { const f =  (e.target.value); set('item', f || null); form.item=f }}>
//                 <option value="" disabled>— Select Item —</option>
//                 {items.map(i => (<option key={i.value} value={i.name}>{i.name}</option>))}
//               </select>
//             )}
//             {errors.item && <div className="form-error">{errors.item}</div>}
//             {/* If user selects "Others", show a text field to describe their item */}
//             {isOthersItem && (
//               <div className="form-group" style={{ marginTop: 'var(--space-3)' }}>
//                 <label className="form-label">Describe your item <span className="required">*</span></label>
//                 <input className="form-control" value={customItemDesc} onChange={e => setCustomItemDesc(e.target.value)} placeholder="Describe what you need..." />
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Requester Details */}
//         <div className="section-title">Requester Details</div>
//         <div className="two-col" style={{ marginBottom: 'var(--space-4)' }}>
//           <div><div className="form-label">Requester Name <span className="required">*</span></div><div className="readonly-field">{userName || '—'}</div></div>
//           <div><div className="form-label">Employee ID</div><div className="readonly-field">{currentUser?.userId || '—'}</div></div>
//         </div>
//         <div style={{ marginBottom: 'var(--space-4)', fontSize: 13, color: 'var(--gray-5)' }}>Mode: Web Form</div>

//         {/* Ticket Details */}
//         <div className="section-title">Ticket Details</div>
//         <div className="form-group">
//           <div className="form-label">Subject <span className="required">*</span></div>
//           <div className="readonly-field" style={{ color: 'var(--gray-7)' }}>{subject || 'Auto-generated'}</div>
//         </div>
//         <div className="form-group">
//           <label className="form-label">Description <span className="required">*</span></label>
//           <RTE value={form.description} onChange={v => set('description', v)} error={errors.description} placeholder="Describe your request..." />
//         </div>

//         {/* Priority + Location */}
//         <div className="two-col">
//           <div className="form-group">
//             <label className="form-label">Priority <span className="required">*</span></label>
//             <select className={`form-control${errors.priority ? ' error' : ''}`} value={form.priority?.value ?? ''}
//               onChange={e => { const f = priorities.find(p => String(p.priorityId) === String(e.target.value)); set('priority', f ? { value: f.priorityId, label: f.priorityName } : null); }}>
//               <option value="" disabled>— Select Priority —</option>
//               {priorities.map(p => <option key={p.priorityId} value={p.priorityId}>{p.priorityName}</option>)}
//             </select>
//             {errors.priority && <div className="form-error">{errors.priority}</div>}
//           </div>
//           <div className="form-group">
//             <label className="form-label">Location <span className="required">*</span></label>
//             <select className={`form-control${errors.location ? ' error' : ''}`} value={form.location?.value ?? ''}
//               onChange={e => set('location', e.target.value ? { value: e.target.value, label: e.target.value } : null)}>
//               <option value="" disabled>— Select Location —</option>
//               {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
//             </select>
//             {errors.location && <div className="form-error">{errors.location}</div>}
//           </div>
//         </div>

//         {/* Mobile + Asset */}
//         <div className="two-col">
//           <div className="form-group">
//             <label className="form-label">Mobile Number <span className="required">*</span></label>
//             <input type="tel" className={`form-control${errors.mobile ? ' error' : ''}`} value={form.mobile}
//               onChange={e => set('mobile', e.target.value)} placeholder="10-digit mobile starting with 6/7/8/9" />
//             {errors.mobile && <div className="form-error">{errors.mobile}</div>}
//           </div>
//           <div className="form-group">
//             <label className="form-label">Asset (auto-filled from your profile)</label>
//             <div className="readonly-field">{form.asset?.label || 'No asset assigned'}</div>
//           </div>
//         </div>

//         {showAccess && (<>
//           <div className="alert alert--info">Access Required Till is mandatory for Git and SonarQube items.</div>
//           <div className="form-group">
//             <label className="form-label">Access Required Till <span className="required">*</span></label>
//             <input type="date" className={`form-control${errors.accessTill ? ' error' : ''}`} value={form.accessTill} onChange={e => set('accessTill', e.target.value)} />
//             {errors.accessTill && <div className="form-error">{errors.accessTill}</div>}
//           </div>
//         </>)}

//         <Uploader value={form.attachment} onChange={v => set('attachment', v)} />
//         <div className="divider" />
//         <div className="flex-end flex-gap-3">
//           <Button variant="ghost" onClick={onBack}>Cancel</Button>
//           <Button variant="secondary" onClick={handleDraft} loading={loading === 'draft'} disabled={!!loading && loading !== 'draft'}>
//             {isDraft ? 'Save Draft' : 'Save as Draft'}
//           </Button>
//           <Button variant="primary" onClick={handleSubmit} loading={loading === 'submit'} disabled={!!loading && loading !== 'submit'}>Submit</Button>
//         </div>
//       </div>
//     </div>
//   );
// }


import React, { useState, useEffect, useRef } from 'react';
import { masterApi, ticketApi } from '../../api/ourApi';
import { buildSubject, requiresAccessTill, validateMobile } from '../../utils/helpers';
import { Button, Spinner } from '../../components/UI';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getItemsBySubcategory } from '../../api/serviceCatalogApi';

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
    <div>
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
        <div ref={ref} className="rte-body" contentEditable suppressContentEditableWarning
          data-placeholder={placeholder || 'Describe your request in detail...'}
          onInput={() => onChange(ref.current?.innerHTML || '')} style={{ minHeight: 140 }} />
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

export default function CreateTicketPage({ preSelected, onSuccess, showSnack, onBack, draftTicket }) {
  const isDraft = !!draftTicket;
  const navigate = useNavigate();
  let { user } = useAuth();
  const { state } = useLocation();
  const { serviceType, category, subcategory } = state || {};

  const [currentUser, setCurrentUser] = useState('-');

  // const [me,setMe] = useState();
  useEffect(() => {
    let loadUser = async () => {
      let res = await userApi.getUserById(user.userId);
      console.log(res);
      setCurrentUser(res.data);
    }
    loadUser()
  }, [])
  const [items, setItems] = useState([]);
  const [touched, setTouched] = useState(false);
  const [itemError, setItemError] = useState('');

  useEffect(() => {
    if (!subcategory) navigate('/catalog');
  }, [subcategory, navigate]);

  useEffect(() => {
    if (!subcategory) return;
    getItemsBySubcategory(subcategory.id)
      .then(({ data }) => {
        // Normalize items to {value, label} shape
        const normalized = (Array.isArray(data) ? data : []).map(i => ({
          value: i.serviceId ?? i.id ?? i.value,
          label: i.serviceName ?? i.name ?? i.label,
        }));
        setItems(normalized);
      })
      .catch(() => console.error('Failed to load items'));
  }, [subcategory]);

  // Category — from preSelected (new ticket) or draft
  const category = preSelected?.category || (isDraft ? {
    categoryId: draftTicket.categoryId,
    categoryName: draftTicket.category,
  } : null);

  const safeSnack = (msg, type) => {
    if (typeof showSnack === 'function') {
      showSnack(msg, type);
    } else {
      console.log(`[${type}] ${msg}`);
    }
  };

  const safeSuccess = (data) => {
    if (typeof onSuccess === 'function') {
      onSuccess(data);
    } else {
      console.log('Success:', data);
      navigate('/tickets');
    }
  };

  // ── Subcategory resolution ──────────────────────────────────────────────────
  const draftSubcatId =
    draftTicket?.subCategoryId ||
    draftTicket?.subcategoryId ||
    draftTicket?.sub_category_id ||
    null;

  const subcategory = preSelected?.subCategory || (isDraft ? {
    subcategoryId: draftSubcatId ? Number(draftSubcatId) : null,
    subcategoryName: draftTicket.subCategory,
  } : null);

  const userName = currentUser?.fullName || [currentUser?.firstName, currentUser?.lastName].filter(Boolean).join(' ') || '';
  const subject = buildSubject(category?.name, subcategory?.name, userName);

  const [form, setForm] = useState({
    // FIX: item stored as {value, label} object (not a string)
    item: null,
    location: null, asset: null, priority: null,
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
  const [resolvedSubcatId, setResolvedSubcatId] = useState(
    subcategory?.subcategoryId ? Number(subcategory.subcategoryId) : null
  );

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const showAccess = requiresAccessTill(form.item?.label || '');
  const isOthersItem = form.item?.label?.toLowerCase() === 'others';

  /* Load priorities + projects once */
  useEffect(() => {
    masterApi.getPriorities().then(d => setPriorities(Array.isArray(d) ? d : [])).catch(() => { });
    masterApi.getProjects().then(d => setProjects(Array.isArray(d) ? d : [])).catch(() => { });
  }, []);

  /* ── SUBCATEGORY ID RESOLUTION ─────────────────────────────────────────────── */
  useEffect(() => {
    if (!isDraft) return;
    if (draftSubcatId) {
      setResolvedSubcatId(Number(draftSubcatId));
      return;
    }
    if (category?.categoryId && subcategory?.subcategoryName) {
      masterApi.getSubcategories(category.categoryId)
        .then(d => {
          const arr = Array.isArray(d) ? d : [];
          const found = arr.find(s =>
            s.subcategoryName?.toLowerCase() === subcategory.subcategoryName?.toLowerCase() ||
            s.name?.toLowerCase() === subcategory.subcategoryName?.toLowerCase()
          );
          if (found) {
            const id = found.subcategoryId || found.id;
            if (id) setResolvedSubcatId(Number(id));
          }
        })
        .catch(() => { });
    }
    // eslint-disable-next-line
  }, [isDraft, draftSubcatId, category?.categoryId, subcategory?.subcategoryName]);

  /* ── LOAD ITEMS whenever resolvedSubcatId is known ──────────────────────────── */
  const subcatIdForItems = preSelected ? (subcategory?.subcategoryId ? Number(subcategory.subcategoryId) : null) : resolvedSubcatId;

  useEffect(() => {
    if (!subcatIdForItems) { setItems([]); return; }
    setItemsLoading(true);
    masterApi.getItems(subcatIdForItems)
      .then(d => {
        // FIX: normalize all item shapes from masterApi to {value, label}
        const arr = (Array.isArray(d) ? d : []).map(i => ({
          value: i.serviceId ?? i.id ?? i.value,
          label: i.serviceName ?? i.name ?? i.label,
        }));
        setItems(arr);

        // For draft: restore previously selected item
        if (isDraft) {
          const draftItemId = draftTicket?.itemId;
          const draftItemName = draftTicket?.item;
          const found = arr.find(i =>
            (draftItemId && String(i.value) === String(draftItemId)) ||
            (draftItemName && i.label?.toLowerCase() === draftItemName?.toLowerCase())
          );
          if (found) set('item', found);
        }
      })
      .catch(() => setItems([]))
      .finally(() => setItemsLoading(false));
    // eslint-disable-next-line
  }, [subcatIdForItems]);

  /* Auto-fill asset */
  // useEffect(() => {
  //   if (!currentUser?.userId) return;
  //   masterApi.getAssets(currentUser.id)
  //     .then(d => {
  //       const arr = Array.isArray(d) ? d : [];
  //       if (arr.length > 0) set('asset', { value: arr[0].id, label: `${arr[0].assetName} (${arr[0].assetTag})` });
  //     }).catch(() => { });
  //   // eslint-disable-next-line
  // }, [currentUser?.userId]);


  /* Auto-fill asset */
  useEffect(() => {
    if (!currentUser?.id) return;
    masterApi.getAssets(currentUser.id)
      .then(arr => {
        if (arr.length > 0)
          set('asset', { value: arr[0].id, label: arr[0].assetTag });
      }).catch(() => { });
    // eslint-disable-next-line
  }, [currentUser?.id]);


  /* Restore other draft fields once priorities load */
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
    if (showAccess && !form.accessTill) e.accessTill = 'Required for Git / SonarQube items';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /**
   * FIX: buildPayload now correctly maps all fields the backend expects.
   *
   * Key fixes:
   *  - priority: send the ENUM string (MEDIUM/HIGH/LOW/CRITICAL) via `priority` field
   *  - priorityName: also send the label string for the backend's getEffectivePriority()
   *  - item: read from form.item.label (the service name string)
   *  - itemId: read from form.item.value (the integer ID)
   *  - typeId / typeName: pulled from serviceType (from router state)
   *  - mobileNumber: only sent if non-empty (backend validates pattern)
   */
  const buildPayload = () => {
    // Resolve priority enum value — backend Priority enum: LOW, MEDIUM, HIGH, CRITICAL
    const priorityLabel = form.priority?.label || '';
    const priorityEnum = priorityLabel.toUpperCase(); // e.g. "MEDIUM"

    return {
      // Requester
      requestedById: currentUser?.userId ? Number(currentUser.id) : null,
      requestedByName: userName,

      // Service hierarchy IDs
      typeId: serviceType?.id ? Number(serviceType.id) : null,
      typeName: serviceType?.name || null,
      categoryId: category?.categoryId ? Number(category.categoryId) : null,
      subCategoryId: subcatIdForItems ? Number(subcatIdForItems) : null,
      itemId: form.item?.value ? Number(form.item.value) : null,
      priorityId: form.priority?.value ? Number(form.priority.value) : null,
      assetId: form.asset?.value ? Number(form.asset.value) : null,
      projectId: form.projectId ? Number(form.projectId) : null,

      // Service hierarchy names (human-readable, stored on ticket)
      category: category?.categoryName || category?.name || '',
      subCategory: subcategory?.subcategoryName || subcategory?.name || '',
      item: isOthersItem && customItemDesc.trim()
        ? customItemDesc.trim()
        : (form.item?.label || ''),
      // FIX: send both `priority` (enum string) and `priorityName` (label)
      // Backend's getEffectivePriority() will use whichever is set.
      priority: priorityEnum || null,
      priorityName: priorityLabel || null,
      asset: form.asset?.label || '',

      // Ticket fields
      subject,
      description: form.description,
      location: form.location?.label || form.location?.value || '',
      mobileNumber: form.mobile || null,

      // Optional
      attachmentName: form.attachment?.name || null,
      attachmentSizeBytes: form.attachment?.size || null,
      accessRequiredTill: showAccess && form.accessTill ? form.accessTill : null,
    };
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
      onBack();
    } catch (e) { safeSnack(e.message || 'Failed', 'error'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async () => {
    setTouched(true);
    if (!validateSubmit()) { safeSnack('Please fill in all mandatory fields', 'error'); return; }
    setLoading('submit');
    try {
      let t;
      if (isDraft && draftTicket?.ticketId) {
        try {
          await ticketApi.updateDraft(draftTicket.ticketId, buildPayload());
        } catch (updateErr) {
          console.warn('Draft update failed, submitting existing draft:', updateErr.message);
        }
        t = await ticketApi.submitDraft(draftTicket.ticketId);
      } else {
        t = await ticketApi.createAndSubmit(buildPayload());
      }
      safeSnack('Ticket submitted. Approval workflow triggered.', 'success');
      safeSuccess(t);
    } catch (e) { safeSnack(e.message || 'Submission failed', 'error'); }
    finally { setLoading(false); }
  };

  const LOCATIONS = ['Bangalore', 'Mumbai', 'Delhi', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata', 'Noida', 'Gurgaon'];

  return (
    <div>
      <div className="page-header">
        <div className="page-header__breadcrumb">
          <span onClick={onBack} style={{ cursor: 'pointer' }}>{isDraft ? 'My Tickets' : 'Service Catalog'}</span>
          <span className="sep"> › </span>
          <span>{isDraft ? `Edit Draft — ${draftTicket.ticketNumber || ''}` : subcategory?.subcategoryName || 'New Ticket'}</span>
        </div>
        <div className="page-header__title">
          {isDraft ? `Edit Draft — ${draftTicket.ticketNumber || ''}` : category?.categoryName ? `${category.categoryName} — ${subcategory?.subcategoryName}` : 'New Ticket'}
        </div>
      </div>

      <div className="card">
        {/* Project + Category */}
        <div className="two-col" style={{ marginBottom: 'var(--space-4)' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Project Title <span className="required">*</span></label>
            <select className={`form-control${errors.projectId ? ' error' : ''}`} value={form.projectId} onChange={e => set('projectId', e.target.value)}>
              <option value="">— Select Project —</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            {errors.projectId && <div className="form-error">{errors.projectId}</div>}
          </div>
          <div>
            <div className="form-label">Category <span className="required">*</span></div>
            <div className="readonly-field">{category?.name || category?.categoryName || '—'}</div>
          </div>
        </div>

        {/* Sub-Category + Item */}
        <div className="two-col" style={{ marginBottom: 'var(--space-4)' }}>
          <div>
            <div className="form-label">Sub Category <span className="required">*</span></div>
            <div className="readonly-field">{subcategory?.name || subcategory?.subcategoryName || '—'}</div>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Item <span className="required">*</span></label>
            {itemsLoading ? (
              <div className="readonly-field">Loading items...</div>
            ) : !(subcategory?.id || subcatIdForItems) ? (
              <div className="readonly-field" style={{ color: 'var(--gray-4)' }}>
                {isDraft && category?.categoryName && subcategory?.subcategoryName ? 'Resolving sub-category...' : '— No sub-category —'}
              </div>
            ) : items.length === 0 ? (
              <div className="readonly-field" style={{ color: 'var(--gray-4)' }}>No items found for this sub-category</div>
            ) : (
              <select
                className={`form-control${errors.item ? ' error' : ''}`}
                // FIX: use form.item?.value (the ID) as the controlled value
                value={form.item?.value ?? ''}
                onChange={e => {
                  // FIX: find the full {value, label} item object by value (ID)
                  const selected = items.find(i => String(i.value) === String(e.target.value));
                  set('item', selected || null);
                }}
              >
                <option value="" disabled>— Select Item —</option>
                {/* FIX: use i.value as <option value> and i.label as display text */}
                {items.map(i => (
                  <option key={i.value} value={i.value}>{i.label}</option>
                ))}
              </select>
            )}
            {errors.item && <div className="form-error">{errors.item}</div>}
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
          <div><div className="form-label">Requester Name <span className="required">*</span></div><div className="readonly-field">{userName || '—'}</div></div>
          <div><div className="form-label">Employee ID</div><div className="readonly-field">{currentUser?.id || '—'}</div></div>
        </div>
        <div style={{ marginBottom: 'var(--space-4)', fontSize: 13, color: 'var(--gray-5)' }}>Mode: Web Form</div>

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
            <select
              className={`form-control${errors.priority ? ' error' : ''}`}
              value={form.priority?.value ?? ''}
              onChange={e => {
                const f = priorities.find(p => String(p.priorityId) === String(e.target.value));
                // FIX: store {value: priorityId, label: priorityName (UPPERCASE enum-compatible)}
                set('priority', f ? { value: f.priorityId, label: f.priorityName } : null);
              }}
            >
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
              {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            {errors.location && <div className="form-error">{errors.location}</div>}
          </div>
        </div>

        {/* Mobile + Asset */}
        <div className="two-col">
          <div className="form-group">
            <label className="form-label">Mobile Number <span className="required">*</span></label>
            <input type="tel" className={`form-control${errors.mobile ? ' error' : ''}`} value={form.mobile}
              onChange={e => set('mobile', e.target.value)} placeholder="10-digit mobile starting with 6/7/8/9" />
            {errors.mobile && <div className="form-error">{errors.mobile}</div>}
          </div>
          {/* <div className="form-group">
            <label className="form-label">Asset (auto-filled from your profile)</label>
            <div className="readonly-field">{form.asset?.label || 'No asset assigned'}</div>
          </div>*/}

          <div className="form-group">
            <label className="form-label">Asset Tag</label>
            <input
              className="form-control"
              value={form.asset?.label || ''}
              placeholder="No laptop assigned to your account"
              disabled
              style={{ backgroundColor: 'var(--gray-1)', cursor: 'not-allowed' }}
            />
          </div>


        </div>

        {showAccess && (<>
          <div className="alert alert--info">Access Required Till is mandatory for Git and SonarQube items.</div>
          <div className="form-group">
            <label className="form-label">Access Required Till <span className="required">*</span></label>
            <input type="date" className={`form-control${errors.accessTill ? ' error' : ''}`} value={form.accessTill} onChange={e => set('accessTill', e.target.value)} />
            {errors.accessTill && <div className="form-error">{errors.accessTill}</div>}
          </div>
        </>)}

        <Uploader value={form.attachment} onChange={v => set('attachment', v)} />
        <div className="divider" />
        <div className="flex-end flex-gap-3">
          <Button variant="ghost" onClick={onBack}>Cancel</Button>
          <Button variant="secondary" onClick={handleDraft} loading={loading === 'draft'} disabled={!!loading && loading !== 'draft'}>
            {isDraft ? 'Save Draft' : 'Save as Draft'}
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={loading === 'submit'} disabled={!!loading && loading !== 'submit'}>Submit</Button>
        </div>
      </div>
    </div>
  );
}

// import React, { useState, useRef, useEffect } from 'react';
// import { incidentApi } from '../api';
// import { Button, Spinner } from '../components/UI';

// /* ── Rich Text Editor (same as CreateTicketPage) ──────────────────────────── */
// function RTE({ value, onChange, error, placeholder }) {
//   const ref = useRef(null);
//   const initialized = useRef(false);
//   useEffect(() => {
//     if (ref.current && !initialized.current) {
//       ref.current.innerHTML = value || '';
//       initialized.current = true;
//     }
//   // eslint-disable-next-line
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
//           {[['B','bold','bold'],['I','italic','italic'],['U','underline','underline']].map(([l,c,cls]) => (
//             <button key={c} type="button" className={`rte-btn ${cls}`}
//               onMouseDown={e => { e.preventDefault(); exec(c); }}>{l}</button>
//           ))}
//           <div className="rte-divider"/>
//           <button type="button" className="rte-btn"
//             onMouseDown={e => { e.preventDefault(); exec('insertUnorderedList'); }}>Bullet List</button>
//           <button type="button" className="rte-btn"
//             onMouseDown={e => { e.preventDefault(); exec('insertOrderedList'); }}>Numbered List</button>
//           <div className="rte-divider"/>
//           <button type="button" className="rte-btn"
//             style={{ color:'var(--gray-5)', fontSize:11 }}
//             onMouseDown={e => { e.preventDefault(); exec('removeFormat'); }}>Clear</button>
//         </div>
//         <div ref={ref} className="rte-body" contentEditable suppressContentEditableWarning
//           data-placeholder={placeholder || 'Describe the incident in detail...'}
//           onInput={() => onChange(ref.current?.innerHTML || '')}
//           style={{ minHeight: 140 }}
//         />
//       </div>
//       {error && <div className="form-error">{error}</div>}
//     </div>
//   );
// }

// /* ── File Uploader ────────────────────────────────────────────────────────── */
// function Uploader({ value, onChange }) {
//   const [err, setErr] = useState('');
//   const [drag, setDrag] = useState(false);
//   const ref = useRef(null);
//   const EXTS = ['.jpg', '.jpeg', '.png', '.pdf', '.docx'];
//   const MAX = 30 * 1024 * 1024;
//   const handle = (file) => {
//     if (!file) return;
//     const ext = '.' + file.name.split('.').pop().toLowerCase();
//     if (!EXTS.includes(ext)) { setErr(`Invalid type. Allowed: ${EXTS.join(', ')}`); return; }
//     if (file.size > MAX) { setErr('Max 30 MB'); return; }
//     setErr('');
//     onChange({ name: file.name, size: file.size, file });
//   };
//   return (
//     <div className="form-group">
//       <label className="form-label">Attachment</label>
//       <div
//         className={`file-uploader${drag ? ' dragging' : ''}`}
//         onClick={() => ref.current?.click()}
//         onDragOver={e => { e.preventDefault(); setDrag(true); }}
//         onDragLeave={() => setDrag(false)}
//         onDrop={e => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files[0]); }}
//       >
//         <input ref={ref} type="file" accept={EXTS.join(',')}
//           style={{ display: 'none' }} onChange={e => handle(e.target.files[0])} />
//         <div className="file-uploader__icon">+</div>
//         {value
//           ? <><div className="file-uploader__selected">{value.name}</div>
//               <div className="file-uploader__sub">{(value.size / 1024 / 1024).toFixed(2)} MB</div></>
//           : <><div className="file-uploader__text">Drop file here or click to browse</div>
//               <div className="file-uploader__sub">Allowed: {EXTS.join(', ')} — Max 30 MB</div></>}
//       </div>
//       {err && <div className="form-error">{err}</div>}
//     </div>
//   );
// }

// /* ── Main Page ────────────────────────────────────────────────────────────── */
// export default function CreateIncidentPage({
//   preSelected,   // { category, subCategory, ticketType } from ServiceCatalogPage
//   onSuccess,     // called with IncidentResponse on submit
//   showSnack,
//   onBack,
//   currentUser,
// }) {
//   const category    = preSelected?.category;
//   const subcategory = preSelected?.subCategory;

//   const userName  = currentUser?.fullName ||
//     [currentUser?.firstName, currentUser?.lastName].filter(Boolean).join(' ') || '';
//   const userEmail = currentUser?.email || '';

//   const [form, setForm] = useState({
//     subject:         `Incident – ${category?.name || ''} / ${subcategory?.name || ''} – ${userName}`,
//     description:     '',
//     priority:        '',
//     breachByUser:    '',
//     occurredAt:      '',
//     source:          '',
//     incidentLocation:'',
//     officeLocation:  '',
//   });
//   const [attachment, setAttachment] = useState(null);
//   const [errors,     setErrors]     = useState({});
//   const [submitting, setSubmitting] = useState(false);

//   const set = (field) => (val) =>
//     setForm(f => ({ ...f, [field]: typeof val === 'object' && val?.target ? val.target.value : val }));

//   const validate = () => {
//     const e = {};
//     if (!form.subject.trim())          e.subject          = 'Subject is required';
//     if (!form.description.trim() || form.description === '<br>')
//                                        e.description      = 'Description is required';
//     if (!form.priority)                e.priority         = 'Priority is required';
//     if (!form.source)                  e.source           = 'Source is required';
//     return e;
//   };

//   const handleSubmit = async () => {
//     const e = validate();
//     if (Object.keys(e).length) { setErrors(e); return; }
//     setSubmitting(true);
//     try {
//       const payload = {
//         userId:          currentUser?.id,
//         requesterName:   userName,
//         email:           userEmail,
//         categoryId:      category?.categoryId,
//         subCategoryId:   subcategory?.subcategoryId,
//         name:    category?.name,
//         name: subcategory?.name,
//         subject:         form.subject,
//         description:     form.description,
//         priority:        form.priority,
//         breachByUser:    form.breachByUser || null,
//         occurredAt:      form.occurredAt   || null,
//         source:          form.source,
//         incidentLocation:form.incidentLocation || null,
//         officeLocation:  form.officeLocation   || null,
//         attachmentPath:  attachment?.name      || null,
//       };
//       const result = await incidentApi.createIncident(payload);
//       showSnack('Incident reported successfully!', 'success');
//       onSuccess(result);
//     } catch (err) {
//       showSnack(err.message || 'Failed to submit incident', 'error');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <div>
//       {/* ── Page Header ── */}
//       <div className="page-header">
//         <div className="page-header__breadcrumb">
//           <span className="breadcrumb-link" onClick={onBack} style={{ cursor:'pointer' }}>
//             Service Catalog
//           </span>
//           <span> › </span>
//           <span>{category?.name}</span>
//           <span> › </span>
//           <span>{subcategory?.name}</span>
//           <span> › </span>
//           <span>Report Incident</span>
//         </div>
//         <div className="page-header__title">Report an Incident</div>
//         <div className="page-header__sub">
//           Fill in the details below. Your incident will be assigned directly to a support person.
//         </div>
//       </div>

//       <div className="form-card">

//         {/* ── Read-only context banner ── */}
//         <div style={{
//           background: 'var(--accent-50, #f0f4ff)',
//           border: '1px solid var(--accent-200, #c7d7fc)',
//           borderRadius: 8,
//           padding: '12px 16px',
//           marginBottom: 24,
//           display: 'flex',
//           gap: 24,
//           flexWrap: 'wrap',
//           fontSize: 13,
//         }}>
//           <span><strong>Type:</strong> Incident</span>
//           <span><strong>Category:</strong> {category?.name}</span>
//           <span><strong>Sub-Category:</strong> {subcategory?.name}</span>
//           <span style={{ marginLeft: 'auto', color: 'var(--gray-5)' }}>
//             Status will be set to <strong>New</strong> automatically
//           </span>
//         </div>

//         <div className="form-grid">

//           {/* ── Requester Name (auto-filled, read-only) ── */}
//           <div className="form-group">
//             <label className="form-label">Requester Name</label>
//             <input className="form-input" value={userName} readOnly
//               style={{ background: 'var(--gray-1)', color: 'var(--gray-6)' }} />
//           </div>

//           {/* ── Email (auto-filled, read-only) ── */}
//           <div className="form-group">
//             <label className="form-label">Email</label>
//             <input className="form-input" value={userEmail} readOnly
//               style={{ background: 'var(--gray-1)', color: 'var(--gray-6)' }} />
//           </div>

//           {/* ── Subject ── */}
//           <div className="form-group form-group--full">
//             <label className="form-label">Subject <span className="required">*</span></label>
//             <input
//               className={`form-input${errors.subject ? ' error' : ''}`}
//               value={form.subject}
//               onChange={set('subject')}
//               placeholder="Brief summary of the incident"
//             />
//             {errors.subject && <div className="form-error">{errors.subject}</div>}
//           </div>

//           {/* ── Priority ── */}
//           <div className="form-group">
//             <label className="form-label">Priority <span className="required">*</span></label>
//             <select
//               className={`form-input${errors.priority ? ' error' : ''}`}
//               value={form.priority}
//               onChange={set('priority')}
//             >
//               <option value="">Select priority</option>
//               <option value="High">High</option>
//               <option value="Medium">Medium</option>
//               <option value="Low">Low</option>
//             </select>
//             {errors.priority && <div className="form-error">{errors.priority}</div>}
//           </div>

//           {/* ── Source ── */}
//           <div className="form-group">
//             <label className="form-label">Source <span className="required">*</span></label>
//             <select
//               className={`form-input${errors.source ? ' error' : ''}`}
//               value={form.source}
//               onChange={set('source')}
//             >
//               <option value="">Select source</option>
//               <option value="Internal">Internal</option>
//               <option value="External">External</option>
//             </select>
//             {errors.source && <div className="form-error">{errors.source}</div>}
//           </div>

//           {/* ── Occurred At ── */}
//           <div className="form-group">
//             <label className="form-label">Occurred At (Date &amp; Time)</label>
//             <input
//               type="datetime-local"
//               className="form-input"
//               value={form.occurredAt}
//               onChange={set('occurredAt')}
//             />
//           </div>

//           {/* ── Breach By User ── */}
//           <div className="form-group">
//             <label className="form-label">Breach By User</label>
//             <input
//               className="form-input"
//               value={form.breachByUser}
//               onChange={set('breachByUser')}
//               placeholder="Name or ID of the user who caused the breach"
//             />
//           </div>

//           {/* ── Incident Location ── */}
//           <div className="form-group">
//             <label className="form-label">Incident Location</label>
//             <input
//               className="form-input"
//               value={form.incidentLocation}
//               onChange={set('incidentLocation')}
//               placeholder="e.g. Floor 3, Server Room, Remote"
//             />
//           </div>

//           {/* ── Office Location ── */}
//           <div className="form-group">
//             <label className="form-label">Office Location</label>
//             <input
//               className="form-input"
//               value={form.officeLocation}
//               onChange={set('officeLocation')}
//               placeholder="e.g. HQ, Branch A, Colombo"
//             />
//           </div>

//           {/* ── Description (full width) ── */}
//           <div className="form-group form-group--full">
//             <label className="form-label">Description <span className="required">*</span></label>
//             <RTE
//               value={form.description}
//               onChange={set('description')}
//               error={errors.description}
//               placeholder="Describe the incident — what happened, impact, steps to reproduce..."
//             />
//           </div>

//           {/* ── Attachment ── */}
//           <div className="form-group form-group--full">
//             <Uploader value={attachment} onChange={setAttachment} />
//           </div>

//         </div>{/* /form-grid */}

//         {/* ── Actions ── */}
//         <div className="form-actions">
//           <Button variant="secondary" onClick={onBack} disabled={submitting}>
//             Back
//           </Button>
//           <Button variant="primary" onClick={handleSubmit} disabled={submitting}>
//             {submitting ? <Spinner size="sm" /> : 'Submit Incident'}
//           </Button>
//         </div>

//       </div>{/* /form-card */}
//     </div>
//   );
// }





import React, { useState, useRef, useEffect } from 'react';
import { incidentApi } from '../../api'
import { Button, Spinner } from '../../components/itsm/UI';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { tokenUtils } from '../../utils/tokenUtils';
import { userApi } from '../../api/userApi';
import { toast } from 'react-toastify';

/* ─────────────────────────────────────────────────────────────────────────────
   RTE  — identical to CreateTicketPage
───────────────────────────────────────────────────────────────────────────── */
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
        <div ref={ref} className="rte-body" contentEditable suppressContentEditableWarning
          data-placeholder={placeholder || 'Describe the incident in detail...'}
          onInput={() => onChange(ref.current?.innerHTML || '')}
          style={{ minHeight: 140 }} />
      </div>
      {error && <div className="form-error">{error}</div>}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   UPLOADER  — identical to CreateTicketPage
───────────────────────────────────────────────────────────────────────────── */
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
    onChange({ name: file.name, size: file.size, file });
  };

  return (
    <div className="form-group">
      <label className="form-label">Attachments</label>
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
      {err && <div className="form-error">{err}</div>}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN PAGE
   ───────────────────────────────────────────────────────────────────────────── */
export default function CreateIncidentPage({
  preSelected,   // { category, subCategory, ticketType }
  onSuccess,
  showSnack,
  onBack
}) {

  const {user} = useAuth();
  const [currentUser,setCurrentUser]= useState();

  // const [me,setMe] = useState();
  useEffect(() => {
    let loadUser=async()=>{
      let res=await userApi.getUserById(user.userId);
      // console.log(res);
      setCurrentUser(res.data);
    }
    loadUser()
  }, [])

  const { state } = useLocation();
  const { serviceType, category, subcategory } = state || {};
  const userName = currentUser?.fullName ||
    [currentUser?.firstName, currentUser?.lastName].filter(Boolean).join(' ') || '';
  const userEmail = currentUser?.email || '';

  const autoSubject = `${category?.name || ''} | ${subcategory?.name || ''} | ${userName}`;

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
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

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
      const payload = {
        userId: currentUser?.id,
        requesterName: userName,
        email: userEmail,
        categoryId: category?.id,
        subCategoryId: subcategory?.id,
        categoryName: category?.name,
        subCategoryName: subcategory?.name,
        subject: autoSubject,
        description: form.description,
        priority: form.priority,
        source: form.source,
        breachByUser: form.breachByUser || null,
        occurredAt: form.occurredAt || null,
        incidentLocation: form.incidentLocation || null,
        officeLocation: form.officeLocation || null,
        attachmentPath: attachment?.name || null,
      };
      
      const result = await incidentApi.createIncident(payload);
      // showSnack('Incident reported successfully!', 'success'); 
      // onSuccess(result);
      toast.success('Incident reported successfully!');
    } catch (err) {
      console.log(err);
      
      // showSnack(err.message || 'Failed to submit incident', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>

      {/* ── Page Header ── */}
      <div className="page-header">
        <div className="page-header__breadcrumb">
          <span onClick={onBack} style={{ cursor: 'pointer' }}>Service Catalog</span>
          <span className="sep"> › </span>
          <span>{category?.name}</span>
          <span className="sep"> › </span>
          <span>{subcategory?.name}</span>
        </div>
        <div className="page-header__title">
          {category?.name} — {subcategory?.name}
        </div>
      </div>

      <div className="card">

        {/* ── Category + Sub Category (read-only) ── */}
        <div className="two-col" style={{ marginBottom: 'var(--space-4)' }}>
          <div>
            <div className="form-label">Category <span className="required">*</span></div>
            <div className="readonly-field">{category?.name || '—'}</div>
          </div>
          <div>
            <div className="form-label">Sub Category <span className="required">*</span></div>
            <div className="readonly-field">{subcategory?.name || '—'}</div>
          </div>
        </div>

        {/* ── Requester Details ── */}
        <div className="section-title">Requester Details</div>
        <div className="two-col" style={{ marginBottom: 'var(--space-4)' }}>
          <div>
            <div className="form-label">Requester Name <span className="required">*</span></div>
            <div className="readonly-field">{userName || '—'}</div>
          </div>
          <div>
            <div className="form-label">Employee ID</div>
            <div className="readonly-field">{currentUser?.employeeId || '—'}</div>
          </div>
        </div>
        <div style={{ marginBottom: 'var(--space-4)', fontSize: 13, color: 'var(--gray-5)' }}>
          Mode: Web Form
        </div>

        {/* ── Ticket Details ── */}
        <div className="section-title">Ticket Details</div>

        {/* Subject (auto-generated, read-only) */}
        <div className="form-group">
          <div className="form-label">Subject <span className="required">*</span></div>
          <div className="readonly-field" style={{ color: 'var(--gray-7)' }}>
            {autoSubject || 'Auto-generated'}
          </div>
        </div>

        {/* Description (RTE) */}
        <div className="form-group">
          <label className="form-label">Description <span className="required">*</span></label>
          <RTE
            value={form.description}
            onChange={v => set('description', v)}
            error={errors.description}
            placeholder="Describe your request..."
          />
        </div>

        {/* Priority + Source */}
        <div className="two-col">
          <div className="form-group">
            <label className="form-label">Priority <span className="required">*</span></label>
            <select
              className={`form-control${errors.priority ? ' error' : ''}`}
              value={form.priority}
              onChange={e => set('priority', e.target.value)}
            >
              <option value="" disabled>— Select Priority —</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            {errors.priority && <div className="form-error">{errors.priority}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Source <span className="required">*</span></label>
            <select
              className={`form-control${errors.source ? ' error' : ''}`}
              value={form.source}
              onChange={e => set('source', e.target.value)}
            >
              <option value="" disabled>— Select Source —</option>
              <option value="Internal">Internal</option>
              <option value="External">External</option>
            </select>
            {errors.source && <div className="form-error">{errors.source}</div>}
          </div>
        </div>

        {/* Occurred At + Breach By User */}
        <div className="two-col">
          <div className="form-group">
            <label className="form-label">Occurred At (Date &amp; Time)</label>
            <input
              type="datetime-local"
              className="form-control"
              value={form.occurredAt}
              onChange={e => set('occurredAt', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Breach By User</label>
            <input
              className="form-control"
              value={form.breachByUser}
              onChange={e => set('breachByUser', e.target.value)}
              placeholder="Name or ID of the user"
            />
          </div>
        </div>

        {/* Incident Location + Office Location */}
        <div className="two-col">
          <div className="form-group">
            <label className="form-label">Incident Location</label>
            <input
              className="form-control"
              value={form.incidentLocation}
              onChange={e => set('incidentLocation', e.target.value)}
              placeholder="e.g. Floor 3, Server Room"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Office Location</label>
            <input
              className="form-control"
              value={form.officeLocation}
              onChange={e => set('officeLocation', e.target.value)}
              placeholder="e.g. HQ, Branch A"
            />
          </div>
        </div>

        {/* Attachments */}
        <Uploader value={attachment} onChange={setAttachment} />

        {/* ── Actions ── */}
        <div className="divider" />
        <div className="flex-end flex-gap-3">
          <Button variant="ghost" onClick={onBack} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={loading}
            disabled={loading}
          >
            Submit Incident
          </Button>
        </div>

      </div>{/* /card */}
    </div>
  );
}

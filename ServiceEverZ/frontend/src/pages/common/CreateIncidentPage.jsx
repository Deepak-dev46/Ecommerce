import React, { useState, useRef, useEffect } from 'react';
import { incidentApi } from '../../api';
import { Button } from '../../components/itsm/UI';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { userApi } from '../../api/userApi';
import { getAllLocations } from '../../api/LocationApi';
import toast from 'react-hot-toast';

/* ── Inline styles — mirrors CreateTicketPage ct-* system ────────────────── */
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
  .ci-page-header { text-align: left !important; }
  .ci-page-header .page-header__breadcrumb,
  .ci-page-header .page-header__title,
  .ci-page-header .page-header__sub {
    text-align: left !important;
    justify-content: flex-start !important;
  }
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

/* ── Field wrapper — identical pattern to CreateTicketPage ──────────────── */
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

/* ── Main Page ───────────────────────────────────────────────────────────── */
export default function CreateIncidentPage({ onSuccess, showSnack, onBack }) {
  const { user } = useAuth();
  const { state } = useLocation();
  const { category, subcategory } = state || {};

  const location = useLocation();
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);

  // ── Fetch logged-in user details ────────────────────────────────────────
  useEffect(() => {
    userApi.getUserById(user.userId)
      .then(res => setCurrentUser(res.data))
      .catch(() => { });
  }, [user.userId]);

  // ── Fetch locations from DB (same as OurCreateTicketPage) ───────────────
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    getAllLocations()
      .then(res => {
        const arr = Array.isArray(res?.data) ? res.data
          : Array.isArray(res) ? res : [];
        setLocations(arr);
      })
      .catch(() => {
        // Fallback list if API is unavailable
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

  // ── Fetch all users for Breach By User dropdown ─────────────────────────
  const [allUsers, setAllUsers] = useState([]);

  // useEffect(() => {
  //   userApi.getAllUsers()
  //     .then(res => {
  //       const arr = Array.isArray(res?.data) ? res.data
  //         : Array.isArray(res) ? res : [];
  //       setAllUsers(arr);
  //     })
  //     .catch(() => {
  //       setAllUsers([]);
  //     });
  // }, []);

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

  // ── Auto-generated subject (read-only) ──────────────────────────────────
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
  const [breachUserSearch, setBreachUserSearch] = useState('');
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

  return (
    <>
      <StyleInjector />

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

        {/* ── Section: Category Info ── */}
        <div className="ci-section-title-block">Category</div>
        <div className="ci-form-grid">
          <Field label="Category" required>
            <div className="ci-readonly-field">{category?.name || '—'}</div>
          </Field>
          <Field label="Sub Category" required>
            <div className="ci-readonly-field">{subcategory?.name || '—'}</div>
          </Field>
        </div>

        {/* ── Section: Requester Details ── */}
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

        {/* ── Section: Incident Details ── */}
        <div className="ci-section-title-block">Incident Details</div>

        {/* Subject — auto-generated, full width */}
        <Field label="Subject" required>
          <div className="ci-readonly-field" style={{ color: 'var(--gray-7)' }}>
            {autoSubject || 'Auto-generated'}
          </div>
        </Field>

        {/* Description — full width RTE */}
        <Field label="Description" required error={errors.description}>
          <RTE
            value={form.description}
            onChange={v => set('description', v)}
            error={errors.description}
            placeholder="Describe the incident — what happened, impact, steps to reproduce..."
          />
        </Field>

        {/* Priority + Source */}
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

        {/* ── Section: Additional Info ── */}
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

          {/* ── Breach By User — dropdown from user table ── */}
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

          {/* ── Incident Location — dropdown from location DB ── */}
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

        {/* ── Actions ── */}
        <div className="divider" style={{ margin: '8px 0' }} />
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
    </>
  );
}
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { masterApi, ticketApi } from '../../api/ourApi';
import { userApi } from '../../api/userApi';
import { getItemsBySubcategory } from '../../api/serviceCatalogApi';
import { buildSubject, requiresAccessTill, validateMobile } from '../../utils/helpers';
import { Button } from '../../components/itsm/UI';
import toast from 'react-hot-toast';
import CreateRequestPage from '../service-catalog/Sprint2/CreateRequestPage';
 
const MODES = { NONE: 'NONE', MYSELF: 'MYSELF', EMPLOYEE: 'EMPLOYEE' };
 
const TYPE_OPTIONS = [
  { value: 'CALL', label: 'Call' },
  { value: 'CHAT', label: 'Chat' },
  { value: 'WEB_FORM', label: 'Web Form' },
  { value: 'EMAIL', label: 'Email' },
];
 
const LOCATIONS = [
  'Bangalore', 'Mumbai', 'Delhi', 'Chennai', 'Hyderabad',
  'Pune', 'Kolkata', 'Noida', 'Gurgaon',
];
 
/* ── Inline RTE (same as CreateTicketPage) ───────────────────── */
function RTE({ value, onChange, error, placeholder }) {
  const ref = useRef(null);
  const initialized = useRef(false);
  useEffect(() => {
    if (ref.current && !initialized.current) {
      ref.current.innerHTML = value || '';
      initialized.current = true;
    }
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
          <div className="rte-divider" />
          <button type="button" className="rte-btn"
            style={{ color: 'var(--gray-5)', fontSize: 11 }}
            onMouseDown={e => { e.preventDefault(); exec('removeFormat'); }}>Clear</button>
        </div>
        <div ref={ref} className="rte-body" contentEditable suppressContentEditableWarning
          data-placeholder={placeholder || 'Describe the issue in detail...'}
          onInput={() => onChange(ref.current?.innerHTML || '')}
          style={{ minHeight: 120 }} />
      </div>
      {error && <div className="form-error">{error}</div>}
    </div>
  );
}
 
/* ── Modal shell ─────────────────────────────────────────────── */
export default function SupportCreateTicketModal({ open, onClose }) {
  const [mode, setMode] = useState(MODES.NONE);
  const navigate = useNavigate();
  if (!open) return null;
 
  const handleClose = () => { setMode(MODES.NONE); onClose(); };
 
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 2000, display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
      background: 'rgba(0,0,0,0.45)',
    }} onClick={handleClose}>
      <div style={{
        background: 'var(--surface)', borderRadius: 14,
        boxShadow: '0 28px 64px rgba(0,0,0,0.28)',
        width: '90%', maxWidth: mode === MODES.NONE ? 560 : 740,
        maxHeight: '92vh', overflowY: 'auto', padding: 0,
        transition: 'max-width 0.2s',
      }} onClick={e => e.stopPropagation()}>
 
        {/* Header */}
        <div style={{
          padding: '20px 24px 16px', borderBottom: '1px solid var(--gray-1)',
          position: 'sticky', top: 0, background: 'var(--surface)', zIndex: 1,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ fontWeight: 700, fontSize: 17, color: 'var(--primary-900)' }}>
            {mode === MODES.NONE ? 'Create Ticket' :
              mode === MODES.MYSELF ? 'Create Ticket — For Myself' :
                'Create Ticket — For Employee'}
          </div>
          <button onClick={handleClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 24, color: 'var(--gray-5)', lineHeight: 1
            }}>×</button>
        </div>
 
        <div style={{ padding: '24px' }}>
          {mode === MODES.NONE && <ModeSelector onSelect={setMode} />}
          {mode === MODES.MYSELF && <MyselfForm mode={'ME'} onClose={handleClose} />}
          {mode === MODES.EMPLOYEE && <MyselfForm mode={'USER'} onClose={handleClose} />}
        </div>
      </div>
    </div>
  );
}
 
/* ── Mode selector ───────────────────────────────────────────── */
function ModeSelector({ onSelect }) {
  return (
    <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
      <ModeCard icon="🙋" title="For Myself"
        desc="Raise a ticket for an issue you are personally experiencing"
        onClick={() => onSelect(MODES.MYSELF)} />
      <ModeCard icon="👥" title="For Employee"
        desc="Raise a ticket on behalf of another employee (call / chat / email)"
        onClick={() => onSelect(MODES.EMPLOYEE)} />
    </div>
  );
}
 
function ModeCard({ icon, title, desc, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        flex: 1, padding: '28px 20px', borderRadius: 12, cursor: 'pointer',
        border: `2px solid ${hov ? 'var(--primary-600)' : 'var(--gray-2)'}`,
        background: hov ? 'var(--primary-50)' : 'var(--surface)',
        textAlign: 'center', transition: 'all 0.15s',
      }}>
      <div style={{ fontSize: 36, marginBottom: 10 }}>{icon}</div>
      <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--primary-900)', marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 12, color: 'var(--gray-5)', lineHeight: 1.5 }}>{desc}</div>
    </button>
  );
}
 
/* ── MYSELF FORM ─────────────────────────────────────────────── */
function MyselfForm({ mode, onClose }) {
  const navigate = useNavigate();
  if (mode !== 'USER') {
    return (
      <div style={{ textAlign: 'center', padding: '16px 0' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🙋</div>
        <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 8, color: 'var(--primary-900)' }}>
          Raise a ticket for Yourself
        </div>
        <div style={{ fontSize: 13, color: 'var(--gray-5)', marginBottom: 24, lineHeight: 1.6 }}>
          You will be taken to the Service Catalog to select a category.<br />
          The ticket goes through the normal L1 → L2 → Support flow.<br />
          You will <strong>not</strong> be auto-assigned your own ticket.
        </div>
        <button className="btn btn--primary" onClick={() => {
          onClose();
          navigate('/support/service-catalog', { state: { selfRaised: true } });
        }}>
          Continue to Service Catalog →
        </button>
      </div>
    );
  } else {
    return (
      <div style={{ textAlign: 'center', padding: '16px 0' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>👥</div>
        <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 8, color: 'var(--primary-900)' }}>
          Raise a ticket for Other User
        </div>
        <div style={{ fontSize: 13, color: 'var(--gray-5)', marginBottom: 24, lineHeight: 1.6 }}>
          You will be taken to the Service Catalog to select a category.<br />
          The ticket goes through the normal L1 → L2 → Support flow.<br />
          You will <strong>not</strong> be auto-assigned your own ticket.
        </div>
        <button className="btn btn--primary" onClick={() => {
          onClose();
          navigate('/support/service-catalog', { state: { selfRaised: true } });
        }}>
          Continue to Service Catalog →
        </button>
      </div>
    );
  }
}
 
/* ── EMPLOYEE FORM ───────────────────────────────────────────── */
function EmployeeForm({ onClose }) {
  const { user } = useAuth();
 
  /* Service hierarchy state */
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [items, setItems] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [projects, setProjects] = useState([]);
 
  /* Requester search */
  const [userSearch, setUserSearch] = useState('');
  const [userResults, setUserResults] = useState([]);
  const [userSearching, setUserSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef(null);
 
  /* Form */
  const [form, setForm] = useState({
    type: '', categoryId: '', subcategoryId: '', item: null,
    priorityId: '', projectId: '', location: '', mobile: '',
    description: '', asset: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
 
  /* Load master data */
  useEffect(() => {
    masterApi.getCategories().then(d => setCategories(Array.isArray(d) ? d : [])).catch(() => { });
    masterApi.getPriorities().then(d => setPriorities(Array.isArray(d) ? d : [])).catch(() => { });
    masterApi.getProjects().then(d => setProjects(Array.isArray(d) ? d : [])).catch(() => { });
  }, []);
 
  /* Subcategories when category changes */
  useEffect(() => {
    if (!form.categoryId) { setSubcategories([]); return; }
    masterApi.getSubcategories(form.categoryId)
      .then(d => setSubcategories(Array.isArray(d) ? d : [])).catch(() => { });
    setForm(f => ({ ...f, subcategoryId: '', item: null }));
  }, [form.categoryId]);
 
  /* Items when subcategory changes */
  useEffect(() => {
    if (!form.subcategoryId) { setItems([]); return; }
    getItemsBySubcategory(form.subcategoryId)
      .then(res => {
        const data = res?.data || res || [];
        const arr = (Array.isArray(data) ? data : []).map(i => ({
          value: i.serviceId ?? i.id ?? i.value,
          label: i.serviceName ?? i.name ?? i.label,
        }));
        setItems(arr);
      }).catch(() => { });
    setForm(f => ({ ...f, item: null }));
  }, [form.subcategoryId]);
 
  /* Debounced user search */
  const searchUsers = useCallback((q) => {
    if (!q || q.length < 2) { setUserResults([]); setShowDropdown(false); return; }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setUserSearching(true);
      try {
        /* Try /api/v1/admin/users?search=q first; fall back to rmoApi /users */
        let arr = [];
        try {
          const res = await userApi.searchByName(q);
          arr = Array.isArray(res) ? res
            : Array.isArray(res?.data?.content) ? res.data.content
              : Array.isArray(res?.data) ? res.data : [];
        } catch {
          /* fallback: get all from RMO and filter client-side */
          const { rmoApi } = await import('../../api/rmoApi');
          const res = await rmoApi.getUsers();
          const all = Array.isArray(res?.data) ? res.data : [];
          arr = all.filter(u => {
            const name = (u.fullName || `${u.firstName || ''} ${u.lastName || ''}`).toLowerCase();
            return name.includes(q.toLowerCase());
          });
        }
        setUserResults(arr.slice(0, 10));
        setShowDropdown(arr.length > 0);
      } catch { setUserResults([]); setShowDropdown(false); }
      finally { setUserSearching(false); }
    }, 300);
  }, []);
 
  const selectUser = async (u) => {
    setSelectedUser(u);
    const name = u.fullName || `${u.firstName || ''} ${u.lastName || ''}`.trim();
    setUserSearch(name);
    setShowDropdown(false);
    /* Auto-fetch asset */
    try {
      const uid = u.id || u.userId;
      const assets = await masterApi.getAssets(uid);
      const arr = Array.isArray(assets) ? assets : [];
      if (arr.length > 0)
        setForm(f => ({ ...f, asset: `${arr[0].assetName || ''} (${arr[0].assetTag || ''})` }));
    } catch { }
  };
 
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
 
  const validate = () => {
    const e = {};
    if (!form.type) e.type = 'Type is required';
    if (!selectedUser) e.requester = 'Select a requester';
    if (!form.projectId) e.projectId = 'Project is required';
    if (!form.categoryId) e.categoryId = 'Category is required';
    if (!form.subcategoryId) e.subcategoryId = 'Sub-category is required';
    if (!form.item) e.item = 'Item is required';
    if (!form.priorityId) e.priorityId = 'Priority is required';
    if (!form.location) e.location = 'Location is required';
    const mErr = validateMobile(form.mobile);
    if (mErr) e.mobile = mErr;
    if (!form.description || form.description.replace(/<[^>]+>/g, '').trim() === '')
      e.description = 'Description is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };
 
  const handleSubmit = async () => {
    if (!validate()) { toast.error('Please fill all mandatory fields'); return; }
    setSubmitting(true);
    try {
      const cat = categories.find(c => String(c.id) === String(form.categoryId));
      const sub = subcategories.find(s => String(s.id) === String(form.subcategoryId));
      const pri = priorities.find(p => String(p.priorityId) === String(form.priorityId));
      const uid = selectedUser?.id || selectedUser?.userId;
      const requesterName = userSearch;
      const subject = buildSubject(
        cat?.name || cat?.categoryName,
        sub?.name || sub?.subcategoryName,
        requesterName);
 
      const payload = {
        requestedById: uid,
        requestedByName: requesterName,
        projectId: Number(form.projectId),
        categoryId: Number(form.categoryId),
        category: cat?.name || cat?.categoryName || '',
        subCategoryId: Number(form.subcategoryId),
        subCategory: sub?.name || sub?.subcategoryName || '',
        itemId: form.item?.value ? Number(form.item.value) : null,
        item: form.item?.label || '',
        priorityId: Number(form.priorityId),
        priority: pri?.priorityName?.toUpperCase() || '',
        priorityName: pri?.priorityName || '',
        subject,
        description: form.description,
        location: form.location,
        mobileNumber: form.mobile,
        asset: form.asset || null,
        mode: form.type,
        // Tell ticket-service this was raised by support on behalf of employee
        raisedBySupportId: user?.userId,
      };
 
      await ticketApi.createAndSubmit(payload);
      toast.success('Ticket raised for employee successfully!');
      onClose();
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };
 
  /* Field helpers */
  const fc = (key) => `form-control${errors[key] ? ' error' : ''}`;
  const fg = { marginBottom: 14 };
  const lbl = (txt, req) => (
    <label className="form-label" style={{ display: 'block', marginBottom: 4 }}>
      {txt}{req && <span className="required"> *</span>}
    </label>
  );
  const err = (key) => errors[key] && <div className="form-error">{errors[key]}</div>;
  const two = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 };
 
  return (
    <div>
      {/* Type */}
      <div style={fg}>
        {lbl('Type / Channel', true)}
        <select className={fc('type')} value={form.type} onChange={e => set('type', e.target.value)}>
          <option value="">— Select Type —</option>
          {TYPE_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        {err('type')}
      </div>
 
      {/* Requester search */}
      <div style={{ ...fg, position: 'relative' }}>
        {lbl('Requester Name', true)}
        <input className={fc('requester')} value={userSearch} autoComplete="off"
          placeholder="Search employee name..."
          onChange={e => { setUserSearch(e.target.value); searchUsers(e.target.value); setSelectedUser(null); }} />
        {err('requester')}
        {userSearching && <div style={{ fontSize: 11, color: 'var(--gray-5)', marginTop: 2 }}>Searching...</div>}
        {showDropdown && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 200,
            background: 'var(--surface)', border: '1px solid var(--gray-2)',
            borderRadius: 6, boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            maxHeight: 200, overflowY: 'auto',
          }}>
            {userResults.map((u, i) => {
              const name = u.fullName || `${u.firstName || ''} ${u.lastName || ''}`.trim();
              return (
                <div key={i} onClick={() => selectUser(u)}
                  style={{
                    padding: '8px 12px', cursor: 'pointer', fontSize: 13,
                    borderBottom: '1px solid var(--gray-1)'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-50)'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <div style={{ fontWeight: 600 }}>{name}</div>
                  <div style={{ fontSize: 11, color: 'var(--gray-5)' }}>
                    {u.email || ''} · ID: {u.id || u.userId || '—'}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
 
      {/* Employee ID + Asset (auto-filled) */}
      <div style={two}>
        <div>
          {lbl('Employee ID')}
          <div className="readonly-field">
            {selectedUser ? (selectedUser.id || selectedUser.userId || '—') : '—'}
          </div>
        </div>
        <div>
          {lbl('Asset (auto-fetched)')}
          <div className="readonly-field">{form.asset || (selectedUser ? 'No asset assigned' : 'Select requester first')}</div>
        </div>
      </div>
 
      {/* Project + Category */}
      <div style={two}>
        <div>
          {lbl('Project', true)}
          <select className={fc('projectId')} value={form.projectId} onChange={e => set('projectId', e.target.value)}>
            <option value="">— Select Project —</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.projectName || p.name}</option>)}
          </select>
          {err('projectId')}
        </div>
        <div>
          {lbl('Category', true)}
          <select className={fc('categoryId')} value={form.categoryId} onChange={e => set('categoryId', e.target.value)}>
            <option value="">— Select Category —</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name || c.categoryName}</option>)}
          </select>
          {err('categoryId')}
        </div>
      </div>
 
      {/* Sub-Category + Item */}
      <div style={two}>
        <div>
          {lbl('Sub-Category', true)}
          <select className={fc('subcategoryId')} value={form.subcategoryId}
            onChange={e => set('subcategoryId', e.target.value)} disabled={!form.categoryId}>
            <option value="">— Select Sub-Category —</option>
            {subcategories.map(s => <option key={s.id} value={s.id}>{s.name || s.subcategoryName}</option>)}
          </select>
          {err('subcategoryId')}
        </div>
        <div>
          {lbl('Item', true)}
          <select className={fc('item')} value={form.item?.value ?? ''}
            onChange={e => { const found = items.find(i => String(i.value) === String(e.target.value)); set('item', found || null); }}
            disabled={!form.subcategoryId}>
            <option value="">— Select Item —</option>
            {items.map(i => <option key={i.value} value={i.value}>{i.label}</option>)}
          </select>
          {err('item')}
        </div>
      </div>
 
      {/* Priority + Location */}
      <div style={two}>
        <div>
          {lbl('Priority', true)}
          <select className={fc('priorityId')} value={form.priorityId} onChange={e => set('priorityId', e.target.value)}>
            <option value="">— Select Priority —</option>
            {priorities.map(p => <option key={p.priorityId} value={p.priorityId}>{p.priorityName}</option>)}
          </select>
          {err('priorityId')}
        </div>
        <div>
          {lbl('Location', true)}
          <select className={fc('location')} value={form.location} onChange={e => set('location', e.target.value)}>
            <option value="">— Select Location —</option>
            {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          {err('location')}
        </div>
      </div>
 
      {/* Mobile */}
      <div style={fg}>
        {lbl('Mobile Number', true)}
        <input className={fc('mobile')} value={form.mobile} maxLength={10}
          onChange={e => set('mobile', e.target.value)} placeholder="10-digit mobile starting with 6/7/8/9" />
        {err('mobile')}
      </div>
 
      {/* Description — same RTE as CreateTicketPage */}
      <div style={{ marginBottom: 18 }}>
        {lbl('Description', true)}
        <RTE value={form.description} onChange={v => set('description', v)}
          error={errors.description} placeholder="Describe the issue in detail..." />
      </div>
 
      {/* Actions */}
      <div className="divider" />
      <div className="flex-end flex-gap-3">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={handleSubmit} loading={submitting}>Submit Ticket</Button>
      </div>
    </div>
  );
}
 
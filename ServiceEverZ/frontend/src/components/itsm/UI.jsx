import React, { useState, useEffect, useRef, useCallback } from 'react';
import { validateFile, getAckTimeLeft, ALLOWED_EXTENSIONS } from '../../utils/helpers';

export function Chip({ status, label }) {
  return <span className={`chip chip--${status}`}>{label || status}</span>;
}

export function Spinner() {
  return <div className="spinner-wrap"><div className="spinner" /></div>;
}

export function Snackbar({ message, type = 'success', onClose }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [message, onClose]);
  if (!message) return null;
  return (
    <div className={`snackbar snackbar--${type}`}>
      <span style={{ flex: 1 }}>{message}</span>
      <button className="snackbar__close" onClick={onClose}>x</button>
    </div>
  );
}

export function Modal({ title, children, onClose, width = 560 }) {
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: width }} onClick={e => e.stopPropagation()}>
        <div className="modal__header">
          <div className="modal__title">{title}</div>
          <button className="modal__close" onClick={onClose}>x</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Button({ children, onClick, variant = 'primary', loading, disabled, size, fullWidth, style }) {
  return (
    <button
      className={`btn btn--${variant}${size ? ` btn--${size}` : ''}${fullWidth ? ' btn--full' : ''}`}
      onClick={onClick}
      disabled={disabled || loading}
      style={style}
    >
      {loading && <span className="btn__spinner" />}
      {children}
    </button>
  );
}

export function FormField({ label, required, error, children }) {
  return (
    <div className="form-group">
      {label && (
        <label className="form-label">
          {label}{required && <span className="required"> *</span>}
        </label>
      )}
      {children}
      {error && <div className="form-error">{error}</div>}
    </div>
  );
}

export function Input({ label, value, onChange, placeholder, type = 'text', readOnly, error, required }) {
  return (
    <FormField label={label} required={required} error={error}>
      {readOnly
        ? <div className="readonly-field">{value || <span style={{ color: 'var(--gray-4)' }}>{placeholder || '—'}</span>}</div>
        : <input type={type} value={value ?? ''} onChange={e => onChange && onChange(e.target.value)} placeholder={placeholder} className={`form-control${error ? ' error' : ''}`} />
      }
    </FormField>
  );
}

export function Select({ label, value, onChange, options = [], placeholder, required, error, disabled }) {
  return (
    <FormField label={label} required={required} error={error}>
      <select value={value ?? ''} onChange={e => onChange && onChange(e.target.value)} disabled={disabled} className={`form-control${error ? ' error' : ''}`}>
        <option value="" disabled>{placeholder || 'Select...'}</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </FormField>
  );
}

export function SearchableDropdown({ label, value, onChange, fetchOptions, placeholder, required, error, disabled }) {
  const [open, setOpen]       = useState(false);
  const [query, setQuery]     = useState('');
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounce              = useRef(null);
  const containerRef          = useRef(null);

  const search = useCallback(async (q) => {
    setLoading(true);
    try { const res = await fetchOptions(q); setOptions(Array.isArray(res) ? res : []); }
    catch { setOptions([]); }
    setLoading(false);
  }, [fetchOptions]);

  useEffect(() => {
    if (!open) return;
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => search(query), 280);
    return () => clearTimeout(debounce.current);
  }, [query, open, search]);

  useEffect(() => {
    const h = (e) => { if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <FormField label={label} required={required} error={error}>
      <div className="dropdown-wrapper" ref={containerRef}>
        <div className={`dropdown-trigger${open ? ' open' : ''}${!value?.label ? ' placeholder' : ''}${error ? ' error' : ''}`}
          onClick={() => { if (!disabled) { if (!open) { setQuery(''); search(''); } setOpen(o => !o); } }}>
          <span>{value?.label || placeholder || 'Select...'}</span>
          <span className="dropdown-trigger__arrow">{open ? '▲' : '▼'}</span>
        </div>
        {open && (
          <div className="dropdown-menu">
            <div className="dropdown-search">
              <input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="Search..." onClick={e => e.stopPropagation()} />
            </div>
            <div className="dropdown-list">
              {loading && <div className="dropdown-loading">Loading...</div>}
              {!loading && options.length === 0 && <div className="dropdown-empty">No results found</div>}
              {!loading && options.map(opt => (
                <div key={opt.value} className={`dropdown-option${value?.value === opt.value ? ' selected' : ''}`}
                  onClick={() => { onChange(opt); setOpen(false); setQuery(''); }}>
                  {opt.label}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </FormField>
  );
}

export function RichTextEditor({ label, value, onChange, required, error, placeholder }) {
  const ref = useRef(null);
  const exec = (cmd, val) => { document.execCommand(cmd, false, val); ref.current?.focus(); onChange(ref.current?.innerHTML || ''); };
  return (
    <FormField label={label} required={required} error={error}>
      <div className={`rte-wrapper${error ? ' error' : ''}`}>
        <div className="rte-toolbar">
          <button type="button" className="rte-btn bold"      onMouseDown={e => { e.preventDefault(); exec('bold'); }}>B</button>
          <button type="button" className="rte-btn italic"    onMouseDown={e => { e.preventDefault(); exec('italic'); }}>I</button>
          <button type="button" className="rte-btn underline" onMouseDown={e => { e.preventDefault(); exec('underline'); }}>U</button>
          <div className="rte-divider" />
          <button type="button" className="rte-btn"           onMouseDown={e => { e.preventDefault(); exec('insertUnorderedList'); }}>List</button>
          <button type="button" className="rte-btn link"      onMouseDown={e => { e.preventDefault(); const url = prompt('Enter URL:'); if (url) exec('createLink', url); }}>Link</button>
        </div>
        <div ref={ref} className="rte-body" contentEditable suppressContentEditableWarning
          data-placeholder={placeholder || 'Describe your request in detail...'}
          onInput={() => onChange(ref.current?.innerHTML || '')}
          dangerouslySetInnerHTML={{ __html: value || '' }} />
      </div>
    </FormField>
  );
}

export function AttachmentUploader({ value, onChange }) {
  const [error, setError]       = useState('');
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);
  const handle = (file) => {
    if (!file) return;
    const err = validateFile(file);
    if (err) { setError(err); return; }
    setError('');
    onChange({ name: file.name, size: file.size, file });
  };
  return (
    <div className="form-group">
      <label className="form-label">Attachments</label>
      <div className={`file-uploader${dragging ? ' dragging' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); handle(e.dataTransfer.files[0]); }}>
        <input ref={inputRef} type="file" accept={ALLOWED_EXTENSIONS.join(',')} style={{ display: 'none' }} onChange={e => handle(e.target.files[0])} />
        <div className="file-uploader__icon">+</div>
        {value
          ? <><div className="file-uploader__selected">{value.name}</div><div className="file-uploader__sub">{(value.size/1024/1024).toFixed(2)} MB — click to replace</div></>
          : <><div className="file-uploader__text">Drop file here or click to browse</div><div className="file-uploader__sub">Allowed: {ALLOWED_EXTENSIONS.join(', ')} — Max 30 MB</div></>
        }
      </div>
      {error && <div className="form-error">{error}</div>}
    </div>
  );
}

export function TicketTimeline({ steps = [] }) {
  return (
    <div className="timeline">
      {steps.map((s, i) => {
        const isLast = i === steps.length - 1;
        const dotCls = s.done ? 'done' : s.error ? 'error' : s.active ? 'active' : 'pending';
        return (
          <div key={i} className="timeline__item">
            <div className="timeline__track">
              <div className={`timeline__dot timeline__dot--${dotCls}`}>{s.done ? '✓' : s.error ? '✗' : i + 1}</div>
              {!isLast && <div className={`timeline__line timeline__line--${s.done ? 'done' : 'pending'}`} />}
            </div>
            <div className="timeline__content">
              <div className={`timeline__label${s.active ? ' timeline__label--active' : ''}${!s.done && !s.active && !s.error ? ' timeline__label--muted' : ''}`}>{s.label}</div>
              {s.sub && <div className="timeline__sub">{s.sub}</div>}
              {s.timestamp && <div className="timeline__ts">{s.timestamp}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function CountdownTimer({ assignedAt }) {
  const [info, setInfo] = useState(() => getAckTimeLeft(assignedAt));
  useEffect(() => {
    const t = setInterval(() => setInfo(getAckTimeLeft(assignedAt)), 1000);
    return () => clearInterval(t);
  }, [assignedAt]);
  if (!info) return null;
  return <div className={`countdown countdown--${info.timed ? 'expired' : 'running'}`}>{info.label}</div>;
}

export function InfoField({ label, value }) {
  return (
    <div>
      <div className="info-field__label">{label}</div>
      <div className="info-field__value">{value || '—'}</div>
    </div>
  );
}

export function SectionTitle({ children }) {
  return <div className="section-title">{children}</div>;
}

export function Pagination({ page, total, pageSize, onChange }) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 'var(--space-5)' }}>
      <button className="btn btn--ghost btn--sm" onClick={() => onChange(page - 1)} disabled={page === 1}>Prev</button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
        <button key={p} onClick={() => onChange(p)} style={{ width: 32, height: 32, borderRadius: 'var(--radius-sm)', border: '1px solid var(--gray-2)', background: p === page ? 'var(--primary-800)' : 'var(--surface)', color: p === page ? '#fff' : 'var(--gray-7)', cursor: 'pointer', fontSize: 13, fontWeight: p === page ? 700 : 400 }}>{p}</button>
      ))}
      <button className="btn btn--ghost btn--sm" onClick={() => onChange(page + 1)} disabled={page === totalPages}>Next</button>
      <span style={{ fontSize: 12, color: 'var(--gray-5)', marginLeft: 8 }}>{total} total</span>
    </div>
  );
}

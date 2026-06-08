import React, { useEffect, useState, useCallback } from 'react';
import { createLocation, getAllLocations, mapLocationToUser } from '../../api/LocationApi';
import toast from 'react-hot-toast';
 
/* ─────────────────────────────────────────────
   Inline styles using CSS-in-JS pattern (no MUI)
   Color palette from the image:
   - Primary bg:     #ffffff
   - Accent:         #111111 (dark buttons)
   - Status active:  #16a34a
   - Status inactive:#6b7280
   - Border:         #e5e7eb
   - Header bg:      #f9fafb
───────────────────────────────────────────── */
 
const ROWS_PER_PAGE_OPTIONS = [6, 12, 18]; // cards per page options
const DEFAULT_CARDS_PER_PAGE = 6;          // 2 rows × 3 cards
 
// ── Tiny utility: paginate an array ──────────
function paginate(arr, page, perPage) {
  const start = (page - 1) * perPage;
  return arr.slice(start, start + perPage);
}
 
// ── Status badge ─────────────────────────────
function StatusBadge({ active }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      padding: '3px 10px',
      borderRadius: 99,
      fontSize: 12,
      fontWeight: 500,
      border: '1px solid #e5e7eb',
      color: active ? '#15803d' : '#6b7280',
      background: active ? '#f0fdf4' : '#f3f4f6',
    }}>
      <span style={{
        width: 7, height: 7, borderRadius: '50%',
        background: active ? '#22c55e' : '#9ca3af',
        display: 'inline-block',
      }} />
      {active ? 'Active' : 'Inactive'}
    </span>
  );
}
 
// ── Icon: map pin ─────────────────────────────
function PinIcon({ size = 18, color = '#6b7280' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
 
// ── Icon: edit pencil ─────────────────────────
function EditIcon({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}
 
// ── Icon: trash ───────────────────────────────
function TrashIcon({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}
 
// ── Icon: save ────────────────────────────────
function SaveIcon() {
  return (
    <svg width={15} height={15} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  );
}
 
// ── Icon: close ───────────────────────────────
function XIcon() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
 
// ── Icon: search ──────────────────────────────
function SearchIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
      stroke="#9ca3af" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
 
// ── Icon: plus ────────────────────────────────
function PlusIcon() {
  return (
    <svg width={15} height={15} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
 
// ── Icon: users ───────────────────────────────
function UsersIcon() {
  return (
    <svg width={13} height={13} viewBox="0 0 24 24" fill="none"
      stroke="#9ca3af" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
 
// ── Icon: check circle ────────────────────────
function CheckCircleIcon() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
 
// ── Create New Location sub-modal ─────────────
function CreateLocationModal({ onClose, onCreate }) {
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
 
  const handleSubmit = async () => {
    if (!name.trim()) { setErr('Location name is required'); return; }
    setSaving(true); setErr('');
    try {
      const created = await createLocation({ name: name.trim() });
      toast.success('Location created successfully');
      onCreate(created);
      onClose();
    } catch (e) {
      setErr(e?.response?.data?.message || 'Failed to create location');
    } finally {
      setSaving(false);
    }
  };
 
  return (
    <div style={overlay}>
      <div style={{ ...modalBox, maxWidth: 420, padding: '28px 32px' }}>
        <h3 style={{ margin: '0 0 4px', fontSize: 17, fontWeight: 700, color: '#111' }}>
          Create New Location
        </h3>
        <p style={{ margin: '0 0 20px', fontSize: 13, color: '#6b7280' }}>
          Add a new city or region to the system.
        </p>
 
        {err && <div style={alertErr}>{err}</div>}
 
        <label style={labelStyle}>Location Name</label>
        <input
          autoFocus
          value={name}
          onChange={e => { setName(e.target.value); setErr(''); }}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          placeholder="e.g. Bangalore"
          style={inputStyle}
        />
 
        <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={btnOutline} disabled={saving}>Cancel</button>
          <button onClick={handleSubmit} style={btnDark} disabled={saving}>
            {saving ? 'Creating…' : 'Create Location'}
          </button>
        </div>
      </div>
    </div>
  );
}
 
// ── Delete confirm sub-modal ───────────────────
function DeleteConfirmModal({ count, onConfirm, onCancel }) {
  return (
    <div style={overlay}>
      <div style={{ ...modalBox, maxWidth: 400, padding: '28px 32px' }}>
        <h3 style={{ margin: '0 0 8px', fontSize: 17, fontWeight: 700, color: '#111' }}>
          Delete {count} Location{count !== 1 ? 's' : ''}?
        </h3>
        <p style={{ margin: '0 0 24px', fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>
          You can delete single or multiple locations. This action cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={btnOutline}>Cancel</button>
          <button onClick={onConfirm} style={{ ...btnDark, background: '#dc2626' }}>
            Delete Selected ({count})
          </button>
        </div>
      </div>
    </div>
  );
}
 
// ════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════
export default function MapLocationDialog({ open, onClose, selectedUsers = [], onMapped }) {
  // ── State ──────────────────────────────────────
  const [locations, setLocations] = useState([]);
  // const [search, setSearch] = useState('');
  // const [checked, setChecked] = useState(new Set());          // row checkboxes
  const [selectedLocationId, setSelectedLocationId] = useState(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(DEFAULT_CARDS_PER_PAGE);
  const [loading, setLoading] = useState(false);
  const [mapping, setMapping] = useState(false);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
 const [deleteId, setDeleteId] = useState(null);
  // ── Inline edit state ─────────────────────────
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [editSaving, setEditSaving] = useState(false);
 
  // ── Load locations ─────────────────────────────
  const loadLocations = useCallback(async (q = '') => {
    setLoading(true);
    try {
      const data = await getAllLocations(q);
      setLocations(data || []);
      setPage(1);
    } catch {
      setError('Failed to load locations');
    } finally {
      setLoading(false);
    }
  }, []);
 
  useEffect(() => {
    if (!open) return;
    setError(''); setSearch(''); setChecked(new Set());
    setSelectedLocationId(null); setPage(1);
    setEditingId(null); setEditingName('');
    loadLocations();
  }, [open]);
 
  // ── Search debounce ───────────────────────────
  // useEffect(() => {
  //   const t = setTimeout(() => loadLocations(search), 300);
  //   return () => clearTimeout(t);
  // }, [search]);
 
  // ── Derived / pagination ──────────────────────
  const totalPages = Math.max(1, Math.ceil(locations.length / perPage));
  const pageCards = paginate(locations, page, perPage);
  // const allChecked = pageCards.length > 0 && pageCards.every(r => checked.has(r.id));
  // const someChecked = pageCards.some(r => checked.has(r.id));
 
  // ── Checkbox helpers ──────────────────────────
  // const toggleAll = () => {
  //   const next = new Set(checked);
  //   if (allChecked) pageCards.forEach(r => next.delete(r.id));
  //   else pageCards.forEach(r => next.add(r.id));
  //   setChecked(next);
  // };
  // const toggleOne = id => {
  //   const next = new Set(checked);
  //   next.has(id) ? next.delete(id) : next.add(id);
  //   setChecked(next);
  // };
 
  // ── Create callback ───────────────────────────
  const handleCreated = created => {
    setLocations(prev => [created, ...prev]);
    setSelectedLocationId(created.id);
  };
 
  // ── Delete (UI only — wire up your API) ───────
  
const handleDeleteConfirm = () => {
  setLocations(prev => prev.filter(l => l.id !== deleteId));
  if (deleteId === selectedLocationId) setSelectedLocationId(null);
  setShowDelete(false);
  toast.success('Location deleted');
};

 
  // ── Inline edit save ──────────────────────────
  const handleSaveEdit = async () => {
    if (!editingName.trim()) { toast.error('Location name is required'); return; }
    setEditSaving(true);
    try {
      // wire your API here: await updateLocation(editingId, { name: editingName.trim() });
      setLocations(prev =>
        prev.map(l => l.id === editingId ? { ...l, name: editingName.trim() } : l)
      );
      toast.success('Location updated');
      setEditingId(null);
      setEditingName('');
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to update location');
    } finally {
      setEditSaving(false);
    }
  };
 
  // ── Map location → selected users ─────────────
  const handleMap = async () => {
    if (!selectedLocationId) { setError('Please select a location to map'); return; }
    if (!selectedUsers?.length) { setError('No users selected'); return; }
    setMapping(true); setError('');
    try {
      await Promise.all(
        selectedUsers.map(u => mapLocationToUser(u.id, selectedLocationId))
      );
      toast.success('Location mapped successfully');
      onMapped?.();
      onClose();
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to map location');
    } finally {
      setMapping(false);
    }
  };
 
  // ── Pagination range ──────────────────────────
  const buildPages = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 3) return [1, 2, 3, '…', totalPages];
    if (page >= totalPages - 2) return [1, '…', totalPages - 2, totalPages - 1, totalPages];
    return [1, '…', page, '…', totalPages];
  };
 
  if (!open) return null;
 
  return (
    <>
      {/* ── Backdrop ── */}
      <div style={overlay} onClick={onClose}>
        <div style={modalBox} onClick={e => e.stopPropagation()}>
 
          {/* ── Header ── */}
          <div style={headerRow}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#111' }}>
                  Map Location
                </h2>
                <span style={countPill}>{selectedUsers?.length ?? 0} Selected</span>
              </div>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280' }}>
                Select existing locations from the list or create a new one to map it to selected users.
              </p>
            </div>
            <button onClick={onClose} style={closeBtn} aria-label="Close">✕</button>
          </div>
 
          <div style={{ borderTop: '1px solid #e5e7eb' }} />
 
          {/* ── Toolbar ── */}
          <div style={toolbar}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              {/* Select-all checkbox for current page */}
              {/* <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13, color: '#374151' }}>
                <input
                  type="checkbox"
                  checked={allChecked}
                  ref={el => el && (el.indeterminate = someChecked && !allChecked)}
                  onChange={toggleAll}
                  style={checkbox}
                />
                Select page
              </label> */}
 
              {/* <div style={searchWrap}>
                <SearchIcon />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search locations..."
                  style={searchInput}
                />
              </div> */}
            </div>
 
            <button
              style={{ ...btnDark, display: 'flex', alignItems: 'center', gap: 6 }}
              onClick={() => setShowCreate(true)}
            >
              <PlusIcon /> Create New Location
            </button>
          </div>
 
          {/* ── Error banner ── */}
          {error && (
            <div style={{ ...alertErr, margin: '0', borderRadius: 0, borderLeft: 'none', borderRight: 'none' }}>
              {error}
            </div>
          )}
 
          {/* ════════════════════════════════════════════
              CART GRID — replaces the old paginated table
          ════════════════════════════════════════════ */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '48px 0', color: '#9ca3af', fontSize: 14 }}>
                Loading…
              </div>
            ) : pageCards.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0', color: '#9ca3af', fontSize: 14 }}>
                No locations found
              </div>
            ) : (
              <div style={cartGrid}>
                {pageCards.map(loc => {
                  const isSelected = selectedLocationId === loc.id;
                  const isChecked  = checked.has(loc.id);
                  const isEditing  = editingId === loc.id;
 
                  return (
                    <div
                      key={loc.id}
                      onClick={() => !isEditing && setSelectedLocationId(loc.id)}
                      style={{
                        ...cartCard,
                        border: isSelected ? '2px solid #111' : '1.5px solid #e5e7eb',
                        background: isSelected ? '#fafaf9' : '#ffffff',
                        boxShadow: isSelected
                          ? '0 0 0 3px rgba(17,17,17,0.08)'
                          : '0 1px 4px rgba(0,0,0,0.06)',
                        cursor: isEditing ? 'default' : 'pointer',
                      }}
                      onMouseEnter={e => {
                        if (!isSelected) e.currentTarget.style.borderColor = '#9ca3af';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = isSelected ? '#111' : '#e5e7eb';
                      }}
                    >
                      {/* Top row: checkbox + status */}
                      {/* <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleOne(loc.id)}
                          onClick={e => e.stopPropagation()}
                          style={{ ...checkbox, marginTop: 1 }}
                        />
                        <StatusBadge active={loc.active} />
                      </div> */}
 
                      {/* Location name / inline edit */}
                      {isEditing ? (
                        <input
                          autoFocus
                          value={editingName}
                          onChange={e => setEditingName(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleSaveEdit();
                            if (e.key === 'Escape') { setEditingId(null); setEditingName(''); }
                          }}
                          onClick={e => e.stopPropagation()}
                          style={{ ...inputStyle, marginBottom: 8, fontSize: 14 }}
                        />
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
                          <PinIcon color={isSelected ? '#111' : '#9ca3af'} />
                          <span style={{
                            fontSize: 15,
                            fontWeight: isSelected ? 700 : 500,
                            color: isSelected ? '#111' : '#374151',
                            wordBreak: 'break-word',
                            lineHeight: 1.3,
                          }}>
                            {loc.name}
                          </span>
                        </div>
                      )}
 
                      {/* Selected badge */}
                      {isSelected && !isEditing && (
                        <div style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          fontSize: 11, fontWeight: 700,
                          padding: '3px 9px', borderRadius: 4,
                          background: '#111', color: '#fff',
                          letterSpacing: '0.02em', marginBottom: 8,
                        }}>
                          <CheckCircleIcon /> Selected
                        </div>
                      )}
 
                      {/* Divider */}
                      <div style={{ borderTop: '1px solid #f3f4f6', margin: '8px 0' }} />
 
                      {/* Bottom row: type + user count + actions */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <span style={{ fontSize: 11, color: '#9ca3af' }}>City</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <UsersIcon />
                            <span style={{ fontSize: 12, color: '#6b7280' }}>
                              {loc.mappedUsers ?? '—'} users
                            </span>
                          </div>
                        </div>
 
                     {/* Action buttons */}
                        <div
                          style={{ display: 'inline-flex', gap: 4 }}
                          onClick={e => e.stopPropagation()}
                        >
                          {isEditing ? (
                            <>
                              <button
                                style={{ ...iconBtn, color: '#16a34a' }}
                                onClick={handleSaveEdit}
                                disabled={editSaving}
                                title="Save"
                              >
                                {editSaving ? '…' : <SaveIcon />}
                              </button>
                              <button
                                style={{ ...iconBtn, color: '#6b7280' }}
                                onClick={() => { setEditingId(null); setEditingName(''); }}
                                title="Cancel"
                              >
                                <XIcon />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                style={iconBtn}
                                onClick={() => { setEditingId(loc.id); setEditingName(loc.name); }}
                                title="Edit"
                              >
                                <EditIcon />
                              </button>
                              <button
                                style={{ ...iconBtn, color: '#ef4444' }}
                                onClick={() => { setChecked(loc.id); setShowDelete(true); }}
                                title="Delete"
                              >
                                <TrashIcon />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
 
          {/* ── Cart Pagination ── */}
          <div style={paginationRow}>
            <span style={{ fontSize: 13, color: '#6b7280' }}>
              Showing {locations.length === 0 ? 0 : (page - 1) * perPage + 1} to{' '}
              {Math.min(page * perPage, locations.length)} of {locations.length} locations
            </span>
 
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <button
                style={pageBtn(false)}
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >‹</button>
 
              {buildPages().map((p, i) =>
                p === '…'
                  ? <span key={`ellipsis-${i}`} style={{ padding: '0 4px', color: '#9ca3af' }}>…</span>
                  : <button
                    key={p}
                    style={pageBtn(page === p)}
                    onClick={() => setPage(p)}
                  >{p}</button>
              )}
 
              <button
                style={pageBtn(false)}
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
              >›</button>
            </div>
 
            <select
              value={perPage}
              onChange={e => { setPerPage(Number(e.target.value)); setPage(1); }}
              style={perPageSelect}
            >
              {ROWS_PER_PAGE_OPTIONS.map(n => (
                <option key={n} value={n}>{n} / page</option>
              ))}
            </select>
          </div>
 
          {/* ── Delete footer banner (shown when rows checked) ──
          {checked.size > 0 && (
            <div style={deleteFooter}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <TrashIcon />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>Delete Selected</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>{checked.size} location(s) selected</div>
                </div>
                <button
                  onClick={() => setChecked(new Set())}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#6b7280', textDecoration: 'underline' }}
                >
                  Clear Selection
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                <span style={{ fontSize: 13, color: '#6b7280', maxWidth: 340 }}>
                  You can delete single or multiple locations. This action cannot be undone.
                </span>
                <button
                  style={{ ...btnDark, background: '#111', padding: '9px 20px' }}
                  onClick={() => setShowDelete(true)}
                >
                  Delete Selected ({checked.size})
                </button>
              </div>
            </div>
          )} */}
 
          {/* ── Footer actions ── */}
          <div style={{ borderTop: '1px solid #e5e7eb' }} />
          <div style={footerActions}>
            <button onClick={onClose} style={btnOutline}>Cancel</button>
            <button
              onClick={handleMap}
              style={{ ...btnDark, opacity: mapping ? 0.7 : 1 }}
              disabled={mapping || !selectedLocationId}
            >
              {mapping ? 'Mapping…' : 'Map Location'}
            </button>
          </div>
 
        </div>
      </div>
 
      {/* ── Sub-modals ── */}
      {showCreate && (
        <CreateLocationModal
          onClose={() => setShowCreate(false)}
          onCreate={handleCreated}
        />
      )}
      {showDelete && (
        
<DeleteConfirmModal
  count={1}
  onConfirm={handleDeleteConfirm}
  onCancel={() => setShowDelete(false)}
/>

      )}
    </>
  );
}
 
// ════════════════════════════════════════════════
// STYLES
// ════════════════════════════════════════════════
const overlay = {
  position: 'fixed', inset: 0,
  background: 'rgba(0,0,0,0.45)',
  backdropFilter: 'blur(2px)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 1300, padding: 16,
};
const modalBox = {
  background: '#fff',
  borderRadius: 16,
  boxShadow: '0 24px 80px rgba(0,0,0,0.18)',
  width: '100%', maxWidth: 900,
  maxHeight: '90vh',
  display: 'flex', flexDirection: 'column',
  overflow: 'hidden',
  fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
};
const headerRow = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
  padding: '22px 28px 18px',
};
const countPill = {
  fontSize: 12, fontWeight: 600,
  padding: '3px 10px', borderRadius: 99,
  border: '1px solid #e5e7eb',
  color: '#374151', background: '#f3f4f6',
};
const closeBtn = {
  background: 'none', border: 'none', cursor: 'pointer',
  fontSize: 18, color: '#9ca3af', lineHeight: 1,
  padding: 4, borderRadius: 6,
  transition: 'color 0.15s',
};
const toolbar = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  padding: '14px 24px',
  gap: 12,
  flexWrap: 'wrap',
};
const searchWrap = {
  display: 'flex', alignItems: 'center', gap: 8,
  border: '1px solid #e5e7eb', borderRadius: 8,
  padding: '8px 14px', flex: '0 0 220px',
  background: '#fff',
};
const searchInput = {
  border: 'none', outline: 'none', fontSize: 14,
  color: '#374151', background: 'transparent', width: '100%',
};
 
/* ── Cart grid ────────────────────────────────── */
const cartGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
  gap: 16,
};
const cartCard = {
  borderRadius: 12,
  padding: '14px 16px',
  transition: 'all 0.15s ease',
  display: 'flex',
  flexDirection: 'column',
  minHeight: 155,
};
 
const checkbox = { width: 16, height: 16, cursor: 'pointer', accentColor: '#111' };
const iconBtn = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  width: 30, height: 30, borderRadius: 6,
  border: '1px solid #e5e7eb', background: '#fff',
  cursor: 'pointer', color: '#6b7280',
  transition: 'all 0.15s',
};
const paginationRow = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '12px 24px', borderTop: '1px solid #f3f4f6',
  flexWrap: 'wrap', gap: 8,
};
const pageBtn = active => ({
  minWidth: 32, height: 32,
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  border: active ? '1.5px solid #111' : '1px solid #e5e7eb',
  borderRadius: 6,
  background: active ? '#111' : '#fff',
  color: active ? '#fff' : '#374151',
  fontSize: 13, fontWeight: active ? 600 : 400,
  cursor: 'pointer', padding: '0 6px',
  transition: 'all 0.12s',
});
const perPageSelect = {
  border: '1px solid #e5e7eb', borderRadius: 6,
  padding: '6px 10px', fontSize: 13, color: '#374151',
  outline: 'none', cursor: 'pointer',
};
const deleteFooter = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '14px 24px',
  background: '#fafafa',
  borderTop: '1px solid #e5e7eb',
  gap: 16, flexWrap: 'wrap',
};
const footerActions = {
  display: 'flex', justifyContent: 'flex-end', gap: 10,
  padding: '16px 24px',
};
const btnDark = {
  background: '#111', color: '#fff',
  border: 'none', borderRadius: 8,
  padding: '9px 18px', fontSize: 14, fontWeight: 600,
  cursor: 'pointer', transition: 'opacity 0.15s',
};
const btnOutline = {
  background: '#fff', color: '#374151',
  border: '1px solid #e5e7eb', borderRadius: 8,
  padding: '9px 18px', fontSize: 14, fontWeight: 500,
  cursor: 'pointer', transition: 'border-color 0.15s',
};
const alertErr = {
  background: '#fef2f2', border: '1px solid #fecaca',
  color: '#b91c1c', borderRadius: 8,
  padding: '10px 14px', fontSize: 13, marginBottom: 12,
};
const labelStyle = {
  display: 'block', fontSize: 13, fontWeight: 600,
  color: '#374151', marginBottom: 6,
};
const inputStyle = {
  width: '100%', boxSizing: 'border-box',
  border: '1px solid #e5e7eb', borderRadius: 8,
  padding: '10px 14px', fontSize: 14, color: '#111',
  outline: 'none', transition: 'border-color 0.15s',
};
 
 
                                 
 
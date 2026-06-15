import React, { useState, useRef, useCallback } from 'react';
import { Snackbar, Alert } from '@mui/material';
import { masterApi } from '../../api/ourApi';
import { rmoApi } from '../../api/rmoApi';
import OurServiceCatalogPage from '../enduser/OurServiceCatalogPage';
import OurCreateTicketPage from '../enduser/OurCreateTicketPage';
import { useAuth } from '../../context/AuthContext';
 
const TYPE_OPTIONS = [
  { value: 'CALL',     label: '📞 Call' },
  { value: 'CHAT',     label: '💬 Chat' },
  { value: 'WEB_FORM', label: '🌐 Web Form' },
  { value: 'EMAIL',    label: '📧 Email' },
];
 
export default function SupportEmployeeTicketWrapper({ onClose }) {
  const { user: supportUser } = useAuth();
 
  /* Step 1: select type + employee */
  const [step,         setStep]         = useState('SELECT'); // SELECT | CATALOG | FORM
  const [ticketType,   setTicketType]   = useState('');
  const [typeError,    setTypeError]    = useState('');
 
  /* Employee search */
  const [userSearch,    setUserSearch]    = useState('');
  const [userResults,   setUserResults]   = useState([]);
  const [userSearching, setUserSearching] = useState(false);
  const [selectedUser,  setSelectedUser]  = useState(null);
  const [userError,     setUserError]     = useState('');
  const [showDropdown,  setShowDropdown]  = useState(false);
  const [asset,         setAsset]         = useState(null);
  const debounceRef = useRef(null);
 
  /* Catalog → Form state */
  const [selected, setSelected] = useState(null); // {category, subCategory}
  const [snack,    setSnack]    = useState({ open:false, msg:'', sev:'success' });
 
  /* ── Employee search ──────────────────────────────────────────── */
  const searchUsers = useCallback((q) => {
    if (!q || q.length < 2) { setUserResults([]); setShowDropdown(false); return; }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setUserSearching(true);
      try {
        // Use rmoApi to get all users and filter client-side
        const res = await rmoApi.getUsers();
        const all = Array.isArray(res?.data) ? res.data : [];
        const filtered = all.filter(u => {
          const name = (u.fullName || `${u.firstName||''} ${u.lastName||''}`).toLowerCase();
          const email = (u.email || '').toLowerCase();
          const q2 = q.toLowerCase();
          return name.includes(q2) || email.includes(q2);
        });
        setUserResults(filtered.slice(0, 10));
        setShowDropdown(filtered.length > 0);
      } catch { setUserResults([]); setShowDropdown(false); }
      finally { setUserSearching(false); }
    }, 300);
  }, []);
 
  const selectUser = async (u) => {
    setSelectedUser(u);
    const name = u.fullName || `${u.firstName||''} ${u.lastName||''}`.trim();
    setUserSearch(name);
    setShowDropdown(false);
    setUserError('');
    setAsset(null);
    // Auto-fetch asset
    try {
      const uid = u.id || u.userId;
      if (uid) {
        const assets = await masterApi.getAssets(uid);
        const arr = Array.isArray(assets) ? assets : [];
        if (arr.length > 0) {
          setAsset({ value: arr[0].id, label: `${arr[0].assetName} (${arr[0].assetTag})` });
        }
      }
    } catch {}
  };
 
  /* ── Proceed to catalog ───────────────────────────────────────── */
  const handleProceed = () => {
    let valid = true;
    if (!ticketType) { setTypeError('Please select a type'); valid = false; }
    else setTypeError('');
    if (!selectedUser) { setUserError('Please select an employee'); valid = false; }
    else setUserError('');
    if (valid) setStep('CATALOG');
  };
 
  /* ── Build overrideUser for OurCreateTicketPage ───────────────── */
  const overrideUser = selectedUser ? {
    id:          selectedUser.id || selectedUser.userId,
    userId:      selectedUser.id || selectedUser.userId,
    firstName:   selectedUser.firstName || '',
    lastName:    selectedUser.lastName  || '',
    fullName:    selectedUser.fullName  ||
                 `${selectedUser.firstName||''} ${selectedUser.lastName||''}`.trim(),
    email:       selectedUser.email     || '',
    employeeId:  selectedUser.employeeId|| selectedUser.id || selectedUser.userId,
    // pre-fetched asset so OurCreateTicketPage doesn't have to re-fetch
    preloadedAsset: asset,
    // channel mode (CALL/CHAT/etc) — passed through to buildPayload
    mode:        ticketType,
    // tell assignment-service to skip the support person who raised this
    raisedBySupportId: supportUser?.userId,
  } : null;
 
  const showSnack = (msg, sev='success') => setSnack({ open:true, msg, sev });
 
  // const handleSuccess = () => {
  //   showSnack('Ticket submitted for employee!');
  //   setTimeout(() => onClose(), 1400);
  // };
 
  const handleSuccess = (ticketData) => {
    showSnack('Ticket submitted for employee!');
    // Emails are sent by the ticket-service/approval flow automatically.
    // The support person also gets a copy — handled by ourApi below.
    // Send UI notification
    setTimeout(() => onClose(), 1400);
  };
 
 
  /* ── STEP: SELECT type + employee ─────────────────────────────── */
  if (step === 'SELECT') return (
    <div style={{ padding:'24px' }}>
 
      {/* Type dropdown */}
      <div className="form-group">
        <label className="form-label">
          Type / Channel <span className="required">*</span>
        </label>
        <select
          className={`form-control${typeError ? ' error' : ''}`}
          value={ticketType}
          onChange={e => { setTicketType(e.target.value); setTypeError(''); }}>
          <option value="">— Select Type —</option>
          {TYPE_OPTIONS.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        {typeError && <div className="form-error">{typeError}</div>}
      </div>
 
      {/* Employee search */}
      <div className="form-group" style={{ position:'relative' }}>
        <label className="form-label">
          Requester Name <span className="required">*</span>
        </label>
        <div style={{ position:'relative' }}>
          <input
            className={`form-control${userError ? ' error' : ''}`}
            value={userSearch}
            autoComplete="off"
            placeholder="Type employee name to search..."
            onChange={e => {
              setUserSearch(e.target.value);
              setSelectedUser(null);
              setAsset(null);
              searchUsers(e.target.value);
            }}
          />
          {userSearching && (
            <span style={{
              position:'absolute', right:10, top:'50%', transform:'translateY(-50%)',
              fontSize:11, color:'var(--gray-4)',
            }}>Searching…</span>
          )}
        </div>
        {userError && <div className="form-error">{userError}</div>}
 
        {/* Dropdown results */}
        {showDropdown && userResults.length > 0 && (
          <div style={{
            position:'absolute', top:'100%', left:0, right:0, zIndex:300,
            background:'var(--surface)', border:'1px solid var(--gray-2)',
            borderRadius:6, boxShadow:'0 8px 28px rgba(0,0,0,0.14)',
            maxHeight:220, overflowY:'auto',
          }}>
            {userResults.map((u, i) => {
              const name = u.fullName || `${u.firstName||''} ${u.lastName||''}`.trim();
              return (
                <div key={i} onClick={() => selectUser(u)}
                  style={{ padding:'9px 14px', cursor:'pointer', fontSize:13,
                           borderBottom:'1px solid var(--gray-1)' }}
                  onMouseEnter={e => e.currentTarget.style.background='var(--primary-50)'}
                  onMouseLeave={e => e.currentTarget.style.background=''}>
                  <div style={{ fontWeight:600, color:'var(--gray-9)' }}>{name}</div>
                  <div style={{ fontSize:11, color:'var(--gray-5)', marginTop:1 }}>
                    {u.email || ''} · ID: {u.id || u.userId || '—'}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
 
      {/* Auto-filled readonly fields */}
      {selectedUser && (
        <div className="two-col" style={{ marginBottom:'var(--space-4)' }}>
          <div>
            <div className="form-label">Employee ID</div>
            <div className="readonly-field">
              {selectedUser.employeeId || selectedUser.id || selectedUser.userId || '—'}
            </div>
          </div>
          <div>
            <div className="form-label">Asset (auto-fetched)</div>
            <div className="readonly-field">
              {asset ? asset.label : 'No asset assigned'}
            </div>
          </div>
        </div>
      )}
 
      <div className="divider" />
      <div className="flex-end flex-gap-3">
        <button className="btn btn--ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn--primary" onClick={handleProceed}>
          Continue to Service Catalog →
        </button>
      </div>
    </div>
  );
 
  /* ── STEP: CATALOG — same OurServiceCatalogPage ───────────────── */
  if (step === 'CATALOG' && !selected) return (
    <div>
      <div style={{ padding:'12px 24px 0', borderBottom:'1px solid var(--gray-1)' }}>
        <div style={{ fontSize:12, color:'var(--gray-5)', marginBottom:6 }}>
          Raising on behalf of <strong>{overrideUser?.fullName}</strong>
          {' '} · Type: <strong>{ticketType}</strong>
        </div>
      </div>
      <div style={{ padding:'0 24px 24px' }}>
        <OurServiceCatalogPage
          onSelectService={(sel) => { setSelected(sel); setStep('FORM'); }}
        />
      </div>
      <div style={{ padding:'0 24px 20px' }}>
        <button className="btn btn--ghost btn--sm" onClick={() => setStep('SELECT')}>
          ← Back to Employee Selection
        </button>
      </div>
    </div>
  );
 
  /* ── STEP: FORM — OurCreateTicketPage with employee's data ──── */
  if (step === 'FORM') return (
    <>
      <div style={{ padding:'12px 24px 0', borderBottom:'1px solid var(--gray-1)' }}>
        <div style={{ fontSize:12, color:'var(--gray-5)', marginBottom:6 }}>
          Raising on behalf of <strong>{overrideUser?.fullName}</strong>
          {' '} · Type: <strong>{ticketType}</strong>
        </div>
      </div>
      <div style={{ padding:'0 24px 24px' }}>
        <OurCreateTicketPage
          preSelected={selected}
          overrideUser={overrideUser}
          onSuccess={handleSuccess}
          onBack={() => { setSelected(null); setStep('CATALOG'); }}
          showSnack={showSnack}
        />
      </div>
      <Snackbar
        open={snack.open} autoHideDuration={4000}
        onClose={() => setSnack(s => ({ ...s, open:false }))}
        anchorOrigin={{ vertical:'bottom', horizontal:'center' }}>
        <Alert severity={snack.sev}
          onClose={() => setSnack(s => ({ ...s, open:false }))}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </>
  );
 
  return null;
}
 
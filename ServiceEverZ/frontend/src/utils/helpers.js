// ── Pure helpers — zero hardcoded data ───────────────────────────

export const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.pdf', '.docx'];
export const MAX_FILE_BYTES     = 30 * 1024 * 1024;
export const ACCESS_TILL_ITEMS  = ['git', 'sonarqube'];
export const PAGE_SIZE          = 10;

export const requiresAccessTill = (itemName = '') =>
  ACCESS_TILL_ITEMS.some(k => itemName.toLowerCase().includes(k));

// Backend returns LocalDateTime with no timezone suffix — append Z so browser parses as UTC
const toUTC = (dt) => {
  if (!dt) return new Date(NaN);
  const s = typeof dt === 'string';
  return new Date(s && !dt.endsWith('Z') && !dt.includes('+') ? dt + 'Z' : dt);
};

// Date: MM/DD/YYYY, time: 4:35 PM (Relevantz design system spec)
export const formatDate = (dt) => {
  if (!dt) return '—';
  const d    = toUTC(dt);
  const mm   = String(d.getMonth() + 1).padStart(2, '0');
  const dd   = String(d.getDate()).padStart(2, '0');
  const yyyy = d.getFullYear();
  const h    = d.getHours();
  const min  = String(d.getMinutes()).padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12  = h % 12 || 12;
  return `${mm}/${dd}/${yyyy}, ${h12}:${min} ${ampm}`;
};

export const formatDateOnly = (dt) => {
  if (!dt) return '—';
  const d  = toUTC(dt);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${mm}/${dd}/${d.getFullYear()}`;
};

export const buildSubject = (cat, subcat, name) =>
  [cat, subcat, name].filter(Boolean).join(' | ');

export const validateFile = (file) => {
  if (!file) return null;
  const ext = '.' + file.name.split('.').pop().toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext))
    return `Invalid format. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`;
  if (file.size > MAX_FILE_BYTES) return 'File too large. Max 30 MB';
  return null;
};

export const validateMobile = (v) => {
  if (!v || v.trim()=== '') return "Mobile number is required";
  if (!/^[6-9][0-9]{9}$/.test(v)) return 'Must be exactly 10 digits';
  return null;
};

export const getAckTimeLeft = (assignedAt) => {
  if (!assignedAt) return null;
  const diff = toUTC(assignedAt).getTime() + 30 * 60 * 1000 - Date.now();
  if (diff <= 0) return { label: 'TIMED OUT', timed: true };
  const m = Math.floor(diff / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { label: `${m}m ${s}s remaining`, timed: false };
};

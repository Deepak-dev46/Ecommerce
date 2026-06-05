// ── Primitive validators ───────────────────────────────────────────────────
const required = (label) => (v) =>
  !v?.toString().trim() ? `${label} is required` : '';
 
const alphanumeric = (label, opts = {}) => (v) => {
  const val = v?.toString().trim();
  if (!val) return opts.optional ? '' : `${label} is required`;
  if (!/^[a-zA-Z0-9 ]+$/.test(val))
    return `${label} must contain only letters, numbers and spaces`;
  if (!/[a-zA-Z]/.test(val))
    return `${label} must include at least one letter`;
  return '';
};
 
const alphanumericStrict = (label) => (v) => {
  const val = v?.toString().trim();
  if (!val) return `${label} is required`;
  if (!/^[A-Za-z0-9\-]+$/.test(val))
    return `${label} must be alphanumeric (hyphens allowed)`;
  return '';
};
 
const emailFmt = (v) => {
  if (!v?.trim()) return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())) return 'Invalid email address';
  return '';
};
 
const phoneFmt = (v) => {
  if (!v?.trim()) return '';  // optional field
  if (!/^\+?[\d\s\-().]{7,20}$/.test(v.trim())) return 'Invalid phone number format';
  return '';
};
 
const numRange = (label, min, max = null) => (v) => {
  const n = Number(v);
  if (v === '' || v === null || v === undefined) return `${label} is required`;
  if (isNaN(n)) return `${label} must be a number`;
  if (n < min)  return `${label} must be at least ${min}`;
  if (max !== null && n > max) return `${label} must be at most ${max}`;
  return '';
};
 
const positiveNum = (label, optional = false) => (v) => {
  if (!v && v !== 0) return optional ? '' : `${label} is required`;
  const n = Number(v);
  if (isNaN(n) || n < 0) return `${label} must be a positive number`;
  return '';
};
 
// ── Field-level validators (keyed by field name) ──────────────────────────
export const FIELD_VALIDATORS = {
  // User fields
  employeeId: alphanumericStrict('Employee ID'),
  firstName:  alphanumeric('First name'),
  lastName:   alphanumeric('Last name'),
  email:      emailFmt,
  phoneNumber: phoneFmt,
  department:  () => '',   // optional select
  designation: () => '',   // optional select
 
  // Role page
  roleName:    alphanumeric('Role name'),
  description: () => '',   // optional
 
  // Password policy
  minLength:              numRange('Minimum length', 4, 128),
  passwordExpiryDays:     numRange('Expiry days', 0, 3650),
  passwordHistoryCount:   numRange('History count', 1, 24),
  maxFailedAttempts:      numRange('Max failed attempts', 1, 20),
  lockoutDurationMinutes: numRange('Lockout duration', 1, 1440),
 
  // Asset fields
  assetName:            alphanumeric('Asset name'),
  brand:                (v) => alphanumeric('Brand', { optional: true })(v),
  model:                (v) => alphanumeric('Model', { optional: true })(v),
  serialNumber:         alphanumericStrict('Serial number'),
  addedBySpId:          (v) => {
    const val = v?.toString().trim();
    if (!val) return 'SP ID is required';
    if (!/^[A-Za-z0-9\-]+$/.test(val)) return 'SP ID must be alphanumeric (hyphens allowed)';
    return '';
  },
  ticketId:             (v) => {
    const val = v?.toString().trim();
    if (!val) return 'Ticket ID is required';
    if (!/^[A-Za-z0-9\-]+$/.test(val)) return 'Ticket ID must be alphanumeric (hyphens allowed)';
    return '';
  },
  requestedByUserId:    (v) => {
    const val = v?.toString().trim();
    if (!val) return 'User ID is required';
    if (!/^[A-Za-z0-9\-]+$/.test(val)) return 'User ID must be alphanumeric (hyphens allowed)';
    return '';
  },
  assignedBySpId:       (v) => {
    const val = v?.toString().trim();
    if (!val) return 'SP ID is required';
    if (!/^[A-Za-z0-9\-]+$/.test(val)) return 'SP ID must be alphanumeric (hyphens allowed)';
    return '';
  },
  rentalVendorName:     (v) => alphanumeric('Vendor name', { optional: true })(v),
  rentalContractNumber: (v) => alphanumericStrict('Contract number')(v),
  spRemarks:            () => '',
  // Bulk Import
  bulkSpId:             (v) => {
    const val = v?.toString().trim();
    if (!val) return 'SP ID is required';
    if (!/^[A-Za-z0-9\-]+$/.test(val)) return 'SP ID must be alphanumeric (hyphens allowed)';
    return '';
  },
};
 
// ── Form-level helpers ────────────────────────────────────────────────────
export const validateCreateUser = (form) => {
  const e = {};
  ['employeeId', 'firstName', 'lastName', 'email', 'phoneNumber'].forEach((k) => {
    const msg = FIELD_VALIDATORS[k]?.(form[k]);
    if (msg) e[k] = msg;
  });
  return e;
};
 
export const validateEditUser = (form) => {
  const e = {};
  ['firstName', 'lastName', 'email', 'phoneNumber'].forEach((k) => {
    const msg = FIELD_VALIDATORS[k]?.(form[k]);
    if (msg) e[k] = msg;
  });
  return e;
};
 
export const validatePasswordPolicy = (form) => {
  const e = {};
  ['minLength', 'passwordExpiryDays', 'passwordHistoryCount',
   'maxFailedAttempts', 'lockoutDurationMinutes'].forEach((k) => {
    const msg = FIELD_VALIDATORS[k]?.(form[k]);
    if (msg) e[k] = msg;
  });
  return e;
};
 
export const validateAssetForm = (form, isEdit = false) => {
  const e = {};
  if (!form.name?.trim()) e.name = 'Asset name is required';
  else if (!/^[a-zA-Z0-9 ]+$/.test(form.name.trim()))
    e.name = 'Asset name must contain only letters, numbers and spaces';
  else if (!/[a-zA-Z]/.test(form.name.trim()))
    e.name = 'Asset name must include at least one letter';
 
  if (!form.category) e.category = 'Category is required';
  if (!form.location) e.location = 'Location is required';
 
  if (form.brand?.trim() && !/^[a-zA-Z0-9 ]+$/.test(form.brand.trim()))
    e.brand = 'Brand must contain only letters, numbers and spaces';
  else if (form.brand?.trim() && !/[a-zA-Z]/.test(form.brand.trim()))
    e.brand = 'Brand must include at least one letter';
 
  if (form.model?.trim() && !/^[a-zA-Z0-9]+$/.test(form.model.trim()))
    e.model = 'Model must contain only letters and numbers (no special characters)';
 
  if (form.serialNumber?.trim() && !/^[A-Za-z0-9\-]+$/.test(form.serialNumber.trim()))
    e.serialNumber = 'Serial number must be alphanumeric (hyphens allowed)';
 
  if (!isEdit) {
    const spVal = form.addedBySpId?.toString().trim();
    if (!spVal) e.addedBySpId = 'SP ID is required';
    else if (!/^[A-Za-z0-9\-]+$/.test(spVal)) e.addedBySpId = 'SP ID must be alphanumeric (hyphens allowed)';
  }
 
  if (form.ownershipType === 'RENTAL') {
    if (!form.rentalVendorName?.trim()) e.rentalVendorName = 'Vendor name is required';
    else if (!/^[a-zA-Z0-9 ]+$/.test(form.rentalVendorName.trim()))
      e.rentalVendorName = 'Vendor name must contain only letters, numbers and spaces';
    else if (!/[a-zA-Z]/.test(form.rentalVendorName.trim()))
      e.rentalVendorName = 'Vendor name must include at least one letter';
    if (!form.rentalStartDate) e.rentalStartDate = 'Rental start date is required';
    if (!form.rentalEndDate) e.rentalEndDate = 'Rental end date is required';
  }
 
  return e;
};
 
export const validateMappingForm = (form, hasAsset) => {
  const e = {};
  if (!hasAsset) e.assetId = 'Please search and select an asset';
  const ticketMsg = FIELD_VALIDATORS.ticketId(form.ticketId);
  if (ticketMsg) e.ticketId = ticketMsg;
  // requestedByUserId removed from mapping form
  const spMsg = FIELD_VALIDATORS.assignedBySpId(form.assignedBySpId);
  if (spMsg) e.assignedBySpId = spMsg;
  return e;
};
 
 
import React, { useState } from 'react';
import { TextField, CircularProgress } from '@mui/material';
import { createCategory } from '../../api/kbApi';
import toast from '../../utils/toast';
import '../../styles/global.css';
 
export default function CategoryModal({ onClose, onCreated }) {
  const [name, setName]       = useState('');
  const [desc, setDesc]       = useState('');
  const [saving, setSaving]   = useState(false);
  const [nameErr, setNameErr] = useState('');
 
  const handleCreate = async () => {
    if (!name.trim()) { setNameErr('Category name is required.'); return; }
    if (/^[\d\s!@#$%^&*()\-_+=]+$/.test(name.trim())) {
      setNameErr('Name must contain at least one letter.'); return;
    }
    setNameErr('');
    setSaving(true);
    try {
      const res = await createCategory({ name: name.trim(), description: desc.trim() || null });
      toast.success(`Category "${name}" created!`);
      onCreated(res.data?.data || res.data);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to create category.');
    }
    setSaving(false);
  };
 
  return (
    <div className="kb-modal-overlay" onClick={onClose}>
      <div className="kb-modal" onClick={e => e.stopPropagation()}>
        <div className="kb-modal-title">Add New Category</div>
        <TextField
          label="Category Name *"
          value={name}
          onChange={e => { setName(e.target.value); setNameErr(''); }}
          fullWidth size="small"
          error={!!nameErr}
          helperText={nameErr || `${name.length}/50`}
          inputProps={{ maxLength: 50 }}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Description (optional)"
          value={desc}
          onChange={e => setDesc(e.target.value)}
          fullWidth size="small" multiline rows={2}
          inputProps={{ maxLength: 200 }}
          helperText={`${desc.length}/200`}
          sx={{ mb: 3 }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button className="kb-btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="kb-btn-primary" onClick={handleCreate} disabled={saving}>
            {saving ? <CircularProgress size={14} color="inherit" /> : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}
 
 
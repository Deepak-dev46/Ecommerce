import React, { useState, useRef, useEffect } from 'react';

import {

  Drawer, Box, Typography, Avatar, IconButton, Button,

  Divider, TextField, CircularProgress, Tooltip, Skeleton,

} from '@mui/material';

import {

  Close, PhotoCamera, Edit, Save, Cancel,

  Badge, Email, Phone, Business, Work, Person,

} from '@mui/icons-material';

import { motion, AnimatePresence } from 'framer-motion';

import { toast } from 'react-toastify';

import { userAxios } from '../../api/axiosInstance';

import StatusChip from '../common/StatusChip';

const GRAD = 'linear-gradient(135deg, #27235C 0%, #97247E 60%, #E01950 100%)';

// ─── Field row ────────────────────────────────────────────────────────────────

const FieldRow = ({ icon, label, value, editing, onChange, placeholder, required, editable = false }) => (
  <Box sx={{

    display: 'flex',

    alignItems: editing && editable ? 'flex-start' : 'center',

    gap: 1.5,

    py: 1.4,

    borderBottom: '1px solid #F5F5FB',

  }}>
    <Box sx={{

      width: 34, height: 34, borderRadius: 2, flexShrink: 0,

      bgcolor: '#F4F3FB',

      display: 'flex', alignItems: 'center', justifyContent: 'center',

    }}>

      {React.cloneElement(icon, { sx: { fontSize: 16, color: '#97247E' } })}
    </Box>
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography sx={{

        fontSize: 10, color: '#9CA3AF', fontWeight: 600,

        textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.2,

      }}>

        {label}{required && <span style={{ color: '#E01950', marginLeft: 2 }}>*</span>}
      </Typography>

      {editing && editable ? (
        <TextField

          size="small" fullWidth value={value}

          onChange={e => onChange(e.target.value)}

          placeholder={placeholder}

          sx={{

            '& .MuiOutlinedInput-root': {

              borderRadius: 1.5, fontSize: 13,

              '& fieldset': { borderColor: '#E0DEFF' },

              '&:hover fieldset': { borderColor: '#97247E' },

              '&.Mui-focused fieldset': { borderColor: '#97247E' },

            },

            '& .MuiInputBase-input': { py: 0.7, px: 1.2 },

          }}

        />

      ) : (
        <Typography sx={{ fontWeight: 600, color: '#1B193F', fontSize: 13 }} noWrap>

          {value || '—'}
        </Typography>

      )}
    </Box>
  </Box>

);

// ─── Section label ────────────────────────────────────────────────────────────

const SectionLabel = ({ children }) => (
  <Typography sx={{

    fontSize: 10, fontWeight: 700, color: '#27235C',

    textTransform: 'uppercase', letterSpacing: '0.08em',

    display: 'block', pt: 2, pb: 0.5,

  }}>

    {children}
  </Typography>

);

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ProfilePanel({ open, onClose, profile, loading, onProfileUpdated, updateUserSession }) {

  const fileInputRef = useRef(null);

  const [editing, setEditing] = useState(false);

  const [saving, setSaving] = useState(false);

  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [photoError, setPhotoError] = useState('');

  const [form, setForm] = useState({ firstName: '', lastName: '', mobile: '' });

  useEffect(() => {

    if (profile) setForm({

      firstName: profile.firstName || '',

      lastName: profile.lastName || '',

      mobile: profile.mobile || '',

    });

  }, [profile]);

  const handleClose = () => {

    setEditing(false);

    setPhotoError('');

    onClose();

  };

  const fullName = profile

    ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim()

    : '';

  // ── Photo upload ──────────────────────────────────────────────────────────

  const handlePhotoChange = async (e) => {

    const file = e.target.files[0];

    setPhotoError('');

    if (!file) return;

    if (!file.type.startsWith('image/')) {

      setPhotoError('Only image files are supported (JPG, PNG, GIF, etc.)');

      e.target.value = '';

      return;

    }

    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);

    if (file.size > 5 * 1024 * 1024) {

      setPhotoError(`File is ${sizeMB} MB — max allowed is 5 MB.`);

      e.target.value = '';

      return;

    }

    try {

      setUploadingPhoto(true);

      const fd = new FormData();

      fd.append('file', file);

      const res = await userAxios.post('/api/v1/users/profile/photo', fd);

      const updated = { ...profile, profilePicture: res.data?.profilePicture || res.data?.url };

      onProfileUpdated?.(updated);

      updateUserSession?.(updated);

      toast.success('Profile photo updated');

    } catch (err) {

      setPhotoError(err.response?.data?.message || 'Upload failed. Please try again.');

    } finally {

      setUploadingPhoto(false);

      e.target.value = '';

    }

  };

  // ── Save profile ──────────────────────────────────────────────────────────

  const handleSave = async () => {

    if (!form.firstName.trim()) { toast.error('First name is required'); return; }

    if (!form.lastName.trim()) { toast.error('Last name is required'); return; }

    try {

      setSaving(true);

      const res = await userAxios.put('/api/v1/users/profile', {

        firstName: form.firstName.trim(),

        lastName: form.lastName.trim(),

        mobile: form.mobile.trim(),

      });

      onProfileUpdated?.(res.data);

      updateUserSession?.(res.data);

      toast.success('Profile updated successfully');

      setEditing(false);

    } catch (err) {

      toast.error(err.response?.data?.message || 'Failed to update profile');

    } finally {

      setSaving(false);

    }

  };

  const cancelEdit = () => {

    setEditing(false);

    setForm({

      firstName: profile?.firstName || '',

      lastName: profile?.lastName || '',

      mobile: profile?.mobile || '',

    });

  };

  return (
    <Drawer

      anchor="right"

      open={open}

      onClose={handleClose}

      PaperProps={{

        sx: {

          width: { xs: '100vw', sm: 360 },

          borderRadius: '16px 0 0 16px',

          display: 'flex',

          flexDirection: 'column',

          overflow: 'hidden',

          bgcolor: '#FAFAFC',

        },

      }}
    >

      {/* ══ GRADIENT HERO ═══════════════════════════════════════════════════ */}
      <Box sx={{

        background: GRAD,

        px: 2.5, pt: 2.5, pb: 3,

        position: 'relative',

        overflow: 'hidden',

        flexShrink: 0,

      }}>

        {/* decorative blobs */}
        <Box sx={{

          position: 'absolute', right: -40, top: -40,

          width: 150, height: 150, borderRadius: '50%',

          bgcolor: 'rgba(255,255,255,0.07)', pointerEvents: 'none',

        }} />
        <Box sx={{

          position: 'absolute', left: -30, bottom: -30,

          width: 110, height: 110, borderRadius: '50%',

          bgcolor: 'rgba(255,255,255,0.05)', pointerEvents: 'none',

        }} />

        {/* top row: title + close */}
        <Box sx={{

          display: 'flex', justifyContent: 'space-between', alignItems: 'center',

          mb: 2.5, position: 'relative', zIndex: 1,

        }}>
          <Typography fontWeight={700} fontSize={14} color="#fff" letterSpacing={0.4}>

            My Profile
          </Typography>
          <IconButton size="small" onClick={handleClose} sx={{

            color: 'rgba(255,255,255,0.85)', p: 0.5,

            '&:hover': { bgcolor: 'rgba(255,255,255,0.12)' },

          }}>
            <Close sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        {/* avatar centred */}
        <Box sx={{

          display: 'flex', flexDirection: 'column', alignItems: 'center',

          position: 'relative', zIndex: 1,

        }}>
          <Box sx={{ position: 'relative', mb: 1.5 }}>

            {loading ? (
              <Skeleton variant="circular" width={76} height={76}

                sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />

            ) : (
              <>
                <Avatar

                  src={profile?.profilePicture}

                  sx={{

                    width: 76, height: 76,

                    bgcolor: 'rgba(255,255,255,0.22)',

                    border: '3px solid rgba(255,255,255,0.45)',

                    fontSize: 28, fontWeight: 800, color: '#fff',

                    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',

                  }}
                >

                  {fullName.charAt(0)}
                </Avatar>
                <Tooltip title="Upload photo · max 5 MB">
                  <IconButton

                    size="small"

                    onClick={() => { setPhotoError(''); fileInputRef.current?.click(); }}

                    disabled={uploadingPhoto}

                    sx={{

                      position: 'absolute', bottom: 0, right: 0,

                      bgcolor: '#27235C', color: '#fff',

                      width: 24, height: 24,

                      border: '2.5px solid rgba(255,255,255,0.6)',

                      '&:hover': { bgcolor: '#97247E' },

                      boxShadow: '0 2px 6px rgba(0,0,0,0.25)',

                    }}
                  >

                    {uploadingPhoto

                      ? <CircularProgress size={10} color="inherit" />

                      : <PhotoCamera sx={{ fontSize: 12 }} />}
                  </IconButton>
                </Tooltip>
                <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handlePhotoChange} />
              </>

            )}
          </Box>

          {loading ? (
            <>
              <Skeleton width={140} height={18} sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
              <Skeleton width={180} height={14} sx={{ bgcolor: 'rgba(255,255,255,0.15)', mt: 0.5 }} />
            </>

          ) : (
            <>
              <Typography fontWeight={800} fontSize={16} color="#fff" textAlign="center">

                {fullName || '—'}
              </Typography>
              <Typography variant="caption" display="block" textAlign="center"

                sx={{ color: 'rgba(255,255,255,0.72)', mt: 0.3, mb: 0.8 }}>

                {profile?.email || '—'}
              </Typography>
              <Box sx={{

                display: 'flex', gap: 0.8, flexWrap: 'wrap',

                justifyContent: 'center', alignItems: 'center',

              }}>

                {profile?.status && <StatusChip status={profile.status} />}

                {profile?.employeeId && (
                  <Box sx={{

                    px: 1, py: 0.2, borderRadius: 1,

                    bgcolor: 'rgba(255,255,255,0.14)',

                    border: '1px solid rgba(255,255,255,0.25)',

                  }}>
                    <Typography sx={{

                      fontSize: 10, fontWeight: 700,

                      color: 'rgba(255,255,255,0.85)',

                    }}>

                      {profile.employeeId}
                    </Typography>
                  </Box>

                )}
              </Box>
            </>

          )}

          {/* photo error — animated */}
          <AnimatePresence>

            {photoError && (
              <motion.div

                initial={{ opacity: 0, y: -6 }}

                animate={{ opacity: 1, y: 0 }}

                exit={{ opacity: 0, y: -6 }}

                transition={{ duration: 0.2 }}

                style={{ width: '100%', marginTop: 10 }}
              >
                <Box sx={{

                  px: 1.5, py: 0.8, borderRadius: 1.5,

                  bgcolor: 'rgba(224,25,80,0.22)',

                  border: '1px solid rgba(224,25,80,0.45)',

                }}>
                  <Typography sx={{ fontSize: 11, color: '#ffd0dc', fontWeight: 500 }}>

                    ⚠ {photoError}
                  </Typography>
                </Box>
              </motion.div>

            )}
          </AnimatePresence>
        </Box>
      </Box>

      {/* ══ SCROLLABLE BODY ═════════════════════════════════════════════════ */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 2.5, pb: 3 }}>

        {/* Edit / Save / Cancel row */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 2, pb: 0.5 }}>

          {editing ? (
            <Box sx={{ display: 'flex', gap: 0.8 }}>
              <Button size="small" onClick={cancelEdit}

                startIcon={<Cancel sx={{ fontSize: 13 }} />}

                sx={{

                  fontSize: 11, fontWeight: 600, borderRadius: 1.5,

                  color: '#E01950', border: '1px solid #E01950',

                  py: 0.4, px: 1.3, textTransform: 'none',

                }}>

                Cancel
              </Button>
              <Button size="small" variant="contained" onClick={handleSave} disabled={saving}

                startIcon={saving

                  ? <CircularProgress size={11} color="inherit" />

                  : <Save sx={{ fontSize: 13 }} />}

                sx={{

                  fontSize: 11, fontWeight: 600, borderRadius: 1.5,

                  background: GRAD, py: 0.4, px: 1.5, textTransform: 'none',

                  boxShadow: '0 2px 8px rgba(39,35,92,0.25)',

                  '&:hover': { background: 'linear-gradient(135deg,#1e1a4a,#7a1d66)' },

                }}>

                {saving ? 'Saving…' : 'Save Changes'}
              </Button>
            </Box>

          ) : (
            <Button size="small" onClick={() => setEditing(true)}

              startIcon={<Edit sx={{ fontSize: 13 }} />}

              sx={{

                fontSize: 11, fontWeight: 600, borderRadius: 1.5,

                color: '#27235C', border: '1px solid #DDDAF0',

                bgcolor: '#fff', py: 0.4, px: 1.3, textTransform: 'none',

                '&:hover': { borderColor: '#27235C', bgcolor: '#F5F4FC' },

              }}>

              Edit Profile
            </Button>

          )}
        </Box>

        {/* ── Fields ── */}

        {loading ? (
          <Box sx={{ pt: 1 }}>

            {[...Array(7)].map((_, i) => (
              <Box key={i} sx={{

                display: 'flex', gap: 1.5, py: 1.4,

                borderBottom: '1px solid #F5F5FB',

              }}>
                <Skeleton variant="rounded" width={34} height={34}

                  sx={{ borderRadius: 2, flexShrink: 0 }} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton width={80} height={11} />
                  <Skeleton width={160} height={15} sx={{ mt: 0.4 }} />
                </Box>
              </Box>

            ))}
          </Box>

        ) : (
          <motion.div

            initial={{ opacity: 0, y: 8 }}

            animate={{ opacity: 1, y: 0 }}

            transition={{ duration: 0.25 }}
          >

            {/* Personal */}
            <SectionLabel>Personal</SectionLabel>
            <FieldRow

              icon={<Person />} label="First Name" required

              editable editing={editing}

              value={form.firstName}

              displayValue={profile?.firstName}

              onChange={v => setForm(p => ({ ...p, firstName: v }))}

            />
            <FieldRow

              icon={<Person />} label="Last Name"

              editable editing={editing}

              value={form.lastName}

              displayValue={profile?.lastName}

              onChange={v => setForm(p => ({ ...p, lastName: v }))}

            />
            <FieldRow

              icon={<Badge />} label="Employee ID"

              value={profile?.employeeId}

            />

            {/* Contact */}
            <SectionLabel>Contact</SectionLabel>
            <FieldRow

              icon={<Email />} label="Email Address"

              value={profile?.email}

            />
            <FieldRow

              icon={<Phone />} label="Mobile Number"

              editable editing={editing}

              value={form.mobile}

              displayValue={profile?.mobile}

              placeholder="+91 XXXXX XXXXX"

              onChange={v => setForm(p => ({ ...p, mobile: v }))}

            />

            {/* Department */}
            <SectionLabel>Department</SectionLabel>
            <FieldRow

              icon={<Business />} label="Department"

              value={profile?.departmentName}

            />
            <FieldRow

              icon={<Work />} label="Designation"

              value={profile?.designationName}

            />
          </motion.div>

        )}
      </Box>
    </Drawer>

  );

}

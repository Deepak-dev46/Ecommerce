// src/pages/rmo/projects/ProjectDetailsDrawer.jsx
import React, { useState, useEffect } from 'react';
import {
  Drawer, Box, Typography, IconButton, Divider, Grid,
  Chip, Button, TextField, MenuItem, CircularProgress,
  Alert, Tooltip,
} from '@mui/material';
import { Close, Edit, Save, Cancel, Person } from '@mui/icons-material';
import { rmoApi, RMO_PROJECT_STATUSES, RMO_DEPARTMENTS } from '../../../api/rmoApi';
import { formatDate, formatDateTime } from '../../../utils/formatters';
 
const FIELD = ({ label, value, mono = false }) => (
  <Box>
    <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.25 }}>
      {label}
    </Typography>
    <Typography sx={{ fontSize: '0.85rem', color: '#1B193F', fontFamily: mono ? 'monospace' : 'inherit' }}>
      {value || '—'}
    </Typography>
  </Box>
);
 
const ProjectDetailsDrawer = ({ open, project, users = [], onClose, onUpdated }) => {
  const [editMode, setEditMode] = useState(false);
  const [form, setForm]         = useState({});
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');
  const [members, setMembers]   = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
 
  useEffect(() => {
    
    if (project) {
      setForm({
        projectName:  project.projectName  || '',
        description:  project.description  || '',
        status:       project.status       || 'ACTIVE',
        department:   project.department   || '',
        resourceOwnerid: project.resourceOwnerid || '',
        l1ManagerId:  project.l1ManagerId  || '',
        l2ManagerId:  project.l2ManagerId  || '',
      });
      setEditMode(false);
      setError('');
      // Load members
      setLoadingMembers(true);
      rmoApi.getProjectMembers(project.id)
        .then((r) => setMembers(r.data || []))
        .catch(() => setMembers([]))
        .finally(() => setLoadingMembers(false));
    }
  }, [project]);
 
  const getUserName = (id) => {
    const u = users.find((u) => u.id === id || u.id === Number(id));
    return u ? `${u.firstName} ${u.lastName}` : id ? `#${id}` : '—';
  };
 
  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      await rmoApi.updateProject(project.id, form);
      onUpdated?.();
      setEditMode(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update project.');
    } finally {
      setSaving(false);
    }
  };
 
  const STATUS_COLORS = {
    ACTIVE:    { bg: '#DCFCE7', color: '#15803D' },
    INACTIVE:  { bg: '#F3F4F6', color: '#6B7280' },
    COMPLETED: { bg: '#DBEAFE', color: '#1D4ED8' },
    ON_HOLD:   { bg: '#FEF9C3', color: '#854D0E' },
  };
  const MEMBERSHIP_COLORS = {
    PRIMARY:   { bg: '#EEF0FF', color: '#27235C' },
    SECONDARY: { bg: '#F3F4F6', color: '#6B7280' },
  };
 
  if (!project) return null;
 
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100%', sm: 520 }, p: 0 } }}
    >
      {/* Header */}
      <Box sx={{ px: 3, py: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #E5E7EB' }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography fontWeight={700} fontSize="1rem" noWrap>{project.projectName}</Typography>
            {project.status && (
              <Chip
                label={project.status.replace('_', ' ')} size="small"
                sx={{ bgcolor: STATUS_COLORS[project.status]?.bg, color: STATUS_COLORS[project.status]?.color, fontWeight: 700, fontSize: '0.68rem', height: 20, border: `1px solid ${STATUS_COLORS[project.status]?.color}30` }}
              />
            )}
          </Box>
          <Typography fontSize="0.75rem" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
            {project.projectCode || 'No code'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {!editMode && (
            <Tooltip title="Edit project">
              <IconButton size="small" onClick={() => setEditMode(true)} sx={{ color: '#27235C' }}>
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <IconButton size="small" onClick={onClose}><Close fontSize="small" /></IconButton>
        </Box>
      </Box>
 
      <Box sx={{ overflowY: 'auto', flex: 1, pb: 4 }}>
        {error && <Alert severity="error" sx={{ m: 2, borderRadius: 2 }}>{error}</Alert>}
 
        {/* ── Edit form ───────────────────────────────────────────────────── */}
        {editMode ? (
          <Box sx={{ p: 3 }}>
            <Typography fontWeight={700} fontSize="0.85rem" sx={{ mb: 2, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Edit Project
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField fullWidth label="Project Name" value={form.projectName}
                  onChange={(e) => setForm((f) => ({ ...f, projectName: e.target.value }))} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth multiline rows={3} label="Description" value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
              </Grid>
              <Grid item xs={6}>
                <TextField select fullWidth label="Status" value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
                  {RMO_PROJECT_STATUSES.map((s) => <MenuItem key={s} value={s}>{s.replace('_', ' ')}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={6}>
                <TextField select fullWidth label="Department" value={form.department}
                  onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}>
                  {RMO_DEPARTMENTS.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                </TextField>
              </Grid>
 
              {/* Manager reassignment */}
              <Grid item xs={12}>
                <Typography fontWeight={700} fontSize="0.8rem" color="text.secondary" sx={{ mb: 1 }}>Reassign Managers</Typography>
              </Grid>
              {[
                { label: 'Resource Owner', key: 'resourceOwnerid' },
                { label: 'L1 Manager',     key: 'l1ManagerId' },
                { label: 'L2 Manager',     key: 'l2ManagerId' },
              ].map(({ label, key }) => (
                <Grid item xs={12} sm={6} key={key}>
                  <TextField select fullWidth label={label} value={form[key] || ''}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}>
                    <MenuItem value="">— Remove —</MenuItem>
                    {users.filter((u) => u.status === 'ACTIVE' || u.status === 'PENDINGACTIVATION').map((u) => (
                      <MenuItem key={u.id} value={u.id}>
                        {u.firstName} {u.lastName} ({u.designation || u.department})
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              ))}
            </Grid>
            <Box sx={{ display: 'flex', gap: 1, mt: 3 }}>
              <Button variant="outlined" startIcon={<Cancel />} onClick={() => { setEditMode(false); setError(''); }} disabled={saving}>
                Cancel
              </Button>
              <Button variant="contained" startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Save />}
                onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : 'Save Changes'}
              </Button>
            </Box>
          </Box>
        ) : (
          /* ── Read-only view ─────────────────────────────────────────────── */
          <>
            {/* Basic info */}
            <Box sx={{ p: 3 }}>
              <Typography fontWeight={700} fontSize="0.78rem" color="text.secondary" sx={{ mb: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Project Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}><FIELD label="Client" value={project.client} /></Grid>
                <Grid item xs={6}><FIELD label="Practice" value={project.practice} /></Grid>
                <Grid item xs={6}><FIELD label="Business Unit" value={project.businessUnit} /></Grid>
                <Grid item xs={6}><FIELD label="Region" value={project.region} /></Grid>
                <Grid item xs={6}><FIELD label="Department" value={project.department} /></Grid>
                <Grid item xs={6}><FIELD label="Engagement Model" value={project.engagementModel} /></Grid>
                <Grid item xs={6}><FIELD label="Category" value={project.category} /></Grid>
                <Grid item xs={6}><FIELD label="Type" value={project.type} /></Grid>
                <Grid item xs={6}><FIELD label="Division" value={project.division} /></Grid>
                <Grid item xs={6}><FIELD label="Cost Group" value={project.costGroup} /></Grid>
                <Grid item xs={12}><FIELD label="Description" value={project.description} /></Grid>
              </Grid>
            </Box>
            <Divider />
 
             {/* Managers */}
            <Box sx={{ p: 3 }}>
              <Typography fontWeight={700} fontSize="0.78rem" color="text.secondary" sx={{ mb: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Assigned Managers
              </Typography>
              <Grid container spacing={2}>
                {[
                  { label: 'Resource Owner', id: project.resourceOwnerid },
                  { label: 'L1 Manager',     id: project.l1ManagerId },
                  { label: 'L2 Manager',     id: project.l2ManagerId },
                ].map(({ label, id }) => (
                  <Grid item xs={12} sm={4} key={label}>
                    <Box sx={{ p: 1.5, borderRadius: 2, border: '1px solid #E5E7EB', bgcolor: '#FAFAFA' }}>
                      <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5 }}>
                        {label}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <Person sx={{ fontSize: 14, color: id ? '#97247E' : '#D1D5DB' }} />
                        <Typography sx={{ fontSize: '0.82rem', fontWeight: id ? 600 : 400, color: id ? '#1B193F' : '#9CA3AF' }}>
                          {getUserName(id)}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
            <Divider />
 
            {/* Members */}
            <Box sx={{ p: 3 }}>
              <Typography fontWeight={700} fontSize="0.78rem" color="text.secondary" sx={{ mb: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Assigned Employees ({members.length})
              </Typography>
              {loadingMembers
                ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}><CircularProgress size={24} /></Box>
                : members.length === 0
                ? <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>No employees assigned yet.</Typography>
                : members.map((m) => (
                    <Box key={m.userId} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1, borderBottom: '1px solid #F9F9FC' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: '#EEF0FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Person sx={{ fontSize: 14, color: '#27235C' }} />
                        </Box>
                        <Typography sx={{ fontSize: '0.82rem', fontWeight: 500 }}>
                          {getUserName(m.userId)}
                        </Typography>
                      </Box>
                      <Chip
                        label={m.membershipType} size="small"
                        sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700, bgcolor: MEMBERSHIP_COLORS[m.membershipType]?.bg, color: MEMBERSHIP_COLORS[m.membershipType]?.color }}
                      />
                    </Box>
                  ))
              }
            </Box>
            <Divider />
 
            {/* Timestamps */}
            <Box sx={{ p: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}><FIELD label="Created" value={formatDateTime(project.createdAt)} /></Grid>
                <Grid item xs={6}><FIELD label="Last Updated" value={formatDateTime(project.updatedAt)} /></Grid>
                <Grid item xs={6}><FIELD label="Client Owner" value={project.clientOwner} /></Grid>
                <Grid item xs={6}><FIELD label="Reporting" value={project.reportingDetails} /></Grid>
                <Grid item xs={6}><FIELD label="Started At" value={project.projectStartDate} /></Grid>
                <Grid item xs={6}><FIELD label="Ended At" value={project.projectEndDate} /></Grid>
              </Grid>
            </Box>
          </>
        )}
      </Box>
    </Drawer>
  );
};
 
export default ProjectDetailsDrawer;
 
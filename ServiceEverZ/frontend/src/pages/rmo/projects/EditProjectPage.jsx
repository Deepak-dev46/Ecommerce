import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  MenuItem,
  Button,
  Stepper,
  Step,
  StepLabel,
  Alert,
  CircularProgress,
  Divider,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  InputAdornment,
  IconButton,
  Pagination,
  Stack,
  Chip,
} from '@mui/material';
import {
  ArrowBack,
  ArrowForward,
  Save,
  Business,
  Group,
  Preview,
  Search,
  Close,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { rmoApi, RMO_DEPARTMENTS, RMO_ENGAGEMENT_MODELS, RMO_PROJECT_STATUSES } from '../../../api/rmoApi';
import PageHeader from '../../../components/common/PageHeader';
 
const STEPS = [
  { label: 'Basic Info', icon: Business, desc: 'Project name, client, dates, and classification' },
  { label: 'Business Info', icon: Business, desc: 'Business unit, department, engagement model' },
  { label: 'Managers', icon: Group, desc: 'Reassign Resource Owner, L1, and L2 managers' },
  { label: 'Review', icon: Preview, desc: 'Review changes before saving' },
];
 
const PAGE_SIZE = 6;
 
const EMPTY_FORM = {
  id: null,
  projectCode: '',
  projectName: '',
  client: '',
  description: '',
  practice: '',
  projectShortName: '',
  displayName: '',
  type: '',
  category: '',
 
  businessUnit: '',
  department: '',
  region: '',
  engagementModel: '',
  costGroup: '',
  clientCostCenter: '',
  division: '',
  reportingDetails: '',
  clientOwner: '',
 
  status: 'ACTIVE',
  projectStartDate: '',
  projectEndDate: '',
 
  resourceOwnerId: null,
  l1ManagerId: null,
  l2ManagerId: null,
};
 
const normalizeDate = (value) => {
  if (!value) return '';
  if (typeof value === 'string' && value.length >= 10) return value.slice(0, 10);
  return '';
};
 
const EmployeePickerDialog = ({
  open,
  onClose,
  users,
  value,
  onSelect,
  title,
}) => {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
 
  useEffect(() => {
    if (open) {
      setQuery('');
      setPage(1);
    }
  }, [open]);
 
  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
 
    return users.filter((u) =>
      [
        u.firstName,
        u.lastName,
        u.employeeId,
        u.email,
        u.designation,
        u.department,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }, [users, query]);
 
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
 
  const pagedUsers = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredUsers.slice(start, start + PAGE_SIZE);
  }, [filteredUsers, page]);
 
  const selectedUser = users.find((u) => u.id === value) || null;
 
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6" fontWeight={700}>{title}</Typography>
            <Typography variant="body2" color="text.secondary">
              Search and select an employee from the paginated list.
            </Typography>
          </Box>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
 
      <DialogContent dividers>
        <TextField
          fullWidth
          size="small"
          placeholder="Search by name, employee ID, email, designation, department"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />
 
        {selectedUser && (
          <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
            Selected: {selectedUser.firstName} {selectedUser.lastName} ({selectedUser.employeeId || 'N/A'})
          </Alert>
        )}
 
        <List sx={{ pt: 0 }}>
          {pagedUsers.length > 0 ? (
            pagedUsers.map((u) => {
              const active = value === u.id;
              return (
                <ListItemButton
                  key={u.id}
                  selected={active}
                  onClick={() => onSelect(u.id)}
                  sx={{
                    mb: 1,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: active ? '#97247E' : '#ECECF3',
                    bgcolor: active ? 'rgba(151,36,126,0.06)' : '#fff',
                    alignItems: 'flex-start',
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: '#EEF0FF', color: '#27235C', fontWeight: 700 }}>
                      {u.firstName?.[0]}{u.lastName?.[0]}
                    </Avatar>
                  </ListItemAvatar>
 
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Typography sx={{ fontWeight: 700, color: '#1B193F' }}>
                          {u.firstName} {u.lastName}
                        </Typography>
                        {active && <Chip size="small" color="secondary" label="Selected" />}
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 0.5 }}>
                        <Typography variant="body2" sx={{ color: '#6B7280' }}>
                          #{u.employeeId || 'N/A'} · {u.designation || 'No designation'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                          {u.department || 'No department'} {u.email ? `· ${u.email}` : ''}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItemButton>
              );
            })
          ) : (
            <Alert severity="warning" sx={{ borderRadius: 2 }}>
              No employees found for the current search.
            </Alert>
          )}
        </List>
 
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Pagination
            page={page}
            count={totalPages}
            onChange={(_, val) => setPage(val)}
            color="secondary"
            shape="rounded"
          />
        </Box>
      </DialogContent>
 
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button variant="outlined" onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};
 
const ManagerSelectorCard = ({
  title,
  value,
  users,
  onPick,
  onClear,
  error,
  clearDisabled = false,
}) => {
  const selected = users.find((u) => u.id === value);
 
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 3,
        borderColor: error ? '#D32F2F' : '#ECECF3',
        bgcolor: '#FCFCFE',
        boxShadow: 'none',
      }}
    >
      <CardContent>
        <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#6B7280', mb: 1.2 }}>
          {title}
        </Typography>
 
        {selected ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1.5,
              p: 1.5,
              borderRadius: 2,
              border: '1px solid #E8EAF3',
              bgcolor: '#fff',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ bgcolor: '#EEF0FF', color: '#27235C', fontWeight: 700 }}>
                {selected.firstName?.[0]}{selected.lastName?.[0]}
              </Avatar>
              <Box>
                <Typography sx={{ fontWeight: 700, color: '#1B193F', fontSize: '0.92rem' }}>
                  {selected.firstName} {selected.lastName}
                </Typography>
                <Typography sx={{ color: '#6B7280', fontSize: '0.78rem' }}>
                  #{selected.employeeId || 'N/A'} · {selected.designation || 'No designation'} · {selected.department || 'No department'}
                </Typography>
              </Box>
            </Box>
 
            <Stack direction="row" spacing={1}>
              <Button size="small" variant="outlined" onClick={onPick}>
                Change
              </Button>
              <Button size="small" color="error" onClick={onClear} disabled={clearDisabled}>
                Remove
              </Button>
            </Stack>
          </Box>
        ) : (
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              border: '1px dashed #D7DBE8',
              bgcolor: '#fff',
            }}
          >
            <Typography sx={{ color: '#6B7280', fontSize: '0.85rem', mb: 1.5 }}>
              No employee selected.
            </Typography>
            <Button variant="contained" onClick={onPick}>
              Select Employee
            </Button>
          </Box>
        )}
 
        {error && (
          <Typography sx={{ mt: 1, fontSize: '0.75rem', color: '#D32F2F' }}>
            {error}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};
 
const Step1 = ({ form, setForm, errors, setErrors }) => {
  const handleStartDateChange = (value) => {
    setForm((f) => ({ ...f, projectStartDate: value }));
 
    setErrors((prev) => {
      const next = { ...prev };
      if (form.projectEndDate && value && new Date(form.projectEndDate) < new Date(value)) {
        next.projectEndDate = 'End date cannot be before start date';
      } else {
        delete next.projectEndDate;
      }
      return next;
    });
  };
 
  const handleEndDateChange = (value) => {
    setForm((f) => ({ ...f, projectEndDate: value }));
 
    setErrors((prev) => {
      const next = { ...prev };
      if (value && form.projectStartDate && new Date(value) < new Date(form.projectStartDate)) {
        next.projectEndDate = 'End date cannot be before start date';
      } else {
        delete next.projectEndDate;
      }
      return next;
    });
  };
 
  return (
    <Grid container spacing={2.5}>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          required
          label="Project Name"
          value={form.projectName}
          onChange={(e) => setForm((f) => ({ ...f, projectName: e.target.value }))}
          error={!!errors.projectName}
          helperText={errors.projectName}
        />
      </Grid>
 
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          required
          label="Client Name"
          value={form.client}
          onChange={(e) => setForm((f) => ({ ...f, client: e.target.value }))}
          error={!!errors.client}
          helperText={errors.client}
        />
      </Grid>
 
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Project Code"
          value={form.projectCode}
          InputProps={{ readOnly: true }}
        />
      </Grid>
 
      <Grid item xs={12} sm={6}>
        <TextField
          select
          fullWidth
          label="Status"
          value={form.status}
          onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
          error={!!errors.status}
          helperText={errors.status}
        >
          {RMO_PROJECT_STATUSES.map((s) => (
            <MenuItem key={s} value={s}>
              {s.replaceAll('_', ' ')}
            </MenuItem>
          ))}
        </TextField>
      </Grid>
 
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          type="date"
          label="Project Start Date"
          InputLabelProps={{ shrink: true }}
          value={form.projectStartDate}
          onChange={(e) => handleStartDateChange(e.target.value)}
          error={!!errors.projectStartDate}
          helperText={errors.projectStartDate}
        />
      </Grid>
 
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          type="date"
          label="Project End Date"
          InputLabelProps={{ shrink: true }}
          value={form.projectEndDate}
          onChange={(e) => handleEndDateChange(e.target.value)}
          error={!!errors.projectEndDate}
          helperText={errors.projectEndDate}
        />
      </Grid>
 
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Display Name"
          value={form.displayName}
          onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
        />
      </Grid>
 
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Project Short Name"
          value={form.projectShortName}
          onChange={(e) => setForm((f) => ({ ...f, projectShortName: e.target.value }))}
        />
      </Grid>
 
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Practice"
          value={form.practice}
          onChange={(e) => setForm((f) => ({ ...f, practice: e.target.value }))}
        />
      </Grid>
 
      <Grid item xs={12} sm={3}>
        <TextField
          fullWidth
          label="Type"
          value={form.type}
          onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
        />
      </Grid>
 
      <Grid item xs={12} sm={3}>
        <TextField
          fullWidth
          label="Category"
          value={form.category}
          onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
        />
      </Grid>
 
      <Grid item xs={12}>
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Description"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        />
      </Grid>
    </Grid>
  );
};
 
const Step2 = ({ form, setForm }) => (
  <Grid container spacing={2.5}>
    <Grid item xs={12} sm={6}>
      <TextField
        fullWidth
        label="Business Unit"
        value={form.businessUnit}
        onChange={(e) => setForm((f) => ({ ...f, businessUnit: e.target.value }))}
      />
    </Grid>
 
    <Grid item xs={12} sm={6}>
      <TextField
        select
        fullWidth
        label="Department"
        value={form.department}
        onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
      >
        <MenuItem value="">— Select —</MenuItem>
        {RMO_DEPARTMENTS.map((d) => (
          <MenuItem key={d} value={d}>{d}</MenuItem>
        ))}
      </TextField>
    </Grid>
 
    <Grid item xs={12} sm={6}>
      <TextField
        fullWidth
        label="Region"
        value={form.region}
        onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))}
      />
    </Grid>
 
    <Grid item xs={12} sm={6}>
      <TextField
        select
        fullWidth
        label="Engagement Model"
        value={form.engagementModel}
        onChange={(e) => setForm((f) => ({ ...f, engagementModel: e.target.value }))}
      >
        <MenuItem value="">— Select —</MenuItem>
        {RMO_ENGAGEMENT_MODELS.map((m) => (
          <MenuItem key={m} value={m}>{m.replaceAll('_', ' ')}</MenuItem>
        ))}
      </TextField>
    </Grid>
 
    <Grid item xs={12} sm={4}>
      <TextField
        fullWidth
        label="Cost Group"
        value={form.costGroup}
        onChange={(e) => setForm((f) => ({ ...f, costGroup: e.target.value }))}
      />
    </Grid>
 
    <Grid item xs={12} sm={4}>
      <TextField
        fullWidth
        label="Client Cost Center"
        value={form.clientCostCenter}
        onChange={(e) => setForm((f) => ({ ...f, clientCostCenter: e.target.value }))}
      />
    </Grid>
 
    <Grid item xs={12} sm={4}>
      <TextField
        fullWidth
        label="Division"
        value={form.division}
        onChange={(e) => setForm((f) => ({ ...f, division: e.target.value }))}
      />
    </Grid>
 
    <Grid item xs={12} sm={6}>
      <TextField
        fullWidth
        label="Client Owner"
        value={form.clientOwner}
        onChange={(e) => setForm((f) => ({ ...f, clientOwner: e.target.value }))}
      />
    </Grid>
 
    <Grid item xs={12} sm={6}>
      <TextField
        fullWidth
        label="Reporting Details"
        value={form.reportingDetails}
        onChange={(e) => setForm((f) => ({ ...f, reportingDetails: e.target.value }))}
      />
    </Grid>
  </Grid>
);
 const Step3 = ({ form, setForm, users, errors, backendSupportsNullManagerClear }) => {
  const [picker, setPicker] = useState(null);
 
  const openPicker = (key) => setPicker(key);
  const closePicker = () => setPicker(null);
 
  const pickerTitleMap = {
    resourceOwnerId: 'Select Resource Owner',
    l1ManagerId: 'Select L1 Approval Manager',
    l2ManagerId: 'Select L2 Approval Manager',
  };
 
  return (
    <Box>
      <Alert severity={backendSupportsNullManagerClear ? 'info' : 'warning'} sx={{ mb: 2.5, borderRadius: 2 }}>
        {backendSupportsNullManagerClear
          ? 'You can reassign or remove Resource Owner, L1, and L2 managers.'
          : 'You can reassign managers here. Full remove-to-empty requires backend null-clear support.'}
      </Alert>
 
      <Grid container spacing={2.5}>
        <Grid item xs={12}>
          <ManagerSelectorCard
            title="Resource Owner *"
            value={form.resourceOwnerId}
            users={users}
            onPick={() => openPicker('resourceOwnerId')}
            onClear={() => setForm((f) => ({ ...f, resourceOwnerId: null }))}
            error={errors.resourceOwnerId}
            clearDisabled={!backendSupportsNullManagerClear}
          />
        </Grid>
 
        <Grid item xs={12} md={6}>
          <ManagerSelectorCard
            title="L1 Approval Manager *"
            value={form.l1ManagerId}
            users={users}
            onPick={() => openPicker('l1ManagerId')}
            onClear={() => setForm((f) => ({ ...f, l1ManagerId: null }))}
            error={errors.l1ManagerId}
            clearDisabled={!backendSupportsNullManagerClear}
          />
        </Grid>
 
        <Grid item xs={12} md={6}>
          <ManagerSelectorCard
            title="L2 Approval Manager *"
            value={form.l2ManagerId}
            users={users}
            onPick={() => openPicker('l2ManagerId')}
            onClear={() => setForm((f) => ({ ...f, l2ManagerId: null }))}
            error={errors.l2ManagerId}
            clearDisabled={!backendSupportsNullManagerClear}
          />
        </Grid>
      </Grid>
 
      <EmployeePickerDialog
        open={!!picker}
        onClose={closePicker}
        users={users}
        value={picker ? form[picker] : null}
        title={picker ? pickerTitleMap[picker] : 'Select Employee'}
        onSelect={(id) => {
          setForm((f) => ({ ...f, [picker]: id }));
          closePicker();
        }}
      />
    </Box>
  );
};
 
const Step4 = ({ form, users }) => {
  const getUserName = (id) => {
    const user = users.find((u) => u.id === id);
    return user ? `${user.firstName} ${user.lastName}` : id ? `#${id}` : '—';
  };
 
  const rows = [
    ['Project Code', form.projectCode],
    ['Project Name', form.projectName],
    ['Client', form.client],
    ['Status', form.status],
    ['Start Date', form.projectStartDate || '—'],
    ['End Date', form.projectEndDate || '—'],
    ['Display Name', form.displayName || '—'],
    ['Short Name', form.projectShortName || '—'],
    ['Practice', form.practice || '—'],
    ['Type', form.type || '—'],
    ['Category', form.category || '—'],
    ['Business Unit', form.businessUnit || '—'],
    ['Department', form.department || '—'],
    ['Region', form.region || '—'],
    ['Engagement Model', form.engagementModel || '—'],
    ['Cost Group', form.costGroup || '—'],
    ['Client Cost Center', form.clientCostCenter || '—'],
    ['Division', form.division || '—'],
    ['Client Owner', form.clientOwner || '—'],
    ['Reporting Details', form.reportingDetails || '—'],
    ['Resource Owner', getUserName(form.resourceOwnerId)],
    ['L1 Manager', getUserName(form.l1ManagerId)],
    ['L2 Manager', getUserName(form.l2ManagerId)],
  ];
 
  return (
    <Box>
      <Alert severity="info" sx={{ mb: 2.5, borderRadius: 2 }}>
        Review all changes before updating the project.
      </Alert>
 
      <Grid container spacing={1.5}>
        {rows.map(([label, value]) => (
          <Grid item xs={12} sm={6} key={label}>
            <Box sx={{ p: 1.5, borderRadius: 2, border: '1px solid #F0F0F5', bgcolor: '#FAFAFA' }}>
              <Typography
                sx={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  color: '#9CA3AF',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  mb: 0.25,
                }}
              >
                {label}
              </Typography>
              <Typography sx={{ fontSize: '0.88rem', color: '#1B193F', fontWeight: 500 }}>
                {value}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
 
      {form.description && (
        <Box sx={{ mt: 1.5, p: 1.5, borderRadius: 2, border: '1px solid #F0F0F5', bgcolor: '#FAFAFA' }}>
          <Typography
            sx={{
              fontSize: '0.68rem',
              fontWeight: 700,
              color: '#9CA3AF',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              mb: 0.5,
            }}
          >
            Description
          </Typography>
          <Typography sx={{ fontSize: '0.85rem', color: '#374151', lineHeight: 1.6 }}>
            {form.description}
          </Typography>
        </Box>
      )}
    </Box>
  );
};
 
const EditProjectPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
 
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(EMPTY_FORM);
  const [users, setUsers] = useState([]);
  const [errors, setErrors] = useState({});
  const [loadingPage, setLoadingPage] = useState(true);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState('');
 
  const backendSupportsNullManagerClear = false;
 
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingPage(true);
        setApiError('');
 
        const [projectRes, usersRes] = await Promise.all([
          rmoApi.getProjectById(id),
          rmoApi.getUsers(),
        ]);
 
        const project = projectRes.data || {};
        setUsers(usersRes.data || []);
 
        setForm({
          id: project.id || null,
          projectCode: project.projectCode || '',
          projectName: project.projectName || '',
          client: project.client || '',
          description: project.description || '',
          practice: project.practice || '',
          projectShortName: project.projectShortName || '',
          displayName: project.displayName || '',
          type: project.type || '',
          category: project.category || '',
 
          businessUnit: project.businessUnit || '',
          department: project.department || '',
          region: project.region || '',
          engagementModel: project.engagementModel || '',
          costGroup: project.costGroup || '',
          clientCostCenter: project.clientCostCenter || '',
          division: project.division || '',
          reportingDetails: project.reportingDetails || '',
          clientOwner: project.clientOwner || '',
 
          status: project.status || 'ACTIVE',
          projectStartDate: normalizeDate(project.projectStartDate),
          projectEndDate: normalizeDate(project.projectEndDate),
 
          resourceOwnerId: project.resourceOwnerId ?? project.resourceOwnerid ?? null,
          l1ManagerId: project.l1ManagerId ?? null,
          l2ManagerId: project.l2ManagerId ?? null,
        });
      } catch (err) {
        setApiError(err.response?.data?.message || 'Failed to load project details.');
      } finally {
        setLoadingPage(false);
      }
    };
 
    loadData();
  }, [id]);
 
  const validateStep = (currentStep = step) => {
    const nextErrors = {};
 
    if (currentStep === 0) {
      if (!form.projectName.trim()) nextErrors.projectName = 'Project name is required';
      if (!form.client.trim()) nextErrors.client = 'Client name is required';
      if (!form.status) nextErrors.status = 'Status is required';
 
      if (form.projectStartDate && form.projectEndDate) {
        if (new Date(form.projectEndDate) < new Date(form.projectStartDate)) {
          nextErrors.projectEndDate = 'End date cannot be before start date';
        }
      }
    }
 
    if (currentStep === 2 || currentStep === 3) {
      if (!form.resourceOwnerId) nextErrors.resourceOwnerId = 'Resource Owner is required';
      if (!form.l1ManagerId) nextErrors.l1ManagerId = 'L1 Manager is required';
      if (!form.l2ManagerId) nextErrors.l2ManagerId = 'L2 Manager is required';
 
      if (
        form.resourceOwnerId &&
        form.l1ManagerId &&
        Number(form.resourceOwnerId) === Number(form.l1ManagerId)
      ) {
        nextErrors.l1ManagerId = 'L1 Manager must be different from Resource Owner';
      }
 
      if (
        form.resourceOwnerId &&
        form.l2ManagerId &&
        Number(form.resourceOwnerId) === Number(form.l2ManagerId)
      ) {
        nextErrors.l2ManagerId = 'L2 Manager must be different from Resource Owner';
      }
 
      // if (
      //   form.l1ManagerId &&
      //   form.l2ManagerId &&
      //   Number(form.l1ManagerId) === Number(form.l2ManagerId)
      // ) {
      //   nextErrors.l2ManagerId = 'L2 Manager must be different from L1 Manager';
      // }
    }
 
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };
 
  const handleNext = () => {
    if (validateStep(step)) {
      setStep((s) => s + 1);
    }
  };
 
  const handleBack = () => {
    if (step === 0) navigate('/rmo/projects');
    else setStep((s) => s - 1);
  };
 
  const handleSubmit = async () => {
    if (!validateStep(3)) return;
 
    try {
      setSaving(true);
      setApiError('');
 
      const payload = {
        projectName: form.projectName.trim(),
        client: form.client.trim(),
        description: form.description?.trim() || '',
        practice: form.practice?.trim() || '',
        businessUnit: form.businessUnit?.trim() || '',
        region: form.region?.trim() || '',
        department: form.department || '',
        engagementModel: form.engagementModel || '',
        displayName: form.displayName?.trim() || '',
        projectShortName: form.projectShortName?.trim() || '',
        type: form.type?.trim() || '',
        category: form.category?.trim() || '',
        clientCostCenter: form.clientCostCenter?.trim() || '',
        costGroup: form.costGroup?.trim() || '',
        division: form.division?.trim() || '',
        status: form.status,
        clientOwner: form.clientOwner?.trim() || '',
        reportingDetails: form.reportingDetails?.trim() || '',
 
        resourceOwnerId: form.resourceOwnerId,
        l1ManagerId: form.l1ManagerId,
        l2ManagerId: form.l2ManagerId,
 
        projectStartDate: form.projectStartDate || null,
        projectEndDate: form.projectEndDate || null,
      };
 await rmoApi.updateProject(id, payload);
      toast.success('Project updated successfully');
      navigate('/rmo/projects');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Failed to update project.');
      setStep(3);
    } finally {
      setSaving(false);
    }
  };
 
  if (loadingPage) {
    return (
      <Box sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }
 
  return (
    <Box>
      <PageHeader
        title="Edit Project"
        subtitle="Update project details and reassign managers"
        breadcrumbs={[
          { label: 'RMO', path: '/rmo/dashboard' },
          { label: 'Projects', path: '/rmo/projects' },
          { label: form.projectName || 'Edit' },
        ]}
        actions={
          <Button
            variant="outlined"
            size="small"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/rmo/projects')}
            sx={{ borderColor: '#E5E7EB', color: '#374151' }}
          >
            Back
          </Button>
        }
      />
 
      {apiError && (
        <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
          {apiError}
        </Alert>
      )}
 
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ py: 2.5 }}>
          <Stepper activeStep={step} alternativeLabel>
            {STEPS.map((s, i) => (
              <Step key={s.label} completed={i < step}>
                <StepLabel
                  StepIconProps={{
                    sx: {
                      '&.Mui-active': { color: '#97247E' },
                      '&.Mui-completed': { color: '#24A148' },
                    },
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '0.78rem',
                      fontWeight: i === step ? 700 : 500,
                      color: i === step ? '#27235C' : '#6B7280',
                    }}
                  >
                    {s.label}
                  </Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>
 
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ mb: 2.5 }}>
            <Typography variant="h5" fontWeight={700}>{STEPS[step].label}</Typography>
            <Typography variant="body2" color="text.secondary">{STEPS[step].desc}</Typography>
          </Box>
 
          <Divider sx={{ mb: 3 }} />
 
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {step === 0 && (
                <Step1
                  form={form}
                  setForm={setForm}
                  errors={errors}
                  setErrors={setErrors}
                />
              )}
 
              {step === 1 && (
                <Step2
                  form={form}
                  setForm={setForm}
                />
              )}
 
              {step === 2 && (
                <Step3
                  form={form}
                  setForm={setForm}
                  users={users}
                  errors={errors}
                  backendSupportsNullManagerClear={backendSupportsNullManagerClear}
                />
              )}
 
              {step === 3 && (
                <Step4
                  form={form}
                  users={users}
                />
              )}
            </motion.div>
          </AnimatePresence>
 
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              mt: 4,
              pt: 3,
              borderTop: '1px solid #F0F0F5',
            }}
          >
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={handleBack}
              sx={{ borderColor: '#E5E7EB', color: '#374151' }}
            >
              {step === 0 ? 'Cancel' : 'Back'}
            </Button>
 
            {step < 3 ? (
              <Button variant="contained" endIcon={<ArrowForward />} onClick={handleNext}>
                Next — {STEPS[step + 1]?.label}
              </Button>
            ) : (
              <Button
                variant="contained"
                endIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Save />}
                onClick={handleSubmit}
                disabled={saving}
                sx={{ minWidth: 180 }}
              >
                {saving ? 'Saving…' : 'Update Project'}
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
 
export default EditProjectPage;
 
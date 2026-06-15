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
    Rocket,
    Business,
    Group,
    Preview,
    Search,
    Close,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { rmoApi, RMO_DEPARTMENTS, RMO_ENGAGEMENT_MODELS } from '../../../api/rmoApi';
import PageHeader from '../../../components/common/PageHeader';

const STEPS = [
    { label: 'Basic Info', icon: Business, desc: 'Project name, client, dates, and classification' },
    { label: 'Business Info', icon: Business, desc: 'Business unit, department, engagement model' },
    { label: 'Managers', icon: Group, desc: 'Select Resource Owner, L1, and L2 managers' },
    { label: 'Review', icon: Preview, desc: 'Confirm details and create project' },
];

const INITIAL = {
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

    projectStartDate: '',
    projectEndDate: '',

    resourceOwnerId: null,
    l1ManagerId: null,
    l2ManagerId: null,
    clientOwner: '',
};

const PAGE_SIZE = 6;

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
        // 1. First, filter out any user with employeeId of 1
        const activeUsers = users.filter((u) => u.employeeId != 1001);

        const q = query.trim().toLowerCase();
        if (!q) return activeUsers;

        // 2. Then apply the search query filter on the remaining users
        return activeUsers.filter((u) =>
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
                            Search employees and select one using paginated results.
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
                    {pagedUsers.length > 0 ? pagedUsers.map((u) => {
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
                                {/* <ListItemText
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
                                /> */}
                                <ListItemText
                                    primaryTypographyProps={{ component: 'div' }}
                                    secondaryTypographyProps={{ component: 'div' }}
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
                    }) : (
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
                            <Button size="small" color="error" onClick={onClear}>
                                Clear
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

        if (form.projectEndDate && new Date(form.projectEndDate) < new Date(value)) {
            setErrors((e) => ({
                ...e,
                projectEndDate: "End date cannot be before start date",
            }));
        } else {
            setErrors((e) => ({ ...e, projectEndDate: "" }));
        }
    };

    const handleEndDateChange = (value) => {
        setForm((f) => ({ ...f, projectEndDate: value }));

        if (value && new Date(value) < new Date(form.projectStartDate)) {
            setErrors((e) => ({
                ...e,
                projectEndDate: "End date cannot be before start date",
            }));
        } else {
            setErrors((e) => ({ ...e, projectEndDate: "" }));
        }
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
                    required
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
}

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

        <Grid item xs={12}>
            <TextField
                fullWidth
                label="Reporting Details"
                value={form.reportingDetails}
                onChange={(e) => setForm((f) => ({ ...f, reportingDetails: e.target.value }))}
            />
        </Grid>
    </Grid>
);
const Step3 = ({ form, setForm, users, errors }) => {
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
            <Alert severity="info" sx={{ mb: 2.5, borderRadius: 2 }}>
                Select Resource Owner, L1, and L2 managers from the paginated employee list.
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
                    />
                </Grid>

                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        label="Client Owner"
                        value={form.clientOwner}
                        onChange={(e) => setForm((f) => ({ ...f, clientOwner: e.target.value }))}
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
        const u = users.find((x) => x.id === id);
        return u ? `${u.firstName} ${u.lastName}` : id ? `#${id}` : '—';
    };

    const rows = [
        ['Project Name', form.projectName],
        ['Client', form.client],
        ['Project Start Date', form.projectStartDate],
        ['Project End Date', form.projectEndDate || '—'],
        ['Display Name', form.displayName || '—'],
        ['Project Short Name', form.projectShortName || '—'],
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
        ['Resource Owner', getUserName(form.resourceOwnerId)],
        ['L1 Manager', getUserName(form.l1ManagerId)],
        ['L2 Manager', getUserName(form.l2ManagerId)],
        ['Client Owner', form.clientOwner || '—'],
        ['Reporting Details', form.reportingDetails || '—'],
    ];

    return (
        <Box>
            <Alert severity="info" sx={{ mb: 2.5, borderRadius: 2 }}>
                Review the payload carefully before creating the project.
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
const CreateProjectPage = () => {
    const navigate = useNavigate();

    const [step, setStep] = useState(0);
    const [form, setForm] = useState(INITIAL);
    const [users, setUsers] = useState([]);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [apiError, setApiError] = useState('');
    const [loadingUsers, setLoadingUsers] = useState(true);

    useEffect(() => {
        const loadUsers = async () => {
            try {
                setLoadingUsers(true);
                const r = await rmoApi.getUsers();
                setUsers(r.data || []);
            } catch {
                setUsers([]);
            } finally {
                setLoadingUsers(false);
            }
        };
        loadUsers();
    }, []);




    const validateStep = (currentStep = step) => {
        const errs = {};

        if (currentStep === 0) {
            if (!form.projectName.trim()) errs.projectName = 'Project name is required';
            if (!form.client.trim()) errs.client = 'Client name is required';
            if (!form.projectStartDate) errs.projectStartDate = 'Project start date is required';

            if (form.projectStartDate && form.projectEndDate) {
                const start = new Date(form.projectStartDate);
                const end = new Date(form.projectEndDate);
                if (end < start) {
                    errs.projectEndDate = 'Project end date cannot be before project start date';
                }
            }
        }

        if (currentStep === 2) {
            if (!form.resourceOwnerId) errs.resourceOwnerId = 'Resource Owner is required';
            if (!form.l1ManagerId) errs.l1ManagerId = 'L1 Manager is required';
            if (!form.l2ManagerId) errs.l2ManagerId = 'L2 Manager is required';

            if (
                form.resourceOwnerId &&
                form.l1ManagerId &&
                form.resourceOwnerId === form.l1ManagerId
            ) {
                errs.l1ManagerId = 'L1 Manager must be different from Resource Owner';
            }

            if (
                form.resourceOwnerId &&
                form.l2ManagerId &&
                form.resourceOwnerId === form.l2ManagerId
            ) {
                errs.l2ManagerId = 'L2 Manager must be different from Resource Owner';
            }


            // if (
            //   form.l1ManagerId &&
            //   form.l2ManagerId &&
            //   Number(form.l1ManagerId) === Number(form.l2ManagerId)
            // ) {
            //   nextErrors.l2ManagerId = 'L2 Manager must be different from L1 Manager';
            // }

        }

        if (currentStep === 3) {
            const step0Errors = {};
            const step2Errors = {};

            if (!form.projectName.trim()) step0Errors.projectName = 'Project name is required';
            if (!form.client.trim()) step0Errors.client = 'Client name is required';
            if (!form.projectStartDate) step0Errors.projectStartDate = 'Project start date is required';

            if (form.projectStartDate && form.projectEndDate) {
                const start = new Date(form.projectStartDate);
                const end = new Date(form.projectEndDate);
                if (end < start) {
                    step0Errors.projectEndDate = 'Project end date cannot be before project start date';
                }
            }

            if (!form.resourceOwnerId) step2Errors.resourceOwnerId = 'Resource Owner is required';
            if (!form.l1ManagerId) step2Errors.l1ManagerId = 'L1 Manager is required';
            if (!form.l2ManagerId) step2Errors.l2ManagerId = 'L2 Manager is required';

            Object.assign(errs, step0Errors, step2Errors);
        }

        setErrors(errs);
        return Object.keys(errs).length === 0;
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

        setSubmitting(true);
        setApiError('');

        try {
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
                projectStartDate: form.projectStartDate || null,
                projectEndDate: form.projectEndDate || null,
                resourceOwnerId: form.resourceOwnerId,
                l1ManagerId: form.l1ManagerId,
                l2ManagerId: form.l2ManagerId,
                clientOwner: form.clientOwner?.trim() || '',
                reportingDetails: form.reportingDetails?.trim() || '',
            };

            await rmoApi.createProject(payload);
            navigate('/rmo/projects');
        } catch (err) {
            setApiError(err.response?.data?.message || 'Failed to create project. Please try again.');
            setStep(3);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Box>
            <PageHeader
                title="Create Project"
                subtitle="Fill in all required details to create a new project"
                breadcrumbs={[
                    { label: 'RMO', path: '/rmo/dashboard' },
                    { label: 'Projects', path: '/rmo/projects' },
                    { label: 'Create' },
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

                    {apiError && (
                        <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
                            {apiError}
                        </Alert>
                    )}

                    {loadingUsers && step === 2 ? (
                        <Box sx={{ py: 5, display: 'flex', justifyContent: 'center' }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                            >
                                {step === 0 && <Step1 form={form} setForm={setForm} errors={errors} setErrors={setErrors} />}
                                {step === 1 && <Step2 form={form} setForm={setForm} />}
                                {step === 2 && <Step3 form={form} setForm={setForm} users={users} errors={errors} />}
                                {step === 3 && <Step4 form={form} users={users} />}
                            </motion.div>
                        </AnimatePresence>
                    )}

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
                                endIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <Rocket />}
                                onClick={handleSubmit}
                                disabled={submitting}
                                sx={{ minWidth: 180 }}
                            >
                                {submitting ? 'Creating…' : 'Create Project'}
                            </Button>
                        )}
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
};

export default CreateProjectPage;


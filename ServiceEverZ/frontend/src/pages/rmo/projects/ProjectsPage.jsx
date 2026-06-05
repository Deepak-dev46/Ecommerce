// src/pages/rmo/projects/ProjectsPage.jsx
import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import {
    Box,
    Card,
    Typography,
    Button,
    TextField,
    InputAdornment,
    MenuItem,
    Grid,
    Collapse,
    Chip,
    Divider,
    IconButton,
    Tooltip,
    Alert,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    TablePagination,
    Skeleton,
    Avatar,
} from '@mui/material';
import {
    Add,
    Search,
    FilterList,
    ExpandMore,
    Refresh,
    Edit,
    PeopleAlt,
    Close,
    ExpandLess,
    Delete,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { rmoApi, RMO_PROJECT_STATUSES } from '../../../api/rmoApi';
import { formatDate } from '../../../utils/formatters';
import PageHeader from '../../../components/common/PageHeader';
import ProjectDetailsDrawer from './ProjectDetailsDrawer';
import AssignMembersModal from './AssignMembersModel';
import { rmoAxios } from '../../../api/axiosInstance';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
 
 
const STATUS_COLORS = {
    ACTIVE: { bg: '#DCFCE7', color: '#15803D' },
    INACTIVE: { bg: '#F3F4F6', color: '#6B7280' },
    COMPLETED: { bg: '#DBEAFE', color: '#1D4ED8' },
    ONHOLD: { bg: '#FEF9C3', color: '#854D0E' },
    CLOSED: { bg: '#FEE2E2', color: '#B91C1C' },
};
 
const DEPARTMENTS = [
    'HR',
    'ENGINEERING',
    'FINANCE',
    'OPERATIONS',
    'SUPPORT',
    'MANAGEMENT',
    'SALES',
    'LEGAL',
];
 
const normalizeStatusLabel = (status) => {
    if (!status) return '—';
    if (status === 'ONHOLD') return 'ON HOLD';
    return status.replace(/_/g, ' ');
};
 
const getProjectResourceOwnerId = (project) =>
    project?.resourceOwnerId ?? project?.resourceOwnerid ?? null;
 
const StatusChip = ({ status }) => {
    const cfg = STATUS_COLORS[status] || STATUS_COLORS.INACTIVE;
    const label = normalizeStatusLabel(status);
 
    return (
        <Chip
            label={label}
            size="small"
            sx={{
                bgcolor: cfg.bg,
                color: cfg.color,
                fontWeight: 700,
                fontSize: '0.7rem',
                height: 22,
                border: `1px solid ${cfg.color}30`,
            }}
        />
    );
};
 
const ProjectsPage = () => {
    const navigate = useNavigate();
 
    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
 
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
 
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        status: '',
        department: '',
    });
 
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
 
    const [selectedProj, setSelectedProj] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
 
    const [assignOpen, setAssignOpen] = useState(null);
    // const [editProj, setEditProj] = useState(null);
    // const [editOpen, setEditOpen] = useState(false);
 
    const searchRef = useRef(null);
 
    // const openEditDrawer = (proj) => {
    //     setEditProj(proj);
    //     setEditOpen(true);
    // };
 
 
    const load = useCallback(async () => {
        setLoading(true);
        setError('');
 
        try {
            const [pRes, uRes] = await Promise.all([
                rmoApi.getProjects(),
                rmoApi.getUsers(),
            ]);
 
            console.log(pRes, uRes);
 
            setProjects(Array.isArray(pRes?.data) ? pRes.data : []);
            setUsers(Array.isArray(uRes?.data) ? uRes.data : []);
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                'Failed to load projects.'
            );
        } finally {
            setLoading(false);
        }
    }, []);
 
    useEffect(() => {
        load();
    }, [load]);
 
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 300);
 
        return () => clearTimeout(timer);
    }, [search]);
 
 
    // Inside your parent component:
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
 
    // 1. Triggers when the user clicks the trash icon
    const openDeleteConfirmation = (id) => {
        setProjectToDelete(id);
        setDeleteDialogOpen(true);
    };
 
    // 2. Triggers when the user clicks "Confirm" inside the dialog
    const handleDeleteConfirm = async () => {
        if (!projectToDelete) return;
 
        try {
            setIsDeleting(true);
            await rmoApi.deleteProject(projectToDelete);
            load();
        } catch (error) {
            console.error("Failed to delete project:", error);
        } finally {
            setIsDeleting(false);
            setDeleteDialogOpen(false);
            setProjectToDelete(null);
        }
    };
 
    // 3. Triggers when the user clicks "Cancel" or closes the dialog
    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
        setProjectToDelete(null);
    };
 
 
    const filtered = useMemo(() => {
        const q = debouncedSearch.trim().toLowerCase();
 
        return projects.filter((p) => {
            const matchQ =
                !q ||
                [p.projectName, p.projectCode, p.client, p.displayName]
                    .filter(Boolean)
                    .some((v) => String(v).toLowerCase().includes(q));
 
            const matchStatus = !filters.status || p.status === filters.status;
            const matchDept = !filters.department || p.department === filters.department;
 
            return matchQ && matchStatus && matchDept;
        });
    }, [projects, debouncedSearch, filters]);
 
    const paginated = useMemo(() => {
        const start = page * rowsPerPage;
        return filtered.slice(start, start + rowsPerPage);
    }, [filtered, page, rowsPerPage]);
 
    const activeFilters = Object.values(filters).filter(Boolean).length;
 
    const openDrawer = (proj) => {
        setSelectedProj(proj);
        setDrawerOpen(true);
    };
 
 
 
    const getUserName = (id) => {
        if (!id) return '—';
 
        const normalizedId = Number(id);
        const user = users.find((u) => Number(u.id) === normalizedId);
 
        if (!user) return `#${id}`;
 
        return [user.firstName, user.lastName].filter(Boolean).join(' ') || `#${id}`;
    };
 
    const AVATAR_COLORS = ['#27235C', '#97247E', '#24A148', '#E2B93B', '#AC5098', '#E01950'];
 
    const avatarColor = (id) => AVATAR_COLORS[(id || 0) % AVATAR_COLORS.length];
 
    return (
        <Box>
            <PageHeader
                title="Projects"
                subtitle={`${filtered.length} of ${projects.length} projects`}
                breadcrumbs={[
                    { label: 'RMO', path: '/rmo/dashboard' },
                    { label: 'Projects' },
                ]}
                actions={
                    <>
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<Refresh />}
                            onClick={load}
                            disabled={loading}
                            sx={{ borderColor: '#E5E7EB', color: '#374151' }}
                        >
                            Refresh
                        </Button>
 
                        <Button
                            variant="contained"
                            size="small"
                            startIcon={<Add />}
                            onClick={() => navigate('/rmo/projects/create')}
                        >
                            Create Project
                        </Button>
                    </>
                }
            />
 
            {error && (
                <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
                    {error}
                </Alert>
            )}
 
            <Card sx={{ mb: 2 }}>
                <Box
                    sx={{
                        p: 2,
                        display: 'flex',
                        gap: 1.5,
                        alignItems: 'center',
                        flexWrap: 'wrap',
                    }}
                >
                    <TextField
                        inputRef={searchRef}
                        placeholder="Search project name, code, client…"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(0);
                        }}
                        sx={{ flex: 1, minWidth: 220 }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search sx={{ fontSize: 17, color: '#9CA3AF' }} />
                                </InputAdornment>
                            ),
                            endAdornment: search ? (
                                <InputAdornment position="end">
                                    <IconButton size="small" onClick={() => setSearch('')}>
                                        <Close sx={{ fontSize: 15 }} />
                                    </IconButton>
                                </InputAdornment>
                            ) : null,
                        }}
                    />
 
                    <Button
                        variant={showFilters || activeFilters > 0 ? 'contained' : 'outlined'}
                        size="small"
                        startIcon={<FilterList />}
                        endIcon={
                            showFilters ? (
                                <ExpandLess sx={{ fontSize: 16 }} />
                            ) : (
                                <ExpandMore sx={{ fontSize: 16 }} />
                            )
                        }
                        onClick={() => setShowFilters((v) => !v)}
                    >
                        Filters {activeFilters > 0 ? `(${activeFilters})` : ''}
                    </Button>
 
                    {activeFilters > 0 && (
                        <Button
                            size="small"
                            sx={{ color: '#E01950' }}
                            onClick={() => {
                                setFilters({ status: '', department: '' });
                                setPage(0);
                            }}
                        >
                            Clear
                        </Button>
                    )}
                </Box>
 
                <Collapse in={showFilters}>
                    <Divider />
                    <Box sx={{ p: 2 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    select
                                    fullWidth
                                    label="Status"
                                    value={filters.status}
                                    onChange={(e) => {
                                        setFilters((prev) => ({ ...prev, status: e.target.value }));
                                        setPage(0);
                                    }}
                                >
                                    <MenuItem value="">All Statuses</MenuItem>
                                    {RMO_PROJECT_STATUSES.map((status) => (
                                        <MenuItem key={status} value={status}>
                                            {normalizeStatusLabel(status)}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
 
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    select
                                    fullWidth
                                    label="Department"
                                    value={filters.department}
                                    onChange={(e) => {
                                        setFilters((prev) => ({ ...prev, department: e.target.value }));
                                        setPage(0);
                                    }}
                                >
                                    <MenuItem value="">All Departments</MenuItem>
                                    {DEPARTMENTS.map((dept) => (
                                        <MenuItem key={dept} value={dept}>
                                            {dept}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                        </Grid>
 
                        {activeFilters > 0 && (
                            <Box sx={{ display: 'flex', gap: 0.75, mt: 1.5, flexWrap: 'wrap' }}>
                                {filters.status && (
                                    <Chip
                                        label={`Status: ${normalizeStatusLabel(filters.status)}`}
                                        size="small"
                                        onDelete={() =>
                                            setFilters((prev) => ({ ...prev, status: '' }))
                                        }
                                        sx={{ bgcolor: '#F0F0FA', color: '#27235C' }}
                                    />
                                )}
 
                                {filters.department && (
                                    <Chip
                                        label={`Dept: ${filters.department}`}
                                        size="small"
                                        onDelete={() =>
                                            setFilters((prev) => ({ ...prev, department: '' }))
                                        }
                                        sx={{ bgcolor: '#F0F0FA', color: '#27235C' }}
                                    />
                                )}
                            </Box>
                        )}
                    </Box>
                </Collapse>
            </Card>
 
            <Card>
                <Box sx={{ overflowX: 'auto' }}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                {[
                                    'Project Code',
                                    'Project Name',
                                    'Client',
                                    'Status',
                                    'Resource Owner',
                                    'L1 Manager',
                                    'L2 Manager',
                                    'Department',
                                    'Created',
                                    'Actions',
                                ].map((header) => (
                                    <TableCell key={header}>{header}</TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
 
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 6 }).map((_, i) => (
                                    <TableRow key={i}>
                                        {Array.from({ length: 10 }).map((__, j) => (
                                            <TableCell key={j}>
                                                <Skeleton variant="text" width="80%" />
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : paginated.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={10} align="center" sx={{ py: 7 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            {debouncedSearch || activeFilters
                                                ? 'No projects match your search.'
                                                : 'No projects yet. Create your first one.'}
                                        </Typography>
 
                                        {!debouncedSearch && !activeFilters && (
                                            <Button
                                                size="small"
                                                variant="contained"
                                                startIcon={<Add />}
                                                sx={{ mt: 2 }}
                                                onClick={() => navigate('/rmo/projects/create')}
                                            >
                                                Create Project
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginated.map((proj) => {
                                    const resourceOwnerId = getProjectResourceOwnerId(proj);
 
                                    return (
                                        <TableRow
                                            key={proj.id}
                                            hover
                                            sx={{
                                                cursor: 'pointer',
                                                '&:hover': { bgcolor: 'rgba(39,35,92,0.02)' },
                                            }}
                                            onClick={() => openDrawer(proj)}
                                        >
                                            <TableCell>
                                                <Typography
                                                    sx={{
                                                        fontSize: '0.8rem',
                                                        fontFamily: 'monospace',
                                                        color: '#6B7280',
                                                    }}
                                                >
                                                    {proj.projectCode || '—'}
                                                </Typography>
                                            </TableCell>
 
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                    <Avatar
                                                        sx={{
                                                            width: 32,
                                                            height: 32,
                                                            fontSize: '0.72rem',
                                                            fontWeight: 700,
                                                            bgcolor: avatarColor(proj.id),
                                                        }}
                                                    >
                                                        {(proj.projectName || 'P').charAt(0).toUpperCase()}
                                                    </Avatar>
 
                                                    <Box>
                                                        <Typography
                                                            sx={{
                                                                fontSize: '0.85rem',
                                                                fontWeight: 600,
                                                                color: '#1B193F',
                                                            }}
                                                        >
                                                            {proj.projectName || '—'}
                                                        </Typography>
 
                                                        {proj.displayName && proj.displayName !== proj.projectName && (
                                                            <Typography
                                                                sx={{ fontSize: '0.7rem', color: '#9CA3AF' }}
                                                            >
                                                                {proj.displayName}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                </Box>
                                            </TableCell>
 
                                            <TableCell>
                                                <Typography sx={{ fontSize: '0.825rem', color: '#6B7280' }}>
                                                    {proj.client || '—'}
                                                </Typography>
                                            </TableCell>
 
                                            <TableCell>
                                                <StatusChip status={proj.status} />
                                            </TableCell>
 
                                            <TableCell>
                                                <Typography sx={{ fontSize: '0.825rem' }}>
                                                    {getUserName(resourceOwnerId)}
                                                </Typography>
                                            </TableCell>
 
                                            <TableCell>
                                                <Typography sx={{ fontSize: '0.825rem' }}>
                                                    {getUserName(proj.l1ManagerId)}
                                                </Typography>
                                            </TableCell>
 
                                            <TableCell>
                                                <Typography sx={{ fontSize: '0.825rem' }}>
                                                    {getUserName(proj.l2ManagerId)}
                                                </Typography>
                                            </TableCell>
 
                                            <TableCell>
                                                <Typography sx={{ fontSize: '0.825rem' }}>
                                                    {proj.department || '—'}
                                                </Typography>
                                            </TableCell>
 
                                            <TableCell>
                                                <Typography sx={{ fontSize: '0.78rem', color: '#9CA3AF' }}>
                                                    {formatDate(proj.createdAt)}
                                                </Typography>
                                            </TableCell>
 
                                            <TableCell onClick={(e) => e.stopPropagation()}>
                                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                    <Tooltip title="Edit project">
                                                        <IconButton
                                                            size="small"
                                                            sx={{ color: '#27235C' }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                navigate(`/rmo/projects/${proj.id}/edit`);
                                                            }}
                                                        >
                                                            <Edit sx={{ fontSize: 17 }} />
                                                        </IconButton>
                                                    </Tooltip>
 
 
                                                    <Tooltip title="Assign employees">
                                                        <IconButton
                                                            size="small"
                                                            sx={{ color: '#97247E' }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setAssignOpen(proj);
                                                            }}
                                                        >
                                                            <PeopleAlt sx={{ fontSize: 17 }} />
                                                        </IconButton>
                                                    </Tooltip>
 
 
                                                    {/* The Delete Icon Button */}
                                                    <Tooltip title="Delete Project">
                                                        <IconButton
                                                            size="small"
                                                            sx={{ color: '#97247E' }}
                                                            onClick={(e) => {
                                                                e.stopPropagation(); // Prevents clicking the row/card if applicable
                                                                openDeleteConfirmation(proj.id); // Open the dialog instead of direct delete
                                                            }}
                                                        >
                                                            <Delete sx={{ fontSize: 17, color: 'red' }} />
                                                        </IconButton>
                                                    </Tooltip>
 
                                                    {/* ... place this near the bottom of your component's return statement ... */}
                                                    <ConfirmDialog
                                                        open={deleteDialogOpen}
                                                        title="Delete Project"
                                                        message="Are you sure you want to delete this project? This action cannot be undone."
                                                        confirmLabel="Delete"
                                                        cancelLabel="Cancel"
                                                        severity="error" // Changes the theme color to error red
                                                        loading={isDeleting}
                                                        onConfirm={handleDeleteConfirm}
                                                        onCancel={handleDeleteCancel}
                                                    />
 
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </Box>
 
                <Divider />
 
                <TablePagination
                    component="div"
                    count={filtered.length}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    onPageChange={(_, newPage) => setPage(newPage)}
                    onRowsPerPageChange={(e) => {
                        setRowsPerPage(Number(e.target.value));
                        setPage(0);
                    }}
                    rowsPerPageOptions={[10, 25, 50]}
                />
            </Card>
 
            <ProjectDetailsDrawer
                open={drawerOpen}
                project={selectedProj}
                users={users}
                onClose={() => setDrawerOpen(false)}
                onUpdated={load}
            />
 
            {/* <EditProjectDrawer
                open={editOpen}
                project={editProj}
                onClose={() => setEditOpen(false)}
                onUpdated={load}
            /> */}
 
            {assignOpen && (
                <AssignMembersModal
                    open={!!assignOpen}
                    project={assignOpen}
                    allUsers={users}
                    onClose={() => setAssignOpen(null)}
                    onSuccess={load}
                />
            )}
        </Box>
    );
};
 
export default ProjectsPage;
 
 
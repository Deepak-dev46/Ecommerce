// FILE: src/pages/admin/FeatureControlPage.jsx
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
    Box, Grid, Card, CardContent, Typography, Switch, Chip, Divider,
    Button, IconButton, Tooltip, CircularProgress, Alert, Skeleton,
    TextField, InputAdornment, Avatar, LinearProgress, Badge,
    Dialog, DialogTitle, DialogContent, DialogActions, Stack,
    ToggleButton, ToggleButtonGroup,
} from '@mui/material';
import {
    Tune as TuneIcon,
    Search, Close, Refresh, Save,
    CheckCircle, Block, RestartAlt,
    SelectAll, DeselectSharp as Deselect,
    ExpandMore, ExpandLess,
    AdminPanelSettings, ManageAccounts, Groups,
    People, Support, AssignmentTurnedIn,
    HowToReg, SupervisorAccount,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

import PageHeader from '../../components/common/PageHeader';
import { roleFeatureApi } from '../../api/roleFeatureApi';
import { useAuth } from '../../context/AuthContext';

/* ─────────────────────────────────────────────────────────────
   Constants & helpers
───────────────────────────────────────────────────────────── */
const ROLES = [
    // { key: 'ADMIN', label: 'Admin', icon: AdminPanelSettings, color: '#27235C', bg: '#EEEDF8' },
    { key: 'RMO', label: 'RMO', icon: ManageAccounts, color: '#97247E', bg: '#F9EFF7' },
    { key: 'ITSM_MANAGER', label: 'ITSM Manager', icon: Groups, color: '#AC5098', bg: '#F5EDF3' },
    { key: 'SUPPORT_PERSONNEL', label: 'Support Personnel', icon: Support, color: '#E2B93B', bg: '#FBF6E7' },
    { key: 'APPROVAL_MANAGER_L1', label: 'Approval Manager L1', icon: AssignmentTurnedIn, color: '#24A148', bg: '#ECFDF5' },
    { key: 'APPROVAL_MANAGER_L2', label: 'Approval Manager L2', icon: HowToReg, color: '#1976d2', bg: '#EDF4FB' },
    { key: 'RESOURCE_OWNER', label: 'Resource Owner', icon: SupervisorAccount, color: '#6B7280', bg: '#F4F5F9' },
    { key: 'END_USER', label: 'Application User', icon: People, color: '#374151', bg: '#F9FAFB' },
];

const CATEGORY_COLORS = {
    Core: { color: '#27235C', bg: '#EEEDF8' },
    Tickets: { color: '#97247E', bg: '#F9EFF7' },
    Projects: { color: '#AC5098', bg: '#F5EDF3' },
    Resources: { color: '#1976d2', bg: '#EDF4FB' },
    SLA: { color: '#E2B93B', bg: '#FBF6E7' },
    Assets: { color: '#24A148', bg: '#ECFDF5' },
    Problems: { color: '#E01950', bg: '#FFF1F3' },
    Knowledge: { color: '#6B7280', bg: '#F4F5F9' },
    Changes: { color: '#E2B93B', bg: '#FBF6E7' },
    Reports: { color: '#374151', bg: '#F9FAFB' },
    Config: { color: '#9CA3AF', bg: '#F9FAFB' },
    Incidents: { color: '#E01950', bg: '#FFF1F3' },
    Quality: { color: '#6B7280', bg: '#F4F5F9' },
    Catalog: { color: '#AC5098', bg: '#F5EDF3' },
};

/* ─────────────────────────────────────────────────────────────
   Role selector card (left panel)
───────────────────────────────────────────────────────────── */
const RoleCard = ({ role, selected, enabledCount, totalCount, onClick }) => {
    const Icon = role.icon;
    const pct = totalCount ? Math.round((enabledCount / totalCount) * 100) : 100;
    return (
        <motion.div whileHover={{ x: 2 }} transition={{ duration: 0.12 }}>
            <Box
                onClick={onClick}
                sx={{
                    display: 'flex', alignItems: 'center', gap: 1.5,
                    p: 1.75, mb: 0.75, borderRadius: 2.5, cursor: 'pointer',
                    border: `1.5px solid ${selected ? role.color + '55' : '#F0F0F5'}`,
                    bgcolor: selected ? role.bg : 'transparent',
                    transition: 'all 0.18s',
                    '&:hover': { bgcolor: role.bg, borderColor: role.color + '44' },
                }}
            >
                <Box sx={{
                    width: 36, height: 36, borderRadius: 2,
                    bgcolor: selected ? role.bg : '#F4F5F9',
                    border: `1px solid ${role.color}22`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                }}>
                    <Icon sx={{ fontSize: 18, color: role.color }} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{
                        fontWeight: selected ? 700 : 500, fontSize: '0.845rem',
                        color: selected ? role.color : '#1B193F',
                    }}>
                        {role.label}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.3 }}>
                        <LinearProgress
                            variant="determinate"
                            value={pct}
                            sx={{
                                flex: 1, height: 4, borderRadius: 2,
                                bgcolor: '#E5E7EB',
                                '& .MuiLinearProgress-bar': {
                                    bgcolor: pct === 100 ? '#24A148' : pct > 50 ? role.color : '#E2B93B',
                                    borderRadius: 2,
                                },
                            }}
                        />
                        <Typography sx={{ fontSize: '0.68rem', color: '#9CA3AF', flexShrink: 0 }}>
                            {enabledCount}/{totalCount}
                        </Typography>
                    </Box>
                </Box>
                {selected && (
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: role.color, flexShrink: 0 }} />
                )}
            </Box>
        </motion.div>
    );
};

/* ─────────────────────────────────────────────────────────────
   Feature toggle card (right panel)
───────────────────────────────────────────────────────────── */
const FeatureCard = ({ feature, onChange, saving, roleColor }) => {
    const cat = CATEGORY_COLORS[feature.category] || CATEGORY_COLORS.Core;
    return (
        <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.12 }}>
            <Card sx={{
                border: `1.5px solid ${feature.enabled ? roleColor + '33' : '#F0F0F5'}`,
                bgcolor: feature.enabled ? roleColor + '08' : '#FAFAFC',
                transition: 'all 0.2s',
                position: 'relative',
                overflow: 'visible',
            }}>
                {/* Default-off badge */}
                {!feature.defaultOn && (
                    <Box sx={{
                        position: 'absolute', top: -7, right: 10,
                        bgcolor: '#E2B93B', color: '#fff',
                        fontSize: '0.6rem', fontWeight: 700, px: 0.75, py: 0.15, borderRadius: 1,
                        letterSpacing: '0.04em',
                    }}>
                        OFF BY DEFAULT
                    </Box>
                )}
                <CardContent sx={{ p: 1.75, '&:last-child': { pb: 1.75 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
                                <Chip
                                    label={feature.category}
                                    size="small"
                                    sx={{
                                        bgcolor: cat.bg, color: cat.color,
                                        fontWeight: 700, fontSize: '0.6rem', height: 17,
                                        '& .MuiChip-label': { px: 0.6 },
                                    }}
                                />
                                {feature.enabled
                                    ? <CheckCircle sx={{ fontSize: 13, color: '#24A148' }} />
                                    : <Block sx={{ fontSize: 13, color: '#9CA3AF' }} />
                                }
                            </Box>
                            <Typography sx={{
                                fontWeight: 600, fontSize: '0.82rem', color: '#1B193F',
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            }}>
                                {feature.label}
                            </Typography>
                            <Typography sx={{
                                fontSize: '0.72rem', color: '#6B7280', mt: 0.2,
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            }}>
                                {feature.description}
                            </Typography>
                        </Box>
                        <Switch
                            checked={Boolean(feature.enabled)}
                            onChange={(e) => onChange(feature.featureKey, e.target.checked)}
                            disabled={saving}
                            size="small"
                            sx={{
                                flexShrink: 0, mt: 0.25,
                                '& .MuiSwitch-switchBase.Mui-checked': { color: roleColor },
                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: roleColor },
                            }}
                        />
                    </Box>
                </CardContent>
            </Card>
        </motion.div>
    );
};

/* ─────────────────────────────────────────────────────────────
   Confirm reset dialog
───────────────────────────────────────────────────────────── */
const ResetDialog = ({ open, roleName, onConfirm, onClose }) => (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: '#FFF1F3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <RestartAlt sx={{ color: '#E01950', fontSize: 20 }} />
            </Box>
            <Box>
                <Typography variant="h5">Reset to defaults</Typography>
                <Typography sx={{ fontSize: '0.72rem', color: '#9CA3AF' }}>{roleName}</Typography>
            </Box>
        </DialogTitle>
        <DialogContent>
            <Typography variant="body1" sx={{ color: '#4B5563' }}>
                This will remove all custom feature overrides for <strong>{roleName}</strong> and restore the default configuration. This cannot be undone.
            </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
            <Button variant="outlined" onClick={onClose} sx={{ borderColor: '#E5E7EB', color: '#374151' }}>Cancel</Button>
            <Button variant="contained" onClick={onConfirm}
                sx={{ bgcolor: '#E01950', background: '#E01950', '&:hover': { bgcolor: '#c0143f' } }}>
                Reset
            </Button>
        </DialogActions>
    </Dialog>
);

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════ */
const FeatureControlPage = () => {
    const { user } = useAuth();

    const [allRoleData, setAllRoleData] = useState({});     // { roleName: [RoleFeatureDto] }
    const [localData, setLocalData] = useState({});     // same shape — local edits
    const [selectedRole, setSelectedRole] = useState('ITSM_MANAGER');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [resetOpen, setResetOpen] = useState(false);
    const [unsaved, setUnsaved] = useState(new Set()); // featureKeys with pending changes
    const [search, setSearch] = useState('');
    const [catFilter, setCatFilter] = useState('ALL');

    /* ── Load ─────────────────────────────────────────────────────────────── */
    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await roleFeatureApi.getAll();
            setAllRoleData(res.data || {});
            setLocalData(res.data || {});
            setUnsaved(new Set());
        } catch {
            toast.error('Failed to load feature config');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    /* ── Local toggle ─────────────────────────────────────────────────────── */
    const handleToggle = useCallback((featureKey, enabled) => {
        setLocalData(prev => ({
            ...prev,
            [selectedRole]: prev[selectedRole].map(f =>
                f.featureKey === featureKey ? { ...f, enabled } : f
            ),
        }));
        setUnsaved(prev => {
            const next = new Set(prev);
            next.add(featureKey);
            return next;
        });
    }, [selectedRole]);

    /* ── Save pending changes ─────────────────────────────────────────────── */
    const handleSave = useCallback(async () => {
        if (!unsaved.size) return;
        setSaving(true);
        try {
            const features = localData[selectedRole] || [];
            await Promise.all(
                [...unsaved].map((key) => {
                    const f = features.find((x) => x.featureKey === key);
                    if (!f) return Promise.resolve();
                    return roleFeatureApi.toggle(selectedRole, key, f.enabled);
                })
            );
            setUnsaved(new Set());
            // Sync allRoleData
            setAllRoleData((prev) => ({
                ...prev,
                [selectedRole]: localData[selectedRole],
            }));
            toast.success(`Feature config saved for ${selectedRole.replace(/_/g, ' ')}`);
        } catch {
            toast.error('Failed to save feature config');
        } finally {
            setSaving(false);
        }
    }, [selectedRole, unsaved, localData]);

    /* ── Select all / none ───────────────────────────────────────────────── */
    const handleSelectAll = () => {
        const keys = localData[selectedRole].map(f => f.featureKey);
        setLocalData(prev => ({
            ...prev,
            [selectedRole]: prev[selectedRole].map(f => ({ ...f, enabled: true })),
        }));
        setUnsaved(new Set(keys)); // ✅ whole new Set, not mutation
    };

    const handleDeselectAll = () => {
        const keys = localData[selectedRole].map(f => f.featureKey);
        setLocalData(prev => ({
            ...prev,
            [selectedRole]: prev[selectedRole].map(f => ({ ...f, enabled: false })),
        }));
        setUnsaved(new Set(keys)); // ✅
    };


    /* ── Reset role ──────────────────────────────────────────────────────── */
    const handleReset = useCallback(async () => {
        setResetOpen(false);
        setSaving(true);
        try {
            const res = await roleFeatureApi.resetRole(selectedRole);
            setAllRoleData((prev) => ({ ...prev, [selectedRole]: res.data }));
            setLocalData((prev) => ({ ...prev, [selectedRole]: res.data }));
            setUnsaved(new Set());
            toast.success(`${selectedRole.replace(/_/g, ' ')} reset to defaults`);
        } catch {
            toast.error('Reset failed');
        } finally {
            setSaving(false);
        }
    }, [selectedRole]);

    /* ── Derived values ──────────────────────────────────────────────────── */
    const currentFeatures = localData[selectedRole] || [];

    const categories = useMemo(
        () => ['ALL', ...new Set(currentFeatures.map((f) => f.category))],
        [currentFeatures]
    );

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return currentFeatures.filter((f) => {
            const matchSearch = !q || f.label.toLowerCase().includes(q) || f.description.toLowerCase().includes(q);
            const matchCat = catFilter === 'ALL' || f.category === catFilter;
            return matchSearch && matchCat;
        });
    }, [currentFeatures, search, catFilter]);

    const enabledCount = currentFeatures.filter((f) => f.enabled).length;
    const totalCount = currentFeatures.length;
    const selectedRoleMeta = ROLES.find((r) => r.key === selectedRole) || ROLES[0];

    /* ── Role summary stats for left panel ──────────────────────────────── */
    const roleSummary = useMemo(() =>
        ROLES.map((r) => ({
            ...r,
            enabledCount: (localData[r.key] || []).filter((f) => f.enabled).length,
            totalCount: (localData[r.key] || []).length,
        })),
        [localData]
    );
    /* ─────────────────────────────────────────────────────────────────────
       RENDER
    ──────────────────────────────────────────────────────────────────── */
    return (
        <Box sx={{ bgcolor: '#F0F2F8', minHeight: '100vh', p: { xs: 2, md: 3 } }}>
            <PageHeader
                title="Feature control"
                subtitle="Restrict or enable features per role — changes take effect on next login"
                breadcrumbs={[
                    { label: 'Dashboard', path: '/dashboard' },
                    { label: 'Feature control' },
                ]}
                actions={
                    <Button
                        variant="outlined"
                        startIcon={<Refresh />}
                        onClick={load}
                        disabled={loading}
                        sx={{ borderColor: '#E5E7EB', color: '#374151', fontSize: '0.78rem' }}
                    >
                        Refresh
                    </Button>
                }
            />

            <Grid container spacing={2.5} sx={{ alignItems: 'flex-start' }}>
                {/* ── LEFT: Role list ──────────────────────────────────────────── */}
                <Grid item xs={12} md={3.5} lg={3}>
                    <Card>
                        <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid #F0F0F5' }}>
                            <Typography variant="h5">System roles</Typography>
                            <Typography variant="body2" sx={{ color: '#9CA3AF', mt: 0.25 }}>
                                Select a role to manage
                            </Typography>
                        </Box>
                        <Box sx={{ p: 1.5 }}>
                            {loading ? (
                                Array.from({ length: 8 }).map((_, i) => (
                                    <Skeleton key={i} height={56} sx={{ borderRadius: 2, mb: 0.75 }} />
                                ))
                            ) : (
                                roleSummary.map((role) => (
                                    <RoleCard
                                        key={role.key}
                                        role={role}
                                        selected={selectedRole === role.key}
                                        enabledCount={role.enabledCount}
                                        totalCount={role.totalCount}
                                        onClick={() => {
                                            if (unsaved.size > 0 && selectedRole !== role.key) {
                                                const confirmed = window.confirm(
                                                    `You have ${unsaved.size} unsaved change(s) for ${selectedRole}. Discard and switch role?`
                                                );
                                                if (!confirmed) return;
                                                setLocalData(prev => ({ ...prev, [selectedRole]: allRoleData[selectedRole] }));
                                                setUnsaved(new Set());
                                            }
                                            setSelectedRole(role.key);
                                            setSearch('');
                                            setCatFilter('ALL');
                                        }}
                                    />
                                ))
                            )}
                        </Box>

                        {/* Legend */}
                        <Box sx={{ px: 2, py: 1.5, borderTop: '1px solid #F0F0F5', bgcolor: '#FAFAFC' }}>
                            {[
                                { color: '#24A148', label: '100% enabled' },
                                { color: '#27235C', label: 'Partially enabled' },
                                { color: '#E2B93B', label: 'Less than 50%' },
                            ].map((l) => (
                                <Box key={l.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.4 }}>
                                    <Box sx={{ width: 8, height: 4, borderRadius: 2, bgcolor: l.color }} />
                                    <Typography sx={{ fontSize: '0.68rem', color: '#9CA3AF' }}>{l.label}</Typography>
                                </Box>
                            ))}
                        </Box>
                    </Card>
                </Grid>

                {/* ── RIGHT: Feature config ─────────────────────────────────────── */}
                <Grid item xs={12} md={8.5} lg={9}>
                    <Card>
                        {/* ── Header ─────────────────────────────────────────────────── */}
                        <Box sx={{
                            px: 3, py: 2.5,
                            background: `linear-gradient(135deg, ${selectedRoleMeta.bg} 0%, #fff 60%)`,
                            borderBottom: '1px solid #F0F0F5',
                            display: 'flex', alignItems: 'center', gap: 2,
                        }}>
                            <Box sx={{
                                width: 44, height: 44, borderRadius: 2.5,
                                bgcolor: selectedRoleMeta.bg,
                                border: `1.5px solid ${selectedRoleMeta.color}33`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <selectedRoleMeta.icon sx={{ color: selectedRoleMeta.color, fontSize: 22 }} />
                            </Box>
                            <Box sx={{ flex: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                                    <Typography variant="h4">{selectedRoleMeta.label}</Typography>
                                    <Chip
                                        label={`${enabledCount}/${totalCount} enabled`}
                                        size="small"
                                        sx={{
                                            bgcolor: enabledCount === totalCount ? '#ECFDF5' : selectedRoleMeta.bg,
                                            color: enabledCount === totalCount ? '#24A148' : selectedRoleMeta.color,
                                            fontWeight: 700, fontSize: '0.72rem',
                                        }}
                                    />
                                    {unsaved.size > 0 && (
                                        <Chip
                                            label={`${unsaved.size} unsaved`}
                                            size="small"
                                            sx={{
                                                bgcolor: '#FFF1F3', color: '#E01950', fontWeight: 700, fontSize: '0.72rem',
                                                animation: 'blink 1.8s infinite',
                                                '@keyframes blink': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.55 } },
                                            }}
                                        />
                                    )}
                                </Box>
                                <Typography variant="body2" sx={{ color: '#6B7280', mt: 0.25 }}>
                                    Toggle features visible to users with the <strong>{selectedRoleMeta.label}</strong> role
                                </Typography>
                            </Box>
                            {/* Action buttons */}
                            <Stack direction="row" spacing={1} flexShrink={0}>
                                <Tooltip title="Enable all features">
                                    <IconButton size="small" onClick={handleSelectAll} sx={{ color: '#24A148', bgcolor: '#ECFDF5', '&:hover': { bgcolor: '#D1FAE5' } }}>
                                        <SelectAll fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Disable all features">
                                    <IconButton size="small" onClick={handleDeselectAll} sx={{ color: '#E01950', bgcolor: '#FFF1F3', '&:hover': { bgcolor: '#FECDD3' } }}>
                                        <Deselect fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Reset to defaults">
                                    <IconButton size="small" onClick={() => setResetOpen(true)} sx={{ color: '#6B7280', bgcolor: '#F4F5F9', '&:hover': { bgcolor: '#E5E7EB' } }}>
                                        <RestartAlt fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                                <Button
                                    variant="contained"
                                    size="small"
                                    startIcon={saving ? <CircularProgress size={14} color="inherit" /> : <Save />}
                                    onClick={handleSave}
                                    disabled={saving || !unsaved.size}
                                    sx={{
                                        background: `linear-gradient(135deg, ${selectedRoleMeta.color} 0%, ${selectedRoleMeta.color}CC 100%)`,
                                        fontSize: '0.78rem', px: 2,
                                    }}
                                >
                                    {saving ? 'Saving…' : 'Save changes'}
                                </Button>
                            </Stack>
                        </Box>

                        {/* ── Toolbar: search + category filter ──────────────────────── */}
                        <Box sx={{
                            px: 2.5, py: 1.75,
                            display: 'flex', gap: 1.5, alignItems: 'center',
                            borderBottom: '1px solid #F0F0F5', flexWrap: 'wrap',
                        }}>
                            <TextField
                                placeholder="Search features…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                size="small"
                                sx={{ width: 240 }}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 16, color: '#9CA3AF' }} /></InputAdornment>,
                                    endAdornment: search && (
                                        <InputAdornment position="end">
                                            <IconButton size="small" onClick={() => setSearch('')}><Close sx={{ fontSize: 14 }} /></IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            {/* Category chips */}
                            <Box sx={{ display: 'flex', gap: 0.6, flexWrap: 'wrap', flex: 1 }}>
                                {categories.map((cat) => (
                                    <Chip
                                        key={cat}
                                        label={cat}
                                        size="small"
                                        onClick={() => setCatFilter(cat)}
                                        sx={{
                                            cursor: 'pointer',
                                            bgcolor: catFilter === cat ? selectedRoleMeta.color : '#F4F5F9',
                                            color: catFilter === cat ? '#fff' : '#374151',
                                            fontWeight: 600, fontSize: '0.72rem',
                                            '&:hover': { bgcolor: catFilter === cat ? selectedRoleMeta.color : '#E5E7EB' },
                                        }}
                                    />
                                ))}
                            </Box>
                            <Typography sx={{ fontSize: '0.75rem', color: '#9CA3AF', flexShrink: 0 }}>
                                {filtered.length} feature{filtered.length !== 1 ? 's' : ''}
                            </Typography>
                        </Box>

                        {/* ── Feature grid ───────────────────────────────────────────── */}
                        <Box sx={{ p: 2.5 }}>
                            {loading ? (
                                <Grid container spacing={1.5}>
                                    {Array.from({ length: 9 }).map((_, i) => (
                                        <Grid item xs={12} sm={6} md={4} key={i}>
                                            <Skeleton variant="rectangular" height={88} sx={{ borderRadius: 2 }} />
                                        </Grid>
                                    ))}
                                </Grid>
                            ) : filtered.length === 0 ? (
                                <Box sx={{ textAlign: 'center', py: 6 }}>
                                    <TuneIcon sx={{ fontSize: 40, color: '#E5E7EB', mb: 1 }} />
                                    <Typography sx={{ color: '#9CA3AF' }}>No features match your search</Typography>
                                </Box>
                            ) : (
                                <Grid container spacing={1.5}>
                                    {filtered.map((feature) => (
                                        <Grid item xs={12} sm={6} md={4} key={feature.featureKey}>
                                            <FeatureCard
                                                feature={feature}
                                                onChange={handleToggle}
                                                saving={saving}
                                                roleColor={selectedRoleMeta.color}
                                            />
                                        </Grid>
                                    ))}
                                </Grid>
                            )}
                        </Box>

                        {/* ── Footer notice ─────────────────────────────────────────── */}
                        <Box sx={{ px: 3, py: 1.75, borderTop: '1px solid #F0F0F5', bgcolor: '#FAFAFC' }}>
                            <Typography sx={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
                                ⚠️ Feature changes take effect the <strong>next time</strong> a user with this role logs in.
                                Currently active sessions are not affected.
                            </Typography>
                        </Box>
                    </Card>
                </Grid>
            </Grid>

            <ResetDialog
                open={resetOpen}
                roleName={selectedRoleMeta.label}
                onConfirm={handleReset}
                onClose={() => setResetOpen(false)}
            />
        </Box>
    );
};

export default FeatureControlPage;

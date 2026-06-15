// // src/pages/reports/ReportsPage.jsx
// // US-95: Custom reports with filters.
// // US-96: Schedule report button.
// // US-97: Export to Excel button (Admin/ITSM_MANAGER only).

// import React, { useState, useCallback, useEffect } from 'react';
// import {
//   Box, Typography, List, ListItemButton, ListItemText, ListItemIcon,
//   Divider, Select, MenuItem, FormControl, Chip, Alert,
//   Stack, CircularProgress, Tooltip, Avatar, Fade,
// } from '@mui/material';
// import AssessmentIcon        from '@mui/icons-material/Assessment';
// import FolderIcon            from '@mui/icons-material/Folder';
// import ArticleIcon           from '@mui/icons-material/Article';
// import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

// import ReportFilters         from '../../components/reports/ReportFilters';
// import ReportTable           from '../../components/reports/ReportTable';
// import Loader                from '../../components/reports/Loader';
// import EmptyState            from '../../components/reports/EmptyState';
// import SummaryCards          from '../../components/reports/SummaryCards';
// import ExportExcel           from '../../components/reports/ExportExcel';
// import ScheduleReportDialog  from '../../components/reports/ScheduleReportDialog';
// import { fetchReportMeta, fetchReportData } from '../../services/reportService';

// const SIDEBAR_WIDTH = 280;
// const EXCLUDED_KEYS = ['description', 'resolutionNotes', 'updatedBy', 'createdBy'];

// // Detect if current user is Admin / ITSM_MANAGER for US-97
// function isAdminRole() {
//   const roles = localStorage.getItem('userRoles') || '';
//   return roles.toUpperCase().includes('ADMIN') || roles.toUpperCase().includes('ITSM_MANAGER');
// }

// function buildColumns(firstRow) {
//   return Object.keys(firstRow)
//     .filter((k) => !EXCLUDED_KEYS.includes(k))
//     .map((k) => ({
//       key: k,
//       label: k.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()).trim(),
//       sortable: true,
//     }));
// }

// function extractRows(body) {
//   if (!body) return [];
//   return (
//     body.rows    || body.data    || body.content || body.records ||
//     body.items   || body.result  || body.tickets || body.reports ||
//     (Array.isArray(body) ? body : [])
//   );
// }

// export default function ReportsPage() {
//   const [categories,       setCategories]       = useState([]);
//   const [metaLoading,      setMetaLoading]       = useState(true);
//   const [metaError,        setMetaError]         = useState(null);
//   const [selectedCategory, setSelectedCategory] = useState('');
//   const [selectedReport,   setSelectedReport]   = useState(null);
//   const [loading,          setLoading]           = useState(false);
//   const [rows,             setRows]              = useState([]);
//   const [columns,          setColumns]           = useState([]);
//   const [summary,          setSummary]           = useState(null);
//   const [error,            setError]             = useState(null);
//   const [hasRun,           setHasRun]            = useState(false);
//   const [filterParams,     setFilterParams]      = useState({});
//   const [scheduleOpen,     setScheduleOpen]      = useState(false);

//   const isAdmin = isAdminRole();

//   useEffect(() => {
//     setMetaLoading(true);
//     fetchReportMeta()
//       .then((data) => { setCategories(data); setMetaError(null); })
//       .catch((err) => { setMetaError('Failed to load report categories.'); console.error(err); })
//       .finally(() => setMetaLoading(false));
//   }, []);

//   const handleCategoryChange = useCallback((cat) => {
//     setSelectedCategory(cat); setSelectedReport(null);
//     setRows([]); setColumns([]); setSummary(null);
//     setError(null); setHasRun(false); setFilterParams({});
//   }, []);

//   const handleReportSelect = useCallback((report) => {
//     setSelectedReport(report);
//     setRows([]); setColumns([]); setSummary(null);
//     setError(null); setHasRun(false); setFilterParams({});
//   }, []);

//   const handleReset = useCallback(() => {
//     setRows([]); setColumns([]); setSummary(null);
//     setError(null); setHasRun(false); setFilterParams({});
//   }, []);

//   const handleRunReport = useCallback(async (params) => {
//     if (!selectedReport) return;
//     const endpoint = selectedReport.endpoint;
//     if (!endpoint) { setError(`No endpoint configured for "${selectedReport.label}".`); return; }

//     // US-95 negative #1: if running with no effective filters this is still allowed;
//     // the backend returns all records. We keep the UX permissive.
//     setFilterParams(params);
//     setLoading(true); setError(null);
//     setRows([]); setColumns([]); setSummary(null);
//     setHasRun(true);

//     try {
//       const body = await fetchReportData(endpoint, params);
//       const data = extractRows(body);
//       setRows(data);
//       setSummary({ total: body?.totalRecords ?? data.length, statusBreakdown: body?.statusBreakdown || {} });
//       if (data.length > 0) setColumns(buildColumns(data[0]));
//       else setColumns([]);
//     } catch (err) {
//       const status = err?.response?.status;
//       if (status === 503 || status === 500) {
//         setError('Report service unavailable. Please try again later.');
//       } else {
//         setError(err?.response?.data?.message || err?.message || 'Failed to fetch report.');
//       }
//     } finally {
//       setLoading(false);
//     }
//   }, [selectedReport]);

//   const selectedCategoryMeta = categories.find((c) => c.value === selectedCategory);
//   const reportsForCategory   = selectedCategoryMeta?.reports || [];

//   // Derive reportType slug from selected report's endpoint for Excel export
//   const reportTypeSlug = selectedReport?.id || '';

//   const renderMainContent = () => {
//     if (!selectedReport)
//       return <EmptyState title="No report selected" subtitle="Choose a category and a report from the left panel to get started." />;
//     if (!hasRun)
//       return <EmptyState title="Ready to run" subtitle="Set your filters and click Run Report." variant="search" />;
//     if (loading) return <Loader text="Fetching report data…" />;
//     if (error)   return <EmptyState title="Error loading report" subtitle={error} variant="error" />;
//     return (
//       <ReportTable
//         data={rows}
//         columns={columns}
//         reportLabel={selectedReport.label}
//       />
//     );
//   };

//   return (
//     <Box sx={{ display: 'flex', height: '100%', width: '83vw', minHeight: 0, bgcolor: '#F8FAFC', overflow: 'hidden', overflowX: 'hidden' }}>

//       {/* ── Sidebar ── */}
//       <Box component="aside" sx={{ width: SIDEBAR_WIDTH, flexShrink: 0, borderRight: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: 'column', bgcolor: '#fff', overflowY: 'auto' }}>
//         <Box sx={{ px: 2.5, pt: 3, pb: 2.5 }}>
//           <Stack direction="row" alignItems="center" spacing={1.5}>
//             <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', borderRadius: 2 }}>
//               <AssessmentIcon sx={{ fontSize: 18 }} />
//             </Avatar>
//             <Box>
//               <Typography variant="subtitle1" fontWeight={700} color="text.primary" lineHeight={1.2}>Reports</Typography>
//               <Typography variant="caption" color="text.secondary">Analytics &amp; Insights</Typography>
//             </Box>
//           </Stack>
//         </Box>

//         <Divider />

//         <Box sx={{ px: 2, py: 2.5, flex: 1 }}>
//           {metaLoading && (
//             <Stack direction="row" alignItems="center" spacing={1.5} py={2} px={0.5}>
//               <CircularProgress size={16} />
//               <Typography variant="body2" color="text.secondary">Loading categories…</Typography>
//             </Stack>
//           )}
//           {metaError && <Alert severity="error" sx={{ fontSize: '0.78rem', py: 0.75, borderRadius: 2 }}>{metaError}</Alert>}

//           {!metaLoading && !metaError && (
//             <>
//               <Typography variant="overline" color="text.disabled" sx={{ fontSize: '0.68rem', letterSpacing: 1, px: 0.5 }}>Category</Typography>

//               <FormControl fullWidth size="small" sx={{ mt: 1, mb: 3 }}>
//                 <Select
//                   value={selectedCategory} displayEmpty
//                   onChange={(e) => handleCategoryChange(e.target.value)}
//                   renderValue={(val) => {
//                     if (!val) return <Typography variant="body2" color="text.disabled">Select a category</Typography>;
//                     return categories.find((c) => c.value === val)?.label || val;
//                   }}
//                   sx={{ borderRadius: 2, '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' } }}
//                   startAdornment={<FolderIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 0.75 }} />}
//                 >
//                   <MenuItem value=""><em>— Select a category —</em></MenuItem>
//                   {categories.map((cat) => (
//                     <MenuItem key={cat.value} value={cat.value}>{cat.label}</MenuItem>
//                   ))}
//                 </Select>
//               </FormControl>

//               {selectedCategory && (
//                 <Fade in>
//                   <Box>
//                     <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5} px={0.5}>
//                       <Typography variant="overline" color="text.disabled" sx={{ fontSize: '0.68rem', letterSpacing: 1 }}>Available Reports</Typography>
//                       <Chip label={reportsForCategory.length} size="small" color="primary" sx={{ height: 18, fontSize: '0.68rem', '.MuiChip-label': { px: 0.75 } }} />
//                     </Stack>
//                     <List dense disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                       {reportsForCategory.map((r) => {
//                         const isSelected = selectedReport?.id === r.id;
//                         return (
//                           <Tooltip key={r.id} title={r.description || ''} placement="right" arrow>
//                             <ListItemButton
//                               selected={isSelected}
//                               onClick={() => handleReportSelect(r)}
//                               sx={{ borderRadius: 2, px: 1.5, py: 1, transition: 'all 0.15s', '&.Mui-selected': { bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.200', '&:hover': { bgcolor: 'primary.100' } }, '&:not(.Mui-selected)': { border: '1px solid transparent' } }}
//                             >
//                               <ListItemIcon sx={{ minWidth: 28 }}>
//                                 <ArticleIcon sx={{ fontSize: 16, color: isSelected ? 'primary.main' : 'text.disabled' }} />
//                               </ListItemIcon>
//                               <ListItemText
//                                 primary={r.label}
//                                 primaryTypographyProps={{ fontSize: '0.82rem', fontWeight: isSelected ? 600 : 400, color: isSelected ? 'primary.main' : 'text.primary', lineHeight: 1.4 }}
//                               />
//                               {isSelected && <KeyboardArrowRightIcon sx={{ fontSize: 16, color: 'primary.main' }} />}
//                             </ListItemButton>
//                           </Tooltip>
//                         );
//                       })}
//                     </List>
//                   </Box>
//                 </Fade>
//               )}

//               {!selectedCategory && (
//                 <Box sx={{ mt: 2, px: 2, py: 3, border: '1.5px dashed', borderColor: 'divider', borderRadius: 2, textAlign: 'center' }}>
//                   <FolderIcon sx={{ fontSize: 28, color: 'text.disabled', mb: 0.5 }} />
//                   <Typography variant="body2" color="text.disabled" sx={{ fontSize: '0.8rem' }}>Select a category to see available reports</Typography>
//                 </Box>
//               )}
//             </>
//           )}
//         </Box>
//       </Box>

//       {/* ── Main Content ── */}
//       <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', minWidth: 0 }}>

//         {/* Report Header */}
//         <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid', borderColor: 'divider', bgcolor: '#fff', width: '100%' }}>
//           {selectedReport ? (
//             <Stack direction="row" alignItems="center" spacing={2}>
//               <Avatar sx={{ width: 44, height: 44, bgcolor: 'primary.50', borderRadius: 2, border: '1px solid', borderColor: 'primary.200' }}>
//                 <AssessmentIcon sx={{ color: 'primary.main', fontSize: 22 }} />
//               </Avatar>
//               <Box flex={1}>
//                 <Typography variant="h6" fontWeight={700} color="text.primary" lineHeight={1.2}>{selectedReport.label}</Typography>
//                 <Stack direction="row" alignItems="center" spacing={1} mt={0.25}>
//                   <Chip label={selectedCategoryMeta?.label} size="small" sx={{ height: 20, fontSize: '0.7rem', bgcolor: 'grey.100', color: 'text.secondary', '.MuiChip-label': { px: 1 } }} />
//                   {selectedReport.description && (
//                     <Typography variant="caption" color="text.secondary">{selectedReport.description}</Typography>
//                   )}
//                 </Stack>
//               </Box>
//               {/* US-96: Schedule button */}
//               {hasRun && (
//                 <Tooltip title="Schedule this report to be emailed automatically">
//                   <span>
//                     <Chip
//                       label="Schedule"
//                       icon={<span style={{ fontSize: 14 }}>📅</span>}
//                       onClick={() => setScheduleOpen(true)}
//                       size="small"
//                       variant="outlined"
//                       sx={{ cursor: 'pointer', fontWeight: 600, borderColor: 'primary.main', color: 'primary.main', '&:hover': { bgcolor: 'primary.50' } }}
//                     />
//                   </span>
//                 </Tooltip>
//               )}
//               {/* US-97: Excel export — visible only to Admin */}
//               <ExportExcel
//                 reportType={reportTypeSlug}
//                 reportLabel={selectedReport.label}
//                 filterParams={filterParams}
//                 isAdmin={isAdmin}
//                 disabled={!hasRun || loading}
//               />
//             </Stack>
//           ) : (
//             <Stack direction="row" alignItems="center" spacing={2}>
//               <Avatar sx={{ width: 44, height: 44, bgcolor: 'grey.100', borderRadius: 2 }}>
//                 <AssessmentIcon sx={{ color: 'text.disabled', fontSize: 22 }} />
//               </Avatar>
//               <Box>
//                 <Typography variant="subtitle1" fontWeight={600} color="text.disabled">Select a report to get started</Typography>
//                 <Typography variant="caption" color="text.disabled">Choose a category and report from the sidebar</Typography>
//               </Box>
//             </Stack>
//           )}
//         </Box>

//         {/* Filters Bar */}
//         <Box sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: '#fff' }}>
//           <ReportFilters onApply={handleRunReport} onReset={handleReset} loading={loading} />
//         </Box>

//         {/* Summary Cards */}
//         {!loading && !error && hasRun && summary && (
//           <Fade in>
//             <Box sx={{ px: 3, pt: 2.5, pb: 0, width: '100%' }}>
//               <SummaryCards summary={summary} />
//             </Box>
//           </Fade>
//         )}

//         {/* Content */}
//         <Box sx={{ px: 3, pt: 2.5, pb: 3 }}>
//           {renderMainContent()}
//         </Box>
//       </Box>

//       {/* US-96: Schedule dialog */}
//       <ScheduleReportDialog
//         open={scheduleOpen}
//         onClose={() => setScheduleOpen(false)}
//         reportLabel={selectedReport?.label || ''}
//         reportType={reportTypeSlug}
//         filterParams={filterParams}
//       />
//     </Box>
//   );
// }

// src/pages/reports/ReportsPage.jsx
// US-95: Custom reports with filters.
// US-96: Schedule report button.
// US-97: Export to Excel button (Admin/ITSM_MANAGER only).
//
// Layout fix: sidebar + header + filter bar are FIXED (no scroll).
// Only the data/table area scrolls.
 
import React, { useState, useCallback, useEffect } from 'react';
import {
  Box, Typography, List, ListItemButton, ListItemText, ListItemIcon,
  Divider, Select, MenuItem, FormControl, Chip, Alert,
  Stack, CircularProgress, Tooltip, Avatar, Fade,
} from '@mui/material';
import AssessmentIcon         from '@mui/icons-material/Assessment';
import FolderIcon             from '@mui/icons-material/Folder';
import ArticleIcon            from '@mui/icons-material/Article';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
 
import ReportFilters        from '../../components/reports/ReportFilters';
import ReportTable          from '../../components/reports/ReportTable';
import Loader               from '../../components/reports/Loader';
import EmptyState           from '../../components/reports/EmptyState';
import SummaryCards         from '../../components/reports/SummaryCards';
import ExportExcel          from '../../components/reports/ExportExcel';
import ScheduleReportDialog from '../../components/reports/ScheduleReportDialog';
import { fetchReportMeta, fetchReportData } from '../../services/reportService';
 
const SIDEBAR_W    = 256;
const EXCLUDED_KEYS = ['description', 'resolutionNotes', 'updatedBy', 'createdBy'];
 
function isAdminRole() {
  const roles = localStorage.getItem('userRoles') || '';
  return roles.toUpperCase().includes('ADMIN') || roles.toUpperCase().includes('ITSM_MANAGER');
}
 
function buildColumns(firstRow) {
  return Object.keys(firstRow)
    .filter((k) => !EXCLUDED_KEYS.includes(k))
    .map((k) => ({
      key: k,
      label: k.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()).trim(),
      sortable: true,
    }));
}
 
function extractRows(body) {
  if (!body) return [];
  return (
    body.rows   || body.data    || body.content || body.records ||
    body.items  || body.result  || body.tickets || body.reports ||
    (Array.isArray(body) ? body : [])
  );
}
 
export default function ReportsPage() {
  const [categories,       setCategories]       = useState([]);
  const [metaLoading,      setMetaLoading]       = useState(true);
  const [metaError,        setMetaError]         = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedReport,   setSelectedReport]   = useState(null);
  const [loading,          setLoading]           = useState(false);
  const [rows,             setRows]              = useState([]);
  const [columns,          setColumns]           = useState([]);
  const [summary,          setSummary]           = useState(null);
  const [error,            setError]             = useState(null);
  const [hasRun,           setHasRun]            = useState(false);
  const [filterParams,     setFilterParams]      = useState({});
  const [scheduleOpen,     setScheduleOpen]      = useState(false);
 
  const isAdmin = isAdminRole();
 
  useEffect(() => {
    setMetaLoading(true);
    fetchReportMeta()
      .then((data) => { setCategories(data); setMetaError(null); })
      .catch((err) => { setMetaError('Failed to load report categories.'); console.error(err); })
      .finally(() => setMetaLoading(false));
  }, []);
 
  /* When category changes — clear results/report but KEEP dates untouched in filter component */
  const handleCategoryChange = useCallback((cat) => {
    setSelectedCategory(cat);
    setSelectedReport(null);
    setRows([]); setColumns([]); setSummary(null);
    setError(null); setHasRun(false);
  }, []);
 
  const handleReportSelect = useCallback((report) => {
    setSelectedReport(report);
    setRows([]); setColumns([]); setSummary(null);
    setError(null); setHasRun(false);
  }, []);
 
  const handleReset = useCallback(() => {
    setRows([]); setColumns([]); setSummary(null);
    setError(null); setHasRun(false); setFilterParams({});
  }, []);
 
  const handleRunReport = useCallback(async (params) => {
    if (!selectedReport) return;
    const endpoint = selectedReport.endpoint;
    if (!endpoint) { setError(`No endpoint configured for "${selectedReport.label}".`); return; }
 
    setFilterParams(params);
    setLoading(true); setError(null);
    setRows([]); setColumns([]); setSummary(null);
    setHasRun(true);
 
    try {
      const body = await fetchReportData(endpoint, params);
      const data = extractRows(body);
      setRows(data);
      setSummary({ total: body?.totalRecords ?? data.length, statusBreakdown: body?.statusBreakdown || {} });
      if (data.length > 0) setColumns(buildColumns(data[0]));
      else setColumns([]);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 503 || status === 500) {
        setError('Report service unavailable. Please try again later.');
      } else {
        setError(err?.response?.data?.message || err?.message || 'Failed to fetch report.');
      }
    } finally {
      setLoading(false);
    }
  }, [selectedReport]);
 
  const selectedCategoryMeta = categories.find((c) => c.value === selectedCategory);
  const reportsForCategory   = selectedCategoryMeta?.reports || [];
  const reportTypeSlug       = selectedReport?.id || '';
 
  const renderContent = () => {
    if (!selectedReport)
      return <EmptyState title="No report selected" subtitle="Choose a category and a report from the left panel to get started." />;
    if (!hasRun)
      return <EmptyState title="Ready to run" subtitle="Set your filters and click Run Report." variant="search" />;
    if (loading) return <Loader text="Fetching report data…" />;
    if (error)   return <EmptyState title="Error loading report" subtitle={error} variant="error" />;
    return <ReportTable data={rows} columns={columns} reportLabel={selectedReport.label} />;
  };
 
  return (
    /*
     * Root: full height, no overflow — nothing scrolls here.
     * Children establish their own scroll regions.
     */
    <Box sx={{
      display: 'flex',
      height: '100%',
      width: '83vw',
      overflow: 'hidden',
      bgcolor: '#F8FAFC',
    }}>
 
      {/* ── Sidebar (fixed, internal scroll) ── */}
      <Box
        component="aside"
        sx={{
          width: SIDEBAR_W,
          flexShrink: 0,
          borderRight: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: '#fff',
          height: '100%',
          overflowY: 'auto',          /* sidebar itself scrolls if list is long */
        }}
      >
        {/* Sidebar header */}
        <Box sx={{ px: 2, pt: 2.5, pb: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1.25}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', borderRadius: 1.5 }}>
              <AssessmentIcon sx={{ fontSize: 16 }} />
            </Avatar>
            <Box>
              <Typography variant="subtitle2" fontWeight={700} color="text.primary" lineHeight={1.2}>Reports</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem' }}>Analytics &amp; Insights</Typography>
            </Box>
          </Stack>
        </Box>
 
        <Divider />
 
        <Box sx={{ px: 1.5, py: 2, flex: 1 }}>
          {metaLoading && (
            <Stack direction="row" alignItems="center" spacing={1} py={1.5} px={0.5}>
              <CircularProgress size={14} />
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.78rem' }}>Loading…</Typography>
            </Stack>
          )}
          {metaError && (
            <Alert severity="error" sx={{ fontSize: '0.75rem', py: 0.5, borderRadius: 1.5 }}>{metaError}</Alert>
          )}
 
          {!metaLoading && !metaError && (
            <>
              <Typography variant="overline" color="text.disabled" sx={{ fontSize: '0.65rem', letterSpacing: 1, px: 0.5 }}>
                CATEGORY
              </Typography>
 
              <FormControl fullWidth size="small" sx={{ mt: 0.75, mb: 2.5 }}>
                <Select
                  value={selectedCategory}
                  displayEmpty
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  renderValue={(val) => {
                    if (!val) return <Typography variant="body2" color="text.disabled" sx={{ fontSize: '0.8rem' }}>Select a category</Typography>;
                    return <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{categories.find((c) => c.value === val)?.label || val}</Typography>;
                  }}
                  sx={{ borderRadius: 1.5, fontSize: '0.8rem', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' } }}
                  startAdornment={<FolderIcon sx={{ fontSize: 14, color: 'text.secondary', mr: 0.75 }} />}
                >
                  <MenuItem value=""><em>— Select —</em></MenuItem>
                  {categories.map((cat) => (
                    <MenuItem key={cat.value} value={cat.value} sx={{ fontSize: '0.82rem' }}>{cat.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
 
              {selectedCategory && (
                <Fade in>
                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1} px={0.5}>
                      <Typography variant="overline" color="text.disabled" sx={{ fontSize: '0.65rem', letterSpacing: 1 }}>
                        AVAILABLE REPORTS
                      </Typography>
                      <Chip
                        label={reportsForCategory.length}
                        size="small"
                        color="primary"
                        sx={{ height: 16, fontSize: '0.65rem', '.MuiChip-label': { px: 0.6 } }}
                      />
                    </Stack>
 
                    <List dense disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 0.4 }}>
                      {reportsForCategory.map((r) => {
                        const isSelected = selectedReport?.id === r.id;
                        return (
                          <Tooltip key={r.id} title={r.description || ''} placement="right" arrow>
                            <ListItemButton
                              selected={isSelected}
                              onClick={() => handleReportSelect(r)}
                              sx={{
                                borderRadius: 1.5, px: 1.25, py: 0.75,
                                transition: 'all 0.15s',
                                '&.Mui-selected': {
                                  bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.200',
                                  '&:hover': { bgcolor: 'primary.100' },
                                },
                                '&:not(.Mui-selected)': { border: '1px solid transparent' },
                              }}
                            >
                              <ListItemIcon sx={{ minWidth: 24 }}>
                                <ArticleIcon sx={{ fontSize: 14, color: isSelected ? 'primary.main' : 'text.disabled' }} />
                              </ListItemIcon>
                              <ListItemText
                                primary={r.label}
                                primaryTypographyProps={{
                                  fontSize: '0.79rem',
                                  fontWeight: isSelected ? 600 : 400,
                                  color: isSelected ? 'primary.main' : 'text.primary',
                                  lineHeight: 1.35,
                                }}
                              />
                              {isSelected && <KeyboardArrowRightIcon sx={{ fontSize: 14, color: 'primary.main' }} />}
                            </ListItemButton>
                          </Tooltip>
                        );
                      })}
                    </List>
                  </Box>
                </Fade>
              )}
 
              {!selectedCategory && (
                <Box sx={{ mt: 1.5, px: 1.5, py: 2.5, border: '1.5px dashed', borderColor: 'divider', borderRadius: 2, textAlign: 'center' }}>
                  <FolderIcon sx={{ fontSize: 24, color: 'text.disabled', mb: 0.5 }} />
                  <Typography variant="body2" color="text.disabled" sx={{ fontSize: '0.75rem' }}>
                    Select a category to see reports
                  </Typography>
                </Box>
              )}
            </>
          )}
        </Box>
      </Box>
 
      {/* ── Main Panel (fixed height, column flex) ── */}
      <Box sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',   /* crucial — prevents the entire column from scrolling */
        minWidth: 0,
      }}>
 
        {/* ── Report Header — FIXED (does not scroll) ── */}
        <Box sx={{
          px: 2.5, py: 1.5,
          borderBottom: '1px solid', borderColor: 'divider',
          bgcolor: '#fff',
          flexShrink: 0,
        }}>
          {selectedReport ? (
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.50', borderRadius: 1.5, border: '1px solid', borderColor: 'primary.200' }}>
                <AssessmentIcon sx={{ color: 'primary.main', fontSize: 18 }} />
              </Avatar>
              <Box flex={1}>
                <Typography variant="subtitle1" fontWeight={700} color="text.primary" lineHeight={1.2}>
                  {selectedReport.label}
                </Typography>
                <Stack direction="row" alignItems="center" spacing={0.75} mt={0.2}>
                  <Chip
                    label={selectedCategoryMeta?.label}
                    size="small"
                    sx={{ height: 18, fontSize: '0.67rem', bgcolor: 'grey.100', color: 'text.secondary', '.MuiChip-label': { px: 0.75 } }}
                  />
                  {selectedReport.description && (
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem' }}>
                      {selectedReport.description}
                    </Typography>
                  )}
                </Stack>
              </Box>
 
              {/* Schedule button (US-96) */}
              {hasRun && (
                <Tooltip title="Schedule this report to be emailed automatically">
                  <span>
                    <Chip
                      label="Schedule"
                      icon={<span style={{ fontSize: 12 }}>📅</span>}
                      onClick={() => setScheduleOpen(true)}
                      size="small"
                      variant="outlined"
                      sx={{ cursor: 'pointer', fontWeight: 600, borderColor: 'primary.main', color: 'primary.main', '&:hover': { bgcolor: 'primary.50' } }}
                    />
                  </span>
                </Tooltip>
              )}
 
              {/* Excel export (US-97) */}
              <ExportExcel
                reportType={reportTypeSlug}
                reportLabel={selectedReport.label}
                filterParams={filterParams}
                isAdmin={isAdmin}
                disabled={!hasRun || loading}
              />
            </Stack>
          ) : (
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar sx={{ width: 36, height: 36, bgcolor: 'grey.100', borderRadius: 1.5 }}>
                <AssessmentIcon sx={{ color: 'text.disabled', fontSize: 18 }} />
              </Avatar>
              <Box>
                <Typography variant="subtitle2" fontWeight={600} color="text.disabled">Select a report to get started</Typography>
                <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.72rem' }}>
                  Choose a category and report from the sidebar
                </Typography>
              </Box>
            </Stack>
          )}
        </Box>
 
        {/* ── Filters Bar — FIXED (does not scroll) ── */}
        <Box sx={{
          borderBottom: '1px solid', borderColor: 'divider',
          bgcolor: '#fff',
          display:'flex',
          justifyContent:'center',
          alignItems:'center',
          flexShrink: 0,
          height:'60px'
        }}>
          <ReportFilters onApply={handleRunReport} onReset={handleReset} loading={loading} />
        </Box>
 
        {/* ── Scrollable content area — ONLY this scrolls ── */}
        <Box sx={{ flex: 1, overflowY: 'auto', px: 2.5, py: 2 }}>
 
          {/* Summary cards (compact) */}
          {!loading && !error && hasRun && summary && (
            <Fade in>
              <Box sx={{ mb: 1.5 }}>
                <SummaryCards summary={summary} />
              </Box>
            </Fade>
          )}
 
          {/* Table / empty / loader */}
          {renderContent()}
        </Box>
      </Box>
 
      {/* Schedule dialog (US-96) */}
      <ScheduleReportDialog
        open={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        reportLabel={selectedReport?.label || ''}
        reportType={reportTypeSlug}
        filterParams={filterParams}
      />
    </Box>
  );
}
 
 
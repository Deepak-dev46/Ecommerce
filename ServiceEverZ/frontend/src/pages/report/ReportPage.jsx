 import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Card, Chip, Button,
  Divider, ToggleButton, ToggleButtonGroup,
  CircularProgress, Select, MenuItem, FormControl, InputLabel,
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TablePagination, Paper, Tooltip,
  Avatar, Skeleton, IconButton, Collapse,
} from '@mui/material';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DownloadIcon from '@mui/icons-material/Download';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import PageHeader from '../../components/common/PageHeader';
import { reportsApi as reportApi } from '../../api/reportsApi';
import { downloadFile } from '../../utils/downloadFile';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
 
// ── Theme ─────────────────────────────────────────────────────────────────────
const T = {
  primary:   '#27235C',
  secondary: '#97247E',
  grad:      'linear-gradient(135deg, #27235C 0%, #97247E 100%)',
  bg:        '#F0F2F8',
  border:    '#E2E5EF',
  textSec:   '#6B7280',
  success:   '#24A148',
  white:     '#ffffff',
  sidebarBg: '#1E1B4B',
  sidebarHover: '#2D2A6E',
  sidebarActive: 'linear-gradient(135deg, #27235C 0%, #97247E 100%)',
};
 
// ── Static Config ─────────────────────────────────────────────────────────────
const REPORT_COLUMNS = {
  users: [
    { key: 'employeeId',  label: 'Employee ID' },
    { key: 'fullName',    label: 'Full Name' },
    { key: 'email',       label: 'Email' },
    { key: 'department',  label: 'Department' },
    { key: 'designation', label: 'Designation' },
    { key: 'status',      label: 'Status', isStatus: true },
  ],
  roles: [
    { key: 'roleName',   label: 'Role Name' },
    { key: 'totalUsers', label: 'Total Users', isCount: true },
  ],
  rolesDetails: [
    { key: 'roleName',    label: 'Role Name' },
    { key: 'employeeId',  label: 'Employee ID' },
    { key: 'fullName',    label: 'Name' },
    { key: 'email',       label: 'Email' },
    { key: 'department',  label: 'Department' },
    { key: 'designation', label: 'Designation' },
    { key: 'status',      label: 'Status', isStatus: true },
  ],
  activity: [
    { key: 'fullName',      label: 'Full Name' },
    { key: 'email',         label: 'Email' },
    { key: 'status',        label: 'Status',         isStatus: true },
    { key: 'firstLogin',    label: 'First Login',    isBool: true },
    { key: 'accountLocked', label: 'Account Locked', isBool: true },
  ],
};
 
const FILTER_CONFIGS = {
  users: [
    { key: 'status',     label: 'Status',     options: ['All','ACTIVE','INACTIVE','PENDINGACTIVATION','DISABLED'] },
    { key: 'department', label: 'Department', options: ['All','IT','HR','Finance','Operations','Sales'] },
  ],
  roles: [
    { key: 'roleName', label: 'Role Name', options: ['All','ADMIN','RMO','END_USER','ITSM_MANAGER','SUPPORT_PERSONNEL'] },
  ],
  rolesDetails: [
    { key: 'roleName', label: 'Role Name', options: ['All','ADMIN','RMO','END_USER','ITSM_MANAGER','SUPPORT_PERSONNEL'] },
    { key: 'status',   label: 'Status',   options: ['All','ACTIVE','PENDINGACTIVATION','DISABLED'] },
  ],
  activity: [
    { key: 'status',        label: 'Status',        options: ['All','ACTIVE','PENDINGACTIVATION','DISABLED'] },
    { key: 'firstLogin',    label: 'First Login',    options: ['All','true','false'] },
    { key: 'accountLocked', label: 'Account Locked', options: ['All','true','false'] },
  ],
};
 
const REPORTS = [
  {
    key: 'users',
    title: 'Users Report',
    subtitle: 'All registered users',
    description: 'Export all users with department, designation, location, and status.',
    Icon: PeopleAltIcon,
    accentColor: '#27235C',
    lightBg: '#EEF0FF',
    tag: 'User Data',
    apiFn: (format) => reportApi.downloadUsersReport(format),
    filename: (fmt) => `users_report.${fmt === 'csv' ? 'csv' : fmt === 'pdf' ? 'pdf' : 'xlsx'}`,
  },
  {
    key: 'roles',
    title: 'Role Distribution',
    subtitle: 'Role assignment overview',
    description: 'Export role assignments and how many users are mapped to each role.',
    Icon: AdminPanelSettingsIcon,
    accentColor: '#97247E',
    lightBg: '#FDF4FB',
    tag: 'Roles',
    apiFn: (format) => reportApi.downloadRolesReport(format),
    filename: (fmt) => `roles_report.${fmt === 'csv' ? 'csv' : fmt === 'pdf' ? 'pdf' : 'xlsx'}`,
  },
  {
    key: 'activity',
    title: 'Activity Report',
    subtitle: 'User login & account activity',
    description: 'Export user login activity, current status, and account details.',
    Icon: AssessmentIcon,
    accentColor: '#24A148',
    lightBg: '#ECFDF5',
    tag: 'Activity',
    apiFn: (format) => reportApi.downloadActivityReport(format),
    filename: (fmt) => `activity_report.${fmt === 'csv' ? 'csv' : fmt === 'pdf' ? 'pdf' : 'xlsx'}`,
  },
];
 
// ── Helpers ───────────────────────────────────────────────────────────────────
const StatusBadge = ({ value }) => {
  const map = {
    ACTIVE:            { bg: '#DCFCE7', color: '#166534', label: 'Active' },
    INACTIVE:          { bg: '#FEF9C3', color: '#854D0E', label: 'Inactive' },
    DISABLED:          { bg: '#FEE2E2', color: '#991B1B', label: 'Disabled' },
    PENDINGACTIVATION: { bg: '#DBEAFE', color: '#1E40AF', label: 'Pending' },
  };
  const s = map[value?.toUpperCase()] || { bg: '#F3F4F6', color: '#374151', label: value || '—' };
  return (
    <Chip label={s.label} size="small"
      sx={{ height: 22, fontSize: '0.68rem', fontWeight: 700,
        backgroundColor: s.bg, color: s.color, border: 'none', borderRadius: '6px' }} />
  );
};
 
const BoolBadge = ({ value }) => {
  const isTrue = value === true || value === 'true';
  return (
    <Chip label={isTrue ? 'Yes' : 'No'} size="small"
      sx={{ height: 22, fontSize: '0.68rem', fontWeight: 700,
        backgroundColor: isTrue ? '#DCFCE7' : '#F3F4F6',
        color: isTrue ? '#166534' : '#374151', borderRadius: '6px' }} />
  );
};
 
const SkeletonRows = ({ cols, rows = 5 }) => (
  <>
    {Array.from({ length: rows }).map((_, i) => (
      <TableRow key={i}>
        {Array.from({ length: cols }).map((__, j) => (
          <TableCell key={j} sx={{ py: 1.2 }}>
            <Skeleton variant="rounded" height={14} width={`${50 + Math.random() * 40}%`} />
          </TableCell>
        ))}
      </TableRow>
    ))}
  </>
);
 
function parseCSVLine(line) {
  const result = []; let current = ''; let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') { inQuotes = !inQuotes; }
    else if (ch === ',' && !inQuotes) { result.push(current.trim()); current = ''; }
    else { current += ch; }
  }
  result.push(current.trim());
  return result;
}
 
function buildColKeyMap(csvHeaders, reportKey) {
  const HEADER_TO_KEY = {
    'role name': 'roleName', 'total users assigned': 'totalUsers',
    'total users': 'totalUsers', 'employee id': 'employeeId',
    'full name': 'fullName', 'name': 'fullName', 'email': 'email',
    'department': 'department', 'designation': 'designation', 'status': 'status',
    'first login': 'firstLogin', 'account locked': 'accountLocked',
  };
  const normalize = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const columns = REPORT_COLUMNS[reportKey] || [];
  const map = {};
  columns.forEach((col) => {
    const explicitMatch = csvHeaders.find(
      (h) => HEADER_TO_KEY[normalize(h).replace(/[^a-z0-9 ]/g, '').trim()] === col.key
          || HEADER_TO_KEY[h.toLowerCase().trim()] === col.key
    );
    if (explicitMatch) { map[col.key] = explicitMatch; return; }
    const fallback = csvHeaders.find((h) => normalize(h) === normalize(col.label));
    map[col.key] = fallback || col.key;
  });
  return map;
}
 
function parseCSVToRows(text, reportKey) {
  const lines = text.trim().split('\n').filter(Boolean);
  if (lines.length < 2) return [];
  const headers = parseCSVLine(lines[0]);
  const colKeyMap = buildColKeyMap(headers, reportKey);
  const columns = REPORT_COLUMNS[reportKey] || [];
  return lines.slice(1).map((line) => {
    const vals = parseCSVLine(line);
    const raw = {};
    headers.forEach((h, i) => { raw[h] = vals[i] ?? ''; });
    if (!raw['Full Name'] && (raw['First Name'] || raw['Last Name'])) {
      raw['Full Name'] = `${raw['First Name'] || ''} ${raw['Last Name'] || ''}`.trim();
    }
    const out = {};
    columns.forEach((col) => {
      out[col.key] = raw[colKeyMap[col.key]] ?? raw[col.label] ?? raw[col.key] ?? '';
    });
    return out;
  });
}
 
function exportFilteredData(filteredData, columns, filename) {
  const headerRow = columns.map((c) => c.label).join(',');
  const dataRows = filteredData.map((row) =>
    columns.map((c) => {
      const val = String(row[c.key] ?? '').replace(/"/g, '""');
      return val.includes(',') ? `"${val}"` : val;
    }).join(',')
  );
  const content = [headerRow, ...dataRows].join('\n');
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename.replace('.xlsx', '.csv'));
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
 
 
function exportAsPDF(filteredData, columns, title, filename) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
 
  // Header bar
  doc.setFillColor(39, 35, 92);
  doc.rect(0, 0, 297, 18, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 14, 12);
 
  // Date
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })}`, 270, 12, { align: 'right' });
 
  const head = [columns.map((c) => c.label)];
  const body = filteredData.map((row) =>
    columns.map((col) => {
      const val = row[col.key];
      if (col.isBool) return val === true || val === 'true' ? 'Yes' : 'No';
      return String(val ?? '—');
    })
  );
 
  autoTable(doc, {
    startY: 22,
    head,
    body,
    headStyles: {
      fillColor: [39, 35, 92],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 8,
    },
    bodyStyles: { fontSize: 7.5, textColor: [30, 30, 60] },
    alternateRowStyles: { fillColor: [240, 242, 248] },
    styles: { cellPadding: 3, overflow: 'linebreak' },
    margin: { left: 14, right: 14 },
  });
 
  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(150);
    doc.text(`Page ${i} of ${pageCount}`, 283, 205, { align: 'right' });
    doc.text('ServiceEverZ — Confidential', 14, 205);
  }
 
  doc.save(filename);
}
 
// ── Report Detail
 // ── Report Detail Panel ───────────────────────────────────────────────────
const ReportDetail = ({ report }) => {
  const [format, setFormat]           = useState('excel');
  const [dlLoading, setDlLoading]     = useState(false);
  const [filters, setFilters]         = useState({});
  const [page, setPage]               = useState(0);
  const [rowsPerPage, setRows]        = useState(10);
  const [tableData, setTableData]     = useState([]);
  const [detailsData, setDetailsData] = useState([]);
  const [activeSheet, setActiveSheet] = useState('summary');
  const [fetching, setFetching]       = useState(false);
  const [fetched, setFetched]         = useState(false);
  const [showFilters, setShowFilters] = useState(false);
 
  const filterConfig = report.key === 'roles' && activeSheet === 'details'
    ? FILTER_CONFIGS['rolesDetails']
    : FILTER_CONFIGS[report.key] || [];
 
  const activeFilters = Object.entries(filters).filter(([, v]) => v && v !== 'All').length;
 
  const columns = report.key === 'roles' && activeSheet === 'details'
    ? REPORT_COLUMNS['rolesDetails']
    : REPORT_COLUMNS[report.key] || [];
 
  const fetchPreview = useCallback(async () => {
    setFetching(true);
    try {
      const res = await report.apiFn('csv');
      const text = await res.data.text();
      setTableData(parseCSVToRows(text, report.key));
      if (report.key === 'roles') {
        try {
          const res2 = await reportApi.downloadRolesReport('csv', '2');
          const text2 = await res2.data.text();
          setDetailsData(parseCSVToRows(text2, 'rolesDetails'));
        } catch (e) { console.error('Sheet 2 fetch error:', e); }
      }
      setFetched(true);
    } catch (err) {
      toast.error(`Failed to load ${report.title} preview`);
      setFetched(true);
    } finally {
      setFetching(false);
    }
  }, [report]);
 
  // Reset state when report changes
  useEffect(() => {
    setFetched(false);
    setTableData([]);
    setDetailsData([]);
    setFilters({});
    setPage(0);
    setActiveSheet('summary');
    setShowFilters(false);
  }, [report.key]);
 
  useEffect(() => {
    if (!fetched) fetchPreview();
  }, [fetched, fetchPreview]);
 
  useEffect(() => { setPage(0); }, [filters, activeSheet]);
 
  const filteredData = React.useMemo(() => {
    const source = report.key === 'roles' && activeSheet === 'details' ? detailsData : tableData;
    let data = [...source];
    if (report.key === 'roles') {
      data = data.map((row) => {
        const role = (row.roleName || '').toUpperCase();
        if (role === 'APPROVAL_MANAGER_L1' || role === 'APPROVAL_MANAGER_L2')
          return { ...row, roleName: 'END_USER' };
        return row;
      });
      if (activeSheet === 'summary') {
        const merged = {};
        data.forEach((row) => {
          const key = row.roleName;
          if (merged[key]) {
            merged[key] = { ...merged[key], totalUsers: String(parseInt(merged[key].totalUsers || '0') + parseInt(row.totalUsers || '0')) };
          } else { merged[key] = { ...row }; }
        });
        data = Object.values(merged);
      }
    }
    Object.entries(filters).forEach(([key, val]) => {
      if (!val || val === 'All') return;
      data = data.filter((row) => {
        const cellVal  = String(row[key] ?? '').toLowerCase();
        const filterVal = val.toLowerCase();
        if (key === 'roleName' && filterVal === 'end_user') {
          return cellVal === 'end_user' || cellVal === 'approval_manager_l1' || cellVal === 'approval_manager_l2';
        }
        return cellVal === filterVal;
      });
    });
    return data;
  }, [tableData, detailsData, filters, activeSheet, report.key]);
 
  const paginatedData = filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
 
  const handleDownload = async () => {
    setDlLoading(true);
    try {
      if (format === 'pdf') {
        // PDF always generated client-side from current filtered/loaded data
        if (!fetched || filteredData.length === 0) {
          toast.error('No data loaded yet. Please wait for preview to load.');
          return;
        }
        exportAsPDF(filteredData, columns, report.title, report.filename('pdf'));
        toast.success(`${report.title} PDF downloaded!`);
      } else if (activeFilters > 0 && fetched) {
        exportFilteredData(filteredData, columns, report.filename(format));
      } else {
        const res = await report.apiFn(format);
        downloadFile(res.data, report.filename(format));
        toast.success(`${report.title} downloaded successfully!`);
      }
    } catch (err) {
      console.error('Download error:', err);
      toast.error(`Failed to download ${report.title}`);
    } finally {
      setDlLoading(false);
    }
  };
 
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
 
      {/* Panel Header */}
      <Box sx={{
        px: 3, py: 2.5,
        borderBottom: `1px solid ${T.border}`,
        background: T.white,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{
            width: 46, height: 46, borderRadius: '14px',
            backgroundColor: report.lightBg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <report.Icon sx={{ fontSize: 24, color: report.accentColor }} />
          </Box>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ fontSize: '1.05rem', fontWeight: 800, color: T.primary }}>
                {report.title}
              </Typography>
              <Chip label={report.tag} size="small"
                sx={{ height: 20, fontSize: '0.62rem', fontWeight: 700,
                  backgroundColor: report.lightBg, color: report.accentColor, borderRadius: '6px' }} />
            </Box>
            <Typography sx={{ fontSize: '0.75rem', color: T.textSec, mt: 0.2 }}>
              {report.description}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {fetching && <CircularProgress size={16} sx={{ color: report.accentColor }} />}
          {fetched && !fetching && (
            <Tooltip title="Refresh data">
              <IconButton size="small" onClick={() => setFetched(false)} sx={{ color: T.textSec }}>
                <RefreshIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>
 {/* Scrollable Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
 
        {/* Tab Switcher — Roles only */}
        {report.key === 'roles' && (
          <Box sx={{ display: 'flex', gap: 1, mb: 2.5 }}>
            {[{ value: 'summary', label: '📊 Role Summary' }, { value: 'details', label: '👥 User Assignments' }]
              .map((tab) => (
                <Button key={tab.value} size="small"
                  variant={activeSheet === tab.value ? 'contained' : 'outlined'}
                  onClick={() => { setActiveSheet(tab.value); setPage(0); }}
                  sx={{
                    textTransform: 'none', fontWeight: 600, fontSize: '0.78rem',
                    borderRadius: 2, borderColor: report.accentColor,
                    color: activeSheet === tab.value ? T.white : report.accentColor,
                    ...(activeSheet === tab.value && {
                      background: report.accentColor,
                      '&:hover': { background: report.accentColor },
                    }),
                  }}>
                  {tab.label}
                </Button>
              ))}
          </Box>
        )}
 
        {/* Filter Bar */}
        {filterConfig.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Button size="small"
                startIcon={<FilterListIcon sx={{ fontSize: 14 }} />}
                onClick={() => setShowFilters((p) => !p)}
                sx={{
                  textTransform: 'none', fontSize: '0.75rem',
                  color: activeFilters > 0 ? report.accentColor : T.textSec,
                  fontWeight: activeFilters > 0 ? 700 : 400,
                }}>
                Filters {activeFilters > 0 ? `(${activeFilters})` : ''}
              </Button>
              {activeFilters > 0 && (
                <Button size="small"
                  startIcon={<CloseIcon sx={{ fontSize: 12 }} />}
                  onClick={() => { setFilters({}); setPage(0); }}
                  sx={{ textTransform: 'none', fontSize: '0.72rem', color: T.textSec }}>
                  Clear
                </Button>
              )}
            </Box>
            <Collapse in={showFilters}>
              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 1 }}>
                {filterConfig.map((fc) => (
                  <FormControl key={fc.key} size="small" sx={{ minWidth: 160 }}>
                    <InputLabel sx={{ fontSize: '0.75rem' }}>{fc.label}</InputLabel>
                    <Select
                      value={filters[fc.key] || 'All'}
                      label={fc.label}
                      onChange={(e) => setFilters((prev) => ({ ...prev, [fc.key]: e.target.value }))}
                      sx={{ fontSize: '0.75rem' }}>
                      {fc.options.map((opt) => (
                        <MenuItem key={opt} value={opt} sx={{ fontSize: '0.75rem' }}>{opt}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ))}
              </Box>
            </Collapse>
          </Box>
        )}
 
        {/* Record Count */}
        <Typography sx={{ fontSize: '0.72rem', color: T.textSec, mb: 1.5 }}>
          {fetching ? 'Loading...' : `${filteredData.length} record${filteredData.length !== 1 ? 's' : ''}${activeFilters > 0 ? ' (filtered)' : ''}`}
        </Typography>
 
        {/* Table */}
        <TableContainer component={Paper} variant="outlined"
          sx={{ borderRadius: 2, border: `1px solid ${T.border}`, mb: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#F8F9FC' }}>
                <TableCell sx={{ fontSize: '0.72rem', fontWeight: 700, color: T.textSec, py: 1.2, pl: 2, width: 40 }}>#</TableCell>
                {columns.map((col) => (
                  <TableCell key={col.key} sx={{ fontSize: '0.72rem', fontWeight: 700, color: T.textSec, py: 1.2 }}>
                    {col.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {fetching ? (
                <SkeletonRows cols={columns.length + 1} rows={5} />
              ) : paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 1} align="center"
                    sx={{ py: 5, color: T.textSec, fontSize: '0.82rem' }}>
                    No data found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((row, idx) => (
                  <TableRow key={idx} sx={{
                    '&:nth-of-type(even)': { backgroundColor: '#FAFBFF' },
                    '&:hover': { backgroundColor: `${report.accentColor}08` },
                  }}>
                    <TableCell sx={{ fontSize: '0.72rem', color: T.textSec, py: 1.2, pl: 2 }}>
                      {page * rowsPerPage + idx + 1}
                    </TableCell>
                    {columns.map((col) => (
                      <TableCell key={col.key} sx={{ fontSize: '0.78rem', color: T.primary, py: 1.2 }}>
                        {col.isStatus ? <StatusBadge value={row[col.key]} />
                          : col.isBool ? <BoolBadge value={row[col.key]} />
                          : col.isCount ? (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Box sx={{ width: 30, height: 30, borderRadius: '50%',
                                backgroundColor: `${report.accentColor}15`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: report.accentColor }}>
                                  {row[col.key] || '0'}
                                </Typography>
                              </Box>
                            </Box>
                          ) : col.key === 'fullName' || col.key === 'roleName' ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar sx={{ width: 28, height: 28, fontSize: '0.65rem', fontWeight: 700,
                                backgroundColor: `${report.accentColor}20`, color: report.accentColor }}>
                                {String(row[col.key] || '?').charAt(0).toUpperCase()}
                              </Avatar>
                              <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: T.primary }}>
                                {row[col.key] || '—'}
                              </Typography>
                            </Box>
                          ) : (
                            <Typography sx={{ fontSize: '0.78rem', color: T.primary }}>
                              {row[col.key] || '—'}
                            </Typography>
                          )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
 
        <TablePagination
          component="div" count={filteredData.length} page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => { setRows(parseInt(e.target.value, 10)); setPage(0); }}
          rowsPerPageOptions={[5, 10, 25, 50]}
          sx={{ fontSize: '0.75rem', borderTop: `1px solid ${T.border}`,
            '& .MuiTablePagination-toolbar': { minHeight: 44 },
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': { fontSize: '0.75rem' } }} />
 
        <Divider sx={{ my: 2.5, borderColor: T.border }} />
 {/* Format + Download */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: T.primary }}>Format:</Typography>
            <ToggleButtonGroup value={format} exclusive onChange={(_, val) => val && setFormat(val)} size="small">
              {[
                { key: 'excel', label: '📊 Excel' },
                { key: 'csv',   label: '📄 CSV' },
                { key: 'pdf',   label: '🖨️ PDF' },
              ].map((f) => (
                <ToggleButton key={f.key} value={f.key}
                  sx={{ px: 2, fontSize: '0.72rem', fontWeight: 600, textTransform: 'none',
                    borderRadius: '8px !important', border: `1.5px solid ${T.border} !important`,
                    '&.Mui-selected': {
                      backgroundColor: f.key === 'pdf' ? '#E01950' : report.accentColor,
                      color: T.white,
                      borderColor: `${f.key === 'pdf' ? '#E01950' : report.accentColor} !important`,
                    },
                  }}>
                  {f.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>
          <Button variant="contained" disabled={dlLoading} onClick={handleDownload}
            startIcon={dlLoading ? <CircularProgress size={14} color="inherit" /> : <DownloadIcon sx={{ fontSize: 18 }} />}
            sx={{ background: report.accentColor, borderRadius: 2, textTransform: 'none',
              fontWeight: 700, fontSize: '0.82rem', px: 3, py: 1,
              '&:hover': { background: report.accentColor } }}>
            {dlLoading ? 'Downloading...' : `Download ${format === 'csv' ? 'CSV' : format === 'pdf' ? 'PDF' : 'Excel'}`}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};
 
// ── Main Page ─────────────────────────────────────────────────────────────────
const ReportPage = () => {
  const [activeReport, setActiveReport] = useState(REPORTS[0].key);
  const selected = REPORTS.find((r) => r.key === activeReport);
 
  return (
    <Box sx={{ bgcolor: T.bg, height: '100vh', display: 'flex', flexDirection: 'column', p: { xs: 2, md: 3 }, overflow: 'hidden' }}>
      <PageHeader
        title="Reports"
        subtitle="Generate and download system usage reports"
        breadcrumbs={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Reports' }]}
      />
 
      <Box sx={{
        display: 'flex',
        gap: 0,
        borderRadius: 3,
        overflow: 'hidden',
        boxShadow: '0 4px 24px rgba(39,35,92,0.10)',
        height: 'calc(100vh - 180px)', flex: 1,
      }}>
 
        {/* ── Sidebar ─────────────────────────────────────────────────────── */}
        <Box sx={{
          width: 240,
          flexShrink: 0,
          background: T.white,
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* Sidebar Header */}
          <Box sx={{ px: 2.5, py: 2.5, borderBottom: `1px solid ${T.border}` }}>
            <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: T.textSec,
              textTransform: 'uppercase', letterSpacing: '0.12em' }}>
              Report Types
            </Typography>
          </Box>
 
          {/* Nav Items */}
          <Box sx={{ flex: 1, py: 1.5 }}>
            {REPORTS.map((report) => {
              const isActive = activeReport === report.key;
              return (
                <Box
                  key={report.key}
                  onClick={() => setActiveReport(report.key)}
                  sx={{
                    mx: 1.5, mb: 0.5,
                    px: 1.5, py: 1.4,
                    borderRadius: 2,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    background: isActive ? T.sidebarActive : 'transparent',
                    transition: 'all 0.18s ease',
                    '&:hover': {
                      background: isActive ? T.sidebarActive : `${T.bg}`,
                    },
                    position: 'relative',
                  }}
                >
                  {/* Active indicator bar */}
                  {isActive && (
                    <Box sx={{
                      position: 'absolute', left: 0, top: '20%', bottom: '20%',
                      width: 3, borderRadius: '0 3px 3px 0',
                      backgroundColor: T.secondary,
                    }} />
                  )}
 
                  <Box sx={{
                    width: 34, height: 34, borderRadius: '10px', flexShrink: 0,
                    backgroundColor: isActive ? 'rgba(255,255,255,0.18)' : report.lightBg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background 0.18s',
                  }}>
                    <report.Icon sx={{ fontSize: 18, color: isActive ? '#fff' : report.accentColor }} />
                  </Box>
 
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{
                      fontSize: '0.82rem', fontWeight: isActive ? 700 : 500,
                      color: isActive ? '#fff' : T.primary,
                      lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {report.title}
                    </Typography>
                    <Typography sx={{
                      fontSize: '0.65rem',
                      color: isActive ? 'rgba(255,255,255,0.8)' : T.textSec,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {report.subtitle}
                    </Typography>
                  </Box>
 
                  <ChevronRightIcon sx={{
                    fontSize: 16,
                    color: isActive ? 'rgba(255,255,255,0.9)' : T.border,
                    transition: 'color 0.18s',
                  }} />
                </Box>
              );
            })}
          </Box>
 
          {/* Sidebar Footer */}
          <Box sx={{ px: 2.5, py: 2, borderTop: `1px solid ${T.border}` }}>
            <Typography sx={{ fontSize: '0.65rem', color: T.textSec, textAlign: 'center' }}>
              {REPORTS.length} report types available
            </Typography>
          </Box>
        </Box>
 
        {/* ── Main Content ─────────────────────────────────────────────────── */}
        <Box sx={{
          flex: 1,
          background: T.white,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          minWidth: 0,
          borderLeft: `1px solid ${T.border}`,
        }}>
          {selected && <ReportDetail key={selected.key} report={selected} />}
        </Box>
      </Box>
    </Box>
  );
};
 
export default ReportPage;
 
 
 
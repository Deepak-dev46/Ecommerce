import React, { useMemo, useRef, useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  Alert,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Stack,
  CircularProgress,
} from '@mui/material';
import {
  CloudUpload,
  Download,
  Close,
  CheckCircle,
  Error as ErrorIcon,
  InsertDriveFile,
} from '@mui/icons-material';
import { userApi } from '../../api/userApi';
import { orgApi } from '../../api/orgApi';
 
const CSV_TEMPLATE = `firstName,lastName,email,department,designation
John,Doe,john.doe@serviceeverz.com,ENGINEERING,SENIORDEV
Jane,Smith,jane.smith@serviceeverz.com,HR,MANAGER`;
 
const REQUIRED_HEADERS = [
  'firstName',
  'lastName',
  'email',
  'department',
  'designation',
];
 
const downloadTemplate = () => {
  const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'serviceeverz_users_template.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
 
const normalize = (value) => String(value ?? '').trim();
const normalizeUpper = (value) => normalize(value).toUpperCase();
 
const parseCsvLine = (line) => {
  const result = [];
  let current = '';
  let inQuotes = false;
 
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];
 
    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
 
  result.push(current);
  return result.map((v) => v.trim());
};
const parseCsvText = (text) => {
  const lines = text
    .split(/\r?\n/)   // ✅ FIXED
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (!lines.length) {
    return { headers: [], rows: [], fileErrors: ['CSV file is empty.'] };
  }

  const headers = parseCsvLine(lines[0]);

  const missingHeaders = REQUIRED_HEADERS.filter((h) => !headers.includes(h));

  if (missingHeaders.length > 0) {
    return {
      headers,
      rows: [],
      fileErrors: [`Missing required headers: ${missingHeaders.join(', ')}`],
    };
  }

  const rows = lines.slice(1).map((line, index) => {
    const values = parseCsvLine(line);
    const row = { rowNumber: index + 2 };

    headers.forEach((header, i) => {
      row[header] = values[i] ?? '';
    });

    return row;
  });

  return { headers, rows, fileErrors: [] };
};
 
// ✅ Now accepts dynamic dept/desig name sets from API
const validateCsvRows = (rows, validDepartmentNames, validDesignationNames) => {
  const issues = [];
  const seenEmails = new Set();
 
  rows.forEach((row) => {
    const rowErrors = [];
 
    const firstName   = normalize(row.firstName);
    const lastName    = normalize(row.lastName);
    const email       = normalize(row.email);
    const department  = normalizeUpper(row.department);
    const designation = normalizeUpper(row.designation);
 
    if (!firstName) rowErrors.push('firstName is missing');
    if (!lastName)  rowErrors.push('lastName is missing');
 
    if (!email) {
      rowErrors.push('email is missing');
    } else {
    const emailRegex = /.+@.+\..+/;
      if (!emailRegex.test(email)) {
        rowErrors.push('email is invalid');
      }
      const lowerEmail = email.toLowerCase();
      if (seenEmails.has(lowerEmail)) {
        rowErrors.push('duplicate email in CSV');
      } else {
        seenEmails.add(lowerEmail);
      }
    }
 
    if (!department) {
      rowErrors.push('department is missing');
    } else if (!validDepartmentNames.has(department)) {
      rowErrors.push(
        `invalid department: "${department}" (allowed: ${[...validDepartmentNames].join(', ')})`
      );
    }
 
    if (!designation) {
      rowErrors.push('designation is missing');
    } else if (!validDesignationNames.has(designation)) {
      rowErrors.push(
        `invalid designation: "${designation}" (allowed: ${[...validDesignationNames].join(', ')})`
      );
    }
 
    if (rowErrors.length > 0) {
      issues.push(`Row ${row.rowNumber}: ${rowErrors.join(', ')}`);
    }
  });
 
  return issues;
};
 
const BulkUploadDialog = ({ open, onClose, onSuccess }) => {
  const [file, setFile]                   = useState(null);
  const [dragging, setDragging]           = useState(false);
  const [uploading, setUploading]         = useState(false);
  const [result, setResult]               = useState(null);
  const [error, setError]                 = useState('');
  const [fileErrors, setFileErrors]       = useState([]);
  const [previewErrors, setPreviewErrors] = useState([]);
  const [parsedRowsCount, setParsedRowsCount] = useState(0);
  const [validRowsCount, setValidRowsCount]   = useState(0);
 
  // ✅ Dynamic dept/desig state from API
  const [departments, setDepartments]   = useState([]);
  const [designations, setDesignations] = useState([]);
  const [loadingMeta, setLoadingMeta]   = useState(false);
  const [metaError, setMetaError]       = useState('');
 
  const inputRef = useRef(null);
 
  // ✅ Fetch departments and designations when dialog opens
  useEffect(() => {
    if (!open) return;
    const fetchMeta = async () => {
      setLoadingMeta(true);
      setMetaError('');
      try {
        const [deptRes, desigRes] = await Promise.all([
          orgApi.getAllDepartments(),
          orgApi.getAllDesignations(),
        ]);
        setDepartments(deptRes.data || []);
        setDesignations(desigRes.data || []);
      } catch {
        setMetaError('Failed to load departments/designations. Please close and retry.');
      } finally {
        setLoadingMeta(false);
      }
    };
    fetchMeta();
  }, [open]);
 
  // ✅ Build Sets of valid names (UPPERCASED) for fast lookup during validation
  const validDepartmentNames = useMemo(
    () => new Set(departments.map((d) => normalizeUpper(d.name ?? d))),
    [departments]
  );
 
  const validDesignationNames = useMemo(
    () => new Set(designations.map((d) => normalizeUpper(d.name ?? d))),
    [designations]
  );
 
  const hasClientValidationErrors = useMemo(
    () => fileErrors.length > 0 || previewErrors.length > 0,
    [fileErrors, previewErrors]
  );
 
  const reset = () => {
    setFile(null);
    setDragging(false);
    setUploading(false);
    setResult(null);
    setError('');
    setFileErrors([]);
    setPreviewErrors([]);
    setParsedRowsCount(0);
    setValidRowsCount(0);
    if (inputRef.current) inputRef.current.value = '';
  };
 
  const handleClose = () => {
    if (!uploading) {
      reset();
      onClose?.();
    }
  };
 
  const validateSelectedFile = async (selectedFile) => {
    const text = await selectedFile.text();
    const parsed = parseCsvText(text);
 
    setFileErrors(parsed.fileErrors || []);
 
    if (parsed.fileErrors?.length) {
      setPreviewErrors([]);
      setParsedRowsCount(0);
      setValidRowsCount(0);
      return false;
    }
 
    // ✅ Pass dynamic sets instead of static arrays
    const issues = validateCsvRows(
      parsed.rows,
      validDepartmentNames,
      validDesignationNames
    );
 
    setPreviewErrors(issues);
    setParsedRowsCount(parsed.rows.length);
    setValidRowsCount(parsed.rows.length - issues.length);
 
    return issues.length === 0;
  };
 
  const handleFile = async (selectedFile) => {
    if (!selectedFile) return;
 
    setResult(null);
    setError('');
    setFileErrors([]);
    setPreviewErrors([]);
    setParsedRowsCount(0);
    setValidRowsCount(0);
 
    if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
      setError('Only CSV files are supported.');
      setFile(null);
      return;
    }
 
    // ✅ Block file selection until meta is loaded
    if (loadingMeta) {
      setError('Departments and designations are still loading. Please wait.');
      return;
    }
 
    if (metaError) {
      setError('Cannot validate — failed to load departments/designations.');
      return;
    }
 
    setFile(selectedFile);
 
    try {
      await validateSelectedFile(selectedFile);
    } catch {
      setError('Unable to read CSV file.');
      setFile(null);
    }
  };
 
  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  };
 
  const handleUpload = async () => {
    if (!file) return;
 
    if (hasClientValidationErrors) {
      setError('Please fix CSV validation errors before uploading.');
      return;
    }
 
    setUploading(true);
    setError('');
 
    try {
      const res = await userApi.uploadCSV(file);
      setResult(res.data);
      onSuccess?.(res.data);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Upload failed. Check your CSV format.'
      );
    } finally {
      setUploading(false);
    }
  };
 
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 36, height: 36, borderRadius: 2,
                background: 'linear-gradient(135deg, #27235C, #97247E)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <CloudUpload sx={{ color: '#fff', fontSize: 18 }} />
            </Box>
            <Box>
              <Typography fontWeight={700} fontSize="0.95rem">Bulk user upload</Typography>
              <Typography fontSize="0.75rem" color="text.secondary">
                Upload a CSV to create multiple users with row validation
              </Typography>
            </Box>
          </Box>
          <Button size="small" onClick={handleClose} disabled={uploading}
            sx={{ minWidth: 'auto', p: 0.5, color: '#6B7280' }}>
            <Close fontSize="small" />
          </Button>
        </Box>
      </DialogTitle>
 
      <Divider />
 
      <DialogContent sx={{ pt: 2.5 }}>
 
        {/* ✅ Meta loading indicator */}
        {loadingMeta && (
          <Alert severity="info" icon={<CircularProgress size={16} />} sx={{ mb: 2, borderRadius: 2 }}>
            Loading departments and designations for validation…
          </Alert>
        )}
 
        {metaError && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{metaError}</Alert>
        )}
 
       {/* ✅ Show valid dept/desig names as hints when loaded */}
        {/* {!loadingMeta && !metaError && departments.length > 0 && (
          <Box sx={{ mb: 2, p: 1.5, bgcolor: '#F8F8FC', borderRadius: 2, border: '1px solid #E5E7EB' }}>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#27235C', mb: 0.8 }}>
              Valid values (from system)
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
              <Typography sx={{ fontSize: '0.7rem', color: '#6B7280', mr: 0.5 }}>Departments:</Typography>
              {[...validDepartmentNames].map((d) => (
                <Chip key={d} label={d} size="small"  
                  sx={{ height: 18, fontSize: '0.65rem', bgcolor: '#EEF0FF', color: '#27235C' }} />
              ))}
            </Box>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Typography sx={{ fontSize: '0.7rem', color: '#6B7280', mr: 0.5 }}>Designations:</Typography>
              {[...validDesignationNames].map((d) => (
                <Chip key={d} label={d} size="small"
                  sx={{ height: 18, fontSize: '0.65rem', bgcolor: '#F3F4F6', color: '#374151' }} />
              ))}
            </Box>
          </Box>
        )} */}
 
        <Box
          sx={{
            p: 2, backgroundColor: '#F8F8FC', borderRadius: 2,
            border: '1px solid #E5E7EB', mb: 2,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: 2, flexWrap: 'wrap',
          }}
        >
          <Box>
            <Typography sx={{ fontSize: '0.825rem', fontWeight: 600, color: '#1B193F' }}>
              Step 1 — Download template
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#6B7280' }}>
              CSV columns: firstName, lastName, email, department, designation
            </Typography>
          </Box>
          <Button variant="outlined" size="small" startIcon={<Download />} onClick={downloadTemplate}
            sx={{ flexShrink: 0 }}>
            Template
          </Button>
        </Box>
 
        <Typography sx={{ fontSize: '0.825rem', fontWeight: 600, color: '#1B193F', mb: 1.5 }}>
          Step 2 — Upload filled CSV
        </Typography>
 
        {error && (
          <Alert severity="error" sx={{ mb: 1.5, borderRadius: 2 }}>{error}</Alert>
        )}
 
        {!result ? (
          <>
            <Box
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => !loadingMeta && inputRef.current?.click()}
              sx={{
                border: `2px dashed ${dragging ? '#27235C' : file ? '#24A148' : '#D1D5DB'}`,
                borderRadius: 3, p: 4,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
                cursor: loadingMeta ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                backgroundColor: dragging ? '#F0F0FA' : file ? '#F0FDF4' : '#FAFAFA',
                opacity: loadingMeta ? 0.6 : 1,
                '&:hover': !loadingMeta
                  ? { borderColor: '#27235C', backgroundColor: '#F0F0FA' }
                  : {},
              }}
            >
              {file ? (
                <>
                  <InsertDriveFile sx={{ fontSize: 40, color: '#24A148' }} />
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#24A148' }}>
                    {file.name}
                  </Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: '#6B7280' }}>
                    {(file.size / 1024).toFixed(1)} KB · Click to change
                  </Typography>
                </>
              ) : (
                <>
                  <CloudUpload sx={{ fontSize: 40, color: '#9CA3AF' }} />
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>
                    {loadingMeta ? 'Loading validation data…' : 'Drop CSV here or click to browse'}
                  </Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: '#9CA3AF' }}>Supports .csv only</Typography>
                </>
              )}
            </Box>
 
            <input
              ref={inputRef}
              type="file"
              accept=".csv"
              style={{ display: 'none' }}
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
 
            {uploading && <LinearProgress sx={{ mt: 1.5, borderRadius: 2 }} />}
 
            {file && (
              <Box sx={{ mt: 2 }}>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1.5 }}>
                  <Chip size="small" label={`Rows found: ${parsedRowsCount}`} sx={{ fontWeight: 600 }} />
                  <Chip size="small" color="success" label={`Valid rows: ${validRowsCount}`} sx={{ fontWeight: 600 }} />
                  <Chip size="small"
                    color={hasClientValidationErrors ? 'error' : 'default'}
                    label={`Invalid rows: ${previewErrors.length}`}
                    sx={{ fontWeight: 600 }}
                  />
                </Stack>
 
                {fileErrors.length > 0 && (
                  <Alert severity="error" sx={{ mb: 1.5, borderRadius: 2 }}>
                    {fileErrors.join(', ')}
                  </Alert>
                )}
 
                {previewErrors.length > 0 ? (
                  <Box sx={{ border: '1px solid #F3D3DA', borderRadius: 2, overflow: 'hidden' }}>
                    <Box sx={{ px: 2, py: 1.25, bgcolor: '#FFF5F7' }}>
                      <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#E01950' }}>
                        Validation report
                      </Typography>
                      <Typography sx={{ fontSize: '0.75rem', color: '#B42346' }}>
                        Fix these rows before upload.
                      </Typography>
                    </Box>
                    <List dense sx={{ maxHeight: 240, overflow: 'auto' }}>
                      {previewErrors.map((msg, i) => (
                        <ListItem key={i} sx={{ py: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 28 }}>
                            <ErrorIcon sx={{ fontSize: 16, color: '#E01950' }} />
                          </ListItemIcon>
                          <ListItemText
                            primary={msg}
                            primaryTypographyProps={{ fontSize: '0.78rem', color: '#E01950' }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                ) : file && parsedRowsCount > 0 ? (
                  <Alert severity="success" sx={{ borderRadius: 2 }}>
                    CSV validation passed. You can upload now.
                  </Alert>
                ) : null}
              </Box>
            )}
          </>
        ) : (
          <Box sx={{ border: '1px solid #E5E7EB', borderRadius: 2, overflow: 'hidden' }}>
            <Box sx={{ px: 2.5, py: 2, backgroundColor: '#F0FDF4', display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: '#24A148' }}>
                  {result.successCount ?? 0}
                </Typography>
                <Typography sx={{ fontSize: '0.7rem', color: '#24A148' }}>Created</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: '#6B7280' }}>
                  {result.totalRows ?? 0}
                </Typography>
                <Typography sx={{ fontSize: '0.7rem', color: '#6B7280' }}>Total</Typography>
              </Box>
              {(result.failedCount ?? 0) > 0 && (
                <Box sx={{ textAlign: 'center' }}>
                  <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: '#E01950' }}>
                    {result.failedCount}
                  </Typography>
                  <Typography sx={{ fontSize: '0.7rem', color: '#E01950' }}>Failed</Typography>
                </Box>
              )}
            </Box>
 
            {result.createdUsers?.length > 0 && (
              <Box sx={{ px: 2, py: 1.5, borderTop: '1px solid #E5E7EB' }}>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#1B193F', mb: 1 }}>
                  Successfully created users
                </Typography>
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                  {result.createdUsers.map((user) => (
                    <Chip
                      key={user.id || user.email}
                      icon={<CheckCircle sx={{ fontSize: 16 }} />}
                      label={`${user.firstName} ${user.lastName} (${user.email})`}
                      color="success" variant="outlined" size="small"
                    />
                  ))}
                </Stack>
              </Box>
            )}
 
            {result.failedRows?.length > 0 && (
              <Box sx={{ borderTop: '1px solid #E5E7EB' }}>
                <Box sx={{ px: 2, py: 1.25, bgcolor: '#FFF5F7' }}>
                  <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#E01950' }}>
                    Failed rows report
                  </Typography>
                </Box>
                <List dense sx={{ maxHeight: 220, overflow: 'auto' }}>
                  {result.failedRows.map((msg, i) => (
                    <ListItem key={i} sx={{ py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 28 }}>
                        <ErrorIcon sx={{ fontSize: 16, color: '#E01950' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={msg}
                        primaryTypographyProps={{ fontSize: '0.78rem', color: '#E01950' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
 
      <Divider />
 
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button variant="outlined" onClick={handleClose} disabled={uploading}>
          {result ? 'Close' : 'Cancel'}
        </Button>
 
        {!result && (
          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={!file || uploading || hasClientValidationErrors || loadingMeta}
            sx={{
              '&.Mui-disabled': { backgroundColor: '#d1d5db41', color: '#efefef' },
              '&.Mui-disabled:hover': { backgroundColor: '#D1D5DB' },
            }}
          >
            {uploading ? 'Uploading...' : 'Upload & create users'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
 
export default BulkUploadDialog;
 
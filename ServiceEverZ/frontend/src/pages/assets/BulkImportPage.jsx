import React, { useState, useRef } from 'react';
import {
  Box, Typography, Button, Paper, CircularProgress,
  List, ListItem, ListItemText, Chip, LinearProgress,
  FormControl, Select, MenuItem, Divider,
} from '@mui/material';
import ArrowBackIcon   from '@mui/icons-material/ArrowBack';
import UploadFileIcon  from '@mui/icons-material/UploadFile';
import DownloadIcon    from '@mui/icons-material/Download';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon       from '@mui/icons-material/Error';
import { useNavigate } from 'react-router-dom';
import { useAuth }     from '../../context/AuthContext';
import { bulkImportAssets, downloadBulkImportTemplate } from '../../api/assetApi';
import toast from '../../utils/toast';

const BRAND  = '#27235C';
const ACCENT = '#97247E';
const BORDER = '#E8E8F0';
const FONT   = "'Roboto', sans-serif";

const CATEGORIES = [
  'LAPTOP','DESKTOP','MONITOR','PRINTER','PROJECTOR',
  'SERVER','NETWORK_DEVICE','MOBILE','TABLET','PERIPHERAL','OTHER',
];

export default function BulkImportPage() {
  const navigate        = useNavigate();
  const fileRef         = useRef();
  const { user }        = useAuth();

  // SP ID from session — never displayed to user, only sent in the API call
  const spId            = user?.userId ?? null;

  const [file,             setFile]             = useState(null);
  const [loading,          setLoading]          = useState(false);
  const [result,           setResult]           = useState(null);
  const [templateCategory, setTemplateCategory] = useState('LAPTOP');
  const [templateLoading,  setTemplateLoading]  = useState(false);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f && (f.name.endsWith('.csv') || f.name.endsWith('.xlsx'))) {
      setFile(f);
    } else {
      toast.error('Only CSV and XLSX files are supported');
    }
  };

  const handleImport = async () => {
    if (!spId)  { toast.error('User session not found — please log in again'); return; }
    if (!file)  { toast.error('Please select a file'); return; }
    setLoading(true);
    try {
      const r = await bulkImportAssets(file, Number(spId));
      setResult(r.data.data);
      toast.success(`✅ Import complete! ${r.data.data?.successCount || 0} assets imported.`);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Import failed');
    } finally { setLoading(false); }
  };

  const handleDownloadTemplate = async () => {
    setTemplateLoading(true);
    try {
      const res  = await downloadBulkImportTemplate(templateCategory);
      const url  = URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href  = url;
      link.setAttribute('download', `asset-import-template-${templateCategory.toLowerCase()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success(`Template for ${templateCategory.replace(/_/g, ' ')} downloaded`);
    } catch {
      toast.error('Failed to download template');
    } finally { setTemplateLoading(false); }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 680, mx: 'auto', fontFamily: FONT }}>

      {/* ── Header ── */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/support/asset-service')}
          sx={{
            color: BRAND, textTransform: 'none', fontFamily: FONT, fontWeight: 500,
            border: `1px solid ${BORDER}`, borderRadius: '10px', px: 2,
            '&:hover': { backgroundColor: `${BRAND}08`, borderColor: BRAND },
          }}
        >
          Back
        </Button>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, fontFamily: FONT }}>Bulk Import Assets</Typography>
          <Typography sx={{ fontSize: '0.82rem', color: '#666', fontFamily: FONT }}>
            Upload a CSV or XLSX file to import multiple assets at once
          </Typography>
        </Box>
      </Box>

      {/* ── Single Card ── */}
      <Paper sx={{
        borderRadius: '16px',
        border: `1px solid ${BORDER}`,
        boxShadow: '0 2px 12px rgba(39,35,92,0.06)',
        overflow: 'hidden',
      }}>

        {/* Template Download Section */}
        <Box sx={{
          px: 3, py: 2,
          background: `linear-gradient(135deg, ${BRAND}08, ${BRAND}04)`,
          borderBottom: `1px solid ${BORDER}`,
        }}>
          <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: '0.88rem', color: BRAND, mb: 0.5 }}>
            📥 Download Import Template
          </Typography>
          <Typography sx={{ fontFamily: FONT, fontSize: '0.78rem', color: '#666', mb: 2 }}>
            Select a category to download a pre-filled Excel template with the correct columns.
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <Select
                value={templateCategory}
                onChange={e => setTemplateCategory(e.target.value)}
                sx={{
                  fontFamily: FONT, fontSize: '0.875rem', borderRadius: '8px',
                  backgroundColor: '#fff',
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: BRAND },
                }}
              >
                {CATEGORIES.map(c => (
                  <MenuItem key={c} value={c} sx={{ fontFamily: FONT, fontSize: '0.875rem' }}>
                    {c.replace(/_/g, ' ')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              startIcon={templateLoading ? <CircularProgress size={16} /> : <DownloadIcon />}
              onClick={handleDownloadTemplate}
              disabled={templateLoading}
              sx={{
                fontFamily: FONT, textTransform: 'none', fontWeight: 600,
                borderColor: BRAND, color: BRAND, borderRadius: '8px',
                '&:hover': { backgroundColor: `${BRAND}08` },
              }}
            >
              {templateLoading ? 'Downloading…' : 'Download Template'}
            </Button>
          </Box>
        </Box>

        <Box sx={{ p: 3 }}>
          {!result ? (
            <>
              {/* Upload zone */}
              <Box
                onClick={() => fileRef.current.click()}
                sx={{
                  border: `2px dashed ${file ? BRAND : BORDER}`,
                  borderRadius: '12px', p: 4,
                  textAlign: 'center', cursor: 'pointer', mb: 3,
                  backgroundColor: file ? `${BRAND}06` : '#FAFAFA',
                  transition: 'all 0.2s',
                  '&:hover': { borderColor: BRAND, backgroundColor: `${BRAND}06` },
                }}
              >
                <UploadFileIcon sx={{ fontSize: 40, color: file ? BRAND : '#999', mb: 1 }} />
                <Typography sx={{ fontWeight: 600, color: file ? BRAND : '#666', fontFamily: FONT, fontSize: '0.9rem' }}>
                  {file ? file.name : 'Click to upload CSV or XLSX'}
                </Typography>
                {file ? (
                  <Typography sx={{ fontSize: '0.78rem', color: '#888', mt: 0.5, fontFamily: FONT }}>
                    {(file.size / 1024).toFixed(1)} KB · Ready to import
                  </Typography>
                ) : (
                  <Typography sx={{ fontSize: '0.75rem', color: '#AAA', mt: 0.5, fontFamily: FONT }}>
                    Supports .csv and .xlsx files
                  </Typography>
                )}
                <input ref={fileRef} type="file" accept=".csv,.xlsx" onChange={handleFileChange} style={{ display: 'none' }} />
              </Box>

              {loading && <LinearProgress sx={{ mb: 2, borderRadius: 4, backgroundColor: `${BRAND}22`, '& .MuiLinearProgress-bar': { backgroundColor: BRAND } }} />}

              <Button
                variant="contained" fullWidth
                startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <UploadFileIcon />}
                onClick={handleImport}
                disabled={loading || !file || !spId}
                sx={{
                  backgroundColor: BRAND, py: 1.2, fontFamily: FONT,
                  textTransform: 'none', fontWeight: 700, borderRadius: '10px',
                  '&:hover': { backgroundColor: '#1B193F' },
                  '&:disabled': { backgroundColor: '#CCC' },
                }}
              >
                {loading ? 'Importing…' : 'Import Assets'}
              </Button>
            </>
          ) : (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <CheckCircleIcon sx={{ color: '#2e7d32', fontSize: 28 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: FONT }}>Import Complete</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <Chip
                  label={`✅ ${result.successCount} Imported`}
                  sx={{ backgroundColor: '#e8f5e9', color: '#2e7d32', fontWeight: 700, fontFamily: FONT }}
                />
                {result.failureCount > 0 && (
                  <Chip
                    label={`❌ ${result.failureCount} Failed`}
                    sx={{ backgroundColor: '#fdecea', color: '#c62828', fontWeight: 700, fontFamily: FONT }}
                  />
                )}
              </Box>
              {result.errors?.length > 0 && (
                <List dense>
                  {result.errors.map((err, i) => (
                    <ListItem key={i} sx={{ py: 0.5 }}>
                      <ErrorIcon sx={{ color: '#c62828', mr: 1, fontSize: 18 }} />
                      <ListItemText primary={err} primaryTypographyProps={{ fontSize: '0.82rem', color: '#c62828', fontFamily: FONT }} />
                    </ListItem>
                  ))}
                </List>
              )}
              <Box sx={{ display: 'flex', gap: 1.5, mt: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained" onClick={() => navigate('/support/asset-service')}
                  sx={{ backgroundColor: BRAND, fontFamily: FONT, textTransform: 'none', fontWeight: 600, borderRadius: '10px', '&:hover': { backgroundColor: '#1B193F' } }}
                >
                  Go to Asset List
                </Button>
                <Button
                  variant="outlined" onClick={() => { setResult(null); setFile(null); }}
                  sx={{ borderColor: BRAND, color: BRAND, fontFamily: FONT, textTransform: 'none', fontWeight: 600, borderRadius: '10px' }}
                >
                  Import More
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Paper>
    </Box>
  );
}

import React, { useState, useRef } from 'react';
import {
  Box, Typography, Button, Paper, CircularProgress,
  TextField, List, ListItem, ListItemText, Chip, LinearProgress,
} from '@mui/material';
import ArrowBackIcon    from '@mui/icons-material/ArrowBack';
import UploadFileIcon   from '@mui/icons-material/UploadFile';
import CheckCircleIcon  from '@mui/icons-material/CheckCircle';
import ErrorIcon        from '@mui/icons-material/Error';
import { useNavigate }  from 'react-router-dom';
import { bulkImportAssets } from '../../api/assetApi';
import toast from '../../utils/toast';

const DEFAULT_SP_ID = '1';

export default function BulkImportPage() {
  const navigate   = useNavigate();
  const fileRef    = useRef();
  const [file, setFile]       = useState(null);
  const [spId, setSpId]       = useState(DEFAULT_SP_ID);
  const [spIdError, setSpIdError] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f && (f.name.endsWith('.csv') || f.name.endsWith('.xlsx'))) {
      setFile(f);
    } else {
      toast.error('Only CSV and XLSX files are supported');
    }
  };

  const validateSpId = (val) => {
    const v = val?.toString().trim();
    if (!v) return 'SP ID is required';
    if (!/^[A-Za-z0-9\-]+$/.test(v)) return 'SP ID must be alphanumeric';
    return '';
  };

  const handleSpIdChange = (e) => {
    const val = e.target.value.replace(/[^A-Za-z0-9\-]/g, '');
    setSpId(val);
    setSpIdError(validateSpId(val));
  };

  const handleImport = async () => {
    const spErr = validateSpId(spId);
    if (spErr) { setSpIdError(spErr); toast.error(spErr); return; }
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

  return (
    <Box sx={{ p: 3, maxWidth: '100%', mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/support/asset-service')} sx={{ color: '#27235C' }}>Back</Button>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Bulk Import Assets</Typography>
          <Typography sx={{ fontSize: '0.82rem', color: '#666' }}>Upload a CSV or XLSX file to import multiple assets at once</Typography>
        </Box>
      </Box>

      {!result ? (
        <Paper sx={{ p: 3, borderRadius: '12px' }}>
          <Box
            onClick={() => fileRef.current.click()}
            sx={{
              border: '2px dashed #D0CEED', borderRadius: '12px', p: 4,
              textAlign: 'center', cursor: 'pointer', mb: 3,
              backgroundColor: file ? '#F0EFFA' : '#FAFAFA',
              transition: 'all 0.2s',
              '&:hover': { borderColor: '#27235C', backgroundColor: '#F0EFFA' },
            }}
          >
            <UploadFileIcon sx={{ fontSize: 40, color: file ? '#27235C' : '#999', mb: 1 }} />
            <Typography sx={{ fontWeight: 600, color: file ? '#27235C' : '#666' }}>
              {file ? file.name : 'Click to upload CSV or XLSX'}
            </Typography>
            {file && <Typography sx={{ fontSize: '0.78rem', color: '#888', mt: 0.5 }}>
              {(file.size / 1024).toFixed(1)} KB
            </Typography>}
            <input ref={fileRef} type="file" accept=".csv,.xlsx" onChange={handleFileChange} style={{ display: 'none' }} />
          </Box>

          
          {loading && <LinearProgress sx={{ mb: 2, borderRadius: 4 }} />}

          <Button
            variant="contained" fullWidth startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <UploadFileIcon />}
            onClick={handleImport} disabled={loading}
            sx={{ backgroundColor: '#27235C', '&:hover': { backgroundColor: '#1B193F' }, py: 1.2 }}
          >
            {loading ? 'Importing...' : 'Import Assets'}
          </Button>
        </Paper>
      ) : (
        <Paper sx={{ p: 3, borderRadius: '12px' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <CheckCircleIcon sx={{ color: '#2e7d32', fontSize: 28 }} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Import Complete</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Chip label={`✅ ${result.successCount} Imported`} sx={{ backgroundColor: '#e8f5e9', color: '#2e7d32', fontWeight: 700 }} />
            {result.failureCount > 0 && <Chip label={`❌ ${result.failureCount} Failed`} sx={{ backgroundColor: '#fdecea', color: '#c62828', fontWeight: 700 }} />}
          </Box>
          {result.errors?.length > 0 && (
            <List dense>
              {result.errors.map((err, i) => (
                <ListItem key={i} sx={{ py: 0.5 }}>
                  <ErrorIcon sx={{ color: '#c62828', mr: 1, fontSize: 18 }} />
                  <ListItemText primary={err} primaryTypographyProps={{ fontSize: '0.82rem', color: '#c62828' }} />
                </ListItem>
              ))}
            </List>
          )}
          <Button variant="contained" onClick={() => navigate('/support/asset-service')}
            sx={{ mt: 2, backgroundColor: '#27235C', '&:hover': { backgroundColor: '#1B193F' } }}>
            Go to Asset List
          </Button>
        </Paper>
      )}
    </Box>
  );
}

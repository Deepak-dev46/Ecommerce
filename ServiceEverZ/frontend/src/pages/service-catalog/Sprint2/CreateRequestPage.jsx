import React, { useEffect, useState } from 'react';
import {
  Box, Typography, TextField, MenuItem, Button, Paper, Stack, Chip
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from '../../../utils/toast';

import { getItemsBySubcategory, submitServiceRequest } from '../../../api/serviceCatalogApi';

const BRAND  = '#27235C';
const ACCENT = '#97247E';

export default function CreateRequestPage() {
  const { state } = useLocation();
  const navigate  = useNavigate();
  const { serviceType, category, subcategory } = state || {};

  const [items,        setItems]        = useState([]);
  const [selectedItem, setSelectedItem] = useState('');
  const [itemData,     setItemData]     = useState(null);   // full item object
  const [accessDate,   setAccessDate]   = useState('');
  const [notes,        setNotes]        = useState('');
  const [touched,      setTouched]      = useState(false);
  const [submitting,   setSubmitting]   = useState(false);

  const itemError       = touched && !selectedItem ? 'Please select a service item to continue' : '';
  const accessDateError = touched && itemData?.accessDateRequired && !accessDate
    ? 'Access date is required for this item'
    : '';

  useEffect(() => {
    if (!subcategory) navigate('/catalog');
  }, [subcategory, navigate]);

  useEffect(() => {
    if (!subcategory) return;
    getItemsBySubcategory(subcategory.id)
      .then(({ data }) => setItems(data))
      .catch(() => toast.error('Failed to load items'));
  }, [subcategory]);

  /* when the user picks a different item, update itemData and reset accessDate */
  const handleItemChange = (e) => {
    const id   = e.target.value;
    const item = items.find(i => i.id === Number(id) || i.id === id) ?? null;
    setSelectedItem(id);
    setItemData(item);
    setAccessDate('');
    setTouched(true);
  };

  const handleSubmit = async () => {
    setTouched(true);
    if (!selectedItem) return;
    if (itemData?.accessDateRequired && !accessDate) return;

    setSubmitting(true);
    try {
      await submitServiceRequest(selectedItem, {
        requestedBy: 1,           // replace with auth user id
        notes,
        ...(itemData?.accessDateRequired ? { accessDate } : {}),
      });
      toast.success('Request submitted successfully');
      navigate('/catalog');
    } catch {
      toast.error('Failed to submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 640, mx: 'auto' }}>
      <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: BRAND }}>
            Create Service Request
          </Typography>
          <Typography sx={{ fontSize: '0.78rem', color: '#9CA3AF', mt: 0.3 }}>
            Fill in the details below and submit your request
          </Typography>
        </Box>

        <Stack spacing={2.5}>
          {/* Read-only context fields */}
          <TextField label="Service Type" value={serviceType?.name || ''} disabled fullWidth size="small" />
          <TextField label="Category"     value={category?.name    || ''} disabled fullWidth size="small" />
          <TextField label="Subcategory"  value={subcategory?.name || ''} disabled fullWidth size="small" />

          {/* Service Item picker */}
          <TextField
            select
            label="Service Item *"
            value={selectedItem}
            onChange={handleItemChange}
            onBlur={() => setTouched(true)}
            fullWidth
            size="small"
            error={!!itemError}
            helperText={itemError || (selectedItem ? '✓ Item selected' : 'Please select a service item')}
            FormHelperTextProps={{
              sx: { fontSize: '0.76rem', color: itemError ? '#E01950' : selectedItem ? '#24A148' : '#9CA3AF' }
            }}
            sx={{
              '& .MuiOutlinedInput-root fieldset': {
                borderColor: itemError ? '#E01950' : selectedItem ? '#24A148' : undefined,
              },
            }}
          >
            <MenuItem value="" disabled><em>— Select a service item —</em></MenuItem>
            {items.map(item => (
              <MenuItem key={item.id} value={item.id}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {item.name}
                  {item.accessDateRequired && (
                    <Chip
                      label="Access Date"
                      size="small"
                      sx={{ height: 18, fontSize: '0.6rem', fontWeight: 700,
                            bgcolor: '#EDE9FE', color: '#6D28D9', border: '1px solid #C4B5FD' }}
                    />
                  )}
                </Box>
              </MenuItem>
            ))}
          </TextField>

          {/* ── Access Date field — shown only when the item requires it ── */}
          {itemData?.accessDateRequired && (
            <Box sx={{
              p: 2, borderRadius: '10px',
              border: `1.5px solid ${accessDateError ? '#E01950' : '#C4B5FD'}`,
              bgcolor: '#F5F3FF',
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <Chip
                  label="Access Date Required"
                  size="small"
                  sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700,
                        bgcolor: '#EDE9FE', color: '#6D28D9', border: '1px solid #C4B5FD' }}
                />
              </Box>
              <Typography sx={{ fontSize: '0.78rem', color: '#4B5563', mb: 1.5 }}>
                This service item requires an access start date. Please specify when you need access to begin.
              </Typography>
              <TextField
                label="Access Start Date *"
                type="date"
                value={accessDate}
                onChange={e => setAccessDate(e.target.value)}
                onBlur={() => setTouched(true)}
                fullWidth
                size="small"
                error={!!accessDateError}
                helperText={accessDateError || (accessDate ? '✓ Date selected' : 'Select your access start date')}
                inputProps={{ min: new Date().toISOString().split('T')[0] }}
                InputLabelProps={{ shrink: true }}
                FormHelperTextProps={{
                  sx: { fontSize: '0.76rem', color: accessDateError ? '#E01950' : accessDate ? '#24A148' : '#9CA3AF' }
                }}
                sx={{
                  bgcolor: '#fff', borderRadius: '8px',
                  '& .MuiOutlinedInput-root fieldset': {
                    borderColor: accessDateError ? '#E01950' : accessDate ? '#24A148' : '#C4B5FD',
                  },
                }}
              />
            </Box>
          )}

          {/* Notes */}
          <TextField
            label="Notes (optional)"
            multiline
            rows={3}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            fullWidth
            size="small"
            placeholder="Add any additional details or context for your request…"
          />

          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting}
            sx={{
              mt: 1,
              background: BRAND,
              '&:hover': { background: ACCENT },
              borderRadius: '9px',
              fontWeight: 600,
              textTransform: 'none',
              py: 1.1,
            }}
          >
            {submitting ? 'Submitting…' : 'Submit Request'}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}

import React from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Typography, Button, CircularProgress, Box
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditNoteIcon from '@mui/icons-material/EditNote';
 
export default function DraftNavigationModal({ open, saving, onSaveDraft, onDiscard, onStay }) {
    return (
        <Dialog
            open={open}
            onClose={onStay}
            maxWidth="xs"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: '10px',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
                }
            }}
        >
            <DialogTitle sx={{ pb: 0, pt: 2.5, px: 3 }}>
                <Box display="flex" alignItems="center" gap={1}>
                    <EditNoteIcon sx={{ color: '#27235C', fontSize: 22 }} />
                    <Typography fontWeight={700} fontSize={15} color="#1e1b4b">
                        You have unsaved changes
                    </Typography>
                </Box>
            </DialogTitle>
 
            <DialogContent sx={{ px: 3, pt: 1.5, pb: 1 }}>
                <Typography fontSize={13} color="text.secondary" lineHeight={1.6}>
                    Your ticket form has unsaved data. Would you like to save it as a draft
                    so you can continue later, or discard the changes?
                </Typography>
            </DialogContent>
 
            <DialogActions sx={{ px: 3, pb: 2.5, pt: 1, gap: 1, justifyContent: 'flex-end' }}>
                {/* Stay — lowest priority, leftmost */}
                <Button
                    variant="text"
                    size="small"
                    onClick={onStay}
                    disabled={saving}
                    sx={{
                        color: '#6b7280',
                        fontSize: 12,
                        fontWeight: 600,
                        textTransform: 'none',
                        minWidth: 60,
                        '&:hover': { background: '#f3f4f6' }
                    }}
                >
                    Stay
                </Button>
 
                {/* Discard */}
                <Button
                    variant="outlined"
                    size="small"
                    startIcon={<DeleteOutlineIcon fontSize="small" />}
                    onClick={onDiscard}
                    disabled={saving}
                    sx={{
                        fontSize: 12,
                        fontWeight: 600,
                        textTransform: 'none',
                        borderColor: '#dc2626',
                        color: '#dc2626',
                        '&:hover': { borderColor: '#b91c1c', background: '#fff5f5' }
                    }}
                >
                    Discard
                </Button>
 
                {/* Save as Draft — primary CTA */}
                <Button
                    variant="contained"
                    size="small"
                    startIcon={saving ? <CircularProgress size={13} sx={{ color: '#fff' }} /> : <SaveIcon fontSize="small" />}
                    onClick={onSaveDraft}
                    disabled={saving}
                    sx={{
                        fontSize: 12,
                        fontWeight: 600,
                        textTransform: 'none',
                        background: '#27235C',
                        '&:hover': { background: '#1e1b4b' },
                        '&:disabled': { background: '#a5a3c8', color: '#fff' }
                    }}
                >
                    {saving ? 'Saving…' : 'Save as Draft'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
 
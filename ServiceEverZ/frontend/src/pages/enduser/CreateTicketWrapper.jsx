/**
 * CreateTicketWrapper.jsx
 *
 * US-149 additions:
 *   • On mount, checks localStorage for an auto-saved draft.
 *   • If found, shows a banner asking "Restore your previous session?" 
 *     so the user can pick up where they left off after a browser crash/refresh.
 *   • If the user says No, clears storage and shows the catalog normally.
 */
 
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Snackbar, Alert, Box, Button as MuiButton, Typography } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import OurServiceCatalogPage from './OurServiceCatalogPage';
import OurCreateTicketPage from './OurCreateTicketPage';
import { readDraftFromStorage, clearDraftFromStorage } from '../../components/hooks/useDraftGuard';
import RestoreIcon from '@mui/icons-material/Restore';
 
export default function CreateTicketWrapper({ redirectTo = '/user/tickets', isDraftEdit = false }) {
    const { user }  = useAuth();
    const navigate  = useNavigate();
    const { state } = useLocation();
 
    // If editing an existing DB draft, state carries { draftTicket, category, subcategory }
    const draftTicket  = state?.draftTicket  || null;
    const draftCat     = state?.category     || null;
    const draftSubcat  = state?.subcategory  || null;
 
    // selected = { category, subCategory } — null means show catalog
    const [selected, setSelected] = useState(
        draftTicket && draftCat && draftSubcat
            ? { category: draftCat, subCategory: draftSubcat }
            : null
    );
 
    const [snack, setSnack] = useState({ open: false, msg: '', sev: 'success' });
 
    // ── US-149: localStorage restore ────────────────────────────────────────
    // storedDraft = { form, customItemDesc, category, subcategory, savedAt } | null
    const [storedDraft, setStoredDraft] = useState(null);
    const [restoreBannerOpen, setRestoreBannerOpen] = useState(false);
    const [restoredForm, setRestoredForm] = useState(null);
 
    useEffect(() => {
        // Only check if we're NOT already editing a DB draft
        if (draftTicket) return;
        const saved = readDraftFromStorage();
        if (saved?.category && saved?.subcategory) {
            setStoredDraft(saved);
            setRestoreBannerOpen(true);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
 
    const handleRestoreYes = () => {
        setRestoreBannerOpen(false);
        // Pre-select catalog so the form opens immediately
        setSelected({ category: storedDraft.category, subCategory: storedDraft.subcategory });
        setRestoredForm(storedDraft.form);      // passed into OurCreateTicketPage via prop
    };
 
    const handleRestoreNo = () => {
        setRestoreBannerOpen(false);
        clearDraftFromStorage();
        setStoredDraft(null);
    };
    // ────────────────────────────────────────────────────────────────────────
 
    const showSnack = (msg, sev = 'success') =>
        setSnack({ open: true, msg, sev });
 
    const handleSuccess = () => {
        showSnack('Ticket submitted! Pending L1 approval.');
        setTimeout(() => navigate('/user/tickets'), 1200);
    };
 
    const handleBack = (target) => {
        if (target === 'drafts') {
            navigate('/user/drafts');
        } else if (selected && !draftTicket) {
            setSelected(null);
        } else {
            navigate(-1);
        }
    };
 
    return (
        <>
            {/* ── US-149: Restore banner ───────────────────────────────── */}
            {restoreBannerOpen && (
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        background: '#ede9fe',
                        border: '1px solid #c4b5fd',
                        borderRadius: '8px',
                        px: 2.5,
                        py: 1.5,
                        mb: 2,
                        flexWrap: 'wrap',
                    }}
                >
                    <RestoreIcon sx={{ color: '#5b21b6', fontSize: 20, flexShrink: 0 }} />
                    <Typography fontSize={13} color="#3b0764" fontWeight={500} flex={1} minWidth={200}>
                        You have an unsaved ticket from your previous session
                        {storedDraft?.category?.name ? ` (${storedDraft.category.name})` : ''}.
                        Would you like to restore it?
                    </Typography>
                    <Box display="flex" gap={1}>
                        <MuiButton
                            size="small"
                            variant="contained"
                            onClick={handleRestoreYes}
                            sx={{
                                fontSize: 12, fontWeight: 600, textTransform: 'none',
                                background: '#27235C', '&:hover': { background: '#1e1b4b' }
                            }}
                        >
                            Restore
                        </MuiButton>
                        <MuiButton
                            size="small"
                            variant="outlined"
                            onClick={handleRestoreNo}
                            sx={{
                                fontSize: 12, fontWeight: 600, textTransform: 'none',
                                borderColor: '#7c3aed', color: '#7c3aed',
                                '&:hover': { borderColor: '#5b21b6', background: '#f5f3ff' }
                            }}
                        >
                            Discard
                        </MuiButton>
                    </Box>
                </Box>
            )}
 
            {!selected ? (
                <OurServiceCatalogPage onSelectService={setSelected} />
            ) : (
                <OurCreateTicketPage
                    preSelected={selected}
                    draftTicket={draftTicket}
                    restoredForm={restoredForm}   /* ← US-149: pass restored form fields */
                    onSuccess={handleSuccess}
                    onBack={handleBack}
                    showSnack={showSnack}
                />
            )}
 
            <Snackbar
                open={snack.open}
                autoHideDuration={4000}
                onClose={() => setSnack(s => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert severity={snack.sev} onClose={() => setSnack(s => ({ ...s, open: false }))}>
                    {snack.msg}
                </Alert>
            </Snackbar>
        </>
    );
}
 
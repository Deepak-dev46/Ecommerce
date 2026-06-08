
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Snackbar, Alert } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import OurServiceCatalogPage from './OurServiceCatalogPage';
import OurCreateTicketPage from './OurCreateTicketPage';
 
export default function CreateTicketWrapper({ redirectTo = '/user/tickets', isDraftEdit = false }) {
    const { user }    = useAuth();
    const navigate    = useNavigate();
    const { state }   = useLocation();
 
    // If editing a draft, the DraftsPage passes { draftTicket, category, subcategory }
    // via navigate state — skip the service catalog and go straight to the form
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
            setSelected(null); // go back to catalog only if not editing draft
        } else {
            navigate(-1);
        }
    };
 
    return (
        <>
            {!selected ? (
                <OurServiceCatalogPage onSelectService={setSelected} />
            ) : (
                <OurCreateTicketPage
                    preSelected={selected}
                    draftTicket={draftTicket}
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
                <Alert severity={snack.sev}
                    onClose={() => setSnack(s => ({ ...s, open: false }))}>
                    {snack.msg}
                </Alert>
            </Snackbar>
        </>
    );
}
 



 
import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import { Snackbar } from '../components/UI';
import { masterApi } from '../api';
import ITSMManagerPage from './ITSMManagerPage';

const LOGGED_IN_USER_ID = Number(import.meta.env.VITE_USER_ID) || 1;

// Map page IDs to URL paths for navigation from standalone
const PAGE_TO_URL = {
  'dashboard':          '/',
  'catalog':            '/',
  'my-tickets':         '/',
  'manager-approvals':  '/manager?tab=approvals',
  'manager-assignments':'/manager?tab=assignments',
  'manager-unack':      '/manager?tab=unack',
  'manager-manual':     '/manager?tab=manual',
};

export default function ManagerStandalone() {
  const [snack,       setSnack]       = useState({ message:'', type:'success' });
  const [currentUser, setCurrentUser] = useState(null);
  const params = new URLSearchParams(window.location.search);
  const tab = params.get('tab') || 'approvals';
  const pageMap = { approvals:'manager-approvals', assignments:'manager-assignments', unack:'manager-unack', manual:'manager-manual' };
  const [currentPage, setCurrentPage] = useState(pageMap[tab] || 'manager-approvals');

  useEffect(() => {
    masterApi.getUserById(LOGGED_IN_USER_ID).then(u=>setCurrentUser(u)).catch(()=>setCurrentUser({id:LOGGED_IN_USER_ID}));
  }, []);

  const showSnack  = useCallback((msg, type='success') => setSnack({message:msg, type}), []);
  const closeSnack = useCallback(() => setSnack(s=>({...s, message:''})), []);

  const handleSetPage = (pageId) => {
    if (PAGE_TO_URL[pageId]) {
      window.location.href = PAGE_TO_URL[pageId];
    } else {
      setCurrentPage(pageId);
    }
  };

  const tabFromPage = { 'manager-approvals':'approvals', 'manager-assignments':'assignments', 'manager-unack':'unack', 'manager-manual':'manual' };

  return (
    <Layout page={currentPage} setPage={handleSetPage} currentUser={currentUser}>
      <ITSMManagerPage showSnack={showSnack} defaultTab={tabFromPage[currentPage] || 'approvals'} />
      <Snackbar message={snack.message} type={snack.type} onClose={closeSnack} />
    </Layout>
  );
}

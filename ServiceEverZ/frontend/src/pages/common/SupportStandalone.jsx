import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import { Snackbar } from '../components/UI';
import { masterApi } from '../api';
import SupportDashboardPage from './SupportDashboardPage';

const LOGGED_IN_USER_ID = Number(import.meta.env.VITE_USER_ID) || 1;

export default function SupportStandalone() {
  const [snack,       setSnack]       = useState({ message:'', type:'success' });
  const [currentUser, setCurrentUser] = useState(null);
  const params = new URLSearchParams(window.location.search);
  const rawTab = params.get('tab');
  const initTab  = rawTab === 'open' ? 'OPEN' : rawTab === 'history' ? 'HISTORY' : 'ASSIGNED';
  const initPage = initTab === 'OPEN' ? 'support-open' : initTab === 'HISTORY' ? 'support-history' : 'support-assigned';
  const [currentPage, setCurrentPage] = useState(initPage);

  useEffect(() => {
    masterApi.getUserById(LOGGED_IN_USER_ID).then(u=>setCurrentUser(u)).catch(()=>setCurrentUser({id:LOGGED_IN_USER_ID}));
  }, []);

  const showSnack  = useCallback((msg, type='success') => setSnack({message:msg, type}), []);
  const closeSnack = useCallback(() => setSnack(s=>({...s, message:''})), []);

  const handleSetPage = (pageId) => {
    if (['support-assigned','support-open','support-history'].includes(pageId)) {
      setCurrentPage(pageId);
    } else {
      window.location.href = '/';
    }
  };

  const tabFromPage = { 'support-assigned': 'ASSIGNED', 'support-open': 'OPEN', 'support-history': 'HISTORY' };

  return (
    <Layout page={currentPage} setPage={handleSetPage} currentUser={currentUser}>
      <SupportDashboardPage showSnack={showSnack} defaultTab={tabFromPage[currentPage] || 'ASSIGNED'} />
      <Snackbar message={snack.message} type={snack.type} onClose={closeSnack} />
    </Layout>
  );
}

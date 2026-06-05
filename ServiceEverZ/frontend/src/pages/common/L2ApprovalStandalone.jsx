import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import { Snackbar } from '../components/UI';
import { masterApi } from '../api';
import L1ApprovalPage from './L1ApprovalPage';
import L2ApprovalPage from './L2ApprovalPage';

const LOGGED_IN_USER_ID = Number(import.meta.env.VITE_USER_ID) || 1;

export default function L2Standalone() {
  const [snack,       setSnack]       = useState({ message:'', type:'success' });
  const [currentUser, setCurrentUser] = useState(null);
  const params = new URLSearchParams(window.location.search);
  const initTab = params.get('tab') === 'history' ? 'HISTORY' : 'PENDING';
  const initPage = initTab === 'HISTORY' ? 'l2-history' : 'l2-pending';
  const [currentPage, setCurrentPage] = useState(initPage);

  useEffect(() => {
    masterApi.getUserById(LOGGED_IN_USER_ID).then(u=>setCurrentUser(u)).catch(()=>setCurrentUser({id:LOGGED_IN_USER_ID}));
  }, []);

  const showSnack  = useCallback((msg, type='success') => setSnack({message:msg, type}), []);
  const closeSnack = useCallback(() => setSnack(s=>({...s, message:''})), []);

  const handleSetPage = (pageId) => {
    const approvalPages = ['l1-pending','l1-history','l2-pending','l2-history'];
    if (approvalPages.includes(pageId)) setCurrentPage(pageId);
    else window.location.href = '/';
  };

  const tabFromPage = { 'l1-pending':'PENDING', 'l1-history':'HISTORY', 'l2-pending':'PENDING', 'l2-history':'HISTORY' };
  const isL1 = currentPage.startsWith('l1-');

  return (
    <Layout page={currentPage} setPage={handleSetPage} currentUser={currentUser}>
      {isL1
        ? <L1ApprovalPage showSnack={showSnack} defaultTab={tabFromPage[currentPage] || 'PENDING'} />
        : <L2ApprovalPage showSnack={showSnack} defaultTab={tabFromPage[currentPage] || 'PENDING'} />
      }
      <Snackbar message={snack.message} type={snack.type} onClose={closeSnack} />
    </Layout>
  );
}

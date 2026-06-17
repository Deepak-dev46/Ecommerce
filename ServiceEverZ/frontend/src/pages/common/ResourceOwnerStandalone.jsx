import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import { Snackbar } from '../components/UI';
import { masterApi } from '../api';
import ResourceOwnerPage from './ResourceOwnerPage';

const LOGGED_IN_USER_ID = Number(import.meta.env.VITE_USER_ID) || 1;

export default function ResourceOwnerStandalone() {
  const [snack,       setSnack]       = useState({ message: '', type: 'success' });
  const [currentUser, setCurrentUser] = useState(null);

  const params  = new URLSearchParams(window.location.search);
  const initTab = params.get('tab') === 'history' ? 'HISTORY' : 'PENDING';
  const initPage = initTab === 'HISTORY' ? 'ro-history' : 'ro-pending';
  const [currentPage, setCurrentPage] = useState(initPage);

  useEffect(() => {
    masterApi.getUserById(LOGGED_IN_USER_ID)
      .then(u => setCurrentUser(u))
      .catch(() => setCurrentUser({ id: LOGGED_IN_USER_ID }));
  }, []);

  const showSnack  = useCallback((msg, type = 'success') => setSnack({ message: msg, type }), []);
  const closeSnack = useCallback(() => setSnack(s => ({ ...s, message: '' })), []);

  const handleSetPage = (pageId) => {
    if (pageId === 'ro-pending' || pageId === 'ro-history') {
      setCurrentPage(pageId);
    } else {
      window.location.href = '/';
    }
  };

  const tabFromPage = { 'ro-pending': 'PENDING', 'ro-history': 'HISTORY' };

  return (
    <Layout page={currentPage} setPage={handleSetPage} currentUser={currentUser}>
      <ResourceOwnerPage showSnack={showSnack} defaultTab={tabFromPage[currentPage] || 'PENDING'} />
      <Snackbar message={snack.message} type={snack.type} onClose={closeSnack} />
    </Layout>
  );
}

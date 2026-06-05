import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EmptyPanel from '../../components/EmptyPanel';
import StatusBadge from '../../components/StatusBadge';
import ApprovalDetailPanel from '../../components/itsm/ApprovalDetailPanel';
import { useAuth } from '../../context/AuthContext';
import {
  getPendingApproval,
  getAllArticles,
  getArticleById,
  getVersionHistory,
  getArticlesByStatus,
} from '../../api/kbApi';
import '../../styles/global.css';

const TABS = ['Pending Approval', 'All Articles', 'Published', 'Rejected'];

export default function ITSMManagerPage() {
  const { user } = useAuth();

  // Ensure approverId is always a Number (backend expects Long, not string)
  const ITSM_ID = user?.id != null ? Number(user.id) : 101;
  const [tab, setTab] = useState('Pending Approval');
  const [articles, setArticles] = useState([]);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [versions, setVersions] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [counts, setCounts] = useState({ pending: 0, all: 0, published: 0, rejected: 0 });

  useEffect(() => { loadCounts(); }, []);
  useEffect(() => { loadArticles(); }, [tab]);

  const loadCounts = async () => {
    try {
      const [pending, all, published, rejected] = await Promise.all([
        getPendingApproval(),
        getAllArticles(),
        getArticlesByStatus('PUBLISHED'),
        getArticlesByStatus('REJECTED'),
      ]);
      setCounts({
        pending: (pending.data?.data || pending.data || []).length,
        all: (all.data?.data || all.data || []).length,
        published: (published.data?.data || published.data || []).length,
        rejected: (rejected.data?.data || rejected.data || []).length,
      });
    } catch { }
  };

  const loadArticles = async () => {
    setLoading(true);
    try {
      let res;
      if (tab === 'Pending Approval') res = await getPendingApproval();
      else if (tab === 'All Articles') res = await getAllArticles();
      else if (tab === 'Published') res = await getArticlesByStatus('PUBLISHED');
      else res = await getArticlesByStatus('REJECTED');
      setArticles(res.data?.data || res.data || []);
    } catch {
      setArticles([]);
    }
    setLoading(false);
  };

  const selectArticle = async (article) => {
    setSelected(article);
    try {
      const [dr, vr] = await Promise.all([
        getArticleById(article.id),
        // ITSM_MANAGER role: backend returns ALL versions (DRAFT, IN_REVIEW, PUBLISHED, REJECTED, etc.)
        getVersionHistory(article.id, 'ITSM_MANAGER'),
      ]);
      setDetail(dr.data?.data || dr.data);
      setVersions(vr.data?.data || vr.data || []);
    } catch {
      setDetail(article);
      setVersions([]);
    }
  };

  const onDecisionMade = () => {
    loadArticles();
    loadCounts();
    setSelected(null);
    setDetail(null);
    setVersions([]);
  };

  const filtered = articles.filter(a =>
    a.title?.toLowerCase().includes(search.toLowerCase()) ||
    a.kbNumber?.toLowerCase().includes(search.toLowerCase())
  );

  const tabCount = {
    'Pending Approval': counts.pending,
    'All Articles': counts.all,
    'Published': counts.published,
    'Rejected': counts.rejected,
  };

  return (
    <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)' }}>
      <Typography variant="h5" sx={{ fontWeight: 700, color: '#1c1a3a', mb: 2.5 }}>
        Knowledge Base
      </Typography>

      <TextField
        fullWidth
        size="small"
        placeholder="Search articles by title, KB number..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        sx={{ mb: 2, maxWidth: 520, backgroundColor: '#fff', borderRadius: 1 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" sx={{ color: '#6b6b8a' }} />
            </InputAdornment>
          ),
        }}
      />

      <div className="tab-bar" style={{ marginBottom: 16 }}>
        {TABS.map(t => (
          <div
            key={t}
            className={`tab ${tab === t ? 'active' : ''}`}
            onClick={() => { setTab(t); setSelected(null); setDetail(null); }}
          >
            {t}
            {tabCount[t] > 0 && (
              <span className={`tab-count ${t === 'Pending Approval' ? 'warn' : ''}`}>
                {tabCount[t]}
              </span>
            )}
          </div>
        ))}
      </div>

      <Typography sx={{ fontSize: 13, color: '#6b6b8a', mb: 1.5 }}>
        {filtered.length} article{filtered.length !== 1 ? 's' : ''}
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, flex: 1, overflow: 'hidden' }}>

        {/* Article list */}
        <Box
          sx={{
            width: 400,
            flexShrink: 0,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            scrollbarGutter: 'stable',
            pr: 1.5, // 👈 ADD THIS (padding-right)
          }}>
          
          {loading && <div className="text-muted" style={{ padding: 20 }}>Loading...</div>}
          {!loading && filtered.length === 0 && (
            <div className="text-muted" style={{ padding: 20 }}>
              {tab === 'Pending Approval' ? 'No articles pending approval.' : 'No articles found.'}
            </div>
          )}
          {filtered.map(a => (
            <div
              key={a.id}
              className={`article-card ${selected?.id === a.id ? 'selected' : ''}`}
              onClick={() => selectArticle(a)}
            >
              <div className="kb-num">{a.kbNumber}</div>
              <div className="kb-title">{a.title}</div>
              {/* {a.summary && (
                <div className="kb-sum">
                  {a.summary.substring(0, 70)}{a.summary.length > 70 ? '...' : ''}
                </div>
              )} */}
              <div style={{ marginTop: 8 }}>
                <StatusBadge status={a.status?.toString()} />
              </div>
            </div>
          ))}
        </Box>

        {/* Article detail */}
        <Box sx={{
          flex: 1, overflowY: 'auto', background: '#fff',
          borderRadius: '10px', border: '1.5px solid #e0dff0',
        }}>
          {!detail && <EmptyPanel message="Select an article to review" />}
          {detail && (
            <ApprovalDetailPanel
              detail={detail}
              versions={versions}
              approverId={ITSM_ID}
              onDecisionMade={onDecisionMade}
            />
          )}
        </Box>

      </Box>
    </Box>
  );
}


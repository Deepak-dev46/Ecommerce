import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, InputAdornment, Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EmptyPanel from '../../components/EmptyPanel';
import StatusBadge from '../../components/StatusBadge';
import ArticleForm from '../../components/support/ArticleForm';
import ArticleDetailPanel from '../../components/support/ArticleDetailPanel';
import { useAuth } from '../../context/AuthContext';
import {
  getAllArticles,
  getArticleById,
  getVersionHistory,
  getVersionById,
  submitForApproval,
} from '../../api/kbApi';
import toast from '../../utils/toast';
import '../../styles/global.css';
 
const TABS = ['All', 'Published', 'Under Review', 'Draft', 'Rejected'];
const TAB_STATUS = {
  All: null,
  Published: 'PUBLISHED',
  'Under Review': 'UNDER_REVIEW',
  Draft: 'DRAFT',
  Rejected: 'REJECTED',
};
 
export default function SupportPersonnelPage() {
  const { user } = useAuth();
  const AUTHOR_ID = user?.id ?? null;
  const [tab, setTab] = useState('All');
  const [view, setView] = useState('list');
  const [articles, setArticles] = useState([]);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [versions, setVersions] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [editPrefill, setEditPrefill] = useState(null);
 
  useEffect(() => { loadArticles(); }, [tab]);
 
  const loadArticles = async () => {
    setLoading(true);
    try {
      const res = await getAllArticles();
      const list = res.data?.data || res.data || [];
      const statusFilter = TAB_STATUS[tab];
      setArticles(statusFilter ? list.filter(a => a.status?.toString() === statusFilter) : list);
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
        getVersionHistory(article.id, 'SUPPORT_PERSONNEL'),
      ]);
      setDetail(dr.data?.data || dr.data);
      setVersions(vr.data?.data || vr.data || []);
    } catch {
      setDetail(article);
      setVersions([]);
    }
  };
 
 
  const handleEdit = async () => {
    if (currentVersion?.versionId && currentVersion.versionId !== detail?.currentVersionId) {
      try {
        const res = await getVersionById(currentVersion.versionId);
        const vd = res.data?.data || res.data;
        setEditPrefill({
          ...detail,
          title: vd.title,
          summary: vd.summary,
          changeSummary: vd.changeSummary,
          attachmentOriginalName: vd.attachmentOriginalName,
          attachmentMimeType: vd.attachmentMimeType,
          attachmentSizeBytes: vd.attachmentSizeBytes,
        });
      } catch {
        setEditPrefill(detail);
      }
    } else {
      setEditPrefill(detail);
    }
    setView('edit');
  };
 
  const handleSubmitApproval = async () => {
    // Find the actual DRAFT or SENT_BACK version to submit.
    // For a sent-back new version on a published article, getArticleById returns the old
    // published (active) version as currentVersionId — so we must search the versions list.
    const submittableVersion = versions.find(
      v => v.state?.toString() === 'DRAFT' || v.state?.toString() === 'SENT_BACK'
    );
    const versionId = submittableVersion?.versionId || detail?.currentVersionId;
    if (!versionId) {
      toast.error('No version found to submit.');
      return;
    }
    try {
      await submitForApproval(detail.id, versionId);
      toast.success('Article submitted for approval!');
      await loadArticles();
      await selectArticle(selected);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to submit for approval.');
    }
  };
 
  const handleEditSuccess = async () => {
    setEditPrefill(null);
    setView('list');
    await loadArticles();
    if (selected) await selectArticle(selected);
  };
 
  const handleCreateSuccess = async () => {
    setView('list');
    await loadArticles();
  };
 
  const filtered = articles.filter(a =>
    a.title?.toLowerCase().includes(search.toLowerCase()) ||
    a.kbNumber?.toLowerCase().includes(search.toLowerCase())
  );
 
  const status = detail?.status?.toString();
  const isDraft = status === 'DRAFT';
  const isRejected = status === 'REJECTED';
  const canAddVersion = status === 'PUBLISHED';
 
  // For a sent-back new version on a published article, getArticleById returns the old
  // published (active) version as detail.currentVersionId — the SENT_BACK version is only
  // visible in the versions list. Scan the full list for any editable version first.
  const currentVersion = versions.find(
    v => v.state?.toString() === 'DRAFT' || v.state?.toString() === 'SENT_BACK'
  ) || versions.find(v => v.versionId === detail?.currentVersionId);
  const hasDraftVersion = !!(
    currentVersion?.state?.toString() === 'DRAFT' ||
    currentVersion?.state?.toString() === 'SENT_BACK'
  );
 
  const FormWrapper = ({ children }) => (
    <Box
      sx={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        p: { xs: 2, md: 4 },
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 860 }}>
        {children}
      </Box>
    </Box>
  );
 
  if (view === 'edit' && detail) {
    return (
      <FormWrapper>
        <ArticleForm
          authorId={AUTHOR_ID}
          articleId={detail.id}
          versionId={currentVersion?.versionId || detail.currentVersionId}
          isEdit
          prefill={editPrefill || detail}
          onSuccess={handleEditSuccess}
          onCancel={() => setView('list')}
        />
      </FormWrapper>
    );
  }
 
  if (view === 'create') {
    return (
      <FormWrapper>
        <ArticleForm
          authorId={AUTHOR_ID}
          onSuccess={handleCreateSuccess}
          onCancel={() => setView('list')}
        />
      </FormWrapper>
    );
  }
 
  if (view === 'newVersion' && detail) {
    return (
      <FormWrapper>
        <ArticleForm
          authorId={AUTHOR_ID}
          articleId={detail.id}
          isNewVersion
          prefill={editPrefill || detail}
          onSuccess={handleEditSuccess}
          onCancel={() => setView('list')}
        />
      </FormWrapper>
    );
  }
 
  return (
    <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)' }}>
 
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#1c1a3a' }}>
          Knowledge Base
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setView('create')}
          sx={{ backgroundColor: '#97247E', '&:hover': { backgroundColor: '#7a1c65' } }}
        >
          New Article
        </Button>
      </Box>
 
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
            onClick={() => { setTab(t); setSelected(null); setDetail(null); }} >
            {t}
          </div>
        ))}
      </div>
 
      <Typography sx={{ fontSize: 13, color: '#6b6b8a', mb: 1.5 }}>
        {filtered.length} article{filtered.length !== 1 ? 's' : ''}
      </Typography>
 
      <Box sx={{ display: 'flex', gap: 2, flex: 1, overflow: 'hidden' }}>
 
        <Box
          sx={{
            width: 400,
            flexShrink: 0,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            scrollbarGutter: 'stable',
            gap: 1,
            pr: 1.5,
          }}
        >
          {loading && <div className="text-muted" style={{ padding: 20 }}>Loading...</div>}
          {!loading && filtered.length === 0 && (
            <div className="text-muted" style={{ padding: 20 }}>No articles found.</div>
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
 
        <Box sx={{
          flex: 1, overflowY: 'auto', background: '#fff',
          borderRadius: '10px', border: '1.5px solid #e0dff0',
        }}>
          {!detail && <EmptyPanel message="Select an article to view details" />}
          {detail && (
            <ArticleDetailPanel
              detail={detail}
              versions={versions}
              isDraft={isDraft}
              isRejected={isRejected}
              canAddVersion={canAddVersion}
              hasDraftVersion={hasDraftVersion}
              currentVersion={currentVersion}
              onEdit={handleEdit}
              onSubmitApproval={handleSubmitApproval}
              onNewVersion={() => setView('newVersion')}
            />
          )}
        </Box>
 
      </Box>
    </Box>
  );
}
 
 
import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Typography, TextField, InputAdornment, Button,
  Dialog, DialogContent, DialogTitle, Chip, CircularProgress,
  Grid, IconButton, Select, MenuItem, FormControl,
  Pagination, PaginationItem,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import FilterListIcon from '@mui/icons-material/FilterList';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
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
  getCategories,
} from '../../api/kbApi';
import toast from '../../utils/toast';
import '../../styles/global.css';

const ARTICLES_PER_PAGE = 8;

const TABS = ['All', 'Published', 'Under Review', 'Draft', 'Rejected'];
const TAB_STATUS = {
  All: null,
  Published: 'PUBLISHED',
  'Under Review': 'UNDER_REVIEW',
  Draft: 'DRAFT',
  Rejected: 'REJECTED',
};

/* ── helpers ── */
function estimateReadTime(article) {
  const raw = [article.summary, article.content, article.resolutionSteps]
    .filter(Boolean)
    .join(' ');
  const words = raw.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

/* ── Article Card ── */
function ArticleCard({ article, onClick }) {
  const readTime = estimateReadTime(article);
  const dateStr = formatDate(article.publishedAt || article.updatedAt || article.createdAt);

  return (
    <Box
      onClick={() => onClick(article)}
      sx={{
        background: '#fff',
        borderRadius: '12px',
        border: '1.5px solid #ebebf0',
        p: 2.5,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: 1.2,
        height: '100%',
        transition: 'box-shadow .18s, border-color .18s, transform .18s',
        '&:hover': {
          boxShadow: '0 4px 20px rgba(39,35,92,0.13)',
          borderColor: '#27235C',
          transform: 'translateY(-2px)',
        },
      }}
    >
      {/* Status chip */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {article.categoryName && (
          <Chip
            label={article.categoryName}
            size="small"
            sx={{ fontSize: 10, fontWeight: 700, height: 20, background: '#eeedf6', color: '#27235C', borderRadius: '10px' }}
          />
        )}
        {article.status && (
          <Box sx={{ ml: 'auto' }}>
            <StatusBadge status={article.status?.toString()} />
          </Box>
        )}
      </Box>

      {/* KB Number */}
      {article.kbNumber && (
        <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#97247E', fontFamily: 'monospace' }}>
          {article.kbNumber}
        </Typography>
      )}

      {/* Title */}
      <Typography
        sx={{
          fontWeight: 700, fontSize: 14, color: '#1c1a3a',
          lineHeight: 1.45, flex: 1,
          display: '-webkit-box', WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}
      >
        {article.title}
      </Typography>

      {/* Footer */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 'auto', pt: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, color: '#888' }}>
          <AccessTimeIcon sx={{ fontSize: 13 }} />
          <Typography sx={{ fontSize: 12, color: '#888' }}>{readTime} min read</Typography>
        </Box>
        {dateStr && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, color: '#888' }}>
            <CalendarTodayIcon sx={{ fontSize: 13 }} />
            <Typography sx={{ fontSize: 12, color: '#888' }}>{dateStr}</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

/* ── Form Wrapper ── */
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
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      {children}
    </Box>
  </Box>
);

/* ── Main Page ── */
export default function SupportPersonnelPage() {
  const { user } = useAuth();
  const AUTHOR_ID = user?.id ?? null;

  const [tab, setTab] = useState('All');
  const [view, setView] = useState('list');
  const [articles, setArticles] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [editPrefill, setEditPrefill] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');

  /* Modal state */
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [versions, setVersions] = useState([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => { loadArticles(); }, [tab]);
  useEffect(() => { loadCategories(); }, []);

  const loadCategories = async () => {
    try {
      const res = await getCategories();
      setCategories(res.data?.data || res.data || []);
    } catch {}
  };

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
    setModalOpen(true);
    setDetail(null);
    setVersions([]);
    setLoadingDetail(true);
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
    setLoadingDetail(false);
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
    setModalOpen(false);
    setView('edit');
  };

  const handleSubmitApproval = async () => {
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
      setModalOpen(false);
      await loadArticles();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to submit for approval.');
    }
  };

  const handleEditSuccess = async () => {
    setEditPrefill(null);
    setView('list');
    await loadArticles();
  };

  const handleCreateSuccess = async () => {
    setView('list');
    await loadArticles();
  };

  /* Derived detail state */
  const status = detail?.status?.toString();
  const isDraft = status === 'DRAFT';
  const isRejected = status === 'REJECTED';
  const canAddVersion = status === 'PUBLISHED';
  const currentVersion = versions.find(
    v => v.state?.toString() === 'DRAFT' || v.state?.toString() === 'SENT_BACK'
  ) || versions.find(v => v.versionId === detail?.currentVersionId);
  const hasDraftVersion = !!(
    currentVersion?.state?.toString() === 'DRAFT' ||
    currentVersion?.state?.toString() === 'SENT_BACK'
  );

  /* ── Filtered list (with robust category matching) ── */
  const filtered = useMemo(() => {
    return articles.filter(a => {
      /* search match */
      const matchesSearch =
        !search ||
        a.title?.toLowerCase().includes(search.toLowerCase()) ||
        a.kbNumber?.toLowerCase().includes(search.toLowerCase());

      /* category match — try both id and name */
      let matchesCategory = true;
      if (selectedCategory) {
        const selectedCat = categories.find(
          c => String(c.id ?? c.name) === selectedCategory
        );
        if (selectedCat) {
          const byId =
            a.categoryId !== undefined &&
            a.categoryId !== null &&
            String(a.categoryId) === String(selectedCat.id);
          const byName =
            a.categoryName &&
            selectedCat.name &&
            a.categoryName.trim().toLowerCase() === selectedCat.name.trim().toLowerCase();
          matchesCategory = byId || byName;
        } else {
          matchesCategory =
            String(a.categoryId) === selectedCategory ||
            a.categoryName === selectedCategory;
        }
      }

      return matchesSearch && matchesCategory;
    });
  }, [articles, search, selectedCategory, categories]);

  const totalPages = Math.ceil(filtered.length / ARTICLES_PER_PAGE);

  const pagedArticles = useMemo(() => {
    const start = (page - 1) * ARTICLES_PER_PAGE;
    return filtered.slice(start, start + ARTICLES_PER_PAGE);
  }, [filtered, page]);

  /* reset to page 1 whenever filter changes */
  useEffect(() => { setPage(1); }, [search, selectedCategory, tab]);

  /* ── Form views ── */
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

  /* ── Selected category label (for result count) ── */
  const selectedCatLabel = selectedCategory
    ? categories.find(c => String(c.id ?? c.name) === selectedCategory)?.name
    : null;

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, minHeight: 'calc(100vh - 64px)', background: '#f7f7fb' }}>

      {/* ── Page Header: title left, button right ── */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2.5 }}>
        <Box>
          <Typography variant="h2" sx={{ fontWeight: 800, color: '#282367', lineHeight: 1.3 }}>
            Knowledge Base
          </Typography>
          <Typography sx={{ fontSize: 13, color: '#6b6b8a', mt: 0.4 }}>
            Manage and publish knowledge articles
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setView('create')}
          sx={{
            backgroundColor: '#97247E',
            '&:hover': { backgroundColor: '#7a1c65' },
            borderRadius: '50px',
            px: 2.5,
            flexShrink: 0,
            mt: 0.5,
          }}
        >
          New Article
        </Button>
      </Box>

      {/* ── Search + Category Filter (left-aligned) ── */}
      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
        <TextField
          size="medium"
          placeholder="Search articles by title, KB number..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          sx={{
            width: { xs: '100%', sm: 380 },
            background: '#fff',
            borderRadius: '50px',
            boxShadow: '0 2px 12px rgba(39,35,92,0.08)',
            '& .MuiOutlinedInput-root': {
              borderRadius: '50px',
              '& fieldset': { borderColor: '#dddde8' },
              '&:hover fieldset': { borderColor: '#27235C' },
              '&.Mui-focused fieldset': { borderColor: '#27235C' },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#6b6b8a', fontSize: 22 }} />
              </InputAdornment>
            ),
            endAdornment: search ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearch('')}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
        />

        {/* Category Filter */}
        <FormControl size="small" sx={{ minWidth: 180, flexShrink: 0 }}>
          <Select
            displayEmpty
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            startAdornment={
              <InputAdornment position="start">
                <FilterListIcon sx={{ fontSize: 17, color: '#6b6b8a', mr: 0.5 }} />
              </InputAdornment>
            }
            sx={{
              borderRadius: '50px',
              background: '#fff',
              boxShadow: '0 2px 12px rgba(39,35,92,0.08)',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#dddde8' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#27235C' },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#27235C' },
              fontSize: 13,
            }}
          >
            <MenuItem value=""><em>All Categories</em></MenuItem>
            {categories.map(c => (
              <MenuItem key={c.id ?? c.name} value={String(c.id ?? c.name)}>
                {c.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Clear category chip */}
        {selectedCategory && selectedCatLabel && (
          <Chip
            label={`Category: ${selectedCatLabel}`}
            onDelete={() => setSelectedCategory('')}
            size="small"
            sx={{ background: '#eeedf6', color: '#27235C', fontWeight: 600, fontSize: 12 }}
          />
        )}
      </Box>

      {/* ── Status Tabs (left-aligned) ── */}
      <Box sx={{ mb: 2.5 }}>
        <div className="tab-bar">
          {TABS.map(t => (
            <div
              key={t}
              className={`tab ${tab === t ? 'active' : ''}`}
              onClick={() => { setTab(t); setSelected(null); setDetail(null); }}
            >
              {t}
            </div>
          ))}
        </div>
      </Box>

      {/* ── Result count ── */}
      {!loading && (
        <Typography sx={{ fontSize: 13, color: '#6b6b8a', mb: 2 }}>
          {filtered.length} article{filtered.length !== 1 ? 's' : ''}
          {selectedCatLabel && (
            <> in <strong>{selectedCatLabel}</strong></>
          )}
          {filtered.length > ARTICLES_PER_PAGE && (
            <> &nbsp;·&nbsp; Page {page} of {totalPages}</>
          )}
        </Typography>
      )}

      {/* ── Loading ── */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress size={36} sx={{ color: '#27235C' }} />
        </Box>
      )}

      {/* ── Article Grid ── */}
      {!loading && pagedArticles.length > 0 && (
        <Grid container spacing={2}>
          {pagedArticles.map(a => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={a.id}>
              <ArticleCard article={a} onClick={selectArticle} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* ── Empty State ── */}
      {!loading && filtered.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography sx={{ fontSize: 40, mb: 1 }}>📭</Typography>
          <Typography sx={{ fontSize: 16, fontWeight: 600, color: '#1c1a3a', mb: 0.5 }}>
            No articles found
          </Typography>
          <Typography sx={{ fontSize: 13, color: '#888' }}>
            {selectedCategory || search
              ? 'Try a different search term or clear the filters.'
              : 'Create your first article to get started.'}
          </Typography>
        </Box>
      )}

      {/* ── Pagination ── */}
      {!loading && filtered.length > 0 && totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 1 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => {
              setPage(value);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            shape="rounded"
            renderItem={(item) => (
              <PaginationItem
                {...item}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: '#27235C',
                    color: '#fff',
                    fontWeight: 700,
                    '&:hover': { backgroundColor: '#1c1a3a' },
                  },
                  '&:hover': { backgroundColor: '#eeedf6' },
                  borderRadius: '8px',
                  fontWeight: 500,
                }}
              />
            )}
          />
        </Box>
      )}

      {/* ── Article Detail Modal ── */}
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: '14px', overflow: 'hidden', maxHeight: '90vh' }
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'linear-gradient(90deg,#27235C 0%,#97247E 100%)',
            color: '#fff', py: 1.5, px: 3,
          }}
        >
          <Typography sx={{ fontWeight: 700, fontSize: 15, color: '#fff' }}>
            Article Detail
          </Typography>
          <IconButton size="small" onClick={() => setModalOpen(false)} sx={{ color: '#fff' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 0, overflowY: 'auto' }}>
          {loadingDetail ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress size={32} sx={{ color: '#27235C' }} />
            </Box>
          ) : detail ? (
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
              onNewVersion={() => { setModalOpen(false); setView('newVersion'); }}
            />
          ) : null}
        </DialogContent>
      </Dialog>

    </Box>
  );
}

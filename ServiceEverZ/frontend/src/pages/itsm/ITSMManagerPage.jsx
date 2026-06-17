import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Typography, TextField, InputAdornment,
  Dialog, DialogContent, DialogTitle, Chip, CircularProgress,
  Grid, IconButton, Select, MenuItem, FormControl,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import CloseIcon from '@mui/icons-material/Close';
import FilterListIcon from '@mui/icons-material/FilterList';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
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
  getCategories,
} from '../../api/kbApi';
import '../../styles/global.css';

const ARTICLES_PER_PAGE = 8;
const TABS = ['Pending Approval', 'All Articles', 'Published', 'Rejected'];

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

/* ── Pagination ── */
function KBPagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const buildPages = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }
    pages.push(1);
    if (page > 3) pages.push('...');
    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (page < totalPages - 2) pages.push('...');
    pages.push(totalPages);
    return pages;
  };

  const btn = (label, active, disabled, onClick) => (
    <Box
      key={label + (active ? '-a' : '')}
      onClick={disabled ? undefined : onClick}
      sx={{
        width: 36, height: 36, display: 'flex', alignItems: 'center',
        justifyContent: 'center', borderRadius: '50%', cursor: disabled ? 'default' : 'pointer',
        fontWeight: active ? 700 : 400, fontSize: 14,
        background: active ? '#1c1a3a' : 'transparent',
        color: active ? '#fff' : disabled ? '#bbb' : '#1c1a3a',
        border: active ? 'none' : '1.5px solid',
        borderColor: active ? 'transparent' : disabled ? '#e0e0e0' : '#c5c5d0',
        transition: 'all .15s',
        '&:hover': disabled || active ? {} : { borderColor: '#1c1a3a', background: '#f0eff8' },
        userSelect: 'none',
      }}
    >
      {label}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.8, mt: 4, mb: 1 }}>
      {btn('‹', false, page === 1, () => onChange(page - 1))}
      {buildPages().map((p, idx) =>
        p === '...'
          ? <Typography key={`e-${idx}`} sx={{ px: 0.5, color: '#666', fontSize: 14, lineHeight: '36px' }}>…</Typography>
          : btn(p, p === page, false, () => onChange(p))
      )}
      {btn('›', false, page === totalPages, () => onChange(page + 1))}
    </Box>
  );
}

/* ── Article Card ── */
function ArticleCard({ article, onClick, isPending }) {
  const readTime = estimateReadTime(article);
  const dateStr = formatDate(article.publishedAt || article.updatedAt || article.createdAt);

  return (
    <Box
      onClick={() => onClick(article)}
      sx={{
        background: '#fff',
        borderRadius: '12px',
        border: isPending ? '1.5px solid #f59e0b' : '1.5px solid #ebebf0',
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
      {/* Status row */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
          <AccessTimeIcon sx={{ fontSize: 13, color: '#888' }} />
          <Typography sx={{ fontSize: 12, color: '#888' }}>{readTime} min read</Typography>
        </Box>
        {dateStr && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
            <CalendarTodayIcon sx={{ fontSize: 13, color: '#888' }} />
            <Typography sx={{ fontSize: 12, color: '#888' }}>{dateStr}</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

/* ── Main Page ── */
export default function ITSMManagerPage() {
  const { user } = useAuth();
  const ITSM_ID = user?.id != null ? Number(user.id) : 101;

  const [tab, setTab] = useState('Pending Approval');
  const [articles, setArticles] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [counts, setCounts] = useState({ pending: 0, all: 0, published: 0, rejected: 0 });
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');

  /* Modal state */
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [versions, setVersions] = useState([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => { loadCounts(); loadCategories(); }, []);
  useEffect(() => { loadArticles(); }, [tab]);

  const loadCategories = async () => {
    try {
      const res = await getCategories();
      setCategories(res.data?.data || res.data || []);
    } catch {}
  };

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
    setModalOpen(true);
    setDetail(null);
    setVersions([]);
    setLoadingDetail(true);
    try {
      const [dr, vr] = await Promise.all([
        getArticleById(article.id),
        getVersionHistory(article.id, 'ITSM_MANAGER'),
      ]);
      setDetail(dr.data?.data || dr.data);
      setVersions(vr.data?.data || vr.data || []);
    } catch {
      setDetail(article);
      setVersions([]);
    }
    setLoadingDetail(false);
  };

  const onDecisionMade = () => {
    loadArticles();
    loadCounts();
    setModalOpen(false);
    setSelected(null);
    setDetail(null);
    setVersions([]);
  };

  const tabCount = {
    'Pending Approval': counts.pending,
    'All Articles': counts.all,
    'Published': counts.published,
    'Rejected': counts.rejected,
  };

  /* Filtered + paginated */
  const filtered = articles.filter(a => {
    const matchesSearch =
      a.title?.toLowerCase().includes(search.toLowerCase()) ||
      a.kbNumber?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory
      ? String(a.categoryId) === selectedCategory || a.categoryName === selectedCategory
      : true;
    return matchesSearch && matchesCategory;
  });
  const totalPages = Math.ceil(filtered.length / ARTICLES_PER_PAGE);
  const pagedArticles = useMemo(() => {
    const start = (page - 1) * ARTICLES_PER_PAGE;
    return filtered.slice(start, start + ARTICLES_PER_PAGE);
  }, [filtered, page]);

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, minHeight: 'calc(100vh - 64px)', background: '#f7f7fb' }}>

      {/* ── Page Title ── */}
      <Box sx={{ mb: 2.5 }}>
        <Typography variant="h3" sx={{ fontWeight: 800, color: '#282367', lineHeight: 1.3 }}>
          Knowledge Base
        </Typography>
        <Typography sx={{ fontSize: 13, color: '#6b6b8a', mt: 0.4 }}>
          Review and approve knowledge articles
        </Typography>
      </Box>

      {/* ── Search Bar + Category Filter ── */}
      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
        <TextField
          fullWidth
          size="medium"
          placeholder="Search articles by title, KB number..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
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
                <IconButton size="small" onClick={() => { setSearch(''); setPage(1); }}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
        />

        {/* Category Filter */}
        <FormControl size="small" sx={{ minWidth: 170, flexShrink: 0 }}>
          <Select
            displayEmpty
            value={selectedCategory}
            onChange={e => { setSelectedCategory(e.target.value); setPage(1); }}
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
      </Box>

      {/* ── Tabs ── */}
      <Box sx={{ mb: 2.5 }}>
        <div className="tab-bar">
          {TABS.map(t => (
            <div
              key={t}
              className={`tab ${tab === t ? 'active' : ''}`}
              onClick={() => { setTab(t); setSelected(null); setDetail(null); setPage(1); }}
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
      </Box>

      {/* ── Result count ── */}
      {!loading && (
        <Typography sx={{ fontSize: 13, color: '#6b6b8a', mb: 2 }}>
          {filtered.length} article{filtered.length !== 1 ? 's' : ''}
          {selectedCategory && categories.find(c => String(c.id ?? c.name) === selectedCategory) && (
            <> in <strong>{categories.find(c => String(c.id ?? c.name) === selectedCategory)?.name}</strong></>
          )}
          {filtered.length > ARTICLES_PER_PAGE && (
            <> · Page {page} of {totalPages}</>
          )}
        </Typography>
      )}

      {/* ── Loading ── */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress size={36} sx={{ color: '#27235C' }} />
        </Box>
      )}

      {/* ── Grid ── */}
      {!loading && pagedArticles.length > 0 && (
        <Grid container spacing={2}>
          {pagedArticles.map(a => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={a.id}>
              <ArticleCard
                article={a}
                onClick={selectArticle}
                isPending={tab === 'Pending Approval'}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* ── Empty State ── */}
      {!loading && filtered.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography sx={{ fontSize: 40, mb: 1 }}>📭</Typography>
          <Typography sx={{ fontSize: 16, fontWeight: 600, color: '#1c1a3a', mb: 0.5 }}>
            {tab === 'Pending Approval' ? 'No articles pending approval' : 'No articles found'}
          </Typography>
          <Typography sx={{ fontSize: 13, color: '#888' }}>
            {tab === 'Pending Approval'
              ? 'All articles are up to date.'
              : 'Try a different search term or clear the filters.'}
          </Typography>
        </Box>
      )}

      {/* ── Pagination ── */}
      {!loading && totalPages > 1 && (
        <KBPagination
          page={page}
          totalPages={totalPages}
          onChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        />
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
            Article Review
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
            <ApprovalDetailPanel
              detail={detail}
              versions={versions}
              approverId={ITSM_ID}
              onDecisionMade={onDecisionMade}
            />
          ) : null}
        </DialogContent>
      </Dialog>

    </Box>
  );
}

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Typography, TextField, InputAdornment, IconButton,
  Dialog, DialogContent, DialogTitle, Chip, CircularProgress,
  Grid, Select, MenuItem, FormControl,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import CloseIcon from '@mui/icons-material/Close';
import FilterListIcon from '@mui/icons-material/FilterList';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ArticleReadPanel from '../../components/users/ArticleReadPanel';
import { useAuth } from '../../context/AuthContext';
import {
  searchArticles,
  getArticleById,
  getVersionHistory,
  getFeedback,
  getCategories,
} from '../../api/kbApi';
import '../../styles/global.css';

const ARTICLES_PER_PAGE = 8;

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

/* ── Pagination ─────────────────────────────────────────────── */
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

/* ── Article Card ───────────────────────────────────────────── */
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
      {/* Category chip */}
      {article.categoryName && (
        <Box>
          <Chip
            label={article.categoryName}
            size="small"
            sx={{
              fontSize: 10, fontWeight: 700, height: 20,
              background: '#eeedf6', color: '#27235C', borderRadius: '10px',
            }}
          />
        </Box>
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

      {/* Footer: read time + date */}
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
        {article.averageRating != null && (
          <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 0.3 }}>
            <Typography sx={{ fontSize: 12, color: '#f59e0b', fontWeight: 700 }}>
              ★ {Number(article.averageRating).toFixed(1)}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

/* ── Main Page ─────────────────────────────────────────────── */
export default function EndUserPage() {
  const { user } = useAuth();
  const END_USER_ID = user?.id ?? null;

  const [keyword, setKeyword] = useState('');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');

  /* Modal state */
  const [modalOpen, setModalOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [versions, setVersions] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    doSearch('');
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await getCategories();
      setCategories(res.data?.data || res.data || []);
    } catch {}
  };

  const doSearch = async (kw) => {
    setLoading(true);
    try {
      const r = await searchArticles(kw);
      setArticles(r.data?.data || r.data || []);
    } catch {
      setArticles([]);
    }
    setLoading(false);
    setPage(1);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') doSearch(keyword);
  };

  /* Client-side category filter on top of search results */
  const filtered = useMemo(() =>
    selectedCategory
      ? articles.filter(a => String(a.categoryId) === selectedCategory || a.categoryName === selectedCategory)
      : articles,
    [articles, selectedCategory]
  );

  /* Pagination logic */
  const totalPages = Math.ceil(filtered.length / ARTICLES_PER_PAGE);
  const pagedArticles = useMemo(() => {
    const start = (page - 1) * ARTICLES_PER_PAGE;
    return filtered.slice(start, start + ARTICLES_PER_PAGE);
  }, [filtered, page]);

  /* Open article detail modal */
  const openArticle = async (article) => {
    setModalOpen(true);
    setDetail(null);
    setVersions([]);
    setFeedback([]);
    setLoadingDetail(true);
    try {
      const [dr, vr, fr] = await Promise.all([
        getArticleById(article.id),
        getVersionHistory(article.id),
        getFeedback(article.id),
      ]);
      setDetail(dr.data?.data || dr.data);
      setVersions(vr.data?.data || vr.data || []);
      setFeedback(fr.data?.data || fr.data || []);
    } catch {
      setDetail(article);
      setVersions([]);
      setFeedback([]);
    }
    setLoadingDetail(false);
  };

  const onFeedbackSubmitted = () => {
    if (detail) {
      getFeedback(detail.id)
        .then(r => setFeedback(r.data?.data || r.data || []))
        .catch(() => {});
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, minHeight: 'calc(100vh - 64px)', background: '#f7f7fb' }}>

      {/* ── Page Title ── */}
      <Box sx={{ mb: 2.5 }}>
        <Typography variant="h3" sx={{ fontWeight: 800, color: '#282367', lineHeight: 1.3 }}>
          Knowledge Base
        </Typography>
        <Typography sx={{ fontSize: 13, color: '#6b6b8a', mt: 0.4 }}>
          Search articles, guides and how-tos
        </Typography>
      </Box>

      {/* ── Search Bar + Category Filter ── */}
      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
        <TextField
          fullWidth
          size="medium"
          placeholder="Search articles..."
          value={keyword}
          onChange={e => {
            setKeyword(e.target.value);
            if (!e.target.value.trim()) doSearch('');
          }}
          onKeyDown={handleKeyDown}
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
            endAdornment: keyword ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => { setKeyword(''); doSearch(''); }}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : (
              <InputAdornment position="end">
                <Box
                  onClick={() => doSearch(keyword)}
                  sx={{
                    background: '#27235C', color: '#fff', borderRadius: '50px',
                    px: 2, py: 0.6, fontSize: 13, fontWeight: 600,
                    cursor: 'pointer', whiteSpace: 'nowrap',
                    '&:hover': { background: '#1b193f' },
                    mr: -1,
                  }}
                >
                  Search
                </Box>
              </InputAdornment>
            ),
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

      {/* ── Result count ── */}
      {!loading && (
        <Typography sx={{ fontSize: 13, color: '#6b6b8a', mb: 2 }}>
          {filtered.length} article{filtered.length !== 1 ? 's' : ''} found
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
      {!loading && filtered.length > 0 && (
        <Grid container spacing={2}>
          {pagedArticles.map(a => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={a.id}>
              <ArticleCard article={a} onClick={openArticle} />
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
            Try a different search term or clear the filters to browse all articles.
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
            <ArticleReadPanel
              detail={detail}
              versions={versions}
              feedback={feedback}
              userId={END_USER_ID}
              onFeedbackSubmitted={onFeedbackSubmitted}
            />
          ) : null}
        </DialogContent>
      </Dialog>

    </Box>
  );
}

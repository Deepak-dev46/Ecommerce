import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, InputAdornment, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import EmptyPanel from '../../components/EmptyPanel';
import ArticleReadPanel from '../../components/users/ArticleReadPanel';
import { useAuth } from '../../context/AuthContext';
import {
  searchArticles,
  getArticleById,
  getVersionHistory,
  getFeedback,
} from '../../api/kbApi';
import '../../styles/global.css';

export default function EndUserPage() {
  const { user } = useAuth();
  const END_USER_ID = user?.id ?? null;
  const [keyword, setKeyword] = useState('');
  const [articles, setArticles] = useState([]);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [versions, setVersions] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [searched, setSearched] = useState(false);

  useEffect(() => { doSearch(''); }, []);

  const doSearch = async (kw) => {
    try {
      const r = await searchArticles(kw);
      setArticles(r.data?.data || r.data || []);
    } catch {
      setArticles([]);
    }
    setSearched(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') { doSearch(keyword); }
  };

  const selectArticle = async (article) => {
    setSelected(article);
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
  };

  const onFeedbackSubmitted = () => {
    if (selected) {
      getFeedback(selected.id)
        .then(r => setFeedback(r.data?.data || r.data || []))
        .catch(() => { });
    }
  };

  return (
    <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)' }}>
      <Typography variant="h5" sx={{ fontWeight: 700, color: '#1c1a3a', mb: 2.5 }}>
        Knowledge Base
      </Typography>

      <Box sx={{ position: 'relative', mb: 2, maxWidth: 560 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search knowledge base articles..."
          value={keyword}
          onChange={e => {
            setKeyword(e.target.value);
            if (!e.target.value.trim()) doSearch('');
          }}
          onKeyDown={handleKeyDown}
          sx={{ backgroundColor: '#fff', borderRadius: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ color: '#6b6b8a' }} />
              </InputAdornment>
            ),
            endAdornment: keyword && (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => { setKeyword(''); doSearch(''); }}
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {searched && (
        <Typography sx={{ fontSize: 13, color: '#6b6b8a', mb: 1.5 }}>
          {articles.length} article{articles.length !== 1 ? 's' : ''} found
        </Typography>
      )}

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
          }}>

          {articles.length === 0 && searched && (
            <div className="text-muted" style={{ padding: 20 }}>No articles found.</div>
          )}
          {articles.map(a => (
            <div
              key={a.id}
              className={`article-card ${selected?.id === a.id ? 'selected' : ''}`}
              onClick={() => selectArticle(a)}
            >
              <div className="kb-num">
                {a.kbNumber}
                {a.currentVersionNumber > 1
                  ? <span style={{ marginLeft: 6, fontSize: 10, background: '#dbeafe', color: '#1d4ed8', padding: '1px 6px', borderRadius: 10, fontWeight: 700 }}>v{a.currentVersionNumber}</span>
                  : null
                }
              </div>
              <div className="kb-title">{a.title}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                {a.averageRating != null && (
                  <span style={{ fontSize: 12, color: '#f59e0b', fontWeight: 600 }}>
                    ★ {Number(a.averageRating).toFixed(1)}
                  </span>
                )}
                {a.ratingCount > 0 && (
                  <span className="text-muted">({a.ratingCount} ratings)</span>
                )}
              </div>
            </div>
          ))}
        </Box>

        <Box sx={{
          flex: 1, overflowY: 'auto', background: '#fff',
          borderRadius: '10px', border: '1.5px solid #e0dff0',
        }}>
          {!detail && <EmptyPanel message="Search and select an article to read" />}
          {detail && (
            <ArticleReadPanel
              detail={detail}
              versions={versions}
              feedback={feedback}
              userId={END_USER_ID}
              onFeedbackSubmitted={onFeedbackSubmitted}
            />
          )}
        </Box>

      </Box>
    </Box>
  );
}

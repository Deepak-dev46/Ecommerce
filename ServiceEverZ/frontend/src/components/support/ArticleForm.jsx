import React, { useState, useEffect, useRef } from 'react';
import {
  createArticleForm, createArticlePdf, createArticleVideo,
  updateDraftForm, updateDraftPdf, updateDraftVideo,
  createNewVersionForm, createNewVersionPdf, createNewVersionVideo,
  getCategories, createCategory,
} from '../../api/kbApi';
import toast from '../../utils/toast';
import '../../styles/global.css';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { Quill } from 'react-quill-new';
import {
  Box, Typography, Button, Paper, Stack, Divider,
  TextField, Select, MenuItem, FormControl, CircularProgress,
  InputAdornment,
} from '@mui/material';
import ArrowBackIcon        from '@mui/icons-material/ArrowBack';
import SaveIcon             from '@mui/icons-material/Save';
import AssignmentIcon       from '@mui/icons-material/Assignment';
import InfoOutlinedIcon     from '@mui/icons-material/InfoOutlined';
import CloudUploadIcon      from '@mui/icons-material/CloudUpload';
import CategoryIcon         from '@mui/icons-material/Category';
import TitleIcon            from '@mui/icons-material/Title';
import NotesIcon            from '@mui/icons-material/Notes';
import HistoryIcon          from '@mui/icons-material/History';

/* ── Google Fonts – Roboto ─────────────────────────────────────────── */
const fontLink = document.createElement('link');
fontLink.href  = 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&display=swap';
fontLink.rel   = 'stylesheet';
if (!document.head.querySelector('[href*="Roboto"]')) document.head.appendChild(fontLink);

/* ── Design tokens (mirrors CreateMappingPage) ─────────────────────── */
const BRAND    = '#27235C';
const ACCENT   = '#97247E';
const BG       = '#F7F8FC';
const CARD_BG  = '#FFFFFF';
const BORDER   = '#E8E8F0';
const TEXT_PRI = '#1A1A2E';
const TEXT_SEC = '#6B6B8A';
const FONT     = "'Roboto', sans-serif";

/* ── Reusable MUI sx ───────────────────────────────────────────────── */
const sectionSx = {
  backgroundColor: CARD_BG,
  borderRadius: '16px',
  border: `1px solid ${BORDER}`,
  boxShadow: '0 2px 12px rgba(39,35,92,0.06)',
  overflow: 'visible',
  mb: 1.5,
};

const sectionHeaderSx = (color = BRAND) => ({
  px: 3, py: 1.5,
  background: `linear-gradient(135deg, ${color}08 0%, ${color}04 100%)`,
  borderBottom: `1px solid ${BORDER}`,
  display: 'flex',
  alignItems: 'center',
  gap: 1.5,
});

const inputSx = {
  fontFamily: FONT,
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px',
    fontFamily: FONT,
    fontSize: '0.875rem',
    backgroundColor: '#FAFBFF',
    transition: 'box-shadow 0.2s, border-color 0.2s',
    '&:hover fieldset':       { borderColor: BRAND },
    '&.Mui-focused fieldset': { borderColor: BRAND, borderWidth: '2px' },
    '&.Mui-error fieldset':   { borderColor: '#E01950' },
  },
  '& .MuiInputLabel-root':            { fontFamily: FONT, fontSize: '0.875rem' },
  '& .MuiInputLabel-root.Mui-focused': { color: BRAND },
  '& .MuiFormHelperText-root':         { fontFamily: FONT, fontSize: '0.72rem', mt: 0.5 },
};

/* ── Sub-components ────────────────────────────────────────────────── */
function SectionHeader({ icon, title, subtitle, color = BRAND }) {
  return (
    <Box sx={sectionHeaderSx(color)}>
      <Box sx={{
        width: 36, height: 36, borderRadius: '10px',
        background: `linear-gradient(135deg, ${color}22, ${color}11)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color,
      }}>
        {React.cloneElement(icon, { sx: { fontSize: 18 } })}
      </Box>
      <Box>
        <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: '0.88rem', color: TEXT_PRI, letterSpacing: '0.01em' }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography sx={{ fontFamily: FONT, fontSize: '0.72rem', color: TEXT_SEC, mt: 0.1 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

function FieldLabel({ children, required }) {
  return (
    <Typography sx={{
      fontFamily: FONT, fontSize: '0.72rem', fontWeight: 600, color: TEXT_SEC,
      letterSpacing: '0.06em', textTransform: 'uppercase', mb: 0.6,
    }}>
      {children}
      {required && <span style={{ color: '#E01950', marginLeft: 3 }}>*</span>}
    </Typography>
  );
}

/* ── Quill setup ───────────────────────────────────────────────────── */
const quillModules = {
  toolbar: [
    ['bold', 'italic', 'underline', 'strike'],
    [{ font: [] }],
    [{ size: ['small', false, 'large', 'huge'] }],
    [{ color: [] }, { background: [] }],
    [{ align: [] }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ indent: '-1' }, { indent: '+1' }],
    ['link'],
    ['clean'],
  ],
};

const Font = Quill.import('formats/font');
Font.whitelist = ['sans-serif', 'serif', 'monospace', 'PT Sans'];
Quill.register(Font, true);

const UPLOAD_TYPES = [
  { value: 'form',  label: '📝 Form',  desc: 'Fill in article fields manually' },
  { value: 'pdf',   label: '📄 PDF',   desc: 'Upload a PDF file as the article' },
  { value: 'video', label: '🎬 Video', desc: 'Upload a video file as the article' },
];

const ACCEPTED = {
  pdf:   { accept: 'application/pdf,.pdf', hint: 'PDF files only (max 50 MB)' },
  video: { accept: 'video/mp4,video/webm,video/ogg,video/*,.mp4,.webm,.mov,.avi', hint: 'MP4 / WebM / MOV / AVI (max 500 MB)' },
};

const BLANK = { title: '', summary: '', changeSummary: '', categoryId: '' };

const stripHtml = (html) => html.replace(/<[^>]*>/g, '').trim();

const VALIDATORS = {
  title: (v) => {
    const trimmed = v.trim();
    if (!trimmed) return 'Title is required';
    if (!/^[a-zA-Z0-9 ]+$/.test(trimmed)) return 'Title must contain only letters, numbers and spaces';
    if (!/[a-zA-Z]/.test(trimmed)) return 'Title must include at least one letter';
    return '';
  },
  summary:       (v) => stripHtml(v) ? '' : 'Description is required',
  categoryId:    (v) => (v && v !== '__others__') ? '' : 'Category is required',
  changeSummary: (v) => v.trim() ? '' : 'Change summary is required for new versions',
};

const MANDATORY_KEYS = ['title', 'summary', 'categoryId'];

const FILE_LIMITS = {
  pdf:   { maxBytes: 50  * 1024 * 1024, err: 'PDF must be under 50 MB' },
  video: { maxBytes: 500 * 1024 * 1024, err: 'Video must be under 500 MB' },
};

/**
 * ArticleForm — 3 modes x 3 upload types:
 *  Mode 1  Create      (no articleId)            -> POST /articles/{form|pdf|video}
 *  Mode 2  Edit        (isEdit, articleId, vId)  -> PUT  /articles/{aId}/versions/{vId}/draft/{form|pdf|video}
 *  Mode 3  New Version (isNewVersion, articleId) -> POST /articles/{aId}/versions/{form|pdf|video}
 */
export default function ArticleForm({
  authorId, articleId, versionId, isEdit, isNewVersion, prefill, onSuccess, onCancel,
}) {
  const inferType = () => {
    if (!prefill?.attachmentMimeType) return 'form';
    if (prefill.attachmentMimeType.startsWith('video/')) return 'video';
    if (prefill.attachmentMimeType === 'application/pdf') return 'pdf';
    return 'form';
  };

  const [uploadType, setUploadType]     = useState(inferType);
  const [form, setForm]                 = useState(BLANK);
  const [cats, setCats]                 = useState([]);
  const [saving, setSaving]             = useState(false);
  const [touched, setTouched]           = useState({});
  const [errors, setErrors]             = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError]       = useState('');
  const [fileMeta, setFileMeta]         = useState(null);
  const fileInputRef                    = useRef(null);
  const [newCategory, setNewCategory]   = useState('');
  const [addingCategory, setAddingCategory] = useState(false);

  const existingAttachment = prefill?.attachmentOriginalName || null;

  useEffect(() => {
    getCategories()
      .then(r => setCats(r.data?.data || r.data || []))
      .catch(() => {});
    if (prefill) {
      setForm({
        title:         prefill.title || '',
        summary:       prefill.summary || '',
        changeSummary: '',
        categoryId:    prefill.categoryId ? String(prefill.categoryId) : '',
      });
    }
  }, []);

  useEffect(() => {
    setSelectedFile(null);
    setFileError('');
    setFileMeta(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [uploadType]);

  const validateField = (key, value) => {
    const validator = VALIDATORS[key];
    if (!validator) return;
    if (key === 'changeSummary' && !isNewVersion) return;
    setErrors(prev => ({ ...prev, [key]: validator(value) }));
  };

  const set = (key, value) => {
    setForm(f => ({ ...f, [key]: value }));
    if (touched[key]) validateField(key, value);
  };

  const handleBlur = (key) => {
    setTouched(prev => ({ ...prev, [key]: true }));
    validateField(key, form[key]);
  };

  const validateAll = () => {
    const keys = [...MANDATORY_KEYS, ...(isNewVersion ? ['changeSummary'] : [])];
    const newErrors  = {};
    const newTouched = {};
    keys.forEach(key => {
      newTouched[key] = true;
      const msg = VALIDATORS[key](form[key]);
      if (msg) newErrors[key] = msg;
    });
    setTouched(prev => ({ ...prev, ...newTouched }));
    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const fieldErr = (key) => !!(touched[key] && errors[key]);
  const fieldHelp = (key) => (touched[key] && errors[key]) ? errors[key] : '';

  const handleAddCategory = async () => {
    const name = newCategory.trim();
    if (!name) { toast.error('Category name is required.'); return; }
    setAddingCategory(true);
    try {
      const res     = await createCategory({ name });
      const created = res.data?.data || res.data;
      setCats(prev => [...prev, created]);
      setForm(f => ({ ...f, categoryId: String(created.id) }));
      setErrors(prev => ({ ...prev, categoryId: '' }));
      setTouched(prev => ({ ...prev, categoryId: true }));
      setNewCategory('');
      toast.success(`Category "${created.name}" added!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create category.');
    }
    setAddingCategory(false);
  };

  const formatBytes = (bytes) => {
    if (bytes < 1024)        return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleFileChange = (e) => {
    const file  = e.target.files?.[0];
    if (!file) return;
    const limit = FILE_LIMITS[uploadType];
    if (file.size > limit.maxBytes) {
      setFileError(limit.err);
      setSelectedFile(null);
      setFileMeta(null);
      return;
    }
    setFileError('');
    setSelectedFile(file);
    setFileMeta({ name: file.name, size: file.size });
  };

  const clearFile = () => {
    setSelectedFile(null);
    setFileMeta(null);
    setFileError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const dt = new DataTransfer();
    dt.items.add(file);
    if (fileInputRef.current) fileInputRef.current.files = dt.files;
    handleFileChange({ target: { files: [file] } });
  };

  const buildFormPayload = () => ({
    title:         form.title,
    summary:       form.summary,
    changeSummary: form.changeSummary,
    authorId,
    categoryId: (form.categoryId && form.categoryId !== '__others__') ? Number(form.categoryId) : null,
    tags: [],
  });

  const buildFileFormData = (fileKey) => {
    const fd = new FormData();
    fd.append('title',       form.title);
    fd.append('description', form.summary);
    if (authorId != null) fd.append('authorId', String(authorId));
    if (form.categoryId && form.categoryId !== '__others__') fd.append('categoryId', String(form.categoryId));
    if (isNewVersion && form.changeSummary) fd.append('changeSummary', form.changeSummary);
    fd.append(fileKey, selectedFile);
    return fd;
  };

  const validateFileMode = () => {
    const miniKeys  = ['title', 'summary', 'categoryId', ...(isNewVersion ? ['changeSummary'] : [])];
    const newErrors = {};
    const newTouched = {};
    miniKeys.forEach(key => {
      newTouched[key] = true;
      const msg = VALIDATORS[key]?.(form[key]);
      if (msg) newErrors[key] = msg;
    });
    setTouched(prev => ({ ...prev, ...newTouched }));
    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (uploadType !== 'form') {
      if (!validateFileMode()) return;
      if (!selectedFile && !existingAttachment) {
        setFileError(`Please select a ${uploadType === 'pdf' ? 'PDF' : 'video'} file`);
        return;
      }
    } else {
      if (!validateAll()) return;
    }

    setSaving(true);
    try {
      if (uploadType === 'form') {
        const payload = buildFormPayload();
        if (isNewVersion && articleId) {
          await createNewVersionForm(articleId, payload);
          toast.success('New version submitted for approval!');
        } else if (isEdit && articleId && versionId) {
          await updateDraftForm(articleId, versionId, payload);
          toast.success('Draft updated!');
        } else {
          await createArticleForm(payload);
          toast.success('Article saved as DRAFT!');
        }

      } else if (uploadType === 'pdf') {
        if (selectedFile) {
          const fd = buildFileFormData('pdfFile');
          if (isNewVersion && articleId) {
            await createNewVersionPdf(articleId, fd);
            toast.success('New PDF version submitted for approval!');
          } else if (isEdit && articleId && versionId) {
            await updateDraftPdf(articleId, versionId, fd);
            toast.success('PDF draft updated!');
          } else {
            await createArticlePdf(fd);
            toast.success('PDF article saved as DRAFT!');
          }
        } else {
          await updateDraftForm(articleId, versionId, buildFormPayload());
          toast.success('Draft updated (attachment unchanged)!');
        }

      } else if (uploadType === 'video') {
        if (selectedFile) {
          const fd = buildFileFormData('videoFile');
          if (isNewVersion && articleId) {
            await createNewVersionVideo(articleId, fd);
            toast.success('New video version submitted for approval!');
          } else if (isEdit && articleId && versionId) {
            await updateDraftVideo(articleId, versionId, fd);
            toast.success('Video draft updated!');
          } else {
            await createArticleVideo(fd);
            toast.success('Video article saved as DRAFT!');
          }
        } else {
          await updateDraftForm(articleId, versionId, buildFormPayload());
          toast.success('Draft updated (attachment unchanged)!');
        }
      }

      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving article. Please try again.');
    }
    setSaving(false);
  };

  const pageTitle    = isNewVersion ? 'Create New Version' : isEdit ? 'Edit Draft' : 'New Article';
  const pageSubtitle = isNewVersion
    ? 'Submit a new version for approval'
    : isEdit
    ? 'Update your draft article'
    : 'Create and save a new knowledge base article';

  /* ── Render ── */
  return (
    <Box sx={{ fontFamily: FONT, backgroundColor: BG, minHeight: '100vh', p: { xs: 1.5, md: 2 },  }}>
      <Box sx={{ maxWidth: '100%', mx: 'auto' }}>

        {/* ── Page Header ── */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={onCancel}
            sx={{
              fontFamily: FONT, fontWeight: 500, color: BRAND,
              textTransform: 'none', borderRadius: '10px', px: 2, py: 0.8,
              border: `1px solid ${BORDER}`, backgroundColor: CARD_BG,
              '&:hover': { backgroundColor: `${BRAND}08`, borderColor: BRAND },
            }}
          >
            Back
          </Button>

          <Box sx={{ flex: 1 }}>
            <Typography sx={{
              fontFamily: FONT, fontWeight: 900, fontSize: '1.35rem',
              color: TEXT_PRI, letterSpacing: '-0.02em',
            }}>
              {pageTitle}
            </Typography>
            <Typography sx={{ fontFamily: FONT, fontSize: '0.8rem', color: TEXT_SEC, mt: 0.3 }}>
              {pageSubtitle}
            </Typography>
          </Box>
        </Box>

        {/* ══════════════════════════════════════════
            SECTION 1 — ARTICLE TYPE
        ══════════════════════════════════════════ */}
        <Paper elevation={0} sx={sectionSx}>
          {/* <SectionHeader
            icon={<AssignmentIcon />}
            title="Article Type"
            subtitle="Choose how to create this article"
          /> */}

          <Box sx={{ p: 2.5 }}>
            <FieldLabel>Upload Type</FieldLabel>
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              {UPLOAD_TYPES.map(ut => (
                <Box
                  key={ut.value}
                  onClick={() => setUploadType(ut.value)}
                  sx={{
                    flex: '1', minWidth: 140,
                    display: 'flex', alignItems: 'flex-start', gap: 1.5,
                    p: '12px 16px',
                    border: `2px solid ${uploadType === ut.value ? BRAND : BORDER}`,
                    borderRadius: '12px', cursor: 'pointer',
                    background: uploadType === ut.value
                      ? `linear-gradient(135deg, ${BRAND}0A 0%, ${BRAND}05 100%)`
                      : CARD_BG,
                    transition: 'border-color 0.15s, background 0.15s',
                    userSelect: 'none',
                  }}
                >
                  <Box sx={{
                    width: 16, height: 16, borderRadius: '50%', mt: '2px', flexShrink: 0,
                    border: `2px solid ${uploadType === ut.value ? BRAND : '#C0C0D0'}`,
                    background: uploadType === ut.value ? BRAND : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {uploadType === ut.value && (
                      <Box sx={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />
                    )}
                  </Box>
                  <Box>
                    <Typography sx={{
                      fontFamily: FONT, fontWeight: 700, fontSize: '0.875rem',
                      color: uploadType === ut.value ? BRAND : TEXT_PRI,
                    }}>
                      {ut.label}
                    </Typography>
                    <Typography sx={{ fontFamily: FONT, fontSize: '0.72rem', color: TEXT_SEC, mt: 0.2 }}>
                      {ut.desc}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Paper>

        {/* ══════════════════════════════════════════
            SECTION 2 — ARTICLE DETAILS
        ══════════════════════════════════════════ */}
        <Paper elevation={0} sx={sectionSx}>
          {/* <SectionHeader
            icon={<InfoOutlinedIcon />}
            title="Article Details"
            subtitle="Provide the article content and categorisation"
            color={ACCENT}
          /> */}

          <Box sx={{ p: 2.5 }}>

            {/* Title */}
            <Box sx={{ mb: 2.5 }}>
              <FieldLabel required>Title</FieldLabel>
              <TextField
                fullWidth size="small"
                placeholder="Article title (letters and numbers only)"
                value={form.title}
                onChange={e => set('title', e.target.value)}
                onBlur={() => handleBlur('title')}
                error={fieldErr('title')}
                helperText={fieldHelp('title')}
                sx={inputSx}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <TitleIcon sx={{ fontSize: 16, color: TEXT_SEC }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <Divider sx={{ borderColor: BORDER, mb: 2.5 }} />

            {/* Category */}
            <Box sx={{ mb: 2.5 }}>
              <FieldLabel required>Category</FieldLabel>
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                <FormControl
                  size="small"
                  fullWidth
                  error={fieldErr('categoryId')}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '10px', fontFamily: FONT, fontSize: '0.875rem',
                      backgroundColor: '#FAFBFF',
                      '&:hover fieldset':       { borderColor: BRAND },
                      '&.Mui-focused fieldset': { borderColor: BRAND, borderWidth: '2px' },
                      '&.Mui-error fieldset':   { borderColor: '#E01950' },
                    },
                    '& .MuiFormHelperText-root': { fontFamily: FONT, fontSize: '0.72rem' },
                  }}
                >
                  <Select
                    value={form.categoryId === '__others__' ? '__others__' : form.categoryId}
                    onChange={e => {
                      const val = e.target.value;
                      if (val === '__others__') {
                        setForm(f => ({ ...f, categoryId: '__others__' }));
                        setNewCategory('');
                      } else {
                        set('categoryId', val);
                      }
                    }}
                    onBlur={() => { if (form.categoryId !== '__others__') handleBlur('categoryId'); }}
                    startAdornment={
                      <InputAdornment position="start">
                        <CategoryIcon sx={{ fontSize: 16, color: form.categoryId && form.categoryId !== '__others__' ? ACCENT : '#aaa' }} />
                      </InputAdornment>
                    }
                    displayEmpty
                    renderValue={v => {
                      if (!v) return <em style={{ color: TEXT_SEC, fontFamily: FONT, fontStyle: 'normal' }}>Select category…</em>;
                      if (v === '__others__') return <em style={{ fontFamily: FONT, fontStyle: 'normal', color: ACCENT }}>Others (Add new category)</em>;
                      const cat = cats.find(c => String(c.id) === String(v));
                      return <span style={{ fontFamily: FONT }}>{cat?.name || v}</span>;
                    }}
                  >
                    <MenuItem value="" sx={{ fontFamily: FONT, fontSize: '0.875rem', color: TEXT_SEC }}>
                      <em>Select category…</em>
                    </MenuItem>
                    {cats.map(c => (
                      <MenuItem key={c.id} value={String(c.id)} sx={{ fontFamily: FONT, fontSize: '0.875rem' }}>
                        {c.name}
                      </MenuItem>
                    ))}
                    <MenuItem value="__others__" sx={{ fontFamily: FONT, fontSize: '0.875rem', color: ACCENT, fontStyle: 'italic' }}>
                      Others (Add new category)
                    </MenuItem>
                  </Select>
                  {fieldErr('categoryId') && (
                    <Typography sx={{ fontFamily: FONT, fontSize: '0.72rem', color: '#E01950', mt: 0.5, ml: 1.5 }}>
                      {fieldHelp('categoryId')}
                    </Typography>
                  )}
                </FormControl>
              </Box>

              {/* Add new category — shown when "Others" selected */}
              {form.categoryId === '__others__' && (
                <Box sx={{ mt: 1.5, display: 'flex', gap: 1.5, alignItems: 'center' }}>
                  <TextField
                    size="small"
                    fullWidth
                    placeholder="Enter new category name"
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddCategory(); } }}
                    autoFocus
                    sx={inputSx}
                  />
                  <Button
                    variant="contained"
                    onClick={handleAddCategory}
                    disabled={addingCategory}
                    sx={{
                      fontFamily: FONT, fontWeight: 600, textTransform: 'none',
                      borderRadius: '10px', px: 2.5, py: 1, whiteSpace: 'nowrap',
                      background: `linear-gradient(135deg, ${ACCENT}, #7B1F6A)`,
                      '&:hover': { background: `linear-gradient(135deg, #7B1F6A, ${ACCENT})` },
                      '&:disabled': { opacity: 0.6 },
                    }}
                  >
                    {addingCategory ? 'Adding…' : '+ Add Category'}
                  </Button>
                </Box>
              )}
            </Box>

            <Divider sx={{ borderColor: BORDER, mb: 2.5 }} />

            {/* Description */}
            <Box sx={{ mb: 2.5 }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                <NotesIcon sx={{ fontSize: 15, color: ACCENT }} />
                <Typography sx={{
                  fontFamily: FONT, fontWeight: 700, fontSize: '0.75rem',
                  color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.08em',
                }}>
                  Description <span style={{ color: '#E01950' }}>*</span>
                </Typography>
              </Stack>
              <Box sx={{
                border: `1.5px solid ${fieldErr('summary') ? '#E01950' : BORDER}`,
                borderRadius: '10px', overflow: 'hidden',
                '& .ql-toolbar': { borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: `1px solid ${BORDER}` },
                '& .ql-container': { borderBottom: 'none', borderLeft: 'none', borderRight: 'none', borderTop: 'none', fontFamily: FONT, fontSize: '0.875rem' },
                '& .ql-editor': { minHeight: 140, padding: '12px 16px' },
                background: '#FAFBFF',
              }}>
                <ReactQuill
                  theme="snow"
                  modules={quillModules}
                  value={form.summary}
                  onChange={value => set('summary', value)}
                  onBlur={() => handleBlur('summary')}
                  placeholder={uploadType === 'form' ? 'Brief description…' : 'Brief description of this file…'}
                />
              </Box>
              {fieldErr('summary') && (
                <Typography sx={{ fontFamily: FONT, fontSize: '0.72rem', color: '#E01950', mt: 0.5, ml: 0.5 }}>
                  {fieldHelp('summary')}
                </Typography>
              )}
            </Box>

            {/* Change Summary — new-version mode only */}
            {isNewVersion && (
              <>
                <Divider sx={{ borderColor: BORDER, mb: 2.5 }} />
                <Box>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                    <HistoryIcon sx={{ fontSize: 15, color: BRAND }} />
                    <Typography sx={{
                      fontFamily: FONT, fontWeight: 700, fontSize: '0.75rem',
                      color: BRAND, textTransform: 'uppercase', letterSpacing: '0.08em',
                    }}>
                      Change Summary <span style={{ color: '#E01950' }}>*</span>
                    </Typography>
                  </Stack>
                  <TextField
                    fullWidth
                    size="small"
                    multiline
                    rows={3}
                    placeholder="Describe what changed in this version…"
                    value={form.changeSummary}
                    onChange={e => set('changeSummary', e.target.value)}
                    onBlur={() => handleBlur('changeSummary')}
                    error={fieldErr('changeSummary')}
                    helperText={fieldHelp('changeSummary')}
                    sx={inputSx}
                  />
                </Box>
              </>
            )}
          </Box>
        </Paper>

        {/* ══════════════════════════════════════════
            SECTION 3 — FILE UPLOAD (PDF / Video)
        ══════════════════════════════════════════ */}
        {uploadType !== 'form' && (
          <Paper elevation={0} sx={sectionSx}>
            <SectionHeader
              icon={<CloudUploadIcon />}
              title={uploadType === 'pdf' ? 'PDF Upload' : 'Video Upload'}
              subtitle={uploadType === 'pdf'
                ? 'Attach a PDF file to this article'
                : 'Attach a video file to this article'}
            />

            <Box sx={{ p: 2.5 }}>
              <FieldLabel required>
                {uploadType === 'pdf' ? 'PDF File' : 'Video File'}
                {existingAttachment && !selectedFile && (
                  <Box component="span" sx={{
                    fontWeight: 400, color: '#059669', fontSize: '0.72rem', ml: 1,
                    background: '#d1fae5', px: 1, py: 0.3, borderRadius: '4px',
                  }}>
                    Current: {existingAttachment}
                  </Box>
                )}
              </FieldLabel>

              <Box
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={handleDrop}
                sx={{
                  border: `2px dashed ${fileError ? '#E01950' : selectedFile ? BRAND : BORDER}`,
                  borderRadius: '12px', p: '32px 20px', textAlign: 'center',
                  cursor: 'pointer',
                  background: selectedFile ? `${BRAND}06` : '#FAFBFF',
                  transition: 'all 0.15s',
                  '&:hover': { borderColor: BRAND, background: `${BRAND}04` },
                }}
              >
                {selectedFile ? (
                  <>
                    <Typography sx={{ fontSize: '2.5rem', mb: 1 }}>
                      {uploadType === 'pdf' ? '📄' : '🎬'}
                    </Typography>
                    <Typography sx={{ fontFamily: FONT, fontWeight: 700, color: BRAND, fontSize: '0.9rem' }}>
                      {fileMeta.name}
                    </Typography>
                    <Typography sx={{ fontFamily: FONT, color: TEXT_SEC, fontSize: '0.78rem', mt: 0.5 }}>
                      {formatBytes(fileMeta.size)}
                    </Typography>
                    <Typography sx={{ fontFamily: FONT, color: '#9CA3AF', fontSize: '0.72rem', mt: 1 }}>
                      Click to change file
                    </Typography>
                  </>
                ) : (
                  <>
                    <Typography sx={{ fontSize: '2.5rem', mb: 1 }}>
                      {uploadType === 'pdf' ? '📄' : '🎬'}
                    </Typography>
                    <Typography sx={{ fontFamily: FONT, fontWeight: 600, color: TEXT_PRI, fontSize: '0.875rem' }}>
                      Click to select or drag & drop
                    </Typography>
                    <Typography sx={{ fontFamily: FONT, color: TEXT_SEC, fontSize: '0.75rem', mt: 0.5 }}>
                      {ACCEPTED[uploadType].hint}
                    </Typography>
                  </>
                )}
              </Box>

              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED[uploadType].accept}
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />

              {fileError && (
                <Typography sx={{ fontFamily: FONT, fontSize: '0.72rem', color: '#E01950', mt: 0.8 }}>
                  {fileError}
                </Typography>
              )}

              {selectedFile && (
                <Button
                  size="small"
                  onClick={clearFile}
                  sx={{
                    mt: 1, fontFamily: FONT, fontWeight: 600, textTransform: 'none',
                    color: '#E01950', fontSize: '0.75rem', p: 0,
                    '&:hover': { background: 'transparent', textDecoration: 'underline' },
                  }}
                >
                  ✕ Remove file
                </Button>
              )}
            </Box>
          </Paper>
        )}

        {/* ── Footer Actions ── */}
        <Box sx={{
          display: 'flex', justifyContent: 'flex-end', alignItems: 'center',
          gap: 2, pt: 1, pb: 4,
        }}>
          <Button
            onClick={onCancel}
            sx={{
              fontFamily: FONT, fontWeight: 500, textTransform: 'none',
              color: TEXT_SEC, borderRadius: '10px', px: 3, py: 1,
              border: `1px solid ${BORDER}`,
              '&:hover': { backgroundColor: '#F0F0F8', borderColor: '#C0C0D0' },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={saving ? <CircularProgress size={15} color="inherit" /> : <SaveIcon />}
            onClick={handleSubmit}
            disabled={saving}
            sx={{
              fontFamily: FONT, fontWeight: 700, textTransform: 'none',
              borderRadius: '10px', px: 4, py: 1,
              background: `linear-gradient(135deg, ${BRAND}, #292387)`,
              boxShadow: `0 4px 14px ${BRAND}40`,
              '&:hover': {
                background: `linear-gradient(135deg, #1B193F, ${BRAND})`,
                boxShadow: `0 6px 20px ${BRAND}55`,
              },
              '&:disabled': { opacity: 0.6 },
            }}
          >
            {saving
              ? 'Saving…'
              : isNewVersion
              ? 'Save New Version'
              : isEdit
              ? 'Update Draft'
              : 'Save as Draft'}
          </Button>
        </Box>

      </Box>
    </Box>
  );
}

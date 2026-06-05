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
  { value: 'form', label: '📝 Form', desc: 'Fill in article fields manually' },
  { value: 'pdf', label: '📄 PDF', desc: 'Upload a PDF file as the article' },
  { value: 'video', label: '🎬 Video', desc: 'Upload a video file as the article' },
];
 
const ACCEPTED = {
  pdf: { accept: 'application/pdf,.pdf', hint: 'PDF files only (max 50 MB)' },
  video: { accept: 'video/mp4,video/webm,video/ogg,video/*,.mp4,.webm,.mov,.avi', hint: 'MP4 / WebM / MOV / AVI (max 500 MB)' },
};
 
const BLANK = {
  title: '', summary: '', changeSummary: '', categoryId: '',
};
 
// FIX (Bug 3): Strip HTML tags before checking if Quill field is truly empty.
// ReactQuill returns '<p><br></p>' for an empty editor, not '', so plain .trim() always passes.
const stripHtml = (html) => html.replace(/<[^>]*>/g, '').trim();
 
const VALIDATORS = {
  title: (v) => {
    const trimmed = v.trim();
    if (!trimmed) return 'Title is required';
    if (!/^[a-zA-Z0-9 ]+$/.test(trimmed)) return 'Title must contain only letters, numbers and spaces';
    if (!/[a-zA-Z]/.test(trimmed)) return 'Title must include at least one letter';
    return '';
  },
  summary: (v) => stripHtml(v) ? '' : 'Description is required',
  categoryId: (v) => (v && v !== '__others__') ? '' : 'Category is required',
  changeSummary: (v) => v.trim() ? '' : 'Change summary is required for new versions',
};
 
const MANDATORY_KEYS = ['title', 'summary', 'categoryId'];
 
const FILE_LIMITS = {
  pdf: { maxBytes: 50 * 1024 * 1024, err: 'PDF must be under 50 MB' },
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
 
  const [uploadType, setUploadType] = useState(inferType);
  const [form, setForm] = useState(BLANK);
  const [cats, setCats] = useState([]);
  const [saving, setSaving] = useState(false);
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [fileMeta, setFileMeta] = useState(null);
  const fileInputRef = useRef(null);
  const [newCategory, setNewCategory] = useState('');
  const [addingCategory, setAddingCategory] = useState(false);
 
  const existingAttachment = prefill?.attachmentOriginalName || null;
 
  useEffect(() => {
    getCategories()
      .then(r => setCats(r.data?.data || r.data || []))
      .catch(() => { });
 if (prefill) {
      setForm({
        title: prefill.title || '',
        summary: prefill.summary || '',
        changeSummary: '',
        categoryId: prefill.categoryId ? String(prefill.categoryId) : '',
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
    const newErrors = {};
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
 
  const fieldStyle = (key) =>
    touched[key] && errors[key]
      ? { borderColor: '#e01950', boxShadow: '0 0 0 2px rgba(224,25,80,0.15)' }
      : {};
 
  const inlineError = (key) =>
    touched[key] && errors[key]
      ? <span className="inline-error">{errors[key]}</span>
      : null;
 
  const fieldProps = (key, extra = {}) => ({
    value: form[key],
    style: fieldStyle(key),
    title: (touched[key] && errors[key]) ? errors[key] : undefined,
    onBlur: () => handleBlur(key),
    ...extra,
  });
 
  const handleAddCategory = async () => {
    const name = newCategory.trim();
    if (!name) { toast.error('Category name is required.'); return; }
    setAddingCategory(true);
    try {
      const res = await createCategory({ name });
      const created = res.data?.data || res.data;
      setCats(prev => [...prev, created]);
      // Switch dropdown to the newly created category (away from __others__)
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
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };
 
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
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
    if (fileInputRef.current) {
      fileInputRef.current.files = dt.files;
    }
    handleFileChange({ target: { files: [file] } });
  };
 
  const buildFormPayload = () => ({
    title: form.title,
    summary: form.summary,   // FIX: was 'description', must be 'summary' to match DTO
    changeSummary: form.changeSummary,
    authorId,
    categoryId: (form.categoryId && form.categoryId !== '__others__') ? Number(form.categoryId) : null,
    tags: [],
  });
 
  const buildFileFormData = (fileKey) => {
    const fd = new FormData();
    fd.append('title', form.title);
    fd.append('description', form.summary);
 
    if (authorId != null) fd.append('authorId', String(authorId));
    if (form.categoryId && form.categoryId !== '__others__') fd.append('categoryId', String(form.categoryId));
 
    if (isNewVersion && form.changeSummary) {
      fd.append('changeSummary', form.changeSummary);
    }
 
    fd.append(fileKey, selectedFile);
    return fd;
  };
 
  const validateFileMode = () => {
    const miniKeys = ['title', 'summary', 'categoryId', ...(isNewVersion ? ['changeSummary'] : [])];
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
 
  const pageTitle = isNewVersion ? 'Create New Version' : isEdit ? 'Edit Draft' : 'New Article';
  return (
    <>
      <div className="page-header">
        <h1 style={{ color: '#27235c', marginLeft: '40px' }}>{pageTitle}</h1>
        <button className="btn btn-ghost" onClick={onCancel}>← Back</button>
      </div>
 
      <form className="form-card" onSubmit={handleSubmit} noValidate>
 
        {/* Article Type */}
        <div className="form-row full">
          <div className="form-group">
            <label>Article Type</label>
            <div style={{ display: 'flex', gap: '10px', marginTop: '6px', flexWrap: 'wrap' }}>
              {UPLOAD_TYPES.map(ut => (
                <label
                  key={ut.value}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: '10px',
                    padding: '12px 16px',
                    border: `2px solid ${uploadType === ut.value ? '#2563eb' : '#d1d5db'}`,
                    borderRadius: '10px', cursor: 'pointer',
                    background: uploadType === ut.value ? '#eff6ff' : '#ffffff',
                    color: uploadType === ut.value ? '#1d4ed8' : '#374151',
                    transition: 'border-color 0.15s, background 0.15s',
                    userSelect: 'none', flex: '1', minWidth: '130px',
                  }}
                >
                  <input
                    type="radio" name="uploadType" value={ut.value}
                    checked={uploadType === ut.value}
                    onChange={() => setUploadType(ut.value)}
                    style={{ accentColor: '#2563eb', width: '16px', height: '16px', marginTop: '2px', flexShrink: 0 }}
                  />
                  <span>
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>{ut.label}</span>
                    <span style={{ display: 'block', fontSize: '11px', fontWeight: 400, color: '#6b7280', marginTop: '2px' }}>
                      {ut.desc}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
 
        {/* Title */}
        <div className="form-row">
          <div className="form-group">
            <label>* Title</label>
            <input
              {...fieldProps('title')}
              onChange={e => set('title', e.target.value)}
              placeholder="Article title (letters and numbers only)"
            />
            {inlineError('title')}
          </div>
        </div>
          {/* Category */}
        <div className="form-row">
          <div className="form-group">
            <label>* Category</label>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <div style={{ flex: 1 }}>
                <select
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
                  onBlur={() => {
                    if (form.categoryId !== '__others__') handleBlur('categoryId');
                  }}
                  style={{
                    width: '100%',
                    ...fieldStyle('categoryId'),
                  }}
                >
                  <option value="">Select category...</option>
                  {cats.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                  <option value="__others__">Others (Add new category)</option>
                </select>
                {inlineError('categoryId')}
              </div>
            </div>

            {/* Add category input — only shown when "Others" is selected */}
            {form.categoryId === '__others__' && (
              <div style={{ marginTop: '10px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="text"
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  placeholder="Enter new category name"
                  style={{ flex: 1 }}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddCategory(); } }}
                  autoFocus
                />
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleAddCategory}
                  disabled={addingCategory}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {addingCategory ? 'Adding...' : '+ Add Category'}
                </button>
              </div>
            )}
          </div>
        </div>
 
        {/* Description (all modes) */}
        <div className="form-row full">
          <div className="form-group">
            <label>* Description</label>
            <ReactQuill
              theme="snow"
              modules={quillModules}
              value={form.summary}
              onChange={value => set('summary', value)}
              onBlur={() => handleBlur('summary')}
              placeholder={uploadType === 'form' ? 'Brief description...' : 'Brief description of this file...'}
              style={{ background: '#fff', borderRadius: '10px' }}
            />
            <br />
            {inlineError('summary')}
          </div>
        </div>

        
 
        {/* Change Summary — new-version mode only */}
        {isNewVersion && (
          <div className="form-row full">
            <div className="form-group">
              <label>* Change Summary</label>
              <textarea
                {...fieldProps('changeSummary')}
                onChange={e => set('changeSummary', e.target.value)}
                placeholder="Describe what changed in this version..."
                rows={3}
                style={{
                  width: '100%', resize: 'vertical',
                  padding: '9px 12px', borderRadius: '8px',
                  border: '1.5px solid #d1d5db',
                  fontSize: '14px', fontFamily: 'inherit', outline: 'none',
                  ...fieldStyle('changeSummary'),
                }}
              />
              {inlineError('changeSummary')}
            </div>
          </div>
        )}

        {/* File upload (PDF / Video modes) */}
        {uploadType !== 'form' && (
          <div className="form-row full">
            <div className="form-group">
              <label>
                * {uploadType === 'pdf' ? 'PDF File' : 'Video File'}
                {existingAttachment && !selectedFile && (
                  <span style={{
                    fontWeight: 400, color: '#059669', fontSize: '12px', marginLeft: '8px',
                    background: '#d1fae5', padding: '2px 8px', borderRadius: '4px',
                  }}>
                    Current: {existingAttachment}
                  </span>
                )}
              </label>
 
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={handleDrop}
                style={{
                  border: `2px dashed ${fileError ? '#e01950' : selectedFile ? '#2563eb' : '#d1d5db'}`,
                  borderRadius: '10px', padding: '28px 20px', textAlign: 'center',
                  cursor: 'pointer', background: selectedFile ? '#eff6ff' : '#fafafa',
                  transition: 'all 0.15s', marginTop: '4px',
                }}
              >
                {selectedFile ? (
                  <>
                    <div style={{ fontSize: '36px', marginBottom: '8px' }}>{uploadType === 'pdf' ? '📄' : '🎬'}</div>
                    <div style={{ fontWeight: 600, color: '#2563eb', fontSize: '14px' }}>{fileMeta.name}</div>
                    <div style={{ color: '#6b7280', fontSize: '12px', marginTop: '3px' }}>{formatBytes(fileMeta.size)}</div>
                    <div style={{ color: '#9ca3af', fontSize: '11px', marginTop: '8px' }}>Click to change file</div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: '36px', marginBottom: '8px' }}>{uploadType === 'pdf' ? '📄' : '🎬'}</div>
                    <div style={{ color: '#374151', fontSize: '14px', fontWeight: 500 }}>Click to select or drag & drop</div>
                    <div style={{ color: '#9ca3af', fontSize: '12px', marginTop: '5px' }}>{ACCEPTED[uploadType].hint}</div>
                  </>
                )}
              </div>
 
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED[uploadType].accept}
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
 
              {fileError && (
                <span className="inline-error" style={{ marginTop: '6px' }}>
                  {fileError}
                </span>
              )}
 
              {selectedFile && (
                <button
                  type="button"
                  onClick={clearFile}
                  style={{ marginTop: '8px', background: 'none', border: 'none', color: '#e01950', cursor: 'pointer', fontSize: '12px', padding: 0 }}
                >
                  ✕ Remove file
                </button>
              )}
            </div>
          </div>
        )}
 
        {/* Actions */}
        <div className="form-actions">
          <button className="btn btn-ghost" type="button" onClick={onCancel}>Cancel</button>
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? 'Saving...' : isNewVersion ? 'Save New Version' : isEdit ? 'Update Draft' : 'Save as Draft'}
          </button>
        </div>
 
      </form>
    </>
  );
}
 
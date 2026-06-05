import React, { useState } from 'react'
import FeedbackForm from './FeedbackForm'
import { getVersionById, getAttachmentDownloadUrl } from '../../api/kbApi'
import DOMPurify from "dompurify";


function formatBytes(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// ── Attachment viewer for end users ────────────────────────────────────────
function AttachmentSection({ versionId, mimeType, originalName, sizeBytes }) {
  if (!originalName || !versionId) return null
  const isPdf = mimeType === 'application/pdf'
  const isVideo = mimeType?.startsWith('video/')
  if (!isPdf && !isVideo) return null

  const downloadUrl = getAttachmentDownloadUrl(versionId)
  const sizeLabel = formatBytes(sizeBytes)
  const [downloading, setDownloading] = React.useState(false)

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const res = await fetch(downloadUrl)
      if (!res.ok) throw new Error('Download failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = originalName
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch {
      // silent fail
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="detail-section">
      <h4>
        {isPdf ? '📄 Article Document' : '🎬 Article Video'}
        {sizeLabel && (
          <span style={{ fontWeight: 400, color: '#6b7280', fontSize: '12px', marginLeft: '8px' }}>
            {sizeLabel}
          </span>
        )}
      </h4>
      <div style={{ marginTop: '10px' }}>
        <button
          onClick={handleDownload}
          disabled={downloading}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '8px 16px', background: downloading ? '#93c5fd' : '#2563eb',
            color: '#fff', borderRadius: '7px', fontSize: '13px', fontWeight: 600,
            border: 'none', cursor: downloading ? 'not-allowed' : 'pointer', transition: 'background 0.15s',
          }}
          onMouseEnter={e => { if (!downloading) e.currentTarget.style.background = '#1d4ed8' }}
          onMouseLeave={e => { if (!downloading) e.currentTarget.style.background = '#2563eb' }}
        >
          {downloading ? '⏳ Downloading…' : `⬇ Download ${isPdf ? 'PDF' : 'Video'}`}
        </button>
      </div>
    </div>
  )
}

// Returns true only if the HTML string contains visible text content
function hasContent(html) {
  if (!html) return false
  const text = html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
  return text.length > 0
}

export default function ArticleReadPanel({ detail, versions, feedback, userId, onFeedbackSubmitted }) {
  const [activeTab, setActiveTab] = useState('article')
  const [selectedVer, setSelectedVer] = useState(null)
  const [verDetail, setVerDetail] = useState(null)
  const [loadingVer, setLoadingVer] = useState(false)

  const loadVersion = async (v) => {
    if (selectedVer?.versionId === v.versionId) { setSelectedVer(null); setVerDetail(null); return }
    setSelectedVer(v); setLoadingVer(true)
    try {
      const res = await getVersionById(v.versionId)
      setVerDetail(res.data?.data || res.data)
    } catch { setVerDetail(null) }
    setLoadingVer(false)
  }

  const renderStars = (rating) =>
    Array.from({ length: 5 }, (_, i) => (
      <span key={i} style={{ color: i < Math.round(rating) ? '#f59e0b' : '#d1d5db', fontSize: 16 }}>★</span>
    ))

  // If a version is expanded, show its attachment; otherwise use article-level attachment
  const activeVersionId = verDetail ? selectedVer?.versionId : detail.currentVersionId
  const activeMimeType = verDetail?.attachmentMimeType || detail.attachmentMimeType
  const activeOriginalName = verDetail?.attachmentOriginalName || detail.attachmentOriginalName
  const activeSizeBytes = verDetail?.attachmentSizeBytes || detail.attachmentSizeBytes

  const content = verDetail || detail



  return (
    <>
      <div className="detail-header">
        <div className="text-muted" style={{ fontSize: 11, marginBottom: 4 }}>{detail.kbNumber}</div>
        <h2>{detail.title}</h2>
        <div className="detail-meta">
          {detail.categoryName && <span className="count-chip">{detail.categoryName}</span>}
          {detail.averageRating != null && (
            <span className="count-chip">⭐ {Number(detail.averageRating).toFixed(1)} ({detail.ratingCount} ratings)</span>
          )}
          {detail.tags?.map(t => <span key={t} className="tag">{t}</span>)}
          {detail.attachmentMimeType === 'application/pdf' && (
            <span className="count-chip" style={{ background: '#fee2e2', color: '#991b1b' }}>📄 PDF</span>
          )}
          {detail.attachmentMimeType?.startsWith('video/') && (
            <span className="count-chip" style={{ background: '#ede9fe', color: '#5b21b6' }}>🎬 Video</span>
          )}
        </div>
      </div>

      <div className="inner-tabs">
        <div className={`inner-tab ${activeTab === 'article' ? 'active' : ''}`} onClick={() => { setActiveTab('article'); setSelectedVer(null); setVerDetail(null) }}>
          Article
        </div>
        <div className={`inner-tab ${activeTab === 'versions' ? 'active' : ''}`} onClick={() => setActiveTab('versions')}>
          Versions ({versions.length})
        </div>
        <div className={`inner-tab ${activeTab === 'feedback' ? 'active' : ''}`} onClick={() => setActiveTab('feedback')}>
          Feedback ({feedback.length})
        </div>
      </div>

      <div className="detail-body">

        {/* ── Article tab ──────────────────────────────────────────────────── */}
        {activeTab === 'article' && (
          <>
            {/* Attachment — shown first and prominently for PDF/Video articles */}
            {activeOriginalName && (
              <AttachmentSection
                versionId={activeVersionId}
                mimeType={activeMimeType}
                originalName={activeOriginalName}
                sizeBytes={activeSizeBytes}
              />
            )}


            {detail.summary && (
              <div className="detail-section">
                <h4>Summary</h4>
                <div
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(detail.summary),
                  }}
                />
              </div>
            )}


            <div className="detail-section">
              <h4>Dates</h4>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                Created: {detail.createdAt}
                {detail.updatedAt && ` · Updated: ${detail.updatedAt}`}
                {detail.publishedAt && ` · Published: ${detail.publishedAt}`}
              </p>
            </div>
          </>
        )}

        {/* ── Versions tab ─────────────────────────────────────────────────── */}
        {activeTab === 'versions' && (
          <div className="timeline">
            {versions.length === 0 && <p className="text-muted">No versions available.</p>}
            {versions.map(v => (
              <div key={v.versionId} className="timeline-item" onClick={() => loadVersion(v)}>
                <div className={`tl-dot ${selectedVer?.versionId === v.versionId ? 'selected' : ''}`}>
                  {v.versionNumber}
                </div>
                <div className="tl-content">
                  <div className="tl-title">
                    v{v.versionNumber} – {v.title}
                    {v.isActiveVersion && (
                      <span style={{ marginLeft: 8, fontSize: 10, background: '#d1fae5', color: '#065f46', padding: '2px 7px', borderRadius: 20, fontWeight: 700 }}>
                        Current
                      </span>
                    )}
                    {v.attachmentOriginalName && (
                      <span style={{ marginLeft: 6, fontSize: 10, background: '#ede9fe', color: '#5b21b6', padding: '2px 7px', borderRadius: 20, fontWeight: 600 }}>
                        {v.attachmentMimeType?.startsWith('video/') ? '🎬' : '📄'} File
                      </span>
                    )}
                  </div>
                  <div className="tl-meta">
                    <span className="text-muted">{v.publishedAt || v.createdAt}</span>
                  </div>
                  {v.changeSummary && <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{v.changeSummary}</p>}

                  {/* Expanded version content */}
                  {selectedVer?.versionId === v.versionId && (
                    loadingVer ? (
                      <p className="text-muted mt-8">Loading...</p>
                    ) : verDetail ? (
                      <div className="version-detail-box">
                        {verDetail.attachmentOriginalName && (
                          <AttachmentSection
                            versionId={v.versionId}
                            mimeType={verDetail.attachmentMimeType}
                            originalName={verDetail.attachmentOriginalName}
                            sizeBytes={verDetail.attachmentSizeBytes}
                          />
                        )}
                        {hasContent(detail.summary) && (
                          <div className="detail-section">
                            <h4>Summary</h4>
                            <div
                              dangerouslySetInnerHTML={{ __html: detail.summary }}
                            />
                          </div>
                        )}

                        {/* {hasContent(verDetail.content) && <><h5>Content</h5><p>{verDetail.content}</p></>}
                        {hasContent(verDetail.resolutionSteps) && <><h5>Resolution Steps</h5><p>{verDetail.resolutionSteps}</p></>}
                        {hasContent(verDetail.symptoms) && <><h5>Symptoms</h5><p>{verDetail.symptoms}</p></>}
                        {hasContent(verDetail.rootCause) && <><h5>Root Cause</h5><p>{verDetail.rootCause}</p></>}
                        {hasContent(verDetail.workaround) && <><h5>Workaround</h5><p>{verDetail.workaround}</p></>} */}
                      </div>
                    ) : null
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'feedback' && (
          <>
            <FeedbackForm articleId={detail.id} userId={userId} onSubmitted={onFeedbackSubmitted} />
            <div className="divider" />
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>All Reviews ({feedback.length})</div>
            {feedback.length === 0 && <p className="text-muted">No feedback yet. Be the first to rate!</p>}
            {feedback.map(f => (
              <div key={f.id} className="feedback-item">
                <div className="feedback-meta">
                  <div className="star-row">{renderStars(f.rating)}</div>
                  <span className="text-muted">{f.isAnonymous ? 'Anonymous' : `User #${f.userId}`}</span>
                  <span className="text-muted">{f.createdAt}</span>
                </div>
                {f.comment && <p className="feedback-comment">{f.comment}</p>}
              </div>
            ))}
          </>
        )}
      </div>
    </>
  )
}

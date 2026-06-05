import React, { useState } from 'react'
import { getVersionById, getAttachmentDownloadUrl } from '../../api/kbApi'
import StatusBadge from '../StatusBadge'

function formatBytes(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// ── Attachment viewer for the support personnel panel ──────────────────────
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
        {isPdf ? '📄 PDF Attachment' : '🎬 Video Attachment'}
        <span style={{ fontWeight: 400, color: '#6b7280', fontSize: '12px', marginLeft: '8px' }}>
          {originalName}{sizeLabel ? ` · ${sizeLabel}` : ''}
        </span>
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

export default function ArticleDetailPanel({
  detail, versions, isDraft, isRejected, canAddVersion, hasDraftVersion, currentVersion,
  onEdit, onSubmitApproval, onNewVersion
}) {
  const [activeTab, setActiveTab] = useState('article')
  const [selectedVer, setSelectedVer] = useState(null)
  const [verDetail, setVerDetail] = useState(null)
  const [loadingVer, setLoadingVer] = useState(false)
  const status = detail.status?.toString()

  const canEdit = isDraft || hasDraftVersion
  const canSubmit = isDraft || hasDraftVersion
  const isNewVersionDraft = hasDraftVersion && !isDraft

  const loadVersion = async (v) => {
    if (selectedVer?.versionId === v.versionId) {
      setSelectedVer(null); setVerDetail(null); return
    }
    setSelectedVer(v)
    setLoadingVer(true)
    try {
      const res = await getVersionById(v.versionId)
      setVerDetail(res.data?.data || res.data)
    } catch {
      setVerDetail(null)
    }
    setLoadingVer(false)
  }

  return (
    <>
      <div className="detail-header">
        <div className="text-muted" style={{ fontSize: 11, marginBottom: 4 }}>{detail.kbNumber}</div>
        <h2>{detail.title}</h2>
        <div className="detail-meta">
          <StatusBadge status={status} />
          {detail.categoryName && <span className="count-chip">{detail.categoryName}</span>}
          <span className="count-chip">v{detail.currentVersionNumber || 1}</span>
          {detail.averageRating != null && (
            <span className="count-chip">⭐ {Number(detail.averageRating).toFixed(1)} ({detail.ratingCount})</span>
          )}
          {detail.attachmentMimeType === 'application/pdf' && (
            <span className="count-chip" style={{ background: '#fee2e2', color: '#991b1b' }}>📄 PDF</span>
          )}
          {detail.attachmentMimeType?.startsWith('video/') && (
            <span className="count-chip" style={{ background: '#ede9fe', color: '#5b21b6' }}>🎬 Video</span>
          )}
        </div>
      </div>

      {/* Rejected notice */}
      {isRejected && (
        <div style={{
          margin: '0 20px 0', padding: '10px 14px', background: '#fee2e2',
          borderRadius: 8, fontSize: 13, color: '#991b1b', borderLeft: '4px solid #ef4444',
        }}>
          This article was <strong>rejected</strong>. To resubmit, please create a new article with the
          corrected content using the <strong>New Article</strong> button.
        </div>
      )}

      {/* Under review notice */}
      {detail.status?.toString() === 'UNDER_REVIEW' && !hasDraftVersion && (
        <div style={{
          margin: '0 20px 12px', padding: '10px 14px', background: '#eff6ff',
          borderRadius: 8, fontSize: 13, color: '#1e40af', borderLeft: '4px solid #3b82f6',
        }}>
          This article is currently <strong>Under Review</strong> by the ITSM Manager.
          No edits can be made until a decision is reached.
        </div>
      )}

      {/* New version pending approval notice */}
      {isNewVersionDraft && (
        <div style={{
          margin: '0 20px 0', padding: '10px 14px', background: '#fef3c7',
          borderRadius: 8, fontSize: 13, color: '#92400e', borderLeft: '4px solid #f59e0b',
        }}>
          A new draft version <strong>v{currentVersion?.versionNumber}</strong> is pending submission.
          Review and click <strong>Submit for Approval</strong> to send it to the ITSM Manager.
          The current published version remains active until the new version is approved.
        </div>
      )}

      <div className="inner-tabs">
        <div
          className={`inner-tab ${activeTab === 'article' ? 'active' : ''}`}
          onClick={() => { setActiveTab('article'); setSelectedVer(null); setVerDetail(null) }}
        >
          Article
        </div>
        <div
          className={`inner-tab ${activeTab === 'versions' ? 'active' : ''}`}
          onClick={() => setActiveTab('versions')}
        >
          Version History ({versions.length})
        </div>
      </div>

      <div className="detail-body">

        {activeTab === 'article' && (
          <>
            {/* ── Attachment (PDF/Video) — shown above text fields ── */}
            {detail.attachmentOriginalName && (
              <AttachmentSection
                versionId={detail.currentVersionId}
                mimeType={detail.attachmentMimeType}
                originalName={detail.attachmentOriginalName}
                sizeBytes={detail.attachmentSizeBytes}
              />
            )}

            {/* {hasContent(detail.summary) && <div className="detail-section"><h4>Summary</h4><div dangerouslySetInnerHTML={{ __html: detail.summary }} /></div>} */}
            {/* {hasContent(detail.affectedService) && <div className="detail-section"><h4>Affected Service</h4><div dangerouslySetInnerHTML={{ __html: detail.affectedService }} /></div>}
            {hasContent(detail.symptoms) && <div className="detail-section"><h4>Symptoms</h4><div dangerouslySetInnerHTML={{ __html: detail.symptoms }} /></div>}
            {hasContent(detail.resolutionSteps) && <div className="detail-section"><h4>Resolution Steps</h4><div dangerouslySetInnerHTML={{ __html: detail.resolutionSteps }} /></div>}
            {hasContent(detail.rootCause) && <div className="detail-section"><h4>Root Cause</h4><div dangerouslySetInnerHTML={{ __html: detail.rootCause }} /></div>}
            {hasContent(detail.workaround) && <div className="detail-section"><h4>Workaround</h4><div dangerouslySetInnerHTML={{ __html: detail.workaround }} /></div>}
            {detail.referencesLinks?.trim() && <div className="detail-section"><h4>Reference Links</h4><p>{detail.referencesLinks}</p></div>}
            {detail.tags?.length > 0 && (
              <div className="detail-section">
                <h4>Tags</h4>
                <div className="tags">{detail.tags.map(t => <span key={t} className="tag">{t}</span>)}</div>
              </div>
            )} */}
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

        {activeTab === 'versions' && (
          <div className="timeline">
            {versions.length === 0 && <p className="text-muted">No versions found.</p>}
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
                        Active
                      </span>
                    )}
                    {v.attachmentOriginalName && (
                      <span style={{ marginLeft: 6, fontSize: 10, background: '#ede9fe', color: '#5b21b6', padding: '2px 7px', borderRadius: 20, fontWeight: 600 }}>
                        {v.attachmentMimeType?.startsWith('video/') ? '🎬' : '📄'} File
                      </span>
                    )}
                  </div>
                  <div className="tl-meta">
                    <StatusBadge status={v.state?.toString()} />
                    <span className="text-muted">{v.createdAt}</span>
                    <span className="text-muted">by Author #{v.authorId}</span>
                  </div>
                  {v.changeSummary && <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{v.changeSummary}</p>}
                  {v.rejectionReason && (
                    <p style={{ fontSize: 12, color: 'var(--danger)', background: '#fee2e2', padding: '5px 9px', borderRadius: 6, marginTop: 4 }}>
                      Rejected: {v.rejectionReason}
                    </p>
                  )}
                  {v.sentBackReason && (
                    <p style={{ fontSize: 12, color: '#92400e', background: '#fef3c7', padding: '5px 9px', borderRadius: 6, marginTop: 4 }}>
                      Sent back: {v.sentBackReason}
                    </p>
                  )}

                  {selectedVer?.versionId === v.versionId && (
                    loadingVer ? (
                      <p className="text-muted mt-8">Loading version...</p>
                    ) : verDetail ? (
                      <div className="version-detail-box">
                        {hasContent(verDetail.summary) && <><h5>Summary</h5><div dangerouslySetInnerHTML={{ __html: verDetail.summary }} /></>}
                        {/* {hasContent(verDetail.resolutionSteps) && <><h5>Resolution Steps</h5><div dangerouslySetInnerHTML={{ __html: verDetail.resolutionSteps }} /></>}
                        {hasContent(verDetail.symptoms) && <><h5>Symptoms</h5><div dangerouslySetInnerHTML={{ __html: verDetail.symptoms }} /></>}
                        {hasContent(verDetail.rootCause) && <><h5>Root Cause</h5><div dangerouslySetInnerHTML={{ __html: verDetail.rootCause }} /></>}
                        {hasContent(verDetail.workaround) && <><h5>Workaround</h5><div dangerouslySetInnerHTML={{ __html: verDetail.workaround }} /></>} */}
                      </div>
                    ) : null
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="detail-actions">
        {canEdit && (
          <button className="btn btn-outline" onClick={onEdit}>
            ✏ {isNewVersionDraft ? `Edit v${currentVersion?.versionNumber} Draft` : 'Edit Draft'}
          </button>
        )}
        {canSubmit && (
          <button className="btn btn-primary" onClick={onSubmitApproval}>
            {isNewVersionDraft ? `Submit v${currentVersion?.versionNumber} for Approval` : 'Submit for Approval'}
          </button>
        )}
        {canAddVersion && !hasDraftVersion && (
          <button className="btn btn-outline" onClick={onNewVersion}>+ New Version</button>
        )}
      </div>
    </>
  )
}

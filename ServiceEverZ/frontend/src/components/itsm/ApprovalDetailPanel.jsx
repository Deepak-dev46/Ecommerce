import React, { useState } from 'react';
import { decideApproval, getVersionById, getAttachmentDownloadUrl } from '../../api/kbApi';
import StatusBadge from '../../components/StatusBadge';
import toast from '../../utils/toast';

// ── Attachment preview helpers ─────────────────────────────────────────────
function AttachmentSection({ versionId, mimeType, originalName, sizeBytes }) {
  if (!originalName || !versionId) return null;

  const isPdf = mimeType === 'application/pdf';
  const isVideo = mimeType?.startsWith('video/');
  if (!isPdf && !isVideo) return null;

  const downloadUrl = getAttachmentDownloadUrl(versionId);
  const sizeLabel = sizeBytes ? formatBytes(sizeBytes) : '';
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await fetch(downloadUrl);
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = originalName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Failed to download file. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="detail-section">
      <h4>
        {isPdf ? '📄 PDF Attachment' : '🎬 Video Attachment'}
        <span style={{ fontWeight: 400, color: '#6b7280', fontSize: '12px', marginLeft: '8px' }}>
          {originalName}{sizeLabel ? ` · ${sizeLabel}` : ''}
        </span>
      </h4>

      {/* Download button — triggers only on click, no auto-download */}
      <div style={{ marginTop: '10px' }}>
        <button
          onClick={handleDownload}
          disabled={downloading}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            background: downloading ? '#93c5fd' : '#2563eb',
            color: '#fff',
            borderRadius: '7px',
            fontSize: '13px',
            fontWeight: 600,
            border: 'none',
            cursor: downloading ? 'not-allowed' : 'pointer',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => { if (!downloading) e.currentTarget.style.background = '#1d4ed8'; }}
          onMouseLeave={e => { if (!downloading) e.currentTarget.style.background = '#2563eb'; }}
        >
          {downloading ? '⏳ Downloading…' : `⬇ Download ${isPdf ? 'PDF' : 'Video'} for Verification`}
        </button>
      </div>
    </div>
  );
}

// ── Small inline download button for version history ──────────────────────
function VersionDownloadButton({ versionId, originalName }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async (e) => {
    e.stopPropagation();
    setDownloading(true);
    try {
      const res = await fetch(getAttachmentDownloadUrl(versionId));
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = originalName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      // silent — user can retry
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div style={{ marginTop: 8 }}>
      <button
        onClick={handleDownload}
        disabled={downloading}
        style={{
          fontSize: 12, color: '#2563eb', background: 'none', border: 'none',
          cursor: downloading ? 'not-allowed' : 'pointer', textDecoration: 'underline', padding: 0,
        }}
      >
        {downloading ? '⏳ Downloading…' : `⬇ Download ${originalName}`}
      </button>
    </div>
  );
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function hasContent(html) {
  if (!html) return false;
  const text = html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
  return text.length > 0;
}

//
export default function ApprovalDetailPanel({ detail, versions, approverId, onDecisionMade }) {
  const [activeTab, setActiveTab] = useState('article');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedVer, setSelectedVer] = useState(null);
  const [verDetail, setVerDetail] = useState(null);
  const [loadingVer, setLoadingVer] = useState(false);

  const status = detail.status?.toString();
  const canDecide = status === 'UNDER_REVIEW';
  const inReviewVersion = versions.find(v => v.state?.toString() === 'IN_REVIEW');

  // Show IN_REVIEW version content so the manager reviews what was actually submitted
  const reviewContent = inReviewVersion || detail;
  const isNewVersionReview = inReviewVersion && inReviewVersion.versionNumber > 1;

  // Determine if the submitted version is a file-type article
  const hasAttachment = !!(
    (inReviewVersion?.attachmentOriginalName) ||
    (detail.attachmentOriginalName && !inReviewVersion)
  );
  const attachmentVersionId = inReviewVersion?.versionId || detail.currentVersionId;
  const attachmentOriginalName = inReviewVersion?.attachmentOriginalName || detail.attachmentOriginalName;
  const attachmentMimeType = inReviewVersion?.attachmentMimeType || detail.attachmentMimeType;
  const attachmentSizeBytes = inReviewVersion?.attachmentSizeBytes || detail.attachmentSizeBytes;

  const decide = async (decision) => {
    console.log(approverId);
    
    
    if (!inReviewVersion) {
      toast.warning('No version is currently IN_REVIEW.');
      return;
    }
    if (!approverId) {
      toast.error('Approver ID is missing. Please log out and log back in.');
      return;
    }
    if (!comment.trim() && (decision === 'REJECTED' || decision === 'SENT_BACK')) {
      toast.warning('A comment is required for Reject / Send Back.');
      return;
    }
    setSubmitting(true);
    try {
      console.log(approverId);
      
      // Ensure approverId is sent as a number (Long), not a string
      await decideApproval(inReviewVersion.versionId, {
        approverId: Number(approverId),
        status: decision,
        comments: comment,
      });
      toast.success(`Decision "${decision}" saved successfully!`);
      onDecisionMade();
    } catch (e) {
      console.log(e);
      console.log(approverId);
      
      // Backend returns either `message` (string) or `messages` (array) depending on exception type
      const errData = e.response?.data;
      const errMsg =
        errData?.message ||
        (Array.isArray(errData?.messages) ? errData.messages.join('; ') : null) ||
        'Failed to save decision. Please try again.';
      toast.error(errMsg);
    }
    setSubmitting(false);
  };

  const loadVersion = async (v) => {
    if (selectedVer?.versionId === v.versionId) {
      setSelectedVer(null); setVerDetail(null); return;
    }
    setSelectedVer(v); setLoadingVer(true);
    try {
      const res = await getVersionById(v.versionId);
      setVerDetail(res.data?.data || res.data);
    } catch {
      setVerDetail(null);
    }
    setLoadingVer(false);
  };

  return (
    <>
      <div className="detail-header">
        <div className="text-muted" style={{ fontSize: 11, marginBottom: 4 }}>{detail.kbNumber}</div>
        <h2>{detail.title}</h2>
        <div className="detail-meta">
          <StatusBadge status={status} />
          {detail.categoryName && <span className="count-chip">{detail.categoryName}</span>}
          <span className="count-chip">v{inReviewVersion?.versionNumber ?? detail.currentVersionNumber ?? 1}</span>
          
          {(detail.creationType === 'PDF' || attachmentMimeType === 'application/pdf') && (
            <span className="count-chip" style={{ background: '#fee2e2', color: '#991b1b' }}>📄 PDF</span>
          )}
          {(detail.creationType === 'VIDEO' || attachmentMimeType?.startsWith('video/')) && (
            <span className="count-chip" style={{ background: '#ede9fe', color: '#5b21b6' }}>🎬 Video</span>
          )}
        </div>
      </div>

      <div className="inner-tabs">
        <div
          className={`inner-tab ${activeTab === 'article' ? 'active' : ''}`}
          onClick={() => { setActiveTab('article'); setSelectedVer(null); setVerDetail(null); }}
        >
          Article
        </div>
        <div
          className={`inner-tab ${activeTab === 'versions' ? 'active' : ''}`}
          onClick={() => setActiveTab('versions')}
        >
          Versions ({versions.length})
        </div>
      </div>

      <div className="detail-body">
        {activeTab === 'article' && (
          <>
            {/* Show the version under review */}
            {isNewVersionReview && (
              <div style={{
                margin: '0 0 12px 0', padding: '8px 14px',
                background: '#eff6ff', borderRadius: 8, fontSize: 13,
                color: '#1e40af', borderLeft: '4px solid #3b82f6',
              }}>
                Reviewing <strong>v{inReviewVersion.versionNumber}</strong> submitted for approval.
                {inReviewVersion.changeSummary && (
                  <span> Change summary: <em>{inReviewVersion.changeSummary}</em></span>
                )}
              </div>
            )}

            {/* ── File attachment section (PDF / Video) — shown prominently for manager review ── */}
            {hasAttachment && (
              <AttachmentSection
                versionId={attachmentVersionId}
                mimeType={attachmentMimeType}
                originalName={attachmentOriginalName}
                sizeBytes={attachmentSizeBytes}
              />
            )}


            {/* Text content fields — shown for FORM articles */}
            {hasContent(detail.summary) && <div className="detail-section"><h4>Summary</h4><div dangerouslySetInnerHTML={{ __html: detail.summary }} /></div>}
            {/* {hasContent(reviewContent.affectedService) && <div className="detail-section"><h4>Affected Service</h4><div dangerouslySetInnerHTML={{ __html: reviewContent.affectedService }} /></div>}
            {hasContent(reviewContent.symptoms) && <div className="detail-section"><h4>Symptoms</h4><div dangerouslySetInnerHTML={{ __html: reviewContent.symptoms }} /></div>}
            {hasContent(reviewContent.content) && <div className="detail-section"><h4>Content</h4><div dangerouslySetInnerHTML={{ __html: reviewContent.content }} /></div>}
            {hasContent(reviewContent.resolutionSteps) && <div className="detail-section"><h4>Resolution Steps</h4><div dangerouslySetInnerHTML={{ __html: reviewContent.resolutionSteps }} /></div>}
            {hasContent(reviewContent.rootCause) && <div className="detail-section"><h4>Root Cause</h4><div dangerouslySetInnerHTML={{ __html: reviewContent.rootCause }} /></div>}
            {hasContent(reviewContent.workaround) && <div className="detail-section"><h4>Workaround</h4><div dangerouslySetInnerHTML={{ __html: reviewContent.workaround }} /></div>} */}

            <div className="detail-section">
              <h4>Dates</h4>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                Created: {detail.createdAt}
                {detail.updatedAt && ` · Updated: ${detail.updatedAt}`}
                {detail.publishedAt && ` · Published: ${detail.publishedAt}`}
              </p>
            </div>

            {detail.tags?.length > 0 && (
              <div className="detail-section">
                <h4>Tags</h4>
                <div className="tags">{detail.tags.map(t => <span key={t} className="tag">{t}</span>)}</div>
              </div>
            )}

            {!canDecide && (
              <div style={{
                margin: '0 0 12px 0', padding: '8px 14px', background: '#f0fdf4',
                borderRadius: 8, fontSize: 13, color: '#166534', borderLeft: '4px solid #22c55e',
              }}>
                This article has no pending version. No approval decision is required at this time.
              </div>
            )}
            {canDecide && (
              <div className="detail-section">
                <h4>Your Decision</h4>
                {!inReviewVersion && (
                  <div className="alert-warn">No IN_REVIEW version found for this article.</div>
                )}

                {/* Reminder for file-type articles */}
                {hasAttachment && inReviewVersion && (
                  <div style={{
                    padding: '8px 14px', background: '#fef3c7', borderRadius: '7px',
                    borderLeft: '4px solid #f59e0b', fontSize: '13px', color: '#92400e', marginBottom: '10px',
                  }}>
                    ⚠ Please download and verify the {attachmentMimeType?.startsWith('video/') ? 'video' : 'PDF'} file above before making your approval decision.
                  </div>
                )}

                <div className="comment-box">
                  <textarea
                    placeholder="Add comments (required for Reject / Send Back)..."
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                  />
                </div>
              </div>
            )}
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
                    <span className="text-muted">Author #{v.authorId}</span>
                  </div>
                  {v.changeSummary && <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{v.changeSummary}</p>}
                  {v.rejectionReason && (
                    <p style={{ fontSize: 12, color: 'var(--danger)', background: '#fee2e2', padding: '5px 9px', borderRadius: 6, marginTop: 4 }}>
                      {v.rejectionReason}
                    </p>
                  )}
                  {v.sentBackReason && (
                    <p style={{ fontSize: 12, color: '#92400e', background: '#fef3c7', padding: '5px 9px', borderRadius: 6, marginTop: 4 }}>
                      {v.sentBackReason}
                    </p>
                  )}
                  {v.approvedAt && (
                    <p style={{ fontSize: 12, color: 'var(--success)', marginTop: 4 }}>
                      ✓ Approved at {v.approvedAt} by Manager #{v.approvedBy}
                    </p>
                  )}

                  {/* Version download button */}
                  {v.attachmentOriginalName && selectedVer?.versionId === v.versionId && (
                    <VersionDownloadButton
                      versionId={v.versionId}
                      originalName={v.attachmentOriginalName}
                    />
                  )}

                  {selectedVer?.versionId === v.versionId && (
                    loadingVer ? (
                      <p className="text-muted mt-8">Loading...</p>
                    ) : verDetail ? (
                      <div className="version-detail-box">
                        {hasContent(verDetail.summary) && <><h5>Summary</h5><div dangerouslySetInnerHTML={{ __html: verDetail.summary }} /></>}
                        {hasContent(verDetail.content) && <><h5>Content</h5><div dangerouslySetInnerHTML={{ __html: verDetail.content }} /></>}
                        {hasContent(verDetail.resolutionSteps) && <><h5>Resolution Steps</h5><div dangerouslySetInnerHTML={{ __html: verDetail.resolutionSteps }} /></>}
                        {hasContent(verDetail.symptoms) && <><h5>Symptoms</h5><div dangerouslySetInnerHTML={{ __html: verDetail.symptoms }} /></>}
                        {hasContent(verDetail.rootCause) && <><h5>Root Cause</h5><div dangerouslySetInnerHTML={{ __html: verDetail.rootCause }} /></>}
                        {hasContent(verDetail.workaround) && <><h5>Workaround</h5><div dangerouslySetInnerHTML={{ __html: verDetail.workaround }} /></>}
                      </div>
                    ) : null
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {canDecide && activeTab === 'article' && (
        <div className="detail-actions">
          <button className="btn btn-success" disabled={submitting || !inReviewVersion} onClick={() => decide('APPROVED')}>
            ✓ Approve
          </button>
          <button className="btn btn-warning" disabled={submitting || !inReviewVersion} onClick={() => decide('SENT_BACK')}>
            ↩ Send Back
          </button>
          <button className="btn btn-danger" disabled={submitting || !inReviewVersion} onClick={() => decide('REJECTED')}>
            ✗ Reject
          </button>
        </div>
      )}
    </>
  );
}





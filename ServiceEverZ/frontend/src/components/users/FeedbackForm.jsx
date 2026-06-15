import React, { useState } from 'react'
import { submitFeedback } from '../../api/kbApi'

const LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent']

export default function FeedbackForm({ articleId, userId, onSubmitted }) {
  const [rating,   setRating]   = useState(0)
  const [hover,    setHover]    = useState(0)
  const [comment,  setComment]  = useState('')
  const [anon,     setAnon]     = useState(false)
  const [saving,   setSaving]   = useState(false)
  const [done,     setDone]     = useState(false)
  const [errors,   setErrors]   = useState({})   // ← inline errors (no alert())

  /* ── clear individual error on interaction ─────────────────── */
  const clearErr = (key) => setErrors(prev => ({ ...prev, [key]: '' }))

  const handleRating = (s) => {
    setRating(s)
    clearErr('rating')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // ── inline validation ──────────────────────────────────────
    const newErrors = {}
    if (!rating) newErrors.rating = 'Please select a rating before submitting.'
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }

    if (!userId && !anon) setAnon(true)
    setSaving(true)

    try {
      await submitFeedback(articleId, {
        userId: anon ? null : userId,
        rating,
        comment: comment.trim() || null,
        isAnonymous: anon,
      })
      setDone(true)
      onSubmitted()
    } catch (err) {
      setErrors({ submit: err.response?.data?.message || 'Error submitting feedback. Please try again.' })
    }
    setSaving(false)
  }

  if (done) return <div className="alert-success">✓ Thank you for your feedback!</div>

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 16 }}>
      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 10 }}>Rate this article</div>

      {/* Star rating */}
      <div className="star-row" style={{ marginBottom: 4 }}>
        {[1, 2, 3, 4, 5].map(s => (
          <span
            key={s}
            className={`star ${s <= (hover || rating) ? 'filled' : 'empty'}`}
            onMouseEnter={() => setHover(s)}
            onMouseLeave={() => setHover(0)}
            onClick={() => handleRating(s)}
          >★</span>
        ))}
        {rating > 0 && (
          <span style={{ marginLeft: 10, fontSize: 13, color: 'var(--text-secondary)' }}>
            {LABELS[rating]}
          </span>
        )}
      </div>

      {/* Inline rating error */}
      {errors.rating && (
        <span className="inline-error" style={{ marginBottom: 8 }}>
          {errors.rating}
        </span>
      )}

      <textarea
        placeholder="Share your experience (optional)..."
        value={comment}
        onChange={e => setComment(e.target.value)}
        rows={3}
        style={{
          width: '100%', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
          padding: '9px 12px', fontSize: 14, fontFamily: 'var(--font)',
          outline: 'none', resize: 'vertical', marginBottom: 10, marginTop: 8
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer' }}>
          <input type="checkbox" checked={anon} onChange={e => setAnon(e.target.checked)} />
          Submit anonymously
        </label>
      </div>

      {!userId && (
        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>
          You are not logged in. Your feedback will be submitted anonymously.
        </div>
      )}

      {/* Submit-level error */}
      {errors.submit && (
        <span className="inline-error" style={{ marginBottom: 10 }}>
          {errors.submit}
        </span>
      )}

      <button className="btn btn-primary btn-sm" type="submit" disabled={saving}>
        {saving ? 'Submitting...' : 'Submit Feedback'}
      </button>
    </form>
  )
}

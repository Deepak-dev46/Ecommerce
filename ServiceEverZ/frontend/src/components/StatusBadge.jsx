import React from 'react'
export default function StatusBadge({ status }) {
  return <span className={`badge-status badge-${status}`}>{status?.replace('_',' ')}</span>
}

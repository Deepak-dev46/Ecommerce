// src/components/reports/ReportList.jsx
import React from 'react';
import { getReportsByCategory } from '../../utils/reportMappings';

const ReportList = ({ category, selectedReportId, onSelect }) => {
  const reports = getReportsByCategory(category);

  if (!category) {
    return (
      <div className="rpt-no-category">
        <svg
          style={{ width: 32, height: 32, marginBottom: 8, opacity: 0.35 }}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
        <p>Select a category to see available reports.</p>
      </div>
    );
  }

  if (!reports.length) {
    return (
      <div className="rpt-no-category">
        <p>No reports found for this category.</p>
      </div>
    );
  }

  return (
    <div className="rpt-report-list" role="listbox" aria-label="Available reports">
      <span className="rpt-label" style={{ padding: '0 4px' }}>
        Available Reports ({reports.length})
      </span>
      {reports.map((report) => (
        <button
          key={report.id}
          role="option"
          aria-selected={selectedReportId === report.id}
          className={`rpt-report-item ${selectedReportId === report.id ? 'active' : ''}`}
          onClick={() => onSelect(report)}
          title={report.description}
        >
          <span className="rpt-report-item-dot" />
          <span className="rpt-report-item-label">{report.label}</span>
        </button>
      ))}
    </div>
  );
};

export default ReportList;

import React from 'react';
import { Chip } from '@mui/material';
 
const STATUS_MAP = {
  AVAILABLE:             { label: 'Available',           color: '#24A148', bg: '#E8F5E9' },
  ASSIGNED:              { label: 'Assigned',            color: '#27235C', bg: '#EDEDF7' },
  UNDER_MAINTENANCE:     { label: 'Under Maintenance',   color: '#E2B93B', bg: '#FFF8E1' },
  RETIRED:               { label: 'Retired',             color: '#666',    bg: '#F5F5F5' },
  LOST:                  { label: 'Lost',                color: '#E01950', bg: '#FDEEF2' },
  RETURNED_TO_VENDOR:    { label: 'Returned to Vendor',  color: '#97247E', bg: '#F9EEF7' },
};
 
const MAPPING_STATUS_MAP = {
  PENDING_SP_APPROVAL:                    { label: 'Pending SP',           color: '#E2B93B', bg: '#FFF8E1' },
  PENDING_MANAGER_APPROVAL:              { label: 'Pending Manager',       color: '#E2B93B', bg: '#FFF8E1' },
  ADDITIONAL_DETAILS_REQUESTED_BY_SP:    { label: 'Info Needed (SP)',      color: '#97247E', bg: '#F9EEF7' },
  ADDITIONAL_DETAILS_REQUESTED_BY_MANAGER:{ label: 'Info Needed (Mgr)',   color: '#97247E', bg: '#F9EEF7' },
  SP_APPROVED:                           { label: 'SP Approved',           color: '#24A148', bg: '#E8F5E9' },
  MANAGER_APPROVED:                      { label: 'Manager Approved',      color: '#24A148', bg: '#E8F5E9' },
  REJECTED_BY_SP:                        { label: 'Rejected by SP',        color: '#E01950', bg: '#FDEEF2' },
  REJECTED_BY_MANAGER:                   { label: 'Rejected by Manager',   color: '#E01950', bg: '#FDEEF2' },
  ACTIVE:                                { label: 'Active',                color: '#27235C', bg: '#EDEDF7' },
  RELEASED:                              { label: 'Released',              color: '#666',    bg: '#F5F5F5' },
};
 
export function AssetStatusChip({ status }) {
  const cfg = STATUS_MAP[status] || { label: status, color: '#666', bg: '#F5F5F5' };
  return (
    <Chip
      label={cfg.label}
      size="small"
      sx={{ color: cfg.color, backgroundColor: cfg.bg, fontWeight: 600, fontSize: '0.7rem', border: `1px solid ${cfg.color}22` }}
    />
  );
}
 
export function MappingStatusChip({ status }) {
  const cfg = MAPPING_STATUS_MAP[status] || { label: status, color: '#666', bg: '#F5F5F5' };
  return (
    <Chip
      label={cfg.label}
      size="small"
      sx={{ color: cfg.color, backgroundColor: cfg.bg, fontWeight: 600, fontSize: '0.7rem', border: `1px solid ${cfg.color}22` }}
    />
  );
}
 
export function OwnershipChip({ type }) {
  const isRental = type === 'RENTAL';
  return (
    <Chip
      label={isRental ? 'Rental' : 'Owned'}
      size="small"
      sx={{
        color: isRental ? '#97247E' : '#27235C',
        backgroundColor: isRental ? '#F9EEF7' : '#EDEDF7',
        fontWeight: 600,
        fontSize: '0.7rem',
      }}
    />
  );
}
 
 
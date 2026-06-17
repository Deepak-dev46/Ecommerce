import { Chip } from '@mui/material';
 
const STATUS_CONFIG = {
  AVAILABLE:            { label: 'Available',            color: '#24A148', bg: '#EDFAF2' },
  ASSIGNED:             { label: 'Assigned',             color: '#27235C', bg: '#EEEDF8' },
  UNDER_MAINTENANCE:    { label: 'Under Maintenance',    color: '#E2B93B', bg: '#FDF8EC' },
  RETIRED:              { label: 'Retired',              color: '#666666', bg: '#F4F4F4' },
  LOST:                 { label: 'Lost',                 color: '#E01950', bg: '#FDEDF2' },
  RETURNED_TO_VENDOR:   { label: 'Returned to Vendor',   color: '#97247E', bg: '#F9EEFA' },
};
 
const MAPPING_STATUS_CONFIG = {
  PENDING_SP_APPROVAL:                     { label: 'Pending SP Approval',      color: '#E2B93B', bg: '#FDF8EC' },
  PENDING_MANAGER_APPROVAL:                { label: 'Pending Manager Approval',  color: '#E2B93B', bg: '#FDF8EC' },
  ADDITIONAL_DETAILS_REQUESTED_BY_SP:      { label: 'Details Requested (SP)',    color: '#97247E', bg: '#F9EEFA' },
  ADDITIONAL_DETAILS_REQUESTED_BY_MANAGER: { label: 'Details Requested (Mgr)',   color: '#97247E', bg: '#F9EEFA' },
  SP_APPROVED:                             { label: 'SP Approved',               color: '#24A148', bg: '#EDFAF2' },
  MANAGER_APPROVED:                        { label: 'Manager Approved',          color: '#24A148', bg: '#EDFAF2' },
  REJECTED_BY_SP:                          { label: 'Rejected by SP',            color: '#E01950', bg: '#FDEDF2' },
  REJECTED_BY_MANAGER:                     { label: 'Rejected by Manager',       color: '#E01950', bg: '#FDEDF2' },
  ACTIVE:                                  { label: 'Active',                    color: '#24A148', bg: '#EDFAF2' },
  RELEASED:                                { label: 'Released',                  color: '#666666', bg: '#F4F4F4' },
};
 
export function AssetStatusChip({ status }) {
  const c = STATUS_CONFIG[status] ?? { label: status ?? 'Unknown', color: '#666', bg: '#F4F4F4' };
  return (
    <Chip
      label={c.label}
      size="small"
      sx={{ backgroundColor: c.bg, color: c.color, fontWeight: 700, fontSize: '0.68rem', height: 19 }}
    />
  );
}
 
export function MappingStatusChip({ status }) {
  const c = MAPPING_STATUS_CONFIG[status] ?? { label: status ?? 'Unknown', color: '#666', bg: '#F4F4F4' };
  return (
    <Chip
      label={c.label}
      size="small"
      sx={{ backgroundColor: c.bg, color: c.color, fontWeight: 700, fontSize: '0.68rem', height: 19 }}
    />
  );
}
 
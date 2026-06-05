import { Chip } from '@mui/material';

const config = {
  OPEN:        { label: 'Open',        color: '#524F7D', bg: '#EEEDFB' },
  IN_PROGRESS: { label: 'In Progress', color: '#E2B93B', bg: '#FDF8EC' },
  ON_HOLD:     { label: 'On Hold',     color: '#A9A7BE', bg: '#F4F4F6' },
  RESOLVED:    { label: 'Resolved',    color: '#24A148', bg: '#EDFAF2' },
  CLOSED:      { label: 'Closed',      color: '#666666', bg: '#F4F4F4' },
  REOPENED:    { label: 'Reopened',    color: '#97247E', bg: '#F8EDFB' },
  CANCELLED:   { label: 'Cancelled',   color: '#DC2626', bg: '#FEF2F2' },
};

export default function TicketStatusChip({ status }) {
  const c = config[status] ?? { label: status ?? 'Unknown', color: '#666', bg: '#F4F4F4' };
  return (
    <Chip
      label={c.label}
      size="small"
      sx={{ backgroundColor: c.bg, color: c.color, fontWeight: 700, fontSize: '0.7rem', height: 22 }}
    />
  );
}

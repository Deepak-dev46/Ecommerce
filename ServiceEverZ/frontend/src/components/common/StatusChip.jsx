import { Chip } from '@mui/material';
 
const config = {
  ACTIVE: { label: 'Active', color: '#24A148', bg: '#EDFAF2' },
  DISABLED: { label: 'Disabled', color: '#E01950', bg: '#FDEDF2' },
  PENDINGACTIVATION: { label: 'Pending Activation', color: '#E2B93B', bg: '#FDF8EC' }, // ✅ remove underscore
};
 
export default function StatusChip({ status }) {
  const c = config[status] ?? { label: status, color: '#666666', bg: '#F4F4F4' }; // ✅ fallback shows raw value
  return (
    <Chip label={c.label} size="small"
      sx={{ backgroundColor: c.bg, color: c.color, fontWeight: 700, fontSize: '0.7rem', height: 22 }} />
  );
}
 
 
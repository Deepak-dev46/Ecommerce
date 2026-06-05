/**
 * Centralized toast utility
 * Uses react-toastify with custom attractive styling.
 */
import { toast } from 'react-toastify';
 
const baseStyle = {
  borderRadius: '12px',
  fontSize: '0.875rem',
  fontWeight: 500,
  boxShadow: '0 8px 32px rgba(0,0,0,0.22)',
  padding: '12px 16px',
  minWidth: '280px',
};
 
const baseOpts = {
  position: 'top-right',
  autoClose: 3500,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};
 
const showSuccess = (msg) =>
  toast.success(msg, {
    ...baseOpts,
    style: { ...baseStyle, background: 'linear-gradient(135deg, #1a7a4a 0%, #27AE60 100%)', color: '#fff' },
    progressStyle: { background: 'rgba(255,255,255,0.45)' },
  });
 
const showError = (msg) =>
  toast.error(msg, {
    ...baseOpts,
    autoClose: 4500,
    style: { ...baseStyle, background: 'linear-gradient(135deg, #9B1535 0%, #E01950 100%)', color: '#fff' },
    progressStyle: { background: 'rgba(255,255,255,0.45)' },
  });
 
const showWarning = (msg) =>
  toast.warning(msg, {
    ...baseOpts,
    style: { ...baseStyle, background: 'linear-gradient(135deg, #a05000 0%, #F39C12 100%)', color: '#fff' },
    progressStyle: { background: 'rgba(255,255,255,0.45)' },
  });
 
const showInfo = (msg) =>
  toast.info(msg, {
    ...baseOpts,
    style: { ...baseStyle, background: 'linear-gradient(135deg, #27235C 0%, #5B54C0 100%)', color: '#fff' },
    progressStyle: { background: 'rgba(255,255,255,0.45)' },
  });
 
// API mirrors react-hot-toast so existing code works without changes
const t = {
  success: showSuccess,
  error:   showError,
  warning: showWarning,
  info:    showInfo,
};
 
export default t;
 
 
// FILE: src/components/layout/Sidebar.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Drawer, List, ListItem, ListItemIcon, ListItemText,
  Tooltip, Typography, Divider, useMediaQuery, useTheme, Avatar, Chip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  AdminPanelSettings as RoleIcon,
  Security as SecurityIcon,
  FolderSpecial as ProjectIcon,
  ManageAccounts as ManageAccountsIcon,
  Groups as ResourceIcon,
  ConfirmationNumber as TicketIcon,
  Category as CatalogIcon,
  CheckCircle as ApprovalIcon,
  Inbox as MyTicketsIcon,
  Create as CreateIcon,
  Speed as SlaIcon,
  MergeType as MergeTypeIcon,
  BarChart as ReportsIcon,
} from '@mui/icons-material';
import LayersIcon from '@mui/icons-material/Layers';
import InventoryIcon from '@mui/icons-material/Inventory';
import StorageIcon from '@mui/icons-material/Storage';
import HistoryIcon from '@mui/icons-material/History';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SchoolIcon from '@mui/icons-material/School';
import LocalPoliceIcon from '@mui/icons-material/LocalPolice';
import PublishedWithChangesIcon from '@mui/icons-material/PublishedWithChanges';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import FeedbackIcon from '@mui/icons-material/Feedback';
import TuneIcon from '@mui/icons-material/Tune'; // ✅ CHANGE 4\


import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import SupportCreateTicketModal from '../../pages/support/SupportCreateTicketModal';
import { userAxios } from '../../api/axiosInstance';

export const SIDEBAR_WIDTH = 260;
export const COLLAPSED_W = 72;

const fontStack = '"Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", sans-serif';

// ── Nav configs ✅ CHANGE 3 — featureKey added to every item ─────────────────

const ADMIN_NAV = [
  { label: 'Dashboard', icon: DashboardIcon, path: '/dashboard', featureKey: 'ADMIN_DASHBOARD' },
  { label: 'User management', icon: PeopleIcon, path: '/users', featureKey: 'ADMIN_USERS' },
  { label: 'Role management', icon: RoleIcon, path: '/roles', featureKey: 'ADMIN_ROLES' },
  { label: 'Password policy', icon: SecurityIcon, path: '/password-policy', featureKey: 'ADMIN_PASSWORD' },
  { label: 'Reports', icon: AssessmentIcon, path: '/report', featureKey: 'ADMIN_REPORTS' },
  { label: 'Feature control', icon: TuneIcon, path: '/feature-control', featureKey: 'ADMIN_FEAT_CTRL' },
];

const RMO_NAV = [
  { label: 'RMO Overview', icon: ManageAccountsIcon, path: '/rmo/dashboard', featureKey: 'RMO_DASHBOARD' },
  { label: 'Projects', icon: ProjectIcon, path: '/rmo/projects', featureKey: 'RMO_PROJECTS' },
  { label: 'Resources', icon: ResourceIcon, path: '/rmo/resources', featureKey: 'RMO_RESOURCES' },
];

const END_USER_NAV = [
  { label: 'Dashboard', icon: DashboardIcon, path: '/user/dashboard', featureKey: 'EU_DASHBOARD' },
  { label: 'Create ticket', icon: CreateIcon, path: '/user/service-catalog', featureKey: 'EU_CREATE_TICKET' },
  { label: 'My tickets', icon: MyTicketsIcon, path: '/user/tickets', featureKey: 'EU_MY_TICKETS' },
  { label: 'Drafts', icon: HistoryIcon, path: '/user/drafts', featureKey: 'EU_DRAFTS' },
  { label: 'Knowledge base', icon: CatalogIcon, path: '/user/knowledgebase', featureKey: 'EU_KB' },
];

const ITSM_NAV = [
  { label: 'Dashboard', icon: DashboardIcon, path: '/itsm/overview', featureKey: 'ITSM_DASHBOARD' },
  { label: 'My tickets', icon: TicketIcon, path: '/itsm/Mytickets', featureKey: 'ITSM_TICKETS' },
  { label: 'Feedback', icon: FeedbackIcon, path: '/itsm/dashboard', featureKey: 'ITSM_FEEDBACK' },
  { label: 'All tickets', icon: TicketIcon, path: '/itsm/tickets', featureKey: 'ITSM_TICKETS' },
  { label: 'Manual assign', icon: ApprovalIcon, path: '/itsm/assign', featureKey: 'ITSM_ASSIGN' },
  { label: 'Monitor Tickets', icon: AssessmentIcon, path: '/itsm/monitor', featureKey: 'ITSM_MONITOR' },
  { label: 'Service catalog', icon: CatalogIcon, path: '/itsm/manage/service-catalog', featureKey: 'ITSM_CATALOG' },
  { label: 'Create request', icon: CreateIcon, path: '/itsm/service-catalog', featureKey: 'ITSM_CATALOG' },
  { label: 'SLA management', icon: SlaIcon, path: '/itsm/sla', featureKey: 'ITSM_SLA' },
  { label: 'Asset management', icon: ManageAccountsIcon, path: '/itsm/asset-approval', featureKey: 'ITSM_ASSETS' },
  { label: 'Problem management', icon: SchoolIcon, path: '/itsm/problem-management', featureKey: 'ITSM_PROBLEMS' },
  { label: 'Knowledge base', icon: SchoolIcon, path: '/itsm/knowledgebase', featureKey: 'ITSM_KB' },
  { label: 'Retention policies', icon: LocalPoliceIcon, path: '/itsm/retention', featureKey: 'ITSM_RETENTION' },
  { label: 'Change management', icon: PublishedWithChangesIcon, path: '/itsm/changemanagement', featureKey: 'ITSM_CHANGE' },
  { label: 'Reports', icon: ReportsIcon, path: '/itsm/reports', featureKey: 'ITSM_REPORTS' },
];

const SUPPORT_NAV = [
  { label: 'Dashboard', icon: DashboardIcon, path: '/support/dashboard', featureKey: 'SUPPORT_DASHBOARD' },
  { label: 'Acknowledge', icon: SupportAgentIcon, path: '/support/acknowledge', featureKey: 'SUPPORT_ACKNOWLEDGE' },
  { label: 'My tickets', icon: TicketIcon, path: '/support/tickets', featureKey: 'SUPPORT_TICKETS' },
  { label: 'Incident tickets', icon: WarningAmberIcon, path: '/support/incidents', featureKey: 'SUPPORT_INCIDENTS' },
  { label: 'Asset inventory', icon: InventoryIcon, path: '/support/asset-service', featureKey: 'SUPPORT_ASSETS' },
  { label: 'Asset mapping', icon: LayersIcon, path: '/support/asset-mappings', featureKey: 'SUPPORT_MAPPING' },
  { label: 'Problem records', icon: StorageIcon, path: '/support/problem-records', featureKey: 'SUPPORT_PROBLEMS' },
  { label: 'KEDB', icon: InventoryIcon, path: '/support/KEDB', featureKey: 'SUPPORT_KEDB' },
  { label: 'Knowledge base', icon: SchoolIcon, path: '/support/knowledgebase', featureKey: 'SUPPORT_KB' },
  { label: 'Duplicate review', icon: MergeTypeIcon, path: '/support/review/duplicates', featureKey: 'SUPPORT_DUPLICATES' },
  { label: 'Backup schedule', icon: MergeTypeIcon, path: '/support/backupschedule', featureKey: 'SUPPORT_BACKUP' },
  { label: 'Change plan', icon: CompareArrowsIcon, path: '/support/changeplan', featureKey: 'SUPPORT_CHANGE' },
];

const APPROVAL_NAV = [
  { label: 'Approval queue', icon: AssignmentTurnedInIcon, path: '/approvals/queue', featureKey: 'L1_QUEUE' },
  { label: 'History', icon: HistoryIcon, path: '/approvals/history', featureKey: 'L1_HISTORY' },

];

const RESOURCE_OWNER_NAV = [
  { label: 'Pending approvals', icon: SupervisorAccountIcon, path: '/resource-owner/dashboard', featureKey: 'RO_PENDING' },
  { label: 'History', icon: HistoryIcon, path: '/resource-owner/history', featureKey: 'RO_HISTORY' },
];

// ── NavItem ───────────────────────────────────────────────────────────────────
const NavItem = ({ item, open, active, onClick }) => {
  const navigate = useNavigate();

  const handleItemPress = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(item.path);
    }
  };

  return (
    <Tooltip title={!open ? item.label : ''} placement="right" arrow>
      <ListItem
        onClick={handleItemPress}
        sx={{
          borderRadius: '8px',
          mb: 0.75,
          cursor: 'pointer',
          position: 'relative',
          px: open ? 2 : 0,
          py: 1,
          justifyContent: open ? 'flex-start' : 'center',
          backgroundColor: active ? 'rgba(151, 36, 126, 0.15)' : 'transparent',
          border: '1px solid',
          borderColor: active ? 'rgba(151, 36, 126, 0.35)' : 'transparent',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          '&:hover': {
            backgroundColor: active ? 'rgba(151, 36, 126, 0.25)' : 'rgba(255, 255, 255, 0.05)',
            paddingLeft: open ? '20px' : 0,
          },
        }}
      >
        {active && (
          <Box sx={{
            position: 'absolute', left: 0, top: '15%',
            height: '70%', width: '4px',
            backgroundColor: '#E01950',
            borderRadius: '0 4px 4px 0',
          }} />
        )}

        <ListItemIcon sx={{
          minWidth: open ? 34 : 'auto',
          color: active ? '#FFFFFF' : 'rgba(255, 255, 255, 0.55)',
          display: 'flex', justifyContent: 'center',
          transition: 'color 0.2s ease',
          '& svg': { fontSize: 21 },
        }}>
          <item.icon />
        </ListItemIcon>

        <AnimatePresence mode="wait">
          {open && (
            <motion.div
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.15 }}
              style={{ flex: 1, minWidth: 0 }}
            >
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontFamily: fontStack,
                  fontSize: '0.825rem',
                  fontWeight: active ? 600 : 500,
                  color: active ? '#FFFFFF' : 'rgba(255, 255, 255, 0.8)',
                  noWrap: true,
                  letterSpacing: '0.1px',
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </ListItem>
    </Tooltip>
  );
};

// ── Section label ─────────────────────────────────────────────────────────────
const SectionLabel = ({ label, open, badge }) =>
  open ? (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, pt: 2, pb: 0.75 }}>
      <Typography sx={{
        fontFamily: fontStack, fontSize: '0.65rem', fontWeight: 700,
        letterSpacing: '0.08em', textTransform: 'uppercase',
        color: 'rgba(255, 255, 255, 0.35)', flex: 1,
      }}>
        {label}
      </Typography>
      {badge && (
        <Chip label={badge} size="small" sx={{
          height: 16, fontSize: '0.58rem', fontWeight: 700,
          fontFamily: fontStack, bgcolor: '#97247E', color: '#FFFFFF',
          '& .MuiChip-label': { px: 0.75 }, borderRadius: '4px',
        }} />
      )}
    </Box>
  ) : (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
      <Divider sx={{ width: '40%', borderColor: 'rgba(255,255,255,0.08)' }} />
    </Box>
  );

// ── SidebarContent ────────────────────────────────────────────────────────────
const SidebarContent = ({ open }) => {
  const { pathname } = useLocation();
  const { user, hasRole, hasEffectiveRole, canAccess } = useAuth(); // ✅ CHANGE 1
  const [createTicketOpen, setCreateTicketOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(null);

  const isAdmin = hasRole('ADMIN');
  const isRMO = hasRole('RMO');
  const isEndUser = hasRole('END_USER');
  const isITSM = hasEffectiveRole('ITSM_MANAGER');
  const isSupport = hasEffectiveRole('SUPPORT_PERSONNEL');
  const isL1 = hasEffectiveRole('APPROVAL_MANAGER_L1');
  const isL2 = hasEffectiveRole('APPROVAL_MANAGER_L2');
  const isRO = hasEffectiveRole('RESOURCE_OWNER');
  const isApprover = isL1 || isL2;

  const managerRoleCount = [isITSM, isSupport, isApprover, isRO].filter(Boolean).length;

  const consoleLabel = (() => {
    if (isAdmin) return 'Admin Console';
    if (isRMO) return 'RMO Console';
    if (isITSM) return 'ITSM Console';
    if (isSupport) return 'Support Console';
    if (isL1 && isL2) return 'Manager Portal';
    if (isL1) return 'L1 Manager Portal';
    if (isL2) return 'L2 Manager Portal';
    if (isRO) return 'Resource Owner';
    return 'User Portal';
  })();

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await userAxios.get('/api/v1/users/profile');
      setProfile(res.data);
    } catch (err) {
      console.error('Profile API error:', err?.response?.status, err?.response?.data?.message);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const isActive = (path) => pathname === path || pathname.startsWith(path + '/');

  // ✅ CHANGE 2 — filters nav items by canAccess featureKey
  const renderSection = (label, navItems, show, badge) => {
    if (!show) return null;
    const accessible = navItems.filter(
      (item) => !item.featureKey || canAccess(item.featureKey)
    );
    if (!accessible.length) return null;
    return (
      <>
        <SectionLabel label={label} open={open} badge={badge} />
        {accessible.map((item) => (
          <NavItem key={item.path} item={item} open={open} active={isActive(item.path)} />
        ))}
      </>
    );
  };

  return (
    <Box sx={{
      height: '100%', backgroundColor: '#1D1B44',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>

      {/* ── Brand Logo Header ─────────────────────────────────────────── */}
      <Box sx={{
        display: 'flex', alignItems: 'center',
        gap: open ? 1.5 : 0,
        px: open ? 2.5 : 0,
        justifyContent: open ? 'flex-start' : 'center',
        minHeight: { xs: '58px', sm: '66px' },
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <Box sx={{
          width: 32, height: 32, borderRadius: '6px', flexShrink: 0,
          background: 'linear-gradient(135deg, #97247E 0%, #E01950 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(151, 36, 126, 0.3)',
        }}>
          <Typography sx={{ color: '#FFFFFF', fontWeight: 800, fontSize: '0.9rem', fontFamily: fontStack }}>
            S
          </Typography>
        </Box>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}
            >
              <Box>
                <Typography sx={{ color: '#FFFFFF', fontWeight: 700, fontSize: '0.925rem', lineHeight: 1.2, fontFamily: fontStack }}>
                  ServiceeverZ
                </Typography>
                <Typography sx={{ color: 'rgba(255, 255, 255, 0.45)', fontSize: '0.66rem', fontWeight: 500, fontFamily: fontStack }}>
                  {consoleLabel}
                </Typography>
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>
      {/* ── Scrollable Nav ────────────────────────────────────────────── */}
      <List sx={{
        px: 1.5, py: 1.5, flexGrow: 1,
        overflowY: 'auto', overflowX: 'hidden',
        '&::-webkit-scrollbar': { width: '5px' },
        '&::-webkit-scrollbar-track': { background: 'transparent' },
        '&::-webkit-scrollbar-thumb': { background: 'rgba(255, 255, 255, 0.12)', borderRadius: '10px' },
      }}>

        {renderSection('Admin', ADMIN_NAV, isAdmin)}
        {isAdmin && isRMO && open && <Divider sx={{ my: 1.5, borderColor: 'rgba(255,255,255,0.08)' }} />}

        {renderSection('RMO', RMO_NAV, isRMO)}
        {isITSM && isRMO && open && <Divider sx={{ my: 1.5, borderColor: 'rgba(255,255,255,0.08)' }} />}

        {renderSection('ITSM', ITSM_NAV, isITSM)}

        {isSupport && (
          <>
            {(isAdmin || isRMO || isITSM) && open && <Divider sx={{ my: 1.5, borderColor: 'rgba(255,255,255,0.08)' }} />}
            <SectionLabel label="Support" open={open} />
            {SUPPORT_NAV
              .filter((item) => !item.featureKey || canAccess(item.featureKey))
              .map((item) => (
                <NavItem key={item.path} item={item} open={open} active={isActive(item.path)} />
              ))
            }
            <NavItem
              item={{ label: 'Create ticket', icon: CreateIcon, path: '#' }}
              open={open} active={false}
              onClick={() => setCreateTicketOpen(true)}
            />
            <SupportCreateTicketModal open={createTicketOpen} onClose={() => setCreateTicketOpen(false)} />
          </>
        )}

        {isApprover && (
          <>
            {(isAdmin || isRMO || isITSM || isSupport) && open && (
              <Divider sx={{ my: 1.5, borderColor: 'rgba(255,255,255,0.08)' }} />
            )}
            {renderSection('Approvals', APPROVAL_NAV, isApprover)}
          </>
        )}

        {isRO && (
          <>
            {(isAdmin || isRMO || isITSM || isSupport || isApprover) && open && (
              <Divider sx={{ my: 1.5, borderColor: 'rgba(255,255,255,0.08)' }} />
            )}
            {renderSection('Resource Owner', RESOURCE_OWNER_NAV, isRO)}
          </>
        )}

        {isEndUser && (
          <>
            {managerRoleCount > 0 && open && (
              <Divider sx={{ my: 1.5, borderColor: 'rgba(255,255,255,0.08)' }} />
            )}
            {renderSection(
              managerRoleCount > 0 ? 'My workspace' : 'User portal',
              END_USER_NAV,
              isEndUser
            )}
          </>
        )}
      </List>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <Box sx={{
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        px: open ? 2.5 : 1, py: 2,
        display: 'flex', alignItems: 'center',
        gap: open ? 1.5 : 0,
        justifyContent: open ? 'flex-start' : 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.12)',
      }}>
        <Avatar
          src={profile?.profilePicture}
          sx={{
            width: 32, height: 32, flexShrink: 0,
            fontFamily: fontStack, fontSize: '0.75rem', fontWeight: 700,
            background: 'linear-gradient(135deg, #27235C 0%, #97247E 100%)',
            border: '1.5px solid rgba(255,255,255,0.2)',
          }}
        />
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ overflow: 'hidden', flex: 1, minWidth: 0 }}
            >
              <Typography noWrap sx={{ color: '#FFFFFF', fontSize: '0.8rem', fontWeight: 600, fontFamily: fontStack }}>
                {user?.fullName || user?.email}
              </Typography>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>
    </Box>
  );
};

// ── Sidebar shell ─────────────────────────────────────────────────────────────
const Sidebar = ({ open, mobileOpen, onMobileClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const width = open ? SIDEBAR_WIDTH : COLLAPSED_W;

  if (isMobile) {
    return (
      <Drawer
        variant="temporary" open={mobileOpen} onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{ '& .MuiDrawer-paper': { width: SIDEBAR_WIDTH, border: 'none' } }}
      >
        <SidebarContent open />
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width,
        flexShrink: 0,
        transition: theme.transitions.create('width', { duration: 220, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }),
        '& .MuiDrawer-paper': {
          width, border: 'none', overflow: 'hidden',
          transition: theme.transitions.create('width', { duration: 220, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }),
        },
      }}
    >
      <SidebarContent open={open} />
    </Drawer>
  );
};

export default Sidebar;

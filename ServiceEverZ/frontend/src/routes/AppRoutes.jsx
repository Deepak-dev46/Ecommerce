// FILE: src/routes/AppRoutes.jsx
import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';

import ProtectedRoute from './ProtectedRoute';
import RootLayout from '../components/layout/RootLayout';
import VerifyResetOtpPage from '../pages/auth/VerifyResetOtpPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';
import LoginPage from '../pages/auth/LoginPage';
import OtpVerifyPage from '../pages/auth/OtpVerifyPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import SlaManagementPage from '../pages/admin/SlaManagementPage';
import AssetManagementPage from '../pages/asset/AssetManagementPage';
import DashboardPage from '../pages/admin/DashboardPage';
import UserManagementPage from '../pages/admin/UserManagementPage';
import ManualAssignPage from '../pages/itsm/ManualAssignPage';

const UserProfilePage    = lazy(() => import('../pages/users/UserProfilePage'));
const ChangePasswordPage = lazy(() => import('../pages/users/ChangePasswordPage'));

import RoleManagementPage from '../pages/admin/RoleManagementPage';
import PasswordPolicyPage from '../pages/admin/PasswordPolicyPage';
import UserLayout from '../components/layout/UserLayout';
import UserDashboardPage from '../pages/enduser/UserDashboardPage';
import ITSMLayout from '../components/layout/ITSMLayout';
import SupportAcknowledgePage from '../pages/support/SupportAcknowledgePage';

// ── UNIFIED approval queue — replaces L1ApprovalQueuePage + L2ApprovalQueuePage ──
import ApprovalQueuePage from '../pages/approvals/ApprovalQueuePage';

import SupportLayout from '../components/layout/SupportLayout';
import ApprovalLayout from '../components/layout/ApprovalLayout'; // shared layout for L1/L2/RO
import ResourceOwnerDashboardPage from '../pages/resource-owner/ResourceOwnerDashboardPage';
import OurCreateTicketPage from '../pages/enduser/OurCreateTicketPage';
import ServiceCatalogBrowsePage from '../pages/service-catalog/Sprint2/ServiceCatalogBrowsePage';
import MyTicketPage from '../pages/enduser/MyTicketsPage';
import TicketDetailPage from '../pages/enduser/TicketDetailPage';
import OurServiceCatalogPage from '../pages/enduser/OurServiceCatalogPage';
import ITSMTicketListPage from '../pages/itsm/ITSMTicketListPage';
import ITSMTicketDetailPage from '../pages/itsm/ITSMTicketDetailPage';
import SupportTicketListPage from '../pages/support/SupportTicketListPage';
import SupportTicketDetailPage from '../pages/support/SupportTicketDetailPage';
import SupportDashboard from '../pages/support/SupportDashboard';
import CreateRequestPage from '../pages/service-catalog/Sprint2/CreateRequestPage';
import ServiceCatalogManagePage from '../pages/service-catalog/Sprint2/ServiceCatalogManagePage';
import FeedbackFormPage from '../pages/feedback/FeedbackFormPage';
import CsatDashboardPage from '../pages/itsm/CsatDashboardPage';
import CreateTicketPage from '../pages/enduser/OurCreateTicketPage';
import ForceChangePasswordPage from '../pages/auth/ForceChangePasswordPage';
import CreateIncidentPage from '../pages/common/CreateIncidentPage';
import IncidentDetailPage from '../pages/enduser/IncidentDetailsPage';
import SupportIncidentListPage from '../pages/support/SupportIncidentListPage';
import SupportIncidentDetailPage from '../pages/support/SupportIncidentDetailPage';
import AssetMappingPage from '../pages/asset-mappings/AssetMappingPage';
import CreateMappingPage from '../pages/asset-mappings/CreateMappingPage';
import ITSMManagerAssetPage from '../pages/itsm/ITSMManagerAssetPage';
import SupportPersonnelPage from '../pages/support/SupportPersonnelPage';
import ArticleReadPanel from '../components/users/ArticleReadPanel';
import EndUserPage from '../pages/enduser/EndUserPage';
import ITSMManagerPage from '../pages/itsm/ITSMManagerPage';
import ArticleDetailPanel from '../components/support/ArticleDetailPanel';
import ArticleForm from '../components/support/ArticleForm';
import ITSMManagerProblemPage from '../pages/problems/ITSMManagerProblemPage';
import ProblemDetailPanel from '../components/problem/ProblemDetailPanel';
import { ProblemStatusChip } from '../components/problem/ProblemStatusChip';
import KEDBPage from '../pages/problems/KEDBPage';
import ProblemFormPage from '../pages/problems/ProblemFormPage';
import ProblemListPage from '../pages/problems/ProblemListPage';
import AssetFormPage from '../components/asset/AssetForm';
import BulkImportPage from '../pages/assets/BulkImportPage';
import DraftsPage from '../pages/enduser/DraftsPage';
import DuplicateFlagsPage from '../pages/support/DuplicateFlagsPage';
import DuplicateReviewPage from '../pages/support/DuplicateReviewPage';
import BackupSchedulePage from '../pages/support/BackupSchedulePage';
import ChangeFormPage from '../pages/changes/ChangeFormPage';
import ChangeListPage from '../pages/changes/ChangeListPage';
import ChangeDetailPanel from '../components/change/ChangeDetailPanel';
import { ChangeStatusChip } from '../components/change/ChangeStatusChip';
import RetentionPolicyPage from '../pages/itsm/RetentionPolicyPage';
import ITSMManagerChangePage from '../pages/itsm/ITSMManagerChangePage';
import EditProjectPage from '../pages/rmo/projects/EditProjectPage';
import CreateTicketWrapper from '../pages/enduser/CreateTicketWrapper';
import TicketMonitorPage from '../pages/itsm/TicketMonitorPage';
import ITSMManagerDashboardPage from '../pages/itsm/ITSMManagerDashboardPage';
import FeatureControlPage from '../pages/admin/FeatureControlPage';
 
 
 

const RMOLayout            = lazy(() => import('../pages/rmo/RMOLayout'));
const RMODashboardPage     = lazy(() => import('../pages/rmo/dashboard/RMODashboardPage'));
const ProjectsPage         = lazy(() => import('../pages/rmo/projects/ProjectsPage'));
const CreateProjectPage    = lazy(() => import('../pages/rmo/projects/CreateProjectPage'));
const ResourceAssignmentPage = lazy(() => import('../pages/rmo/resources/ResourceAssignmentPage'));
const ReportsPage          = lazy(() => import('../pages/reports/ReportsPage'));
const ReportPage           = lazy(() => import('../pages/report/ReportPage'));

const PageFallback = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', height: '60vh', alignItems: 'center' }}>
    <CircularProgress sx={{ color: '#97247E' }} />
  </Box>
);

const PlaceholderPage = ({ title }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
    <Box sx={{ fontSize: '2.5rem' }}>🚧</Box>
    <Box sx={{ fontWeight: 700 }}>{title}</Box>
  </Box>
);

const AppRoutes = () => (
  <Routes>

    {/* ── PUBLIC ──────────────────────────────────────────────────────────── */}
    <Route path="/login"                element={<LoginPage />} />
    <Route path="/verify-otp"           element={<OtpVerifyPage />} />
    <Route path="/feedback"             element={<FeedbackFormPage />} />
    <Route path="/forgot-password"      element={<ForgotPasswordPage />} />
    <Route path="/force-change-password" element={<ForceChangePasswordPage />} />
    <Route path="/verify-reset-otp"     element={<VerifyResetOtpPage />} />
    <Route path="/reset-password"       element={<ResetPasswordPage />} />

    {/* ── ADMIN ───────────────────────────────────────────────────────────── */}
    <Route path="/" element={<ProtectedRoute requiredRole="ADMIN"><RootLayout /></ProtectedRoute>}>
      <Route index element={<Navigate to="/dashboard" replace />} />
      <Route path="dashboard"                        element={<DashboardPage />} />
      <Route path="users"                            element={<UserManagementPage />} />
      <Route path="roles"                            element={<RoleManagementPage />} />
      <Route path="password-policy"                  element={<PasswordPolicyPage />} />
      <Route path="service-catalog"                  element={<ServiceCatalogBrowsePage />} />
      <Route path="service-catalog/create/request"   element={<CreateRequestPage />} />
      <Route path="feature-control" element={<FeatureControlPage />} />
      <Route path="report"                           element={<Suspense fallback={<PageFallback />}><ReportPage /></Suspense>} />
    </Route>

    {/* ── RMO ─────────────────────────────────────────────────────────────── */}
    <Route path="/rmo" element={<ProtectedRoute requiredRole="RMO"><Suspense fallback={<PageFallback />}><RMOLayout /></Suspense></ProtectedRoute>}>
      <Route index element={<Navigate to="/rmo/dashboard" replace />} />
      <Route path="dashboard"                        element={<Suspense fallback={<PageFallback />}><RMODashboardPage /></Suspense>} />
      <Route path="projects"                         element={<Suspense fallback={<PageFallback />}><ProjectsPage /></Suspense>} />
      <Route path="projects/create"                  element={<Suspense fallback={<PageFallback />}><CreateProjectPage /></Suspense>} />
      <Route path="projects/:id/edit"                element={<EditProjectPage />} />
      <Route path="resources"                        element={<Suspense fallback={<PageFallback />}><ResourceAssignmentPage /></Suspense>} />
      <Route path="service-catalog"                  element={<ServiceCatalogBrowsePage />} />
      <Route path="service-catalog/create/request"   element={<OurCreateTicketPage />} />
      <Route path="service-catalog/create/incident"  element={<CreateIncidentPage />} />
    </Route>

    {/* ── END USER ────────────────────────────────────────────────────────── */}
    <Route path="/user" element={<ProtectedRoute requiredRole="END_USER"><Suspense fallback={<PageFallback />}><UserLayout /></Suspense></ProtectedRoute>}>
      <Route index element={<Navigate to="/user/dashboard" replace />} />
      <Route path="dashboard"                        element={<UserDashboardPage />} />
      <Route path="tickets"                          element={<MyTicketPage />} />
      <Route path="drafts"                           element={<DraftsPage />} />
      <Route path="edit-draft"                       element={<Suspense fallback={<PageFallback />}><CreateTicketWrapper redirectTo="/user/drafts" isDraftEdit /></Suspense>} />
      <Route path="tickets/:id"                      element={<TicketDetailPage />} />
      <Route path="incidents/:id"                    element={<IncidentDetailPage />} />
      <Route path="profile"                          element={<Suspense fallback={<PageFallback />}><UserProfilePage /></Suspense>} />
      <Route path="change-password"                  element={<Suspense fallback={<PageFallback />}><ChangePasswordPage /></Suspense>} />
      <Route path="service-catalog"                  element={<ServiceCatalogBrowsePage />} />
      <Route path="knowledgebase"                    element={<Suspense fallback={<PageFallback />}><EndUserPage /></Suspense>} />
      <Route path="service-catalog/create/request"   element={<Suspense fallback={<PageFallback />}><OurCreateTicketPage redirectTo="/user/tickets" /></Suspense>} />
      <Route path="service-catalog/create/incident"  element={<Suspense fallback={<PageFallback />}><CreateIncidentPage onBack="/user/service-catalog" /></Suspense>} />
    </Route>

    {/* ── SUPPORT ─────────────────────────────────────────────────────────── */}
    <Route path="/support" element={<ProtectedRoute requiredEffective="SUPPORT_PERSONNEL"><SupportLayout /></ProtectedRoute>}>
      <Route index element={<Navigate to="/support/dashboard" replace />} />
      <Route path="dashboard"                        element={<SupportDashboard />} />
      <Route path="tickets"                          element={<SupportTicketListPage />} />
      <Route path="acknowledge"                      element={<SupportAcknowledgePage />} />
      <Route path="tickets/:id"                      element={<SupportTicketDetailPage />} />
      <Route path="incidents"                        element={<SupportIncidentListPage />} />
      <Route path="incidents/:id"                    element={<SupportIncidentDetailPage />} />
      <Route path="create-ticket"                    element={<OurServiceCatalogPage />} />
      <Route path="service-catalog"                  element={<ServiceCatalogBrowsePage />} />
      <Route path="service-catalog/create/request"   element={<OurCreateTicketPage />} />
      <Route path="service-catalog/create/incident"  element={<CreateIncidentPage />} />
      <Route path="asset-service"                    element={<Suspense fallback={<PageFallback />}><AssetManagementPage /></Suspense>} />
      <Route path="asset-service/bulk-import"        element={<Suspense fallback={<PageFallback />}><BulkImportPage /></Suspense>} />
      <Route path="asset"                            element={<Suspense fallback={<PageFallback />}><AssetFormPage /></Suspense>} />
      <Route path="asset-mappings"                   element={<Suspense fallback={<PageFallback />}><AssetMappingPage /></Suspense>} />
      <Route path="asset-mappings/create"            element={<Suspense fallback={<PageFallback />}><CreateMappingPage /></Suspense>} />
      <Route path="knowledgebase"                    element={<Suspense fallback={<PageFallback />}><SupportPersonnelPage /></Suspense>} />
      <Route path="KEDB"                             element={<Suspense fallback={<PageFallback />}><KEDBPage /></Suspense>} />
      <Route path="tickets/duplicates"               element={<Suspense fallback={<PageFallback />}><DuplicateFlagsPage /></Suspense>} />
      <Route path="review/duplicates"                element={<Suspense fallback={<PageFallback />}><DuplicateReviewPage /></Suspense>} />
      <Route path="backupschedule"                   element={<Suspense fallback={<PageFallback />}><BackupSchedulePage /></Suspense>} />
      <Route path="changeplan/create"                element={<Suspense fallback={<PageFallback />}><ChangeFormPage /></Suspense>} />
      <Route path="changeplan"                       element={<Suspense fallback={<PageFallback />}><ChangeListPage /></Suspense>} />
      <Route path="problem-records"                  element={<Suspense fallback={<PageFallback />}><ProblemListPage /></Suspense>} />
      <Route path="problem-records/create"           element={<Suspense fallback={<PageFallback />}><ProblemFormPage /></Suspense>} />
      <Route path="problem-records/:id"              element={<Suspense fallback={<PageFallback />}><ProblemDetailPanel /></Suspense>} />
    </Route>

   {/* ── ITSM MANAGER ────────────────────────────────────────────────────────── */}
<Route path="/itsm" element={<ProtectedRoute requiredEffective="ITSM_MANAGER"><ITSMLayout /></ProtectedRoute>}>
  <Route index element={<Navigate to="/itsm/overview" replace />} />   {/* ← changed */}
  <Route path="overview"                         element={<ITSMManagerDashboardPage />} />  {/* ← NEW */}
  <Route path="dashboard"                        element={<CsatDashboardPage />} />          {/* ← untouched, stays as Feedback */}
  <Route path="tickets"                          element={<ITSMTicketListPage />} />
  <Route path="Mytickets"                          element={<MyTicketPage />} />
  <Route path="tickets/:id"                      element={<ITSMTicketDetailPage />} />
  <Route path="manage/service-catalog"           element={<ServiceCatalogManagePage />} />
  <Route path="service-catalog"                  element={<ServiceCatalogBrowsePage />} />
  <Route path="service-catalog/create/request"   element={<OurCreateTicketPage />} />
  <Route path="service-catalog/create/incident"  element={<CreateIncidentPage />} />
  <Route path="assign"                           element={<ManualAssignPage defaultTab="tickets" />} />
  <Route path="assign-incidents"                 element={<ManualAssignPage defaultTab="incidents" />} />
  <Route path="monitor"                          element={<TicketMonitorPage />} />
  <Route path="sla"                              element={<SlaManagementPage />} />
  <Route path="asset-approval"                   element={<Suspense fallback={<PageFallback />}><ITSMManagerAssetPage /></Suspense>} />
  <Route path="retention"                        element={<Suspense fallback={<PageFallback />}><RetentionPolicyPage /></Suspense>} />
  <Route path="changemanagement"                 element={<Suspense fallback={<PageFallback />}><ITSMManagerChangePage /></Suspense>} />
  <Route path="problem-management"               element={<Suspense fallback={<PageFallback />}><ITSMManagerProblemPage /></Suspense>} />
  <Route path="knowledgebase"                    element={<Suspense fallback={<PageFallback />}><ITSMManagerPage /></Suspense>} />
  <Route path="reports"                          element={<Suspense fallback={<PageFallback />}><ReportsPage /></Suspense>} />
</Route>
 

    {/* ── APPROVALS (unified L1 + L2) ─────────────────────────────────────
        A single route handles both L1-only, L2-only, and L1+L2 users.
        requiredEffective accepts either L1 or L2 role.
        ApprovalQueuePage auto-detects which level each ticket needs.    */}
    <Route
      path="/approvals"
      element={
        <ProtectedRoute requiredEffectives={['APPROVAL_MANAGER_L1', 'APPROVAL_MANAGER_L2']}>
          <Suspense fallback={<PageFallback />}><ApprovalLayout /></Suspense>
        </ProtectedRoute>
      }
    >
      <Route index                       element={<Navigate to="/approvals/queue" replace />} />
      <Route path="queue"                element={<ApprovalQueuePage />} />
      <Route path="history"              element={<ApprovalQueuePage defaultTab="HISTORY" />} />
      <Route path="service-catalog"      element={<ServiceCatalogBrowsePage />} />
      <Route path="service-catalog/create/request"  element={<OurCreateTicketPage redirectTo="/approvals/queue" />} />
      <Route path="service-catalog/create/incident" element={<CreateIncidentPage redirectTo="/approvals/queue" />} />
    </Route>

    {/* ── Keep old /l1 and /l2 routes as redirects so bookmarks don't break ── */}
    <Route path="/l1"          element={<Navigate to="/approvals/queue" replace />} />
    <Route path="/l1/*"        element={<Navigate to="/approvals/queue" replace />} />
    <Route path="/l2"          element={<Navigate to="/approvals/queue" replace />} />
    <Route path="/l2/*"        element={<Navigate to="/approvals/queue" replace />} />

    {/* ── RESOURCE OWNER ──────────────────────────────────────────────────── */}
    <Route
      path="/resource-owner"
      element={
        <ProtectedRoute requiredEffective="RESOURCE_OWNER">
          <Suspense fallback={<PageFallback />}><ApprovalLayout /></Suspense>
        </ProtectedRoute>
      }
    >
      <Route index element={<Navigate to="/resource-owner/dashboard" replace />} />
      <Route path="dashboard" element={<ResourceOwnerDashboardPage />} />
      <Route path="history"   element={<ResourceOwnerDashboardPage defaultTab="HISTORY" />} />
    </Route>

    {/* ── MISC ────────────────────────────────────────────────────────────── */}
    <Route path="/unauthorized" element={
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', height: '100vh', gap: 2, background: '#F4F5F9' }}>
        <Box sx={{ fontSize: '3rem' }}>🔒</Box>
        <Box sx={{ fontWeight: 700, fontSize: '1.25rem', color: '#1B193F' }}>Access Denied</Box>
        <Box sx={{ color: '#6B7280', fontSize: '0.875rem' }}>You don't have permission to view this page.</Box>
      </Box>
    } />
    <Route path="*" element={<Navigate to="/login" replace />} />

  </Routes>
);

export default AppRoutes;

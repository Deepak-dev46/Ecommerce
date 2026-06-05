// FILE: src/routes/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box, CircularProgress } from '@mui/material';
 
/**
 * requiredRole       — single assigned role check (ADMIN / RMO / END_USER)
 * requiredRoles      — any of these assigned roles
 * requiredEffective  — single effective role check (includes project-derived)
 * requiredEffectives — any of these effective roles
 */
const ProtectedRoute = ({
  children,
  requiredRole,
  requiredRoles,
  requiredEffective,
  requiredEffectives,
}) => {
  const { isAuthenticated, loading, hasRole, hasEffectiveRole } = useAuth();
  const location = useLocation();
 
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress sx={{ color: '#27235C' }} />
      </Box>
    );
  }
 
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
 
  // Assigned role checks
  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/unauthorized" replace />;
  }
  if (requiredRoles && !requiredRoles.some((r) => hasRole(r))) {
    return <Navigate to="/unauthorized" replace />;
  }
 
  // Effective role checks (project-derived — used for L1/L2/RO/ITSM routes)
  if (requiredEffective && !hasEffectiveRole(requiredEffective)) {
    return <Navigate to="/unauthorized" replace />;
  }
  if (requiredEffectives && !requiredEffectives.some((r) => hasEffectiveRole(r))) {
    return <Navigate to="/unauthorized" replace />;
  }
 
  return children;
};
 
export default ProtectedRoute;
 
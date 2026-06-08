// FILE: src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { tokenUtils } from '../utils/tokenUtils';
import { authApi } from '../api/authApi';
 
const AuthContext = createContext(null);
 
export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
 
  useEffect(() => {
    const stored = tokenUtils.getUser();
    if (stored && tokenUtils.isTokenValid()) setUser(stored);
    else tokenUtils.clearAll();
    setLoading(false);
  }, []);
 
  const login = useCallback((userData, token) => {
    const normalised = {
      ...userData,
      roles:           userData.roles           || [],
      effectiveRoles:  userData.effectiveRoles  || userData.roles || [],
      // allowedFeatures: array of featureKey strings returned at login
      // e.g. ["ITSM_TICKETS", "ITSM_SLA", "ITSM_KB", ...]
      // Empty array = not yet loaded; null = no restrictions (all allowed)
      allowedFeatures: userData.allowedFeatures ?? null,
    };
    tokenUtils.setToken(token);
    tokenUtils.setUser(normalised);
    setUser(normalised);
  }, []);
 
  const logout = useCallback(async () => {
    await authApi.logout();
    tokenUtils.clearAll();
    setUser(null);
  }, []);
 
  // ── hasRole: assigned roles (ADMIN / RMO / END_USER) ─────────────────────
  const hasRole = useCallback(
    (role) => Boolean(user?.roles?.includes(role)),
    [user]
  );
 
  // ── hasEffectiveRole: assigned + project-derived ──────────────────────────
  const hasEffectiveRole = useCallback(
    (role) => Boolean(user?.effectiveRoles?.includes(role)),
    [user]
  );
 
  // ── canAccess: feature-gate check ─────────────────────────────────────────
  // featureKey — e.g. "ITSM_TICKETS", "SUPPORT_KEDB"
  // Returns true if:
  //   (a) allowedFeatures is null (no restrictions loaded) OR
  //   (b) featureKey is in allowedFeatures
  // ADMIN is always unrestricted.
  const canAccess = useCallback(
    (featureKey) => {
      if (user?.roles?.includes('ADMIN')) return true;
      if (user?.allowedFeatures === null || user?.allowedFeatures === undefined) return true;
      return Boolean(user.allowedFeatures.includes(featureKey));
    },
    [user]
  );
 
  // ── Convenience booleans ─────────────────────────────────────────────────
  const isAdmin             = useCallback(() => hasRole('ADMIN'),                  [hasRole]);
  const isRMO               = useCallback(() => hasRole('RMO'),                    [hasRole]);
  const isEndUser           = useCallback(() => hasRole('END_USER'),               [hasRole]);
  const isITSMManager       = useCallback(() => hasEffectiveRole('ITSM_MANAGER'),  [hasEffectiveRole]);
  const isSupportPersonnel  = useCallback(() => hasEffectiveRole('SUPPORT_PERSONNEL'), [hasEffectiveRole]);
  const isApprovalManagerL1 = useCallback(() => hasEffectiveRole('APPROVAL_MANAGER_L1'), [hasEffectiveRole]);
  const isApprovalManagerL2 = useCallback(() => hasEffectiveRole('APPROVAL_MANAGER_L2'), [hasEffectiveRole]);
  const isResourceOwner     = useCallback(() => hasEffectiveRole('RESOURCE_OWNER'), [hasEffectiveRole]);
 
  const isAuthenticated = Boolean(user && tokenUtils.isTokenValid());
 
  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      isAuthenticated,
      hasRole,
      hasEffectiveRole,
      canAccess,          // ← NEW
      isAdmin,
      isRMO,
      isEndUser,
      isITSMManager,
      isSupportPersonnel,
      isApprovalManagerL1,
      isApprovalManagerL2,
      isResourceOwner,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
 
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
 
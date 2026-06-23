/**
 * useDraftGuard.js
 * Place at: src/hooks/useDraftGuard.js
 *
 * US-149 — Auto-save draft on navigation away / browser crash
 *
 * NOTE: useBlocker requires a data router (createBrowserRouter).
 * Since this app uses BrowserRouter, we intercept navigation via
 * a custom history listener on the window instead.
 */
 
import { useEffect, useRef, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
 
export const DRAFT_LS_KEY = 'serviceeverz_ticket_draft';
 
export function persistDraftToStorage({ form, category, subcategory, serviceType, customItemDesc }) {
    try {
        const payload = {
            form: {
                item: form.item,
                location: form.location,
                priority: form.priority,
                mode: form.mode,
                mobile: form.mobile,
                description: form.description,
                accessTill: form.accessTill,
                projectId: form.projectId,
            },
            customItemDesc,
            category,
            subcategory,
            serviceType,
            savedAt: Date.now(),
        };
        localStorage.setItem(DRAFT_LS_KEY, JSON.stringify(payload));
    } catch (_) { }
}
 
export function readDraftFromStorage() {
    try {
        const raw = localStorage.getItem(DRAFT_LS_KEY);
        if (!raw) return null;
        const data = JSON.parse(raw);
        if (Date.now() - (data.savedAt || 0) > 24 * 60 * 60 * 1000) {
            localStorage.removeItem(DRAFT_LS_KEY);
            return null;
        }
        return data;
    } catch (_) {
        return null;
    }
}
 
export function clearDraftFromStorage() {
    try { localStorage.removeItem(DRAFT_LS_KEY); } catch (_) { }
}
 
/**
 * useDraftGuard
 *
 * Returns:
 *   markDirty()  — call on any field change
 *   markClean()  — call after successful save/submit
 *   showModal    — boolean: true when user tried to navigate away
 *   pendingPath  — the path they were trying to go to
 *   confirmNavigation()  — call when user picks Discard (navigate away)
 *   cancelNavigation()   — call when user picks Stay
 */
export function useDraftGuard() {
    const dirtyRef = useRef(false);
    const navigate = useNavigate();
 
    const [showModal, setShowModal] = useState(false);
    const [pendingPath, setPendingPath] = useState(null);
 
    const markDirty = useCallback(() => { dirtyRef.current = true; }, []);
    const markClean = useCallback(() => { dirtyRef.current = false; }, []);
 
    // Block browser refresh / tab close
    useEffect(() => {
        const handler = (e) => {
            if (!dirtyRef.current) return;
            e.preventDefault();
            e.returnValue = '';
        };
        window.addEventListener('beforeunload', handler);
        return () => window.removeEventListener('beforeunload', handler);
    }, []);
 
    // Intercept React Router link clicks by monkey-patching history.pushState
    useEffect(() => {
        const originalPush = window.history.pushState.bind(window.history);
 
        window.history.pushState = function (state, title, url) {
            if (dirtyRef.current && url) {
                // Get current origin-relative path
                const currentPath = window.location.pathname;
                const nextPath = typeof url === 'string'
                    ? (url.startsWith('http') ? new URL(url).pathname : url)
                    : currentPath;
 
                if (nextPath !== currentPath) {
                    // Intercept: show modal instead of navigating
                    setPendingPath(nextPath);
                    setShowModal(true);
                    return; // don't call original — block navigation
                }
            }
            return originalPush(state, title, url);
        };
 
        return () => {
            window.history.pushState = originalPush;
        };
    }, []);
 
    const confirmNavigation = useCallback(() => {
        setShowModal(false);
        dirtyRef.current = false;
        if (pendingPath) {
            navigate(pendingPath);
            setPendingPath(null);
        }
    }, [pendingPath, navigate]);
 
    const cancelNavigation = useCallback(() => {
        setShowModal(false);
        setPendingPath(null);
    }, []);
 
    return { markDirty, markClean, showModal, pendingPath, confirmNavigation, cancelNavigation };
}
 
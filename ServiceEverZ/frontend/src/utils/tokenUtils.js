// // src/utils/tokenUtils.js
// const TOKEN_KEY = 'sez_token';
// const USER_KEY  = 'sez_user';

// export const tokenUtils = {
//   setToken: (t) => localStorage.setItem(TOKEN_KEY, t),
//   getToken: () => localStorage.getItem(TOKEN_KEY),
//   removeToken: () => localStorage.removeItem(TOKEN_KEY),

//   setUser: (u) => localStorage.setItem(USER_KEY, JSON.stringify(u)),
//   getUser: () => {
//     try { return JSON.parse(localStorage.getItem(USER_KEY)); }
//     catch { return null; }
//   },
//   removeUser: () => localStorage.removeItem(USER_KEY),
//   clearAll: () => { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); },

//   isTokenValid: () => {
//     const t = localStorage.getItem(TOKEN_KEY);
//     if (!t) return false;
//     try {
//       const { exp } = JSON.parse(atob(t.split('.')[1]));
//       return exp * 1000 > Date.now();
//     } catch { return false; }
//   },
// };


// export const saveToken  = (t) => localStorage.setItem('sez_token', t);
// export const getToken   = ()  => localStorage.getItem('sez_token');
// export const clearToken = ()  => localStorage.removeItem('sez_token');
// export const saveUser   = (u) => localStorage.setItem('sez_user', JSON.stringify(u));
// export const getUser    = ()  => JSON.parse(localStorage.getItem('sez_user') || 'null');
// export const clearAll   = ()  => { localStorage.removeItem('sez_token'); localStorage.removeItem('sez_user'); };

const TOKEN_KEY = "sez_token";
const USER_KEY = "sez_user";
const EXPIRY_KEY = "sez_expiry";

export const tokenUtils = {
  // ✅ Token
  setToken: (token, expiresIn) => {
    if (!token) return;

    localStorage.setItem(TOKEN_KEY, token);

    if (expiresIn) {
      const expiryTime = Date.now() + expiresIn * 1000;
      localStorage.setItem(EXPIRY_KEY, expiryTime.toString());
    }
  },

  getToken: () => localStorage.getItem(TOKEN_KEY),

  removeToken: () => localStorage.removeItem(TOKEN_KEY),

  // ✅ User
  setUser: (user) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  getUser: () => {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || "null");
    } catch {
      return null;
    }
  },

  removeUser: () => localStorage.removeItem(USER_KEY),

  // ✅ Clear everything
  clearAll: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(EXPIRY_KEY);
  },

  // ✅ Validate token
  isTokenValid: () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return false;

    // Try JWT validation
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.exp) {
        return payload.exp * 1000 > Date.now();
      }
    } catch {
      // fallback below
    }

    // Fallback to expiry
    const expiry = localStorage.getItem(EXPIRY_KEY);
    if (!expiry) return false;

    return Date.now() < Number(expiry);
  },
};
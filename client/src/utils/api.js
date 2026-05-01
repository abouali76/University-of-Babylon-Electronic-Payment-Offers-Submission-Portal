const resolveApiBaseUrl = () => {
    const fromEnv = import.meta.env.VITE_API_URL;
    if (fromEnv && String(fromEnv).trim()) return String(fromEnv).trim();

    // When deployed on GitHub Pages, default to the hosted backend.
    // (GitHub Pages can't reverse-proxy, so we must hit an external API origin.)
    if (typeof window !== 'undefined') {
        const host = window.location.hostname || '';
        if (host.endsWith('github.io')) {
            return 'https://109-123-248-151.sslip.io/api';
        }
    }

    return 'http://localhost:5000/api';
};

const normalizeApiBaseUrl = (raw) => {
    const s = String(raw || '').trim().replace(/\/+$/, '');
    if (!s) return s;

    // GitHub Pages can't reverse-proxy to your backend.
    // So if we're on github.io and the configured API is relative OR points to github.io,
    // force the external backend origin.
    if (typeof window !== 'undefined') {
        const host = window.location.hostname || '';
        if (host.endsWith('github.io')) {
            if (s.startsWith('/')) {
                return 'https://109-123-248-151.sslip.io/api';
            }
            try {
                const u = new URL(s);
                if (u.hostname.endsWith('github.io')) {
                    return 'https://109-123-248-151.sslip.io/api';
                }
            } catch {
                // ignore parse errors; fall back to normal handling below
            }
        }
    }
    // Allow either full base (/api) or just origin; normalize to include /api
    return s.endsWith('/api') ? s : `${s}/api`;
};

const API_BASE_URL = normalizeApiBaseUrl(resolveApiBaseUrl());
// Helpful for debugging deployed builds (shows once per page load)
console.log('[api] base url =', API_BASE_URL);

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

export const api = {
    async get(endpoint) {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error(await response.text());
        return response.json();
    },

    async post(endpoint, data) {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error(await response.text());
        return response.json();
    },

    async upload(file) {
        const formData = new FormData();
        formData.append('document', file);
        const token = localStorage.getItem('token');
        
        const response = await fetch(`${API_BASE_URL}/form/upload`, {
            method: 'POST',
            headers: {
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: formData
        });
        if (!response.ok) throw new Error(await response.text());
        return response.json();
    }
};

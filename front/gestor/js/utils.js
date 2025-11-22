// js/utils.js

// Obtiene token de localStorage
export function getToken() {
    return localStorage.getItem('token');
}

// Fetch con token y headers adecuados para JSON
export async function fetchAPI(url, options = {}) {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': token } : {})
    };
    const opts = {
        ...options,
        headers: { ...headers, ...options.headers }
    };
    const response = await fetch(url, opts);
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error desconocido');
    }
    return response.json();
}

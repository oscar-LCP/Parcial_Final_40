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
    
    // 5.5 - Redirigir a login si el token es inválido o no existe (401)
    if (response.status === 401) {
        localStorage.clear();
        window.location.href = 'index.html';
        throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
    }
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error desconocido');
    }
    
    return response.json();
}
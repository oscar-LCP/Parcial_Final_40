// js/login.js
import { fetchAPI } from './utils.js';

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = e.target.email.value.trim();
    const password = e.target.password.value;

    try {
        const data = await fetch('http://127.0.0.1:8001/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email, password})
        }).then(res => res.json());

        if (data.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('role', data.role);
            window.location.href = 'dashboard.html';
        } else {
            showError(data.error || 'Credenciales incorrectas');
        }
        
    } catch (error) {
        showError(error.message || 'Error al conectar con el servidor');
    }
});

function showError(msg) {
    const el = document.getElementById('error-message');
    el.innerText = msg;
}

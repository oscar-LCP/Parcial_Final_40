import { fetchAPI } from './utils.js';

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();  // Previene el envío por defecto del formulario (evita que aparezca en URL)

    const email = e.target.email.value.trim();
    const password = e.target.password.value;

    try {
        // Usar fetchAPI para consistencia (aunque para login no se necesita token, es mejor)
        const data = await fetchAPI('http://localhost:8001/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })  // Nota: usa 'email' en lugar de 'username' para coincidir con backend
        });

        console.log('Response data:', data);  // Temporal: para depurar

        if (data.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('role', data.role);
            console.log('Login exitoso, redirigiendo...');  // Temporal: para depurar
            window.location.href = 'dashboard.html';  // Redirige al dashboard
        } else {
            showError(data.error || 'Credenciales incorrectas');
        }
        
    } catch (error) {
        console.error('Error en login:', error);  // Temporal: para depurar
        showError(error.message || 'Error al conectar con el servidor');
    }
});

function showError(msg) {
    const el = document.getElementById('error-message');
    if (el) {
        el.innerText = msg;
    } else {
        alert(msg);  // Fallback si el elemento no existe
    }
}
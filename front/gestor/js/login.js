import { fetchAPI } from './utils.js';

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();  // Previene el envío por defecto del formulario

    const email = e.target.email.value.trim();
    const password = e.target.password.value;

    try {
        // Llamada al backend con la URL corregida
        const data = await fetchAPI('http://127.0.0.1:8001/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        console.log('Response data:', data);  // Para depurar

        if (data.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('role', data.role);
            console.log('Login exitoso, redirigiendo...');
            
            // Redirige usando la ruta completa desde la raíz
            window.location.href = '/Parcial_Final_40/front/gestor/dashboard.html';
        } else {
            showError(data.error || 'Credenciales incorrectas');
        }
        
    } catch (error) {
        console.error('Error en login:', error);
        showError(error.message || 'Error al conectar con el servidor');
    }
});

function showError(msg) {
    const el = document.getElementById('error-message');
    if (el) {
        el.innerText = msg;
    } else {
        alert(msg);
    }
}
// js/dashboard.js
import { fetchAPI, getToken } from './utils.js';

// Controla contenido mostrando y cargando según rol
async function init() {
    const token = getToken();
    if (!token) {
        window.location.href = 'index.html';
        return;
    }
    const role = localStorage.getItem('role');
    const content = document.getElementById('content');

    if (role === 'administrador') {
        content.innerHTML = `
            <h2>Panel Administrador</h2>
            <div>
                <button id="loadUsersBtn">Cargar Usuarios</button>
                <div id="usersList"></div>
            </div>
            <div>
                <button id="loadFlightsBtn">Cargar Vuelos</button>
                <div id="flightsList"></div>
            </div>
            <div>
                <button id="loadNavesBtn">Cargar Naves</button>
                <div id="navesList"></div>
            </div>
        `;

        document.getElementById('loadUsersBtn').addEventListener('click', async () => {
            try {
                const users = await fetchAPI('http://127.0.0.1:8001/users', { method: 'GET' });
                document.getElementById('usersList').innerText = JSON.stringify(users, null, 2);
            } catch (err) {
                alert(err.message);
            }
        });

        document.getElementById('loadFlightsBtn').addEventListener('click', async () => {
            try {
                const flights = await fetchAPI('http://127.0.0.1:8002/flights', { method: 'GET' });
                document.getElementById('flightsList').innerText = JSON.stringify(flights, null, 2);
            } catch (err) {
                alert(err.message);
            }
        });

        document.getElementById('loadNavesBtn').addEventListener('click', async () => {
            try {
                const naves = await fetchAPI('http://127.0.0.1:8002/naves', { method: 'GET' });
                document.getElementById('navesList').innerText = JSON.stringify(naves, null, 2);
            } catch (err) {
                alert(err.message);
            }
        });

    } else if (role === 'gestor') {
        content.innerHTML = `
            <h2>Panel Gestor</h2>
            <div>
                <button id="loadReservationsBtn">Cargar Reservas</button>
                <div id="reservationsList"></div>
            </div>
        `;

        document.getElementById('loadReservationsBtn').addEventListener('click', async () => {
            try {
                const reservations = await fetchAPI('http://127.0.0.1:8002/reservations', { method: 'GET' });
                document.getElementById('reservationsList').innerText = JSON.stringify(reservations, null, 2);
            } catch (err) {
                alert(err.message);
            }
        });
    } else {
        content.innerHTML = '<p>Rol no reconocido</p>';
    }
}

document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.clear();
    window.location.href = 'index.html';
});

init();

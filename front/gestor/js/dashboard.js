// js/dashboard.js
import { fetchAPI, getToken } from './utils.js';

const API_USERS = 'http://127.0.0.1:8001';
const API_AIRLINE = 'http://127.0.0.1:8002';

let currentSection = '';
let currentRole = '';

// Inicialización
async function init() {
    const token = getToken();
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    currentRole = localStorage.getItem('role');
    
    // Mostrar rol en el header
    document.getElementById('userRole').textContent = 
        currentRole === 'administrador' ? '👤 Administrador' : '👤 Gestor';

    // Configurar navegación según rol
    setupNavigation();

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', logout);
}

function setupNavigation() {
    const nav = document.getElementById('dashboardNav');
    
    if (currentRole === 'administrador') {
        nav.innerHTML = `
            <ul class="nav-tabs">
                <li class="nav-tab active" data-section="usuarios">👥 Usuarios</li>
                <li class="nav-tab" data-section="vuelos">✈️ Vuelos</li>
                <li class="nav-tab" data-section="naves">🛩️ Naves</li>
            </ul>
        `;
        
        // Event listeners para tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                const section = tab.dataset.section;
                loadSection(section);
            });
        });
        
        // Cargar primera sección
        loadSection('usuarios');
        
    } else if (currentRole === 'gestor') {
        nav.innerHTML = `
            <ul class="nav-tabs">
                <li class="nav-tab active" data-section="reservas">📋 Reservas</li>
                <li class="nav-tab" data-section="vuelos">✈️ Consultar Vuelos</li>
            </ul>
        `;
        
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                const section = tab.dataset.section;
                loadSection(section);
            });
        });
        
        loadSection('reservas');
    }
}

function loadSection(section) {
    currentSection = section;
    const content = document.getElementById('content');
    
    switch(section) {
        case 'usuarios':
            loadUsuarios();
            break;
        case 'vuelos':
            loadVuelos();
            break;
        case 'naves':
            loadNaves();
            break;
        case 'reservas':
            loadReservas();
            break;
    }
}

// ========== USUARIOS ==========
async function loadUsuarios() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <div class="section-header">
            <h2>👥 Gestión de Usuarios</h2>
            <button class="btn-primary" onclick="window.dashboard.openUserModal()">+ Crear Usuario</button>
        </div>
        <div class="table-container">
            <div class="loading">Cargando usuarios...</div>
        </div>
    `;
    
    try {
        const users = await fetchAPI(`${API_USERS}/users`, { method: 'GET' });
        
        if (users.length === 0) {
            content.querySelector('.table-container').innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">👤</div>
                    <p>No hay usuarios registrados</p>
                </div>
            `;
            return;
        }
        
        content.querySelector('.table-container').innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Email</th>
                        <th>Rol</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${users.map(user => `
                        <tr>
                            <td>${user.id}</td>
                            <td>${user.name}</td>
                            <td>${user.email}</td>
                            <td>${user.role}</td>
                            <td class="actions">
                                <button class="btn-success btn-small" onclick="window.dashboard.editUser(${user.id})">Editar</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        content.querySelector('.table-container').innerHTML = `
            <div class="empty-state">
                <p style="color: #ff6b6b;">Error: ${error.message}</p>
            </div>
        `;
    }
}

function openUserModal(userId = null) {
    // Crear modal
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${userId ? 'Editar Usuario' : 'Crear Usuario'}</h3>
                <button class="btn-close" onclick="this.closest('.modal').remove()">×</button>
            </div>
            <form class="modal-form" id="userForm">
                <div class="form-group">
                    <label>Nombre</label>
                    <input type="text" name="name" required>
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" name="email" required>
                </div>
                <div class="form-group">
                    <label>Contraseña</label>
                    <input type="password" name="password" ${userId ? '' : 'required'}>
                    ${userId ? '<small style="opacity:0.7;">Dejar en blanco para mantener la actual</small>' : ''}
                </div>
                <div class="form-group">
                    <label>Rol</label>
                    <select name="role" required>
                        <option value="gestor">Gestor</option>
                        <option value="administrador">Administrador</option>
                    </select>
                </div>
                <div class="btn-container">
                    <button type="submit" class="btn-primary">Guardar</button>
                    <button type="button" class="btn-secondary" onclick="this.closest('.modal').remove()">Cancelar</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Si es edición, cargar datos
    if (userId) {
        loadUserData(userId, modal);
    }
    
    // Submit handler
    document.getElementById('userForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        
        // Si es edición y password está vacío, no enviarlo
        if (userId && !data.password) {
            delete data.password;
        }
        
        try {
            if (userId) {
                await fetchAPI(`${API_USERS}/users/${userId}`, {
                    method: 'PUT',
                    body: JSON.stringify(data)
                });
            } else {
                await fetchAPI(`${API_USERS}/register`, {
                    method: 'POST',
                    body: JSON.stringify(data)
                });
            }
            modal.remove();
            loadUsuarios();
        } catch (error) {
            alert('Error: ' + error.message);
        }
    });
}

async function loadUserData(userId, modal) {
    try {
        const users = await fetchAPI(`${API_USERS}/users`, { method: 'GET' });
        const user = users.find(u => u.id === userId);
        if (user) {
            modal.querySelector('[name="name"]').value = user.name;
            modal.querySelector('[name="email"]').value = user.email;
            modal.querySelector('[name="role"]').value = user.role;
        }
    } catch (error) {
        console.error('Error cargando usuario:', error);
    }
}

// ========== NAVES ==========
async function loadNaves() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <div class="section-header">
            <h2>🛩️ Gestión de Naves</h2>
            <button class="btn-primary" onclick="window.dashboard.openNaveModal()">+ Crear Nave</button>
        </div>
        <div class="table-container">
            <div class="loading">Cargando naves...</div>
        </div>
    `;
    
    try {
        const naves = await fetchAPI(`${API_AIRLINE}/naves`, { method: 'GET' });
        
        if (naves.length === 0) {
            content.querySelector('.table-container').innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🛩️</div>
                    <p>No hay naves registradas</p>
                </div>
            `;
            return;
        }
        
        content.querySelector('.table-container').innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Modelo</th>
                        <th>Capacidad</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${naves.map(nave => `
                        <tr>
                            <td>${nave.id}</td>
                            <td>${nave.name}</td>
                            <td>${nave.model}</td>
                            <td>${nave.capacity}</td>
                            <td class="actions">
                                <button class="btn-success btn-small" onclick="window.dashboard.editNave(${nave.id})">Editar</button>
                                <button class="btn-danger btn-small" onclick="window.dashboard.deleteNave(${nave.id})">Eliminar</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        content.querySelector('.table-container').innerHTML = `
            <div class="empty-state">
                <p style="color: #ff6b6b;">Error: ${error.message}</p>
            </div>
        `;
    }
}

function openNaveModal(naveId = null) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${naveId ? 'Editar Nave' : 'Crear Nave'}</h3>
                <button class="btn-close" onclick="this.closest('.modal').remove()">×</button>
            </div>
            <form class="modal-form" id="naveForm">
                <div class="form-group">
                    <label>Nombre</label>
                    <input type="text" name="name" required>
                </div>
                <div class="form-group">
                    <label>Modelo</label>
                    <input type="text" name="model" required>
                </div>
                <div class="form-group">
                    <label>Capacidad</label>
                    <input type="number" name="capacity" required min="1">
                </div>
                <div class="btn-container">
                    <button type="submit" class="btn-primary">Guardar</button>
                    <button type="button" class="btn-secondary" onclick="this.closest('.modal').remove()">Cancelar</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    if (naveId) {
        loadNaveData(naveId, modal);
    }
    
    document.getElementById('naveForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        
        try {
            if (naveId) {
                await fetchAPI(`${API_AIRLINE}/naves/${naveId}`, {
                    method: 'PUT',
                    body: JSON.stringify(data)
                });
            } else {
                await fetchAPI(`${API_AIRLINE}/naves`, {
                    method: 'POST',
                    body: JSON.stringify(data)
                });
            }
            modal.remove();
            loadNaves();
        } catch (error) {
            alert('Error: ' + error.message);
        }
    });
}

async function loadNaveData(naveId, modal) {
    try {
        const naves = await fetchAPI(`${API_AIRLINE}/naves`, { method: 'GET' });
        const nave = naves.find(n => n.id === naveId);
        if (nave) {
            modal.querySelector('[name="name"]').value = nave.name;
            modal.querySelector('[name="model"]').value = nave.model;
            modal.querySelector('[name="capacity"]').value = nave.capacity;
        }
    } catch (error) {
        console.error('Error cargando nave:', error);
    }
}

async function deleteNave(naveId) {
    if (!confirm('¿Estás seguro de eliminar esta nave?')) return;
    
    try {
        await fetchAPI(`${API_AIRLINE}/naves/${naveId}`, { method: 'DELETE' });
        loadNaves();
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

// ========== VUELOS ==========
async function loadVuelos() {
    const content = document.getElementById('content');
    const isAdmin = currentRole === 'administrador';
    
    content.innerHTML = `
        <div class="section-header">
            <h2>✈️ ${isAdmin ? 'Gestión de' : 'Consulta de'} Vuelos</h2>
            ${isAdmin ? '<button class="btn-primary" onclick="window.dashboard.openFlightModal()">+ Crear Vuelo</button>' : ''}
        </div>
        
        <!-- Filtros de búsqueda (Requerimiento 2.3) -->
        <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 12px; margin-bottom: 20px;">
            <h3 style="margin-bottom: 15px;">🔍 Buscar Vuelos</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                <div class="form-group">
                    <label>Origen</label>
                    <input type="text" id="searchOrigin" placeholder="Ej: Bogotá" style="padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.3); background: rgba(255,255,255,0.15); color: #fff; font-family: 'Orbitron', sans-serif;">
                </div>
                <div class="form-group">
                    <label>Destino</label>
                    <input type="text" id="searchDestination" placeholder="Ej: Medellín" style="padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.3); background: rgba(255,255,255,0.15); color: #fff; font-family: 'Orbitron', sans-serif;">
                </div>
                <div class="form-group">
                    <label>Fecha</label>
                    <input type="date" id="searchDate" style="padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.3); background: rgba(255,255,255,0.15); color: #fff; font-family: 'Orbitron', sans-serif;">
                </div>
                <div style="display: flex; align-items: flex-end; gap: 10px;">
                    <button class="btn-primary" onclick="window.dashboard.searchFlights()" style="width: 100%;">Buscar</button>
                    <button class="btn-secondary" onclick="window.dashboard.clearSearchFlights()" style="width: 100%;">Limpiar</button>
                </div>
            </div>
        </div>
        
        <div class="table-container">
            <div class="loading">Cargando vuelos...</div>
        </div>
    `;
    
    try {
        const flights = await fetchAPI(`${API_AIRLINE}/flights`, { method: 'GET' });
        displayFlights(flights, isAdmin);
    } catch (error) {
        content.querySelector('.table-container').innerHTML = `
            <div class="empty-state">
                <p style="color: #ff6b6b;">Error: ${error.message}</p>
            </div>
        `;
    }
}

async function searchFlights() {
    const origin = document.getElementById('searchOrigin').value.trim();
    const destination = document.getElementById('searchDestination').value.trim();
    const date = document.getElementById('searchDate').value;
    
    const params = new URLSearchParams();
    if (origin) params.append('origin', origin);
    if (destination) params.append('destination', destination);
    if (date) params.append('date', date);
    
    const content = document.getElementById('content');
    content.querySelector('.table-container').innerHTML = '<div class="loading">Buscando vuelos...</div>';
    
    try {
        const url = `${API_AIRLINE}/flights${params.toString() ? '?' + params.toString() : ''}`;
        const flights = await fetchAPI(url, { method: 'GET' });
        displayFlights(flights, currentRole === 'administrador');
    } catch (error) {
        content.querySelector('.table-container').innerHTML = `
            <div class="empty-state">
                <p style="color: #ff6b6b;">Error: ${error.message}</p>
            </div>
        `;
    }
}

function clearSearchFlights() {
    document.getElementById('searchOrigin').value = '';
    document.getElementById('searchDestination').value = '';
    document.getElementById('searchDate').value = '';
    loadVuelos();
}

function displayFlights(flights, isAdmin) {
    const content = document.getElementById('content');
    
    if (flights.length === 0) {
        content.querySelector('.table-container').innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">✈️</div>
                <p>No se encontraron vuelos</p>
            </div>
        `;
        return;
    }
    
    content.querySelector('.table-container').innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Origen</th>
                    <th>Destino</th>
                    <th>Salida</th>
                    <th>Llegada</th>
                    <th>Precio</th>
                    <th>Nave ID</th>
                    ${isAdmin ? '<th>Acciones</th>' : ''}
                </tr>
            </thead>
            <tbody>
                ${flights.map(flight => `
                    <tr>
                        <td>${flight.id}</td>
                        <td>${flight.origin}</td>
                        <td>${flight.destination}</td>
                        <td>${new Date(flight.departure).toLocaleString()}</td>
                        <td>${new Date(flight.arrival).toLocaleString()}</td>
                        <td>${parseFloat(flight.price).toLocaleString()}</td>
                        <td>${flight.nave_id}</td>
                        ${isAdmin ? `
                            <td class="actions">
                                <button class="btn-success btn-small" onclick="window.dashboard.editFlight(${flight.id})">Editar</button>
                                <button class="btn-danger btn-small" onclick="window.dashboard.deleteFlight(${flight.id})">Eliminar</button>
                            </td>
                        ` : ''}
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

async function openFlightModal(flightId = null) {
    // Primero obtener las naves disponibles
    let naves = [];
    try {
        naves = await fetchAPI(`${API_AIRLINE}/naves`, { method: 'GET' });
    } catch (error) {
        alert('Error cargando naves: ' + error.message);
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${flightId ? 'Editar Vuelo' : 'Crear Vuelo'}</h3>
                <button class="btn-close" onclick="this.closest('.modal').remove()">×</button>
            </div>
            <form class="modal-form" id="flightForm">
                <div class="form-group">
                    <label>Nave</label>
                    <select name="nave_id" required>
                        <option value="">Seleccione una nave</option>
                        ${naves.map(nave => `
                            <option value="${nave.id}">${nave.name} - ${nave.model}</option>
                        `).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Origen</label>
                    <input type="text" name="origin" required>
                </div>
                <div class="form-group">
                    <label>Destino</label>
                    <input type="text" name="destination" required>
                </div>
                <div class="form-group">
                    <label>Fecha/Hora Salida</label>
                    <input type="datetime-local" name="departure" required>
                </div>
                <div class="form-group">
                    <label>Fecha/Hora Llegada</label>
                    <input type="datetime-local" name="arrival" required>
                </div>
                <div class="form-group">
                    <label>Precio</label>
                    <input type="number" name="price" required min="0" step="0.01">
                </div>
                <div class="btn-container">
                    <button type="submit" class="btn-primary">Guardar</button>
                    <button type="button" class="btn-secondary" onclick="this.closest('.modal').remove()">Cancelar</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    if (flightId) {
        loadFlightData(flightId, modal);
    }
    
    document.getElementById('flightForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        
        try {
            if (flightId) {
                await fetchAPI(`${API_AIRLINE}/flights/${flightId}`, {
                    method: 'PUT',
                    body: JSON.stringify(data)
                });
            } else {
                await fetchAPI(`${API_AIRLINE}/flights`, {
                    method: 'POST',
                    body: JSON.stringify(data)
                });
            }
            modal.remove();
            loadVuelos();
        } catch (error) {
            alert('Error: ' + error.message);
        }
    });
}

async function loadFlightData(flightId, modal) {
    try {
        const flights = await fetchAPI(`${API_AIRLINE}/flights`, { method: 'GET' });
        const flight = flights.find(f => f.id === flightId);
        if (flight) {
            modal.querySelector('[name="nave_id"]').value = flight.nave_id;
            modal.querySelector('[name="origin"]').value = flight.origin;
            modal.querySelector('[name="destination"]').value = flight.destination;
            
            // Convertir a formato datetime-local
            const departure = new Date(flight.departure);
            modal.querySelector('[name="departure"]').value = departure.toISOString().slice(0, 16);
            
            const arrival = new Date(flight.arrival);
            modal.querySelector('[name="arrival"]').value = arrival.toISOString().slice(0, 16);
            
            modal.querySelector('[name="price"]').value = flight.price;
        }
    } catch (error) {
        console.error('Error cargando vuelo:', error);
    }
}

async function deleteFlight(flightId) {
    if (!confirm('¿Estás seguro de eliminar este vuelo?')) return;
    
    try {
        await fetchAPI(`${API_AIRLINE}/flights/${flightId}`, { method: 'DELETE' });
        loadVuelos();
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

// ========== RESERVAS ==========
async function loadReservas() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <div class="section-header">
            <h2>📋 Gestión de Reservas</h2>
            <button class="btn-primary" onclick="window.dashboard.openReservationModal()">+ Nueva Reserva</button>
        </div>
        
        <!-- Filtros de búsqueda (Requerimiento 4.3) -->
        <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 12px; margin-bottom: 20px;">
            <h3 style="margin-bottom: 15px;">🔍 Filtrar Reservas</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
                <div class="form-group">
                    <label>ID de Usuario</label>
                    <input type="number" id="filterUserId" placeholder="Ej: 2" style="padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.3); background: rgba(255,255,255,0.15); color: #fff; font-family: 'Orbitron', sans-serif;">
                </div>
                <div style="display: flex; align-items: flex-end; gap: 10px;">
                    <button class="btn-primary" onclick="window.dashboard.searchReservations()" style="width: 100%;">Buscar</button>
                    <button class="btn-secondary" onclick="window.dashboard.clearSearchReservations()" style="width: 100%;">Limpiar</button>
                </div>
            </div>
        </div>
        
        <div class="table-container">
            <div class="loading">Cargando reservas...</div>
        </div>
    `;
    
    try {
        const reservations = await fetchAPI(`${API_AIRLINE}/reservations`, { method: 'GET' });
        await displayReservations(reservations);
    } catch (error) {
        content.querySelector('.table-container').innerHTML = `
            <div class="empty-state">
                <p style="color: #ff6b6b;">Error: ${error.message}</p>
            </div>
        `;
    }
}

async function searchReservations() {
    const userId = document.getElementById('filterUserId').value.trim();
    
    const params = new URLSearchParams();
    if (userId) params.append('user_id', userId);
    
    const content = document.getElementById('content');
    content.querySelector('.table-container').innerHTML = '<div class="loading">Buscando reservas...</div>';
    
    try {
        const url = `${API_AIRLINE}/reservations${params.toString() ? '?' + params.toString() : ''}`;
        const reservations = await fetchAPI(url, { method: 'GET' });
        await displayReservations(reservations);
    } catch (error) {
        content.querySelector('.table-container').innerHTML = `
            <div class="empty-state">
                <p style="color: #ff6b6b;">Error: ${error.message}</p>
            </div>
        `;
    }
}

function clearSearchReservations() {
    document.getElementById('filterUserId').value = '';
    loadReservas();
}

async function displayReservations(reservations) {
    const content = document.getElementById('content');
    
    if (reservations.length === 0) {
        content.querySelector('.table-container').innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📋</div>
                <p>No se encontraron reservas</p>
            </div>
        `;
        return;
    }
    
    // Obtener información de vuelos y usuarios para mostrar detalles
    let flights = [];
    let users = [];
    
    try {
        flights = await fetchAPI(`${API_AIRLINE}/flights`, { method: 'GET' });
    } catch (error) {
        console.error('Error cargando vuelos:', error);
    }
    
    const flightsMap = {};
    flights.forEach(f => flightsMap[f.id] = f);
    // Construir filas de la tabla
    const rows = reservations.map(res => {
        const flight = flightsMap[res.flight_id] || {};
        const price = flight.price ? parseFloat(flight.price).toLocaleString() : 'N/A';
        const origin = flight.origin || 'N/A';
        const destination = flight.destination || 'N/A';
        const departure = flight.departure ? new Date(flight.departure).toLocaleString() : 'N/A';
        const statusLabel = res.status === 'activa' ? '✓ Activa' : '✕ Cancelada';
        const statusBg = res.status === 'activa' ? 'rgba(100, 200, 100, 0.3)' : 'rgba(255, 100, 100, 0.3)';
        const action = res.status === 'activa' ? `<button class="btn-danger btn-small" onclick="window.dashboard.cancelReservation(${res.id})">Cancelar</button>` : '<span style="opacity:0.5;">—</span>';

        return `
            <tr>
                <td><strong>#${res.id}</strong></td>
                <td>Usuario #${res.user_id}</td>
                <td>Vuelo #${res.flight_id}</td>
                <td>${origin} → ${destination}</td>
                <td>${departure}</td>
                <td>${price}</td>
                <td>
                    <span style="padding: 5px 10px; border-radius: 12px; background: ${statusBg}; font-weight: 600; font-size: 0.85rem;">
                        ${statusLabel}
                    </span>
                </td>
                <td>${new Date(res.reserved_at).toLocaleString()}</td>
                <td class="actions">${action}</td>
            </tr>
        `;
    }).join('');

    content.querySelector('.table-container').innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>ID Reserva</th>
                    <th>Usuario ID</th>
                    <th>Vuelo</th>
                    <th>Origen → Destino</th>
                    <th>Fecha Vuelo</th>
                    <th>Precio</th>
                    <th>Estado</th>
                    <th>Fecha Reserva</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${rows}
            </tbody>
        </table>
        <div style="margin-top: 20px; padding: 15px; background: rgba(255,255,255,0.1); border-radius: 10px; text-align: center;">
            <p style="margin: 0; font-size: 0.9rem;">
                📊 Total de reservas: <strong>${reservations.length}</strong> | 
                Activas: <strong>${reservations.filter(r => r.status === 'activa').length}</strong> | 
                Canceladas: <strong>${reservations.filter(r => r.status === 'cancelada').length}</strong>
            </p>
        </div>
    `;
}

async function openReservationModal() {
    // Obtener solo los vuelos disponibles
    let flights = [];
    
    try {
        flights = await fetchAPI(`${API_AIRLINE}/flights`, { method: 'GET' });
    } catch (error) {
        alert('Error cargando vuelos: ' + error.message);
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Nueva Reserva</h3>
                <button class="btn-close" onclick="this.closest('.modal').remove()">×</button>
            </div>
            <form class="modal-form" id="reservationForm">
                <div class="form-group">
                    <label>Vuelo</label>
                    <select name="flight_id" required>
                        <option value="">Seleccione un vuelo</option>
                        ${flights.map(flight => `
                            <option value="${flight.id}">
                                ${flight.origin} → ${flight.destination} 
                                (${new Date(flight.departure).toLocaleDateString()}) 
                                - ${parseFloat(flight.price).toLocaleString()}
                            </option>
                        `).join('')}
                    </select>
                </div>
                <div style="background: rgba(100, 200, 255, 0.2); padding: 15px; border-radius: 10px; margin-top: 10px;">
                    <p style="margin: 0; font-size: 0.9rem;">
                        ℹ️ La reserva se creará a tu nombre automáticamente
                    </p>
                </div>
                <div class="btn-container">
                    <button type="submit" class="btn-primary">Crear Reserva</button>
                    <button type="button" class="btn-secondary" onclick="this.closest('.modal').remove()">Cancelar</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('reservationForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        
        // No enviamos user_id, el backend lo asignará automáticamente
        
        try {
            await fetchAPI(`${API_AIRLINE}/reservations`, {
                method: 'POST',
                body: JSON.stringify(data)
            });
            modal.remove();
            alert('✅ Reserva creada exitosamente');
            loadReservas();
        } catch (error) {
            alert('Error: ' + error.message);
        }
    });
}

async function cancelReservation(reservationId) {
    if (!confirm('¿Estás seguro de cancelar esta reserva?')) return;
    
    try {
        await fetchAPI(`${API_AIRLINE}/reservations/${reservationId}/cancel`, { 
            method: 'PUT' 
        });
        loadReservas();
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

async function logout() {
    try {
        // 1.4 - Llamar al backend para eliminar el token
        await fetchAPI(`${API_USERS}/logout`, { method: 'POST' });
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
    } finally {
        // Limpiar localStorage y redirigir
        localStorage.clear();
        window.location.href = 'index.html';
    }
}

// Exponer funciones globalmente para los onclick
window.dashboard = {
    openUserModal,
    editUser: (id) => openUserModal(id),
    openNaveModal,
    editNave: (id) => openNaveModal(id),
    deleteNave,
    openFlightModal,
    editFlight: (id) => openFlightModal(id),
    deleteFlight,
    searchFlights,
    clearSearchFlights,
    searchReservations,
    clearSearchReservations,
    openReservationModal,
    cancelReservation
};

// Iniciar
init();
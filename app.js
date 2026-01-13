// Variables globales
let viajes = [];
let viajeId = 1;
let currentRole = 'pasajero';
let currentSection = 'home';

// Hospitales y centros médicos de referencia en Paraguay
const hospitalesParaguay = {
    'Asunción': [
        'Hospital de Clínicas',
        'Hospital Italiano',
        'IPS Central',
        'Sanatorio Migone',
        'Hospital Bautista',
        'Hospital Militar',
        'Hospital de Trauma',
        'Sanatorio Americano'
    ],
    'Central': [
        'Hospital Central de IPS - San Lorenzo',
        'Hospital Nacional de Itauguá',
        'Sanatorio San Roque - Fernando de la Mora',
        'IPS Ingavi - Fernando de la Mora',
        'Hospital Distrital de Lambaré'
    ],
    'Alto Paraná': [
        'Hospital Regional de Ciudad del Este',
        'IPS Ciudad del Este',
        'Sanatorio Parque del Este'
    ],
    'Itapúa': [
        'Hospital Regional de Encarnación',
        'IPS Encarnación',
        'Sanatorio Privado San Blas'
    ]
};

// Direcciones de ejemplo por departamento
const direccionesEjemplo = {
    'Asunción': [
        'Av. España 1234, Centro',
        'Mcal. López 890, Villa Morra',
        'Av. Eusebio Ayala Km 4.5, Barrio Mburicaó',
        'Av. Artigas 567, Barrio San Pablo'
    ],
    'Central': [
        'Ruta 1 Mcal. López Km 18, San Lorenzo',
        'Av. Defensores del Chaco, Capiatá',
        'Calle Ytororó, Fernando de la Mora',
        'Av. Cacique Lambaré, Lambaré'
    ],
    'Alto Paraná': [
        'Av. Monseñor Rodríguez, Ciudad del Este',
        'Av. San Blas, Ciudad del Este',
        'Barrio Santa Rosa, Hernandarias'
    ],
    'Itapúa': [
        'Av. Irrazábal, Encarnación',
        'Barrio San Isidro, Encarnación',
        'Av. Costanera, Encarnación'
    ]
};

// Inicialización
window.addEventListener('DOMContentLoaded', function() {
    init();
});

function init() {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    document.getElementById('fecha').value = now.toISOString().slice(0, 16);
    
    // Configurar autocompletado de direcciones
    setupAutocomplete();
    
    showSection('home');
}

// Configurar sugerencias de direcciones
function setupAutocomplete() {
    const origenInput = document.getElementById('origen');
    const destinoInput = document.getElementById('destino');
    const deptSelect = document.getElementById('departamento');
    
    // Actualizar ejemplos cuando cambia el departamento
    deptSelect.addEventListener('change', function() {
        updatePlaceholders();
    });
    
    updatePlaceholders();
}

function updatePlaceholders() {
    const dept = document.getElementById('departamento').value;
    const origenInput = document.getElementById('origen');
    const destinoInput = document.getElementById('destino');
    
    if (direccionesEjemplo[dept]) {
        origenInput.placeholder = `Ej: ${direccionesEjemplo[dept][0]}`;
    }
    
    if (hospitalesParaguay[dept]) {
        destinoInput.placeholder = `Ej: ${hospitalesParaguay[dept][0]}`;
    }
}

// Navegación entre secciones
function showSection(section) {
    currentSection = section;
    
    // Ocultar todas las secciones
    document.getElementById('heroSection').classList.add('hidden');
    document.getElementById('requestSection').classList.add('hidden');
    document.getElementById('trackingSection').classList.add('hidden');
    document.getElementById('driverDashboard').classList.add('hidden');
    document.getElementById('quickActions').classList.add('hidden');
    
    // Mostrar sección seleccionada
    if (section === 'home') {
        document.getElementById('heroSection').classList.remove('hidden');
        document.getElementById('quickActions').classList.remove('hidden');
    } else if (section === 'request') {
        document.getElementById('requestSection').classList.remove('hidden');
    } else if (section === 'tracking') {
        document.getElementById('trackingSection').classList.remove('hidden');
        renderViajes();
    }
    
    // Actualizar navegación activa
    document.querySelectorAll('nav button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    if (window.event && window.event.target && window.event.target.tagName === 'BUTTON') {
        window.event.target.classList.add('active');
    } else {
        // Activar el botón correcto si se llama programáticamente
        const navButtons = document.querySelectorAll('nav button');
        if (section === 'home' && navButtons[0]) navButtons[0].classList.add('active');
        if (section === 'request' && navButtons[1]) navButtons[1].classList.add('active');
        if (section === 'tracking' && navButtons[2]) navButtons[2].classList.add('active');
    }
}

// Cambiar entre rol pasajero y conductor
function toggleRole() {
    currentRole = currentRole === 'pasajero' ? 'conductor' : 'pasajero';
    
    if (currentRole === 'conductor') {
        document.getElementById('currentRole').textContent = 'Conductor';
        document.getElementById('roleSwitch').textContent = 'Modo Pasajero';
        document.getElementById('heroSection').classList.add('hidden');
        document.getElementById('requestSection').classList.add('hidden');
        document.getElementById('trackingSection').classList.add('hidden');
        document.getElementById('quickActions').classList.add('hidden');
        document.getElementById('driverDashboard').classList.remove('hidden');
        document.getElementById('mainNav').style.display = 'none';
        renderDriver();
    } else {
        document.getElementById('currentRole').textContent = 'Pasajero';
        document.getElementById('roleSwitch').textContent = 'Cambiar Rol';
        document.getElementById('mainNav').style.display = 'flex';
        showSection('home');
    }
}

// Crear nuevo viaje
function crearViaje() {
    const paciente = document.getElementById('paciente').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const origen = document.getElementById('origen').value.trim();
    const destino = document.getElementById('destino').value.trim();
    const fecha = document.getElementById('fecha').value;
    const departamento = document.getElementById('departamento').value;
    const tipo = document.getElementById('tipo').value;
    const notas = document.getElementById('notas').value.trim();
    
    if (!paciente || !telefono || !origen || !destino || !fecha) {
        showNotification('⚠️ Por favor completa todos los campos requeridos', 'warning');
        return;
    }
    
    // Validar formato de teléfono paraguayo
    if (!validarTelefonoParaguayo(telefono)) {
        showNotification('⚠️ Ingresa un número de teléfono válido (Ej: 0981 123 456)', 'warning');
        return;
    }
    
    viajes.push({
        id: viajeId++,
        paciente,
        telefono,
        origen,
        destino,
        fecha,
        departamento,
        tipo,
        notas,
        progreso: 0,
        estado: 'pending',
        estadoTexto: 'Buscando conductor disponible',
        creado: new Date().toLocaleString('es-PY'),
        estimado: calcularTiempoEstimado(origen, destino)
    });
    
    // Limpiar formulario
    document.getElementById('paciente').value = '';
    document.getElementById('telefono').value = '';
    document.getElementById('origen').value = '';
    document.getElementById('destino').value = '';
    document.getElementById('notas').value = '';
    
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    document.getElementById('fecha').value = now.toISOString().slice(0, 16);
    
    showNotification('✅ Traslado solicitado exitosamente. Te contactaremos al ' + telefono);
    showSection('tracking');
}

// Validar teléfono paraguayo
function validarTelefonoParaguayo(telefono) {
    // Acepta formatos: 0981123456, 0981 123 456, +595 981 123 456, etc.
    const regex = /^(\+?595|0)?9\d{8}$/;
    const cleaned = telefono.replace(/[\s-]/g, '');
    return regex.test(cleaned);
}

// Calcular tiempo estimado (simplificado)
function calcularTiempoEstimado(origen, destino) {
    const tiempos = ['15-20 min', '25-30 min', '30-40 min', '40-60 min'];
    return tiempos[Math.floor(Math.random() * tiempos.length)];
}

// Renderizar lista de viajes del pasajero
function renderViajes() {
    const container = document.getElementById('viajesContainer');
    const misViajes = viajes.filter(v => v.estado !== 'rejected');
    
    if (misViajes.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📭</div>
                <h3>No tienes traslados activos</h3>
                <p>Solicita un traslado médico para comenzar</p>
                <button class="btn btn-primary" onclick="showSection('request')" style="margin-top:20px">
                    🚑 Solicitar Traslado
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = misViajes.map(v => `
        <div class="trip-card">
            <div class="trip-header">
                <div class="trip-id">Traslado #${v.id}</div>
                <span class="status-badge status-${v.estado}">${v.estadoTexto}</span>
            </div>
            
            <div class="trip-info">
                <strong>👤 ${v.paciente}</strong>
            </div>
            
            <div class="trip-info">
                📞 ${v.telefono} · 📍 ${v.departamento}
            </div>
            
            <div class="trip-info">
                🚑 ${v.tipo}
            </div>
            
            <div class="trip-route">
                <span><strong>Origen:</strong> ${v.origen}</span>
            </div>
            
            <div class="trip-route">
                <span><strong>Destino:</strong> ${v.destino}</span>
            </div>
            
            ${v.notas ? `<div class="trip-info">📝 <strong>Notas:</strong> ${v.notas}</div>` : ''}
            
            <div class="progress-bar-container">
                <div class="progress-bar" style="width: ${v.progreso}%"></div>
            </div>
            
            <div class="trip-info" style="font-size: 13px; margin-top: 12px;">
                ⏱️ Tiempo estimado: ${v.estimado} · 🕐 Solicitado: ${v.creado}
            </div>
            
            ${v.conductor ? `<div class="trip-info" style="margin-top: 8px;">🚗 <strong>Conductor:</strong> ${v.conductor}</div>` : ''}
            
            <div class="trip-actions">
                ${v.progreso < 100 ? `<button class="btn btn-primary btn-sm" onclick="avanzarViaje(${v.id})">⏩ Actualizar Estado</button>` : ''}
                <button class="btn btn-outline btn-sm" onclick="openSMS(${v.id})">📱 Compartir</button>
                <button class="btn btn-outline btn-sm" onclick="verDetalles(${v.id})">👁️ Detalles</button>
                ${v.conductor ? `<button class="btn btn-outline btn-sm" onclick="llamarConductor('${v.telefono}')">📞 Llamar</button>` : ''}
            </div>
        </div>
    `).join('');
}

// Renderizar panel del conductor
function renderDriver() {
    updateStats();
    const container = document.getElementById('requestsContainer');
    const pendientes = viajes.filter(v => v.estado === 'pending');
    
    if (pendientes.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">✓</div>
                <h3>No hay solicitudes pendientes</h3>
                <p>Revisa más tarde o activa notificaciones</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = pendientes.map(v => `
        <div class="trip-card">
            <div class="trip-header">
                <div class="trip-id">Solicitud #${v.id}</div>
                <span class="status-badge status-pending">NUEVA</span>
            </div>
            
            <div class="trip-info">
                <strong>👤 ${v.paciente}</strong> · 📞 ${v.telefono}
            </div>
            
            <div class="trip-info">
                📍 ${v.departamento} · ⏱️ ${v.estimado}
            </div>
            
            <div class="trip-info">
                🚑 ${v.tipo}
            </div>
            
            <div class="trip-route">
                <span><strong>Origen:</strong> ${v.origen}</span>
            </div>
            
            <div class="trip-route">
                <span><strong>Destino:</strong> ${v.destino}</span>
            </div>
            
            ${v.notas ? `<div class="trip-info">📝 <strong>Notas médicas:</strong> ${v.notas}</div>` : ''}
            
            <div class="trip-actions">
                <button class="btn btn-primary btn-sm" onclick="aceptarViaje(${v.id})">✓ Aceptar Traslado</button>
                <button class="btn btn-outline btn-sm" onclick="rechazarViaje(${v.id})">✗ Rechazar</button>
                <button class="btn btn-outline btn-sm" onclick="llamarPaciente('${v.telefono}')">📞 Llamar</button>
            </div>
        </div>
    `).join('');
}

// Actualizar estadísticas del conductor
function updateStats() {
    const completados = viajes.filter(v => v.estado === 'completed').length;
    const activos = viajes.filter(v => v.estado === 'assigned' || v.estado === 'progress').length;
    
    document.getElementById('statsCompleted').textContent = completados;
    document.getElementById('statsActive').textContent = activos;
}

// Conductor acepta un viaje
function aceptarViaje(id) {
    const viaje = viajes.find(v => v.id === id);
    if (viaje) {
        viaje.estado = 'assigned';
        viaje.estadoTexto = 'Conductor asignado - Preparando ambulancia';
        viaje.progreso = 15;
        viaje.conductor = 'Carlos Benítez';
        viaje.conductorTel = '0981 555 123';
        viaje.vehiculo = 'AMB-123 (Mercedes Sprinter)';
        showNotification('✅ Has aceptado el traslado #' + id + '. El paciente será notificado.');
        renderDriver();
    }
}

// Conductor rechaza un viaje
function rechazarViaje(id) {
    const viaje = viajes.find(v => v.id === id);
    if (viaje) {
        const motivo = prompt('Motivo del rechazo (opcional):');
        viaje.estado = 'rejected';
        viaje.estadoTexto = 'Rechazado';
        viaje.motivoRechazo = motivo || 'No especificado';
        showNotification('Traslado #' + id + ' rechazado. Será reasignado a otro conductor.');
        renderDriver();
    }
}

// Avanzar el progreso de un viaje
function avanzarViaje(id) {
    const viaje = viajes.find(v => v.id === id);
    if (viaje && viaje.progreso < 100) {
        viaje.progreso += 25;
        
        if (viaje.progreso === 25) {
            viaje.estado = 'assigned';
            viaje.estadoTexto = 'Ambulancia en camino al origen';
        } else if (viaje.progreso === 50) {
            viaje.estado = 'progress';
            viaje.estadoTexto = 'Recogiendo al paciente';
        } else if (viaje.progreso === 75) {
            viaje.estadoTexto = 'Paciente a bordo - En ruta al destino';
        } else if (viaje.progreso === 100) {
            viaje.estado = 'completed';
            viaje.estadoTexto = 'Traslado completado exitosamente';
            viaje.horaFin = new Date().toLocaleString('es-PY');
        }
        
        renderViajes();
        showNotification('📍 Estado actualizado: ' + viaje.estadoTexto);
    }
}

// Ver detalles de un viaje
function verDetalles(id) {
    const viaje = viajes.find(v => v.id === id);
    if (viaje) {
        const detalles = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚑 TRASLADO MÉDICO #${viaje.id}
━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 PACIENTE
${viaje.paciente}
📞 ${viaje.telefono}

📍 UBICACIONES
Origen: ${viaje.origen}
Destino: ${viaje.destino}
Departamento: ${viaje.departamento}

🚑 SERVICIO
${viaje.tipo}

📅 PROGRAMACIÓN
Fecha: ${new Date(viaje.fecha).toLocaleString('es-PY')}
Tiempo estimado: ${viaje.estimado}

📝 NOTAS MÉDICAS
${viaje.notas || 'Sin notas adicionales'}

📊 ESTADO ACTUAL
${viaje.estadoTexto}
Progreso: ${viaje.progreso}%

🕐 REGISTRO
Solicitado: ${viaje.creado}
${viaje.horaFin ? 'Finalizado: ' + viaje.horaFin : ''}

${viaje.conductor ? `🚗 CONDUCTOR
${viaje.conductor}
${viaje.conductorTel || ''}
${viaje.vehiculo || ''}` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━
        `.trim();
        
        alert(detalles);
    }
}

// Abrir modal de SMS
function openSMS(id) {
    const viaje = viajes.find(v => v.id === id);
    if (!viaje) return;
    
    const mensaje = `
🚑 *MediMove Paraguay - Traslado Médico*

📋 Traslado #${viaje.id}
👤 ${viaje.paciente}
📍 ${viaje.departamento}

🏥 Origen: ${viaje.origen}
🏥 Destino: ${viaje.destino}

📊 Estado: ${viaje.estadoTexto}
⏱️ Tiempo estimado: ${viaje.estimado}

🔗 Seguimiento en vivo:
https://medimove.com.py/track/${viaje.id}

📞 Soporte 24/7: 0800-MEDIMOVE
    `.trim();
    
    document.getElementById('smsPreview').innerHTML = mensaje.replace(/\n/g, '<br>');
    document.getElementById('smsNumber').value = '';
    document.getElementById('smsModal').classList.add('show');
}

// Cerrar modal de SMS
function closeSMS() {
    document.getElementById('smsModal').classList.remove('show');
}

// Enviar SMS (simulado)
function sendSMS() {
    const numero = document.getElementById('smsNumber').value.trim();
    
    if (!numero) {
        showNotification('⚠️ Ingresa un número de teléfono', 'warning');
        return;
    }
    
    if (!validarTelefonoParaguayo(numero)) {
        showNotification('⚠️ Número de teléfono inválido', 'warning');
        return;
    }
    
    // Simular envío por WhatsApp
    const mensaje = document.getElementById('smsPreview').innerText;
    const whatsappUrl = `https://wa.me/${numero.replace(/\D/g, '')}?text=${encodeURIComponent(mensaje)}`;
    
    showNotification('✅ Abriendo WhatsApp para enviar a ' + numero);
    window.open(whatsappUrl, '_blank');
    closeSMS();
}

// Llamar al conductor
function llamarConductor(telefono) {
    window.location.href = `tel:${telefono}`;
}

// Llamar al paciente
function llamarPaciente(telefono) {
    window.location.href = `tel:${telefono}`;
}

// Mostrar información de emergencia
function showEmergencyInfo() {
    const info = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚨 NÚMEROS DE EMERGENCIA PARAGUAY
━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚑 EMERGENCIAS MÉDICAS
• 911 - Emergencias SEN
• 141 - Ambulancias SET
• 131 - Bomberos Voluntarios

🏥 HOSPITALES PRINCIPALES
• Hospital de Trauma: (021) 220-8000
• Hospital de Clínicas: (021) 220-4000
• IPS Central: (021) 214-7000
• Hospital Italiano: (021) 228-0000

🚔 SEGURIDAD
• 911 - Policía Nacional
• 132 - Policía de Tránsito

☎️ OTRAS EMERGENCIAS
• 144 - Bomberos
• 147 - Defensa Civil

💊 FARMACIAS 24H
• Catedral: (021) 441-341
• Fátima: (021) 511-111

━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ Para emergencias graves, llama
inmediatamente al 911 o 141
━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `.trim();
    
    alert(info);
}

// Mostrar notificación temporal
function showNotification(mensaje, tipo = 'success') {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = mensaje;
    
    if (tipo === 'warning') {
        notification.style.borderLeftColor = '#F59E0B';
    } else if (tipo === 'error') {
        notification.style.borderLeftColor = '#EF4444';
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 4000);
}
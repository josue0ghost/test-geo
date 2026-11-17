const $ = id => document.getElementById(id);

const UI = {
    show: id => $(id).classList.remove('hidden'),
    hide: id => $(id).classList.add('hidden')
};

const errorMessages = {
    1: 'Permiso denegado. Por favor, permite el acceso a la ubicación en la configuración de tu navegador.',
    2: 'Ubicación no disponible. Verifica que el GPS esté activado.',
    3: 'Tiempo de espera agotado. Intenta de nuevo en un lugar con mejor señal.'
};

async function saveToCloud(data) {
    if (!CONFIG.FIREBASE_URL || CONFIG.FIREBASE_URL.includes('TU-PROYECTO')) {
        return { success: false, message: 'Firebase no configurado' };
    }
    try {
        const response = await fetch(`${CONFIG.FIREBASE_URL}.json`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (response.ok) {
            const result = await response.json();
            return { success: true, id: result.name };
        }
        return { success: false, message: 'Error al guardar' };
    } catch (e) {
        return { success: false, message: e.message };
    }
}

function showResult(position) {
    const { latitude, longitude, accuracy } = position.coords;
    const timestamp = new Date(position.timestamp);
    
    $('latitude').textContent = latitude.toFixed(6);
    $('longitude').textContent = longitude.toFixed(6);
    $('accuracy').textContent = `±${accuracy.toFixed(0)} metros`;
    $('timestamp').textContent = timestamp.toLocaleString('es-ES');
    $('maps-link').href = `https://www.google.com/maps?q=${latitude},${longitude}`;
    
    UI.hide('loading');
    UI.hide('info-section');
    UI.show('result-section');
    
    const locationData = {
        latitude, longitude, accuracy,
        timestamp: timestamp.toISOString(),
        userAgent: navigator.userAgent,
        sessionId: CONFIG.SESSION_ID
    };
    
    saveToCloud(locationData).then(result => {
        $('cloud-status').textContent = result.success 
            ? `✅ Guardado (${result.id})` 
            : `⚠️ ${result.message}`;
    });
}

function showError(error) {
    UI.hide('loading');
    UI.hide('info-section');
    $('error-message').textContent = errorMessages[error.code] || `Error desconocido: ${error.message}`;
    UI.show('error-section');
}

function getLocation() {
    if (!navigator.geolocation) {
        $('error-message').textContent = 'Tu navegador no soporta geolocalización.';
        UI.show('error-section');
        return;
    }
    
    UI.hide('info-section');
    UI.hide('error-section');
    UI.show('loading');
    
    navigator.geolocation.getCurrentPosition(showResult, showError, {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
    });
}

$('btn-location').addEventListener('click', getLocation);
$('btn-retry').addEventListener('click', () => {
    UI.hide('error-section');
    UI.show('info-section');
});
$('btn-continue').addEventListener('click', () => {
    if (confirm(`Serás redirigido a:\n${CONFIG.REDIRECT_URL}\n\n¿Continuar?`)) {
        window.location.href = CONFIG.REDIRECT_URL;
    }
});

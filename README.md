# Demo HTML5 Geolocation API

Aplicación de demostración para pruebas consensuadas de geolocalización.

## Requisitos

- Navegador moderno (Safari iOS / Chrome Android)
- **HTTPS obligatorio** (la API Geolocation no funciona en HTTP)

## Despliegue Rápido (GitHub Pages)

### 1. Crear repositorio en GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/test-geo.git
git push -u origin main
```

### 2. Activar GitHub Pages

1. Ve a **Settings** → **Pages**
2. Source: **Deploy from a branch**
3. Branch: **main** / **(root)**
4. Save

Tu app estará en: `https://TU-USUARIO.github.io/test-geo/`

## Configurar Firebase (Almacenamiento en Nube)

### 1. Crear proyecto Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com)
2. **Crear proyecto** → Nombre: `geo-demo`
3. Ve a **Realtime Database** → **Crear base de datos**
4. Selecciona ubicación y modo **prueba**

### 2. Configurar reglas (temporal para pruebas)

En **Realtime Database** → **Reglas**:

```json
{
  "rules": {
    "locations": {
      ".read": false,
      ".write": true
    }
  }
}
```

### 3. Obtener URL

Copia la URL de tu base de datos (ej: `https://geo-demo-xxxxx.firebaseio.com`)

### 4. Configurar la app

Edita `config.js`:

```javascript
const CONFIG = {
    REDIRECT_URL: 'https://www.ejemplo.com',
    FIREBASE_URL: 'https://geo-demo-xxxxx.firebaseio.com/locations',
    SESSION_ID: 'prueba-consensuada-' + Date.now()
};
```

## Instrucciones de Prueba Consensuada

### Persona A (Administrador)

1. Despliega la app en GitHub Pages
2. Configura Firebase y actualiza `config.js`
3. Comparte el enlace HTTPS con Persona B
4. Monitorea los datos en Firebase Console → Realtime Database

### Persona B (Participante)

1. Abre el enlace en Safari (iPhone) o Chrome (Android)
2. Lee la información sobre la solicitud de ubicación
3. Pulsa "Obtener Mi Ubicación"
4. **Acepta** el permiso de ubicación cuando el navegador lo solicite
5. Verifica los datos mostrados
6. Opcionalmente, abre en Google Maps
7. Pulsa "Continuar" para ir a la URL configurada

## Ver Datos Almacenados

En Firebase Console → Realtime Database verás:

```json
{
  "locations": {
    "-NxXxXxXxXx": {
      "latitude": 40.416775,
      "longitude": -3.703790,
      "accuracy": 20,
      "timestamp": "2024-01-15T10:30:00.000Z",
      "userAgent": "Mozilla/5.0...",
      "sessionId": "prueba-consensuada-1705312200000"
    }
  }
}
```

## Alternativas de Despliegue HTTPS

### Netlify (Drag & Drop)

1. Ve a [netlify.com/drop](https://app.netlify.com/drop)
2. Arrastra la carpeta del proyecto
3. Obtén URL HTTPS automática

### Servidor Local con HTTPS (para desarrollo)

```bash
# Instalar http-server con soporte SSL
npx http-server -S -C cert.pem -K key.pem -p 8080

# O usar ngrok para túnel HTTPS
npx ngrok http 8080
```

## Notas de Seguridad

- ⚠️ Esta app es solo para **demostraciones consensuadas**
- ⚠️ Cambia las reglas de Firebase a modo restrictivo en producción
- ⚠️ No uses para recopilar datos sin consentimiento explícito

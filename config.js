// ============================================
// CONFIGURACIÓN - Modifica estos valores
// ============================================
const CONFIG = {
    // URL a la que redirigir después de mostrar resultados
    REDIRECT_URL: 'https://www.sucursalelectronica.com/redir/showLogin.go',
    
    // API Gateway endpoint (crear con Lambda + DynamoDB)
    API_ENDPOINT: 'https://qa4qc0ffld.execute-api.us-east-2.amazonaws.com/prod/location',
    
    // Identificador de sesión
    SESSION_ID: 'demo-' + Date.now()
};

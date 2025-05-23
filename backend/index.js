const app = require('./src/app');

// El app se inicializa automáticamente al requerirlo
console.log('🚀 Iniciando SDN-STAFF Backend...');

// Exportar app por si se necesita para testing
module.exports = app;
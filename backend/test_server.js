const express = require('express');
const app = express();

console.log('🚀 Iniciando servidor de prueba...');

// Middleware básico
app.use(express.json());

// Cargar rutas paso a paso
try {
  console.log('📁 Cargando modelos...');
  const db = require('./src/models');
  
  console.log('🔄 Cargando rutas principales...');
  const mainRoutes = require('./src/routes');
  app.use('/api', mainRoutes);
  
  console.log('✅ Todas las rutas cargadas exitosamente');
  
  // Iniciar servidor
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`🚀 Servidor de prueba funcionando en puerto ${PORT}`);
    console.log(`📊 API Base URL: http://localhost:${PORT}/api`);
    
    // Hacer una prueba básica
    setTimeout(() => {
      console.log('🔍 Realizando prueba básica...');
      require('http').get(`http://localhost:${PORT}/api/`, (res) => {
        console.log(`✅ Respuesta del servidor: ${res.statusCode}`);
        process.exit(0);
      }).on('error', (err) => {
        console.log('❌ Error en prueba:', err.message);
        process.exit(1);
      });
    }, 1000);
  });

} catch (error) {
  console.error('❌ Error al cargar componentes:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}
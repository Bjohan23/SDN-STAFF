const express = require('express');
const router = express.Router();

// Importar rutas específicas aquí
const userRoutes = require('./userRoutes');
const usuarioRoutes = require('./usuarioRoutes');
const rolRoutes = require('./rolRoutes');
// const authRoutes = require('./authRoutes');

// Configurar rutas
// router.use('/auth', authRoutes);
router.use('/users', userRoutes); // Modelo anterior (mantener por compatibilidad)
router.use('/usuarios', usuarioRoutes); // Nuevo modelo Usuario
router.use('/roles', rolRoutes); // Roles

// Ruta de prueba
router.get('/', (req, res) => {
  res.json({
    message: 'API SDN-STAFF funcionando correctamente',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api',
      // Modelo anterior User (mantener por compatibilidad)
      users: '/api/users',
      // Nuevos modelos
      usuarios: '/api/usuarios',
      roles: '/api/roles',
      // Endpoints principales
      usuarios_endpoints: {
        lista: 'GET /api/usuarios',
        crear: 'POST /api/usuarios',
        obtener: 'GET /api/usuarios/:id',
        actualizar: 'PUT /api/usuarios/:id',
        eliminar: 'DELETE /api/usuarios/:id',
        login: 'POST /api/usuarios/login',
        stats: 'GET /api/usuarios/stats'
      },
      roles_endpoints: {
        lista: 'GET /api/roles',
        crear: 'POST /api/roles',
        obtener: 'GET /api/roles/:id',
        actualizar: 'PUT /api/roles/:id',
        eliminar: 'DELETE /api/roles/:id',
        stats: 'GET /api/roles/stats'
      }
    }
  });
});

module.exports = router;

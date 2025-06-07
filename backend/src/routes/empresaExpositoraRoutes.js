const express = require('express');
const router = express.Router();
const EmpresaExpositoraController = require('../controllers/EmpresaExpositoraController');
const { authenticate, authorize } = require('../middlewares/auth');
const { auditCreate, auditUpdate, auditDelete } = require('../middlewares/audit');

// Rutas públicas (registro inicial de empresas)
// Registro público de empresa (para que las empresas se auto-registren)
router.post('/registro-publico', EmpresaExpositoraController.createEmpresaExpositora);

// Verificar disponibilidad de RUC
router.get('/check-ruc/:ruc', authenticate, EmpresaExpositoraController.verificarRuc);

// Obtener todas las empresas expositoras
router.get('/', authenticate, authorize(['Administrador', 'Manager']), EmpresaExpositoraController.getAllEmpresasExpositoras);

// Obtener estadísticas de empresas
router.get('/stats', authenticate, authorize(['Administrador']), EmpresaExpositoraController.getEmpresasStats);

// Obtener empresas pendientes de aprobación
router.get('/pendientes', authenticate, authorize(['Administrador', 'Manager']), EmpresaExpositoraController.getEmpresasPendientes);

// Obtener empresas con documentos próximos a vencer
router.get('/documentos-vencer', authenticate, authorize(['Administrador', 'Manager']), EmpresaExpositoraController.getEmpresasConDocumentosProximosAVencer);

// Carga masiva desde CSV
router.post('/carga-masiva', authenticate, authorize(['Administrador']), auditCreate, EmpresaExpositoraController.cargaMasivaCSV);

// Aprobar empresa
router.post('/:id/aprobar', authenticate, authorize(['Administrador']), auditUpdate, EmpresaExpositoraController.aprobarEmpresa);

// Rechazar empresa
router.post('/:id/rechazar', authenticate, authorize(['Administrador']), auditUpdate, EmpresaExpositoraController.rechazarEmpresa);

// Suspender empresa
router.post('/:id/suspender', authenticate, authorize(['Administrador']), auditUpdate, EmpresaExpositoraController.suspenderEmpresa);

// Registrar empresa en evento
router.post('/:id/eventos', authenticate, authorize(['Administrador', 'Manager']), auditCreate, EmpresaExpositoraController.registrarEnEvento);

// Obtener participación específica en evento
router.get('/:id/eventos/:evento_id', authenticate, authorize(['Administrador', 'Manager']), EmpresaExpositoraController.getParticipacionEnEvento);

// Restaurar empresa eliminada
router.post('/:id/restore', authenticate, authorize(['Administrador']), EmpresaExpositoraController.restoreEmpresa);

// Obtener empresa por ID
router.get('/:id', authenticate, authorize(['Administrador', 'Manager']), EmpresaExpositoraController.getEmpresaExpositoraById);

// Obtener empresa por RUC
router.get('/ruc/:ruc', authenticate, authorize(['Administrador', 'Manager']), EmpresaExpositoraController.getEmpresaByRuc);

// Obtener empresa por email
router.get('/email/:email', authenticate, authorize(['Administrador', 'Manager']), EmpresaExpositoraController.getEmpresaByEmail);

// Crear nueva empresa expositora (admin)
router.post('/', authenticate, authorize(['Administrador', 'Manager']), auditCreate, EmpresaExpositoraController.createEmpresaExpositora);

// Actualizar empresa expositora
router.put('/:id', authenticate, authorize(['Administrador', 'Manager']), auditUpdate, EmpresaExpositoraController.updateEmpresaExpositora);

// Eliminar empresa expositora
router.delete('/:id', authenticate, authorize(['Administrador']), auditDelete, EmpresaExpositoraController.deleteEmpresaExpositora);

module.exports = router;

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
router.get('/', authenticate, authorize(['administrador', 'manager']), EmpresaExpositoraController.getAllEmpresasExpositoras);

// Obtener estadísticas de empresas
router.get('/stats', authenticate, authorize(['administrador']), EmpresaExpositoraController.getEmpresasStats);

// Obtener empresas pendientes de aprobación
router.get('/pendientes', authenticate, authorize(['administrador', 'manager']), EmpresaExpositoraController.getEmpresasPendientes);

// Obtener empresas con documentos próximos a vencer
router.get('/documentos-vencer', authenticate, authorize(['administrador', 'manager']), EmpresaExpositoraController.getEmpresasConDocumentosProximosAVencer);

// Carga masiva desde CSV
router.post('/carga-masiva', authenticate, authorize(['administrador']), auditCreate, EmpresaExpositoraController.cargaMasivaCSV);

// Aprobar empresa
router.post('/:id/aprobar', authenticate, authorize(['administrador']), auditUpdate, EmpresaExpositoraController.aprobarEmpresa);

// Rechazar empresa
router.post('/:id/rechazar', authenticate, authorize(['administrador']), auditUpdate, EmpresaExpositoraController.rechazarEmpresa);

// Suspender empresa
router.post('/:id/suspender', authenticate, authorize(['administrador']), auditUpdate, EmpresaExpositoraController.suspenderEmpresa);

// Registrar empresa en evento
router.post('/:id/eventos', authenticate, authorize(['administrador', 'manager']), auditCreate, EmpresaExpositoraController.registrarEnEvento);

// Obtener participación específica en evento
router.get('/:id/eventos/:evento_id', authenticate, authorize(['administrador', 'manager']), EmpresaExpositoraController.getParticipacionEnEvento);

// Restaurar empresa eliminada
router.post('/:id/restore', authenticate, authorize(['administrador']), EmpresaExpositoraController.restoreEmpresa);

// Obtener empresa por ID
router.get('/:id', authenticate, authorize(['administrador', 'manager']), EmpresaExpositoraController.getEmpresaExpositoraById);

// Obtener empresa por RUC
router.get('/ruc/:ruc', authenticate, authorize(['administrador', 'manager']), EmpresaExpositoraController.getEmpresaByRuc);

// Obtener empresa por email
router.get('/email/:email', authenticate, authorize(['administrador', 'manager']), EmpresaExpositoraController.getEmpresaByEmail);

// Crear nueva empresa expositora (admin)
router.post('/', authenticate, authorize(['administrador', 'manager']), auditCreate, EmpresaExpositoraController.createEmpresaExpositora);

// Actualizar empresa expositora
router.put('/:id', authenticate, authorize(['administrador', 'manager']), auditUpdate, EmpresaExpositoraController.updateEmpresaExpositora);

// Eliminar empresa expositora
router.delete('/:id', authenticate, authorize(['administrador']), auditDelete, EmpresaExpositoraController.deleteEmpresaExpositora);

module.exports = router;

/**
 * Middleware de Auditoría
 * Captura automáticamente la información del usuario que realiza las operaciones
 */

/**
 * Middleware para capturar información de auditoría en creación
 * Debe usarse ANTES de procesar la request
 */
const auditCreate = (req, res, next) => {
  try {
    if (req.user && req.user.id_usuario) {
      // Agregar campos de auditoría al body
      if (!req.body.auditInfo) {
        req.body.auditInfo = {};
      }
      
      req.body.auditInfo.created_by = req.user.id_usuario;
      req.body.auditInfo.created_at = new Date();
      
      // También agregarlo directamente al body para facilidad de uso
      req.body.created_by = req.user.id_usuario;
    }
    
    next();
  } catch (error) {
    console.error('Error en middleware auditCreate:', error);
    next(error);
  }
};

/**
 * Middleware para capturar información de auditoría en actualización
 * Debe usarse ANTES de procesar la request
 */
const auditUpdate = (req, res, next) => {
  try {
    if (req.user && req.user.id_usuario) {
      // Agregar campos de auditoría al body
      if (!req.body.auditInfo) {
        req.body.auditInfo = {};
      }
      
      req.body.auditInfo.updated_by = req.user.id_usuario;
      req.body.auditInfo.updated_at = new Date();
      
      // También agregarlo directamente al body para facilidad de uso
      req.body.updated_by = req.user.id_usuario;
      req.body.updated_at = new Date();
    }
    
    next();
  } catch (error) {
    console.error('Error en middleware auditUpdate:', error);
    next(error);
  }
};

/**
 * Middleware para capturar información de auditoría en eliminación lógica
 * Debe usarse ANTES de procesar la request
 */
const auditDelete = (req, res, next) => {
  try {
    if (req.user && req.user.id_usuario) {
      // Agregar campos de auditoría al body
      if (!req.body.auditInfo) {
        req.body.auditInfo = {};
      }
      
      req.body.auditInfo.deleted_by = req.user.id_usuario;
      req.body.auditInfo.deleted_at = new Date();
      
      // También agregarlo directamente al body para facilidad de uso
      req.body.deleted_by = req.user.id_usuario;
      req.body.deleted_at = new Date();
    }
    
    next();
  } catch (error) {
    console.error('Error en middleware auditDelete:', error);
    next(error);
  }
};

/**
 * Función helper para extraer campos de auditoría de una request
 */
const extractAuditFields = (req, operation = 'create') => {
  const auditFields = {};
  
  if (!req.user || !req.user.id_usuario) {
    return auditFields;
  }
  
  const userId = req.user.id_usuario;
  const now = new Date();
  
  switch (operation) {
    case 'create':
      auditFields.created_by = userId;
      auditFields.created_at = now;
      break;
      
    case 'update':
      auditFields.updated_by = userId;
      auditFields.updated_at = now;
      break;
      
    case 'delete':
      auditFields.deleted_by = userId;
      auditFields.deleted_at = now;
      break;
      
    default:
      break;
  }
  
  return auditFields;
};

/**
 * Función helper para preparar datos de creación con auditoría
 */
const prepareCreateData = (req, data) => {
  const auditFields = extractAuditFields(req, 'create');
  return {
    ...data,
    ...auditFields
  };
};

/**
 * Función helper para preparar datos de actualización con auditoría
 */
const prepareUpdateData = (req, data) => {
  const auditFields = extractAuditFields(req, 'update');
  return {
    ...data,
    ...auditFields
  };
};

/**
 * Función helper para preparar datos de eliminación lógica con auditoría
 */
const prepareDeleteData = (req) => {
  return extractAuditFields(req, 'delete');
};

/**
 * Middleware combinado que puede manejar múltiples operaciones
 */
const auditMiddleware = (operations = ['create', 'update', 'delete']) => {
  return (req, res, next) => {
    try {
      if (req.user && req.user.id_usuario) {
        const userId = req.user.id_usuario;
        const now = new Date();
        
        // Inicializar objeto de auditoría si no existe
        if (!req.audit) {
          req.audit = {};
        }
        
        // Agregar funciones helper al request
        req.audit.create = (data) => prepareCreateData(req, data);
        req.audit.update = (data) => prepareUpdateData(req, data);
        req.audit.delete = () => prepareDeleteData(req);
        
        // Agregar información del usuario
        req.audit.user = {
          id: userId,
          correo: req.user.correo
        };
        
        // Agregar campos directamente según las operaciones permitidas
        if (operations.includes('create')) {
          req.body.created_by = userId;
        }
        
        if (operations.includes('update')) {
          req.body.updated_by = userId;
          req.body.updated_at = now;
        }
        
        if (operations.includes('delete')) {
          req.body.deleted_by = userId;
          req.body.deleted_at = now;
        }
      }
      
      next();
    } catch (error) {
      console.error('Error en auditMiddleware:', error);
      next(error);
    }
  };
};

module.exports = {
  auditCreate,
  auditUpdate,
  auditDelete,
  auditMiddleware,
  extractAuditFields,
  prepareCreateData,
  prepareUpdateData,
  prepareDeleteData
};

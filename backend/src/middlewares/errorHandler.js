/**
 * Middleware de manejo centralizado de errores
 */
const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err);

  // Error de Sequelize - Validación
  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map(e => ({
      field: e.path,
      message: e.message
    }));
    
    return res.status(400).json({
      error: 'Error de validación',
      details: errors
    });
  }

  // Error de Sequelize - Constraint único
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors?.[0]?.path || 'campo';
    return res.status(409).json({
      error: 'Conflicto de datos',
      message: `El ${field} ya existe en el sistema`
    });
  }

  // Error de Sequelize - Foreign Key
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      error: 'Error de referencia',
      message: 'Existe una relación que impide esta operación'
    });
  }

  // Error de Sequelize - Conexión
  if (err.name === 'SequelizeConnectionError') {
    return res.status(503).json({
      error: 'Error de conexión',
      message: 'No se pudo conectar a la base de datos'
    });
  }

  // Error de JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Token inválido',
      message: 'El token de autenticación no es válido'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expirado',
      message: 'El token de autenticación ha expirado'
    });
  }

  // Error de sintaxis JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: 'JSON inválido',
      message: 'El formato de los datos enviados no es válido'
    });
  }

  // Error personalizado con status
  if (err.status) {
    return res.status(err.status).json({
      error: err.message || 'Error en el servidor',
      details: err.details || null
    });
  }

  // Error genérico del servidor
  res.status(500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo salió mal'
  });
};

module.exports = errorHandler;

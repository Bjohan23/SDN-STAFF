const swaggerJSDoc = require('swagger-jsdoc');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SDN-STAFF API',
      version: '1.0.0',
      description: 'Backend para sistema de gestión de staff con arquitectura de capas',
      contact: {
        name: 'SDN-STAFF Team',
        email: 'admin@sdn-staff.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desarrollo (puerto 3000)'
      },
      {
        url: 'http://localhost:8000',
        description: 'Servidor de desarrollo (puerto 8000)'
      },
      {
        url: 'http://localhost:3001',
        description: 'Servidor de desarrollo (puerto 3001)'
      }
    ],
    components: {
      schemas: {
        Usuario: {
          type: 'object',
          required: ['username', 'password'],
          properties: {
            id_usuario: {
              type: 'integer',
              description: 'ID único del usuario',
              example: 1
            },
            username: {
              type: 'string',
              minLength: 3,
              maxLength: 50,
              description: 'Nombre de usuario único',
              example: 'admin'
            },
            password: {
              type: 'string',
              minLength: 6,
              description: 'Contraseña del usuario',
              example: 'admin123'
            },
            estado: {
              type: 'string',
              enum: ['activo', 'inactivo', 'suspendido'],
              description: 'Estado del usuario',
              example: 'activo'
            },
            fecha_creacion: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación del usuario',
              example: '2025-05-23T17:24:07.000Z'
            },
            ultima_sesion: {
              type: 'string',
              format: 'date-time',
              description: 'Última sesión del usuario',
              example: '2025-05-23T18:30:00.000Z'
            },
            roles: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Rol'
              },
              description: 'Roles asignados al usuario'
            }
          }
        },
        Rol: {
          type: 'object',
          required: ['nombre_rol'],
          properties: {
            id_rol: {
              type: 'integer',
              description: 'ID único del rol',
              example: 1
            },
            nombre_rol: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
              description: 'Nombre único del rol',
              example: 'Administrador'
            },
            descripcion: {
              type: 'string',
              description: 'Descripción del rol',
              example: 'Control total del sistema'
            }
          }
        },
        User: {
          type: 'object',
          required: ['firstName', 'lastName', 'email', 'password'],
          properties: {
            id: {
              type: 'integer',
              description: 'ID único del usuario',
              example: 1
            },
            firstName: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
              description: 'Nombre del usuario',
              example: 'Juan'
            },
            lastName: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
              description: 'Apellido del usuario',
              example: 'Pérez'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email único del usuario',
              example: 'juan@example.com'
            },
            password: {
              type: 'string',
              minLength: 6,
              description: 'Contraseña del usuario',
              example: '123456'
            },
            phone: {
              type: 'string',
              description: 'Teléfono del usuario',
              example: '+51987654321'
            },
            isActive: {
              type: 'boolean',
              description: 'Si el usuario está activo',
              example: true
            },
            role: {
              type: 'string',
              enum: ['admin', 'manager', 'employee'],
              description: 'Rol del usuario',
              example: 'employee'
            }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['username', 'password'],
          properties: {
            username: {
              type: 'string',
              description: 'Nombre de usuario',
              example: 'admin'
            },
            password: {
              type: 'string',
              description: 'Contraseña del usuario',
              example: 'admin123'
            }
          }
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Indica si la operación fue exitosa',
              example: true
            },
            message: {
              type: 'string',
              description: 'Mensaje descriptivo de la respuesta',
              example: 'Operación exitosa'
            },
            data: {
              type: 'object',
              description: 'Datos de la respuesta'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp de la respuesta',
              example: '2025-05-23T17:24:07.000Z'
            }
          }
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Datos obtenidos exitosamente'
            },
            data: {
              type: 'array',
              items: {
                type: 'object'
              }
            },
            pagination: {
              type: 'object',
              properties: {
                currentPage: {
                  type: 'integer',
                  example: 1
                },
                totalPages: {
                  type: 'integer',
                  example: 5
                },
                totalItems: {
                  type: 'integer',
                  example: 50
                },
                itemsPerPage: {
                  type: 'integer',
                  example: 10
                },
                hasNextPage: {
                  type: 'boolean',
                  example: true
                },
                hasPrevPage: {
                  type: 'boolean',
                  example: false
                }
              }
            },
            timestamp: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'string',
              description: 'Mensaje de error',
              example: 'Error en el servidor'
            },
            details: {
              type: 'object',
              description: 'Detalles adicionales del error'
            },
            timestamp: {
              type: 'string',
              format: 'date-time'
            }
          }
        }
      },
      parameters: {
        PageParam: {
          name: 'page',
          in: 'query',
          description: 'Número de página',
          required: false,
          schema: {
            type: 'integer',
            minimum: 1,
            default: 1
          }
        },
        LimitParam: {
          name: 'limit',
          in: 'query',
          description: 'Cantidad de elementos por página',
          required: false,
          schema: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 10
          }
        },
        SearchParam: {
          name: 'search',
          in: 'query',
          description: 'Término de búsqueda',
          required: false,
          schema: {
            type: 'string'
          }
        }
      },
      responses: {
        Success: {
          description: 'Operación exitosa',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ApiResponse'
              }
            }
          }
        },
        BadRequest: {
          description: 'Error de validación',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        Unauthorized: {
          description: 'No autorizado',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        NotFound: {
          description: 'Recurso no encontrado',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        InternalError: {
          description: 'Error interno del servidor',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Público',
        description: 'Endpoints públicos que no requieren autenticación'
      },
      {
        name: 'Autenticación',
        description: 'Gestión de autenticación JWT y sesión de usuarios'
      },
      {
        name: 'Health',
        description: 'Endpoints de salud del sistema'
      },
      {
        name: 'Usuarios',
        description: 'Gestión de usuarios (Nuevo modelo) - Requiere JWT'
      },
      {
        name: 'Roles',
        description: 'Gestión de roles del sistema - Requiere JWT'
      },
      {
        name: 'Users',
        description: 'Gestión de usuarios (Modelo anterior - Compatibilidad) - Requiere JWT'
      }
    ]
  },
  apis: [
    './src/routes/*.js',
    './src/controllers/*.js',
    './src/app.js'
  ]
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

module.exports = swaggerSpec;

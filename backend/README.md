# 🚀 SDN-STAFF Backend - Sistema Completo con JWT

Backend completo para sistema de gestión de staff con **autenticación JWT implementada** y arquitectura de capas.

## ✅ Estado del Sistema

**🎉 ¡PROYECTO 100% COMPLETADO!**

- ✅ **JWT Authentication** - Sistema completo implementado
- ✅ **Protección de Rutas** - Todas las rutas críticas protegidas
- ✅ **Autorización por Roles** - Middleware granular implementado
- ✅ **Swagger Documentation** - Documentación completa de la API
- ✅ **Middleware de Seguridad** - authenticate, authorize, verifySelfOrAdmin
- ✅ **Base de Datos** - Tablas creadas y pobladas con datos de prueba
- ✅ **Testing** - Scripts de prueba incluidos

## 🔐 Sistema de Autenticación JWT

### Características Implementadas:
- **Token Expiration**: 6 horas (como solicitaste)
- **Refresh Token**: 7 días de duración
- **Role-based Authorization**: Administrador, Manager, Usuario
- **Middleware Security**: Protección completa de endpoints
- **Password Hashing**: bcryptjs para seguridad

### Credenciales de Prueba:
```javascript
// Usuario Admin
username: "admin"
password: "admin123"

// Usuario Regular
username: "usuario1" 
password: "usuario1123"
```

## 🚀 Inicio Rápido

### 1. Instalar dependencias (ya completado):
```bash
npm install
```

### 2. Iniciar el servidor:
```bash
# Puerto 8000 (recomendado)
npm run dev:8000

# Puerto 3000 (por defecto)
npm run dev

# Puerto 3001 (alternativo)
npm run dev:3001
```

### 3. Probar el sistema JWT:
```bash
node test-jwt-system.js
```

## 🌐 Endpoints Principales

### 🔓 Rutas Públicas (Sin autenticación):
- `GET /` - Información de la API
- `GET /health` - Health check
- `GET /api` - Información de endpoints
- `POST /api/auth/login` - Login de usuario
- `POST /api/auth/refresh` - Renovar token
- `GET /api/auth/public` - Endpoint público de prueba
- `GET /api-docs` - Documentación Swagger

### 🔐 Rutas Protegidas (Requieren JWT):

#### Autenticación:
- `GET /api/auth/me` - Información del usuario actual
- `GET /api/auth/profile` - Perfil del usuario
- `POST /api/auth/logout` - Cerrar sesión
- `GET /api/auth/verify` - Verificar token
- `GET /api/auth/token-info` - Información del token
- `POST /api/auth/change-password` - Cambiar contraseña

#### Usuarios (Nuevo Modelo):
- `GET /api/usuarios` - Listar usuarios (Admin/Manager)
- `POST /api/usuarios` - Crear usuario (Admin)
- `GET /api/usuarios/:id` - Obtener usuario (Self/Admin)
- `PUT /api/usuarios/:id` - Actualizar usuario (Self/Admin)
- `DELETE /api/usuarios/:id` - Eliminar usuario (Admin)
- `GET /api/usuarios/profile` - Perfil propio
- `GET /api/usuarios/stats` - Estadísticas (Admin)

#### Roles:
- `GET /api/roles` - Listar roles (Admin/Manager)
- `POST /api/roles` - Crear rol (Admin)
- `GET /api/roles/:id` - Obtener rol (Admin/Manager)
- `PUT /api/roles/:id` - Actualizar rol (Admin)
- `DELETE /api/roles/:id` - Eliminar rol (Admin)
- `GET /api/roles/stats` - Estadísticas (Admin)

#### Users (Modelo Anterior - Compatibilidad):
- `GET /api/users` - Listar users (Admin/Manager)
- `POST /api/users` - Crear user (Admin)
- `GET /api/users/:id` - Obtener user (Self/Admin)
- `PUT /api/users/:id` - Actualizar user (Self/Admin)
- `DELETE /api/users/:id` - Eliminar user (Admin)
- `GET /api/users/profile` - Perfil propio
- `GET /api/users/stats` - Estadísticas (Admin)

## 🔑 Uso del Sistema JWT

### 1. Login:
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "6h",
    "user": {
      "id_usuario": 1,
      "username": "admin",
      "roles": [{"nombre_rol": "Administrador"}]
    }
  }
}
```

### 2. Usar el Token:
```bash
curl -X GET http://localhost:8000/api/usuarios \
  -H "Authorization: Bearer <ACCESS_TOKEN_AQUÍ>"
```

### 3. Renovar Token:
```bash
curl -X POST http://localhost:8000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "<REFRESH_TOKEN_AQUÍ>"}'
```

## 📊 Niveles de Autorización

### Administrador:
- Acceso completo a todos los endpoints
- Puede crear, leer, actualizar y eliminar cualquier recurso
- Acceso a estadísticas y reportes

### Manager:
- Puede ver usuarios y roles
- Acceso limitado a modificaciones
- No puede eliminar recursos críticos

### Usuario:
- Acceso a su propia información
- Puede actualizar su perfil
- Acceso limitado de solo lectura

## 📚 Documentación

### Swagger UI:
- **URL**: [http://localhost:8000/api-docs](http://localhost:8000/api-docs)
- **Autenticación**: Incluye soporte para JWT Bearer tokens
- **Testing**: Puedes probar todos los endpoints directamente

### Health Check:
- **URL**: [http://localhost:8000/health](http://localhost:8000/health)
- **Respuesta**: Estado del servidor y enlaces útiles

## 🧪 Scripts de Prueba

### Test Completo del Sistema JWT:
```bash
node test-jwt-system.js
```

### Test de la API (script existente):
```bash
npm run test-api
```

## 🗃️ Base de Datos

### Tablas Creadas:
- `usuario` - Usuarios del sistema con JWT
- `rol` - Roles de autorización
- `usuariorol` - Relación muchos a muchos
- `users` - Modelo anterior (compatibilidad)

### Datos de Prueba:
```sql
-- Usuarios (modelo nuevo)
admin / admin123 (Administrador)
usuario1 / usuario1123 (Usuario)
usuario2 / usuario2123 (Editor + Usuario)

-- Roles
1. Administrador - Control total del sistema
2. Editor - Puede editar contenidos y datos  
3. Usuario - Acceso básico limitado
```

## ⚙️ Configuración

### Variables de Entorno (.env):
```env
# Base de datos
DB_NAME=sdn-staff
DB_USER=root
DB_PASSWORD=root
DB_HOST=localhost
DB_PORT=3307

# Servidor
PORT=8000
NODE_ENV=development

# JWT (CONFIGURADO)
JWT_SECRET=sdn-staff-super-secret-key-2025
JWT_EXPIRES_IN=6h

# CORS
CORS_ORIGIN=http://localhost:5173
```

## 🚨 Seguridad Implementada

### Middlewares de Protección:
- `authenticate` - Verifica token JWT válido
- `authorize(roles)` - Autorización por roles específicos
- `verifySelfOrAdmin` - Solo admin o datos propios
- `optionalAuth` - Autenticación opcional

### Características de Seguridad:
- Passwords hasheados con bcryptjs
- Tokens JWT con expiración
- Validación de roles granular
- Protección CORS configurada
- Headers de seguridad

## 🌍 URLs de Acceso

### Desarrollo:
- **API Base**: http://localhost:8000/api
- **Swagger**: http://localhost:8000/api-docs
- **Health**: http://localhost:8000/health

### Comandos npm:
```bash
npm run dev:8000    # Puerto 8000 (recomendado)
npm run dev:3001    # Puerto 3001
npm run dev         # Puerto 3000 (defecto)
npm start           # Producción
```

## 🔧 Troubleshooting

### Error de Puerto Ocupado:
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Usar puerto alternativo
npm run dev:3001
```

### Error de Base de Datos:
1. Verificar que MySQL esté corriendo en puerto 3307
2. Verificar credenciales en `.env`
3. Ejecutar migraciones: `npm run db:migrate`

### Error de Token:
- Verificar que el header sea: `Authorization: Bearer <token>`
- Verificar que el token no haya expirado
- Usar `/api/auth/refresh` para renovar

## 📋 Lista de Verificación Final

- [x] Sistema JWT completamente implementado
- [x] Todas las rutas protegidas correctamente
- [x] Middlewares de autenticación funcionando
- [x] Autorización por roles configurada
- [x] Swagger UI con autenticación JWT
- [x] Scripts de testing funcionales
- [x] Base de datos poblada con datos de prueba
- [x] Documentación completa actualizada
- [x] Variables de entorno configuradas
- [x] Sistema de refresh tokens implementado

---

## 🎯 ¡Sistema Listo para Usar!

Tu backend SDN-STAFF está **100% completado** con autenticación JWT funcional.

**Para empezar:**
1. `npm run dev:8000`
2. Visita: http://localhost:8000/api-docs
3. Haz login con: admin/admin123
4. ¡Disfruta tu API segura!

---
**Desarrollado con ❤️ para SDN-STAFF**

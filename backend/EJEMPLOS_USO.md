# Ejemplos de Uso - API SDN-STAFF

Este archivo contiene ejemplos prácticos de cómo usar la API con los nuevos modelos Usuario y Rol.

## 🔐 Autenticación

### Login de usuario
```bash
curl -X POST http://localhost:3000/api/usuarios/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

## 👥 Gestión de Usuarios

### 1. Crear usuario básico
```bash
curl -X POST http://localhost:3000/api/usuarios \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "password": "secure123",
    "estado": "activo"
  }'
```

### 2. Crear usuario con roles asignados
```bash
curl -X POST http://localhost:3000/api/usuarios \
  -H "Content-Type: application/json" \
  -d '{
    "username": "developer",
    "password": "dev123",
    "estado": "activo",
    "roles": [2, 3]
  }'
```

### 3. Obtener lista de usuarios con filtros
```bash
# Todos los usuarios
curl "http://localhost:3000/api/usuarios"

# Con paginación
curl "http://localhost:3000/api/usuarios?page=1&limit=5"

# Buscar por username
curl "http://localhost:3000/api/usuarios?search=admin"

# Filtrar por estado
curl "http://localhost:3000/api/usuarios?estado=activo"
```

### 4. Obtener usuario específico
```bash
# Por ID
curl "http://localhost:3000/api/usuarios/1"

# Por username
curl "http://localhost:3000/api/usuarios/username/admin"
```

### 5. Actualizar usuario
```bash
curl -X PUT http://localhost:3000/api/usuarios/1 \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin_updated",
    "estado": "activo"
  }'
```

### 6. Cambiar estado de usuario
```bash
curl -X PATCH http://localhost:3000/api/usuarios/1/estado \
  -H "Content-Type: application/json" \
  -d '{
    "estado": "suspendido"
  }'
```

### 7. Asignar roles a usuario
```bash
curl -X POST http://localhost:3000/api/usuarios/1/roles \
  -H "Content-Type: application/json" \
  -d '{
    "roles": [1, 2]
  }'
```

### 8. Verificar si usuario tiene rol específico
```bash
curl "http://localhost:3000/api/usuarios/1/rol?rol=Administrador"
```

### 9. Obtener estadísticas de usuarios
```bash
curl "http://localhost:3000/api/usuarios/stats"
```

### 10. Eliminar usuario
```bash
curl -X DELETE http://localhost:3000/api/usuarios/1
```

## 🎭 Gestión de Roles

### 1. Crear rol
```bash
curl -X POST http://localhost:3000/api/roles \
  -H "Content-Type: application/json" \
  -d '{
    "nombre_rol": "Desarrollador",
    "descripcion": "Desarrollador de software con acceso completo al código"
  }'
```

### 2. Obtener todos los roles
```bash
# Solo roles
curl "http://localhost:3000/api/roles"

# Roles con usuarios incluidos
curl "http://localhost:3000/api/roles?include_usuarios=true"
```

### 3. Obtener rol específico
```bash
# Por ID
curl "http://localhost:3000/api/roles/1"

# Por nombre
curl "http://localhost:3000/api/roles/nombre/Administrador"

# Con usuarios incluidos
curl "http://localhost:3000/api/roles/1?include_usuarios=true"
```

### 4. Actualizar rol
```bash
curl -X PUT http://localhost:3000/api/roles/1 \
  -H "Content-Type: application/json" \
  -d '{
    "nombre_rol": "Super Administrador",
    "descripcion": "Control total del sistema con privilegios extendidos"
  }'
```

### 5. Obtener usuarios asignados a un rol
```bash
# Con paginación
curl "http://localhost:3000/api/roles/1/usuarios?page=1&limit=10"
```

### 6. Asignar rol a usuario específico
```bash
curl -X POST http://localhost:3000/api/roles/2/asignar \
  -H "Content-Type: application/json" \
  -d '{
    "usuario_id": 3
  }'
```

### 7. Remover rol de usuario
```bash
curl -X DELETE http://localhost:3000/api/roles/2/remover \
  -H "Content-Type: application/json" \
  -d '{
    "usuario_id": 3
  }'
```

### 8. Obtener estadísticas de roles
```bash
curl "http://localhost:3000/api/roles/stats"
```

### 9. Obtener roles sin usuarios asignados
```bash
curl "http://localhost:3000/api/roles/sin-usuarios"
```

### 10. Eliminar rol
```bash
curl -X DELETE http://localhost:3000/api/roles/4
```

## 📊 Consultas de Información

### Health Check
```bash
curl "http://localhost:3000/health"
```

### Información de la API
```bash
curl "http://localhost:3000/api"
```

## 🚀 Flujo de Trabajo Típico

### 1. Crear un nuevo desarrollador
```bash
# Paso 1: Crear el usuario
curl -X POST http://localhost:3000/api/usuarios \
  -H "Content-Type: application/json" \
  -d '{
    "username": "dev_juan",
    "password": "dev123secure",
    "estado": "activo"
  }'

# Paso 2: Asignar roles (asumiendo que el usuario creado tiene ID 4)
curl -X POST http://localhost:3000/api/usuarios/4/roles \
  -H "Content-Type: application/json" \
  -d '{
    "roles": [2, 3]
  }'
```

### 2. Crear un rol personalizado y asignarlo
```bash
# Paso 1: Crear el rol
curl -X POST http://localhost:3000/api/roles \
  -H "Content-Type: application/json" \
  -d '{
    "nombre_rol": "QA Tester",
    "descripcion": "Encargado de pruebas de calidad"
  }'

# Paso 2: Asignar el rol a un usuario (asumiendo rol ID 4)
curl -X POST http://localhost:3000/api/roles/4/asignar \
  -H "Content-Type: application/json" \
  -d '{
    "usuario_id": 2
  }'
```

### 3. Audit y mantenimiento
```bash
# Obtener usuarios inactivos
curl "http://localhost:3000/api/usuarios?estado=inactivo"

# Obtener roles sin usuarios
curl "http://localhost:3000/api/roles/sin-usuarios"

# Estadísticas generales
curl "http://localhost:3000/api/usuarios/stats"
curl "http://localhost:3000/api/roles/stats"
```

## ⚠️ Notas Importantes

1. **Estados de Usuario**: activo, inactivo, suspendido
2. **Roles Múltiples**: Un usuario puede tener múltiples roles
3. **Validaciones**: Los nombres de usuario deben ser únicos
4. **Eliminación de Roles**: No se puede eliminar un rol que tiene usuarios asignados
5. **Autenticación**: Actualmente el login es básico, se recomienda implementar JWT

## 🔧 Troubleshooting

### Error 409 - Conflicto
- Username ya existe
- Rol ya existe
- Usuario ya tiene el rol asignado

### Error 404 - No encontrado
- Usuario no existe
- Rol no existe
- Relación usuario-rol no existe

### Error 400 - Validación
- Datos requeridos faltantes
- Formato de datos incorrecto
- IDs inválidos

# SDN-STAFF Backend

Backend desarrollado con Node.js, Express y Sequelize ORM siguiendo arquitectura de capas.

## 🚀 Tecnologías

- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **Sequelize** - ORM para base de datos
- **MySQL** - Base de datos
- **bcryptjs** - Encriptación de contraseñas
- **JWT** - Autenticación
- **dotenv** - Variables de entorno

## 📁 Estructura del Proyecto

```
backend/
├── src/
│   ├── config/          # Configuraciones
│   ├── controllers/     # Controladores
│   ├── models/          # Modelos de Sequelize
│   ├── routes/          # Rutas de la API
│   ├── services/        # Lógica de negocio
│   ├── middlewares/     # Middlewares personalizados
│   ├── utils/           # Utilidades
│   ├── validators/      # Validaciones
│   └── app.js          # Configuración principal de Express
├── migrations/          # Migraciones de BD
├── seeders/            # Datos iniciales
├── .env                # Variables de entorno
├── .sequelizerc        # Configuración de Sequelize CLI
├── package.json        # Dependencias
└── index.js           # Punto de entrada
```

## ⚙️ Configuración

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

El archivo `.env` ya está configurado con:

```env
DB_NAME=sdn-staff
DB_USER=root
DB_PASSWORD=root
DB_HOST=localhost
DB_PORT=3307
```

### 3. Crear la base de datos

```bash
npm run db:create
```

### 4. Ejecutar migraciones

```bash
npm run db:migrate
```

### 5. Ejecutar seeders (opcional)

```bash
npm run db:seed
```

### 6. Iniciar el servidor

```bash
# Desarrollo (con nodemon)
npm run dev

# Producción
npm start
```

El servidor se ejecutará en: `http://localhost:3000`

## 📚 Modelos de Base de Datos

### Modelo Usuario (Nuevo)
- **id_usuario**: ID único (SERIAL/AUTO_INCREMENT)
- **username**: Nombre de usuario único (3-50 caracteres)
- **password_hash**: Contraseña encriptada
- **estado**: Estado del usuario (activo, inactivo, suspendido)
- **fecha_creacion**: Fecha de creación
- **ultima_sesion**: Última vez que inició sesión

### Modelo Rol
- **id_rol**: ID único (SERIAL/AUTO_INCREMENT)
- **nombre_rol**: Nombre del rol único (2-50 caracteres)
- **descripcion**: Descripción del rol (opcional)

### Modelo UsuarioRol (Tabla intermedia)
- **id_usuario**: Referencia al Usuario
- **id_rol**: Referencia al Rol
- **fecha_asignacion**: Fecha de asignación del rol

### Relaciones
- Usuario ↔️ Rol (Many-to-Many a través de UsuarioRol)
- Un usuario puede tener múltiples roles
- Un rol puede ser asignado a múltiples usuarios

## 📚 API Endpoints

### Health Check
- **GET** `/health` - Verificar estado del servidor

### Usuarios (Nuevo modelo)
- **GET** `/api/usuarios` - Obtener todos los usuarios
- **GET** `/api/usuarios/:id` - Obtener usuario por ID
- **GET** `/api/usuarios/username/:username` - Obtener usuario por username
- **GET** `/api/usuarios/stats` - Estadísticas de usuarios
- **POST** `/api/usuarios` - Crear nuevo usuario
- **POST** `/api/usuarios/login` - Login de usuario
- **PUT** `/api/usuarios/:id` - Actualizar usuario
- **PATCH** `/api/usuarios/:id/estado` - Cambiar estado de usuario
- **POST** `/api/usuarios/:id/roles` - Asignar roles a usuario
- **GET** `/api/usuarios/:id/rol` - Verificar si usuario tiene rol específico
- **DELETE** `/api/usuarios/:id` - Eliminar usuario

### Roles
- **GET** `/api/roles` - Obtener todos los roles
- **GET** `/api/roles/:id` - Obtener rol por ID
- **GET** `/api/roles/nombre/:nombre` - Obtener rol por nombre
- **GET** `/api/roles/stats` - Estadísticas de roles
- **GET** `/api/roles/sin-usuarios` - Roles sin usuarios asignados
- **GET** `/api/roles/:id/usuarios` - Usuarios asignados a un rol
- **POST** `/api/roles` - Crear nuevo rol
- **PUT** `/api/roles/:id` - Actualizar rol
- **POST** `/api/roles/:id/asignar` - Asignar rol a usuario
- **DELETE** `/api/roles/:id/remover` - Remover rol de usuario
- **DELETE** `/api/roles/:id` - Eliminar rol

### Usuarios (Modelo anterior - mantenido por compatibilidad)
- **GET** `/api/users` - Obtener todos los usuarios
- **GET** `/api/users/:id` - Obtener usuario por ID
- **GET** `/api/users/stats` - Estadísticas de usuarios
- **POST** `/api/users` - Crear nuevo usuario
- **PUT** `/api/users/:id` - Actualizar usuario
- **DELETE** `/api/users/:id` - Eliminar usuario

### Ejemplo de creación de usuario (Nuevo modelo)

```bash
curl -X POST http://localhost:3000/api/usuarios \\
  -H "Content-Type: application/json" \\
  -d '{
    "username": "testuser",
    "password": "123456",
    "estado": "activo",
    "roles": [1, 3]
  }'
```

### Ejemplo de login

```bash
curl -X POST http://localhost:3000/api/usuarios/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

### Ejemplo de creación de rol

```bash
curl -X POST http://localhost:3000/api/roles \\
  -H "Content-Type: application/json" \\
  -d '{
    "nombre_rol": "Desarrollador",
    "descripcion": "Desarrollador de software con acceso a repositorios"
  }'
```

### Ejemplo de creación de usuario (Modelo anterior)

```bash
curl -X POST http://localhost:3000/api/users \\
  -H "Content-Type: application/json" \\
  -d '{
    "firstName": "Juan",
    "lastName": "Pérez",
    "email": "juan@example.com",
    "password": "123456",
    "phone": "+51987654321",
    "role": "employee"
  }'
```

## 🗄️ Base de Datos

### Usuarios de prueba (Nuevo modelo) creados por seeders:

1. **admin** / admin123 - Rol: Administrador
2. **usuario1** / usuario1123 - Rol: Usuario
3. **usuario2** / usuario2123 - Roles: Editor y Usuario

### Roles creados por seeders:

1. **Administrador** - Control total del sistema
2. **Editor** - Puede editar contenidos y datos
3. **Usuario** - Acceso básico limitado

### Usuarios de prueba (Modelo anterior) creados por seeders:

1. **Admin**: admin@sdn-staff.com / 123456
2. **Manager**: manager@sdn-staff.com / 123456  
3. **Empleados**: juan.perez@sdn-staff.com / 123456

## 🛠️ Scripts Disponibles

```bash
npm run dev          # Iniciar en modo desarrollo
npm start           # Iniciar en modo producción
npm run db:create   # Crear base de datos
npm run db:migrate  # Ejecutar migraciones
npm run db:migrate:undo  # Revertir última migración
npm run db:seed     # Ejecutar seeders
```

## 🏗️ Arquitectura de Capas

### Controllers
Manejan las peticiones HTTP y respuestas.

### Services
Contienen la lógica de negocio.

### Models
Definen la estructura de datos y relaciones.

### Routes
Definen los endpoints de la API.

### Middlewares
Procesan peticiones antes de llegar a los controladores.

### Utils
Funciones auxiliares reutilizables.

## 📝 Notas Importantes

1. **Base de datos**: Asegúrate de tener MySQL corriendo en el puerto 3307
2. **Docker**: Si usas Docker, ajusta el puerto en el archivo `.env`
3. **Migraciones**: Siempre ejecuta las migraciones antes de iniciar
4. **Seeders**: Los seeders crean usuarios de prueba
   - Nuevo modelo: passwords como admin123, usuario1123, usuario2123
   - Modelo anterior: password genérico 123456
5. **Modelos duales**: El sistema mantiene ambos modelos (User y Usuario) para compatibilidad
6. **Roles**: El nuevo sistema de roles permite asignación multiple de roles a usuarios

## 🔐 Seguridad

- Las contraseñas se encriptan con bcryptjs
- Validaciones en modelos y controladores
- Manejo centralizado de errores
- Sanitización de inputs

## 🚧 Por Implementar

- [ ] Autenticación JWT completa
- [ ] Middleware de autorización
- [ ] Validaciones con express-validator
- [ ] Rate limiting
- [ ] Logging avanzado
- [ ] Tests unitarios
- [ ] Documentación con Swagger

## 🐛 Troubleshooting

### Error de conexión a BD
Verifica que MySQL esté corriendo y las credenciales en `.env` sean correctas.

### Error de migración
Asegúrate de haber creado la base de datos primero con `npm run db:create`.

### Puerto ocupado
Cambia el puerto en `.env` agregando `PORT=3001` o el puerto deseado.

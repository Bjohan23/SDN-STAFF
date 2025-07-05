# Sistema de Asignación de Stands - SDN-STAFF

## 📋 Descripción General

El Sistema de Asignación de Stands es un módulo completo que gestiona todo el proceso de asignación de stands a empresas expositoras en eventos, desde la solicitud inicial hasta la asignación final. Incluye:

- **Gestión de Solicitudes**: Proceso completo de solicitud con estados y prioridades
- **Detección de Conflictos**: Identificación automática de conflictos de asignación
- **Resolución de Conflictos**: Herramientas para resolver conflictos manualmente
- **Asignación Automática**: Algoritmos inteligentes para asignación automática
- **Historial Completo**: Seguimiento de todos los cambios y auditoría
- **Métricas Avanzadas**: Reportes y estadísticas detalladas

## 🏗️ Arquitectura del Sistema

### Modelos de Base de Datos

#### 1. SolicitudAsignacion
```javascript
{
  id_solicitud: INTEGER (PK),
  id_empresa: INTEGER (FK),
  id_evento: INTEGER (FK),
  id_stand_solicitado: INTEGER (FK, nullable),
  modalidad_asignacion: ENUM('seleccion_directa', 'manual', 'automatica'),
  estado_solicitud: ENUM('solicitada', 'en_revision', 'aprobada', 'rechazada', 'asignada', 'cancelada'),
  prioridad_score: DECIMAL(5,2),
  fecha_solicitud: DATE,
  criterios_automaticos: JSON,
  preferencias_empresa: JSON,
  motivo_solicitud: TEXT,
  id_stand_asignado: INTEGER (FK, nullable),
  precio_ofertado: DECIMAL(10,2),
  // ... campos de auditoría
}
```

#### 2. ConflictoAsignacion
```javascript
{
  id_conflicto: INTEGER (PK),
  id_evento: INTEGER (FK),
  id_stand: INTEGER (FK),
  tipo_conflicto: ENUM('multiple_solicitudes', 'cambio_requerido', 'incompatibilidad', 'overbooking', 'conflicto_horario', 'otro'),
  empresas_en_conflicto: JSON,
  estado_conflicto: ENUM('detectado', 'en_revision', 'en_resolucion', 'resuelto', 'escalado', 'cancelado'),
  prioridad_resolucion: ENUM('baja', 'media', 'alta', 'critica'),
  empresa_asignada_final: INTEGER (FK, nullable),
  // ... campos de gestión y auditoría
}
```

#### 3. HistoricoAsignacion
```javascript
{
  id_historico: INTEGER (PK),
  id_empresa: INTEGER (FK),
  id_evento: INTEGER (FK),
  id_solicitud: INTEGER (FK, nullable),
  tipo_cambio: ENUM('asignacion_inicial', 'reasignacion', 'cancelacion', 'liberacion', 'confirmacion', 'pago_realizado', 'montaje_completado'),
  id_stand_anterior: INTEGER (FK, nullable),
  id_stand_nuevo: INTEGER (FK, nullable),
  motivo_cambio: TEXT,
  datos_adicionales: JSON,
  realizado_por: INTEGER (FK),
  // ... metadatos y auditoría
}
```

### Flujo de Estados

#### Estados de Solicitud
```
solicitada → en_revision → aprobada → asignada
                      ↓
                  rechazada
                      ↓
                  cancelada
```

#### Estados de Conflicto
```
detectado → en_revision → en_resolucion → resuelto
                                    ↓
                               escalado
                                    ↓
                              cancelado
```

## 🚀 Endpoints Disponibles

### Solicitudes de Asignación

#### Gestión Básica
- `POST /api/asignaciones/solicitudes` - Crear solicitud
- `GET /api/asignaciones/solicitudes` - Listar solicitudes
- `GET /api/asignaciones/solicitudes/:id` - Obtener solicitud específica
- `PUT /api/asignaciones/solicitudes/:id` - Actualizar solicitud
- `DELETE /api/asignaciones/solicitudes/:id` - Eliminar solicitud

#### Gestión de Estados
- `POST /api/asignaciones/solicitudes/:id/aprobar` - Aprobar solicitud
- `POST /api/asignaciones/solicitudes/:id/rechazar` - Rechazar solicitud
- `POST /api/asignaciones/solicitudes/:id/asignar-stand` - Asignar stand
- `POST /api/asignaciones/solicitudes/:id/cancelar` - Cancelar solicitud

#### Consultas Especiales
- `GET /api/asignaciones/solicitudes/evento/:evento_id/pendientes` - Solicitudes pendientes por evento
- `GET /api/asignaciones/solicitudes/stats` - Estadísticas de solicitudes
- `GET /api/asignaciones/solicitudes/:id/historial` - Historial de cambios

### Conflictos de Asignación

#### Gestión de Conflictos
- `GET /api/asignaciones/conflictos` - Listar conflictos
- `GET /api/asignaciones/conflictos/:id` - Obtener conflicto específico
- `POST /api/asignaciones/conflictos` - Crear conflicto manual
- `POST /api/asignaciones/conflictos/evento/:evento_id/detectar` - Detectar conflictos automáticamente

#### Resolución de Conflictos
- `POST /api/asignaciones/conflictos/:id/asignar` - Asignar conflicto para resolución
- `POST /api/asignaciones/conflictos/:id/resolver` - Resolver conflicto
- `POST /api/asignaciones/conflictos/:id/escalar` - Escalar conflicto
- `POST /api/asignaciones/conflictos/:id/cancelar` - Cancelar conflicto

#### Consultas y Métricas
- `GET /api/asignaciones/conflictos/vencidos` - Conflictos vencidos
- `GET /api/asignaciones/conflictos/stats` - Estadísticas de conflictos
- `GET /api/asignaciones/conflictos/dashboard/resumen` - Resumen para dashboard

### Asignación Automática

#### Ejecución
- `POST /api/asignaciones/automatica/evento/:evento_id/ejecutar` - Ejecutar asignación automática
- `POST /api/asignaciones/automatica/evento/:evento_id/simular` - Simular asignación

#### Herramientas de Análisis
- `POST /api/asignaciones/automatica/compatibilidad/:empresa_id/:stand_id` - Validar compatibilidad
- `POST /api/asignaciones/automatica/candidatos/:empresa_id/:evento_id` - Obtener mejores candidatos
- `GET /api/asignaciones/automatica/evento/:evento_id/capacidad` - Reporte de capacidad

#### Configuración y Métricas
- `GET /api/asignaciones/automatica/algoritmos` - Algoritmos disponibles
- `GET /api/asignaciones/automatica/metricas` - Métricas de rendimiento

## 🔧 Algoritmos de Asignación

### 1. Por Puntuación de Prioridad (`prioridad_score`)
- **Descripción**: Asigna stands basándose en el score de prioridad de cada empresa
- **Criterios**: 
  - Participaciones anteriores (25%)
  - Calificación promedio (50%)
  - Antigüedad como expositor (20%)
  - Estado de aprobación (5%)
- **Uso recomendado**: Eventos con empresas recurrentes

### 2. Primero en Llegar, Primero en Ser Servido (`first_come_first_served`)
- **Descripción**: Asigna stands en orden cronológico
- **Criterios**: Fecha y hora de solicitud únicamente
- **Uso recomendado**: Eventos nuevos o para igualdad de oportunidades

### 3. Algoritmo Mixto (`mixto`)
- **Descripción**: Combina prioridad (70%) con orden de llegada (30%)
- **Uso recomendado**: Balance entre fidelidad y nuevas oportunidades

## 📊 Sistema de Prioridades

El sistema calcula automáticamente un score de prioridad (0-100) basado en:

```javascript
score = Math.min(
  (participaciones_anteriores * 5) +     // Max 25 puntos
  (calificacion_promedio * 10) +         // Max 50 puntos
  (años_antiguedad * 2) +                // Max 20 puntos
  (estado_aprobado ? 5 : 0),             // 5 puntos adicionales
  100
);
```

## 🔍 Sistema de Compatibilidad

Evalúa la compatibilidad entre empresa y stand considerando:

1. **Área del Stand** (30% del score)
   - Validación de área mínima/máxima requerida
   - Proximidad al área ideal

2. **Tipo de Stand** (25% del score)
   - Compatibilidad con tamaño de empresa
   - Preferencias específicas de tipo

3. **Ubicación** (20% del score)
   - Zona preferida
   - Restricciones de ubicación

4. **Precio** (15% del score)
   - Ajuste al presupuesto máximo
   - Optimización de costos

5. **Servicios** (10% del score)
   - Disponibilidad de servicios requeridos
   - Cobertura de necesidades

## 📝 Ejemplos de Uso

### Crear una Solicitud de Asignación

```javascript
POST /api/asignaciones/solicitudes
{
  "id_empresa": 1,
  "id_evento": 1,
  "modalidad_asignacion": "seleccion_directa",
  "id_stand_solicitado": 5,
  "motivo_solicitud": "Necesitamos stand en zona principal para exposición de productos",
  "criterios_automaticos": {
    "area_minima": 20,
    "area_maxima": 40,
    "presupuesto_maximo": 2000,
    "servicios_requeridos": ["electricidad", "internet", "agua"]
  },
  "preferencias_empresa": {
    "zona_preferida": "entrada principal",
    "acceso_vehicular": true
  }
}
```

### Ejecutar Asignación Automática

```javascript
POST /api/asignaciones/automatica/evento/1/ejecutar
{
  "configuracion": {
    "algoritmo": "mixto",
    "incluir_solicitudes_automaticas": true,
    "incluir_solicitudes_pendientes": true,
    "respetar_preferencias": true,
    "optimizar_ocupacion": true,
    "permitir_reasignacion": false
  }
}
```

### Resolver un Conflicto

```javascript
POST /api/asignaciones/conflictos/1/resolver
{
  "empresa_asignada": 1,
  "criterio_aplicado": "Mayor puntuación de prioridad",
  "observaciones": "Empresa con mejor historial de participaciones y calificaciones"
}
```

## ⚡ Características Avanzadas

### Detección Automática de Conflictos
- Monitoreo continuo de solicitudes múltiples para el mismo stand
- Clasificación automática de tipo y prioridad de conflictos
- Alertas en tiempo real para conflictos críticos

### Sistema de Auditoría Completo
- Registro de todos los cambios con timestamps
- Trazabilidad completa de decisiones
- Metadatos de IP y user agent para cada acción

### Notificaciones Integradas
- Log de comunicaciones con empresas
- Sistema de notificaciones por cambios de estado
- Seguimiento de emails y comunicaciones

### Métricas en Tiempo Real
- Dashboard con KPIs del proceso de asignación
- Análisis de rendimiento de algoritmos
- Reportes de satisfacción y eficiencia

## 🔒 Seguridad y Permisos

### Roles y Permisos
- **Empresas**: Pueden crear y consultar sus propias solicitudes
- **Editores**: Gestión básica de solicitudes y consultas
- **Managers**: Aprobación, asignación y gestión de conflictos
- **Administradores**: Acceso completo incluye eliminación y configuración

### Auditoría de Seguridad
- Todos los cambios incluyen usuario responsable
- Registro de IP y user agent para acciones críticas
- Soft delete para permitir recuperación de datos

## 🚨 Consideraciones de Rendimiento

### Optimizaciones Implementadas
- Índices de base de datos en campos clave
- Paginación en todas las consultas de listado
- Lazy loading en asociaciones complejas
- Caché de cálculos de compatibilidad

### Límites Recomendados
- Máximo 1000 solicitudes por evento para asignación automática
- Límite de 100 conflictos activos simultáneos
- Timeout de 60 segundos para algoritmos de asignación

## 📈 Roadmap Futuro

### Funcionalidades Planificadas
- [ ] Integración con sistema de pagos
- [ ] Notificaciones push en tiempo real
- [ ] API para integración con plataformas externas
- [ ] Machine Learning para optimización de algoritmos
- [ ] Dashboard interactivo con mapas del evento
- [ ] Sistema de reservas temporales
- [ ] Integración con calendario para fechas de montaje

## 🛠️ Instalación y Configuración

### Prerrequisitos
- Node.js 14+
- MySQL 8.0+
- Modelos existentes de SDN-STAFF

### Instalación
1. Ejecutar migraciones:
```bash
npm run db:migrate
```

2. Cargar datos de ejemplo:
```bash
npm run db:seed
```

3. Verificar instalación:
```bash
node test-asignacion-stands.js
```

### Configuración de Algoritmos
Los algoritmos de asignación pueden configurarse modificando los parámetros en `AsignacionAutomaticaService.js`:

```javascript
// Pesos para algoritmo mixto
const PESO_PRIORIDAD = 0.7;
const PESO_ORDEN_LLEGADA = 0.3;

// Factores de compatibilidad
const FACTORES_COMPATIBILIDAD = {
  area: 0.30,
  tipo: 0.25,
  ubicacion: 0.20,
  precio: 0.15,
  servicios: 0.10
};
```

## 📞 Soporte

Para soporte técnico o consultas sobre el sistema de asignación:
- Revisar logs en `HistoricoAsignacion` para auditoría
- Usar endpoints de estadísticas para diagnóstico
- Consultar métricas de rendimiento para optimización

---

**Desarrollado por**: SDN-STAFF Team  
**Versión**: 1.0.0  
**Última actualización**: $(date)

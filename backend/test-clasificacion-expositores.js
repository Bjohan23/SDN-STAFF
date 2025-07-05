const { 
  CategoriaComercial, 
  EtiquetaLibre, 
  EmpresaExpositora, 
  EmpresaCategoria, 
  EmpresaEtiqueta,
  Usuario 
} = require('./src/models');

async function testClasificacionModule() {
  console.log('🧪 INICIANDO PRUEBAS DEL MÓDULO DE CLASIFICACIÓN DE EXPOSITORES');
  console.log('='.repeat(70));

  try {
    // ==================== PRUEBAS DE CATEGORÍAS COMERCIALES ====================
    console.log('\n📁 PRUEBAS DE CATEGORÍAS COMERCIALES');
    console.log('-'.repeat(50));

    // 1. Verificar categorías creadas
    const totalCategorias = await CategoriaComercial.count({ where: { deleted_at: null } });
    console.log(`✅ Total de categorías en el sistema: ${totalCategorias}`);

    // 2. Obtener categorías principales
    const categoriasPrincipales = await CategoriaComercial.findAll({
      where: { 
        id_categoria_padre: null, 
        deleted_at: null, 
        estado: 'activa' 
      },
      order: [['orden_visualizacion', 'ASC']]
    });
    console.log(`✅ Categorías principales encontradas: ${categoriasPrincipales.length}`);
    categoriasPrincipales.forEach(cat => {
      console.log(`   - ${cat.nombre_categoria} (${cat.slug})`);
    });

    // 3. Probar jerarquía - obtener subcategorías de Tecnología
    const tecnologia = await CategoriaComercial.findOne({
      where: { slug: 'tecnologia-e-innovacion' },
      include: [{
        model: CategoriaComercial,
        as: 'subcategorias',
        where: { deleted_at: null, estado: 'activa' },
        required: false
      }]
    });

    if (tecnologia) {
      console.log(`✅ Subcategorías de "${tecnologia.nombre_categoria}": ${tecnologia.subcategorias?.length || 0}`);
      tecnologia.subcategorias?.forEach(sub => {
        console.log(`   - ${sub.nombre_categoria}`);
      });
    }

    // ==================== PRUEBAS DE ETIQUETAS LIBRES ====================
    console.log('\n🏷️  PRUEBAS DE ETIQUETAS LIBRES');
    console.log('-'.repeat(50));

    // 1. Verificar etiquetas creadas
    const totalEtiquetas = await EtiquetaLibre.count({ where: { deleted_at: null } });
    console.log(`✅ Total de etiquetas en el sistema: ${totalEtiquetas}`);

    // 2. Obtener etiquetas por tipo
    const tiposEtiquetas = await EtiquetaLibre.findAll({
      where: { deleted_at: null, estado: 'activa' },
      attributes: [
        'tipo_etiqueta',
        [EtiquetaLibre.sequelize.fn('COUNT', EtiquetaLibre.sequelize.col('id_etiqueta')), 'cantidad']
      ],
      group: ['tipo_etiqueta'],
      raw: true
    });

    console.log('✅ Distribución de etiquetas por tipo:');
    tiposEtiquetas.forEach(tipo => {
      console.log(`   - ${tipo.tipo_etiqueta}: ${tipo.cantidad} etiquetas`);
    });

    // 3. Obtener etiquetas destacadas
    const etiquetasDestacadas = await EtiquetaLibre.findAll({
      where: { 
        deleted_at: null, 
        estado: 'activa', 
        es_destacada: true 
      },
      limit: 5
    });
    console.log(`✅ Etiquetas destacadas: ${etiquetasDestacadas.length}`);
    etiquetasDestacadas.forEach(etq => {
      console.log(`   - ${etq.nombre_etiqueta} (${etq.tipo_etiqueta})`);
    });

    // ==================== PRUEBAS DE ASIGNACIÓN A EMPRESAS ====================
    console.log('\n🏢 PRUEBAS DE ASIGNACIÓN A EMPRESAS');
    console.log('-'.repeat(50));

    // 1. Obtener primera empresa aprobada para pruebas
    const empresa = await EmpresaExpositora.findOne({
      where: { 
        deleted_at: null, 
        estado: 'aprobada' 
      },
      order: [['created_at', 'ASC']]
    });

    if (!empresa) {
      console.log('⚠️  No se encontraron empresas aprobadas para realizar pruebas');
      console.log('   Creando empresa de prueba...');
      
      // Crear empresa de prueba
      const empresaPrueba = await EmpresaExpositora.create({
        nombre_empresa: 'Tech Solutions Demo',
        email_contacto: 'demo@techsolutions.com',
        sector: 'tecnología',
        estado: 'aprobada',
        descripcion: 'Empresa de prueba para testing del sistema de clasificación'
      });
      
      console.log(`✅ Empresa de prueba creada: ${empresaPrueba.nombre_empresa}`);
      
      // Usar la empresa de prueba
      await testEmpresaClasificacion(empresaPrueba);
    } else {
      console.log(`✅ Usando empresa existente: ${empresa.nombre_empresa}`);
      await testEmpresaClasificacion(empresa);
    }

    // ==================== PRUEBAS DE BÚSQUEDA Y FILTRADO ====================
    console.log('\n🔍 PRUEBAS DE BÚSQUEDA Y FILTRADO');
    console.log('-'.repeat(50));

    // 1. Buscar categorías por término
    const resultadosBusqueda = await CategoriaComercial.findAll({
      where: {
        deleted_at: null,
        estado: 'activa',
        [CategoriaComercial.sequelize.Op.or]: [
          { nombre_categoria: { [CategoriaComercial.sequelize.Op.like]: '%tecnología%' } },
          { palabras_clave: { [CategoriaComercial.sequelize.Op.like]: '%tecnología%' } }
        ]
      },
      limit: 3
    });
    console.log(`✅ Búsqueda por "tecnología": ${resultadosBusqueda.length} resultados`);

    // 2. Buscar etiquetas por término
    const etiquetasBusqueda = await EtiquetaLibre.findAll({
      where: {
        deleted_at: null,
        estado: 'activa',
        [EtiquetaLibre.sequelize.Op.or]: [
          { nombre_etiqueta: { [EtiquetaLibre.sequelize.Op.like]: '%SaaS%' } },
          { palabras_clave: { [EtiquetaLibre.sequelize.Op.like]: '%software%' } }
        ]
      },
      limit: 3
    });
    console.log(`✅ Búsqueda de etiquetas por "SaaS/software": ${etiquetasBusqueda.length} resultados`);

    // ==================== ESTADÍSTICAS GENERALES ====================
    console.log('\n📊 ESTADÍSTICAS GENERALES DEL SISTEMA');
    console.log('-'.repeat(50));

    const stats = {
      categorias_activas: await CategoriaComercial.count({
        where: { deleted_at: null, estado: 'activa' }
      }),
      categorias_destacadas: await CategoriaComercial.count({
        where: { deleted_at: null, estado: 'activa', es_destacada: true }
      }),
      etiquetas_activas: await EtiquetaLibre.count({
        where: { deleted_at: null, estado: 'activa' }
      }),
      etiquetas_temporales: await EtiquetaLibre.count({
        where: { deleted_at: null, estado: 'activa', es_temporal: true }
      }),
      empresas_clasificadas: await EmpresaCategoria.count({
        where: { deleted_at: null },
        distinct: true,
        col: 'id_empresa'
      }),
      total_asignaciones_categoria: await EmpresaCategoria.count({
        where: { deleted_at: null }
      }),
      total_asignaciones_etiqueta: await EmpresaEtiqueta.count({
        where: { deleted_at: null }
      })
    };

    console.log('📈 Métricas del sistema:');
    Object.entries(stats).forEach(([key, value]) => {
      console.log(`   - ${key.replace(/_/g, ' ')}: ${value}`);
    });

    console.log('\n🎉 TODAS LAS PRUEBAS COMPLETADAS EXITOSAMENTE');
    console.log('='.repeat(70));

  } catch (error) {
    console.error('\n❌ ERROR EN LAS PRUEBAS:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

async function testEmpresaClasificacion(empresa) {
  console.log(`\n🧪 Probando clasificación para: ${empresa.nombre_empresa}`);
  
  try {
    // 1. Asignar categoría principal
    const categoriaTech = await CategoriaComercial.findOne({
      where: { slug: 'tecnologia-e-innovacion' }
    });

    if (categoriaTech) {
      const [asignacionCategoria, creada] = await EmpresaCategoria.findOrCreate({
        where: {
          id_empresa: empresa.id_empresa,
          id_categoria: categoriaTech.id_categoria
        },
        defaults: {
          es_categoria_principal: true,
          prioridad: 1,
          descripcion_actividad: 'Empresa líder en soluciones tecnológicas',
          estado: 'activa'
        }
      });

      if (creada) {
        console.log(`   ✅ Categoría "${categoriaTech.nombre_categoria}" asignada como principal`);
        
        // Actualizar contadores
        await categoriaTech.updateCounters();
      } else {
        console.log(`   ℹ️  Categoría ya estaba asignada`);
      }
    }

    // 2. Asignar etiquetas
    const etiquetasSugeridas = await EtiquetaLibre.findAll({
      where: {
        deleted_at: null,
        estado: 'activa',
        tipo_etiqueta: ['producto', 'tecnologia'],
        es_sugerible: true
      },
      limit: 3
    });

    console.log(`   🏷️  Asignando ${etiquetasSugeridas.length} etiquetas...`);
    
    for (const etiqueta of etiquetasSugeridas) {
      const [asignacionEtiqueta, creada] = await EmpresaEtiqueta.findOrCreate({
        where: {
          id_empresa: empresa.id_empresa,
          id_etiqueta: etiqueta.id_etiqueta
        },
        defaults: {
          relevancia: 4,
          origen_asignacion: 'automatica',
          estado: 'activa'
        }
      });

      if (creada) {
        console.log(`      - ${etiqueta.nombre_etiqueta} (${etiqueta.tipo_etiqueta})`);
        await etiqueta.incrementarUso(empresa.id_empresa);
      }
    }

    // 3. Verificar clasificación completa
    const resumen = await empresa.getResumenClasificacion();
    console.log(`   📊 Resumen de clasificación:`, resumen);

    // 4. Probar métodos de la empresa
    const categoriaPrincipal = await empresa.getCategoriaPrincipal();
    if (categoriaPrincipal) {
      console.log(`   🎯 Categoría principal: ${categoriaPrincipal.categoriaComercial.nombre_categoria}`);
    }

    const estaClasificada = await empresa.estaClasificada();
    console.log(`   ✅ ¿Está clasificada?: ${estaClasificada ? 'Sí' : 'No'}`);

  } catch (error) {
    console.error(`   ❌ Error al probar empresa ${empresa.nombre_empresa}:`, error.message);
  }
}

// Función para limpiar datos de prueba (opcional)
async function limpiarDatosPrueba() {
  console.log('\n🧹 LIMPIANDO DATOS DE PRUEBA...');
  
  try {
    // Eliminar empresa de prueba si existe
    const empresaPrueba = await EmpresaExpositora.findOne({
      where: { nombre_empresa: 'Tech Solutions Demo' }
    });

    if (empresaPrueba) {
      await empresaPrueba.softDelete();
      console.log('✅ Empresa de prueba eliminada');
    }

    console.log('✅ Limpieza completada');
  } catch (error) {
    console.error('❌ Error en limpieza:', error.message);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  testClasificacionModule()
    .then(() => {
      console.log('\n🎯 Script de pruebas finalizado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Error fatal en el script:', error);
      process.exit(1);
    });
}

module.exports = {
  testClasificacionModule,
  testEmpresaClasificacion,
  limpiarDatosPrueba
};

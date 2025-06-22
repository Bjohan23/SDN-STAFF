const { Stand, TipoStand } = require('./src/models');

async function testSimpleStandCreation() {
  try {
    console.log('🔍 Probando creación simple de stand...\n');

    // 1. Verificar tipos de stand disponibles
    const tiposStand = await TipoStand.findAll({
      where: { estado: 'activo' },
      limit: 1
    });

    if (tiposStand.length === 0) {
      console.log('❌ No hay tipos de stand disponibles');
      return;
    }

    const tipoStand = tiposStand[0];
    console.log(`✅ Usando tipo de stand: ${tipoStand.nombre_tipo}`);

    // 2. Probar creación sin precio
    console.log('\n📝 Probando creación SIN precio...');
    const standDataSinPrecio = {
      numero_stand: 'TEST-SIN-PRECIO',
      nombre_stand: 'Stand Sin Precio',
      id_tipo_stand: tipoStand.id_tipo_stand,
      area: 25.5,
      ubicacion: 'Pabellón A',
      estado_fisico: 'disponible'
      // Sin precio_personalizado
    };

    try {
      const standSinPrecio = await Stand.create(standDataSinPrecio);
      console.log('✅ Stand creado SIN precio:', standSinPrecio.numero_stand);
      console.log('   Precio personalizado:', standSinPrecio.precio_personalizado);
      
      // Limpiar
      await standSinPrecio.destroy();
      console.log('🧹 Stand eliminado');
    } catch (error) {
      console.log('❌ Error al crear stand sin precio:', error.message);
    }

    // 3. Probar creación con precio válido
    console.log('\n📝 Probando creación CON precio válido...');
    const standDataConPrecio = {
      numero_stand: 'TEST-CON-PRECIO',
      nombre_stand: 'Stand Con Precio',
      id_tipo_stand: tipoStand.id_tipo_stand,
      area: 30.0,
      ubicacion: 'Pabellón B',
      estado_fisico: 'disponible',
      precio_personalizado: 150.00
    };

    try {
      const standConPrecio = await Stand.create(standDataConPrecio);
      console.log('✅ Stand creado CON precio:', standConPrecio.numero_stand);
      console.log('   Precio personalizado:', standConPrecio.precio_personalizado);
      
      // Limpiar
      await standConPrecio.destroy();
      console.log('🧹 Stand eliminado');
    } catch (error) {
      console.log('❌ Error al crear stand con precio:', error.message);
    }

    // 4. Probar creación con precio null explícito
    console.log('\n📝 Probando creación con precio NULL explícito...');
    const standDataPrecioNull = {
      numero_stand: 'TEST-PRECIO-NULL',
      nombre_stand: 'Stand Precio Null',
      id_tipo_stand: tipoStand.id_tipo_stand,
      area: 20.0,
      ubicacion: 'Pabellón C',
      estado_fisico: 'disponible',
      precio_personalizado: null
    };

    try {
      const standPrecioNull = await Stand.create(standDataPrecioNull);
      console.log('✅ Stand creado con precio NULL:', standPrecioNull.numero_stand);
      console.log('   Precio personalizado:', standPrecioNull.precio_personalizado);
      
      // Limpiar
      await standPrecioNull.destroy();
      console.log('🧹 Stand eliminado');
    } catch (error) {
      console.log('❌ Error al crear stand con precio null:', error.message);
    }

    console.log('\n🎯 Pruebas completadas. Revisa los resultados arriba.');

  } catch (error) {
    console.error('❌ Error en las pruebas:', error);
  } finally {
    process.exit(0);
  }
}

// Ejecutar las pruebas
testSimpleStandCreation(); 
const db = require('./src/models');

console.log('🚀 Iniciando prueba de sincronización...');

async function testSync() {
  try {
    // Conectar a la base de datos
    await db.sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente.');

    // Sincronizar todos los modelos
    console.log('🔧 Sincronizando modelos...');
    await db.sequelize.sync({ force: true, alter: true });
    console.log('✅ Sincronización completada exitosamente.');

    // Mostrar qué tablas se crearon
    const [results] = await db.sequelize.query("SHOW TABLES");
    console.log('📋 Tablas creadas:');
    results.forEach((row, index) => {
      console.log(`  ${index + 1}. ${Object.values(row)[0]}`);
    });

    console.log(`🎉 Total de tablas creadas: ${results.length}`);

  } catch (error) {
    console.error('❌ Error en sincronización:', error.message);
  } finally {
    await db.sequelize.close();
    process.exit(0);
  }
}

testSync();
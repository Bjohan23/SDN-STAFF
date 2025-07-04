const axios = require('axios');

// Configuración
const BASE_URL = 'http://localhost:3000'; // Ajusta según tu puerto
const TEST_USER_ID = 1; // Ajusta al ID de un usuario de prueba

async function testProfileUpdate() {
  try {
    console.log('=== PRUEBA DE ACTUALIZACIÓN DE PERFIL ===');
    
    // 1. Obtener perfil actual
    console.log('1. Obteniendo perfil actual...');
    const getResponse = await axios.get(`${BASE_URL}/api/usuarios/profile`, {
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN_HERE' // Reemplaza con un token válido
      }
    });
    console.log('Perfil actual:', getResponse.data);
    
    // 2. Actualizar perfil con foto
    console.log('\n2. Actualizando perfil con foto...');
    const updateData = {
      nombre: 'Usuario de Prueba',
      bio: 'Esta es una bio de prueba',
      foto_url: 'https://via.placeholder.com/150'
    };
    
    const updateResponse = await axios.put(`${BASE_URL}/api/usuarios/profile`, updateData, {
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN_HERE', // Reemplaza con un token válido
        'Content-Type': 'application/json'
      }
    });
    console.log('Respuesta de actualización:', updateResponse.data);
    
    // 3. Verificar que se actualizó
    console.log('\n3. Verificando actualización...');
    const verifyResponse = await axios.get(`${BASE_URL}/api/usuarios/profile`, {
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN_HERE' // Reemplaza con un token válido
      }
    });
    console.log('Perfil después de actualizar:', verifyResponse.data);
    
    console.log('\n=== PRUEBA COMPLETADA ===');
    
  } catch (error) {
    console.error('Error en la prueba:', error.response?.data || error.message);
  }
}

// Ejecutar prueba
testProfileUpdate(); 
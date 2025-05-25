const resetCodes = {}; // { correo: { code, userId, expiresAt } }

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function setResetCode(correo, userId, expiresInMs = 4 * 60 * 1000) {
  const code = generateCode();
  const expiresAt = Date.now() + expiresInMs; // Por defecto 4 minutos
  resetCodes[correo] = { code, userId, expiresAt };
  return code;
}

function getResetData(correo) {
  return resetCodes[correo];
}

function clearResetCode(correo) {
  delete resetCodes[correo];
}

module.exports = { setResetCode, getResetData, clearResetCode };
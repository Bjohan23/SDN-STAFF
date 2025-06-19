const express = require("express");
const router = express.Router();
const TipoStandController = require("../controllers/TipoStandController");
const { authenticate, authorize } = require("../middlewares/auth");

// Rutas públicas
router.get("/", TipoStandController.getAllTiposStand);
router.get("/stats", TipoStandController.getTipoStandStats);
router.get("/sin-stands", TipoStandController.getTiposSinStands);
router.get("/para-area", TipoStandController.getTiposParaArea);
router.get("/:id", TipoStandController.getTipoStandById);
router.get("/nombre/:nombre", TipoStandController.getTipoStandByNombre);
router.get("/:id/stands", TipoStandController.getStandsByTipo);
router.get("/:id/validar-area", TipoStandController.validarAreaParaTipo);
router.get("/:id/calcular-precio", TipoStandController.calcularPrecio);

// Rutas protegidas - Solo admin y organizadores
router.post(
  "/",
  authenticate,
  authorize(["administrador", "Editor"]),
  TipoStandController.createTipoStand
);

router.put(
  "/:id",
  authenticate,
  authorize(["administrador", "Editor"]),
  TipoStandController.updateTipoStand
);

router.delete(
  "/:id",
  authenticate,
  authorize(["administrador"]),
  TipoStandController.deleteTipoStand
);

// Rutas administrativas
router.get(
  "/admin/eliminados",
  authenticate,
  authorize(["administrador"]),
  TipoStandController.getTiposEliminados
);

router.post(
  "/:id/restore",
  authenticate,
  authorize(["administrador"]),
  TipoStandController.restoreTipoStand
);

module.exports = router;

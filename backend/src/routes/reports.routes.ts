import { Router } from 'express';
import reportsController from '../controllers/reports.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { isAdmin } from '../middlewares/isAdmin.middleware';

const router = Router();

// Todos los endpoints requieren autenticación y rol de administrador
router.use(verifyToken);
router.use(isAdmin);

// GET /api/reportes/resumen-general - Resumen general de inventario
router.get('/resumen-general', (req, res, next) => reportsController.getGeneralSummary(req, res, next));

// GET /api/reportes/por-area - Equipos agrupados por área
router.get('/por-area', (req, res, next) => reportsController.getEquipmentByArea(req, res, next));

// GET /api/reportes/por-usuario - Equipos asignados por usuario
router.get('/por-usuario', (req, res, next) => reportsController.getEquipmentByUser(req, res, next));

// GET /api/reportes/altas-bajas - Altas y bajas en un rango de fechas
router.get('/altas-bajas', (req, res, next) => reportsController.getRegistrationAndDecommission(req, res, next));

// GET /api/reportes/detalles-area/:area - Detalles de equipos por área
router.get('/detalles-area/:area', (req, res, next) => reportsController.getEquipmentDetailsByArea(req, res, next));

// ========== Rutas de Exportación ==========

// Exportación XLSX
router.get('/export/xlsx/resumen-general', (req, res, next) => reportsController.exportResumenGeneralXLSX(req, res, next));
router.get('/export/xlsx/por-area', (req, res, next) => reportsController.exportPorAreaXLSX(req, res, next));
router.get('/export/xlsx/por-usuario', (req, res, next) => reportsController.exportPorUsuarioXLSX(req, res, next));

// Exportación PDF
router.get('/export/pdf/resumen-general', (req, res, next) => reportsController.exportResumenGeneralPDF(req, res, next));
router.get('/export/pdf/por-area', (req, res, next) => reportsController.exportPorAreaPDF(req, res, next));
router.get('/export/pdf/por-usuario', (req, res, next) => reportsController.exportPorUsuarioPDF(req, res, next));

export default router;

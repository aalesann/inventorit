import { Request, Response, NextFunction } from 'express';
import reportsService from '../services/reports.service';
import exportService from '../services/export.service';
import { ReportFilters, DateRangeFilter } from '../repositories/reports.repository';
import logger from '../utils/logger';

class ReportsController {
    /**
     * GET /api/reportes/resumen-general
     * Obtener resumen general de inventario
     */
    async getGeneralSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const {
                fecha_desde,
                fecha_hasta,
                category_id,
                estado,
                area
            } = req.query;

            const filters: ReportFilters = {};

            if (fecha_desde) filters.fecha_desde = fecha_desde as string;
            if (fecha_hasta) filters.fecha_hasta = fecha_hasta as string;
            if (category_id) filters.category_id = parseInt(category_id as string);
            if (estado) filters.estado = estado as any;
            if (area) filters.area = area as string;

            const result = await reportsService.getGeneralSummary(filters);

            logger.info(`Resumen general generado por ${req.user!.username}`);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/reportes/por-area
     * Obtener equipos agrupados por área
     */
    async getEquipmentByArea(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const {
                category_id,
                estado,
                area
            } = req.query;

            const filters: ReportFilters = {};

            if (category_id) filters.category_id = parseInt(category_id as string);
            if (estado) filters.estado = estado as any;
            if (area) filters.area = area as string;

            const result = await reportsService.getEquipmentByArea(filters);

            logger.info(`Reporte por área generado por ${req.user!.username}`);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/reportes/por-usuario
     * Obtener equipos asignados por usuario
     */
    async getEquipmentByUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const {
                category_id,
                area
            } = req.query;

            const filters: ReportFilters = {};

            if (category_id) filters.category_id = parseInt(category_id as string);
            if (area) filters.area = area as string;

            const result = await reportsService.getEquipmentByUser(filters);

            logger.info(`Reporte por usuario generado por ${req.user!.username}`);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/reportes/altas-bajas
     * Obtener altas y bajas en un rango de fechas
     */
    async getRegistrationAndDecommission(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const {
                fecha_desde,
                fecha_hasta
            } = req.query;

            const filters: DateRangeFilter = {};

            if (fecha_desde) filters.fecha_desde = fecha_desde as string;
            if (fecha_hasta) filters.fecha_hasta = fecha_hasta as string;

            const result = await reportsService.getRegistrationAndDecommission(filters);

            logger.info(`Reporte de altas y bajas generado por ${req.user!.username}`);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/reportes/detalles-area/:area
     * Obtener detalles de equipos por área (para exportación)
     */
    async getEquipmentDetailsByArea(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { area } = req.params;

            const result = await reportsService.getEquipmentDetailsByArea(area);

            logger.info(`Detalles por área solicitados por ${req.user!.username}`, { area });
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    // ========== Endpoints de Exportación ==========

    /**
     * GET /api/reportes/export/xlsx/resumen-general
     * Exportar resumen general a XLSX
     */
    async exportResumenGeneralXLSX(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const filters: ReportFilters = this.extractFilters(req.query);
            await exportService.exportResumenGeneralXLSX(filters, res);
            logger.info(`Resumen general exportado a XLSX por ${req.user!.username}`);
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/reportes/export/xlsx/por-area
     * Exportar equipos por área a XLSX
     */
    async exportPorAreaXLSX(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const filters: ReportFilters = this.extractFilters(req.query);
            await exportService.exportPorAreaXLSX(filters, res);
            logger.info(`Equipos por área exportados a XLSX por ${req.user!.username}`);
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/reportes/export/xlsx/por-usuario
     * Exportar equipos por usuario a XLSX
     */
    async exportPorUsuarioXLSX(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const filters: ReportFilters = this.extractFilters(req.query);
            await exportService.exportPorUsuarioXLSX(filters, res);
            logger.info(`Equipos por usuario exportados a XLSX por ${req.user!.username}`);
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/reportes/export/pdf/resumen-general
     * Exportar resumen general a PDF
     */
    async exportResumenGeneralPDF(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const filters: ReportFilters = this.extractFilters(req.query);
            await exportService.exportResumenGeneralPDF(filters, res);
            logger.info(`Resumen general exportado a PDF por ${req.user!.username}`);
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/reportes/export/pdf/por-area
     * Exportar equipos por área a PDF
     */
    async exportPorAreaPDF(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const filters: ReportFilters = this.extractFilters(req.query);
            await exportService.exportPorAreaPDF(filters, res);
            logger.info(`Equipos por área exportados a PDF por ${req.user!.username}`);
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/reportes/export/pdf/por-usuario
     * Exportar equipos por usuario a PDF
     */
    async exportPorUsuarioPDF(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const filters: ReportFilters = this.extractFilters(req.query);
            await exportService.exportPorUsuarioPDF(filters, res);
            logger.info(`Equipos por usuario exportados a PDF por ${req.user!.username}`);
        } catch (error) {
            next(error);
        }
    }

    // Helper method to extract filters from query
    private extractFilters(query: any): ReportFilters {
        const filters: ReportFilters = {};

        if (query.fecha_desde) filters.fecha_desde = query.fecha_desde as string;
        if (query.fecha_hasta) filters.fecha_hasta = query.fecha_hasta as string;
        if (query.category_id) filters.category_id = parseInt(query.category_id as string);
        if (query.estado) filters.estado = query.estado as any;
        if (query.area) filters.area = query.area as string;

        return filters;
    }
}

export default new ReportsController();

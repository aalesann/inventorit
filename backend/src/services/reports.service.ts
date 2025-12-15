import reportsRepository, { ReportFilters, DateRangeFilter } from '../repositories/reports.repository';
import logger from '../utils/logger';

class ReportsService {
    /**
     * Obtener resumen general de inventario
     */
    async getGeneralSummary(filters: ReportFilters) {
        try {
            logger.info('Generando resumen general de inventario', { filters });

            const summary = await reportsRepository.getGeneralSummary(filters);

            return {
                success: true,
                data: summary
            };
        } catch (error) {
            logger.error('Error al generar resumen general', { error, filters });
            throw new Error('Error al generar el resumen general de inventario');
        }
    }

    /**
     * Obtener equipos agrupados por área
     */
    async getEquipmentByArea(filters: ReportFilters) {
        try {
            logger.info('Generando reporte de equipos por área', { filters });

            const data = await reportsRepository.getEquipmentByArea(filters);

            return {
                success: true,
                data
            };
        } catch (error) {
            logger.error('Error al generar reporte por área', { error, filters });
            throw new Error('Error al generar el reporte de equipos por área');
        }
    }

    /**
     * Obtener equipos asignados por usuario
     */
    async getEquipmentByUser(filters: ReportFilters) {
        try {
            logger.info('Generando reporte de equipos por usuario', { filters });

            const data = await reportsRepository.getEquipmentByUser(filters);

            return {
                success: true,
                data
            };
        } catch (error) {
            logger.error('Error al generar reporte por usuario', { error, filters });
            throw new Error('Error al generar el reporte de equipos por usuario');
        }
    }

    /**
     * Obtener altas y bajas en un rango de fechas
     */
    async getRegistrationAndDecommission(filters: DateRangeFilter) {
        try {
            logger.info('Generando reporte de altas y bajas', { filters });

            // Validar que el rango de fechas no sea mayor a 1 año
            if (filters.fecha_desde && filters.fecha_hasta) {
                const desde = new Date(filters.fecha_desde);
                const hasta = new Date(filters.fecha_hasta);
                const diffTime = Math.abs(hasta.getTime() - desde.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays > 365) {
                    throw new Error('El rango de fechas no puede ser mayor a 1 año');
                }
            }

            const data = await reportsRepository.getRegistrationAndDecommission(filters);

            // Calcular totales
            const totales = data.reduce((acc, item) => ({
                totalAltas: acc.totalAltas + item.altas,
                totalBajas: acc.totalBajas + item.bajas
            }), { totalAltas: 0, totalBajas: 0 });

            return {
                success: true,
                data: {
                    series: data,
                    totales
                }
            };
        } catch (error) {
            logger.error('Error al generar reporte de altas y bajas', { error, filters });

            if (error instanceof Error && error.message.includes('rango de fechas')) {
                throw error;
            }

            throw new Error('Error al generar el reporte de altas y bajas');
        }
    }

    /**
     * Obtener detalles de equipos por área (para exportación)
     */
    async getEquipmentDetailsByArea(area: string) {
        try {
            logger.info('Obteniendo detalles de equipos por área', { area });

            if (!area || area.trim() === '') {
                throw new Error('El área es requerida');
            }

            const data = await reportsRepository.getEquipmentDetailsByArea(area);

            return {
                success: true,
                data
            };
        } catch (error) {
            logger.error('Error al obtener detalles por área', { error, area });

            if (error instanceof Error && error.message.includes('requerida')) {
                throw error;
            }

            throw new Error('Error al obtener los detalles de equipos por área');
        }
    }
}

export default new ReportsService();

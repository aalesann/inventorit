import { Op, fn, col, literal } from 'sequelize';
import Asset from '../models/Asset';
import Category from '../models/Category';

export interface DateRangeFilter {
    fecha_desde?: string;
    fecha_hasta?: string;
}

export interface ReportFilters extends DateRangeFilter {
    category_id?: number;
    estado?: 'EN_USO' | 'EN_DEPOSITO' | 'EN_REPARACION' | 'BAJA';
    area?: string;
}

class ReportsRepository {
    /**
     * Resumen general de inventario
     * Retorna totales generales, por tipo de equipo y por estado
     */
    async getGeneralSummary(filters: ReportFilters) {
        const where: any = { is_deleted: false };

        // Aplicar filtros de fecha
        if (filters.fecha_desde || filters.fecha_hasta) {
            where.createdAt = {};
            if (filters.fecha_desde) {
                where.createdAt[Op.gte] = new Date(filters.fecha_desde);
            }
            if (filters.fecha_hasta) {
                where.createdAt[Op.lte] = new Date(filters.fecha_hasta);
            }
        }

        if (filters.category_id) {
            where.category_id = filters.category_id;
        }

        if (filters.estado) {
            where.estado = filters.estado;
        }

        if (filters.area) {
            where.area = { [Op.iLike]: `%${filters.area}%` };
        }

        // Total general
        const totalGeneral = await Asset.count({ where });

        // Total por tipo (categoría)
        const porTipoRaw = await Asset.findAll({
            where,
            attributes: [
                'category_id',
                [fn('COUNT', col('id')), 'cantidad']
            ],
            group: ['category_id'],
            raw: true
        });

        // Obtener nombres de categorías
        const categoryIds = porTipoRaw.map((item: any) => item.category_id);
        const categories = await Category.findAll({
            where: { id: categoryIds },
            attributes: ['id', 'nombre'],
            raw: true
        });

        const categoryMap = new Map(categories.map((cat: any) => [cat.id, cat.nombre]));

        const porTipo = porTipoRaw.map((item: any) => ({
            categoria_id: item.category_id,
            categoria_nombre: categoryMap.get(item.category_id) || 'Sin categoría',
            cantidad: parseInt(item.cantidad)
        }));

        // Total por estado
        const porEstado = await Asset.findAll({
            where,
            attributes: [
                'estado',
                [fn('COUNT', col('id')), 'cantidad']
            ],
            group: ['estado'],
            raw: true
        });

        return {
            totalGeneral,
            porTipo,
            porEstado: porEstado.map((item: any) => ({
                estado: item.estado,
                cantidad: parseInt(item.cantidad)
            }))
        };
    }

    /**
     * Equipos por área/sector
     * Retorna cantidad de equipos por área con desglose por estado
     */
    async getEquipmentByArea(filters: ReportFilters) {
        const where: any = { is_deleted: false, area: { [Op.ne]: null } };

        if (filters.category_id) {
            where.category_id = filters.category_id;
        }

        if (filters.estado) {
            where.estado = filters.estado;
        }

        if (filters.area) {
            where.area = { [Op.iLike]: `%${filters.area}%` };
        }

        // Consulta agrupada por área y estado
        const results = await Asset.findAll({
            where,
            attributes: [
                'area',
                'estado',
                [fn('COUNT', col('id')), 'cantidad']
            ],
            group: ['area', 'estado'],
            order: [[col('area'), 'ASC']],
            raw: true
        });

        // Agrupar resultados por área
        const areaMap = new Map<string, any>();

        for (const row of results as any[]) {
            const area = row.area;
            if (!areaMap.has(area)) {
                areaMap.set(area, {
                    area,
                    total: 0,
                    en_uso: 0,
                    en_deposito: 0,
                    en_reparacion: 0,
                    baja: 0
                });
            }

            const areaData = areaMap.get(area);
            const cantidad = parseInt(row.cantidad);
            areaData.total += cantidad;

            switch (row.estado) {
                case 'EN_USO':
                    areaData.en_uso = cantidad;
                    break;
                case 'EN_DEPOSITO':
                    areaData.en_deposito = cantidad;
                    break;
                case 'EN_REPARACION':
                    areaData.en_reparacion = cantidad;
                    break;
                case 'BAJA':
                    areaData.baja = cantidad;
                    break;
            }
        }

        return Array.from(areaMap.values());
    }

    /**
     * Equipos asignados por usuario
     * Retorna usuarios con equipos asignados y el detalle de cada equipo
     */
    async getEquipmentByUser(filters: ReportFilters) {
        const where: any = {
            is_deleted: false,
            [Op.and]: [
                { usuario_asignado: { [Op.ne]: null } },
                { usuario_asignado: { [Op.ne]: '' } }
            ]
        };

        if (filters.category_id) {
            where.category_id = filters.category_id;
        }

        if (filters.area) {
            where.area = { [Op.iLike]: `%${filters.area}%` };
        }

        // Obtener todos los equipos asignados con detalles
        const equipos = await Asset.findAll({
            where,
            attributes: [
                'id',
                'usuario_asignado',
                'marca',
                'modelo',
                'codigo_inventario',
                'area',
                'estado'
            ],
            include: [{
                model: Category,
                as: 'category',
                attributes: ['nombre']
            }],
            order: [[col('usuario_asignado'), 'ASC']]
        });

        // Agrupar por usuario
        const userMap = new Map<string, any>();

        for (const equipo of equipos) {
            const usuario = equipo.usuario_asignado!;
            if (!userMap.has(usuario)) {
                userMap.set(usuario, {
                    usuario,
                    cantidad: 0,
                    equipos: []
                });
            }

            const userData = userMap.get(usuario);
            userData.cantidad++;
            userData.equipos.push({
                id: equipo.id,
                tipo: (equipo as any).category?.nombre || 'N/A',
                marca: equipo.marca,
                modelo: equipo.modelo,
                codigo: equipo.codigo_inventario,
                area: equipo.area,
                estado: equipo.estado
            });
        }

        return Array.from(userMap.values());
    }

    /**
     * Altas y bajas en un rango de fechas
     * Retorna cantidad de equipos creados y dados de baja agrupados por fecha
     */
    async getRegistrationAndDecommission(filters: DateRangeFilter) {
        const fecha_desde = filters.fecha_desde
            ? new Date(filters.fecha_desde)
            : new Date(new Date().getFullYear(), 0, 1); // Inicio del año actual

        const fecha_hasta = filters.fecha_hasta
            ? new Date(filters.fecha_hasta)
            : new Date(); // Hoy

        // Altas (equipos creados)
        const altas = await Asset.findAll({
            where: {
                createdAt: {
                    [Op.gte]: fecha_desde,
                    [Op.lte]: fecha_hasta
                }
            },
            attributes: [
                [fn('DATE', col('createdAt')), 'fecha'],
                [fn('COUNT', col('id')), 'cantidad']
            ],
            group: [fn('DATE', col('createdAt'))],
            order: [[fn('DATE', col('createdAt')), 'ASC']],
            raw: true
        });

        // Bajas (equipos marcados como BAJA o eliminados)
        const bajas = await Asset.findAll({
            where: {
                [Op.or]: [
                    {
                        estado: 'BAJA',
                        updatedAt: {
                            [Op.gte]: fecha_desde,
                            [Op.lte]: fecha_hasta
                        }
                    },
                    {
                        is_deleted: true,
                        deleted_at: {
                            [Op.gte]: fecha_desde,
                            [Op.lte]: fecha_hasta
                        }
                    }
                ]
            },
            attributes: [
                [
                    literal(`COALESCE(DATE("deleted_at"), DATE("updatedAt"))`),
                    'fecha'
                ],
                [fn('COUNT', col('id')), 'cantidad']
            ],
            group: [col('fecha')],
            order: [[col('fecha'), 'ASC']],
            raw: true
        });

        // Crear un mapa de todas las fechas en el rango
        const dateMap = new Map<string, any>();
        const currentDate = new Date(fecha_desde);

        while (currentDate <= fecha_hasta) {
            const dateStr = currentDate.toISOString().split('T')[0];
            dateMap.set(dateStr, {
                fecha: dateStr,
                altas: 0,
                bajas: 0
            });
            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Llenar con datos de altas
        for (const row of altas as any[]) {
            const fecha = row.fecha;
            if (dateMap.has(fecha)) {
                dateMap.get(fecha).altas = parseInt(row.cantidad);
            }
        }

        // Llenar con datos de bajas
        for (const row of bajas as any[]) {
            const fecha = row.fecha;
            if (dateMap.has(fecha)) {
                dateMap.get(fecha).bajas = parseInt(row.cantidad);
            }
        }

        return Array.from(dateMap.values());
    }

    /**
     * Obtener detalles de equipos por área (para exportación)
     */
    async getEquipmentDetailsByArea(area: string) {
        const equipos = await Asset.findAll({
            where: {
                is_deleted: false,
                area: { [Op.iLike]: `%${area}%` }
            },
            include: [{
                model: Category,
                as: 'category',
                attributes: ['nombre']
            }],
            order: [['codigo_inventario', 'ASC']]
        });

        return equipos.map(equipo => ({
            codigo: equipo.codigo_inventario,
            tipo: (equipo as any).category?.nombre || 'N/A',
            marca: equipo.marca,
            modelo: equipo.modelo,
            serie: equipo.numero_serie || '-',
            area: equipo.area,
            estado: equipo.estado,
            usuario: equipo.usuario_asignado || '-'
        }));
    }
}

export default new ReportsRepository();

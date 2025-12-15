import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import api from '../api/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, FileSpreadsheet, FileText, ChevronDown, Package, TrendingUp, AlertCircle } from 'lucide-react';

const ESTADOS = [
    { value: '', label: 'Todos los estados' },
    { value: 'EN_USO', label: 'En Uso' },
    { value: 'EN_DEPOSITO', label: 'En Depósito' },
    { value: 'EN_REPARACION', label: 'En Reparación' },
    { value: 'BAJA', label: 'Baja' }
];

const COLORS = {
    EN_USO: '#10b981',
    EN_DEPOSITO: '#3b82f6',
    EN_REPARACION: '#f59e0b',
    BAJA: '#ef4444'
};

export default function Reportes() {
    const [categories, setCategories] = useState([]);
    const [filters, setFilters] = useState({
        fecha_desde: '',
        fecha_hasta: '',
        category_id: '',
        estado: '',
        area: ''
    });

    // Datos de reportes
    const [resumenGeneral, setResumenGeneral] = useState(null);
    const [equiposPorArea, setEquiposPorArea] = useState([]);
    const [equiposPorUsuario, setEquiposPorUsuario] = useState([]);
    const [altasBajas, setAltasBajas] = useState(null);
    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        fetchCategories();
        // Establecer fechas por defecto (último mes)
        const hoy = new Date();
        const hace30dias = new Date();
        hace30dias.setDate(hoy.getDate() - 30);

        setFilters(prev => ({
            ...prev,
            fecha_desde: hace30dias.toISOString().split('T')[0],
            fecha_hasta: hoy.toISOString().split('T')[0]
        }));
    }, []);

    useEffect(() => {
        if (filters.fecha_desde && filters.fecha_hasta) {
            fetchAllReports();
        }
    }, [filters]);

    const fetchCategories = async () => {
        try {
            const response = await api.get('/categories');
            setCategories(response.data);
        } catch (error) {
            console.error('Error al cargar categorías', error);
        }
    };

    const fetchAllReports = async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchResumenGeneral(),
                fetchEquiposPorArea(),
                fetchEquiposPorUsuario(),
                fetchAltasBajas()
            ]);
        } catch (error) {
            console.error('Error al cargar reportes', error);
            toast.error('Error al cargar los reportes');
        } finally {
            setLoading(false);
        }
    };

    const fetchResumenGeneral = async () => {
        try {
            const params = new URLSearchParams();
            if (filters.fecha_desde) params.append('fecha_desde', filters.fecha_desde);
            if (filters.fecha_hasta) params.append('fecha_hasta', filters.fecha_hasta);
            if (filters.category_id) params.append('category_id', filters.category_id);
            if (filters.estado) params.append('estado', filters.estado);
            if (filters.area) params.append('area', filters.area);

            const response = await api.get(`/reportes/resumen-general?${params.toString()}`);
            setResumenGeneral(response.data.data);
        } catch (error) {
            console.error('Error al cargar resumen general', error);
        }
    };

    const fetchEquiposPorArea = async () => {
        try {
            const params = new URLSearchParams();
            if (filters.category_id) params.append('category_id', filters.category_id);
            if (filters.estado) params.append('estado', filters.estado);
            if (filters.area) params.append('area', filters.area);

            const response = await api.get(`/reportes/por-area?${params.toString()}`);
            setEquiposPorArea(response.data.data);
        } catch (error) {
            console.error('Error al cargar equipos por área', error);
        }
    };

    const fetchEquiposPorUsuario = async () => {
        try {
            const params = new URLSearchParams();
            if (filters.category_id) params.append('category_id', filters.category_id);
            if (filters.area) params.append('area', filters.area);

            const response = await api.get(`/reportes/por-usuario?${params.toString()}`);
            setEquiposPorUsuario(response.data.data);
        } catch (error) {
            console.error('Error al cargar equipos por usuario', error);
        }
    };

    const fetchAltasBajas = async () => {
        try {
            const params = new URLSearchParams();
            if (filters.fecha_desde) params.append('fecha_desde', filters.fecha_desde);
            if (filters.fecha_hasta) params.append('fecha_hasta', filters.fecha_hasta);

            const response = await api.get(`/reportes/altas-bajas?${params.toString()}`);
            setAltasBajas(response.data.data);
        } catch (error) {
            console.error('Error al cargar altas y bajas', error);
        }
    };

    const exportToCSV = (data, filename) => {
        if (!data || data.length === 0) {
            toast.error('No hay datos para exportar');
            return;
        }

        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => {
                const value = row[header];
                // Escapar valores con comas o comillas
                if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value;
            }).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success('Archivo CSV descargado correctamente');
    };

    const exportEquiposPorArea = () => {
        const data = equiposPorArea.map(item => ({
            'Área': item.area,
            'Total': item.total,
            'En Uso': item.en_uso,
            'En Depósito': item.en_deposito,
            'En Reparación': item.en_reparacion,
            'Baja': item.baja
        }));
        exportToCSV(data, 'equipos_por_area');
    };

    const exportEquiposPorUsuario = () => {
        const data = equiposPorUsuario.map(item => ({
            'Usuario': item.usuario,
            'Cantidad de Equipos': item.cantidad
        }));
        exportToCSV(data, 'equipos_por_usuario');
    };

    // Exportación XLSX y PDF
    const downloadFile = async (url, filename) => {
        try {
            setExporting(true);
            const response = await api.get(url, {
                responseType: 'blob',
                params: filters
            });

            const blob = new Blob([response.data]);
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            link.click();
            URL.revokeObjectURL(link.href);

            toast.success('Archivo descargado correctamente');
        } catch (error) {
            console.error('Error al descargar archivo', error);
            toast.error('Error al descargar el archivo');
        } finally {
            setExporting(false);
        }
    };

    const exportResumenXLSX = () => downloadFile('/reportes/export/xlsx/resumen-general', `resumen_general_${new Date().toISOString().split('T')[0]}.xlsx`);
    const exportResumenPDF = () => downloadFile('/reportes/export/pdf/resumen-general', `resumen_general_${new Date().toISOString().split('T')[0]}.pdf`);
    const exportAreaXLSX = () => downloadFile('/reportes/export/xlsx/por-area', `equipos_por_area_${new Date().toISOString().split('T')[0]}.xlsx`);
    const exportAreaPDF = () => downloadFile('/reportes/export/pdf/por-area', `equipos_por_area_${new Date().toISOString().split('T')[0]}.pdf`);
    const exportUsuarioXLSX = () => downloadFile('/reportes/export/xlsx/por-usuario', `equipos_por_usuario_${new Date().toISOString().split('T')[0]}.xlsx`);
    const exportUsuarioPDF = () => downloadFile('/reportes/export/pdf/por-usuario', `equipos_por_usuario_${new Date().toISOString().split('T')[0]}.pdf`);

    const getEstadoLabel = (estado) => {
        return ESTADOS.find(e => e.value === estado)?.label || estado;
    };

    // Preparar datos para gráfico de dona (estados)
    const pieData = resumenGeneral?.porEstado.map(item => ({
        name: getEstadoLabel(item.estado),
        value: item.cantidad,
        color: COLORS[item.estado]
    })) || [];

    // Preparar datos para gráfico de barras (tipos)
    const barData = resumenGeneral?.porTipo.map(item => ({
        name: item.categoria_nombre,
        cantidad: item.cantidad
    })) || [];

    // Preparar datos para gráfico de líneas (altas y bajas)
    const lineData = altasBajas?.series.filter((_, index) => {
        // Mostrar solo cada N días si hay muchos datos
        const totalDays = altasBajas.series.length;
        if (totalDays > 60) return index % 7 === 0; // Semanal
        if (totalDays > 30) return index % 3 === 0; // Cada 3 días
        return true; // Diario
    }).map(item => ({
        fecha: new Date(item.fecha).toLocaleDateString('es-AR', { month: 'short', day: 'numeric' }),
        Altas: item.altas,
        Bajas: item.bajas
    })) || [];

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Reportes de Inventario</CardTitle>
                    <CardDescription>Análisis y estadísticas del inventario de equipos</CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Filtros */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Fecha Desde</label>
                            <Input
                                type="date"
                                value={filters.fecha_desde}
                                onChange={(e) => setFilters({ ...filters, fecha_desde: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Fecha Hasta</label>
                            <Input
                                type="date"
                                value={filters.fecha_hasta}
                                onChange={(e) => setFilters({ ...filters, fecha_hasta: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Categoría</label>
                            <select
                                className="bg-input border-border text-foreground rounded px-3 py-2 text-sm focus:border-primary focus:ring-primary transition-all"
                                value={filters.category_id}
                                onChange={(e) => setFilters({ ...filters, category_id: e.target.value })}
                            >
                                <option value="">Todas las categorías</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                                ))}
                            </select>
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Estado</label>
                            <select
                                className="bg-input border-border text-foreground rounded px-3 py-2 text-sm focus:border-primary focus:ring-primary transition-all"
                                value={filters.estado}
                                onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
                            >
                                {ESTADOS.map(estado => (
                                    <option key={estado.value} value={estado.value}>{estado.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Área</label>
                            <Input
                                placeholder="Filtrar por área..."
                                value={filters.area}
                                onChange={(e) => setFilters({ ...filters, area: e.target.value })}
                            />
                        </div>
                    </div>

                    {loading && (
                        <div className="text-center py-8 text-muted-foreground">
                            Cargando reportes...
                        </div>
                    )}

                    {!loading && resumenGeneral && (
                        <>
                            {/* Botones de Exportación General */}
                            <div className="flex gap-2 mb-6">
                                <Button
                                    variant="outline"
                                    onClick={exportResumenXLSX}
                                    disabled={exporting}
                                >
                                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                                    {exporting ? 'Exportando...' : 'Exportar Resumen (XLSX)'}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={exportResumenPDF}
                                    disabled={exporting}
                                >
                                    <FileText className="mr-2 h-4 w-4" />
                                    {exporting ? 'Exportando...' : 'Exportar Resumen (PDF)'}
                                </Button>
                            </div>

                            {/* KPIs */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                            <Package className="h-4 w-4" />
                                            Equipos Totales
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold">{resumenGeneral.totalGeneral}</div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">Equipos en Uso</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                                            {resumenGeneral.porEstado.find(e => e.estado === 'EN_USO')?.cantidad || 0}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border-yellow-500/20">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                            <AlertCircle className="h-4 w-4" />
                                            En Reparación
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                                            {resumenGeneral.porEstado.find(e => e.estado === 'EN_REPARACION')?.cantidad || 0}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                            <TrendingUp className="h-4 w-4" />
                                            Altas en el Período
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                                            {altasBajas?.totales.totalAltas || 0}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Gráficos */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                {/* Gráfico de Barras - Equipos por Tipo */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Equipos por Tipo</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <BarChart data={barData}>
                                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                                <XAxis dataKey="name" className="text-xs" />
                                                <YAxis />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: 'hsl(var(--card))',
                                                        border: '1px solid hsl(var(--border))'
                                                    }}
                                                />
                                                <Bar dataKey="cantidad" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>

                                {/* Gráfico de Dona - Equipos por Estado */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Distribución por Estado</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <PieChart>
                                                <Pie
                                                    data={pieData}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={false}
                                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                    outerRadius={80}
                                                    fill="#8884d8"
                                                    dataKey="value"
                                                >
                                                    {pieData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: 'hsl(var(--card))',
                                                        border: '1px solid hsl(var(--border))'
                                                    }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Gráfico de Líneas - Altas y Bajas */}
                            <Card className="mb-6">
                                <CardHeader>
                                    <CardTitle className="text-lg">Evolución de Altas y Bajas</CardTitle>
                                    <CardDescription>
                                        Total de altas: {altasBajas?.totales.totalAltas || 0} |
                                        Total de bajas: {altasBajas?.totales.totalBajas || 0}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <LineChart data={lineData}>
                                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                            <XAxis dataKey="fecha" className="text-xs" />
                                            <YAxis />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: 'hsl(var(--card))',
                                                    border: '1px solid hsl(var(--border))'
                                                }}
                                            />
                                            <Legend />
                                            <Line type="monotone" dataKey="Altas" stroke="#10b981" strokeWidth={2} />
                                            <Line type="monotone" dataKey="Bajas" stroke="#ef4444" strokeWidth={2} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            {/* Tabla - Equipos por Área */}
                            <Card className="mb-6">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle className="text-lg">Equipos por Área / Sector</CardTitle>
                                        <CardDescription>Distribución de equipos por ubicación</CardDescription>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" size="sm" disabled={exporting}>
                                                <Download className="mr-2 h-4 w-4" />
                                                {exporting ? 'Exportando...' : 'Exportar'}
                                                <ChevronDown className="ml-2 h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuItem onClick={exportEquiposPorArea}>
                                                <Download className="mr-2 h-4 w-4" />
                                                CSV
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={exportAreaXLSX}>
                                                <FileSpreadsheet className="mr-2 h-4 w-4" />
                                                XLSX (Excel)
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={exportAreaPDF}>
                                                <FileText className="mr-2 h-4 w-4" />
                                                PDF
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </CardHeader>
                                <CardContent>
                                    <div className="border rounded-lg">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Área</TableHead>
                                                    <TableHead className="text-right">Total</TableHead>
                                                    <TableHead className="text-right">En Uso</TableHead>
                                                    <TableHead className="text-right">En Depósito</TableHead>
                                                    <TableHead className="text-right">En Reparación</TableHead>
                                                    <TableHead className="text-right">Baja</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {equiposPorArea.map((item, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell className="font-medium">{item.area}</TableCell>
                                                        <TableCell className="text-right font-semibold">{item.total}</TableCell>
                                                        <TableCell className="text-right text-green-600 dark:text-green-400">{item.en_uso}</TableCell>
                                                        <TableCell className="text-right text-blue-600 dark:text-blue-400">{item.en_deposito}</TableCell>
                                                        <TableCell className="text-right text-yellow-600 dark:text-yellow-400">{item.en_reparacion}</TableCell>
                                                        <TableCell className="text-right text-red-600 dark:text-red-400">{item.baja}</TableCell>
                                                    </TableRow>
                                                ))}
                                                {equiposPorArea.length === 0 && (
                                                    <TableRow>
                                                        <TableCell colSpan={6} className="text-center text-muted-foreground h-24">
                                                            No hay datos disponibles
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Tabla - Equipos por Usuario */}
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle className="text-lg">Equipos por Usuario Asignado</CardTitle>
                                        <CardDescription>Usuarios con equipos asignados</CardDescription>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" size="sm" disabled={exporting}>
                                                <Download className="mr-2 h-4 w-4" />
                                                {exporting ? 'Exportando...' : 'Exportar'}
                                                <ChevronDown className="ml-2 h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuItem onClick={exportEquiposPorUsuario}>
                                                <Download className="mr-2 h-4 w-4" />
                                                CSV
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={exportUsuarioXLSX}>
                                                <FileSpreadsheet className="mr-2 h-4 w-4" />
                                                XLSX (Excel)
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={exportUsuarioPDF}>
                                                <FileText className="mr-2 h-4 w-4" />
                                                PDF
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </CardHeader>
                                <CardContent>
                                    <div className="border rounded-lg">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Usuario</TableHead>
                                                    <TableHead className="text-right">Cantidad de Equipos</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {equiposPorUsuario.map((item, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell className="font-medium">{item.usuario}</TableCell>
                                                        <TableCell className="text-right font-semibold">{item.cantidad}</TableCell>
                                                    </TableRow>
                                                ))}
                                                {equiposPorUsuario.length === 0 && (
                                                    <TableRow>
                                                        <TableCell colSpan={2} className="text-center text-muted-foreground h-24">
                                                            No hay equipos asignados
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

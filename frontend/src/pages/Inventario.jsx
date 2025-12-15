import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import api from '../api/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Pencil, Trash2, X, Eye } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const ESTADOS = [
    { value: 'EN_USO', label: 'En Uso' },
    { value: 'EN_DEPOSITO', label: 'En Depósito' },
    { value: 'EN_REPARACION', label: 'En Reparación' },
    { value: 'BAJA', label: 'Baja' }
];

export default function Inventario() {
    const [assets, setAssets] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [currentAsset, setCurrentAsset] = useState(null);
    const [formData, setFormData] = useState({
        category_id: '',
        marca: '',
        modelo: '',
        numero_serie: '',
        codigo_inventario: '',
        area: '',
        estado: 'EN_DEPOSITO',
        usuario_asignado: '',
        observaciones: '',
        specs: {}
    });
    const [filters, setFilters] = useState({
        category_id: '',
        estado: '',
        area: '',
        usuario_asignado: '',
        search: ''
    });

    // Estado para modal de detalles
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [viewAsset, setViewAsset] = useState(null);

    const handleView = (asset) => {
        setViewAsset(asset);
        setIsViewOpen(true);
    };

    const renderSpecsDetail = (specs) => {
        if (!specs || Object.keys(specs).length === 0) return <p className="text-sm text-muted-foreground">Sin características técnicas registradas.</p>;

        return (
            <div className="grid grid-cols-2 gap-4">
                {Object.entries(specs).map(([key, value]) => (
                    <div key={key} className="grid gap-1">
                        <span className="text-xs font-medium text-muted-foreground capitalize">{key}</span>
                        <span className="text-sm">{value}</span>
                    </div>
                ))}
            </div>
        );
    };

    // Configuración de campos por tipo de equipo
    const SPECS_CONFIG = {
        pc: [
            { name: 'procesador', label: 'Procesador', placeholder: 'Ej: Intel Core i5-10400' },
            { name: 'ram', label: 'Memoria RAM', placeholder: 'Ej: 16 GB DDR4' },
            { name: 'almacenamiento', label: 'Almacenamiento', placeholder: 'Ej: 512 GB SSD' },
            { name: 'so', label: 'Sistema Operativo', placeholder: 'Ej: Windows 11 Pro' },
            { name: 'ip', label: 'Dirección IP', placeholder: 'Ej: 192.168.1.50' },
            { name: 'mac', label: 'Dirección MAC', placeholder: 'Ej: AA:BB:CC:DD:EE:FF' }
        ],
        notebook: [
            { name: 'procesador', label: 'Procesador', placeholder: 'Ej: AMD Ryzen 5' },
            { name: 'ram', label: 'Memoria RAM', placeholder: 'Ej: 8 GB' },
            { name: 'almacenamiento', label: 'Almacenamiento', placeholder: 'Ej: 256 GB SSD' },
            { name: 'pantalla', label: 'Tamaño Pantalla', placeholder: 'Ej: 14"' },
            { name: 'so', label: 'Sistema Operativo', placeholder: 'Ej: Ubuntu 22.04' },
            { name: 'bateria', label: 'N° Serie Batería', placeholder: 'Opcional' }
        ],
        monitor: [
            { name: 'pantalla', label: 'Tamaño Pantalla', placeholder: 'Ej: 24"' },
            { name: 'resolucion', label: 'Resolución', placeholder: 'Ej: 1920x1080' },
            { name: 'panel', label: 'Tipo Panel', placeholder: 'Ej: IPS, VA' },
            { name: 'puertos', label: 'Puertos', placeholder: 'Ej: HDMI, DP, VGA' }
        ],
        ups: [
            { name: 'potencia', label: 'Potencia', placeholder: 'Ej: 1000VA' },
            { name: 'autonomia', label: 'Autonomía', placeholder: 'Ej: 15 min' },
            { name: 'baterias', label: 'N° Baterías', placeholder: 'Ej: 2x 12V 7Ah' }
        ],
        printer: [
            { name: 'tipo', label: 'Tipo', placeholder: 'Ej: Láser Monocromática' },
            { name: 'conectividad', label: 'Conectividad', placeholder: 'Ej: USB, WiFi, Ethernet' },
            { name: 'insumos', label: 'Insumos', placeholder: 'Ej: Toner TN-1060' }
        ]
    };

    const getCategoryType = (categoryId) => {
        if (!categoryId) return 'default';
        const category = categories.find(c => c.id.toString() === categoryId.toString());
        if (!category) return 'default';

        const name = category.nombre.toLowerCase();
        if (name.includes('pc') || name.includes('escritorio') || name.includes('cpu')) return 'pc';
        if (name.includes('notebook') || name.includes('laptop') || name.includes('portatil')) return 'notebook';
        if (name.includes('monitor') || name.includes('pantalla')) return 'monitor';
        if (name.includes('ups') || name.includes('estabilizador')) return 'ups';
        if (name.includes('impresora') || name.includes('multifuncion')) return 'printer';

        return 'default';
    };

    useEffect(() => {
        fetchCategories();
        fetchAssets();
    }, [filters]);

    const fetchCategories = async () => {
        try {
            const response = await api.get('/categories');
            setCategories(response.data);
        } catch (error) {
            console.error('Error al cargar categorías', error);
            toast.error('Error al cargar categorías');
        }
    };

    const fetchAssets = async () => {
        try {
            const params = new URLSearchParams();
            if (filters.category_id) params.append('category_id', filters.category_id);
            if (filters.estado) params.append('estado', filters.estado);
            if (filters.area) params.append('area', filters.area);
            if (filters.usuario_asignado) params.append('usuario_asignado', filters.usuario_asignado);
            if (filters.search) params.append('search', filters.search);

            const response = await api.get(`/inventory?${params.toString()}`);
            setAssets(response.data.assets || response.data);
        } catch (error) {
            console.error('Error al cargar equipos', error);
            toast.error('Error al cargar equipos');
        }
    };

    const handleOpenChange = (open) => {
        setIsOpen(open);
        if (!open) {
            setCurrentAsset(null);
            setFormData({
                category_id: '',
                marca: '',
                modelo: '',
                numero_serie: '',
                codigo_inventario: '',
                area: '',
                estado: 'EN_DEPOSITO',
                usuario_asignado: '',
                observaciones: '',
                specs: {}
            });
        }
    };

    const handleEdit = (asset) => {
        setCurrentAsset(asset);
        setFormData({
            category_id: asset.category_id,
            marca: asset.marca,
            modelo: asset.modelo,
            numero_serie: asset.numero_serie || '',
            codigo_inventario: asset.codigo_inventario,
            area: asset.area || '',
            estado: asset.estado,
            usuario_asignado: asset.usuario_asignado || '',
            observaciones: asset.observaciones || '',
            specs: asset.specs || {}
        });
        setIsOpen(true);
    };

    const handleDelete = async (id) => {
        if (confirm('¿Está seguro de eliminar este equipo?')) {
            try {
                await api.delete(`/inventory/${id}`);
                fetchAssets();
                toast.success('Equipo eliminado correctamente');
            } catch (error) {
                console.error('Error al eliminar equipo', error);
                toast.error('Error al eliminar el equipo');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentAsset) {
                await api.put(`/inventory/${currentAsset.id}`, formData);
            } else {
                await api.post('/inventory', formData);
            }
            fetchAssets();
            handleOpenChange(false);
            toast.success(currentAsset ? 'Equipo actualizado correctamente' : 'Equipo creado correctamente');
        } catch (error) {
            console.error('Error al guardar equipo', error);
            toast.error(error.response?.data?.error || 'Error al guardar equipo');
        }
    };

    const clearFilters = () => {
        setFilters({
            category_id: '',
            estado: '',
            area: '',
            usuario_asignado: '',
            search: ''
        });
    };

    const getEstadoLabel = (estado) => {
        return ESTADOS.find(e => e.value === estado)?.label || estado;
    };

    const getEstadoColor = (estado) => {
        const colors = {
            'EN_USO': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
            'EN_DEPOSITO': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
            'EN_REPARACION': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
            'BAJA': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
        };
        return colors[estado] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    };

    const handleSpecChange = (key, value) => {
        setFormData(prev => ({
            ...prev,
            specs: {
                ...prev.specs,
                [key]: value
            }
        }));
    };

    const addCustomSpec = () => {
        const key = prompt('Nombre de la característica:');
        if (key && key.trim()) {
            handleSpecChange(key.trim(), '');
        }
    };

    const removeSpec = (key) => {
        const newSpecs = { ...formData.specs };
        delete newSpecs[key];
        setFormData(prev => ({ ...prev, specs: newSpecs }));
    };

    const renderSpecsFields = () => {
        const type = getCategoryType(formData.category_id);
        const configFields = SPECS_CONFIG[type] || [];
        const currentSpecs = formData.specs || {};

        // Campos configurados
        const configuredInputs = configFields.map(field => (
            <div key={field.name} className="grid gap-2">
                <Label htmlFor={`spec-${field.name}`}>{field.label}</Label>
                <Input
                    id={`spec-${field.name}`}
                    placeholder={field.placeholder}
                    value={currentSpecs[field.name] || ''}
                    onChange={(e) => handleSpecChange(field.name, e.target.value)}
                />
            </div>
        ));

        // Campos personalizados (que no están en la config)
        const customKeys = Object.keys(currentSpecs).filter(key =>
            !configFields.some(f => f.name === key)
        );

        const customInputs = customKeys.map(key => (
            <div key={key} className="grid gap-2 relative">
                <Label htmlFor={`spec-${key}`}>{key}</Label>
                <div className="flex gap-2">
                    <Input
                        id={`spec-${key}`}
                        value={currentSpecs[key]}
                        onChange={(e) => handleSpecChange(key, e.target.value)}
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive/80"
                        onClick={() => removeSpec(key)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        ));

        return (
            <div className="space-y-4 border rounded-md p-4 bg-muted/20">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">Características Técnicas</h3>
                    <Button type="button" variant="outline" size="sm" onClick={addCustomSpec}>
                        <Plus className="h-3 w-3 mr-1" /> Agregar
                    </Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    {configuredInputs}
                    {customInputs}
                </div>
                {configuredInputs.length === 0 && customInputs.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-2">
                        Seleccione una categoría para ver campos sugeridos o agregue características manualmente.
                    </p>
                )}
            </div>
        );
    };

    const renderSpecsSummary = (specs) => {
        if (!specs || Object.keys(specs).length === 0) return <span className="text-muted-foreground">-</span>;

        // Priorizar mostrar procesador y ram si existen
        const summary = [];
        if (specs.procesador) summary.push(specs.procesador);
        if (specs.ram) summary.push(specs.ram);
        if (specs.pantalla) summary.push(specs.pantalla);

        if (summary.length > 0) {
            return <span className="text-xs">{summary.join(' | ')}</span>;
        }

        // Si no hay campos comunes, mostrar el primero
        const firstKey = Object.keys(specs)[0];
        return <span className="text-xs text-muted-foreground">{firstKey}: {specs[firstKey]}</span>;
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Inventario de Equipos Informáticos</CardTitle>
                    <CardDescription>Gestión de equipamiento tecnológico</CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Filtros */}
                    <div className="flex flex-col gap-4 mb-6">
                        <div className="flex gap-4 flex-wrap">
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

                            <select
                                className="bg-input border-border text-foreground rounded px-3 py-2 text-sm focus:border-primary focus:ring-primary transition-all"
                                value={filters.estado}
                                onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
                            >
                                <option value="">Todos los estados</option>
                                {ESTADOS.map(estado => (
                                    <option key={estado.value} value={estado.value}>{estado.label}</option>
                                ))}
                            </select>

                            <Input
                                placeholder="Filtrar por área..."
                                value={filters.area}
                                onChange={(e) => setFilters({ ...filters, area: e.target.value })}
                                className="max-w-xs"
                            />

                            <Input
                                placeholder="Filtrar por usuario asignado..."
                                value={filters.usuario_asignado}
                                onChange={(e) => setFilters({ ...filters, usuario_asignado: e.target.value })}
                                className="max-w-xs"
                            />

                            <Input
                                placeholder="Buscar (marca, modelo, N° serie, código)..."
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                className="max-w-sm"
                            />

                            <Button variant="outline" onClick={clearFilters}>
                                <X className="mr-2 h-4 w-4" /> Limpiar Filtros
                            </Button>
                        </div>

                        <div>
                            <Dialog open={isOpen} onOpenChange={handleOpenChange}>
                                <DialogTrigger asChild>
                                    <Button><Plus className="mr-2 h-4 w-4" /> Agregar Equipo</Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle>{currentAsset ? 'Editar Equipo' : 'Agregar Equipo'}</DialogTitle>
                                    </DialogHeader>
                                    <form onSubmit={handleSubmit}>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="grid gap-2">
                                                    <Label htmlFor="category_id">Categoría *</Label>
                                                    <select
                                                        id="category_id"
                                                        className="bg-input border-border text-foreground rounded px-3 py-2 focus:border-primary focus:ring-primary transition-all"
                                                        value={formData.category_id}
                                                        onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                                        required
                                                    >
                                                        <option value="">Seleccione...</option>
                                                        {categories.map(cat => (
                                                            <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="estado">Estado *</Label>
                                                    <select
                                                        id="estado"
                                                        className="bg-input border-border text-foreground rounded px-3 py-2 focus:border-primary focus:ring-primary transition-all"
                                                        value={formData.estado}
                                                        onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                                                        required
                                                    >
                                                        {ESTADOS.map(estado => (
                                                            <option key={estado.value} value={estado.value}>{estado.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="grid gap-2">
                                                    <Label htmlFor="marca">Marca *</Label>
                                                    <Input
                                                        id="marca"
                                                        value={formData.marca}
                                                        onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="modelo">Modelo *</Label>
                                                    <Input
                                                        id="modelo"
                                                        value={formData.modelo}
                                                        onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="grid gap-2">
                                                    <Label htmlFor="numero_serie">Número de Serie</Label>
                                                    <Input
                                                        id="numero_serie"
                                                        value={formData.numero_serie}
                                                        onChange={(e) => setFormData({ ...formData, numero_serie: e.target.value })}
                                                    />
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="codigo_inventario">Código de Inventario *</Label>
                                                    <Input
                                                        id="codigo_inventario"
                                                        value={formData.codigo_inventario}
                                                        onChange={(e) => setFormData({ ...formData, codigo_inventario: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            {/* Sección de Specs Dinámicas */}
                                            {renderSpecsFields()}

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="grid gap-2">
                                                    <Label htmlFor="area">Área / Sector</Label>
                                                    <Input
                                                        id="area"
                                                        value={formData.area}
                                                        onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                                                    />
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="usuario_asignado">Usuario Asignado</Label>
                                                    <Input
                                                        id="usuario_asignado"
                                                        value={formData.usuario_asignado}
                                                        onChange={(e) => setFormData({ ...formData, usuario_asignado: e.target.value })}
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="observaciones">Observaciones</Label>
                                                <Textarea
                                                    id="observaciones"
                                                    value={formData.observaciones}
                                                    onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                                                    rows={3}
                                                />
                                            </div>

                                            {currentAsset && currentAsset.creator && (
                                                <div className="border-t pt-4 mt-2">
                                                    <p className="text-sm text-muted-foreground">
                                                        <strong>Creado por:</strong> {currentAsset.creator.username} el {new Date(currentAsset.createdAt).toLocaleString('es-AR')}
                                                    </p>
                                                    {currentAsset.updater && (
                                                        <p className="text-sm text-muted-foreground">
                                                            <strong>Última modificación:</strong> {currentAsset.updater.username} el {new Date(currentAsset.updatedAt).toLocaleString('es-AR')}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <DialogFooter>
                                            <Button type="submit">Guardar</Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>

                    {/* Tabla */}
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Categoría</TableHead>
                                    <TableHead>Marca</TableHead>
                                    <TableHead>Modelo</TableHead>
                                    <TableHead>Specs</TableHead>
                                    <TableHead>N° Serie</TableHead>
                                    <TableHead>Código</TableHead>
                                    <TableHead>Área</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead>Usuario Asignado</TableHead>
                                    <TableHead className="w-[100px]">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {assets.map((asset) => (
                                    <TableRow key={asset.id}>
                                        <TableCell className="font-medium">
                                            {asset.category?.nombre || 'N/A'}
                                        </TableCell>
                                        <TableCell>{asset.marca}</TableCell>
                                        <TableCell>{asset.modelo}</TableCell>
                                        <TableCell>{renderSpecsSummary(asset.specs)}</TableCell>
                                        <TableCell>{asset.numero_serie || '-'}</TableCell>
                                        <TableCell className="font-mono text-sm">{asset.codigo_inventario}</TableCell>
                                        <TableCell>{asset.area || '-'}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded text-xs ${getEstadoColor(asset.estado)}`}>
                                                {getEstadoLabel(asset.estado)}
                                            </span>
                                        </TableCell>
                                        <TableCell>{asset.usuario_asignado || '-'}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => handleView(asset)}>
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleEdit(asset)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-500 hover:text-red-600"
                                                    onClick={() => handleDelete(asset.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {assets.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={10} className="text-center text-muted-foreground h-24">
                                            No se encontraron equipos.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Modal de Detalles */}
                    <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
                        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Detalles del Equipo</DialogTitle>
                            </DialogHeader>
                            {viewAsset && (
                                <div className="grid gap-6 py-4">
                                    {/* Info Principal */}
                                    <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                                        <div className="grid gap-1">
                                            <span className="text-xs font-medium text-muted-foreground">Categoría</span>
                                            <span className="text-sm font-medium">{viewAsset.category?.nombre || 'N/A'}</span>
                                        </div>
                                        <div className="grid gap-1">
                                            <span className="text-xs font-medium text-muted-foreground">Estado</span>
                                            <span className={`text-sm px-2 py-0.5 rounded w-fit ${getEstadoColor(viewAsset.estado)}`}>
                                                {getEstadoLabel(viewAsset.estado)}
                                            </span>
                                        </div>
                                        <div className="grid gap-1">
                                            <span className="text-xs font-medium text-muted-foreground">Marca</span>
                                            <span className="text-sm">{viewAsset.marca}</span>
                                        </div>
                                        <div className="grid gap-1">
                                            <span className="text-xs font-medium text-muted-foreground">Modelo</span>
                                            <span className="text-sm">{viewAsset.modelo}</span>
                                        </div>
                                        <div className="grid gap-1">
                                            <span className="text-xs font-medium text-muted-foreground">Número de Serie</span>
                                            <span className="text-sm font-mono">{viewAsset.numero_serie || '-'}</span>
                                        </div>
                                        <div className="grid gap-1">
                                            <span className="text-xs font-medium text-muted-foreground">Código de Inventario</span>
                                            <span className="text-sm font-mono font-medium">{viewAsset.codigo_inventario}</span>
                                        </div>
                                        <div className="grid gap-1">
                                            <span className="text-xs font-medium text-muted-foreground">Área / Sector</span>
                                            <span className="text-sm">{viewAsset.area || '-'}</span>
                                        </div>
                                        <div className="grid gap-1">
                                            <span className="text-xs font-medium text-muted-foreground">Usuario Asignado</span>
                                            <span className="text-sm">{viewAsset.usuario_asignado || '-'}</span>
                                        </div>
                                    </div>

                                    {/* Specs */}
                                    <div className="border rounded-md p-4 bg-muted/20">
                                        <h4 className="text-sm font-medium mb-3">Características Técnicas</h4>
                                        {renderSpecsDetail(viewAsset.specs)}
                                    </div>

                                    {/* Observaciones */}
                                    {viewAsset.observaciones && (
                                        <div className="grid gap-1">
                                            <span className="text-xs font-medium text-muted-foreground">Observaciones</span>
                                            <p className="text-sm whitespace-pre-wrap bg-muted/10 p-2 rounded border">{viewAsset.observaciones}</p>
                                        </div>
                                    )}

                                    {/* Auditoría */}
                                    <div className="border-t pt-4 text-xs text-muted-foreground grid grid-cols-2 gap-4">
                                        <div>
                                            <span className="font-medium">Creado por:</span> {viewAsset.creator?.username || 'Desconocido'}
                                            <br />
                                            {viewAsset.createdAt ? new Date(viewAsset.createdAt).toLocaleString('es-AR') : '-'}
                                        </div>
                                        {viewAsset.updater && (
                                            <div>
                                                <span className="font-medium">Actualizado por:</span> {viewAsset.updater.username}
                                                <br />
                                                {viewAsset.updatedAt ? new Date(viewAsset.updatedAt).toLocaleString('es-AR') : '-'}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                            <DialogFooter>
                                <Button onClick={() => setIsViewOpen(false)}>Cerrar</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </CardContent>
            </Card>
        </div>
    );
}

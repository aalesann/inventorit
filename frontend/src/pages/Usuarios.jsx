import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import api from '../api/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Pencil, Power, PowerOff } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Usuarios() {
    const [users, setUsers] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [formData, setFormData] = useState({ username: '', email: '', password: '', role: 'user' });
    const [filters, setFilters] = useState({ role: '', is_active: '', search: '' });

    useEffect(() => {
        fetchUsers();
    }, [filters]);

    const fetchUsers = async () => {
        try {
            const params = new URLSearchParams();
            if (filters.role) params.append('role', filters.role);
            if (filters.is_active) params.append('is_active', filters.is_active);
            if (filters.search) params.append('search', filters.search);

            const response = await api.get(`/users?${params.toString()}`);
            setUsers(response.data.users || response.data);
        } catch (error) {
            console.error('Error al cargar usuarios', error);
        }
    };

    const handleOpenChange = (open) => {
        setIsOpen(open);
        if (!open) {
            setCurrentUser(null);
            setFormData({ username: '', email: '', password: '', role: 'user' });
        }
    };

    const handleEdit = (user) => {
        setCurrentUser(user);
        setFormData({
            username: user.username,
            email: user.email,
            role: user.role,
            password: ''
        });
        setIsOpen(true);
    };

    const handleToggleActive = async (user) => {
        if (confirm(`¿Está seguro de ${user.is_active ? 'desactivar' : 'activar'} este usuario?`)) {
            try {
                await api.patch(`/users/${user.id}/toggle-active`, {
                    is_active: !user.is_active
                });
                fetchUsers();
                toast.success(`Usuario ${!user.is_active ? 'activado' : 'desactivado'} correctamente`);
            } catch (error) {
                console.error('Error al cambiar estado del usuario', error);
                toast.error(error.response?.data?.error || 'Error al cambiar estado del usuario');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentUser) {
                await api.put(`/users/${currentUser.id}`, formData);
            } else {
                await api.post('/users', formData);
            }
            fetchUsers();
            handleOpenChange(false);
            toast.success(currentUser ? 'Usuario actualizado correctamente' : 'Usuario creado correctamente');
        } catch (error) {
            console.error('Error al guardar usuario', error);
            toast.error(error.response?.data?.error || 'Error al guardar usuario');
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Gestión de Usuarios</CardTitle>
                    <CardDescription>Administre los usuarios del sistema</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-4 mb-6">
                        <div className="flex gap-4 flex-wrap">
                            <select
                                className="bg-input border-border text-foreground rounded px-3 py-2 text-sm focus:border-primary focus:ring-primary transition-all"
                                value={filters.role}
                                onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                            >
                                <option value="">Todos los roles</option>
                                <option value="admin">Administrador</option>
                                <option value="user">Usuario</option>
                            </select>

                            <select
                                className="bg-input border-border text-foreground rounded px-3 py-2 text-sm focus:border-primary focus:ring-primary transition-all"
                                value={filters.is_active}
                                onChange={(e) => setFilters({ ...filters, is_active: e.target.value })}
                            >
                                <option value="">Todos los estados</option>
                                <option value="true">Activos</option>
                                <option value="false">Inactivos</option>
                            </select>

                            <Input
                                placeholder="Buscar por nombre o correo..."
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                className="max-w-xs"
                            />

                            <Dialog open={isOpen} onOpenChange={handleOpenChange}>
                                <DialogTrigger asChild>
                                    <Button><Plus className="mr-2 h-4 w-4" /> Crear Usuario</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>{currentUser ? 'Editar Usuario' : 'Crear Usuario'}</DialogTitle>
                                    </DialogHeader>
                                    <form onSubmit={handleSubmit}>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="username">Nombre de Usuario</Label>
                                                <Input
                                                    id="username"
                                                    value={formData.username}
                                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="email">Correo Electrónico</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="password">Contraseña {currentUser && '(dejar en blanco para no cambiar)'}</Label>
                                                <Input
                                                    id="password"
                                                    type="password"
                                                    value={formData.password}
                                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                    required={!currentUser}
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="role">Rol</Label>
                                                <select
                                                    id="role"
                                                    className="bg-input border-border text-foreground rounded px-3 py-2 focus:border-primary focus:ring-primary transition-all"
                                                    value={formData.role}
                                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                                >
                                                    <option value="user">Usuario</option>
                                                    <option value="admin">Administrador</option>
                                                </select>
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button type="submit">Guardar</Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>

                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Usuario</TableHead>
                                    <TableHead>Correo</TableHead>
                                    <TableHead>Rol</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead className="w-[100px]">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">{user.username}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded text-xs ${user.role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {user.role === 'admin' ? 'Administrador' : 'Usuario'}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded text-xs ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {user.is_active ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => handleEdit(user)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleToggleActive(user)}
                                                    className={user.is_active ? 'text-red-500' : 'text-green-500'}
                                                >
                                                    {user.is_active ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {users.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-muted-foreground h-24">
                                            No se encontraron usuarios.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

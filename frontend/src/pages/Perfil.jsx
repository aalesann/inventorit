import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Camera, User, Mail, Shield, Key } from 'lucide-react';

export default function Perfil() {
    const [user, setUser] = useState({
        username: '',
        email: '',
        role: '',
        avatar_url: null
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Password form state
    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: ''
    });

    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await api.get('/profile');
            setUser(response.data);
        } catch (error) {
            console.error('Error al cargar perfil', error);
            toast.error('No se pudo cargar la información del perfil');
        } finally {
            setLoading(false);
        }
    };

    const handleBasicInfoChange = (e) => {
        const { name, value } = e.target;
        setUser(prev => ({ ...prev, [name]: value }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswords(prev => ({ ...prev, [name]: value }));
    };

    const saveBasicInfo = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const response = await api.put('/profile', {
                username: user.username,
                email: user.email
            });
            setUser(prev => ({ ...prev, ...response.data }));
            toast.success('Perfil actualizado correctamente');
        } catch (error) {
            console.error('Error al actualizar perfil', error);
            const msg = error.response?.data?.error || 'Error al actualizar el perfil';
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    };

    const updatePassword = async (e) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            toast.error('Las contraseñas nuevas no coinciden');
            return;
        }
        if (passwords.new.length < 6) {
            toast.error('La contraseña nueva debe tener al menos 6 caracteres');
            return;
        }

        setSaving(true);
        try {
            await api.put('/profile/password', {
                password_actual: passwords.current,
                password_nueva: passwords.new
            });
            toast.success('Contraseña actualizada correctamente');
            setPasswords({ current: '', new: '', confirm: '' });
        } catch (error) {
            console.error('Error al cambiar contraseña', error);
            const msg = error.response?.data?.error || 'Error al cambiar la contraseña';
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Por favor selecciona un archivo de imagen válido');
            return;
        }

        const formData = new FormData();
        formData.append('avatar', file);

        const toastId = toast.loading('Subiendo imagen...');

        try {
            const response = await api.post('/profile/avatar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setUser(prev => ({ ...prev, avatar_url: response.data.avatar_url }));
            toast.success('Foto de perfil actualizada', { id: toastId });
        } catch (error) {
            console.error('Error al subir avatar', error);
            toast.error('Error al subir la imagen', { id: toastId });
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 p-4">
            {/* Header / Avatar */}
            <div className="flex flex-col items-center space-y-4">
                <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                    <Avatar className="w-32 h-32 border-4 border-background shadow-xl">
                        <AvatarImage src={user.avatar_url} style={{ objectFit: 'cover' }} />
                        <AvatarFallback className="text-4xl bg-primary/10 text-primary">
                            {user.username?.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="w-8 h-8 text-white" />
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                </div>
                <div className="text-center">
                    <h1 className="text-2xl font-bold">{user.username}</h1>
                    <p className="text-muted-foreground capitalize flex items-center justify-center gap-2">
                        <Shield className="w-4 h-4" />
                        {user.role}
                    </p>
                </div>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                {/* Basic Info Form */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="w-5 h-5" />
                            Información Básica
                        </CardTitle>
                        <CardDescription>
                            Actualiza tu información personal
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={saveBasicInfo}>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="username">Nombre de Usuario</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="username"
                                        name="username"
                                        value={user.username}
                                        onChange={handleBasicInfoChange}
                                        className="pl-9"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Correo Electrónico</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={user.email}
                                        onChange={handleBasicInfoChange}
                                        className="pl-9"
                                        required
                                    />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" disabled={saving}>
                                {saving ? 'Guardando...' : 'Guardar Cambios'}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>

                {/* Password Change Form */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Key className="w-5 h-5" />
                            Seguridad
                        </CardTitle>
                        <CardDescription>
                            Cambia tu contraseña de acceso
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={updatePassword}>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="current">Contraseña Actual</Label>
                                <Input
                                    id="current"
                                    name="current"
                                    type="password"
                                    value={passwords.current}
                                    onChange={handlePasswordChange}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="new">Nueva Contraseña</Label>
                                <Input
                                    id="new"
                                    name="new"
                                    type="password"
                                    value={passwords.new}
                                    onChange={handlePasswordChange}
                                    minLength={6}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirm">Confirmar Contraseña</Label>
                                <Input
                                    id="confirm"
                                    name="confirm"
                                    type="password"
                                    value={passwords.confirm}
                                    onChange={handlePasswordChange}
                                    minLength={6}
                                    required
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" variant="outline" disabled={saving}>
                                {saving ? 'Actualizando...' : 'Actualizar Contraseña'}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    );
}

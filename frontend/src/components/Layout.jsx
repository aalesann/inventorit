import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import ThemeToggle from './ThemeToggle';

export default function Layout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isAdmin = user?.role === 'admin';

    return (
        <div className="min-h-screen bg-background">
            <header className="bg-card border-b border-border shadow-lg">
                <div className="container mx-auto flex h-16 items-center justify-between px-4">
                    <div className="flex items-center gap-6">
                        <Link to="/" className="text-lg font-bold text-foreground hover:text-primary transition-colors">
                            <span className="bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
                                Sistema de Gestión
                            </span>
                        </Link>
                        <nav className="flex items-center gap-4 text-sm font-medium">
                            <Link
                                to="/inventario"
                                className="transition-colors hover:text-primary text-muted-foreground hover:scale-105 transform duration-200"
                            >
                                Inventario
                            </Link>
                            {isAdmin && (
                                <>
                                    <Link
                                        to="/usuarios"
                                        className="transition-colors hover:text-primary text-muted-foreground hover:scale-105 transform duration-200"
                                    >
                                        Usuarios
                                    </Link>
                                    <Link
                                        to="/reportes"
                                        className="transition-colors hover:text-primary text-muted-foreground hover:scale-105 transform duration-200"
                                    >
                                        Reportes
                                    </Link>
                                </>
                            )}
                            <Link
                                to="/perfil"
                                className="transition-colors hover:text-primary text-muted-foreground hover:scale-105 transform duration-200"
                            >
                                Mi Perfil
                            </Link>
                        </nav>
                    </div>
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <span className="text-sm text-foreground">
                            {user?.username}
                            <span className="ml-2 px-2 py-1 bg-primary/20 border border-primary/30 rounded text-xs text-primary font-semibold">
                                {isAdmin ? 'Admin' : 'Usuario'}
                            </span>
                        </span>
                        <Button
                            variant="outline"
                            onClick={handleLogout}
                            className="bg-secondary text-foreground hover:bg-primary hover:text-primary-foreground border-border transition-all hover:scale-105"
                        >
                            Cerrar Sesión
                        </Button>
                    </div>
                </div>
            </header>
            <main className="container mx-auto py-6 px-4">
                <Outlet />
            </main>
        </div>
    );
}

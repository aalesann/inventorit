import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import AnimatedBackground from '@/components/AnimatedBackground';

import { toast } from 'sonner';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(username, password);
            navigate('/');
        } catch (err) {
            // Rate limit (429) is handled by axios interceptor
            if (err.response?.status !== 429) {
                // Use backend error message if available, otherwise default
                let msg = err.response?.data?.error || 'Credenciales inválidas';

                // Check for rate limit headers to show remaining attempts (only if not already blocked)
                const remaining = err.response?.headers['ratelimit-remaining'];
                if (remaining !== undefined && !msg.includes('bloqueada')) {
                    msg += `. Intentos restantes: ${remaining}`;
                }

                setError(msg);
                toast.error(msg);
            }
        }
    };

    return (
        <div className="relative flex items-center justify-center min-h-screen overflow-hidden">
            <AnimatedBackground />

            <div className="relative z-10 w-full max-w-md px-4">
                {/* Robot Avatar */}
                <div className="flex justify-center mb-8">
                    <div className="relative w-32 h-32 transition-all duration-300 ease-in-out">
                        {/* SVG Robot with circular background */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <svg
                                viewBox="0 0 120 120"
                                className="w-full h-full"
                            >
                                {/* Circular glowing background */}
                                <defs>
                                    <radialGradient id="robotGlow" cx="50%" cy="50%" r="50%">
                                        <stop offset="0%" stopColor="#3DD9E8" stopOpacity="0.2" />
                                        <stop offset="70%" stopColor="#3DD9E8" stopOpacity="0.1" />
                                        <stop offset="100%" stopColor="#3DD9E8" stopOpacity="0" />
                                    </radialGradient>
                                    <filter id="glow">
                                        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                                        <feMerge>
                                            <feMergeNode in="coloredBlur" />
                                            <feMergeNode in="SourceGraphic" />
                                        </feMerge>
                                    </filter>
                                </defs>

                                {/* Glowing circle background */}
                                <circle cx="60" cy="60" r="45" fill="url(#robotGlow)" />
                                <circle cx="60" cy="60" r="35" fill="rgba(31, 41, 55, 0.8)" stroke="#3DD9E8" strokeWidth="2" opacity="0.5" />

                                {/* Robot Head */}
                                <rect x="35" y="40" width="50" height="45" rx="8" fill="#1f2937" stroke="#3DD9E8" strokeWidth="2.5" filter="url(#glow)" />

                                {/* Antenna */}
                                <line x1="60" y1="40" x2="60" y2="28" stroke="#3DD9E8" strokeWidth="2.5" filter="url(#glow)" />
                                <circle cx="60" cy="26" r="4" fill="#3DD9E8" filter="url(#glow)">
                                    <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" />
                                </circle>

                                {isPasswordFocused ? (
                                    <>
                                        {/* Hands covering eyes */}
                                        <rect x="40" y="52" width="16" height="13" rx="3" fill="#3DD9E8" filter="url(#glow)" />
                                        <rect x="64" y="52" width="16" height="13" rx="3" fill="#3DD9E8" filter="url(#glow)" />
                                        {/* Blush marks */}
                                        <ellipse cx="35" cy="60" rx="3" ry="4" fill="#3DD9E8" opacity="0.3" />
                                        <ellipse cx="85" cy="60" rx="3" ry="4" fill="#3DD9E8" opacity="0.3" />
                                    </>
                                ) : (
                                    <>
                                        {/* Eyes open */}
                                        <circle cx="48" cy="58" r="6" fill="#3DD9E8" filter="url(#glow)" />
                                        <circle cx="72" cy="58" r="6" fill="#3DD9E8" filter="url(#glow)" />
                                        <circle cx="48" cy="58" r="3" fill="#1f2937" />
                                        <circle cx="72" cy="58" r="3" fill="#1f2937" />
                                        {/* Eye shine */}
                                        <circle cx="49" cy="56" r="1.5" fill="#3DD9E8" opacity="0.8" />
                                        <circle cx="73" cy="56" r="1.5" fill="#3DD9E8" opacity="0.8" />
                                    </>
                                )}

                                {/* Mouth */}
                                <path d="M 45 72 Q 60 78 75 72" stroke="#3DD9E8" strokeWidth="2.5" fill="none" strokeLinecap="round" filter="url(#glow)" />

                                {/* Decorative elements */}
                                <circle cx="38" cy="45" r="1.5" fill="#3DD9E8" opacity="0.6" />
                                <circle cx="82" cy="45" r="1.5" fill="#3DD9E8" opacity="0.6" />
                            </svg>
                        </div>
                    </div>
                </div>

                <Card className="backdrop-blur-md bg-card/90 border-border shadow-2xl shadow-primary/20">
                    <CardHeader className="space-y-1 text-center">
                        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
                            Acceso al Sistema
                        </CardTitle>
                        <CardDescription className="text-muted-foreground">
                            Ingrese sus credenciales para continuar
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="username" className="text-foreground">
                                    Usuario
                                </Label>
                                <Input
                                    id="username"
                                    placeholder="Ingrese su usuario"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    className="bg-input border-border focus:border-primary focus:ring-primary transition-all"
                                    autoComplete="username"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-foreground">
                                    Contraseña
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Ingrese su contraseña"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onFocus={() => setIsPasswordFocused(true)}
                                    onBlur={() => setIsPasswordFocused(false)}
                                    required
                                    className="bg-input border-border focus:border-primary focus:ring-primary transition-all"
                                    autoComplete="current-password"
                                />
                            </div>
                            {error && (
                                <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
                                    <p className="text-sm text-destructive font-medium">{error}</p>
                                </div>
                            )}
                            <Button
                                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/30 transition-all hover:shadow-primary/50 hover:scale-[1.02]"
                                type="submit"
                            >
                                Ingresar
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

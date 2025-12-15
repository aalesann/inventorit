import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is authenticated by calling /me endpoint
        const checkAuth = async () => {
            try {
                const response = await api.get('/auth/me');
                setUser(response.data);
            } catch (error) {
                setUser(null);
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    const login = async (username, password) => {
        const response = await api.post('/auth/login', { username, password });

        // Cookies are set automatically by the server
        // Fetch user info after successful login
        const userResponse = await api.get('/auth/me');
        setUser(userResponse.data);
    };

    const register = async (username, password) => {
        await api.post('/auth/register', { username, password });
    };

    const logout = async () => {
        try {
            // Call logout endpoint to revoke refresh token
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Clear user state
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

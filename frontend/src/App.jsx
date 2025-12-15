import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Login from './pages/Login';
import Inventario from './pages/Inventario';
import Usuarios from './pages/Usuarios';
import Perfil from './pages/Perfil';
import Reportes from './pages/Reportes';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <Toaster position="top-right" richColors closeButton />
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/" element={<Navigate to="/inventario" replace />} />
                <Route path="/inventario" element={<Inventario />} />
                <Route path="/usuarios" element={<Usuarios />} />
                <Route path="/reportes" element={<Reportes />} />
                <Route path="/perfil" element={<Perfil />} />
              </Route>
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Redirige la ruta principal (/) a /login si no está autenticado */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Página de inicio de sesión */}
        <Route path="/login" element={<LoginPage />} />

        {/* Página de registro */}
        <Route path="/register" element={<RegisterPage />} />

        {/* Ruta protegida para la página principal */}
        <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;

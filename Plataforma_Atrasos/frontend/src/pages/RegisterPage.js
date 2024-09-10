import React, { useState } from 'react';
import { register } from '../services/authService';

const RegisterPage = () => {
    const [nombreUsuario, setNombreUsuario] = useState('');
    const [rutUsername, setRutUsername] = useState('');
    const [contraseña, setContraseña] = useState('');
    const [confirmarContraseña, setConfirmarContraseña] = useState('');
    const [codRol, setCodRol] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (contraseña !== confirmarContraseña) {
            setError('Las contraseñas no coinciden');
            return;
        }

        try {
            await register({ nombreUsuario, rutUsername, contraseña, codRol });
            console.log('Registro exitoso');
            // Aquí podrías redirigir al usuario al login o a otra página
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div>
            <h2>Registro</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Nombre de Usuario</label>
                    <input
                        type="text"
                        value={nombreUsuario}
                        onChange={(e) => setNombreUsuario(e.target.value)}
                    />
                </div>
                <div>
                    <label>RUT</label>
                    <input
                        type="text"
                        value={rutUsername}
                        onChange={(e) => setRutUsername(e.target.value)}
                    />
                </div>
                <div>
                    <label>Contraseña</label>
                    <input
                        type="password"
                        value={contraseña}
                        onChange={(e) => setContraseña(e.target.value)}
                    />
                </div>
                <div>
                    <label>Confirmar Contraseña</label>
                    <input
                        type="password"
                        value={confirmarContraseña}
                        onChange={(e) => setConfirmarContraseña(e.target.value)}
                    />
                </div>
                <div>
                    <label>Código de Rol</label>
                    <input
                        type="number"
                        value={codRol}
                        onChange={(e) => setCodRol(e.target.value)}
                    />
                </div>
                <button type="submit">Registrar</button>
            </form>
        </div>
    );
};

export default RegisterPage;
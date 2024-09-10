export const login = async (rutUsername, contraseña) => {
    const response = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rutUsername, contraseña })
    });

    const data = await response.json();
    if (response.ok) {
        localStorage.setItem('token', data.token);
        return data;
    } else {
        throw new Error(data.message || 'Error en la autenticación');
    }
};

export const register = async (rutUsername, contraseña) => {
    const response = await fetch('http://localhost:3000/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rutUsername, contraseña })
    });

    const data = await response.json();
    if (response.ok) {
        return data;
    } else {
        throw new Error(data.message || 'Error en el registro');
    }
};
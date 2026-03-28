import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAdminExists from '../hooks/useAdminExists';

function AdminLogin() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const adminExists = useAdminExists();

    useEffect(() => {
        if (adminExists === false) {
            navigate('/register-admin');
        }
    }, [adminExists, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (res.ok && data.token) {
            localStorage.setItem('token', data.token);
            window.location.href = '/admin-dashboard';
        } else {
            setError(data.message || 'Erreur de connexion');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded shadow-md w-80">
                <h2 className="text-2xl mb-4 font-bold text-center">Admin Login</h2>
                {error && <div className="text-red-500 mb-2">{error}</div>}
                <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} className="w-full mb-3 p-2 rounded bg-gray-700 text-white" />
                <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full mb-3 p-2 rounded bg-gray-700 text-white" />
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded">Se connecter</button>
            </form>
        </div>
    );
}

export default AdminLogin;

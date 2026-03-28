import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminRegister() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (password !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas.');
            return;
        }
        const res = await fetch('/api/register-admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        const data = await res.json();
        if (res.ok) {
            setSuccess('Administrateur créé avec succès. Redirection vers la connexion...');
            setUsername(''); setEmail(''); setPassword(''); setConfirmPassword('');
            setTimeout(() => {
                navigate('/hidden-admin-gate');
            }, 1500);
        } else {
            setError(data.message || 'Erreur lors de la création de l\'admin.');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded shadow-md w-96">
                <h2 className="text-2xl mb-4 font-bold text-center">Créer un compte admin</h2>
                {error && <div className="text-red-500 mb-2">{error}</div>}
                {success && <div className="text-green-500 mb-2">{success}</div>}
                <input type="text" placeholder="Pseudo" value={username} onChange={e => setUsername(e.target.value)} className="w-full mb-3 p-2 rounded bg-gray-700 text-white" required />
                <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full mb-3 p-2 rounded bg-gray-700 text-white" required />
                <input type={showPassword ? 'text' : 'password'} placeholder="Mot de passe" value={password} onChange={e => setPassword(e.target.value)} className="w-full mb-3 p-2 rounded bg-gray-700 text-white" required />
                <input type={showPassword ? 'text' : 'password'} placeholder="Confirmer le mot de passe" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full mb-3 p-2 rounded bg-gray-700 text-white" required />
                <label className="flex items-center mb-3">
                    <input type="checkbox" checked={showPassword} onChange={e => setShowPassword(e.target.checked)} className="mr-2" />
                    Afficher le mot de passe
                </label>
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded">Créer le compte admin</button>
            </form>
        </div>
    );
}

export default AdminRegister;

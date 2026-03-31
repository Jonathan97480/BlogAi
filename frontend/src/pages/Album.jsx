import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaRegTrashAlt } from 'react-icons/fa';

function Album() {
    const navigate = useNavigate();
    const [images, setImages] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        fetch('/api/posts/images', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
            .then(async res => {
                if (res.status === 401 || res.status === 403) {
                    localStorage.removeItem('token');
                    navigate('/hidden-admin-gate');
                    return;
                }
                const data = await res.json();
                if (Array.isArray(data)) setImages(data);
                else {
                    setImages([]);
                    setError(data.message || 'Erreur lors du chargement des images');
                }
            })
            .catch(() => setError('Erreur lors du chargement des images'));
    }, [navigate]);

    const handleDelete = async (filename) => {
        if (!window.confirm('Supprimer cette image ?')) return;
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/posts/images/${filename}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            setImages(images.filter(img => img.filename !== filename));
        } else {
            alert('Erreur lors de la suppression');
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Album photos</h1>
            {error && <div className="text-red-500 mb-4">{error}</div>}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {images.map(img => (
                    <div key={img.filename} className="bg-gray-800 rounded-lg p-4 shadow flex flex-col items-center">
                        <img
                            src={img.url ? (img.url.startsWith('/img/') ? img.url : img.url) : `/img/${img.filename}`}
                            alt={img.filename}
                            className="w-[300px] h-[300px] object-cover rounded mb-3 border border-gray-700"
                        />
                        {!img.isLinked && (
                            <button
                                className="text-red-400 hover:text-red-600 p-2"
                                title="Supprimer l'image"
                                onClick={() => handleDelete(img.filename)}
                            >
                                <FaRegTrashAlt size={24} />
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Album;

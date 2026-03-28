import React, { useEffect, useState } from 'react';

function PagesAdmin() {
    const [pages, setPages] = useState([]);
    const [showEditor, setShowEditor] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [editId, setEditId] = useState(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);

    useEffect(() => {
        fetchPages();
    }, [showEditor, success]);

    const fetchPages = async () => {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/pages', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            setPages(await res.json());
        } else {
            setPages([]);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setError(''); setSuccess('');
        if (!title) { setError('Le titre est obligatoire.'); return; }
        const token = localStorage.getItem('token');
        const res = await fetch('/api/pages', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ titre: title, description })
        });
        if (res.ok) {
            setSuccess('Page créée !');
            setTitle(''); setDescription(''); setShowEditor(false);
        } else {
            setError('Erreur lors de la création.');
        }
    };

    const handleEdit = (page) => {
        setEditId(page.id);
        setTitle(page.titre);
        setDescription(page.description || '');
        setShowEditor(false);
        setError(''); setSuccess('');
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setError(''); setSuccess('');
        if (!title) { setError('Le titre est obligatoire.'); return; }
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/pages/${editId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ titre: title, description })
        });
        if (res.ok) {
            setSuccess('Page modifiée !');
            setEditId(null); setTitle(''); setDescription('');
        } else {
            setError('Erreur lors de la modification.');
        }
    };

    const handleDelete = async (id) => {
        setError(''); setSuccess('');
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/pages/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            setSuccess('Page supprimée !');
            setConfirmDeleteId(null);
        } else {
            setError('Erreur lors de la suppression.');
        }
    };

    const handleCancelEdit = () => {
        setEditId(null); setTitle(''); setDescription(''); setError(''); setSuccess('');
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Pages</h1>
            <button className="mb-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded shadow" onClick={() => { setShowEditor(true); setEditId(null); setTitle(''); setDescription(''); }}>
                Créer une page
            </button>
            {(showEditor || editId) && (
                <form onSubmit={editId ? handleUpdate : handleCreate} className="mb-6 bg-gray-800 p-4 rounded shadow max-w-lg">
                    {error && <div className="text-red-500 mb-2">{error}</div>}
                    {success && <div className="text-green-500 mb-2">{success}</div>}
                    <input type="text" placeholder="Titre" value={title} onChange={e => setTitle(e.target.value)} className="w-full mb-3 p-2 rounded bg-gray-700 text-white" required />
                    <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} className="w-full mb-3 p-2 rounded bg-gray-700 text-white" rows={4} />
                    <div className="flex gap-2">
                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">{editId ? 'Modifier' : 'Enregistrer'}</button>
                        <button type="button" className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded" onClick={editId ? handleCancelEdit : () => setShowEditor(false)}>Annuler</button>
                    </div>
                </form>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pages.map(page => (
                    <div key={page.id} className="bg-gray-800 rounded-lg p-4 shadow flex flex-col">
                        <h2 className="text-xl font-bold text-blue-300 mb-2">{page.titre}</h2>
                        <p className="text-gray-300 mb-2">{page.description}</p>
                        <div className="flex gap-2 mt-2">
                            <button className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1 px-3 rounded" onClick={() => handleEdit(page)}>Éditer</button>
                            <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded" onClick={() => setConfirmDeleteId(page.id)}>Supprimer</button>
                        </div>
                        {confirmDeleteId === page.id && (
                            <div className="mt-2 bg-gray-900 p-2 rounded">
                                <p className="text-red-400 mb-2">Confirmer la suppression ?</p>
                                <div className="flex gap-2">
                                    <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded" onClick={() => handleDelete(page.id)}>Oui</button>
                                    <button className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-1 px-3 rounded" onClick={() => setConfirmDeleteId(null)}>Non</button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default PagesAdmin;

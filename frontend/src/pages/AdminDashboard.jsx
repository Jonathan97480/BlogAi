

import React, { useState, useEffect } from 'react';
import { FaRegEdit, FaRegTrashAlt, FaUndo, FaCheck, FaTimes as FaTimesIcon } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import ArticleEditor from './ArticleEditor';


import { FaTimes } from 'react-icons/fa';
import Album from './Album';
import PagesAdmin from './PagesAdmin';
// DEBUG LOGS
console.log('AdminDashboard chargé');

function AdminDashboard() {
    // Mock pour la clé API externe et permissions
    const [apiKey, setApiKey] = useState('sk-demo-1234567890abcdef');
    const [apiPerms, setApiPerms] = useState({ read: true, write: false, ia: false, admin: false });

    // Pour édition catégorie
    const [editCatId, setEditCatId] = useState(null);
    const [editCatName, setEditCatName] = useState('');
    // Pour la modal catégorie
    const [showCatModal, setShowCatModal] = useState(false);
    const [newCatName, setNewCatName] = useState('');
    const [catSuccess, setCatSuccess] = useState('');
    const [catError, setCatError] = useState('');
    const [categories, setCategories] = useState([]);

    // Charger les catégories à l'ouverture ou après création
    useEffect(() => {
        const token = localStorage.getItem('token');
        fetch('/api/categories', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setCategories(data);
                else setCategories([]);
            })
            .catch(() => setCategories([]));
    }, [showCatModal, catSuccess]);
    const [posts, setPosts] = useState([]);
    const [archived, setArchived] = useState([]);
    const [error, setError] = useState('');
    const [view, setView] = useState('articles'); // 'articles', 'archives', 'album'
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/hidden-admin-gate');
            return;
        }
        // Articles non archivés
        fetch('/api/posts', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => {
                if (res.status === 401 || res.status === 403) {
                    localStorage.removeItem('token');
                    navigate('/hidden-admin-gate');
                }
                return res.json();
            })
            .then(data => setPosts(data))
            .catch(() => setError('Erreur lors du chargement des articles'));

        // Articles archivés
        fetch('/api/posts/archives', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setArchived(data);
                } else {
                    setArchived([]);
                    setError(data && data.message ? data.message : 'Erreur lors du chargement des archives');
                }
            })
            .catch(() => {
                setArchived([]);
                setError('Erreur lors du chargement des archives');
            });
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    console.log('Render AdminDashboard', { posts, error });
    const [showEditor, setShowEditor] = useState(false);
    const [editArticle, setEditArticle] = useState(null);

    // Fonction pour archiver un article
    const handleArchive = async (postId) => {
        const token = localStorage.getItem('token');
        if (!window.confirm('Archiver cet article ?')) return;
        const res = await fetch(`/api/posts/${postId}/archive`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            setPosts(posts.filter(p => p.id !== postId));
        } else {
            alert('Erreur lors de l\'archivage');
        }
    };

    return (
        <div className="min-h-screen w-full max-w-none flex bg-gray-900 text-white">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-950 flex flex-col py-8 px-4 shadow-lg min-h-screen">
                <span className="text-2xl font-bold text-blue-500 mb-10">AI Tech Blog</span>
                <nav className="flex flex-col gap-4">
                    <button className={`text-left px-3 py-2 rounded font-semibold transition ${view === 'articles' ? 'bg-gray-800 text-blue-400' : 'hover:bg-gray-800'}`} onClick={() => setView('articles')}>Articles</button>
                    <button className={`text-left px-3 py-2 rounded font-semibold transition ${view === 'pages' ? 'bg-gray-800 text-blue-400' : 'hover:bg-gray-800'}`} onClick={() => setView('pages')}>Pages</button>
                    <button className={`text-left px-3 py-2 rounded font-semibold transition ${view === 'categories' ? 'bg-gray-800 text-blue-400' : 'hover:bg-gray-800'}`} onClick={() => setView('categories')}>Catégories</button>
                    <button className="text-left px-3 py-2 rounded hover:bg-gray-800 font-semibold transition">Utilisateurs</button>
                    <button className={`text-left px-3 py-2 rounded font-semibold transition ${view === 'settings' ? 'bg-gray-800 text-blue-400' : 'hover:bg-gray-800'}`} onClick={() => setView('settings')}>Paramètres</button>
                    <hr className="my-2 border-gray-700" />
                    <button className={`text-left px-3 py-2 rounded font-semibold transition ${view === 'archives' ? 'bg-gray-800 text-blue-400' : 'hover:bg-gray-800'}`} onClick={() => setView('archives')}>Archivage</button>
                    <button className={`text-left px-3 py-2 rounded font-semibold transition ${view === 'album' ? 'bg-gray-800 text-blue-400' : 'hover:bg-gray-800'}`} onClick={() => setView('album')}>Album</button>
                </nav>
                <button onClick={handleLogout} className="mt-auto bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-semibold">Se déconnecter</button>
            </aside>
            {/* Contenu principal */}
            <main className="flex-1 min-w-0 w-full p-6 md:p-10 overflow-x-hidden">
                {view === 'articles' && <>
                    <h1 className="text-3xl font-bold mb-6">Articles</h1>
                    <button
                        className="mb-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded shadow"
                        onClick={() => {
                            // On force juste le démontage/remontage de l'éditeur sans toucher au reste
                            setEditArticle(null);
                            if (showEditor) {
                                setShowEditor(false);
                                setTimeout(() => {
                                    setShowEditor(true);
                                }, 0); // délai minimal
                            } else {
                                setShowEditor(true);
                            }
                        }}
                        style={{ display: showEditor ? 'none' : 'inline-block' }}
                    >
                        Créer un article
                    </button>
                    {showEditor && (
                        <ArticleEditor
                            article={editArticle}
                            onArticleSaved={() => {
                                fetch('/api/posts', {
                                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                                })
                                    .then(res => res.json())
                                    .then(data => setPosts(data));
                                setShowEditor(false);
                                setEditArticle(null);
                            }}
                            onClose={() => {
                                setShowEditor(false);
                                setEditArticle(null);
                            }}
                        />
                    )}
                    {error && <div className="text-red-500 mb-4">{error}</div>}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {posts.map(post => (
                            <div key={`article-${post.id}`} className="bg-gray-800 rounded-lg p-4 shadow hover:shadow-lg transition relative">
                                <div className="mb-2 flex items-start justify-between gap-3">
                                    <h2 className="text-xl font-bold text-blue-300">{post.title}</h2>
                                    <div className="flex gap-2 shrink-0">
                                        <button
                                            title="Éditer"
                                            className="text-blue-400 hover:text-blue-600 p-1"
                                            onClick={() => { setEditArticle(post); setShowEditor(true); }}
                                        >
                                            <FaRegEdit size={20} />
                                        </button>
                                        <button
                                            title="Archiver"
                                            className="text-red-400 hover:text-red-600 p-1"
                                            onClick={() => handleArchive(post.id)}
                                        >
                                            <FaRegTrashAlt size={20} />
                                        </button>
                                    </div>
                                </div>
                                {/* Miniature de l'image */}
                                {post.media_url && (
                                    <img
                                        src={post.media_url.startsWith('/img/') ? post.media_url : post.media_url}
                                        alt={post.title}
                                        className="w-full h-44 object-cover rounded mb-3 border border-gray-700"

                                    />
                                )}
                                <div>
                                    <p className="text-gray-400 mb-2">Catégorie : {post.category}</p>
                                    {post.page_titre && (
                                        <p className="text-gray-400 mb-2">Page liée : <span className="font-semibold text-blue-400">{post.page_titre}</span></p>
                                    )}
                                    <p className="text-gray-300 mb-2">{post.excerpt}</p>
                                    <span className="text-xs text-gray-500">{new Date(post.created_at).toLocaleDateString('fr-FR')}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </>}

                {view === 'pages' && <PagesAdmin />}
                {view === 'categories' && (
                    <div className="w-full max-w-3xl bg-gray-800 rounded-lg shadow p-6 relative">
                        <div className="flex items-center mb-6">
                            <h1 className="text-3xl font-bold flex-1">Catégories</h1>
                            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow" onClick={() => setShowCatModal(true)}>Créer une catégorie</button>
                        </div>
                        {/* Liste des catégories */}
                        {categories.length === 0 ? (
                            <div className="text-gray-400">Aucune catégorie pour l’instant.</div>
                        ) : (
                            <ul className="space-y-2">
                                {categories.map(cat => (
                                    <li key={cat.id} className="bg-gray-900 rounded px-4 py-2 flex items-center justify-between">
                                        {editCatId === cat.id ? (
                                            <>
                                                <input
                                                    className="bg-gray-700 text-white rounded px-2 py-1 mr-2"
                                                    value={editCatName}
                                                    onChange={e => setEditCatName(e.target.value)}
                                                    autoFocus
                                                />
                                                <button className="text-green-400 hover:text-green-600 mr-2" title="Valider" onClick={async () => {
                                                    if (!editCatName.trim()) return;
                                                    const token = localStorage.getItem('token');
                                                    const res = await fetch(`/api/categories/${cat.id}`, {
                                                        method: 'PUT',
                                                        headers: {
                                                            'Authorization': `Bearer ${token}`,
                                                            'Content-Type': 'application/json'
                                                        },
                                                        body: JSON.stringify({ name: editCatName })
                                                    });
                                                    if (res.ok) {
                                                        setEditCatId(null);
                                                        setCatSuccess('Catégorie modifiée !');
                                                        setTimeout(() => setCatSuccess(''), 1000);
                                                    } else {
                                                        const data = await res.json();
                                                        setCatError(data.message || 'Erreur lors de la modification');
                                                    }
                                                }}><FaCheck /></button>
                                                <button className="text-red-400 hover:text-red-600" title="Annuler" onClick={() => setEditCatId(null)}><FaTimesIcon /></button>
                                            </>
                                        ) : (
                                            <>
                                                <span>{cat.name}</span>
                                                <div className="flex gap-2">
                                                    <button className="text-blue-400 hover:text-blue-600" title="Éditer" onClick={() => { setEditCatId(cat.id); setEditCatName(cat.name); }}><FaRegEdit /></button>
                                                    <button className="text-red-400 hover:text-red-600" title="Supprimer" onClick={async () => {
                                                        if (!window.confirm('Supprimer cette catégorie ?')) return;
                                                        const token = localStorage.getItem('token');
                                                        const res = await fetch(`/api/categories/${cat.id}`, {
                                                            method: 'DELETE',
                                                            headers: { 'Authorization': `Bearer ${token}` }
                                                        });
                                                        if (res.ok) {
                                                            setCatSuccess('Catégorie supprimée !');
                                                            setTimeout(() => setCatSuccess(''), 1000);
                                                        } else {
                                                            const data = await res.json();
                                                            setCatError(data.message || 'Erreur lors de la suppression');
                                                        }
                                                    }}><FaRegTrashAlt /></button>
                                                </div>
                                            </>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                        {/* Modal création catégorie */}
                        {showCatModal && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                <div className="bg-gray-900 p-6 rounded shadow-lg w-full max-w-sm relative">
                                    <button className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-xl" onClick={() => setShowCatModal(false)}><FaTimes /></button>
                                    <h3 className="text-lg font-bold mb-4">Créer une catégorie</h3>
                                    {catError && <div className="text-red-500 mb-2">{catError}</div>}
                                    {catSuccess && <div className="text-green-500 mb-2">{catSuccess}</div>}
                                    <input type="text" placeholder="Nom de la catégorie" value={newCatName} onChange={e => setNewCatName(e.target.value)} className="w-full mb-3 p-2 rounded bg-gray-700 text-white" />
                                    <button
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded"
                                        onClick={async () => {
                                            if (!newCatName.trim()) { setCatError('Le nom est requis'); return; }
                                            setCatError('');
                                            const token = localStorage.getItem('token');
                                            const res = await fetch('/api/categories', {
                                                method: 'POST',
                                                headers: {
                                                    'Authorization': `Bearer ${token}`,
                                                    'Content-Type': 'application/json'
                                                },
                                                body: JSON.stringify({ name: newCatName })
                                            });
                                            if (res.ok) {
                                                setCatSuccess('Catégorie créée !');
                                                setNewCatName('');
                                                setTimeout(() => { setShowCatModal(false); setCatSuccess(''); }, 800);
                                            } else {
                                                const data = await res.json();
                                                setCatError(data.message || 'Erreur lors de la création');
                                            }
                                        }}
                                    >Créer</button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
                {view === 'archives' && <>
                    <h1 className="text-3xl font-bold mb-6">Articles archivés</h1>
                    {archived.length === 0 && <div className="text-gray-400">Aucun article archivé.</div>}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {archived.map(post => (
                            <div key={`archive-${post.archive_id}`} className="bg-gray-800 rounded-lg p-4 shadow hover:shadow-lg transition relative">
                                <div className="absolute top-2 right-2 flex gap-2">
                                    <button
                                        title="Désarchiver"
                                        className="text-green-400 hover:text-green-600 p-1"
                                        onClick={async () => {
                                            const token = localStorage.getItem('token');
                                            const res = await fetch(`/api/posts/archives/${post.archive_id}`, {
                                                method: 'DELETE',
                                                headers: { 'Authorization': `Bearer ${token}` }
                                            });
                                            if (res.ok) {
                                                setArchived(archived.filter(a => a.archive_id !== post.archive_id));
                                                // Optionnel : recharger les articles non archivés
                                                fetch('/api/posts', {
                                                    headers: { 'Authorization': `Bearer ${token}` }
                                                })
                                                    .then(res => res.json())
                                                    .then(data => setPosts(data));
                                            } else {
                                                alert('Erreur lors du désarchivage');
                                            }
                                        }}
                                    >
                                        <FaUndo size={20} />
                                    </button>
                                    <button
                                        title="Supprimer définitivement"
                                        className="text-red-400 hover:text-red-600 p-1"
                                        onClick={async () => {
                                            if (window.confirm('⚠️ Cette action supprimera définitivement l\'article. Continuer ?')) {
                                                const token = localStorage.getItem('token');
                                                const res = await fetch(`/api/posts/archives/${post.id}/permanent`, {
                                                    method: 'DELETE',
                                                    headers: { 'Authorization': `Bearer ${token}` }
                                                });
                                                if (res.ok) {
                                                    setArchived(archived.filter(a => a.id !== post.id));
                                                } else {
                                                    alert('Erreur lors de la suppression définitive');
                                                }
                                            }
                                        }}
                                    >
                                        <FaRegTrashAlt size={20} />
                                    </button>
                                </div>
                                {post.media_url && (
                                    <img
                                        src={post.media_url.startsWith('/img/') ? post.media_url : post.media_url}
                                        alt={post.title}
                                        className="w-full h-44 object-cover rounded mb-3 border border-gray-700"

                                    />
                                )}
                                <div>
                                    <p className="text-gray-400 mb-2">Catégorie : {post.category}</p>
                                    <p className="text-gray-300 mb-2">{post.excerpt}</p>
                                    <span className="text-xs text-gray-500">Archivé le {new Date(post.archived_at).toLocaleDateString('fr-FR')}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </>}

                {view === 'settings' && (
                    <div className="w-full max-w-3xl bg-gray-800 rounded-lg shadow p-6">
                        <h1 className="text-3xl font-bold mb-8">Paramètres</h1>
                        <section className="mb-8">
                            <h2 className="text-xl font-semibold mb-2">API externe</h2>
                            <p className="text-gray-400 mb-2">Configurer les accès API pour des services externes (autres que le front).</p>
                            {/* Formulaire ou infos API externe ici */}
                            <div className="bg-gray-900 rounded p-4 mb-2">
                                <label className="block mb-1 font-semibold">Clé API externe</label>
                                <div className="flex gap-2 mb-2">
                                    <input type="text" className="w-full p-2 rounded bg-gray-700 text-white" value={apiKey || 'sk-demo-1234567890abcdef'} readOnly />
                                    <button
                                        className="bg-gray-800 hover:bg-gray-700 text-blue-400 font-bold px-3 rounded"
                                        title="Copier"
                                        onClick={() => { navigator.clipboard.writeText(apiKey || 'sk-demo-1234567890abcdef') }}
                                    >Copier</button>
                                </div>
                                <div className="mb-4">
                                    <label className="block font-semibold mb-1">Autorisations de la clé :</label>
                                    <div className="flex flex-col gap-1 pl-2">
                                        <label className="inline-flex items-center gap-2">
                                            <input type="checkbox" className="accent-blue-500" checked={apiPerms.read} onChange={e => setApiPerms(p => ({ ...p, read: e.target.checked }))} /> Lecture des articles
                                        </label>
                                        <label className="inline-flex items-center gap-2">
                                            <input type="checkbox" className="accent-blue-500" checked={apiPerms.write} onChange={e => setApiPerms(p => ({ ...p, write: e.target.checked }))} /> Création d’articles
                                        </label>
                                        <label className="inline-flex items-center gap-2">
                                            <input type="checkbox" className="accent-blue-500" checked={apiPerms.ia} onChange={e => setApiPerms(p => ({ ...p, ia: e.target.checked }))} /> Accès enrichissement IA
                                        </label>
                                        <label className="inline-flex items-center gap-2">
                                            <input type="checkbox" className="accent-blue-500" checked={apiPerms.admin} onChange={e => setApiPerms(p => ({ ...p, admin: e.target.checked }))} /> Accès admin (dangereux)
                                        </label>
                                    </div>
                                </div>
                                <button
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow w-full"
                                    onClick={() => setApiKey('sk-demo-' + Math.random().toString(36).slice(2, 18))}
                                >Générer une nouvelle clé</button>
                            </div>
                        </section>
                        <section>
                            <h2 className="text-xl font-semibold mb-2">Paramètres IA (enrichissement)</h2>
                            <p className="text-gray-400 mb-2">Configurer les paramètres pour la fonction d’enrichissement IA des textes.</p>
                            {/* Formulaire ou infos IA ici */}
                            <div className="bg-gray-900 rounded p-4">
                                <label className="block mb-1 font-semibold">URL IA</label>
                                <input type="text" className="w-full p-2 rounded bg-gray-700 text-white mb-2" placeholder="IA_API_URL" disabled />
                                <label className="block mb-1 font-semibold">Clé API IA</label>
                                <input type="text" className="w-full p-2 rounded bg-gray-700 text-white" placeholder="IA_API_KEY" disabled />
                                <label className="block mb-1 font-semibold mt-2">Modèle IA</label>
                                <input type="text" className="w-full p-2 rounded bg-gray-700 text-white mb-2" placeholder="IA_MODEL" disabled />
                                <label className="block mb-1 font-semibold mt-2">Prompt IA</label>
                                <textarea className="w-full p-2 rounded bg-gray-700 text-white" placeholder="IA_PROMPT" rows={3} disabled />
                                <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow w-full">Sauvegarder</button>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-2">Réseaux sociaux</h2>
                            <p className="text-gray-400 mb-2">Renseignez les liens de vos réseaux sociaux pour affichage sur le site.</p>
                            <div className="bg-gray-900 rounded p-4">
                                <label className="block mb-1 font-semibold">X (ex-Twitter)</label>
                                <input type="url" className="w-full p-2 rounded bg-gray-700 text-white mb-2" placeholder="https://x.com/votrecompte" disabled />
                                <label className="block mb-1 font-semibold">Facebook</label>
                                <input type="url" className="w-full p-2 rounded bg-gray-700 text-white mb-2" placeholder="https://facebook.com/votrepage" disabled />
                                <label className="block mb-1 font-semibold">Reddit</label>
                                <input type="url" className="w-full p-2 rounded bg-gray-700 text-white mb-2" placeholder="https://reddit.com/r/votresubreddit" disabled />
                                <label className="block mb-1 font-semibold">Instagram</label>
                                <input type="url" className="w-full p-2 rounded bg-gray-700 text-white mb-2" placeholder="https://instagram.com/votrecompte" disabled />
                                <label className="block mb-1 font-semibold">Discord</label>
                                <input type="url" className="w-full p-2 rounded bg-gray-700 text-white mb-2" placeholder="https://discord.gg/votreinvite" disabled />
                                <label className="block mb-1 font-semibold">YouTube</label>
                                <input type="url" className="w-full p-2 rounded bg-gray-700 text-white mb-2" placeholder="https://youtube.com/@votrechaine" disabled />
                                <label className="block mb-1 font-semibold">TikTok</label>
                                <input type="url" className="w-full p-2 rounded bg-gray-700 text-white" placeholder="https://tiktok.com/@votrecompte" disabled />
                                <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow w-full">Sauvegarder</button>
                            </div>
                        </section>
                    </div>
                )}
                {view === 'album' && <Album />}
            </main>
        </div>
    );
}

export default AdminDashboard;

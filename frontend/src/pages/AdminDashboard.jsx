

import React, { useState, useEffect } from 'react';
import { FaRegEdit, FaRegTrashAlt, FaUndo } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import ArticleEditor from './ArticleEditor';
import Album from './Album';
import PagesAdmin from './PagesAdmin';
// DEBUG LOGS
console.log('AdminDashboard chargé');

function AdminDashboard() {
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
                    <button className="text-left px-3 py-2 rounded hover:bg-gray-800 font-semibold transition">Catégories</button>
                    <button className="text-left px-3 py-2 rounded hover:bg-gray-800 font-semibold transition">Utilisateurs</button>
                    <button className="text-left px-3 py-2 rounded hover:bg-gray-800 font-semibold transition">Paramètres</button>
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

                {view === 'album' && <Album />}
            </main>
        </div>
    );
}

export default AdminDashboard;

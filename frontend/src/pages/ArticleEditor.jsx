
import React, { useState, useEffect, useRef } from 'react';
import { FaTimes } from 'react-icons/fa';
import { Editor } from '@tinymce/tinymce-react';

function ArticleEditor({ article, onArticleSaved, onClose }) {
    const [title, setTitle] = useState(article?.title || '');
    const [categoryId, setCategoryId] = useState(article?.category_id || '');
    const [categories, setCategories] = useState([]);
    const [showCatModal, setShowCatModal] = useState(false);
    const [newCatName, setNewCatName] = useState('');
    const [content, setContent] = useState(article?.content || '');
    const [image, setImage] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [pages, setPages] = useState([]);

    // Récupère les pages à l'ouverture
    useEffect(() => {
        const token = localStorage.getItem('token');
        fetch('/api/pages', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setPages(data);
                } else {
                    setPages([]);
                }
            })
            .catch(() => setPages([]));
    }, [success]);
    useEffect(() => {
        console.log('[ArticleEditor] MONTAGE');
        return () => console.log('[ArticleEditor] DEMONTAGE');
    }, []);
    const [pageId, setPageId] = useState('');

    // Met à jour les champs si on change d'article à éditer
    useEffect(() => {
        setTitle(article?.title || '');
        setCategoryId(article?.category_id || '');
        setContent(article?.content || '');
        setImage(null);
        setPageId(article?.page_id || '');
    }, [article]);

    // Récupère les catégories et pages à l'ouverture
    useEffect(() => {
        const token = localStorage.getItem('token');
        fetch('/api/categories', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setCategories(data);
                } else {
                    setCategories([]);
                }
            })
            .catch(() => setCategories([]));
    }, [showCatModal, success]);

    const handleImageChange = (e) => {
        setImage(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (!title || !categoryId || !content) {
            setError('Tous les champs sont obligatoires.');
            return;
        }
        // Suppression de useSingletonMount inutile
        const formData = new FormData();
        formData.append('title', title);
        formData.append('category_id', categoryId);
        formData.append('content', content);
        if (pageId) formData.append('page_id', pageId);
        if (image) formData.append('image', image);
        const token = localStorage.getItem('token');
        let url = '/api/posts';
        let method = 'POST';
        if (article && article.id) {
            url = `/api/posts/${article.id}`;
            method = 'PUT';
        }
        const res = await fetch(url, {
            method,
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });
        const data = await res.json();
        if (res.ok) {
            setSuccess(article && article.id ? 'Article modifié !' : 'Article publié !');
            setTitle(''); setCategoryId(''); setContent(''); setImage(null); setPageId('');
            if (onArticleSaved) onArticleSaved();
        } else {
            setError(data.message || 'Erreur lors de la publication.');
        }
    };

    // Désactive le bouton si un champ requis est manquant
    const isDisabled = !title || !categoryId || !pageId || (!image && !(article && article.media_url));


    // Log de montage du composant (optionnel)
    useEffect(() => {
        console.log('[ArticleEditor] Composant monté');
    }, []);



    return (
        <div className="relative bg-gray-800 p-6 rounded shadow mb-8 max-w-2xl mx-auto">
            {/* Bouton fermeture */}
            <button
                type="button"
                className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-xl"
                title="Fermer l'éditeur"
                onClick={() => {
                    if (window.confirm('Voulez-vous vraiment fermer l’éditeur ? Les modifications non sauvegardées seront perdues.')) {
                        setTitle(''); setCategory(''); setContent(''); setImage(null);
                        if (onClose) onClose();
                    }
                }}
            >
                <FaTimes />
            </button>
            <form onSubmit={handleSubmit}>
                <h2 className="text-xl font-bold mb-4">Nouvel article</h2>
                {error && <div className="text-red-500 mb-2">{error}</div>}
                {success && <div className="text-green-500 mb-2">{success}</div>}
                <label className="block mb-1 font-semibold">Titre <span className="text-red-500">*</span></label>
                <input type="text" placeholder="Titre" value={title} onChange={e => setTitle(e.target.value)} className="w-full mb-3 p-2 rounded bg-gray-700 text-white" required />
                <div className="mb-3">
                    <div className="flex items-center gap-2 mb-1">
                        <label className="font-semibold">Catégorie <span className="text-red-500">*</span></label>
                        <button type="button" className="text-blue-400 underline text-sm" onClick={() => setShowCatModal(true)}>Créer une catégorie</button>
                    </div>
                    <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full p-2 rounded bg-gray-700 text-white" required>
                        <option value="">-- Sélectionner une catégorie --</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
                <div className="mb-3">
                    <label className="font-semibold">Page liée <span className="text-red-500">*</span></label>
                    <select value={pageId} onChange={e => setPageId(e.target.value)} className="w-full p-2 rounded bg-gray-700 text-white">
                        <option value="">-- Sélectionner une page --</option>
                        {pages.map(page => (
                            <option key={page.id} value={page.id}>{page.titre}</option>
                        ))}
                    </select>
                </div>
                <Editor
                    apiKey="achb04xc9fa4j0bz6aritvvp19qrjlhzreep7kf7ir8td366"
                    tinymceScriptSrc="https://cdn.tiny.cloud/1/achb04xc9fa4j0bz6aritvvp19qrjlhzreep7kf7ir8td366/tinymce/6/tinymce.min.js"
                    value={content}
                    init={{
                        height: 600,
                        menubar: false,
                        plugins: [
                            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview', 'anchor',
                            'searchreplace', 'visualblocks', 'code', 'fullscreen',
                            'insertdatetime', 'media', 'table', 'help', 'wordcount'
                        ],
                        toolbar:
                            'undo redo | formatselect | bold italic backcolor | \n+                            alignleft aligncenter alignright alignjustify | \n+                            bullist numlist outdent indent | removeformat | help | image',
                        images_upload_handler: (blobInfo, progress) => {
                            return new Promise(async (resolve, reject) => {
                                try {
                                    const token = localStorage.getItem('token');
                                    const formData = new FormData();
                                    formData.append('image', blobInfo.blob(), blobInfo.filename());
                                    const res = await fetch('/api/upload/quill', {
                                        method: 'POST',
                                        headers: { 'Authorization': `Bearer ${token}` },
                                        body: formData
                                    });
                                    const data = await res.json();
                                    if (res.ok && data.location) {
                                        resolve(data.location);
                                    } else {
                                        reject(data.message || 'Erreur upload image');
                                    }
                                } catch (err) {
                                    reject('Erreur upload image');
                                }
                            });
                        },
                        content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:16px }'
                    }}
                    onEditorChange={setContent}
                />
                <div className="mb-3">
                    <label className="block mb-1 font-semibold" htmlFor="cover-image">Image de couverture <span className="text-red-500">*</span></label>
                    <input id="cover-image" type="file" accept="image/*" onChange={handleImageChange} className="block w-full text-white bg-gray-700 rounded p-2" />
                </div>
                <button
                    type="submit"
                    className={`w-full font-bold py-2 rounded ${isDisabled ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                    disabled={isDisabled}
                >
                    Publier
                </button>
            </form>
            {/* Modal création catégorie */}
            {showCatModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-gray-900 p-6 rounded shadow-lg w-full max-w-sm relative">
                        <button className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-xl" onClick={() => setShowCatModal(false)}><FaTimes /></button>
                        <h3 className="text-lg font-bold mb-4">Créer une catégorie</h3>
                        <input type="text" placeholder="Nom de la catégorie" value={newCatName} onChange={e => setNewCatName(e.target.value)} className="w-full mb-3 p-2 rounded bg-gray-700 text-white" />
                        <button
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded"
                            onClick={async () => {
                                if (!newCatName.trim()) return;
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
                                    setShowCatModal(false);
                                    setNewCatName('');
                                    // Optionnel : recharger la liste des catégories (fait via useEffect)
                                }
                            }}
                        >Créer</button>
                    </div>
                </div>
            )}
        </div>
    );
}

function Wrapper(props) {
    useEffect(() => () => { window.__ARTICLE_EDITOR_MOUNTED = false; }, []);
    return <ArticleEditor {...props} />;
}
export default Wrapper;

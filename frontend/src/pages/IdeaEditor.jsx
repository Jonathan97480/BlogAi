import React, { useState, useEffect } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import 'tinymce/tinymce';
import 'tinymce/icons/default';
import 'tinymce/themes/silver';
import 'tinymce/models/dom';
import 'tinymce/plugins/advlist';
import 'tinymce/plugins/autolink';
import 'tinymce/plugins/lists';
import 'tinymce/plugins/link';
import 'tinymce/plugins/image';
import 'tinymce/plugins/charmap';
import 'tinymce/plugins/preview';
import 'tinymce/plugins/anchor';
import 'tinymce/plugins/searchreplace';
import 'tinymce/plugins/visualblocks';
import 'tinymce/plugins/code';
import 'tinymce/plugins/fullscreen';
import 'tinymce/plugins/insertdatetime';
import 'tinymce/plugins/media';
import 'tinymce/plugins/table';
import 'tinymce/plugins/wordcount';
import 'tinymce/skins/ui/oxide/skin.min.css';
import 'tinymce/skins/content/default/content.min.css';
import { FaTimes } from 'react-icons/fa';

function IdeaEditor({ idea, onIdeaSaved, onClose, onMarkProcessed }) {
    const [title, setTitle] = useState(idea?.title || '');
    const [categoryId, setCategoryId] = useState(idea?.category_id || '');
    const [categories, setCategories] = useState([]);
    const [showCatModal, setShowCatModal] = useState(false);
    const [newCatName, setNewCatName] = useState('');
    const [content, setContent] = useState(idea?.content || '');
    const [mediaId, setMediaId] = useState(idea?.media_id || '');
    const [mediaFile, setMediaFile] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        setTitle(idea?.title || '');
        setCategoryId(idea?.category_id || '');
        setContent(idea?.content || '');
        setMediaId(idea?.media_id || '');
    }, [idea]);

    // Récupère les catégories à l'ouverture ou après création
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (!title || !categoryId || !content) {
            setError('Tous les champs sont obligatoires.');
            return;
        }
        const token = localStorage.getItem('token');
        let mediaIdToSend = mediaId;
        // Si un nouveau fichier image est sélectionné, on l'upload d'abord
        if (mediaFile) {
            const formData = new FormData();
            formData.append('image', mediaFile);
            const uploadRes = await fetch('/api/upload/quill', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            const uploadData = await uploadRes.json();
            if (uploadRes.ok && uploadData.media_id) {
                mediaIdToSend = uploadData.media_id;
            } else {
                setError(uploadData.message || 'Erreur lors de l’upload de l’image.');
                return;
            }
        }
        const method = idea && idea.id ? 'PUT' : 'POST';
        const url = idea && idea.id ? `/api/idea/${idea.id}` : '/api/idea';
        const res = await fetch(url, {
            method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title, category_id: categoryId, content, media_id: mediaIdToSend })
        });
        const data = await res.json();
        if (res.ok) {
            setSuccess('Idée sauvegardée !');
            if (onIdeaSaved) onIdeaSaved();
        } else {
            setError(data.message || 'Erreur lors de la sauvegarde.');
        }
    };

    const isDisabled = !title || !categoryId || !content;

    return (
        <div className="relative bg-gray-800 p-6 rounded shadow mb-8 mx-auto">
            <button
                type="button"
                className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-xl"
                title="Fermer l'éditeur"
                onClick={() => {
                    if (window.confirm('Voulez-vous vraiment fermer l’éditeur ? Les modifications non sauvegardées seront perdues.')) {
                        setTitle(''); setCategory(''); setExcerpt(''); setContent(''); setMediaId('');
                        if (onClose) onClose();
                    }
                }}
            >
                <FaTimes />
            </button>
            <form onSubmit={handleSubmit}>
                <h2 className="text-xl font-bold mb-4">Nouvelle idée d'article</h2>
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
                                    }
                                }}
                            >Créer</button>
                        </div>
                    </div>
                )}
                <label className="block mb-1 font-semibold">Contenu <span className="text-red-500">*</span></label>
                <Editor
                    value={content}
                    init={{
                        height: 600,
                        menubar: false,
                        plugins: [
                            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview', 'anchor',
                            'searchreplace', 'visualblocks', 'code', 'fullscreen',
                            'insertdatetime', 'media', 'table', 'wordcount'
                        ],
                        toolbar:
                            'undo redo | formatselect | bold italic backcolor | ' +
                            'alignleft aligncenter alignright alignjustify | ' +
                            'bullist numlist outdent indent | removeformat | image media',
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
                        image_dimensions: true,
                        object_resizing: 'img',
                        resize_img_proportional: true,
                        extended_valid_elements: 'img[class|src|border=0|alt|title|width|height|style]',
                        content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:16px } img{max-width:100%;height:auto;}'
                    }}
                    onEditorChange={setContent}
                />
                <div className="mb-3">
                    <label className="block mb-1 font-semibold" htmlFor="cover-image">Image de couverture</label>
                    <input id="cover-image" type="file" accept="image/*" onChange={e => setMediaFile(e.target.files[0])} className="block w-full text-white bg-gray-700 rounded p-2" />
                </div>
                <div className="flex gap-2">
                    <button
                        type="submit"
                        className={`flex-1 font-bold py-2 rounded ${isDisabled ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                        disabled={isDisabled}
                    >
                        Sauvegarder
                    </button>
                    <button
                        type="button"
                        className="flex-1 font-bold py-2 rounded bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => onMarkProcessed && onMarkProcessed(idea?.id)}
                        disabled={!idea?.id}
                    >
                        Marquer comme traitée
                    </button>
                </div>
            </form>
        </div>
    );

}

export default IdeaEditor;

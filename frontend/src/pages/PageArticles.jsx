import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PostCard from '../components/PostCard';

function PageArticles() {
    const { id } = useParams();
    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        // Récupère la page
        fetch(`/api/pages/${id}`)
            .then(res => res.json())
            .then(data => setPage(data))
            .catch(() => setPage(null));
        // Récupère les articles liés à cette page
        fetch(`/api/pages/${id}/posts`)
            .then(res => res.json())
            .then(data => setPosts(Array.isArray(data) ? data : []))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <div className="p-6">Chargement...</div>;
    if (!page) return <div className="p-6 text-red-500">Page introuvable</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 p-6">{page.titre}</h1>
            {posts.length === 0 ? (
                <div className="p-6">Aucun article pour cette page.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                    {posts.map(post => (
                        <PostCard key={post.id} post={post} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default PageArticles;

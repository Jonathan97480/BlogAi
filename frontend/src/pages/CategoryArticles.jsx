import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PostCard from '../components/PostCard';

function CategoryArticles() {
    const { category } = useParams();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        setLoading(true);
        fetch(`/api/posts/category/${encodeURIComponent(category)}`)
            .then(res => res.ok ? res.json() : Promise.reject(res))
            .then(data => setPosts(Array.isArray(data) ? data : []))
            .catch(() => setError("Erreur lors du chargement des articles."))
            .finally(() => setLoading(false));
    }, [category]);

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4 p-6">Articles de la catégorie : {category}</h1>
            {loading && <div className="p-6">Chargement...</div>}
            {error && <div className="text-red-500 p-6">{error}</div>}
            {!loading && !error && posts.length === 0 && <div className="p-6">Aucun article trouvé.</div>}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {posts.map(post => (
                    <PostCard key={post.id} post={post} />
                ))}
            </div>
        </div>
    );
}

export default CategoryArticles;

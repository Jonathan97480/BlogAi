import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PostCard from '../components/PostCard';
import useInfiniteSlice from '../hooks/useInfiniteSlice';

function CategoryArticles() {
    const { category } = useParams();
    const [allPosts, setAllPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const { visibleItems, hasMore, sentinelRef } = useInfiniteSlice(allPosts);

    useEffect(() => {
        setLoading(true);
        setError('');
        fetch(`/api/posts/category/${encodeURIComponent(category)}`)
            .then(res => res.ok ? res.json() : Promise.reject(res))
            .then(data => setAllPosts(Array.isArray(data) ? data : []))
            .catch(() => setError("Erreur lors du chargement des articles."))
            .finally(() => setLoading(false));
    }, [category]);

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4 p-6">Articles de la catégorie : {category}</h1>
            {loading && <div className="p-6">Chargement...</div>}
            {error && <div className="text-red-500 p-6">{error}</div>}
            {!loading && !error && allPosts.length === 0 && <div className="p-6">Aucun article trouvé.</div>}
            {!loading && !error && allPosts.length > 0 && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 post-card-grid">
                        {visibleItems.map(post => (
                            <div className="post-card-cell h-full" key={post.id}><PostCard post={post} /></div>
                        ))}
                    </div>
                    <div ref={sentinelRef} className="h-1" />
                    {!hasMore && (
                        <p className="text-center text-gray-400 py-8 text-sm">
                            Vous avez tout vu — {allPosts.length} article{allPosts.length > 1 ? 's' : ''} au total.
                        </p>
                    )}
                </>
            )}
        </div>
    );
}

export default CategoryArticles;

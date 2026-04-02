import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PostCard from '../components/PostCard';
import useInfiniteSlice from '../hooks/useInfiniteSlice';

function PageArticles() {
    const { id } = useParams();
    const [allPosts, setAllPosts] = useState([]);
    const [page, setPage] = useState(null);
    const [loading, setLoading] = useState(true);

    const { visibleItems, hasMore, sentinelRef } = useInfiniteSlice(allPosts);

    useEffect(() => {
        setLoading(true);
        fetch(`/api/pages/${id}`)
            .then(res => res.json())
            .then(data => setPage(data))
            .catch(() => setPage(null));
        fetch(`/api/pages/${id}/posts`)
            .then(res => res.json())
            .then(data => setAllPosts(Array.isArray(data) ? data : []))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <div className="p-6">Chargement...</div>;
    if (!page) return <div className="p-6 text-red-500">Page introuvable</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 p-6">{page.titre}</h1>
            {allPosts.length === 0 ? (
                <div className="p-6">Aucun article pour cette page.</div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                        {visibleItems.map(post => (
                            <PostCard key={post.id} post={post} />
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

export default PageArticles;

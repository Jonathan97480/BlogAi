import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import PostCard from '../components/PostCard';
import useInfiniteSlice from '../hooks/useInfiniteSlice';

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

function SearchResults() {
    const query = useQuery();
    const [allPosts, setAllPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const q = query.get('q') || '';

    const { visibleItems, hasMore, sentinelRef } = useInfiniteSlice(allPosts);

    useEffect(() => {
        if (!q.trim()) {
            setAllPosts([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        setError('');
        fetch(`/api/posts/search?q=${encodeURIComponent(q)}`)
            .then(res => res.ok ? res.json() : Promise.reject(res))
            .then(data => setAllPosts(Array.isArray(data) ? data : []))
            .catch(() => setError("Erreur lors de la recherche."))
            .finally(() => setLoading(false));
    }, [q]);

    return (
        <div className="w-full max-w-[1400px] mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">Résultats pour "{q}"</h1>
            {loading && <div>Chargement...</div>}
            {error && <div className="text-red-500">{error}</div>}
            {!loading && !error && allPosts.length === 0 && <div>Aucun article trouvé.</div>}
            {!loading && !error && allPosts.length > 0 && (
                <>
                    <div className="w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 post-card-grid">
                        {visibleItems.map(post => (
                            <div className="post-card-cell h-full" key={post.id}><PostCard post={post} /></div>
                        ))}
                    </div>
                    <div ref={sentinelRef} className="h-1" />
                    {!hasMore && (
                        <p className="text-center text-gray-400 py-8 text-sm">
                            Vous avez tout vu — {allPosts.length} résultat{allPosts.length > 1 ? 's' : ''} au total.
                        </p>
                    )}
                </>
            )}
        </div>
    );
}

export default SearchResults;

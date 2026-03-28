import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import PostCard from '../components/PostCard';

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

function SearchResults() {
    const query = useQuery();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const q = query.get('q') || '';

    useEffect(() => {
        if (!q.trim()) {
            setPosts([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        fetch(`/api/posts/search?q=${encodeURIComponent(q)}`)
            .then(res => res.ok ? res.json() : Promise.reject(res))
            .then(data => setPosts(Array.isArray(data) ? data : []))
            .catch(() => setError("Erreur lors de la recherche."))
            .finally(() => setLoading(false));
    }, [q]);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Résultats pour "{q}"</h1>
            {loading && <div>Chargement...</div>}
            {error && <div className="text-red-500">{error}</div>}
            {!loading && !error && posts.length === 0 && <div>Aucun article trouvé.</div>}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map(post => (
                    <PostCard key={post.id} post={post} />
                ))}
            </div>
        </div>
    );
}

export default SearchResults;

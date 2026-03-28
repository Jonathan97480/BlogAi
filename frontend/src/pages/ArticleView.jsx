import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function ArticleView() {
    const { id } = useParams();
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        setLoading(true);
        fetch(`/api/posts/${id}`)
            .then(res => res.ok ? res.json() : Promise.reject(res))
            .then(data => setArticle(data))
            .catch(() => setError("Article introuvable."))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <div className="p-6">Chargement...</div>;
    if (error || !article) return <div className="p-6 text-red-500">{error || "Article introuvable."}</div>;

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
            <div className="mb-2 text-gray-400">Catégorie : {article.category_id}</div>
            <div className="mb-6 text-gray-400">Publié le {new Date(article.created_at).toLocaleDateString()}</div>
            {article.media_url && (
                <img src={article.media_url.startsWith('/img/') ? article.media_url : article.media_url} alt="" className="mb-6 rounded shadow max-h-96 mx-auto" />
            )}
            <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: article.content }} />
        </div>
    );
}

export default ArticleView;

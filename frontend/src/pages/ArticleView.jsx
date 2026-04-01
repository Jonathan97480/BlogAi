import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ArticleContent.css';

function getCategoryColor(category) {
    const colors = {
        'GAME': 'bg-purple-600',
        'TESR': 'bg-cyan-600',
        'IA': 'bg-pink-600',
        'TECH': 'bg-blue-600',
        'DEFAULT': 'bg-gray-500',
    };
    return colors[category?.toUpperCase()] || colors.DEFAULT;
}

function ArticleView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        setLoading(true);
        fetch(`/api/posts/${id}`)
            .then(res => res.ok ? res.json() : Promise.reject(res))
            .then(data => setArticle(data))
            .catch(() => setError('Article introuvable.'))
            .finally(() => setLoading(false));
    }, [id]);

    const normalizedContent = useMemo(() => {
        if (!article?.content) return '';
        return article.content
            .replace(/src="http:\/\/localhost:5000\//g, 'src="/')
            .replace(/src="img\//g, 'src="/img/')
            .replace(/src="\/\/img\//g, 'src="/img/');
    }, [article]);

    if (loading) return <div className="p-6">Chargement...</div>;
    if (error || !article) return <div className="p-6 text-red-500">{error || 'Article introuvable.'}</div>;

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
            {article.category && (
                <button
                    onClick={() => navigate(`/category/${encodeURIComponent(article.category)}`)}
                    className={`text-xs font-bold px-3 py-1 rounded-full text-white shadow ${getCategoryColor(article.category)} mb-4 hover:opacity-80 transition-opacity`}
                >
                    {article.category.toUpperCase()}
                </button>
            )}
            <div className="mb-6 text-gray-400">Publié le {new Date(article.created_at).toLocaleDateString()}</div>
            {article.media_url && (
                <img src={article.media_url} alt="" className="mb-6 rounded shadow w-full object-cover" style={{ maxHeight: '480px' }} />
            )}
            <div className="article-content" dangerouslySetInnerHTML={{ __html: normalizedContent }} />
        </div>
    );
}

export default ArticleView;

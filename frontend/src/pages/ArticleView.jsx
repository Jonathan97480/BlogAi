import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { FaXTwitter, FaFacebook, FaReddit, FaTiktok } from 'react-icons/fa6';
import AudioReader from '../components/AudioReader.jsx';
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

function decodeHtmlEntities(str) {
    if (!str) return '';
    const txt = document.createElement('textarea');
    txt.innerHTML = str;
    return txt.value;
}

const SHARE_NETWORKS = [
    {
        key: 'twitter',
        icon: FaXTwitter,
        label: 'X (Twitter)',
        color: 'hover:text-white',
        getUrl: (url, title, excerpt) => {
            const text = excerpt ? `${title}\n\n${excerpt}` : title;
            return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        },
    },
    {
        key: 'facebook',
        icon: FaFacebook,
        label: 'Facebook',
        color: 'hover:text-blue-500',
        getUrl: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    },
    {
        key: 'reddit',
        icon: FaReddit,
        label: 'Reddit',
        color: 'hover:text-orange-500',
        getUrl: (url, title) => `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
    },
    {
        key: 'tiktok',
        icon: FaTiktok,
        label: 'TikTok',
        color: 'hover:text-white',
        getUrl: null,
    },
];

function ShareButtons({ article }) {
    const [copied, setCopied] = useState(false);
    const articleUrl = `${window.location.origin}/article/${article.id}`;
    const rawExcerpt = decodeHtmlEntities((article.excerpt || '').replace(/<[^>]+>/g, '').trim());
    const excerpt = rawExcerpt.length > 200 ? rawExcerpt.slice(0, 200) + '…' : rawExcerpt;

    const handleShare = (e, network) => {
        e.preventDefault();
        if (!network.getUrl) {
            navigator.clipboard.writeText(articleUrl).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            });
            return;
        }
        window.open(network.getUrl(articleUrl, article.title || '', excerpt), '_blank', 'noopener,noreferrer,width=600,height=500');
    };

    return (
        <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm text-gray-400">Partager :</span>
            {SHARE_NETWORKS.map((network) => (
                <button
                    key={network.key}
                    onClick={(e) => handleShare(e, network)}
                    className={`flex items-center gap-1.5 text-gray-400 transition-colors ${network.color} bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded-full text-sm`}
                    title={network.key === 'tiktok' ? 'Copier le lien (TikTok)' : `Partager sur ${network.label}`}
                    type="button"
                >
                    <network.icon size={14} />
                    <span>{network.label}</span>
                </button>
            ))}
            {copied && <span className="text-xs text-green-400 animate-pulse">Copié !</span>}
        </div>
    );
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
            .replace(/src="https?:\/\/localhost:\d+\//g, 'src="/')
            .replace(/src="img\//g, 'src="/img/')
            .replace(/src="\/\/img\//g, 'src="/img/')
            .replace(/src="tools\//g, 'src="/tools/');
    }, [article]);

    if (loading) return <div className="p-6">Chargement...</div>;
    if (error || !article) return <div className="p-6 text-red-500">{error || 'Article introuvable.'}</div>;

    const ogImage = article.media_url
        ? `${window.location.origin}${article.media_url}`
        : '';
    const ogDescription = article.excerpt
        ? article.excerpt.replace(/<[^>]+>/g, '').slice(0, 200)
        : '';
    const ogUrl = `${window.location.origin}/article/${article.id}`;

    return (
        <div className="max-w-3xl mx-auto p-6">
            <Helmet>
                <title>{article.title} — Blog AI & High-Tech</title>
                <meta name="description" content={ogDescription || undefined} />
                <meta property="og:type" content="article" />
                <meta property="og:site_name" content="Blog AI & High-Tech" />
                <meta property="og:url" content={ogUrl} />
                <meta property="og:title" content={article.title} />
                <meta property="og:locale" content="fr_FR" />
                {ogDescription && <meta property="og:description" content={ogDescription} />}
                {ogImage && <meta property="og:image" content={ogImage} />}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={article.title} />
                {ogDescription && <meta name="twitter:description" content={ogDescription} />}
                {ogImage && <meta name="twitter:image" content={ogImage} />}
            </Helmet>
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
            <div className="mb-6 py-3 border-y border-gray-700 flex flex-col gap-3">
                <AudioReader title={article.title} content={normalizedContent} />
                <ShareButtons article={article} />
            </div>
            {article.media_url && (
                <img src={article.media_url} alt="" className="mb-6 rounded shadow w-full object-cover" style={{ maxHeight: '480px' }} />
            )}
            <div className="article-content" dangerouslySetInnerHTML={{ __html: normalizedContent }} />
            <div className="mt-8 py-4 border-t border-gray-700">
                <p className="text-sm text-gray-400 mb-3">Vous avez aimé cet article ? Partagez-le !</p>
                <ShareButtons article={article} />
            </div>
        </div>
    );
}

export default ArticleView;

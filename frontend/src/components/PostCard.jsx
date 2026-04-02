


import styles from './PostCard.module.css';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaXTwitter, FaFacebook, FaReddit, FaTiktok } from 'react-icons/fa6';

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
        color: 'hover:text-white',
        getUrl: (url, title, excerpt) => {
            const text = excerpt ? `${title}\n\n${excerpt}` : title;
            return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        },
    },
    {
        key: 'facebook',
        icon: FaFacebook,
        color: 'hover:text-blue-500',
        // Facebook ne permet pas d'injecter du contenu via URL : il lit les balises OG de la page de l'article
        getUrl: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    },
    {
        key: 'reddit',
        icon: FaReddit,
        color: 'hover:text-orange-500',
        getUrl: (url, title) => `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
    },
    {
        key: 'tiktok',
        icon: FaTiktok,
        color: 'hover:text-white',
        getUrl: null, // pas d'URL de partage web — copie le lien
    },
];

function PostCard({ post }) {
    const navigate = useNavigate();
    const [copied, setCopied] = useState(false);
    let imageUrl = post.image_url || post.media_url;
    if (imageUrl && imageUrl.startsWith('/img/')) {
        imageUrl = imageUrl;
    }
    const handleCategoryClick = (e) => {
        e.preventDefault();
        if (post.category) {
            navigate(`/category/${encodeURIComponent(post.category)}`);
        }
    };

    const handleShare = (e, network) => {
        e.preventDefault();
        e.stopPropagation();
        const articleUrl = `${window.location.origin}/article/${post.id}`;
        if (!network.getUrl) {
            navigator.clipboard.writeText(articleUrl).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            });
            return;
        }
        const rawExcerpt = decodeHtmlEntities((post.excerpt || '').replace(/<[^>]+>/g, '').trim());
        const excerpt = rawExcerpt.length > 200 ? rawExcerpt.slice(0, 200) + '…' : rawExcerpt;
        window.open(network.getUrl(articleUrl, post.title || '', excerpt), '_blank', 'noopener,noreferrer,width=600,height=500');
    };

    return (
        <Link to={`/article/${post.id}`} className="block">
            <div className={`bg-gray-800 rounded-lg shadow-lg hover:scale-105 transition-transform ${styles['post-card']}`}>
                {imageUrl && (
                    <img src={imageUrl} alt={post.title} className={styles['post-card-image']} />
                )}
                <div className="p-4">
                    {post.category && (
                        <button
                            onClick={handleCategoryClick}
                            className={`text-xs font-bold px-3 py-1 rounded-full text-white shadow ${getCategoryColor(post.category)} mb-2 hover:opacity-80 transition-opacity`}
                            style={{ cursor: 'pointer' }}
                        >
                            {post.category.toUpperCase()}
                        </button>
                    )}
                    <h2 className="text-xl font-bold text-blue-300 mt-2 mb-2">{post.title}</h2>
                    <p className={`text-gray-300 mb-2 ${styles['post-card-excerpt']}`}>
                        {post.excerpt && decodeHtmlEntities(post.excerpt).length > 120
                            ? decodeHtmlEntities(post.excerpt).slice(0, 120) + '…'
                            : decodeHtmlEntities(post.excerpt)}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-gray-500">{new Date(post.created_at).toLocaleDateString('fr-FR')}</span>
                        <div className="flex items-center gap-2">
                            {SHARE_NETWORKS.map((network) => (
                                <button
                                    key={network.key}
                                    onClick={(e) => handleShare(e, network)}
                                    className={`text-gray-400 transition-colors ${network.color} p-1 rounded`}
                                    title={network.key === 'tiktok' ? 'Copier le lien (TikTok)' : `Partager sur ${network.key}`}
                                    type="button"
                                >
                                    <network.icon size={15} />
                                </button>
                            ))}
                            {copied && <span className="text-xs text-green-400 animate-pulse">Copié !</span>}
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}

export default PostCard;



import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function getCategoryColor(category) {
    // Palette simple, à adapter selon tes catégories
    const colors = {
        'GAME': 'bg-purple-600',
        'TESR': 'bg-cyan-600',
        'IA': 'bg-pink-600',
        'TECH': 'bg-blue-600',
        'DEFAULT': 'bg-gray-500',
    };
    return colors[category?.toUpperCase()] || colors.DEFAULT;
}

function PostCard({ post }) {
    const navigate = useNavigate();
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
    return (
        <Link to={`/article/${post.id}`} className="block">
            <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:scale-105 transition-transform">
                {imageUrl && (
                    <img src={imageUrl} alt={post.title} className="w-full h-48 object-cover" />
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
                    <p className="text-gray-300 mb-2">{post.excerpt}</p>
                    <span className="text-xs text-gray-500">{new Date(post.created_at).toLocaleDateString('fr-FR')}</span>
                </div>
            </div>
        </Link>
    );
}

export default PostCard;

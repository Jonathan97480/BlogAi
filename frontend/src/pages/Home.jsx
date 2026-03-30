import React, { useEffect, useState } from 'react';
import HeroSection from '../components/HeroSection';
import PostCard from '../components/PostCard';

function Home() {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        fetch('/api/posts')
            .then(res => res.json())
            .then(data => setPosts(Array.isArray(data) ? data : []))
            .catch(() => setPosts([]));
    }, []);

    return (
        <div>
            <HeroSection />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 post-card-grid">
                {posts.slice(0, 3).map(post => (
                    <div key={post.id} className="post-card-cell h-full"><PostCard post={post} /></div>
                ))}
            </div>
            <section className="max-w-3xl mx-auto mt-2 mb-2 bg-gray-900 rounded-lg shadow-lg p-2 text-center">
                <h1 className="text-3xl md:text-4xl font-extrabold text-blue-400 mb-4">Bienvenue sur AI Tech Blog&nbsp;: Plongez dans le futur&nbsp;!</h1>
                <p className="text-xl md:text-2xl text-gray-200 leading-relaxed">
                    Ici, on partage avec passion les dernières actualités sur l’intelligence artificielle, les innovations technologiques, les tendances du numérique et tout ce qui façonne le monde de demain. Que vous soyez curieux, passionné ou simple explorateur, ce blog est votre passerelle vers l’univers fascinant de l’IA et des nouvelles techno. Restez connectés pour ne rien manquer des révolutions qui changent déjà notre quotidien&nbsp;!
                </p>
            </section>
        </div>
    );
}

export default Home;

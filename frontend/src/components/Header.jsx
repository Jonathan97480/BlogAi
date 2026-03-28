import React, { useEffect, useState } from 'react';
import SearchIcon from './SearchIcon';
import { useNavigate } from 'react-router-dom';

function Header() {
    const [pages, setPages] = useState([]);
    const [search, setSearch] = useState("");
    const navigate = useNavigate();
    useEffect(() => {
        fetch('/api/pages')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setPages(data);
                else setPages([]);
            })
            .catch(() => setPages([]));
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (search.trim()) {
            navigate(`/search?q=${encodeURIComponent(search.trim())}`);
        }
    };

    return (
        <header className="hidden md:flex items-center justify-between px-6 py-4 bg-gray-950 shadow-md">
            <div className="flex items-center gap-2">
                <a href="/" className="text-2xl font-bold text-blue-500 hover:text-blue-400 transition-colors">AI Tech Blog</a>
            </div>
            <nav className="flex gap-8">
                <a href="/" className="hover:text-blue-400">Accueil</a>
                {pages.map(page => (
                    <a key={page.id} href={`/page/${page.id}`} className="hover:text-blue-400">
                        {page.titre}
                    </a>
                ))}
            </nav>
            <form className="flex items-center gap-2" onSubmit={handleSearch}>
                <input
                    type="text"
                    placeholder="Rechercher..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="px-2 py-1 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring focus:ring-blue-500"
                />
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded flex items-center justify-center">
                    <SearchIcon />
                </button>
            </form>
        </header>
    );
}

export default Header;

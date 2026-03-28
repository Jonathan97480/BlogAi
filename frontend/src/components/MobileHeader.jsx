import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchIcon from './SearchIcon';

function MobileHeader() {
    const [pages, setPages] = useState([]);
    const [search, setSearch] = useState("");
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetch('/api/pages')
            .then(res => res.json())
            .then(data => Array.isArray(data) ? setPages(data) : setPages([]))
            .catch(() => setPages([]));
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (search.trim()) {
            navigate(`/search?q=${encodeURIComponent(search.trim())}`);
        }
    };

    return (
        <header className="md:hidden flex items-center justify-between px-4 py-2 bg-gray-950 shadow-md relative z-50">
            <a href="/" className="text-xl font-bold text-blue-500 hover:text-blue-400 transition-colors">AI Tech Blog</a>
            <form className="flex items-center gap-2 flex-1 mx-2" onSubmit={handleSearch}>
                <input
                    type="text"
                    placeholder="Rechercher..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="px-2 py-1 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring focus:ring-blue-500 w-full"
                />
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-2 rounded flex items-center justify-center">
                    <SearchIcon />
                </button>
            </form>
            <button
                className="ml-2 p-2 rounded bg-gray-800 text-white focus:outline-none"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Ouvrir le menu"
            >
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-menu"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
            </button>
            {menuOpen && (
                <div className="absolute top-full left-0 w-full bg-gray-900 shadow-lg flex flex-col items-start p-4 animate-fade-in z-50">
                    <a href="/" className="py-2 w-full hover:text-blue-400 font-semibold">Accueil</a>
                    {pages.map(page => (
                        <a key={page.id} href={`/page/${page.id}`} className="py-2 w-full hover:text-blue-400 font-semibold">
                            {page.titre}
                        </a>
                    ))}
                </div>
            )}
        </header>
    );
}

export default MobileHeader;

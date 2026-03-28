import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
    return (
        <footer
            className="bg-gray-900 text-gray-300 border-t border-gray-800 w-full"
        >
            <div className="flex flex-col items-center justify-center h-full w-full">
                <div className="flex-1 flex flex-col items-center justify-center h-full w-full gap-3">
                    <div className="flex flex-wrap gap-3 items-center justify-center text-lg font-semibold">
                        <Link to="/" className="hover:text-blue-400 font-semibold">Accueil</Link>
                        <Link to="/page/1" className="hover:text-blue-400 font-semibold">Pages</Link>
                        <Link to="/category/IA" className="hover:text-blue-400 font-semibold">IA</Link>
                        <Link to="/category/TECH" className="hover:text-blue-400 font-semibold">Technologie</Link>
                        <Link to="/category/GAME" className="hover:text-blue-400 font-semibold">Jeux</Link>
                        <Link to="/mentions-legales" className="hover:text-blue-400 font-semibold">Mentions légales</Link>
                    </div>
                    <div className="text-base text-gray-400 mt-2">
                        Développé par <span className="font-bold text-blue-400">jon-dev</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;

import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

import Home from './pages/Home';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminRegister from './pages/AdminRegister';
import Header from './components/Header';
import MobileHeader from './components/MobileHeader';
import RgpdPopup from './components/RgpdPopup';
import Footer from './components/Footer';
import PageArticles from './pages/PageArticles';
import SearchResults from './pages/SearchResults';
import ArticleView from './pages/ArticleView';
import CategoryArticles from './pages/CategoryArticles';
import MentionsLegales from './pages/MentionsLegales';
import ImageCompareTool from './pages/ImageCompareTool';

function App() {
    const location = useLocation();
    // Afficher le Header général uniquement sur les pages publiques
    const isEmbedTool = location.pathname === '/tools/image-compare';
    const showHeader = location.pathname !== '/admin-dashboard' && !isEmbedTool;
    return (
        <HelmetProvider>
            {showHeader && <Header />}
            {showHeader && <MobileHeader />}
            {showHeader && <RgpdPopup />}
            <div className="w-full flex flex-col items-center">
                <div className="w-full max-w-full md:max-w-[1920px] flex-1 flex flex-col items-center justify-between">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/hidden-admin-gate" element={<AdminLogin />} />
                        <Route path="/admin-dashboard" element={<AdminDashboard />} />
                        <Route path="/register-admin" element={<AdminRegister />} />
                        <Route path="/page/:id" element={<PageArticles />} />
                        <Route path="/search" element={<SearchResults />} />
                        <Route path="/article/:id" element={<ArticleView />} />
                        <Route path="/category/:category" element={<CategoryArticles />} />
                        <Route path="/mentions-legales" element={<MentionsLegales />} />
                        <Route path="/tools/image-compare" element={<ImageCompareTool />} />
                    </Routes>
                </div>
                {showHeader && <Footer />}
            </div>
        </HelmetProvider>
    );
}

export default App;

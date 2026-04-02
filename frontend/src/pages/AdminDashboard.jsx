import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaArchive, FaTrash, FaUndo, FaCheckCircle, FaSearch } from "react-icons/fa";
import ArticleEditor from "./ArticleEditor";
import IdeaEditor from "./IdeaEditor";
import PagesAdmin from "./PagesAdmin";
import Album from "./Album";
import ToolsAdmin from "./ToolsAdmin";
import Pagination from "../components/Pagination";
import { Helmet } from "react-helmet-async";

function AdminDashboard() {
  const navigate = useNavigate();
  const [view, setView] = useState("articles");
  const [posts, setPosts] = useState([]);
  const [archived, setArchived] = useState([]);
  const [error, setError] = useState("");
  const [showArticleEditor, setShowArticleEditor] = useState(false);
  const [showIdeaEditor, setShowIdeaEditor] = useState(false);
  const [editArticle, setEditArticle] = useState(null);
  const [editIdea, setEditIdea] = useState(null);
  const [ideas, setIdeas] = useState([]);
  const [ideaLoading, setIdeaLoading] = useState(false);
  const [ideaError, setIdeaError] = useState("");
  const [ideaCategories, setIdeaCategories] = useState({});

  const [iaUrl, setIaUrl] = useState("");
  const [iaKey, setIaKey] = useState("");
  const [iaModel, setIaModel] = useState("");
  const [iaPrompt, setIaPrompt] = useState("");
  const [iaSuccess, setIaSuccess] = useState("");
  const [iaError, setIaError] = useState("");

  const [apiKeyId, setApiKeyId] = useState(null);
  const [apiKey, setApiKey] = useState("");
  const [apiPerms, setApiPerms] = useState({ read: true, write: false, ia: false, admin: false });
  const [apiKeySuccess, setApiKeySuccess] = useState("");
  const [apiKeyError, setApiKeyError] = useState("");

  const [pageSize, setPageSize] = useState(() => parseInt(localStorage.getItem('adminPageSize') || '8', 10));
  const [pageSizeInput, setPageSizeInput] = useState(() => parseInt(localStorage.getItem('adminPageSize') || '8', 10));
  const [pageSizeSuccess, setPageSizeSuccess] = useState('');
  const [articlesPage, setArticlesPage] = useState(1);
  const [archivesPage, setArchivesPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('tous');
  const [searchQuery, setSearchQuery] = useState('');

  // Charger page_size depuis la BDD au montage
  useEffect(() => {
    fetch('/api/settings/admin_page_size')
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data?.value) {
          const v = parseInt(data.value, 10);
          if (!isNaN(v) && v > 0) {
            setPageSize(v);
            setPageSizeInput(v);
            localStorage.setItem('adminPageSize', String(v));
          }
        }
      })
      .catch(() => { });
  }, []);

  const token = localStorage.getItem("token");

  const decodePerms = (permStr = "1000") => ({
    read: permStr[0] === "1",
    write: permStr[1] === "1",
    ia: permStr[2] === "1",
    admin: permStr[3] === "1",
  });

  const encodePerms = (perms) => `${perms.read ? "1" : "0"}${perms.write ? "1" : "0"}${perms.ia ? "1" : "0"}${perms.admin ? "1" : "0"}`;

  useEffect(() => {
    if (!token) {
      navigate("/hidden-admin-gate");
      return;
    }

    fetch("/api/posts/admin/all", { headers: { Authorization: `Bearer ${token}` } })
      .then(async (res) => {
        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem("token");
          navigate("/hidden-admin-gate");
          return [];
        }
        return await res.json();
      })
      .then((data) => setPosts(Array.isArray(data) ? data : []))
      .catch(() => setError("Erreur lors du chargement des articles"));

    fetch("/api/posts/archives", { headers: { Authorization: `Bearer ${token}` } })
      .then(async (res) => {
        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem("token");
          navigate("/hidden-admin-gate");
          return [];
        }
        return await res.json();
      })
      .then((data) => setArchived(Array.isArray(data) ? data : []))
      .catch(() => setArchived([]));
  }, [navigate, token]);

  useEffect(() => {
    if (view !== "settings" || !token) return;

    fetch("/api/apikey", { headers: { Authorization: `Bearer ${token}` } })
      .then(async (res) => {
        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem("token");
          navigate("/hidden-admin-gate");
          return null;
        }
        return await res.json();
      })
      .then((data) => {
        if (!data) return;
        setApiKeyId(data.id || null);
        setApiKey(data.api_key || "");
        setApiPerms(decodePerms(data.permissions || "1000"));
      })
      .catch(() => setApiKeyError("Erreur lors du chargement de la clé API"));

    fetch("/api/ia/params")
      .then((res) => res.json())
      .then((data) => {
        setIaUrl(data.url_ia || "");
        setIaKey(data.key_ia || "");
        setIaModel(data.id_IA || "");
        setIaPrompt(data.system_prompt || "");
      })
      .catch(() => {
        setIaUrl("");
        setIaKey("");
        setIaModel("");
        setIaPrompt("");
      });
  }, [view, navigate, token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const reloadPosts = async () => {
    const authToken = localStorage.getItem("token");
    const [postsRes, archivedRes] = await Promise.all([
      fetch("/api/posts/admin/all", { headers: { Authorization: `Bearer ${authToken}` } }),
      fetch("/api/posts/archives", { headers: { Authorization: `Bearer ${authToken}` } }),
    ]);
    const postsData = await postsRes.json();
    const archivedData = await archivedRes.json();
    setPosts(Array.isArray(postsData) ? postsData : []);
    setArchived(Array.isArray(archivedData) ? archivedData : []);
  };

  const loadIdeaCategories = useCallback(async () => {
    try {
      const authToken = localStorage.getItem("token");
      const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};
      const res = await fetch("/api/categories", { headers });
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      if (Array.isArray(data)) {
        const map = data.reduce((acc, cat) => {
          acc[cat.id] = cat.name;
          return acc;
        }, {});
        setIdeaCategories(map);
      }
    } catch (err) {
      // On conserve simplement la dernière version connue
    }
  }, []);

  const loadIdeas = useCallback(async () => {
    setIdeaLoading(true);
    setIdeaError("");
    try {
      const authToken = localStorage.getItem("token");
      const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};
      const res = await fetch("/api/idea", { headers });
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      setIdeas(Array.isArray(data) ? data : []);
    } catch (err) {
      setIdeaError("Erreur lors du chargement des idées.");
    } finally {
      setIdeaLoading(false);
    }
  }, []);

  const handleEditIdea = (idea) => {
    setEditIdea(idea);
    setShowIdeaEditor(true);
  };

  const handleCardMarkProcessed = useCallback(async (ideaId) => {
    if (!ideaId) return;
    if (!window.confirm("Marquer cette idée comme traitée ?")) return;
    try {
      const authToken = localStorage.getItem("token");
      const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};
      const res = await fetch(`/api/idea/${ideaId}/processed`, {
        method: "PATCH",
        headers,
      });
      if (!res.ok) throw new Error("failed");
      await loadIdeas();
    } catch (err) {
      setIdeaError("Impossible de marquer l'idée comme traitée pour le moment.");
    }
  }, [loadIdeas]);

  const getCategoryLabel = (categoryId) => ideaCategories[categoryId] || `Catégorie #${categoryId}`;

  const handleEditPost = (post) => {
    setEditArticle(post);
    setShowArticleEditor(true);
  };

  const handleArchivePost = async (postId) => {
    if (!window.confirm("Archiver cet article ?")) return;
    const res = await fetch(`/api/posts/${postId}/archive`, {
      method: "POST",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    if (!res.ok) {
      alert("Erreur lors de l'archivage");
      return;
    }
    await reloadPosts();
  };

  const handleUnarchivePost = async (archiveId) => {
    if (!window.confirm("Restaurer cet article depuis les archives ?")) return;
    const res = await fetch(`/api/posts/archives/${archiveId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    if (!res.ok) {
      alert("Erreur lors de la restauration");
      return;
    }
    await reloadPosts();
  };

  const handleDeleteArchivedPost = async (postId) => {
    if (!window.confirm("Supprimer définitivement cet article archivé ?")) return;
    const res = await fetch(`/api/posts/archives/${postId}/permanent`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    if (!res.ok) {
      alert("Erreur lors de la suppression définitive");
      return;
    }
    await reloadPosts();
  };

  const handleToggleStatus = async (post) => {
    const newStatus = post.status === 'publi\u00e9' ? 'brouillon' : 'publi\u00e9';
    const res = await fetch(`/api/posts/${post.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ status: newStatus }),
    });
    if (!res.ok) {
      alert('Erreur lors du changement de statut');
      return;
    }
    await reloadPosts();
  };

  const AdminPostCard = ({ post, archived: isArchived = false }) => (
    <div className="bg-gray-800 rounded-lg p-4 shadow flex flex-col h-full">
      {post.media_url && <img src={post.media_url} alt={post.title} className="w-full h-44 object-cover rounded mb-3 border border-gray-700" />}
      <div className="flex items-start justify-between gap-3 mb-2">
        <h2 className="text-xl font-bold text-blue-300">{post.title}</h2>
        <div className="flex items-center gap-2 shrink-0">
          {!isArchived && (
            <>
              <button
                className="bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded"
                title="Éditer"
                onClick={() => handleEditPost(post)}
              >
                <FaEdit />
              </button>
              <button
                className="bg-orange-600 hover:bg-orange-700 text-white p-2 rounded"
                title="Archiver"
                onClick={() => handleArchivePost(post.id)}
              >
                <FaArchive />
              </button>
            </>
          )}
          {isArchived && (
            <>
              <button
                className="bg-green-600 hover:bg-green-700 text-white p-2 rounded"
                title="Restaurer"
                onClick={() => handleUnarchivePost(post.archive_id || post.id)}
              >
                <FaUndo />
              </button>
              <button
                className="bg-red-600 hover:bg-red-700 text-white p-2 rounded"
                title="Supprimer définitivement"
                onClick={() => handleDeleteArchivedPost(post.id)}
              >
                <FaTrash />
              </button>
            </>
          )}
        </div>
      </div>
      <div className="mb-2">
        {!isArchived ? (
          <button
            title={post.status === 'publi\u00e9' ? 'Passer en brouillon' : 'Publier l\'article'}
            onClick={() => handleToggleStatus(post)}
            className={`inline-block px-2 py-0.5 text-xs font-semibold rounded cursor-pointer transition hover:opacity-80 ${post.status === 'publi\u00e9' ? 'bg-green-800 text-green-300 hover:bg-green-700' : 'bg-yellow-800 text-yellow-200 hover:bg-yellow-700'
              }`}
          >
            {post.status === 'publi\u00e9' ? '\u2713 Publi\u00e9' : '\u270e Brouillon'}
          </button>
        ) : (
          <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded ${post.status === 'publi\u00e9' ? 'bg-green-800 text-green-300' : 'bg-yellow-800 text-yellow-200'}`}>
            {post.status === 'publi\u00e9' ? 'Publi\u00e9' : 'Brouillon'}
          </span>
        )}
      </div>
      {post.category && <p className="text-gray-400 mb-2">Catégorie : {post.category}</p>}
      <p className="text-gray-300 mb-2 flex-1">{post.excerpt}</p>
      {post.created_at && <span className="text-xs text-gray-500 mt-2">{new Date(post.created_at).toLocaleDateString("fr-FR")}</span>}
    </div>
  );

  const IdeaCard = ({ idea, categoryLabel, onEdit, onMarkProcessed }) => {
    const stripHtml = (text = "") => text.replace(/<[^>]+>/g, "");
    const previewSource = idea.excerpt || stripHtml(idea.content || "");
    const preview = previewSource.length > 200 ? `${previewSource.slice(0, 200)}…` : previewSource;
    const statusClasses = idea.is_processed ? "bg-green-900 text-green-300" : "bg-yellow-900 text-yellow-200";
    return (
      <div className="bg-gray-800 rounded-lg p-4 shadow flex flex-col border border-gray-700 h-full">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">Idée #{idea.id}</p>
            <h2 className="text-xl font-bold text-purple-300">{idea.title}</h2>
          </div>
          <span className={`px-2 py-1 text-xs font-semibold rounded ${statusClasses}`}>
            {idea.is_processed ? "Traitée" : "À traiter"}
          </span>
        </div>
        <p className="text-sm text-gray-400 mb-2">Catégorie : {categoryLabel}</p>
        {preview && <p className="text-gray-300 mb-4 flex-1">{preview}</p>}
        {idea.created_at && (
          <span className="text-xs text-gray-500 mb-4">
            Créée le {new Date(idea.created_at).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })}
          </span>
        )}
        <div className="mt-auto flex gap-2 flex-col sm:flex-row">
          <button
            className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 px-3 rounded flex items-center justify-center gap-2"
            onClick={() => onEdit && onEdit()}
            type="button"
          >
            <FaEdit /> Éditer
          </button>
          <button
            className={`flex-1 font-semibold py-2 px-3 rounded flex items-center justify-center gap-2 ${idea.is_processed ? "bg-gray-600 cursor-not-allowed text-gray-300" : "bg-green-600 hover:bg-green-700 text-white"
              }`}
            onClick={() => !idea.is_processed && onMarkProcessed && onMarkProcessed()}
            disabled={idea.is_processed}
            type="button"
          >
            <FaCheckCircle />
            {idea.is_processed ? "Déjà traitée" : "Marquer traitée"}
          </button>
        </div>
      </div>
    );
  };

  useEffect(() => {
    setArticlesPage(1);
    setArchivesPage(1);
    setStatusFilter('tous');
    setSearchQuery('');
  }, [view]);

  useEffect(() => {
    if (view !== "ideas") return;
    loadIdeas();
    loadIdeaCategories();
  }, [view, loadIdeas, loadIdeaCategories]);

  return (
    <>
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="min-h-screen w-full max-w-none flex bg-gray-900 text-white">
        <aside className="w-64 bg-gray-950 flex flex-col py-8 px-4 shadow-lg min-h-screen">
          <span className="text-2xl font-bold text-blue-500 mb-10">AI Tech Blog</span>
          <nav className="flex flex-col gap-4">
            <button className={`text-left px-3 py-2 rounded font-semibold transition ${view === "articles" ? "bg-gray-800 text-blue-400" : "hover:bg-gray-800"}`} onClick={() => setView("articles")}>Articles</button>
            <button className={`text-left px-3 py-2 rounded font-semibold transition ${view === "pages" ? "bg-gray-800 text-blue-400" : "hover:bg-gray-800"}`} onClick={() => setView("pages")}>Pages</button>
            <button className={`text-left px-3 py-2 rounded font-semibold transition ${view === "ideas" ? "bg-gray-800 text-blue-400" : "hover:bg-gray-800"}`} onClick={() => setView("ideas")}>Idée d'article</button>
            <button className={`text-left px-3 py-2 rounded font-semibold transition ${view === "settings" ? "bg-gray-800 text-blue-400" : "hover:bg-gray-800"}`} onClick={() => setView("settings")}>Paramètres</button>
            <button className={`text-left px-3 py-2 rounded font-semibold transition ${view === "archives" ? "bg-gray-800 text-blue-400" : "hover:bg-gray-800"}`} onClick={() => setView("archives")}>Archivage</button>
            <button className={`text-left px-3 py-2 rounded font-semibold transition ${view === "album" ? "bg-gray-800 text-blue-400" : "hover:bg-gray-800"}`} onClick={() => setView("album")}>Album</button>
            <button className={`text-left px-3 py-2 rounded font-semibold transition ${view === "tools" ? "bg-gray-800 text-blue-400" : "hover:bg-gray-800"}`} onClick={() => setView("tools")}>Outils</button>
          </nav>
          <button onClick={handleLogout} className="mt-auto bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-semibold">Se déconnecter</button>
        </aside>

        <main className="flex-1 min-w-0 w-full p-6 md:p-10 overflow-x-hidden">
          {view === "articles" && (
            <>
              <h1 className="text-3xl font-bold mb-6">Articles</h1>
              <button className="mb-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded shadow" onClick={() => { setEditArticle(null); setShowArticleEditor(true); }} style={{ display: showArticleEditor ? "none" : "inline-block" }}>
                Créer un article
              </button>
              {showArticleEditor && (
                <ArticleEditor
                  article={editArticle}
                  onArticleSaved={() => { reloadPosts(); setShowArticleEditor(false); setEditArticle(null); }}
                  onClose={() => { setShowArticleEditor(false); setEditArticle(null); }}
                />
              )}
              {error && <div className="text-red-500 mb-4">{error}</div>}
              {!showArticleEditor && (
                <div className="flex flex-col gap-3 mb-4">
                  <div className="relative w-full max-w-md">
                    <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none">
                      <FaSearch size={13} />
                    </span>
                    <input
                      type="text"
                      placeholder="Rechercher un article..."
                      value={searchQuery}
                      onChange={(e) => { setSearchQuery(e.target.value); setArticlesPage(1); }}
                      className="w-full bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    {['tous', 'publié', 'brouillon'].map((f) => (
                      <button
                        key={f}
                        className={`px-4 py-1.5 rounded font-semibold text-sm transition ${statusFilter === f
                          ? f === 'publié' ? 'bg-green-700 text-white' : f === 'brouillon' ? 'bg-yellow-700 text-white' : 'bg-blue-700 text-white'
                          : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                          }`}
                        onClick={() => { setStatusFilter(f); setArticlesPage(1); }}
                      >
                        {f === 'tous' ? 'Tous' : f === 'publié' ? 'Publiés' : 'Brouillons'}
                        {' '}({f === 'tous' ? posts.length : posts.filter((p) => p.status === f).length})
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {(() => {
                const q = searchQuery.trim().toLowerCase();
                const filtered = posts
                  .filter((p) => statusFilter === 'tous' || p.status === statusFilter)
                  .filter((p) => !q || (p.title || '').toLowerCase().includes(q) || (p.excerpt || '').toLowerCase().includes(q));
                return (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {filtered.slice((articlesPage - 1) * pageSize, articlesPage * pageSize).map((post) => (
                        <AdminPostCard key={post.id} post={post} />
                      ))}
                    </div>
                    <Pagination page={articlesPage} total={filtered.length} size={pageSize} onPage={setArticlesPage} />
                  </>
                );
              })()}
            </>
          )}

          {view === "pages" && <PagesAdmin />}
          {view === "ideas" && (
            <div>
              <h1 className="text-3xl font-bold mb-6">Idée d'article</h1>
              <button
                className="mb-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded shadow"
                onClick={() => { setEditIdea(null); setShowIdeaEditor(true); }}
                style={{ display: showIdeaEditor ? "none" : "inline-block" }}
              >
                Inspire-toi de la sélection d'articles
              </button>
              {showIdeaEditor && (
                <IdeaEditor
                  idea={editIdea}
                  onIdeaSaved={async () => { await loadIdeas(); setShowIdeaEditor(false); setEditIdea(null); }}
                  onClose={() => { setShowIdeaEditor(false); setEditIdea(null); }}
                  onMarkProcessed={async () => {
                    await loadIdeas();
                    setShowIdeaEditor(false);
                    setEditIdea(null);
                  }}
                />
              )}
              <section className="bg-gray-900/30 border border-gray-800 rounded-lg p-4">
                <div className="flex flex-wrap items-center gap-3 mb-4 justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold">Idées déjà créées</h2>
                    <p className="text-gray-400 text-sm">Toutes les inspirations collectées apparaissent ci-dessous.</p>
                  </div>
                  <button
                    className="text-sm text-blue-400 hover:text-blue-300 underline"
                    onClick={loadIdeas}
                    type="button"
                  >
                    Rafraîchir la liste
                  </button>
                </div>
                {ideaError && <div className="text-red-400 mb-4">{ideaError}</div>}
                {ideaLoading && <p className="text-gray-400">Chargement des idées...</p>}
                {!ideaLoading && ideas.length === 0 && (
                  <p className="text-gray-500">Aucune idée enregistrée pour l'instant.</p>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {ideas.map((idea) => (
                    <IdeaCard
                      key={idea.id}
                      idea={idea}
                      categoryLabel={getCategoryLabel(idea.category_id)}
                      onEdit={() => handleEditIdea(idea)}
                      onMarkProcessed={() => handleCardMarkProcessed(idea.id)}
                    />
                  ))}
                </div>
              </section>
            </div>
          )}
          {view === "album" && <Album />}
          {view === "tools" && <ToolsAdmin />}

          {view === "archives" && (
            <>
              <h1 className="text-3xl font-bold mb-6">Archives</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {archived.slice((archivesPage - 1) * pageSize, archivesPage * pageSize).map((post) => (
                  <AdminPostCard key={post.archive_id || post.id} post={post} archived />
                ))}
              </div>
              <Pagination page={archivesPage} total={archived.length} size={pageSize} onPage={setArchivesPage} />
            </>
          )}

          {view === "settings" && (
            <div className="w-full max-w-3xl bg-gray-800 rounded-lg shadow p-6">
              <h1 className="text-3xl font-bold mb-8">Paramètres</h1>

              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-2">Affichage</h2>
                <div className="bg-gray-900 rounded p-4">
                  <label className="block mb-1 font-semibold">Éléments par page (articles &amp; archives)</label>
                  <div className="flex gap-2 items-center mt-2">
                    <input
                      type="number"
                      min="1"
                      max="50"
                      className="w-24 p-2 rounded bg-gray-700 text-white"
                      value={pageSizeInput}
                      onChange={(e) => setPageSizeInput(Number(e.target.value))}
                    />
                    <button
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow"
                      onClick={async () => {
                        const v = Math.max(1, Math.min(50, Number(pageSizeInput)));
                        setPageSize(v);
                        setPageSizeInput(v);
                        localStorage.setItem('adminPageSize', String(v));
                        setArticlesPage(1);
                        setArchivesPage(1);
                        try {
                          await fetch('/api/settings/admin_page_size', {
                            method: 'PUT',
                            headers: {
                              'Content-Type': 'application/json',
                              Authorization: `Bearer ${localStorage.getItem('token')}`,
                            },
                            body: JSON.stringify({ value: v }),
                          });
                        } catch (_) { }
                        setPageSizeSuccess(`✓ Enregistré : ${v} éléments par page`);
                        setTimeout(() => setPageSizeSuccess(''), 3000);
                      }}
                    >Appliquer</button>
                  </div>
                  {pageSizeSuccess && <div className="text-green-400 text-sm mt-2 font-semibold">{pageSizeSuccess}</div>}
                  <p className="text-gray-400 text-sm mt-2">Valeur actuelle : <strong className="text-white">{pageSize}</strong> éléments par page</p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-2">API externe</h2>
                <p className="text-gray-400 mb-2">Configurer les accès API pour des services externes.</p>
                <div className="bg-gray-900 rounded p-4 mb-2">
                  <label className="block mb-1 font-semibold">Clé API externe</label>
                  <div className="flex gap-2 mb-2">
                    <input type="text" className="w-full p-2 rounded bg-gray-700 text-white" value={apiKey} readOnly />
                    <button className="bg-gray-800 hover:bg-gray-700 text-blue-400 font-bold px-3 rounded" title="Copier" onClick={() => navigator.clipboard.writeText(apiKey || "")}>Copier</button>
                  </div>
                  <div className="mb-4">
                    <label className="block font-semibold mb-1">Autorisations de la clé :</label>
                    <div className="flex flex-col gap-1 pl-2">
                      <label className="inline-flex items-center gap-2"><input type="checkbox" className="accent-blue-500" checked={apiPerms.read} onChange={(e) => setApiPerms((p) => ({ ...p, read: e.target.checked }))} /> Lecture des articles</label>
                      <label className="inline-flex items-center gap-2"><input type="checkbox" className="accent-blue-500" checked={apiPerms.write} onChange={(e) => setApiPerms((p) => ({ ...p, write: e.target.checked }))} /> Création d’articles</label>
                      <label className="inline-flex items-center gap-2"><input type="checkbox" className="accent-blue-500" checked={apiPerms.ia} onChange={(e) => setApiPerms((p) => ({ ...p, ia: e.target.checked }))} /> Accès enrichissement IA</label>
                      <label className="inline-flex items-center gap-2"><input type="checkbox" className="accent-blue-500" checked={apiPerms.admin} onChange={(e) => setApiPerms((p) => ({ ...p, admin: e.target.checked }))} /> Accès admin</label>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow flex-1"
                      onClick={async () => {
                        setApiKeySuccess("");
                        setApiKeyError("");
                        const res = await fetch("/api/apikey", { method: "POST", headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
                        const data = await res.json();
                        if (res.ok) {
                          setApiKey(data.api_key || "");
                          const refresh = await fetch("/api/apikey", { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
                          const refreshData = await refresh.json();
                          if (refresh.ok && refreshData?.id) {
                            setApiKeyId(refreshData.id);
                            setApiPerms(decodePerms(refreshData.permissions || "1000"));
                          }
                          setApiKeySuccess("Nouvelle clé générée.");
                        } else {
                          setApiKeyError(data.message || "Erreur lors de la génération de la clé API");
                        }
                      }}
                    >Générer une nouvelle clé</button>
                    <button
                      className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded shadow flex-1"
                      onClick={async () => {
                        setApiKeySuccess("");
                        setApiKeyError("");
                        if (!apiKeyId) {
                          setApiKeyError("Aucune clé API à sauvegarder.");
                          return;
                        }
                        const permissions = encodePerms(apiPerms);
                        const res = await fetch(`/api/apikey/${apiKeyId}`, {
                          method: "PUT",
                          headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({ permissions }),
                        });
                        const data = await res.json();
                        if (res.ok) setApiKeySuccess("Permissions API sauvegardées.");
                        else setApiKeyError(data.message || "Erreur lors de la sauvegarde des permissions");
                      }}
                    >Sauvegarder</button>
                  </div>
                  {apiKeySuccess && <div className="text-green-400 mt-2">{apiKeySuccess}</div>}
                  {apiKeyError && <div className="text-red-400 mt-2">{apiKeyError}</div>}
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-2">Paramètres IA (enrichissement)</h2>
                <div className="bg-gray-900 rounded p-4">
                  <label className="block mb-1 font-semibold">URL IA</label>
                  <input type="text" className="w-full p-2 rounded bg-gray-700 text-white mb-2" value={iaUrl} onChange={(e) => setIaUrl(e.target.value)} />
                  <label className="block mb-1 font-semibold">Clé API IA</label>
                  <input type="text" className="w-full p-2 rounded bg-gray-700 text-white mb-2" value={iaKey} onChange={(e) => setIaKey(e.target.value)} />
                  <label className="block mb-1 font-semibold">Modèle IA</label>
                  <input type="text" className="w-full p-2 rounded bg-gray-700 text-white mb-2" value={iaModel} onChange={(e) => setIaModel(e.target.value)} />
                  <label className="block mb-1 font-semibold">Prompt IA</label>
                  <textarea className="w-full p-2 rounded bg-gray-700 text-white" rows={3} value={iaPrompt} onChange={(e) => setIaPrompt(e.target.value)} />
                  <button
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow w-full"
                    onClick={async () => {
                      setIaSuccess("");
                      setIaError("");
                      const res = await fetch("/api/ia/params", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ url_ia: iaUrl, key_ia: iaKey, id_IA: iaModel, pront_ia: iaPrompt }),
                      });
                      if (res.ok) setIaSuccess("Paramètres IA sauvegardés !");
                      else setIaError("Erreur lors de la sauvegarde");
                    }}
                  >Sauvegarder</button>
                  {iaSuccess && <div className="text-green-400 mt-2">{iaSuccess}</div>}
                  {iaError && <div className="text-red-400 mt-2">{iaError}</div>}
                </div>
              </section>
            </div>
          )}
        </main>
      </div>
    </>
  );
}

export default AdminDashboard;

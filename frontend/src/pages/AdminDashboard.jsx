import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaArchive, FaTrash, FaUndo } from "react-icons/fa";
import ArticleEditor from "./ArticleEditor";
import IdeaEditor from "./IdeaEditor";
import PagesAdmin from "./PagesAdmin";
import Album from "./Album";
import { Helmet } from "react-helmet-async";

function AdminDashboard() {
  const navigate = useNavigate();
  const [view, setView] = useState("articles");
  const [posts, setPosts] = useState([]);
  const [archived, setArchived] = useState([]);
  const [error, setError] = useState("");
  const [showEditor, setShowEditor] = useState(false);
  const [editArticle, setEditArticle] = useState(null);

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

    fetch("/api/posts", { headers: { Authorization: `Bearer ${token}` } })
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
      fetch("/api/posts", { headers: { Authorization: `Bearer ${authToken}` } }),
      fetch("/api/posts/archives", { headers: { Authorization: `Bearer ${authToken}` } }),
    ]);
    const postsData = await postsRes.json();
    const archivedData = await archivedRes.json();
    setPosts(Array.isArray(postsData) ? postsData : []);
    setArchived(Array.isArray(archivedData) ? archivedData : []);
  };

  const handleEditPost = (post) => {
    setEditArticle(post);
    setShowEditor(true);
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
      {post.category && <p className="text-gray-400 mb-2">Catégorie : {post.category}</p>}
      <p className="text-gray-300 mb-2 flex-1">{post.excerpt}</p>
      {post.created_at && <span className="text-xs text-gray-500 mt-2">{new Date(post.created_at).toLocaleDateString("fr-FR")}</span>}
    </div>
  );

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
          </nav>
          <button onClick={handleLogout} className="mt-auto bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-semibold">Se déconnecter</button>
        </aside>

        <main className="flex-1 min-w-0 w-full p-6 md:p-10 overflow-x-hidden">
          {view === "articles" && (
            <>
              <h1 className="text-3xl font-bold mb-6">Articles</h1>
              <button className="mb-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded shadow" onClick={() => { setEditArticle(null); setShowEditor(true); }} style={{ display: showEditor ? "none" : "inline-block" }}>
                Créer un article
              </button>
              {showEditor && (
                <ArticleEditor
                  article={editArticle}
                  onArticleSaved={() => { reloadPosts(); setShowEditor(false); setEditArticle(null); }}
                  onClose={() => { setShowEditor(false); setEditArticle(null); }}
                />
              )}
              {error && <div className="text-red-500 mb-4">{error}</div>}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {posts.map((post) => (
                  <AdminPostCard key={post.id} post={post} />
                ))}
              </div>
            </>
          )}

          {view === "pages" && <PagesAdmin />}
          {view === "ideas" && (
            <div>
              <h1 className="text-3xl font-bold mb-6">Idée d'article</h1>
              <button
                className="mb-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded shadow"
                onClick={() => { setEditArticle(null); setShowEditor(true); }}
                style={{ display: showEditor ? "none" : "inline-block" }}
              >
                Créer un article
              </button>
              {showEditor && (
                <IdeaEditor
                  idea={editArticle}
                  onIdeaSaved={() => { setShowEditor(false); setEditArticle(null); }}
                  onClose={() => { setShowEditor(false); setEditArticle(null); }}
                  onMarkProcessed={async (id) => {
                    const token = localStorage.getItem('token');
                    await fetch(`/api/idea/${id}/processed`, {
                      method: 'PATCH',
                      headers: { 'Authorization': `Bearer ${token}` }
                    });
                    setShowEditor(false); setEditArticle(null);
                  }}
                />
              )}
              {/* Section vide pour l'instant */}
            </div>
          )}
          {view === "album" && <Album />}

          {view === "archives" && (
            <>
              <h1 className="text-3xl font-bold mb-6">Archives</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {archived.map((post) => (
                  <AdminPostCard key={post.archive_id || post.id} post={post} archived />
                ))}
              </div>
            </>
          )}

          {view === "settings" && (
            <div className="w-full max-w-3xl bg-gray-800 rounded-lg shadow p-6">
              <h1 className="text-3xl font-bold mb-8">Paramètres</h1>

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

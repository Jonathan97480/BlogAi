import React, { useState } from 'react';

const TOOLS = [
    {
        id: 'image-compare',
        name: 'Comparateur d\'images',
        icon: '🖼️',
        description: 'Outil de comparaison avant/après intégrable dans un article via iframe.',
        route: '/tools/image-compare',
        sections: [
            {
                title: 'Description',
                content: (
                    <p className="text-gray-300">
                        Affiche deux images côte à côte avec un curseur draggable permettant de révéler progressivement
                        l'image de gauche (Avant) sur l'image de droite (Après). Conçu pour être embarqué dans un article
                        via un <code className="bg-gray-700 px-1 rounded text-blue-300">&lt;iframe&gt;</code>.
                    </p>
                ),
            },
            {
                title: 'Paramètres d\'URL',
                content: (
                    <table className="w-full text-sm border-collapse">
                        <thead>
                            <tr className="bg-gray-700 text-gray-200">
                                <th className="text-left px-3 py-2 rounded-tl">Paramètre</th>
                                <th className="text-left px-3 py-2">Type</th>
                                <th className="text-left px-3 py-2 rounded-tr">Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                ['left', 'string', 'URL locale de l\'image gauche (ex: /img/api/a.jpg)'],
                                ['right', 'string', 'URL locale de l\'image droite (ex: /img/api/b.jpg)'],
                                ['width', 'number', 'Largeur en px (défaut : 1200)'],
                                ['height', 'number', 'Hauteur en px (défaut : 675)'],
                                ['labelLeft', 'string', 'Libellé image gauche (défaut : Avant)'],
                                ['labelRight', 'string', 'Libellé image droite (défaut : Après)'],
                                ['start', 'number', 'Position initiale du curseur 0–100 (défaut : 50)'],
                            ].map(([param, type, desc]) => (
                                <tr key={param} className="border-b border-gray-700 hover:bg-gray-700/40">
                                    <td className="px-3 py-2 font-mono text-blue-300">{param}</td>
                                    <td className="px-3 py-2 text-gray-400">{type}</td>
                                    <td className="px-3 py-2 text-gray-300">{desc}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ),
            },
            {
                title: 'Contrainte de sécurité',
                content: (
                    <p className="text-gray-300">
                        Les URLs <code className="bg-gray-700 px-1 rounded text-blue-300">left</code> et{' '}
                        <code className="bg-gray-700 px-1 rounded text-blue-300">right</code> doivent obligatoirement
                        commencer par <code className="bg-gray-700 px-1 rounded text-yellow-300">/img/</code>. Toute URL
                        externe ou relative incorrecte affichera un message d'erreur à la place du comparateur.
                    </p>
                ),
            },
            {
                title: 'Exemple d\'intégration (iframe)',
                content: (
                    <pre className="bg-gray-900 rounded p-4 text-sm text-green-300 overflow-x-auto whitespace-pre-wrap break-all">
                        {`<iframe
  src="/tools/image-compare?left=/img/api/avant.jpg&right=/img/api/apres.jpg&width=1200&height=675&labelLeft=Avant&labelRight=Après&start=50"
  width="1200"
  height="675"
  style="width:100%;max-width:1200px;border:0;overflow:hidden;aspect-ratio:1200/675;display:block;margin:0 auto;"
  loading="lazy"
  referrerpolicy="same-origin"
></iframe>`}
                    </pre>
                ),
            },
            {
                title: 'Générateur rapide (dans l\'éditeur d\'article)',
                content: (
                    <p className="text-gray-300">
                        Dans l'éditeur d'article, un bouton <strong className="text-white">Insérer un comparateur</strong> est
                        disponible sous l'éditeur TinyMCE. Il demande les URLs et dimensions via des boîtes de dialogue,
                        puis insère automatiquement le code iframe dans le contenu.
                    </p>
                ),
            },
            {
                title: 'Tester l\'outil',
                content: (
                    <div>
                        <p className="text-gray-300 mb-3">Ouvre directement l'outil avec des images de test :</p>
                        <a
                            href="/tools/image-compare?left=/img/20260328-232919-admin1.jfif&right=/img/20260328-232919-admin1.jfif&width=1200&height=675&labelLeft=Avant&labelRight=Apr%C3%A8s&start=50"
                            target="_blank"
                            rel="noreferrer"
                            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded transition"
                        >
                            Ouvrir le comparateur ↗
                        </a>
                    </div>
                ),
            },
        ],
    },
];

export default function ToolsAdmin() {
    const [selectedTool, setSelectedTool] = useState(TOOLS[0]);

    return (
        <div className="flex gap-6 h-full">
            {/* Liste des outils */}
            <aside className="w-56 shrink-0">
                <h2 className="text-lg font-bold text-gray-300 mb-4 uppercase tracking-wider text-xs">Outils disponibles</h2>
                <ul className="flex flex-col gap-2">
                    {TOOLS.map((tool) => (
                        <li key={tool.id}>
                            <button
                                className={`w-full text-left px-3 py-3 rounded-lg font-semibold transition flex items-center gap-2 ${selectedTool?.id === tool.id
                                        ? 'bg-indigo-600 text-white shadow'
                                        : 'bg-gray-800 hover:bg-gray-700 text-gray-200'
                                    }`}
                                onClick={() => setSelectedTool(tool)}
                            >
                                <span className="text-xl">{tool.icon}</span>
                                <span>{tool.name}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </aside>

            {/* Détail de l'outil */}
            <div className="flex-1 min-w-0">
                {selectedTool ? (
                    <>
                        <div className="flex items-center gap-3 mb-6">
                            <span className="text-3xl">{selectedTool.icon}</span>
                            <div>
                                <h1 className="text-2xl font-bold">{selectedTool.name}</h1>
                                <p className="text-gray-400 text-sm">{selectedTool.description}</p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-6">
                            {selectedTool.sections.map((section) => (
                                <section key={section.title} className="bg-gray-800 rounded-lg p-5">
                                    <h3 className="text-base font-semibold text-indigo-300 mb-3">{section.title}</h3>
                                    {section.content}
                                </section>
                            ))}
                        </div>
                    </>
                ) : (
                    <p className="text-gray-500">Sélectionne un outil dans la liste.</p>
                )}
            </div>
        </div>
    );
}

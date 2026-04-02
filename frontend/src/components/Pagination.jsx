import React from 'react';

export default function Pagination({ page, total, size, onPage }) {
    const totalPages = Math.ceil(total / size);
    if (totalPages <= 1) return null;
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
            pages.push(i);
        } else if (pages[pages.length - 1] !== '...') {
            pages.push('...');
        }
    }
    return (
        <div className="flex items-center justify-center flex-wrap gap-2 mt-6">
            <button
                className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed font-semibold"
                onClick={() => onPage(page - 1)}
                disabled={page <= 1}
            >←</button>
            {pages.map((p, idx) =>
                p === '...' ? (
                    <span key={`ellipsis-${idx}`} className="px-2 text-gray-500">…</span>
                ) : (
                    <button
                        key={p}
                        className={`px-3 py-1 rounded font-semibold ${p === page ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
                        onClick={() => onPage(p)}
                    >{p}</button>
                )
            )}
            <button
                className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed font-semibold"
                onClick={() => onPage(page + 1)}
                disabled={page >= totalPages}
            >→</button>
            <span className="text-gray-400 text-sm ml-2">Page {page}/{totalPages} — {total} élément{total > 1 ? 's' : ''}</span>
        </div>
    );
}

import { useState, useEffect, useRef, useCallback } from 'react';

const PAGE_SIZE = 4;

/**
 * Infinite scroll frontend-side.
 * Prend un tableau complet d'items et en révèle PAGE_SIZE à la fois
 * au fur et à mesure que le sentinel en bas de page devient visible.
 *
 * @param {Array} items  - tableau complet des éléments
 * @param {number} size  - nombre d'éléments affichés par tranche (défaut : 4)
 * @returns {{ visibleItems, hasMore, sentinelRef }}
 */
export default function useInfiniteSlice(items, size = PAGE_SIZE) {
    const [visibleCount, setVisibleCount] = useState(size);
    const sentinelRef = useRef(null);

    // Réinitialise au changement de source (nouvelle page, catégorie, recherche)
    useEffect(() => {
        setVisibleCount(size);
    }, [items, size]);

    const loadMore = useCallback(() => {
        setVisibleCount((c) => {
            if (c >= items.length) return c;
            return Math.min(c + size, items.length);
        });
    }, [items.length, size]);

    useEffect(() => {
        const el = sentinelRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) loadMore();
            },
            { rootMargin: '200px' }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [loadMore]);

    return {
        visibleItems: items.slice(0, visibleCount),
        hasMore: visibleCount < items.length,
        sentinelRef,
    };
}

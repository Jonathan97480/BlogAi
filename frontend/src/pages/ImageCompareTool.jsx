import React, { useEffect, useMemo, useRef, useState } from 'react';

function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

function normalizeDimension(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function isSafeImageUrl(value) {
  if (!value || typeof value !== 'string') return false;
  if (value.startsWith('/img/')) return true;
  try {
    const u = new URL(value, window.location.origin);
    return u.origin === window.location.origin && u.pathname.startsWith('/img/');
  } catch {
    return false;
  }
}

export default function ImageCompareTool() {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const left = params.get('left') || '';
  const right = params.get('right') || '';
  const width = normalizeDimension(params.get('width'), 1200);
  const height = normalizeDimension(params.get('height'), 675);
  const labelLeft = params.get('labelLeft') || 'Avant';
  const labelRight = params.get('labelRight') || 'Après';
  const start = clamp(Number(params.get('start') || 50), 0, 100);

  const [position, setPosition] = useState(start);
  const [dragging, setDragging] = useState(false);
  const wrapRef = useRef(null);

  const valid = isSafeImageUrl(left) && isSafeImageUrl(right);
  const aspectRatio = `${width} / ${height}`;

  const updateFromClientX = (clientX) => {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPosition(clamp(pct, 0, 100));
  };

  useEffect(() => {
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.background = 'transparent';
    document.body.style.backgroundColor = 'transparent';
    document.documentElement.style.background = 'transparent';
    document.documentElement.style.backgroundColor = 'transparent';
    const selectors = ['header', 'footer', 'nav'];
    const hideFixed = () => {
      document.querySelectorAll(selectors.join(',')).forEach((el) => {
        el.style.display = 'none';
      });
      document.querySelectorAll('*').forEach((el) => {
        const txt = (el.textContent || '').trim();
        const cls = (el.className || '').toString();
        const id = (el.id || '').toString();
        if (/rgpd|cookie/i.test(txt + ' ' + cls + ' ' + id)) {
          el.style.display = 'none';
        }
      });
      const root = wrapRef.current;
      if (root && root.parentElement) {
        root.parentElement.style.maxWidth = '100%';
        root.parentElement.style.width = '100%';
        root.parentElement.style.margin = '0';
        root.parentElement.style.padding = '0';
      }
    };
    hideFixed();
    const obs = new MutationObserver(hideFixed);
    obs.observe(document.body, { childList: true, subtree: true });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e) => {
      if (typeof e.clientX === 'number') updateFromClientX(e.clientX);
      if (e.touches && e.touches[0]) updateFromClientX(e.touches[0].clientX);
    };
    const onUp = () => setDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
  }, [dragging]);

  if (!valid) {
    return (
      <div style={{ fontFamily: 'Arial, sans-serif', padding: 16, color: '#fff', background: '#111', minHeight: '100vh' }}>
        Paramètres invalides. Utilisez uniquement des URLs locales de type <code>/img/...</code>.
      </div>
    );
  }

  return (
    <div style={{ margin: 0, padding: 0, background: 'transparent' }}>
      <div
        ref={wrapRef}
        onMouseDown={(e) => { setDragging(true); updateFromClientX(e.clientX); }}
        onTouchStart={(e) => {
          if (e.touches && e.touches[0]) {
            setDragging(true);
            updateFromClientX(e.touches[0].clientX);
          }
        }}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: `${width}px`,
          aspectRatio,
          overflow: 'hidden',
          userSelect: 'none',
          touchAction: 'pan-y',
          background: '#111',
          margin: '0 auto'
        }}
      >
        <img
          src={right}
          alt={labelRight}
          draggable="false"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
        <img
          src={left}
          alt={labelLeft}
          draggable="false"
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'left top', display: 'block',
            clipPath: `inset(0 ${100 - position}% 0 0)`
          }}
        />

        <div style={{ position: 'absolute', top: 16, left: 16, background: 'rgba(0,0,0,.7)', color: '#fff', padding: '8px 12px', borderRadius: 999, font: '600 14px Arial' }}>{labelLeft}</div>
        <div style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(0,0,0,.7)', color: '#fff', padding: '8px 12px', borderRadius: 999, font: '600 14px Arial' }}>{labelRight}</div>

        <div style={{ position: 'absolute', top: 0, bottom: 0, left: `calc(${position}% - 1px)`, width: 2, background: '#fff', boxShadow: '0 0 0 1px rgba(0,0,0,.15)' }} />
        <div
          style={{
            position: 'absolute',
            left: `calc(${position}% - 22px)`,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: '#ffffff',
            border: '3px solid #19c37d',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 6px 18px rgba(0,0,0,.25)',
            cursor: 'ew-resize'
          }}
        >
          <span style={{ fontSize: 18, lineHeight: 1, color: '#111' }}>↔</span>
        </div>
      </div>
    </div>
  );
}

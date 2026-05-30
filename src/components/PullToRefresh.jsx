import { useState, useRef, useCallback, useEffect } from 'react';

const THRESHOLD = 60;
const MAX_PULL = 120;

/**
 * 获取当前页面的滚动位置（兼容多种滚动容器）
 */
function getScrollTop() {
  // 标准模式
  if (document.scrollingElement && document.scrollingElement.scrollTop > 0) {
    return document.scrollingElement.scrollTop;
  }
  // body 滚动
  if (document.body.scrollTop > 0) return document.body.scrollTop;
  // html 滚动
  if (document.documentElement.scrollTop > 0) return document.documentElement.scrollTop;
  // iOS momentum scroll
  return window.scrollY || 0;
}

export default function PullToRefresh({ onRefresh, children }) {
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const pulling = useRef(false);
  const containerRef = useRef(null);

  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth <= 768);
  useEffect(() => {
    const mql = window.matchMedia('(max-width: 768px)');
    const handler = (e) => setIsMobile(e.matches);
    mql.addEventListener('change', handler);
    setIsMobile(mql.matches);
    return () => mql.removeEventListener('change', handler);
  }, []);

  const handleTouchStart = useCallback((e) => {
    if (refreshing) return;
    // 只有在页面滚动到顶部时才允许下拉
    if (getScrollTop() > 0) return;
    startY.current = e.touches[0].clientY;
    pulling.current = true;
  }, [refreshing]);

  const handleTouchMove = useCallback((e) => {
    if (!pulling.current || refreshing) return;

    // 如果页面不在顶部，取消下拉状态
    if (getScrollTop() > 0) {
      pulling.current = false;
      if (pullDistance > 0) setPullDistance(0);
      return;
    }

    const dy = e.touches[0].clientY - startY.current;
    if (dy > 0) {
      // 只有向下拉（dy > 0）才触发下拉刷新
      const dist = Math.min(dy * 0.5, MAX_PULL);
      setPullDistance(dist);
      // 阻止默认滚动，但保留足够的阈值避免干扰正常触摸
      if (dist > 10) {
        e.preventDefault();
      }
    } else {
      // 向上滑，让页面正常滚动
      pulling.current = false;
      if (pullDistance > 0) setPullDistance(0);
    }
  }, [refreshing, pullDistance]);

  // Register touchmove with passive: false for preventDefault
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !isMobile) return;
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    return () => el.removeEventListener('touchmove', handleTouchMove);
  }, [handleTouchMove, isMobile]);

  const handleTouchEnd = useCallback(async () => {
    if (!pulling.current) return;
    pulling.current = false;
    if (pullDistance >= THRESHOLD && !refreshing) {
      setRefreshing(true);
      setPullDistance(THRESHOLD * 0.6);
      try {
        await onRefresh?.();
      } catch { /* ignore */ }
      setRefreshing(false);
    }
    setPullDistance(0);
  }, [pullDistance, refreshing, onRefresh]);

  if (!isMobile) return <>{children}</>;

  const progress = Math.min(pullDistance / THRESHOLD, 1);
  const rotation = pullDistance * 3;

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{ position: 'relative', touchAction: pullDistance > 10 ? 'none' : 'auto' }}
    >
      {/* Pull indicator */}
      <div
        style={{
          position: 'absolute',
          top: -40,
          left: 0,
          right: 0,
          height: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `translateY(${pullDistance}px)`,
          transition: pullDistance === 0 ? 'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)' : 'none',
          opacity: progress,
          zIndex: 5,
        }}
      >
        {refreshing ? (
          <div className="spinner" style={{ width: 24, height: 24, borderWidth: 2 }} />
        ) : (
          <i
            className="fa-solid fa-arrow-down"
            style={{
              color: 'var(--primary-dark)',
              fontSize: '1rem',
              transform: `rotate(${rotation}deg)`,
              transition: pullDistance === 0 ? 'transform 0.3s ease' : 'none',
            }}
          />
        )}
      </div>

      {/* Content */}
      <div
        style={{
          transform: pullDistance > 0 ? `translateY(${pullDistance}px)` : 'translateY(0)',
          transition: pullDistance === 0 ? 'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)' : 'none',
        }}
      >
        {children}
      </div>
    </div>
  );
}

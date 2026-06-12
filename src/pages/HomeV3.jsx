import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useMobileHeaderActions } from '../contexts/MobileHeaderContext';
import ImageGrid from '../components/ImageGrid';
import RichContent from '../components/RichContent';
import OfficialBadge from '../components/OfficialBadge';
import BetaBadge from '../components/BetaBadge';
import { forumAPI, followsAPI } from '../api';

const TABS = [
  { key: 'recommend', label: '为你推荐' },
  { key: 'following', label: '正在关注' },
];

const PAGE_SIZE = 15;

function timeAgo(dateStr) {
  const now = Date.now();
  const d = new Date(dateStr + (dateStr.endsWith('Z') ? '' : 'Z'));
  const diff = (now - d.getTime()) / 1000;
  if (diff < 60) return '刚刚';
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}小时`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}天`;
  return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
}

// ── X-style SVG icons ──
const Icons = {
  home: (active) => (
    <svg viewBox="0 0 24 24" style={{ width: 26, height: 26 }}>
      <g>
        <path fill="currentColor" d={active
          ? "M10.059 2.593c1.175-.784 2.707-.784 3.882 0l6.5 4.333C21.415 7.575 22 8.668 22 9.838V18.5c0 1.933-1.567 3.5-3.5 3.5h-4.25v-5.25c0-1.243-1.007-2.25-2.25-2.25s-2.25 1.007-2.25 2.25V22H5.5C3.567 22 2 20.433 2 18.5V9.838c0-1.17.585-2.263 1.559-2.912l6.5-4.333z"
          : "M10.059 2.593c1.175-.784 2.707-.784 3.882 0l6.5 4.333C21.415 7.575 22 8.668 22 9.838V18.5c0 1.933-1.567 3.5-3.5 3.5h-4.25v-5.25c0-1.243-1.007-2.25-2.25-2.25s-2.25 1.007-2.25 2.25V22H5.5C3.567 22 2 20.433 2 18.5V9.838c0-1.17.585-2.263 1.559-2.912l6.5-4.333zM12 4.47l-7.5 5V18.5c0 .827.673 1.5 1.5 1.5h3.25v-5.25c0-1.795 1.455-3.25 3.25-3.25s3.25 1.455 3.25 3.25V20H19.5c.827 0 1.5-.673 1.5-1.5V9.47l-7.5-5z"
        } />
      </g>
    </svg>
  ),
  search: () => (
    <svg viewBox="0 0 24 24" style={{ width: 26, height: 26 }}>
      <g><path fill="currentColor" d="M10.25 3.75c-3.59 0-6.5 2.91-6.5 6.5s2.91 6.5 6.5 6.5c1.795 0 3.419-.726 4.596-1.904 1.178-1.177 1.904-2.801 1.904-4.596 0-3.59-2.91-6.5-6.5-6.5zm-8.5 6.5c0-4.694 3.806-8.5 8.5-8.5s8.5 3.806 8.5 8.5c0 1.986-.682 3.815-1.824 5.262l4.781 4.781-1.414 1.414-4.781-4.781c-1.447 1.142-3.276 1.824-5.262 1.824-4.694 0-8.5-3.806-8.5-8.5z" /></g>
    </svg>
  ),
  grok: () => (
    <svg viewBox="0 0 33 32" style={{ width: 26, height: 26 }}>
      <g><path fill="currentColor" d="M12.745 20.54l10.97-8.19c.539-.4 1.307-.244 1.564.38 1.349 3.288.746 7.241-1.938 9.955-2.683 2.714-6.417 3.31-9.83 1.954l-3.728 1.745c5.347 3.697 11.84 2.782 15.898-1.324 3.219-3.255 4.216-7.692 3.284-11.693l.008.009c-1.351-5.878.332-8.227 3.782-13.031L33 0l-4.54 4.59v-.014L12.743 20.544m-2.263 1.987c-3.837-3.707-3.175-9.446.1-12.755 2.42-2.449 6.388-3.448 9.852-1.979l3.72-1.737c-.67-.49-1.53-1.017-2.515-1.387-4.455-1.854-9.789-.931-13.41 2.728-3.483 3.523-4.579 8.94-2.697 13.561 1.405 3.454-.899 5.898-3.22 8.364C1.49 30.2.666 31.074 0 32l10.478-9.466" /></g>
    </svg>
  ),
  notifications: () => (
    <svg viewBox="0 0 24 24" style={{ width: 26, height: 26 }}>
      <g><path fill="currentColor" d="M19.993 9.042C19.48 5.017 16.054 2 11.996 2s-7.49 3.021-7.999 7.051L2.866 18H7.1c.463 2.282 2.481 4 4.9 4s4.437-1.718 4.9-4h4.236l-1.143-8.958zM12 20c-1.306 0-2.417-.835-2.829-2h5.658c-.412 1.165-1.523 2-2.829 2zm-6.866-4l.847-6.698C6.364 6.272 8.941 4 11.996 4s5.627 2.268 6.013 5.295L18.864 16H5.134z" /></g>
    </svg>
  ),
  messages: () => (
    <svg viewBox="0 0 24 24" style={{ width: 26, height: 26 }}>
      <g><path fill="currentColor" d="M20.7 11.7c0-4.48-3.844-8.2-8.699-8.2-4.854 0-8.698 3.72-8.698 8.2v.015l-.001.014c-.02.667.09 1.225.25 1.767.083.28.176.545.276.839.098.285.202.595.288.918.177.663.284 1.401.156 2.271-.086.582-.274 1.191-.582 1.855 1.264.375 2.55.053 4.013-.599l.455-.203.437.242c1.07.594 1.917 1.08 3.406 1.08 4.855 0 8.7-3.72 8.7-8.199zm2 0c0 5.683-4.84 10.2-10.699 10.2-1.784 0-2.96-.555-3.95-1.095-1.876.768-4.02 1.2-6.245-.075l-.885-.505.524-.875c.54-.904.77-1.581.848-2.118.078-.526.02-.98-.11-1.463-.066-.25-.15-.502-.247-.788-.095-.277-.204-.59-.301-.92-.199-.674-.36-1.449-.332-2.39C1.322 6.002 6.154 1.5 12.002 1.5c5.859 0 10.7 4.518 10.7 10.2z" /></g>
    </svg>
  ),
  reply: () => (
    <svg viewBox="0 0 24 24" style={{ width: 18.75, height: 18.75 }}>
      <g><path fill="currentColor" d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.25-.893 4.303-2.394 5.78l-5.06 4.93c-.208.204-.467.32-.741.32-.275 0-.534-.116-.742-.32l-5.06-4.93C3.17 14.433 1.751 12.38 1.751 10zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 1.6 6.14 6.283 6.747 6.756l.015.014c.208.204.467.32.741.32.275 0 .534-.116.742-.32l.015-.014c.607-.473 6.747-5.156 6.747-6.756 0-3.39-2.628-6.13-5.967-6.13H9.756z" /></g>
    </svg>
  ),
  repost: () => (
    <svg viewBox="0 0 24 24" style={{ width: 18.75, height: 18.75 }}>
      <g><path fill="currentColor" d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z" /></g>
    </svg>
  ),
  like: (active) => (
    <svg viewBox="0 0 24 24" style={{ width: 18.75, height: 18.75 }}>
      <g>
        {active ? (
          <path fill="currentColor" d="M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.45-4.92-.334-6.8C3.905 4.56 5.7 3.72 7.61 3.72c1.82 0 3.46.71 4.39 1.88.93-1.17 2.57-1.88 4.39-1.88 1.91 0 3.7.84 4.82 2.67 1.12 1.88 1.03 4.3-.326 6.8z" />
        ) : (
          <path fill="currentColor" d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.806 1.12-.807-1.12C10.07 6.01 8.614 5.44 7.392 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.13 6.61 3.874-2.34 6.055-4.64 7.13-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.45-4.92-.334-6.8C3.905 4.56 5.7 3.72 7.61 3.72c1.82 0 3.46.71 4.39 1.88.93-1.17 2.57-1.88 4.39-1.88 1.91 0 3.7.84 4.82 2.67 1.12 1.88 1.03 4.3-.326 6.8z" />
        )}
      </g>
    </svg>
  ),
  views: () => (
    <svg viewBox="0 0 24 24" style={{ width: 18.75, height: 18.75 }}>
      <g><path fill="currentColor" d="M8.75 21V3h2v18h-2zM18.75 21V8.5h2V21h-2zM13.75 21v-9h2v9h-2zM3.75 21v-4h2v4h-2z" /></g>
    </svg>
  ),
  share: () => (
    <svg viewBox="0 0 24 24" style={{ width: 18.75, height: 18.75 }}>
      <g><path fill="currentColor" d="M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41l-3.3 3.3-1.41-1.42L12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.12 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z" /></g>
    </svg>
  ),
  compose: () => (
    <svg viewBox="0 0 24 24" style={{ width: 24, height: 24 }}>
      <g>
        <path fill="currentColor" d="M10.938 4.5H9.9c-1.136 0-1.929 0-2.546.05-.605.05-.953.143-1.216.277-.564.288-1.023.747-1.31 1.31-.135.264-.228.612-.277 1.218C4.5 7.97 4.5 8.765 4.5 9.9v4.2c0 1.136 0 1.929.05 2.546.05.605.143.953.277 1.216.288.565.747 1.023 1.31 1.31.264.135.612.228 1.217.277.617.05 1.41.051 2.546.051h4.2c1.136 0 1.929 0 2.545-.05.606-.05.954-.143 1.217-.277.565-.288 1.023-.746 1.31-1.31.135-.264.228-.612.277-1.217.05-.617.051-1.41.051-2.546v-1.037h2V14.1c0 1.103.001 1.992-.058 2.709-.06.728-.185 1.368-.487 1.96-.48.941-1.245 1.707-2.185 2.186-.593.302-1.233.428-1.961.488-.718.058-1.606.057-2.71.057H9.9c-1.103 0-1.991.001-2.709-.058-.728-.06-1.368-.185-1.96-.487-.941-.48-1.707-1.245-2.186-2.185-.302-.593-.428-1.233-.487-1.961-.059-.718-.058-1.606-.058-2.71V9.9c0-1.103-.001-1.991.058-2.709.06-.728.185-1.368.487-1.96.48-.941 1.245-1.707 2.185-2.186.593-.302 1.233-.428 1.961-.487.718-.059 1.606-.058 2.71-.058h1.037v2z" />
        <path fillRule="evenodd" clipRule="evenodd" fill="currentColor" d="M16.293 3.293c1.219-1.219 3.195-1.219 4.414 0 1.219 1.219 1.219 3.195 0 4.414l-5.491 5.491c-.533.533-.89.896-1.31 1.179-.356.24-.742.433-1.148.574-.478.167-.983.234-1.729.341l-2.708.387.387-2.708c.107-.746.174-1.25.34-1.729.142-.405.335-.792.575-1.148.283-.42.646-.777 1.179-1.31l5.491-5.491zm3 1.414c-.438-.438-1.148-.438-1.586 0l-5.491 5.491c-.587.587-.784.79-.934 1.013-.144.214-.26.445-.345.688-.088.254-.131.533-.248 1.354l-.01.067.068-.008c.82-.118 1.1-.161 1.354-.25.243-.084.474-.2.688-.344.223-.15.426-.347 1.013-.934l5.491-5.491c.438-.438.438-1.148 0-1.586z" />
      </g>
    </svg>
  ),
};

export default function HomeV3() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [tab, setTab] = useState('recommend');
  const [page, setPage] = useState(1);
  const [followMap, setFollowMap] = useState({});
  const likingRef = useRef(new Set());

  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const { setHeaderVisible } = useMobileHeaderActions();

  useEffect(() => { setHeaderVisible(false); return () => setHeaderVisible(true); }, []);

  const loadPosts = useCallback(async (p = 1, append = false) => {
    try {
      if (p === 1) setLoading(true);
      else setLoadingMore(true);
      const data = await forumAPI.feed({ page: p, limit: PAGE_SIZE });
      const newPosts = data.posts || [];
      if (append) setPosts(prev => [...prev, ...newPosts]);
      else setPosts(newPosts);
      setHasMore(newPosts.length >= PAGE_SIZE);
      setPage(p);
    } catch (e) { toast.error(e.message); }
    finally { setLoading(false); setLoadingMore(false); }
  }, [toast]);

  useEffect(() => { loadPosts(1); }, []);

  useEffect(() => {
    if (!user || posts.length === 0) return;
    const uids = [...new Set(posts.map(p => p.user?.id).filter(Boolean))];
    Promise.all(uids.map(id => followsAPI.status(id).then(s => [id, s.following])))
      .then(entries => setFollowMap(Object.fromEntries(entries))).catch(() => {});
  }, [user, posts]);

  const handleLike = async (post) => {
    if (!user) { navigate('/login'); return; }
    if (likingRef.current.has(post.id)) return;
    likingRef.current.add(post.id);
    try {
      const res = await forumAPI.like({ target_type: 'post', target_id: post.id });
      setPosts(prev => prev.map(p => p.id === post.id ? { ...p, has_liked: res.liked, like_count: p.like_count + (res.liked ? 1 : -1) } : p));
    } catch (e) { toast.error(e.message); }
    finally { likingRef.current.delete(post.id); }
  };

  const handleFollow = async (userId) => {
    if (!user) { navigate('/login'); return; }
    try {
      if (followMap[userId]) {
        await followsAPI.unfollow(userId);
        setFollowMap(prev => ({ ...prev, [userId]: false }));
      } else {
        await followsAPI.follow(userId);
        setFollowMap(prev => ({ ...prev, [userId]: true }));
      }
    } catch (e) { toast.error(e.message); }
  };

  return (
    <div className="homev3-page" style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      {/* ═══════════ Top Nav Bar ═══════════ */}
      {/* X: height 53px, sticky, border-bottom 1px rgb(47,51,54) */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'var(--bg)',
        borderBottom: '1px solid var(--border)',
        height: 53,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px',
      }}>
        {/* Left: avatar button — X: 32x32 circle */}
        <Link to="/profile" style={{
          width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {user?.avatar ? (
            <img src={user.avatar} alt="" style={{ width: 32, height: 32, objectFit: 'cover' }} />
          ) : (
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary-light), var(--accent))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--primary-dark)', fontSize: 14, fontWeight: 700,
            }}>
              {user?.username?.[0]?.toUpperCase() || '?'}
            </div>
          )}
        </Link>

        {/* Center: X logo — house icon */}
        <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
          {Icons.home(false)}
        </div>

        {/* Right: subscribe button placeholder */}
        <div style={{ width: 32 }} />
      </div>

      {/* ═══════════ Tab Bar ═══════════ */}
      {/* X: height 53px, sticky below top nav, border-bottom */}
      <div style={{
        display: 'flex',
        background: 'var(--bg)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 53, zIndex: 99,
      }}>
        {TABS.map(t => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); loadPosts(1); }}
              style={{
                flex: 1, height: 53,
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 15, fontWeight: active ? 700 : 500,
                color: active ? 'var(--text)' : 'var(--text-muted)',
                position: 'relative',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {t.label}
              {/* Active indicator — X: 56px wide, 4px tall, blue, rounded, bottom center */}
              {active && (
                <div style={{
                  position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
                  width: 56, height: 4, borderRadius: 2,
                  background: 'rgb(29, 155, 240)',
                }} />
              )}
            </button>
          );
        })}
      </div>

      {/* ═══════════ Feed ═══════════ */}
      {loading ? (
        <div style={{ padding: '40px 0', textAlign: 'center' }}>
          <div className="spinner" />
        </div>
      ) : posts.length === 0 ? (
        <div style={{ padding: '60px 24px', textAlign: 'center' }}>
          <p style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', margin: '0 0 4px' }}>暂无内容</p>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', margin: 0 }}>关注一些用户或浏览推荐内容</p>
        </div>
      ) : (
        <div>
          {posts.map((post) => (
            <article
              key={post.id}
              onClick={() => navigate(`/forum/${post.id}`)}
              style={{
                padding: '12px 16px 0',
                borderBottom: '1px solid var(--border)',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', gap: 12 }}>
                {/* ── Avatar ── */}
                {/* X: 40x40 circle */}
                <Link to={`/user/${post.user?.id}`} onClick={e => e.stopPropagation()} style={{ flexShrink: 0 }}>
                  {post.user?.avatar ? (
                    <img src={post.user.avatar} alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--primary-light), var(--accent))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--primary-dark)', fontSize: 16, fontWeight: 700,
                    }}>
                      {post.user?.username?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                </Link>

                {/* ── Content ── */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Header: displayName @handle · time */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {post.user?.username || '匿名'}
                    </span>
                    {post.user?.role === 'admin' && <OfficialBadge />}
                    {post.user?.is_beta_user && <BetaBadge size="sm" />}
                    <span style={{ fontSize: 15, color: 'var(--text-muted)' }}>·</span>
                    <span style={{ fontSize: 15, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {timeAgo(post.created_at)}
                    </span>
                    {/* Follow button — X: pill, right-aligned */}
                    {user && post.user?.id !== user.id && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleFollow(post.user.id); }}
                        style={{
                          marginLeft: 'auto', padding: '2px 16px', borderRadius: 9999,
                          fontSize: 14, fontWeight: 700, lineHeight: '20px',
                          background: followMap[post.user.id] ? 'transparent' : 'var(--text)',
                          color: followMap[post.user.id] ? 'var(--primary)' : 'var(--bg)',
                          border: followMap[post.user.id] ? '1px solid var(--border)' : '1px solid transparent',
                          cursor: 'pointer', flexShrink: 0,
                        }}
                      >
                        {followMap[post.user.id] ? '正在关注' : '关注'}
                      </button>
                    )}
                  </div>

                  {/* Text */}
                  <div style={{ fontSize: 15, lineHeight: '20px', color: 'var(--text)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    <RichContent text={post.content || ''} />
                  </div>

                  {/* Images */}
                  {post.images?.length > 0 && (
                    <div style={{ marginTop: 12, borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border)' }}>
                      <ImageGrid images={post.images.map(i => i.image_url || i)} />
                    </div>
                  )}

                  {/* ── Action Bar ── */}
                  {/* X: 4 items evenly spaced, ~425px max-width */}
                  <div style={{
                    display: 'flex', alignItems: 'center',
                    maxWidth: 425, justifyContent: 'space-between',
                    margin: '4px 0', padding: '0 0 4px',
                  }}>
                    {/* Reply */}
                    <Link
                      to={`/forum/${post.id}`}
                      onClick={e => e.stopPropagation()}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        color: 'var(--text-muted)', textDecoration: 'none', fontSize: 13,
                        padding: 8, marginLeft: -8, borderRadius: 9999,
                      }}
                    >
                      {Icons.reply()}
                      <span>{post.comment_count || ''}</span>
                    </Link>

                    {/* Repost */}
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/create-post?repost=${post.id}`); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer',
                        fontSize: 13, padding: 8, borderRadius: 9999,
                      }}
                    >
                      {Icons.repost()}
                      <span>{post.repost_count || ''}</span>
                    </button>

                    {/* Like */}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleLike(post); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        color: post.has_liked ? 'rgb(249, 24, 128)' : 'var(--text-muted)',
                        background: 'none', border: 'none', cursor: 'pointer',
                        fontSize: 13, padding: 8, borderRadius: 9999,
                      }}
                    >
                      {Icons.like(post.has_liked)}
                      <span>{post.like_count || ''}</span>
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}

          {/* Load more */}
          {hasMore && (
            <div style={{ padding: '16px 0', textAlign: 'center' }}>
              <button
                onClick={() => loadPosts(page + 1, true)}
                disabled={loadingMore}
                style={{
                  padding: '12px 32px', borderRadius: 9999,
                  background: 'rgb(29, 155, 240)', border: 'none',
                  fontSize: 15, fontWeight: 700, color: '#fff', cursor: 'pointer',
                }}
              >
                {loadingMore ? '加载中...' : '加载更多'}
              </button>
            </div>
          )}
          {!hasMore && posts.length > 0 && (
            <div style={{ padding: 24, textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
              — 没有更多了 —
            </div>
          )}
        </div>
      )}

      {/* ═══════════ Floating Compose Button ═══════════ */}
      {/* X: 56px circle, blue bg, bottom-right, above nav bar */}
      {user && (
        <Link
          to="/create-post"
          style={{
            position: 'fixed',
            bottom: 'calc(53px + 16px + env(safe-area-inset-bottom, 0px))',
            right: 16,
            width: 56, height: 56, borderRadius: '50%',
            background: 'rgb(29, 155, 240)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            textDecoration: 'none', zIndex: 50,
          }}
        >
          {Icons.compose()}
        </Link>
      )}
    </div>
  );
}

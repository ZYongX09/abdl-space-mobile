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
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      {/* ── Top Nav Bar ── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'var(--bg)', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', height: 53,
      }}>
        {/* Left: avatar */}
        <Link to="/profile" style={{ width: 32, height: 32, flexShrink: 0 }}>
          {user?.avatar ? (
            <img src={user.avatar} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
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

        {/* Center: logo */}
        <svg viewBox="0 0 24 24" aria-hidden="true" style={{ width: 28, height: 28, color: 'var(--text)', flexShrink: 0 }}>
          <g>
            <path fill="currentColor" d="M10.059 2.593c1.175-.784 2.707-.784 3.882 0l6.5 4.333C21.415 7.575 22 8.668 22 9.838V18.5c0 1.933-1.567 3.5-3.5 3.5h-4.25v-5.25c0-1.243-1.007-2.25-2.25-2.25s-2.25 1.007-2.25 2.25V22H5.5C3.567 22 2 20.433 2 18.5V9.838c0-1.17.585-2.263 1.559-2.912l6.5-4.333z" />
          </g>
        </svg>

        {/* Right: placeholder for symmetry */}
        <div style={{ width: 32 }} />
      </div>

      {/* ── Tab Bar ── */}
      <div style={{
        display: 'flex', background: 'var(--bg)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 53, zIndex: 99,
      }}>
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); loadPosts(1); }}
            style={{
              flex: 1, padding: '16px 0', background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 15, fontWeight: tab === t.key ? 700 : 400,
              color: tab === t.key ? 'var(--text)' : 'var(--text-muted)',
              position: 'relative', transition: 'color 0.2s',
            }}
          >
            {t.label}
            {tab === t.key && (
              <div style={{
                position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
                width: 56, height: 4, borderRadius: 2, background: 'var(--primary)',
              }} />
            )}
          </button>
        ))}
      </div>

      {/* ── Feed ── */}
      {loading ? (
        <div style={{ padding: '40px 0', textAlign: 'center' }}>
          <div className="spinner" />
        </div>
      ) : posts.length === 0 ? (
        <div style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <i className="fa-solid fa-inbox" style={{ fontSize: 48, marginBottom: 16, display: 'block', opacity: 0.3 }} />
          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', margin: '0 0 6px' }}>暂无内容</p>
          <p style={{ fontSize: 13, margin: 0 }}>关注一些用户或浏览推荐内容</p>
        </div>
      ) : (
        <div>
          {posts.map((post) => (
            <article
              key={post.id}
              onClick={() => navigate(`/forum/${post.id}`)}
              style={{
                padding: '12px 16px',
                borderBottom: '1px solid var(--border)',
                cursor: 'pointer', transition: 'background 0.15s',
              }}
            >
              {/* ── Repost indicator ── */}
              {post.repost && (
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8, paddingLeft: 48 }}>
                  <i className="fa-solid fa-repeat" style={{ marginRight: 6 }} />
                  转发了
                </div>
              )}

              <div style={{ display: 'flex', gap: 12 }}>
                {/* ── Avatar ── */}
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
                  {/* Header row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {post.user?.username || '匿名'}
                    </span>
                    {post.user?.role === 'admin' && <OfficialBadge />}
                    {post.user?.is_beta_user && <BetaBadge size="sm" />}
                    <span style={{ fontSize: 15, color: 'var(--text-muted)', marginLeft: 4 }}>
                      @{post.user?.username || 'anon'}
                    </span>
                    <span style={{ fontSize: 15, color: 'var(--text-muted)' }}>·</span>
                    <span style={{ fontSize: 15, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {timeAgo(post.created_at)}
                    </span>
                    {/* Follow button */}
                    {user && post.user?.id !== user.id && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleFollow(post.user.id); }}
                        style={{
                          marginLeft: 'auto', padding: '4px 16px', borderRadius: 9999,
                          fontSize: 14, fontWeight: 700,
                          background: followMap[post.user.id] ? 'transparent' : 'var(--text)',
                          color: followMap[post.user.id] ? 'var(--primary)' : 'var(--bg)',
                          border: followMap[post.user.id] ? '1px solid var(--border)' : 'none',
                          cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s',
                        }}
                      >
                        {followMap[post.user.id] ? '正在关注' : '关注'}
                      </button>
                    )}
                  </div>

                  {/* Text content */}
                  <div style={{ fontSize: 15, lineHeight: '20px', color: 'var(--text)', marginBottom: 8, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    <RichContent content={post.content || ''} />
                  </div>

                  {/* Images */}
                  {post.images?.length > 0 && (
                    <div style={{ marginBottom: 12, borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border)' }}>
                      <ImageGrid images={post.images.map(i => i.image_url || i)} />
                    </div>
                  )}

                  {/* Repost card */}
                  {post.repost && (
                    <div
                      onClick={(e) => { e.stopPropagation(); navigate(`/forum/${post.repost.id}`); }}
                      style={{
                        padding: 12, marginBottom: 12, borderRadius: 16,
                        border: '1px solid var(--border)', cursor: 'pointer',
                      }}
                    >
                      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
                        @{post.repost.user?.username || '匿名'}
                      </div>
                      <div style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                        {post.repost.content?.slice(0, 140)}
                      </div>
                    </div>
                  )}

                  {/* ── Action Bar ── */}
                  <div style={{ display: 'flex', alignItems: 'center', maxWidth: 425, justifyContent: 'space-between' }}>
                    {/* Reply */}
                    <Link
                      to={`/forum/${post.id}`}
                      onClick={e => e.stopPropagation()}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        color: 'var(--text-muted)', textDecoration: 'none', fontSize: 13,
                        padding: 8, marginLeft: -8, borderRadius: 9999, transition: 'color 0.2s',
                      }}
                    >
                      <svg viewBox="0 0 24 24" style={{ width: 18, height: 18 }}><g><path fill="currentColor" d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.25-.893 4.303-2.394 5.78l-5.06 4.93c-.208.204-.467.32-.741.32-.275 0-.534-.116-.742-.32l-5.06-4.93C3.17 14.433 1.751 12.38 1.751 10zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 1.6 6.14 6.283 6.747 6.756l.015.014c.208.204.467.32.741.32.275 0 .534-.116.742-.32l.015-.014c.607-.473 6.747-5.156 6.747-6.756 0-3.39-2.628-6.13-5.967-6.13H9.756z" /></g></svg>
                      <span>{post.comment_count || ''}</span>
                    </Link>

                    {/* Repost */}
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/create-post?repost=${post.id}`); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer',
                        fontSize: 13, padding: 8, borderRadius: 9999, transition: 'color 0.2s',
                      }}
                    >
                      <svg viewBox="0 0 24 24" style={{ width: 18, height: 18 }}><g><path fill="currentColor" d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z" /></g></svg>
                      <span>{post.repost_count || ''}</span>
                    </button>

                    {/* Like */}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleLike(post); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        color: post.has_liked ? 'var(--accent)' : 'var(--text-muted)',
                        background: 'none', border: 'none', cursor: 'pointer',
                        fontSize: 13, padding: 8, borderRadius: 9999, transition: 'color 0.2s',
                      }}
                    >
                      <svg viewBox="0 0 24 24" style={{ width: 18, height: 18 }}><g>
                        {post.has_liked ? (
                          <path fill="currentColor" d="M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.45-4.92-.334-6.8C3.905 4.56 5.7 3.72 7.61 3.72c1.82 0 3.46.71 4.39 1.88.93-1.17 2.57-1.88 4.39-1.88 1.91 0 3.7.84 4.82 2.67 1.12 1.88 1.03 4.3-.326 6.8z" />
                        ) : (
                          <path fill="currentColor" d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.806 1.12-.807-1.12C10.07 6.01 8.614 5.44 7.392 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.13 6.61 3.874-2.34 6.055-4.64 7.13-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.45-4.92-.334-6.8C3.905 4.56 5.7 3.72 7.61 3.72c1.82 0 3.46.71 4.39 1.88.93-1.17 2.57-1.88 4.39-1.88 1.91 0 3.7.84 4.82 2.67 1.12 1.88 1.03 4.3-.326 6.8z" />
                        )}
                      </g></svg>
                      <span>{post.like_count || ''}</span>
                    </button>

                    {/* Share / Bookmark */}
                    <button
                      onClick={(e) => { e.stopPropagation(); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer',
                        fontSize: 13, padding: 8, borderRadius: 9999, transition: 'color 0.2s',
                      }}
                    >
                      <svg viewBox="0 0 24 24" style={{ width: 18, height: 18 }}><g><path fill="currentColor" d="M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41l-3.3 3.3-1.41-1.42L12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.12 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z" /></g></svg>
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
                  background: 'var(--primary)', border: 'none',
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

      {/* ── Floating Compose Button ── */}
      {user && (
        <Link
          to="/create-post"
          style={{
            position: 'fixed',
            bottom: 'calc(70px + env(safe-area-inset-bottom, 0px))',
            right: 16,
            width: 56, height: 56, borderRadius: '50%',
            background: 'var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            textDecoration: 'none', zIndex: 50,
          }}
        >
          <svg viewBox="0 0 24 24" style={{ width: 24, height: 24, color: '#fff' }}>
            <g>
              <path fill="currentColor" d="M10.938 4.5H9.9c-1.136 0-1.929 0-2.546.05-.605.05-.953.143-1.216.277-.564.288-1.023.747-1.31 1.31-.135.264-.228.612-.277 1.218C4.5 7.97 4.5 8.765 4.5 9.9v4.2c0 1.136 0 1.929.05 2.546.05.605.143.953.277 1.216.288.565.747 1.023 1.31 1.31.264.135.612.228 1.217.277.617.05 1.41.051 2.546.051h4.2c1.136 0 1.929 0 2.545-.05.606-.05.954-.143 1.217-.277.565-.288 1.023-.746 1.31-1.31.135-.264.228-.612.277-1.217.05-.617.051-1.41.051-2.546v-1.037h2V14.1c0 1.103.001 1.992-.058 2.709-.06.728-.185 1.368-.487 1.96-.48.941-1.245 1.707-2.185 2.186-.593.302-1.233.428-1.961.488-.718.058-1.606.057-2.71.057H9.9c-1.103 0-1.991.001-2.709-.058-.728-.06-1.368-.185-1.96-.487-.941-.48-1.707-1.245-2.186-2.185-.302-.593-.428-1.233-.487-1.961-.059-.718-.058-1.606-.058-2.71V9.9c0-1.103-.001-1.991.058-2.709.06-.728.185-1.368.487-1.96.48-.941 1.245-1.707 2.185-2.186.593-.302 1.233-.428 1.961-.487.718-.059 1.606-.058 2.71-.058h1.037v2z" />
              <path fillRule="evenodd" clipRule="evenodd" fill="currentColor" d="M16.293 3.293c1.219-1.219 3.195-1.219 4.414 0 1.219 1.219 1.219 3.195 0 4.414l-5.491 5.491c-.533.533-.89.896-1.31 1.179-.356.24-.742.433-1.148.574-.478.167-.983.234-1.729.341l-2.708.387.387-2.708c.107-.746.174-1.25.34-1.729.142-.405.335-.792.575-1.148.283-.42.646-.777 1.179-1.31l5.491-5.491zm3 1.414c-.438-.438-1.148-.438-1.586 0l-5.491 5.491c-.587.587-.784.79-.934 1.013-.144.214-.26.445-.345.688-.088.254-.131.533-.248 1.354l-.01.067.068-.008c.82-.118 1.1-.161 1.354-.25.243-.084.474-.2.688-.344.223-.15.426-.347 1.013-.934l5.491-5.491c.438-.438.438-1.148 0-1.586z" />
            </g>
          </svg>
        </Link>
      )}
    </div>
  );
}

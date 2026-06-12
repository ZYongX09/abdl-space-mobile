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
  { key: 'recommend', label: '推荐', icon: 'fa-fire' },
  { key: 'following', label: '关注', icon: 'fa-user-group' },
  { key: 'hot', label: '热榜', icon: 'fa-arrow-trend-up' },
  { key: 'diapers', label: '纸尿裤', icon: 'fa-baby' },
];

const PAGE_SIZE = 15;

function timeAgo(dateStr) {
  const now = Date.now();
  const d = new Date(dateStr + (dateStr.endsWith('Z') ? '' : 'Z'));
  const diff = (now - d.getTime()) / 1000;
  if (diff < 60) return '刚刚';
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}天前`;
  return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
}

export default function HomeV3() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [tab, setTab] = useState('recommend');
  const [page, setPage] = useState(1);
  const [announcement, setAnnouncement] = useState(null);
  const [followMap, setFollowMap] = useState({});
  const likingRef = useRef(new Set());

  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const { setHeaderVisible } = useMobileHeaderActions();

  // 隐藏默认 header（自己实现顶部栏）
  useEffect(() => { setHeaderVisible(false); return () => setHeaderVisible(true); }, []);

  // 加载帖子
  const loadPosts = useCallback(async (p = 1, append = false) => {
    try {
      if (p === 1) setLoading(true);
      else setLoadingMore(true);

      const data = await forumAPI.feed({ page: p, limit: PAGE_SIZE });
      const newPosts = data.posts || [];

      if (append) {
        setPosts(prev => [...prev, ...newPosts]);
      } else {
        setPosts(newPosts);
      }
      setHasMore(newPosts.length >= PAGE_SIZE);
      setPage(p);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [toast]);

  // 初始加载
  useEffect(() => { loadPosts(1); }, []);

  // 加载公告
  useEffect(() => {
    forumAPI.latestAnnouncement().then(d => setAnnouncement(d.announcement)).catch(() => {});
  }, []);

  // 关注状态
  useEffect(() => {
    if (!user || posts.length === 0) return;
    const uids = [...new Set(posts.map(p => p.user?.id).filter(Boolean))];
    Promise.all(uids.map(id => followsAPI.status(id).then(s => [id, s.following]))).then(entries => {
      setFollowMap(Object.fromEntries(entries));
    }).catch(() => {});
  }, [user, posts]);

  // 点赞
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

  // 关注
  const handleFollow = async (userId) => {
    if (!user) { navigate('/login'); return; }
    try {
      const isFollowing = followMap[userId];
      if (isFollowing) {
        await followsAPI.unfollow(userId);
        setFollowMap(prev => ({ ...prev, [userId]: false }));
        toast.success('已取消关注');
      } else {
        await followsAPI.follow(userId);
        setFollowMap(prev => ({ ...prev, [userId]: true }));
        toast.success('已关注');
      }
    } catch (e) { toast.error(e.message); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* 顶部搜索栏 */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'var(--bg)',
        borderBottom: '1px solid var(--border)',
        padding: '8px 12px',
        display: 'flex', alignItems: 'center', gap: '10px',
      }}>
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', gap: '8px',
          background: 'var(--input-bg)', borderRadius: '20px', padding: '8px 14px',
        }}>
          <i className="fa-solid fa-magnifying-glass" style={{ color: 'var(--text-muted)', fontSize: '13px' }} />
          <input
            type="text"
            placeholder="搜索帖子、纸尿裤..."
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              fontSize: '14px', color: 'var(--text)',
            }}
            onFocus={() => navigate('/search')}
          />
        </div>
        <Link to="/profile" style={{ flexShrink: 0 }}>
          {user?.avatar ? (
            <img src={user.avatar} alt="" style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary-light), var(--accent))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--primary-dark)', fontSize: '14px', fontWeight: 700,
            }}>
              {user?.username?.[0]?.toUpperCase() || '?'}
            </div>
          )}
        </Link>
      </div>

      {/* Tab 栏 */}
      <div style={{
        display: 'flex', gap: 0,
        background: 'var(--bg)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky', top: '51px', zIndex: 99,
      }}>
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              flex: 1, padding: '10px 0',
              background: 'none', border: 'none',
              fontSize: '14px', fontWeight: tab === t.key ? 700 : 400,
              color: tab === t.key ? 'var(--primary-dark)' : 'var(--text-muted)',
              borderBottom: `2px solid ${tab === t.key ? 'var(--primary)' : 'transparent'}`,
              cursor: 'pointer', transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
            }}
          >
            <i className={`fa-solid ${t.icon}`} style={{ fontSize: '12px' }} />
            {t.label}
          </button>
        ))}
      </div>

      {/* 公告横幅 */}
      {announcement && (
        <div
          onClick={() => navigate(`/forum/${announcement.id}`)}
          style={{
            margin: '10px 12px 0', padding: '10px 14px',
            background: 'linear-gradient(135deg, var(--primary-light), var(--accent-light, rgba(255,183,197,0.15)))',
            border: '1px solid var(--primary)', borderRadius: '10px',
            display: 'flex', alignItems: 'center', gap: '8px',
            cursor: 'pointer',
          }}
        >
          <i className="fa-solid fa-bullhorn" style={{ color: 'var(--primary-dark)', fontSize: '13px', flexShrink: 0 }} />
          <span style={{ fontSize: '13px', color: 'var(--text)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {announcement.content?.slice(0, 50)}
          </span>
          <i className="fa-solid fa-chevron-right" style={{ color: 'var(--text-muted)', fontSize: '11px', flexShrink: 0 }} />
        </div>
      )}

      {/* Feed 列表 */}
      {loading ? (
        <div style={{ padding: '40px 0', textAlign: 'center' }}>
          <div className="spinner" />
        </div>
      ) : posts.length === 0 ? (
        <div style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <i className="fa-solid fa-inbox" style={{ fontSize: '48px', marginBottom: '16px', display: 'block', opacity: 0.3 }} />
          <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', margin: '0 0 6px' }}>暂无内容</p>
          <p style={{ fontSize: '13px', margin: 0 }}>关注一些用户或浏览推荐内容</p>
        </div>
      ) : (
        <div>
          {posts.map((post, idx) => (
            <div key={post.id}>
              {/* 帖子卡片 */}
              <div
                onClick={() => navigate(`/forum/${post.id}`)}
                style={{
                  padding: '14px 14px 10px',
                  borderBottom: '1px solid var(--border)',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
              >
                {/* 用户信息行 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  {/* 头像 */}
                  <Link to={`/user/${post.user?.id}`} onClick={e => e.stopPropagation()} style={{ flexShrink: 0 }}>
                    {post.user?.avatar ? (
                      <img src={post.user.avatar} alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{
                        width: 40, height: 40, borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--primary-light), var(--accent))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--primary-dark)', fontSize: '16px', fontWeight: 700,
                      }}>
                        {post.user?.username?.[0]?.toUpperCase() || '?'}
                      </div>
                    )}
                  </Link>

                  {/* 用户名 + 时间 */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>
                        {post.user?.username || '匿名'}
                      </span>
                      {post.user?.role === 'admin' && <OfficialBadge />}
                      {post.user?.is_beta_user && <BetaBadge size="sm" />}
                    </div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {timeAgo(post.created_at)}
                    </span>
                  </div>

                  {/* 关注按钮 */}
                  {user && post.user?.id !== user.id && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleFollow(post.user.id); }}
                      style={{
                        padding: '5px 14px', borderRadius: '16px', fontSize: '12px', fontWeight: 600,
                        background: followMap[post.user.id] ? 'var(--input-bg)' : 'var(--primary)',
                        color: followMap[post.user.id] ? 'var(--text-muted)' : '#fff',
                        border: followMap[post.user.id] ? '1px solid var(--border)' : 'none',
                        cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s',
                      }}
                    >
                      {followMap[post.user.id] ? '已关注' : '+ 关注'}
                    </button>
                  )}
                </div>

                {/* 内容 */}
                <div style={{ marginBottom: '10px' }}>
                  <RichContent content={post.content || ''} />
                </div>

                {/* 图片 */}
                {post.images?.length > 0 && (
                  <div style={{ marginBottom: '10px' }}>
                    <ImageGrid images={post.images.map(i => i.image_url || i)} />
                  </div>
                )}

                {/* 转发的帖子 */}
                {post.repost && (
                  <div
                    onClick={(e) => { e.stopPropagation(); navigate(`/forum/${post.repost.id}`); }}
                    style={{
                      padding: '10px 12px', marginBottom: '10px',
                      background: 'var(--input-bg)', borderRadius: '10px',
                      border: '1px solid var(--border)', cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>
                      @{post.repost.user?.username || '匿名'}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                      {post.repost.content?.slice(0, 100)}
                    </div>
                  </div>
                )}

                {/* 互动栏 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                  {/* 转发 */}
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/create-post?repost=${post.id}`); }}
                    style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                      padding: '8px 0', background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: '13px', color: 'var(--text-muted)', transition: 'color 0.2s',
                    }}
                  >
                    <i className="fa-solid fa-repeat" style={{ fontSize: '14px' }} />
                    <span>{post.repost_count || ''}</span>
                  </button>

                  {/* 评论 */}
                  <Link
                    to={`/forum/${post.id}`}
                    onClick={e => e.stopPropagation()}
                    style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                      padding: '8px 0', textDecoration: 'none',
                      fontSize: '13px', color: 'var(--text-muted)', transition: 'color 0.2s',
                    }}
                  >
                    <i className="fa-regular fa-comment" style={{ fontSize: '14px' }} />
                    <span>{post.comment_count || ''}</span>
                  </Link>

                  {/* 点赞 */}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleLike(post); }}
                    style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                      padding: '8px 0', background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: '13px', color: post.has_liked ? 'var(--accent)' : 'var(--text-muted)',
                      transition: 'color 0.2s',
                    }}
                  >
                    <i className={post.has_liked ? 'fa-solid fa-heart' : 'fa-regular fa-heart'} style={{ fontSize: '14px' }} />
                    <span>{post.like_count || ''}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* 加载更多 */}
          {hasMore && (
            <div style={{ padding: '16px', textAlign: 'center' }}>
              <button
                onClick={() => loadPosts(page + 1, true)}
                disabled={loadingMore}
                style={{
                  padding: '8px 24px', borderRadius: '20px',
                  background: 'var(--input-bg)', border: '1px solid var(--border)',
                  fontSize: '13px', color: 'var(--text-muted)', cursor: 'pointer',
                }}
              >
                {loadingMore ? '加载中...' : '加载更多'}
              </button>
            </div>
          )}
          {!hasMore && posts.length > 0 && (
            <div style={{ padding: '20px', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
              — 没有更多了 —
            </div>
          )}
        </div>
      )}

      {/* 浮动发帖按钮 */}
      {user && (
        <Link
          to="/create-post"
          style={{
            position: 'fixed', bottom: 'calc(70px + env(safe-area-inset-bottom, 0px))', right: '16px',
            width: 50, height: 50, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary), var(--primary-dark, #6366F1))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
            color: '#fff', fontSize: '20px', textDecoration: 'none',
            zIndex: 50, transition: 'transform 0.2s',
          }}
        >
          <i className="fa-solid fa-plus" />
        </Link>
      )}
    </div>
  );
}

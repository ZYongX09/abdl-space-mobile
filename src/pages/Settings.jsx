import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useNsfw } from '../contexts/NsfwContext';
import { useNotifications } from '../contexts/NotificationContext';

/* ── 入场动画 ── */
function useStagger(total) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);
  return (i) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(24px)',
    transition: `opacity 0.4s cubic-bezier(0.22, 1, 0.36, 1) ${i * 0.06}s, transform 0.4s cubic-bezier(0.22, 1, 0.36, 1) ${i * 0.06}s`,
  });
}

/* ── 开关 ── */
function MiToggle({ value, onChange, disabled }) {
  return (
    <button
      onClick={() => !disabled && onChange(!value)}
      disabled={disabled}
      style={{
        width: 48, height: 28, borderRadius: 14,
        border: 'none', cursor: disabled ? 'default' : 'pointer',
        background: value ? 'var(--primary)' : 'var(--border)',
        position: 'relative', transition: 'background 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        flexShrink: 0, opacity: disabled ? 0.4 : 1,
      }}
    >
      <div style={{
        width: 24, height: 24, borderRadius: '50%',
        background: '#fff', position: 'absolute', top: 2,
        left: value ? 22 : 2,
        transition: 'left 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
      }} />
    </button>
  );
}

/* ── 设置项 ── */
function Item({ icon, label, desc, right, onClick, anim }) {
  const [pressed, setPressed] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseDown={() => onClick && setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '15px 20px',
        cursor: onClick ? 'pointer' : 'default',
        background: pressed ? 'var(--hover-bg, rgba(0,0,0,0.03))' : 'transparent',
        transition: 'background 0.15s, opacity 0.4s, transform 0.4s',
        ...anim,
      }}
    >
      {icon && (
        <i className={icon} style={{
          width: 22, textAlign: 'center', fontSize: 17,
          color: 'var(--primary)', flexShrink: 0,
        }} />
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, color: 'var(--text)', fontWeight: 400 }}>{label}</div>
        {desc && <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 2 }}>{desc}</div>}
      </div>
      {right !== undefined ? right : (
        onClick ? <i className="fa-solid fa-chevron-right" style={{ fontSize: 11, color: 'var(--text-light)' }} /> : null
      )}
    </div>
  );
}

/* ── 分组容器 ── */
function Group({ title, children, anim }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      borderRadius: 14,
      overflow: 'hidden',
      ...anim,
    }}>
      {title && (
        <div style={{
          fontSize: 13, fontWeight: 500, color: 'var(--text-muted)',
          padding: '14px 20px 2px',
        }}>
          {title}
        </div>
      )}
      {children}
    </div>
  );
}

/* ── 分割线 ── */
function Divider() {
  return <div style={{ height: 0.5, background: 'var(--border)', marginLeft: 56 }} />;
}

/* ── 主题选择卡片 ── */
function ThemeCards({ theme, setTheme, autoTheme, colorfulLocked, toast }) {
  const cards = [
    { id: 'light', icon: 'fa-sun', label: '浅色' },
    { id: 'dark', icon: 'fa-moon', label: '深色' },
    { id: 'colorful', icon: 'fa-palette', label: '多彩' },
  ];

  return (
    <div style={{ padding: '14px 20px', position: 'relative' }}>
      <div style={{ display: 'flex', gap: 10 }}>
        {cards.map(c => {
          const active = theme === c.id && !autoTheme;
          const disabled = autoTheme || (c.id === 'colorful' && colorfulLocked);
          return (
            <div
              key={c.id}
              onClick={() => {
                if (c.id === 'colorful' && colorfulLocked) { toast.info('多彩模式下无法自动切换'); return; }
                if (autoTheme) { toast.info('请先关闭自动切换'); return; }
                setTheme(c.id);
              }}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                padding: '16px 0', borderRadius: 12, cursor: disabled ? 'default' : 'pointer',
                border: `1.5px solid ${active ? 'var(--primary)' : 'var(--border)'}`,
                background: active ? 'var(--primary-light, rgba(0,0,0,0.02))' : 'transparent',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                opacity: disabled && !active ? 0.4 : 1,
                transform: active ? 'scale(1.02)' : 'scale(1)',
              }}
            >
              <i className={`fa-solid ${c.icon}`} style={{
                fontSize: 20, color: active ? 'var(--primary)' : 'var(--text-muted)',
                transition: 'color 0.25s',
              }} />
              <span style={{
                fontSize: 13, fontWeight: active ? 600 : 400,
                color: active ? 'var(--primary)' : 'var(--text-muted)',
                transition: 'color 0.25s',
              }}>
                {c.label}
              </span>
              {active && (
                <div style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: 'var(--primary)',
                  animation: 'miui-pop 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
                }} />
              )}
            </div>
          );
        })}
      </div>

      {/* 自动切换蒙层 */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        background: 'var(--bg-card)',
        borderRadius: 12,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
        opacity: autoTheme ? 1 : 0,
        pointerEvents: autoTheme ? 'auto' : 'none',
        transition: 'opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 2,
      }}>
        <i className="fa-solid fa-clock" style={{ fontSize: 18, color: 'var(--primary)' }} />
        <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.5 }}>
          自动切换已开启<br />
          <span style={{ fontSize: 12 }}>关闭后可手动选择主题</span>
        </div>
      </div>
    </div>
  );
}

/* ── 主页面 ── */
export default function SettingsV2() {
  const navigate = useNavigate();
  const { theme, setTheme, autoTheme, toggleAutoTheme, THEMES } = useTheme();
  const { user } = useAuth();
  const toast = useToast();
  const { blurEnabled, toggleBlur } = useNsfw();
  const { pushSupported, pushSubscribed, subscribeToPush, unsubscribeFromPush } = useNotifications();
  const [searchNsfw, setSearchNsfw] = useState(() => {
    try { return localStorage.getItem('abdl_search_nsfw') === 'true'; } catch { return false; }
  });
  const toggleSearchNsfw = () => {
    setSearchNsfw(prev => {
      const next = !prev;
      try { localStorage.setItem('abdl_search_nsfw', String(next)); } catch {}
      return next;
    });
  };
  const [introFullAnim, setIntroFullAnim] = useState(() => {
    try { return localStorage.getItem('abdl_intro_full_anim') !== 'false'; } catch { return true; }
  });
  const toggleIntroFullAnim = () => {
    setIntroFullAnim(prev => {
      const next = !prev;
      try { localStorage.setItem('abdl_intro_full_anim', String(next)); } catch {}
      return next;
    });
  };

  const colorfulLocked = theme === 'colorful';
  const handleToggleAutoTheme = () => {
    if (theme === 'colorful') {
      toast.info('多彩模式不支持自动切换');
      return;
    }
    toggleAutoTheme();
  };

  const stagger = useStagger(10);

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', paddingBottom: 20 }}>
      <style>{`
        @keyframes miui-pop {
          0% { transform: scale(0); opacity: 0; }
          60% { transform: scale(1.3); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>

      {/* ── 用户卡 ── */}
      <div style={{ paddingTop: 12, ...stagger(0) }}>
        <div
          onClick={() => user ? navigate('/account') : navigate('/login')}
          style={{
            background: 'var(--bg-card)',
            borderRadius: 14, overflow: 'hidden',
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '20px' }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: 'var(--primary-light, var(--border))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, fontWeight: 600, color: 'var(--primary)',
              flexShrink: 0, overflow: 'hidden',
            }}>
              {user?.avatar ? (
                <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <i className="fa-solid fa-user" />
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--text)' }}>
                {user?.username || '登录 / 注册'}
              </div>
              {user && (
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 3 }}>
                  {user.role === 'admin' ? '管理员' : '用户'} · ID {user.id}
                </div>
              )}
            </div>
            <i className="fa-solid fa-chevron-right" style={{ fontSize: 12, color: 'var(--text-light)' }} />
          </div>
        </div>
      </div>

      {/* ── 内容与安全 ── */}
      <div style={{ paddingTop: 12 }}>
        <Group title="内容与安全" anim={stagger(1)}>
          <Item
            icon="fa-solid fa-shield-halved"
            label="敏感内容屏蔽"
            desc="敏感图片自动模糊"
            right={<MiToggle value={blurEnabled} onChange={toggleBlur} />}
          />
          <Divider />
          <Item
            icon="fa-solid fa-eye"
            label="搜索包含敏感内容"
            desc="搜索结果显示敏感帖子"
            right={<MiToggle value={searchNsfw} onChange={toggleSearchNsfw} />}
          />
        </Group>
      </div>

      {/* ── 加载动画 ── */}
      <div style={{ paddingTop: 12 }}>
        <Group title="加载动画" anim={stagger(1.5)}>
          <Item
            icon="fa-solid fa-wand-magic-sparkles"
            label="完整展示开场动画"
            desc={introFullAnim ? '每次加载都播放完整动画' : '页面加载完毕后跳过动画'}
            right={<MiToggle value={introFullAnim} onChange={toggleIntroFullAnim} />}
          />
        </Group>
      </div>

      {/* ── 显示 ── */}
      <div style={{ paddingTop: 12 }}>
        <div style={{ background: 'var(--bg-card)', borderRadius: 14, overflow: 'hidden', ...stagger(2) }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', padding: '14px 20px 2px' }}>显示</div>
          <ThemeCards
            theme={theme} setTheme={setTheme}
            autoTheme={autoTheme}
            colorfulLocked={colorfulLocked}
            toast={toast}
          />
          <Divider />
          <Item
            icon="fa-solid fa-clock"
            label="自动切换深浅色"
            desc={theme === 'colorful' ? '多彩模式不支持自动切换' : '19:00 深色 · 7:00 浅色'}
            right={<MiToggle value={autoTheme} onChange={handleToggleAutoTheme} disabled={colorfulLocked} />}
          />
        </div>
      </div>

      {/* ── 账户 ── */}
      {user && (
        <div style={{ paddingTop: 12 }}>
          <Group title="账户" anim={stagger(3)}>
            <Item
              icon="fa-solid fa-user-shield"
              label="账户与隐私"
              desc="个人资料、邮箱、密码"
              onClick={() => navigate('/account')}
            />
          </Group>
        </div>
      )}

      {/* ── 推送通知 ── */}
      {user && (
        <div style={{ paddingTop: 12 }}>
          <Group title="推送通知" anim={stagger(3.5)}>
            <Item
              icon="fa-solid fa-bell"
              label={pushSubscribed ? '推送通知已开启' : '推送通知'}
              desc={
                !pushSupported
                  ? '请先将网站添加到主屏幕以启用推送'
                  : pushSubscribed
                    ? '接收点赞、评论、私信等通知'
                    : '开启后可接收点赞、评论、私信等通知'
              }
              right={
                pushSupported ? (
                  <MiToggle
                    value={pushSubscribed}
                    onChange={async (val) => {
                      if (val) {
                        const ok = await subscribeToPush();
                        if (ok) toast.success('推送通知已开启');
                      } else {
                        const ok = await unsubscribeFromPush();
                        if (ok) toast.info('推送通知已关闭');
                      }
                    }}
                  />
                ) : (
                  <i className="fa-solid fa-circle-info" style={{ color: 'var(--text-muted)', fontSize: 14 }} />
                )
              }
            />
          </Group>
        </div>
      )}

      {/* ── 政策 ── */}
      <div style={{ paddingTop: 12 }}>
        <Group title="政策" anim={stagger(4)}>
          <Item icon="fa-solid fa-file-contract" label="用户协议" onClick={() => navigate('/terms')} />
          <Divider />
          <Item icon="fa-solid fa-lock" label="隐私政策" onClick={() => navigate('/privacy')} />
          <Divider />
          <Item icon="fa-solid fa-cookie" label="Cookie 政策" onClick={() => navigate('/cookies')} />
        </Group>
      </div>

      {/* ── 关于 ── */}
      <div style={{ paddingTop: 12 }}>
        <Group anim={stagger(5)}>
          <Item icon="fa-solid fa-circle-info" label="关于 ABDL Space" onClick={() => navigate('/about')} />
        </Group>
      </div>

      {/* ── 版本 ── */}
      <div style={{
        textAlign: 'center', padding: '28px 0 12px',
        fontSize: 12, color: 'var(--text-light)',
        opacity: stagger(6).opacity,
        transition: stagger(6).transition,
      }}>
        ABDL Space · v2.0
      </div>
    </div>
  );
}

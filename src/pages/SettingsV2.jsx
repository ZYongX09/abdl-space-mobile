import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useNsfw } from '../contexts/NsfwContext';

/* ── 小米 HyperOS 风格开关 ── */
function MiToggle({ value, onChange, disabled }) {
  return (
    <button
      onClick={() => !disabled && onChange(!value)}
      disabled={disabled}
      style={{
        width: 51, height: 31, borderRadius: 16,
        border: 'none', cursor: disabled ? 'default' : 'pointer',
        background: value ? '#4CAF50' : '#E0E0E0',
        position: 'relative', transition: 'background 0.25s ease',
        flexShrink: 0, opacity: disabled ? 0.5 : 1,
      }}
    >
      <div style={{
        width: 27, height: 27, borderRadius: '50%',
        background: '#fff', position: 'absolute', top: 2,
        left: value ? 22 : 2,
        transition: 'left 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.15), 0 1px 2px rgba(0,0,0,0.1)',
      }} />
    </button>
  );
}

/* ── 设置项 ── */
function SettingItem({ icon, iconColor, iconBg, label, desc, right, onClick, border = true }) {
  const Tag = onClick ? 'div' : 'div';
  return (
    <Tag
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '14px 16px',
        cursor: onClick ? 'pointer' : 'default',
        borderBottom: border ? '0.5px solid rgba(0,0,0,0.06)' : 'none',
        transition: 'background 0.15s',
      }}
      onMouseDown={e => { if (onClick) e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; }}
      onMouseUp={e => { e.currentTarget.style.background = 'transparent'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
    >
      {/* 图标 */}
      {icon && (
        <div style={{
          width: 30, height: 30, borderRadius: 8,
          background: iconBg || '#F5F5F5',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <i className={icon} style={{ fontSize: 15, color: iconColor || '#666' }} />
        </div>
      )}
      {/* 文字 */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, color: '#1A1A1A', fontWeight: 400 }}>{label}</div>
        {desc && (
          <div style={{ fontSize: 12, color: '#999', marginTop: 2, lineHeight: 1.4 }}>{desc}</div>
        )}
      </div>
      {/* 右侧 */}
      {right !== undefined ? right : (
        <i className="fa-solid fa-chevron-right" style={{ fontSize: 11, color: '#C0C0C0' }} />
      )}
    </Tag>
  );
}

/* ── 分组卡片 ── */
function SettingGroup({ children, title, style }) {
  return (
    <div style={{ marginBottom: 12 }}>
      {title && (
        <div style={{
          fontSize: 13, fontWeight: 500, color: '#999',
          padding: '8px 16px 6px',
          letterSpacing: 0.3,
        }}>
          {title}
        </div>
      )}
      <div style={{
        background: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        margin: '0 4px',
        ...style,
      }}>
        {children}
      </div>
    </div>
  );
}

/* ── 主页面 ── */
export default function SettingsV2() {
  const navigate = useNavigate();
  const { theme, setTheme, autoTheme, toggleAutoTheme, THEMES, THEME_LABELS } = useTheme();
  const { user, logout } = useAuth();
  const toast = useToast();
  const { blurEnabled, toggleBlur } = useNsfw();
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

  const themeLabels = { light: '浅色模式', dark: '深色模式', colorful: '多彩模式' };

  return (
    <div style={{ background: '#F5F5F5', minHeight: '100vh', paddingBottom: 20 }}>

      {/* ── 顶部用户卡片 ── */}
      <div
        onClick={() => user ? navigate('/profile') : navigate('/login')}
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          margin: '0 4px', borderRadius: 16, padding: '24px 20px',
          display: 'flex', alignItems: 'center', gap: 16,
          cursor: 'pointer', position: 'relative', overflow: 'hidden',
        }}
      >
        {/* 装饰圆 */}
        <div style={{
          position: 'absolute', top: -30, right: -30,
          width: 120, height: 120, borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
        }} />
        <div style={{
          position: 'absolute', bottom: -20, right: 40,
          width: 80, height: 80, borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
        }} />

        {/* 头像 */}
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: 'rgba(255,255,255,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, fontWeight: 700, color: '#fff',
          flexShrink: 0, border: '2px solid rgba(255,255,255,0.3)',
          overflow: 'hidden',
        }}>
          {user?.avatar ? (
            <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            user?.username?.[0]?.toUpperCase() || '?'
          )}
        </div>

        {/* 用户信息 */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#fff' }}>
            {user?.username || '点击登录'}
          </div>
          {user ? (
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 3 }}>
              ID: {user.id} · {user.role === 'admin' ? '管理员' : '用户'}
            </div>
          ) : (
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 3 }}>
              登录后享受完整功能
            </div>
          )}
        </div>

        <i className="fa-solid fa-chevron-right" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }} />
      </div>

      {/* ── 搜索栏 ── */}
      <div style={{ margin: '12px 4px 4px' }}>
        <div style={{
          background: '#fff', borderRadius: 10, padding: '10px 14px',
          display: 'flex', alignItems: 'center', gap: 10,
          fontSize: 14, color: '#C0C0C0',
        }}>
          <i className="fa-solid fa-magnifying-glass" style={{ fontSize: 14 }} />
          <span>搜索设置</span>
        </div>
      </div>

      {/* ── 内容与安全 ── */}
      <div style={{ marginTop: 12 }}>
        <SettingGroup title="内容与安全">
          <SettingItem
            icon="fa-solid fa-shield-halved"
            iconColor="#4CAF50"
            iconBg="#E8F5E9"
            label="敏感内容屏蔽"
            desc="敏感图片自动模糊处理"
            right={<MiToggle value={blurEnabled} onChange={toggleBlur} />}
          />
          <SettingItem
            icon="fa-solid fa-eye"
            iconColor="#FF9800"
            iconBg="#FFF3E0"
            label="搜索包含敏感内容"
            desc="搜索结果显示敏感帖子"
            right={<MiToggle value={searchNsfw} onChange={toggleSearchNsfw} />}
            border={false}
          />
        </SettingGroup>
      </div>

      {/* ── 显示 ── */}
      <SettingGroup title="显示">
        <SettingItem
          icon="fa-solid fa-palette"
          iconColor="#9C27B0"
          iconBg="#F3E5F5"
          label="主题模式"
          desc={autoTheme ? '自动切换中' : themeLabels[theme]}
          onClick={() => {
            // 循环切换主题
            const idx = THEMES.indexOf(theme);
            const next = THEMES[(idx + 1) % THEMES.length];
            if (autoTheme) {
              toast.show('请先关闭自动切换');
              return;
            }
            setTheme(next);
            toast.show(`已切换为${themeLabels[next]}`);
          }}
        />
        <SettingItem
          icon="fa-solid fa-clock"
          iconColor="#2196F3"
          iconBg="#E3F2FD"
          label="自动切换深浅色"
          desc="19:00 深色 · 7:00 浅色"
          right={<MiToggle value={autoTheme} onChange={toggleAutoTheme} />}
          border={false}
        />
      </SettingGroup>

      {/* ── 账户 ── */}
      {user && (
        <SettingGroup title="账户">
          <SettingItem
            icon="fa-solid fa-user-shield"
            iconColor="#3F51B5"
            iconBg="#E8EAF6"
            label="账户与隐私"
            desc="个人资料、邮箱、密码"
            onClick={() => navigate('/account')}
          />
          <SettingItem
            icon="fa-solid fa-right-from-bracket"
            iconColor="#F44336"
            iconBg="#FFEBEE"
            label="退出登录"
            onClick={() => {
              logout();
              toast.show('已退出登录');
            }}
            border={false}
          />
        </SettingGroup>
      )}

      {/* ── 关于 ── */}
      <SettingGroup title="关于">
        <SettingItem
          icon="fa-solid fa-circle-info"
          iconColor="#607D8B"
          iconBg="#ECEFF1"
          label="关于 ABDL Space"
          desc="版本、开源许可、联系方式"
          onClick={() => navigate('/about')}
        />
        <SettingItem
          icon="fa-solid fa-file-contract"
          iconColor="#795548"
          iconBg="#EFEBE9"
          label="用户协议"
          onClick={() => navigate('/terms')}
        />
        <SettingItem
          icon="fa-solid fa-lock"
          iconColor="#009688"
          iconBg="#E0F2F1"
          label="隐私政策"
          onClick={() => navigate('/privacy')}
        />
        <SettingItem
          icon="fa-solid fa-cookie"
          iconColor="#FF5722"
          iconBg="#FBE9E7"
          label="Cookie 政策"
          onClick={() => navigate('/cookies')}
          border={false}
        />
      </SettingGroup>

      {/* ── 快捷键（仅桌面） ── */}
      <div className="hidden md:block">
        <SettingGroup title="快捷键">
          {[
            ['Ctrl+Shift+T', '切换主题'],
            ['Alt+1', '广场'],
            ['Alt+2', '纸尿裤列表'],
            ['Alt+3', '排行榜'],
            ['Alt+4', 'AI 推荐'],
            ['Alt+5', '个人中心'],
          ].map(([key, desc]) => (
            <SettingItem
              key={key}
              icon="fa-solid fa-keyboard"
              iconColor="#9E9E9E"
              iconBg="#F5F5F5"
              label={desc}
              right={
                <kbd style={{
                  fontSize: 11, fontFamily: 'SF Mono, monospace',
                  background: '#F5F5F5', border: '1px solid #E0E0E0',
                  borderRadius: 6, padding: '3px 8px', color: '#666',
                }}>
                  {key}
                </kbd>
              }
            />
          ))}
        </SettingGroup>
      </div>

      {/* ── 底部版本信息 ── */}
      <div style={{
        textAlign: 'center', padding: '24px 0 8px',
        fontSize: 12, color: '#C0C0C0',
      }}>
        ABDL Space Mobile · v2.0
      </div>
    </div>
  );
}

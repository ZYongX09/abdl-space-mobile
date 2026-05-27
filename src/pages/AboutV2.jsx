import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { externalLinkUrl } from '../utils/externalLink';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

const VERSION = '0.1.0';
const LAST_UPDATE = '2026-05-27';
const BUILD_DATE = '2026-05-27';

const CHANGELOG = [
  {
    version: '0.1.0',
    date: '2026-05-26',
    changes: [
      '移动端正式独立，从主站分离为独立项目',
      '专属移动端优化的页面布局和交互',
      '独立部署至 m.abdl-space.top',
      '支持宝宝新天地第三方登录',
    ],
  },
];

/* ====== HyperOS 风格行 ====== */
function HyperRow({ label, value, onClick, href, external, last }) {
  const Tag = href ? 'a' : 'div';
  const props = href
    ? { href: external ? externalLinkUrl(href) : href, target: external ? '_blank' : undefined, rel: external ? 'noopener noreferrer' : undefined }
    : {};

  return (
    <Tag
      {...props}
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 20px',
        textDecoration: 'none',
        color: 'var(--text)',
        cursor: onClick || href ? 'pointer' : 'default',
        borderBottom: last ? 'none' : '0.5px solid var(--border)',
      }}
    >
      <span style={{ fontSize: 14, color: 'var(--text)' }}>{label}</span>
      <span style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
        {value && <span>{value}</span>}
        {(onClick || href) && <i className="fa-solid fa-chevron-right" style={{ fontSize: 9 }} />}
      </span>
    </Tag>
  );
}

/* ====== 卡片 ====== */
function HyperCard({ children, style, delay = 0 }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      borderRadius: 14,
      margin: '0 16px 10px',
      overflow: 'hidden',
      animation: `fadeSlideUp 0.45s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s both`,
      ...style,
    }}>
      {children}
    </div>
  );
}

/* ====== 主组件 ====== */
export default function AboutV2() {
  const { user, getConsentStatus, withdrawConsent } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [consent, setConsent] = useState({ privacy: false, terms: false, date: null });

  useEffect(() => {
    if (user) setConsent(getConsentStatus());
  }, [user, getConsentStatus]);

  const handleWithdraw = () => {
    if (!confirm('撤回同意将导致您被退出登录，且无法继续使用本平台服务。确定要撤回吗？')) return;
    withdrawConsent();
    toast.success('已撤回同意');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)',
    }}>
      {/* ====== 动画 keyframes（全局唯一） ====== */}
      <style>{`
        @keyframes aboutLogoScale {
          0% { opacity: 0; transform: scale(0.7); }
          60% { transform: scale(1.05); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes fadeSlideUp {
          0% { opacity: 0; transform: translateY(12px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ====== 顶部 Logo 区域 ====== */}
      <div style={{ padding: '60px 24px 28px', textAlign: 'center' }}>
        <img
          src="https://img.abdl-space.top/file/1779879250278_ABDL_icon.svg"
          alt="ABDL Space"
          style={{
            width: 100, height: 100, marginBottom: 20,
            animation: 'aboutLogoScale 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.275) both',
            filter: 'drop-shadow(0 8px 24px rgba(106, 174, 200, 0.25))',
          }}
        />
        <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: 4 }}>
          ABDL Space
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          移动版 · v{VERSION}
        </div>
      </div>

      {/* ====== 版本信息卡片 ====== */}
      <HyperCard delay={0.06}>
        <HyperRow label="OS 版本" value={`v${VERSION}`} />
        <HyperRow label="构建日期" value={BUILD_DATE} />
        <HyperRow label="前端框架" value="React 18 + Vite 5" />
        <HyperRow label="后端服务" value="Hono + CF Workers" />
        <HyperRow label="数据库" value="Cloudflare D1" last />
      </HyperCard>

      {/* ====== 更多信息 ====== */}
      <HyperCard delay={0.12}>
        <HyperRow label="官方网站" value="abdl-space.top" href="https://abdl-space.top" external />
        <HyperRow label="GitHub" value="ABDL-Space-V2" href="https://github.com/ZYongX09/ABDL-Space-V2" external />
        <HyperRow label="开发者博客" value="zhx-blog.top" href="https://zhx-blog.top" external last />
      </HyperCard>

      {/* ====== 法律信息 ====== */}
      <HyperCard delay={0.18}>
        <HyperRow label="隐私政策" href="/privacy" />
        <HyperRow label="用户协议" href="/terms" />
        <HyperRow label="未成年人保护政策" href="/minor-protection" />
        <HyperRow label="Cookie 政策" href="/cookies" last />
      </HyperCard>

      {user && consent.date && (
        <div style={{ fontSize: 11, color: 'var(--text-muted)', padding: '2px 32px 10px', marginTop: -4 }}>
          协议同意时间：{new Date(consent.date).toLocaleString('zh-CN')}
        </div>
      )}

      {user && (
        <HyperCard delay={0.24} style={{ background: 'rgba(232, 131, 124, 0.06)', border: '1px solid rgba(232, 131, 124, 0.15)' }}>
          <div style={{ padding: '14px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: 12, color: 'var(--danger)' }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--danger)' }}>撤回同意</span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-light)', marginBottom: 12, lineHeight: 1.6 }}>
              撤回同意隐私政策和用户协议将导致您被退出登录，且无法继续使用本平台服务。
            </p>
            <button
              className="miui-press"
              style={{ background: 'var(--danger)', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
              onClick={handleWithdraw}
            >
              撤回同意
            </button>
          </div>
        </HyperCard>
      )}

      {/* ====== 支持我们 ====== */}
      <HyperCard delay={0.3} style={{ position: 'relative', overflow: 'hidden' }}>
        <img
          src="https://static.afdiancdn.com/static/img/logo/logo.png"
          alt=""
          style={{ position: 'absolute', top: -30, right: -30, width: 150, height: 150, opacity: 0.06, pointerEvents: 'none', userSelect: 'none', objectFit: 'contain' }}
        />
        <div style={{ padding: '14px 20px', position: 'relative' }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, color: 'var(--text)' }}>
            <i className="fa-solid fa-heart mr-2" style={{ color: 'var(--accent)' }} />
            支持我们
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>如果 ABDL Space 对你有帮助，欢迎鼓励一下 🍼</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { price: '￥5', label: '一片裤裤', color: 'var(--primary-dark)', url: 'https://ifdian.net/order/create?plan_id=a9a8a704508c11f1be9a52540025c377&product_type=0' },
              { price: '￥20', label: '一包裤裤', color: 'var(--accent)', url: 'https://ifdian.net/order/create?plan_id=bde9dab2508c11f1b80752540025c377&product_type=0' },
              { price: '···', label: '自定义', color: 'var(--text)', url: 'https://ifdian.net/order/create?user_id=399f44cc508c11f18b7752540025c377' },
            ].map(item => (
              <a key={item.label} href={externalLinkUrl(item.url)} className="miui-press"
                style={{ flex: 1, padding: '10px 8px', borderRadius: 10, background: 'var(--input-bg)', textDecoration: 'none', textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: item.color }}>{item.price}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{item.label}</div>
              </a>
            ))}
          </div>
        </div>
      </HyperCard>

      {/* ====== 更新日志 ====== */}
      <HyperCard delay={0.36}>
        <div style={{ padding: '14px 20px' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 14 }}>
            <i className="fa-solid fa-clock-rotate-left mr-2" style={{ color: 'var(--primary-dark)', fontSize: 13 }} />
            更新日志
          </div>
          {CHANGELOG.map((log, logIdx) => (
            <div key={log.version} style={{ display: 'flex', gap: 12, marginBottom: logIdx < CHANGELOG.length - 1 ? 16 : 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, paddingTop: 3 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0 }} />
                {logIdx < CHANGELOG.length - 1 && <div style={{ width: 1, flex: 1, background: 'var(--border)', marginTop: 4 }} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 11, padding: '1px 8px', borderRadius: 8, background: 'var(--primary-light)', color: 'var(--primary-dark)', fontWeight: 600 }}>v{log.version}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{log.date}</span>
                </div>
                {log.changes.map((c, i) => (
                  <div key={i} style={{ fontSize: 12, color: 'var(--text-light)', lineHeight: 1.8, paddingLeft: 10, position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 0, color: 'var(--text-muted)', fontSize: 10 }}>·</span>
                    {c}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', padding: '8px 20px 12px', textAlign: 'right', borderTop: '0.5px solid var(--border)' }}>
          最后更新: {LAST_UPDATE}
        </div>
      </HyperCard>
    </div>
  );
}

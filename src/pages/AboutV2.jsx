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

/* ====== 列表项组件 ====== */
function InfoRow({ icon, iconBg, label, value, onClick, href, external, chevron = true, badge }) {
  const Tag = href ? 'a' : 'div';
  const props = href
    ? { href: external ? externalLinkUrl(href) : href, target: external ? '_blank' : undefined, rel: external ? 'noopener noreferrer' : undefined }
    : {};

  return (
    <Tag
      {...props}
      className="miui-press"
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '13px 16px',
        textDecoration: 'none',
        color: 'var(--text)',
        cursor: onClick || href ? 'pointer' : 'default',
        transition: 'background 0.15s',
      }}
    >
      {/* 图标 */}
      <div style={{
        width: 32, height: 32, borderRadius: 8,
        background: iconBg || 'var(--primary-light)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, fontSize: 14,
      }}>
        <i className={icon} style={{ color: 'var(--primary-dark)' }} />
      </div>
      {/* 标签 + 值 */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500 }}>{label}</div>
        {value && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{value}</div>}
      </div>
      {/* badge */}
      {badge && (
        <span style={{
          fontSize: 10, padding: '2px 8px', borderRadius: 10,
          background: 'var(--primary-light)', color: 'var(--primary-dark)', fontWeight: 600,
        }}>{badge}</span>
      )}
      {/* 箭头 */}
      {(onClick || href) && chevron && (
        <i className="fa-solid fa-chevron-right" style={{ fontSize: 10, color: 'var(--text-muted)', flexShrink: 0 }} />
      )}
    </Tag>
  );
}

/* ====== 分组标题 ====== */
function SectionHeader({ children }) {
  return (
    <div style={{
      fontSize: 12, fontWeight: 600, color: 'var(--text-muted)',
      padding: '20px 16px 8px', textTransform: 'uppercase', letterSpacing: '0.05em',
    }}>
      {children}
    </div>
  );
}

/* ====== 卡片容器 ====== */
function SectionCard({ children, style }) {
  return (
    <div className="stagger-item" style={{
      background: 'var(--bg-card)',
      borderRadius: 16,
      margin: '0 0 12px',
      overflow: 'hidden',
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      ...style,
    }}>
      {children}
    </div>
  );
}

/* ====== 分割线 ====== */
function Divider() {
  return <div style={{ height: 0.5, background: 'var(--border)', marginLeft: 60 }} />;
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
      {/* ====== Hero 区域 ====== */}
      <div className="stagger-item" style={{
        textAlign: 'center',
        padding: '48px 24px 32px',
        position: 'relative',
      }}>
        {/* Logo */}
        <img
          src="https://img.abdl-space.top/file/1779879267209_ABDL_logo_word.svg"
          alt="ABDL Space"
          style={{ height: 80, marginBottom: 16, animation: 'heroScaleIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) both' }}
        />
        {/* 产品名 */}
        <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
          ABDL Space
        </div>
        {/* 版本 + 日期 */}
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
          v{VERSION} · {BUILD_DATE}
        </div>
        {/* 按钮组 */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a
            href={externalLinkUrl('https://github.com/ZYongX09/ABDL-Space-V2')}
            className="miui-press"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', borderRadius: 20,
              background: '#24292e', color: '#fff',
              fontSize: 12, fontWeight: 600, textDecoration: 'none',
            }}
          >
            <i className="fa-brands fa-github" /> GitHub
          </a>
          <a
            href={externalLinkUrl('https://zhx-blog.top')}
            className="miui-press"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', borderRadius: 20,
              background: 'var(--primary-dark)', color: '#fff',
              fontSize: 12, fontWeight: 600, textDecoration: 'none',
            }}
          >
            <i className="fa-solid fa-blog" /> ZhX 的博客
          </a>
        </div>
      </div>

      <div style={{ padding: '0 12px' }}>
        {/* ====== 应用信息 ====== */}
        <SectionHeader>应用信息</SectionHeader>
        <SectionCard>
          <InfoRow icon="fa-solid fa-circle-info" label="当前版本" value={`v${VERSION} 移动版`} chevron={false} />
          <Divider />
          <InfoRow icon="fa-solid fa-calendar" label="构建日期" value={BUILD_DATE} chevron={false} />
          <Divider />
          <InfoRow icon="fa-solid fa-code" label="技术栈" value="React · Vite · Tailwind · Hono · CF Workers" chevron={false} />
          <Divider />
          <InfoRow
            icon="fa-solid fa-globe"
            label="官方网站"
            value="abdl-space.top"
            href="https://abdl-space.top"
            external
          />
        </SectionCard>

        {/* ====== 政策与条款 ====== */}
        <SectionHeader>政策与条款</SectionHeader>
        <SectionCard>
          <InfoRow
            icon="fa-solid fa-shield-halved"
            label="隐私政策"
            href="/privacy"
            badge={user && consent.privacy ? '已同意' : undefined}
          />
          <Divider />
          <InfoRow
            icon="fa-solid fa-child"
            label="未成年人保护政策"
            href="/minor-protection"
          />
          <Divider />
          <InfoRow
            icon="fa-solid fa-cookie-bite"
            label="Cookie 政策"
            href="/cookies"
          />
          <Divider />
          <InfoRow
            icon="fa-solid fa-file-contract"
            label="用户协议"
            href="/terms"
            badge={user && consent.terms ? '已同意' : undefined}
          />
        </SectionCard>

        {user && consent.date && (
          <div style={{ fontSize: 11, color: 'var(--text-muted)', padding: '0 16px 8px', marginTop: -4 }}>
            同意时间：{new Date(consent.date).toLocaleString('zh-CN')}
          </div>
        )}

        {/* 撤回同意 */}
        {user && (
          <SectionCard style={{ background: 'rgba(232, 131, 124, 0.06)', border: '1px solid rgba(232, 131, 124, 0.2)' }}>
            <div style={{ padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: 13, color: 'var(--danger)' }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--danger)' }}>撤回同意</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-light)', marginBottom: 12, lineHeight: 1.6 }}>
                撤回同意隐私政策和用户协议将导致您被退出登录，且无法继续使用本平台服务。
              </p>
              <button
                className="btn btn-sm miui-press"
                style={{ background: 'var(--danger)', color: '#fff', fontSize: 12 }}
                onClick={handleWithdraw}
              >
                <i className="fa-solid fa-ban mr-1" /> 撤回同意
              </button>
            </div>
          </SectionCard>
        )}

        {/* ====== 支持我们 ====== */}
        <SectionHeader>支持我们</SectionHeader>
        <SectionCard style={{ position: 'relative', overflow: 'hidden' }}>
          {/* 爱发电背景 */}
          <img
            src="https://static.afdiancdn.com/static/img/logo/logo.png"
            alt=""
            style={{
              position: 'absolute', top: -30, right: -30,
              width: 160, height: 160, opacity: 0.08,
              pointerEvents: 'none', userSelect: 'none', objectFit: 'contain',
            }}
          />
          <div style={{ padding: 16, position: 'relative' }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, color: 'var(--text)' }}>
              <i className="fa-solid fa-heart mr-2" style={{ color: 'var(--accent)' }} />
              如果你觉得 ABDL Space 对你有帮助
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>欢迎给我们一点小小的鼓励 🍼</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <a
                href={externalLinkUrl('https://ifdian.net/order/create?plan_id=a9a8a704508c11f1be9a52540025c377&product_type=0')}
                className="miui-press"
                style={{
                  flex: 1, minWidth: 100, padding: '10px 12px', borderRadius: 12,
                  background: 'var(--input-bg)', textDecoration: 'none', textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--primary-dark)' }}>￥5</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>一片裤裤</div>
              </a>
              <a
                href={externalLinkUrl('https://ifdian.net/order/create?plan_id=bde9dab2508c11f1b80752540025c377&product_type=0')}
                className="miui-press"
                style={{
                  flex: 1, minWidth: 100, padding: '10px 12px', borderRadius: 12,
                  background: 'var(--input-bg)', textDecoration: 'none', textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent)' }}>￥20</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>一包裤裤</div>
              </a>
              <a
                href={externalLinkUrl('https://ifdian.net/order/create?user_id=399f44cc508c11f18b7752540025c377')}
                className="miui-press"
                style={{
                  flex: 1, minWidth: 100, padding: '10px 12px', borderRadius: 12,
                  background: 'var(--input-bg)', textDecoration: 'none', textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>···</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>自定义</div>
              </a>
            </div>
          </div>
        </SectionCard>

        {/* ====== 更新日志 ====== */}
        <SectionHeader>更新日志</SectionHeader>
        <SectionCard>
          <div style={{ padding: '16px 16px 8px' }}>
            {CHANGELOG.map((log, logIdx) => (
              <div key={log.version} style={{ display: 'flex', gap: 14, marginBottom: logIdx < CHANGELOG.length - 1 ? 20 : 8 }}>
                {/* 时间轴 */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, paddingTop: 2 }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: 'var(--primary)', flexShrink: 0,
                  }} />
                  {logIdx < CHANGELOG.length - 1 && (
                    <div style={{ width: 1.5, flex: 1, background: 'var(--border)', marginTop: 4 }} />
                  )}
                </div>
                {/* 内容 */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{
                      fontSize: 12, padding: '2px 10px', borderRadius: 10,
                      background: 'var(--primary-light)', color: 'var(--primary-dark)', fontWeight: 600,
                    }}>v{log.version}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{log.date}</span>
                  </div>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                    {log.changes.map((c, i) => (
                      <li key={i} style={{
                        fontSize: 13, color: 'var(--text-light)', lineHeight: 1.7,
                        paddingLeft: 12, position: 'relative', marginBottom: 2,
                      }}>
                        <span style={{ position: 'absolute', left: 0, color: 'var(--text-muted)' }}>·</span>
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', padding: '8px 16px 14px', textAlign: 'right' }}>
            最后更新: {LAST_UPDATE}
          </div>
        </SectionCard>
      </div>

      {/* ====== 动画样式 ====== */}
      <style>{`
        @keyframes heroScaleIn {
          0% { opacity: 0; transform: scale(0.85); }
          100% { opacity: 1; transform: scale(1); }
        }
        .stagger-item {
          animation: fadeSlideUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .stagger-item:nth-child(1) { animation-delay: 0.05s; }
        .stagger-item:nth-child(2) { animation-delay: 0.1s; }
        .stagger-item:nth-child(3) { animation-delay: 0.15s; }
        .stagger-item:nth-child(4) { animation-delay: 0.2s; }
        .stagger-item:nth-child(5) { animation-delay: 0.25s; }
        .stagger-item:nth-child(6) { animation-delay: 0.3s; }
        @keyframes fadeSlideUp {
          0% { opacity: 0; transform: translateY(16px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

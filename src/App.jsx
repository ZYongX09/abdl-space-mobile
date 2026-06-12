import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { NsfwProvider } from './contexts/NsfwContext';
import { initNBWConfig } from './utils/nbwOAuth';
import { MobileHeaderProvider, useMobileHeaderActions } from './contexts/MobileHeaderContext';
import Sidebar from './components/Sidebar';
import MobileHeader from './components/MobileHeader';
import MobileBottomNav from './components/MobileBottomNav';
import RedirectNotice from './components/RedirectNotice';
import CookieConsent from './components/CookieConsent';
import AdBlockNotice from './components/AdBlockNotice';
import BackToTop from './components/BackToTop';
import ToastPopup from './components/ToastPopup';
import ScrollProgress from './components/ScrollProgress';
import ErrorBoundary from './components/ErrorBoundary';
import { useExternalLinkInterceptor } from './hooks/useExternalLinkInterceptor';

// 路由级懒加载
const ForumFeed = lazy(() => import('./pages/ForumFeed'));
const PostDetail = lazy(() => import('./pages/PostDetail'));
const Home = lazy(() => import('./pages/Home'));
const DiaperDetail = lazy(() => import('./pages/DiaperDetail'));
const Rankings = lazy(() => import('./pages/Rankings'));
const ComparePage = lazy(() => import('./pages/ComparePage'));
const Recommendations = lazy(() => import('./pages/Recommendations'));
const TermWiki = lazy(() => import('./pages/TermWiki'));
const DiaperWiki = lazy(() => import('./pages/DiaperWiki'));
const DiaperWikiList = lazy(() => import('./pages/DiaperWikiList'));
const About = lazy(() => import('./pages/About'));
const CookiePolicy = lazy(() => import('./pages/CookiePolicy'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const MinorProtection = lazy(() => import('./pages/MinorProtection'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const NBWCallback = lazy(() => import('./pages/NBWCallback'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));

const MessagesPage = lazy(() => import('./pages/MessagesPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const BetaRegister = lazy(() => import('./pages/BetaRegister'));
const AccountPrivacy = lazy(() => import('./pages/AccountPrivacy'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const PointsPage = lazy(() => import('./pages/PointsPage'));
const InvitePage = lazy(() => import('./pages/InvitePage'));
const ExternalLink = lazy(() => import('./pages/ExternalLink'));
const CreatePost = lazy(() => import('./pages/CreatePost'));
const BugDashboard = lazy(() => import('./pages/BugDashboard'));

function PageFallback() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
      <div className="spinner" />
    </div>
  );
}

const ROUTE_TITLES = {
  '/': '广场 — ABDL Space',
  '/diapers': '纸尿裤列表 — ABDL Space',
  '/rankings': '排行榜 — ABDL Space',
  '/compare': '对比工具 — ABDL Space',
  '/recommend': 'AI 推荐 — ABDL Space',
  '/termwiki': '术语 Wiki — ABDL Space',
  '/diaper-wiki': '裤裤百科 — ABDL Space',
  '/profile': '个人中心 — ABDL Space',
  '/login': '登录 — ABDL Space',
  '/register': '注册 — ABDL Space',
  '/beta-register': '创始成员计划 — ABDL Space',
  '/forgot-password': '找回密码 — ABDL Space',
  '/account': '账户与隐私 — ABDL Space',
  '/messages': '私信 — ABDL Space',
  '/notifications': '通知 — ABDL Space',
  '/admin': '管理后台 — ABDL Space',
  '/external': '外部链接 — ABDL Space',
  '/about': '关于 — ABDL Space',
  '/settings': '设置 — ABDL Space',
  '/create-post': '发帖 — ABDL Space',
  '/bugs': 'Bug 追踪面板 — ABDL Space',
  '/points': '积分 — ABDL Space',
  '/invite': '邀请码 — ABDL Space',
};

function getTitle(pathname) {
  if (ROUTE_TITLES[pathname]) return ROUTE_TITLES[pathname];
  if (pathname.startsWith('/diaper/')) return '纸尿裤详情 — ABDL Space';
  if (pathname.startsWith('/diaper-wiki/')) return '裤裤百科 — ABDL Space';
  if (pathname.startsWith('/forum/')) return '帖子详情 — ABDL Space';
  if (pathname.startsWith('/user/')) return '用户主页 — ABDL Space';
  if (pathname.startsWith('/profile/')) return '用户主页 — ABDL Space';
  return 'ABDL Space';
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.title = getTitle(pathname);
  }, [pathname]);
  return null;
}

function MobileHeaderLayout() {
  const { pathname } = useLocation();
  const { actions, leftActions } = useMobileHeaderActions();
  const title = getTitle(pathname).split(' — ')[0] || 'ABDL Space';
  return <MobileHeader title={title} actions={actions} leftActions={leftActions} />;
}

export default function App() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { pathname } = useLocation();
  useExternalLinkInterceptor();

  // 初始化 NBW OAuth 配置
  useEffect(() => { initNBWConfig(); }, []);

  // 全局键盘快捷键
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;
      const key = e.key.toLowerCase();
      // Alt+数字导航
      const navMap = { '1': '/', '2': '/diapers', '3': '/rankings', '4': '/recommend', '5': '/profile' };
      if (e.altKey && navMap[key]) { e.preventDefault(); navigate(navMap[key]); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate]);

  return (
    <MobileHeaderProvider>
    <RedirectNotice />
    <div className="app-layout">
      <ScrollToTop />
      <NotificationProvider>
      <NsfwProvider>
      {/* 独立布局页面 — 无侧边栏/导航/footer */}
      {pathname === '/beta-register' ? (
        <div style={{ flex: 1, width: '100%', minHeight: '100vh', padding: '20px 16px', overflowY: 'auto' }} className="page-transition-enter">
          <ErrorBoundary>
            <Suspense fallback={<PageFallback />}>
              <Routes>
                <Route path="/beta-register" element={<BetaRegister />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </div>
      ) : (
      <>
      <Sidebar />
      <MobileHeaderLayout />
      <div className="app-main-content">
        <div key={pathname} className={`${pathname === '/' ? '' : 'container mx-auto px-5 py-6'} page-transition-enter`} style={pathname === '/' ? {} : { maxWidth: 'min(1920px, calc(100vw - 80px))' }}>
          <ErrorBoundary>
            <Suspense fallback={<PageFallback />}>
              <Routes>
                <Route path="/" element={<ForumFeed />} />
                <Route path="/forum/:id" element={<PostDetail />} />
                <Route path="/diapers" element={<Home />} />
                <Route path="/diaper/:id" element={<DiaperDetail />} />
                <Route path="/rankings" element={<Rankings />} />
                <Route path="/compare" element={<ComparePage />} />
                <Route path="/recommend" element={<Recommendations />} />
                <Route path="/termwiki" element={<TermWiki />} />
                <Route path="/diaper-wiki" element={<DiaperWikiList />} />
                <Route path="/diaper-wiki/:id" element={<DiaperWiki />} />
                <Route path="/about" element={<About />} />
                <Route path="/cookies" element={<CookiePolicy />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/minor-protection" element={<MinorProtection />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/auth/nbw/callback" element={<NBWCallback />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/profile/:id" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/user/:id" element={<Profile />} />
                <Route path="/messages" element={<MessagesPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/account" element={<AccountPrivacy />} />
                <Route path="/external" element={<ExternalLink />} />
                <Route path="/create-post" element={<CreatePost />} />
                <Route path="/bugs" element={<BugDashboard />} />
                <Route path="/points" element={<PointsPage />} />
                <Route path="/invite" element={<InvitePage />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </div>
        <footer className="text-center py-5 text-xs space-y-2" style={{ color: 'var(--text-muted)' }}>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <i className="fa-solid fa-baby" style={{ color: 'var(--primary)' }} />
            <span>ABDL Space v2 · © {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <a href="/" style={{ color: 'var(--link-color)', textDecoration: 'none' }}>广场</a>
            <a href="/termwiki" style={{ color: 'var(--link-color)', textDecoration: 'none' }}><i className="fa-solid fa-book mr-1" />术语 Wiki</a>
            <a href="/settings" style={{ color: 'var(--link-color)', textDecoration: 'none' }}><i className="fa-solid fa-gear mr-1" />设置</a>
            <a href="/about" style={{ color: 'var(--link-color)', textDecoration: 'none' }}><i className="fa-solid fa-circle-info mr-1" />关于</a>
            {user?.role === 'admin' && (
              <a href="/admin" style={{ color: 'var(--link-color)', textDecoration: 'none' }}><i className="fa-solid fa-shield-halved mr-1" />管理</a>
            )}
          </div>
        </footer>
      </div>
      </>
      )}
      <ToastPopup />
      {pathname !== '/beta-register' && <MobileBottomNav />}
      </NsfwProvider>
      </NotificationProvider>
      <AdBlockNotice />
      <CookieConsent />
      <ScrollProgress />
      <BackToTop />
    </div>
    </MobileHeaderProvider>
  );
}

import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, useLocation, useSearchParams } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { initNBWConfig } from './utils/nbwOAuth'
import { MobileHeaderProvider, useMobileHeaderActions } from './contexts/MobileHeaderContext'
import MobileHeader from './components/MobileHeader'
import MobileBottomNav from './components/MobileBottomNav'
import ToastPopup from './components/ToastPopup'
import ErrorBoundary from './components/ErrorBoundary'
import RedirectNotice from './components/RedirectNotice'
import AdBlockNotice from './components/AdBlockNotice'

// 路由级懒加载
const ForumFeed = lazy(() => import('./pages/ForumFeed'))
const PostDetail = lazy(() => import('./pages/PostDetail'))
const Diapers = lazy(() => import('./pages/Diapers'))
const DiaperDetail = lazy(() => import('./pages/DiaperDetail'))
const Rankings = lazy(() => import('./pages/Rankings'))
const Recommendations = lazy(() => import('./pages/Recommendations'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const BetaRegister = lazy(() => import('./pages/BetaRegister'))
const NBWCallback = lazy(() => import('./pages/NBWCallback'))
const Profile = lazy(() => import('./pages/Profile'))
const Settings = lazy(() => import('./pages/Settings'))
const About = lazy(() => import('./pages/About'))
const MinorProtection = lazy(() => import('./pages/MinorProtection'))
const ExternalLink = lazy(() => import('./pages/ExternalLink'))
const CreatePost = lazy(() => import('./pages/CreatePost'))
const MessagesPage = lazy(() => import('./pages/MessagesPage'))
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'))
const AccountPrivacy = lazy(() => import('./pages/AccountPrivacy'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const ComparePage = lazy(() => import('./pages/ComparePage'))
const BugDashboard = lazy(() => import('./pages/BugDashboard'))
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'))
const TermsOfService = lazy(() => import('./pages/TermsOfService'))
const CookiePolicy = lazy(() => import('./pages/CookiePolicy'))
const DiaperWiki = lazy(() => import('./pages/DiaperWiki'))
const DiaperWikiList = lazy(() => import('./pages/DiaperWikiList'))
const PointsPage = lazy(() => import('./pages/PointsPage'))
const InvitePage = lazy(() => import('./pages/InvitePage'))

const ROUTE_TITLES = {
  '/': '广场',
  '/diapers': '纸尿裤',
  '/rankings': '排行榜',
  '/recommend': 'AI 推荐',
  '/profile': '个人中心',
  '/login': '登录',
  '/register': '注册',
  '/beta-register': '创始成员计划',
  '/settings': '设置',
  '/about': '关于',
  '/messages': '私信',
  '/notifications': '通知',
  '/create-post': '发帖',
  '/account': '账户与隐私',
  '/forgot-password': '找回密码',
  '/compare': '纸尿裤对比',
  '/diaper-wiki': '裤裤百科',
  '/bugs': 'Bug 追踪面板',
  '/privacy': '隐私政策',
  '/terms': '用户协议',
  '/cookies': 'Cookie 政策',
  '/points': '积分',
  '/invite': '邀请码',
}

function getTitle(pathname) {
  if (ROUTE_TITLES[pathname]) return ROUTE_TITLES[pathname]
  if (pathname.startsWith('/diaper/')) return '纸尿裤详情'
  if (pathname.startsWith('/forum/')) return '帖子详情'
  if (pathname.startsWith('/user/')) return '用户主页'
  if (pathname.startsWith('/profile/')) return '用户主页'
  return 'ABDL Space'
}

function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="spinner" />
    </div>
  )
}

function MobileHeaderLayout() {
  const { pathname } = useLocation()
  const { headerVisible } = useMobileHeaderActions()
  if (!headerVisible) return null
  return <MobileHeader title={getTitle(pathname)} />
}

/** OAuth 授权页跳转到主站 */
function OAuthRedirect() {
  const [params] = useSearchParams();
  const qs = params.toString();
  const target = `https://abdl-space.top/oauth/authorize${qs ? '?' + qs : ''}`;
  window.location.replace(target);
  return null;
}

function AppMainContent({ children }) {
  const { headerVisible } = useMobileHeaderActions()
  return (
    <main className="app-main-content" style={headerVisible ? {} : { paddingTop: 0 }}>
      {children}
    </main>
  )
}

export default function App() {
  const { pathname } = useLocation()

  useEffect(() => { initNBWConfig() }, [])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    document.title = getTitle(pathname) + ' — ABDL Space 移动版'
  }, [pathname])

  return (
    <MobileHeaderProvider>
    <RedirectNotice />
    <AdBlockNotice />
    <div className="app-layout">
      {/* 独立布局页面 — 无导航/footer */}
      {pathname === '/beta-register' ? (
        <div style={{ width: '100%', minHeight: '100vh', padding: '20px 16px', overflowY: 'auto' }} className="page-transition-enter">
          <ErrorBoundary>
            <Suspense fallback={<Loading />}>
              <Routes>
                <Route path="/beta-register" element={<BetaRegister />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </div>
      ) : (
      <>
      <MobileHeaderLayout />
      <AppMainContent>
        <div className="container mx-auto px-4 py-4 max-w-[720px]">
          <ErrorBoundary>
            <Suspense fallback={<Loading />}>
              <Routes>
                <Route path="/" element={<ForumFeed />} />
                <Route path="/forum/:id" element={<PostDetail />} />
                <Route path="/diapers" element={<Diapers />} />
                <Route path="/diaper/:id" element={<DiaperDetail />} />
                <Route path="/rankings" element={<Rankings />} />
                <Route path="/recommend" element={<Recommendations />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/auth/nbw/callback" element={<NBWCallback />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/profile/:id" element={<Profile />} />
                <Route path="/user/:id" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/about" element={<About />} />
                <Route path="/create-post" element={<CreatePost />} />
                <Route path="/messages" element={<MessagesPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/account" element={<AccountPrivacy />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/compare" element={<ComparePage />} />
                <Route path="/diaper-wiki" element={<DiaperWikiList />} />
                <Route path="/diaper-wiki/:id" element={<DiaperWiki />} />
                <Route path="/bugs" element={<BugDashboard />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/cookies" element={<CookiePolicy />} />
                <Route path="/minor-protection" element={<MinorProtection />} />
                <Route path="/external" element={<ExternalLink />} />
                <Route path="/points" element={<PointsPage />} />
                <Route path="/invite" element={<InvitePage />} />
                <Route path="/oauth/*" element={<OAuthRedirect />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </div>
        <footer className="text-center py-6 text-xs space-y-2" style={{ color: 'var(--text-muted)' }}>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <i className="fa-solid fa-baby" style={{ color: 'var(--primary)' }} />
            <span>ABDL Space 移动版 · © {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <a href="/" style={{ color: 'var(--link-color)', textDecoration: 'none' }}>广场</a>
            <a href="/rankings" style={{ color: 'var(--link-color)', textDecoration: 'none' }}><i className="fa-solid fa-trophy mr-1" />排行榜</a>
            <a href="/settings" style={{ color: 'var(--link-color)', textDecoration: 'none' }}><i className="fa-solid fa-gear mr-1" />设置</a>
            <a href="/about" style={{ color: 'var(--link-color)', textDecoration: 'none' }}><i className="fa-solid fa-circle-info mr-1" />关于</a>
          </div>
        </footer>
      </AppMainContent>
      <MobileBottomNav />
      </>
      )}
      <ToastPopup />
    </div>
    </MobileHeaderProvider>
  )
}

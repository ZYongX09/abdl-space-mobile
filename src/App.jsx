import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, useLocation, useSearchParams } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { NotificationProvider } from './contexts/NotificationContext'
import { NsfwProvider } from './contexts/NsfwContext'
import { initNBWConfig } from './utils/nbwOAuth'
import { MobileHeaderProvider, useMobileHeaderActions } from './contexts/MobileHeaderContext'
import MobileHeader from './components/MobileHeader'
import MobileBottomNav from './components/MobileBottomNav'
import ToastPopup from './components/ToastPopup'
import ErrorBoundary from './components/ErrorBoundary'
import RedirectNotice from './components/RedirectNotice'
import AdBlockNotice from './components/AdBlockNotice'
import { useExternalLinkInterceptor } from './hooks/useExternalLinkInterceptor'

// 路由级懒加载
const ForumFeed = lazy(() => import('./pages/ForumFeed'))
const PostDetail = lazy(() => import('./pages/PostDetail'))
const Home = lazy(() => import('./pages/Home'))
const DiaperDetail = lazy(() => import('./pages/DiaperDetail'))
const Rankings = lazy(() => import('./pages/Rankings'))
const ComparePage = lazy(() => import('./pages/ComparePage'))
const Recommendations = lazy(() => import('./pages/Recommendations'))
const TermWiki = lazy(() => import('./pages/TermWiki'))
const DiaperWiki = lazy(() => import('./pages/DiaperWiki'))
const DiaperWikiList = lazy(() => import('./pages/DiaperWikiList'))
const About = lazy(() => import('./pages/About'))
const CookiePolicy = lazy(() => import('./pages/CookiePolicy'))
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'))
const MinorProtection = lazy(() => import('./pages/MinorProtection'))
const TermsOfService = lazy(() => import('./pages/TermsOfService'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const NBWCallback = lazy(() => import('./pages/NBWCallback'))
const Profile = lazy(() => import('./pages/Profile'))
const Settings = lazy(() => import('./pages/Settings'))
const MessagesPage = lazy(() => import('./pages/MessagesPage'))
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const BetaRegister = lazy(() => import('./pages/BetaRegister'))
const AccountPrivacy = lazy(() => import('./pages/AccountPrivacy'))
const BetaRegister = lazy(() => import('./pages/BetaRegister'))
const AdminPage = lazy(() => import('./pages/AdminPage'))
const PointsPage = lazy(() => import('./pages/PointsPage'))
const InvitePage = lazy(() => import('./pages/InvitePage'))
const ExternalLink = lazy(() => import('./pages/ExternalLink'))
const CreatePost = lazy(() => import('./pages/CreatePost'))
const BugDashboard = lazy(() => import('./pages/BugDashboard'))

function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="spinner" />
    </div>
  )
}

const ROUTE_TITLES = {
  '/': '广场',
  '/diapers': '纸尿裤',
  '/rankings': '排行榜',
  '/compare': '纸尿裤对比',
  '/recommend': 'AI 推荐',
  '/termwiki': '术语 Wiki',
  '/diaper-wiki': '裤裤百科',
  '/profile': '个人中心',
  '/login': '登录',
  '/register': '注册',
  '/beta-register': '创始成员计划',
  '/settings': '设置',
  '/about': '关于',
  '/messages': '私信',
  '/notifications': '通知',
  '/admin': '管理后台',
  '/create-post': '发帖',
  '/account': '账户与隐私',
  '/forgot-password': '找回密码',
  '/bugs': 'Bug 追踪面板',
  '/points': '积分',
  '/invite': '邀请码',
  '/external': '外部链接',
}

function getTitle(pathname) {
  if (ROUTE_TITLES[pathname]) return ROUTE_TITLES[pathname]
  if (pathname.startsWith('/diaper/')) return '纸尿裤详情'
  if (pathname.startsWith('/diaper-wiki/')) return '裤裤百科'
  if (pathname.startsWith('/forum/')) return '帖子详情'
  if (pathname.startsWith('/user/')) return '用户主页'
  if (pathname.startsWith('/profile/')) return '用户主页'
  return 'ABDL Space'
}

/** OAuth 授权页跳转到主站 */
function OAuthRedirect() {
  const [params] = useSearchParams();
  const qs = params.toString();
  const target = `https://abdl-space.top/oauth/authorize${qs ? '?' + qs : ''}`;
  window.location.replace(target);
  return null;
}

function MobileHeaderLayout() {
  const { pathname } = useLocation()
  const { headerVisible } = useMobileHeaderActions()
  if (!headerVisible) return null
  return <MobileHeader title={getTitle(pathname)} />
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
  useExternalLinkInterceptor()

  useEffect(() => { initNBWConfig() }, [])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    document.title = getTitle(pathname) + ' — ABDL Space 移动版'
  }, [pathname])

  return (
    <MobileHeaderProvider>
    <RedirectNotice />
    <AdBlockNotice />
    <NotificationProvider>
    <NsfwProvider>
    <div className="app-layout">
      <MobileHeaderLayout />
      <AppMainContent>
        <div className="container mx-auto px-3 py-4 max-w-[720px]">
          <ErrorBoundary>
            <Suspense fallback={<Loading />}>
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
                <Route path="/beta-register" element={<BetaRegister />} />
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
      <ToastPopup />
    </div>
    </NsfwProvider>
    </NotificationProvider>
    </MobileHeaderProvider>
  )
}

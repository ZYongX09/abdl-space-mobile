import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { initNBWConfig } from './utils/nbwOAuth'
import { MobileHeaderProvider, useMobileHeaderActions } from './contexts/MobileHeaderContext'
import MobileHeader from './components/MobileHeader'
import MobileBottomNav from './components/MobileBottomNav'
import ToastPopup from './components/ToastPopup'
import ErrorBoundary from './components/ErrorBoundary'

// 路由级懒加载
const ForumFeed = lazy(() => import('./pages/ForumFeed'))
const PostDetail = lazy(() => import('./pages/PostDetail'))
const Diapers = lazy(() => import('./pages/Diapers'))
const DiaperDetail = lazy(() => import('./pages/DiaperDetail'))
const Rankings = lazy(() => import('./pages/Rankings'))
const Recommendations = lazy(() => import('./pages/Recommendations'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const NBWCallback = lazy(() => import('./pages/NBWCallback'))
const Profile = lazy(() => import('./pages/Profile'))
const Settings = lazy(() => import('./pages/Settings'))
const About = lazy(() => import('./pages/About'))
const CreatePost = lazy(() => import('./pages/CreatePost'))
const MessagesPage = lazy(() => import('./pages/MessagesPage'))
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'))
const AccountPrivacy = lazy(() => import('./pages/AccountPrivacy'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))

const ROUTE_TITLES = {
  '/': '广场',
  '/diapers': '纸尿裤',
  '/rankings': '排行榜',
  '/recommend': 'AI 推荐',
  '/profile': '个人中心',
  '/login': '登录',
  '/register': '注册',
  '/settings': '设置',
  '/about': '关于',
  '/messages': '私信',
  '/notifications': '通知',
  '/create-post': '发帖',
  '/account': '账户与隐私',
  '/forgot-password': '找回密码',
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
    <div className="app-layout">
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
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </div>
      </AppMainContent>
      <MobileBottomNav />
      <ToastPopup />
    </div>
    </MobileHeaderProvider>
  )
}

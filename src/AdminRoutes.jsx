import { lazy, Suspense } from 'react';
import { Outlet, Route, Routes } from 'react-router-dom';
import AdminRouteGate, { AdminUnknownRoute } from './pages/admin/gate.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';

const AdminOverview = lazy(() => import('./pages/admin/overview.jsx'));
const AdminUsers = lazy(() => import('./pages/admin/users.jsx'));
const AdminAppClients = lazy(() => import('./pages/admin/appClients.jsx'));
const AdminSponsors = lazy(() => import('./pages/admin/sponsors.jsx'));
const AdminBabyVerifications = lazy(() => import('./pages/admin/babyVerifications.jsx'));
const AdminBadges = lazy(() => import('./pages/admin/badges.jsx'));
const AdminPosts = lazy(() => import('./pages/admin/posts.jsx'));
const AdminComments = lazy(() => import('./pages/admin/comments.jsx'));
const AdminNovels = lazy(() => import('./pages/admin/novels.jsx'));
const AdminReports = lazy(() => import('./pages/admin/reports.jsx'));
const AdminSecurity = lazy(() => import('./pages/admin/security.jsx'));
const AdminSettings = lazy(() => import('./pages/admin/settings.jsx'));
const AdminDiapers = lazy(() => import('./pages/admin/diapers.jsx'));
const AdminNotifications = lazy(() => import('./pages/admin/notifications.jsx'));

export const ADMIN_ROUTE_TITLES = {
  '/admin': '仪表盘',
  '/admin/users': '用户管理',
  '/admin/app-clients': 'App 管理',
  '/admin/sponsors': '赞助者管理',
  '/admin/baby-verifications': '宝宝认证审核',
  '/admin/badges': '徽章体系',
  '/admin/posts': '帖子管理',
  '/admin/comments': '评论管理',
  '/admin/novels': '小说作品',
  '/admin/reports': '举报中心',
  '/admin/security': '安全中心',
  '/admin/settings': '站点设置',
  '/admin/diapers': '纸尿裤 / 品牌',
  '/admin/notifications': '推送管理',
};

export function isAdminPath(pathname) {
  return pathname === '/admin' || pathname.startsWith('/admin/');
}

function AdminPageOutlet() { return <Outlet />; }

// Gate 位于 Suspense 和所有数据页之外；身份、token 或权限变化会重建后台子树。
export default function AdminRoutes() {
  return <div className="admin-host">
    <ErrorBoundary>
      <Routes>
        <Route element={<AdminRouteGate />}>
          <Route element={<Suspense fallback={<div className="admin-console ac-access-state" role="status">正在加载管理控制台…</div>}><AdminPageOutlet /></Suspense>}>
              <Route path="/admin" element={<AdminOverview />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/app-clients" element={<AdminAppClients />} />
              <Route path="/admin/sponsors" element={<AdminSponsors />} />
              <Route path="/admin/baby-verifications" element={<AdminBabyVerifications />} />
              <Route path="/admin/badges" element={<AdminBadges />} />
              <Route path="/admin/posts" element={<AdminPosts />} />
              <Route path="/admin/comments" element={<AdminComments />} />
              <Route path="/admin/novels" element={<AdminNovels />} />
              <Route path="/admin/reports" element={<AdminReports />} />
              <Route path="/admin/security" element={<AdminSecurity />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
              <Route path="/admin/diapers" element={<AdminDiapers />} />
              <Route path="/admin/notifications" element={<AdminNotifications />} />
          </Route>
          <Route path="*" element={<AdminUnknownRoute />} />
        </Route>
      </Routes>
    </ErrorBoundary>
  </div>;
}

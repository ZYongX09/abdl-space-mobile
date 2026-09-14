import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import PageLayout from '../components/PageLayout.jsx';
import SponsorAdmin from '../sponsors/SponsorAdmin.jsx';

export default function AdminSponsors() {
  const { user } = useAuth();
  return <PageLayout>
    <nav aria-label="管理后台导航" className="mb-4"><Link to="/admin" className="btn btn-outline" style={{ minHeight: 44 }}>返回管理后台</Link></nav>
    {user?.role === 'admin' ? <SponsorAdmin key={user.id} /> : <section className="card" role="alert"><h1>仅管理员可访问赞助者管理</h1><p>请使用具有管理员权限的账户登录。权限将在每次请求时由服务器重新验证。</p><Link to="/login" className="btn btn-primary mt-4">前往登录</Link></section>}
  </PageLayout>;
}

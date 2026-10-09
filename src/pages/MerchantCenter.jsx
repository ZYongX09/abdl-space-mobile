import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import { merchantAPI } from '../api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

const emptyDraft = { display_name: '', avatar_url: '', title: '', body: '', target_url: '', status: 'draft' };

function Stat({ label, value }) {
  return <div className="card" style={{ padding: '1rem 1.1rem' }}><div className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</div><strong style={{ display: 'block', marginTop: 6, fontSize: '1.35rem' }}>{value ?? 0}</strong></div>;
}

export default function MerchantCenter() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [info, setInfo] = useState(null);
  const [ads, setAds] = useState([]);
  const [draft, setDraft] = useState(emptyDraft);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [stats, setStats] = useState(null);

  async function load() {
    if (!user) return;
    setLoading(true);
    try {
      const nextInfo = await merchantAPI.info();
      setInfo(nextInfo);
      const active = Boolean(nextInfo?.authorized || nextInfo?.active || nextInfo?.merchant?.status === 'active' || nextInfo?.is_super_admin || user?.is_super_admin);
      if (active) {
        const [nextProfile, nextAds, nextStats] = await Promise.all([merchantAPI.profile(), merchantAPI.ads(), merchantAPI.stats()]);
        setInfo(current => ({ ...current, profile: nextProfile?.profile || nextProfile, merchant: nextProfile?.merchant || nextProfile }));
        setAds(nextAds.items || nextAds.ads || []);
        setStats(nextStats?.stats || nextStats || null);
      }
    } catch (error) { if (error.status !== 401 && error.status !== 404) toast.error(error.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { if (!authLoading && user) load(); }, [authLoading, user?.id]);

  if (authLoading) return <PageLayout hero={{ icon: 'fa-briefcase', title: '商家服务中心', subtitle: '正在验证账户状态' }}><div className="card p-4">正在加载…</div></PageLayout>;
  if (!user) return <PageLayout hero={{ icon: 'fa-briefcase', title: '商家服务中心', subtitle: '面向合作商户的营销服务平台' }}><section className="card p-5"><h2 className="text-lg font-semibold mb-2">请先登录 ABDL Space 账号</h2><p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>商家服务中心使用现有账号授权登录，登录后可申请商家权限并管理广告投放。</p><button className="btn btn-primary" onClick={() => navigate('/login')}>前往登录</button></section></PageLayout>;

  const merchant = info?.merchant || info?.profile;
  const isActive = !!(info?.authorized || info?.active || merchant?.active || info?.is_super_admin || user?.is_super_admin);
  const isSuperAdmin = !!(info?.is_super_admin || user?.is_super_admin);

  async function activate(event) {
    event.preventDefault();
    if (!code.trim()) return;
    setBusy(true);
    try { await merchantAPI.activate(code.trim()); setCode(''); await load(); toast.success('商家权限已启用'); }
    catch (error) { toast.error(error.message); }
    finally { setBusy(false); }
  }

  async function saveAd(event) {
    event.preventDefault();
    setBusy(true);
    try {
      const result = editing ? await merchantAPI.updateAd(editing.id, draft) : await merchantAPI.createAd(draft);
      setAds(current => editing ? current.map(item => item.id === editing.id ? (result.ad || result) : item) : [result.ad || result, ...current]);
      setEditing(null); setDraft(emptyDraft); toast.success('广告已保存');
    } catch (error) { toast.error(error.message); }
    finally { setBusy(false); }
  }

  async function loadStats(ad) {
    try { setStats(await merchantAPI.stats(ad.id)); }
    catch (error) { toast.error(error.message); }
  }

  return <PageLayout hero={{ icon: 'fa-briefcase', title: '商家服务中心', subtitle: '面向合作商户的营销服务平台' }}>
    <div className="space-y-5">
      <section className="card" style={{ padding: '1.25rem' }}>
        <div className="flex items-start justify-between gap-4 flex-wrap"><div><h2 className="text-lg font-semibold">平台服务</h2><p className="text-sm mt-2" style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>商家服务中心为合作商户提供广告投放、商品投放和商家宣传专属账号等营销服务，使用 ABDL Space 平台积累的用户资源助推合作商户产品触达目标用户。</p></div><span className="text-xs" style={{ color: isActive ? 'var(--success, #16845b)' : 'var(--text-muted)' }}>{isActive ? '服务已开通' : '待授权'}</span></div>
      </section>
      {!isActive && !isSuperAdmin && <section className="card" style={{ padding: '1.25rem' }}><h2 className="text-lg font-semibold mb-2">输入商家注册码</h2><p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>注册码由平台管理员生成，每个注册码只能授权一个账号。</p><form className="flex gap-2 flex-wrap" onSubmit={activate}><input className="form-control" value={code} onChange={event => setCode(event.target.value)} placeholder="商家注册码" autoComplete="off" /><button className="btn btn-primary" disabled={busy || !code.trim()}>授权登录</button></form></section>}
      {isActive && <>
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3"><Stat label="广告数量" value={ads.length} /><Stat label="投放数" value={stats?.impressions ?? '—'} /><Stat label="点击总量" value={stats?.clicks ?? '—'} /><Stat label="当前权限" value={isSuperAdmin ? '超级管理员' : '商家'} /></section>
        <section className="card" style={{ padding: '1.25rem' }}><div className="flex items-center justify-between gap-3 mb-4"><h2 className="text-lg font-semibold">广告内容</h2><button className="btn btn-outline" onClick={() => { setEditing(null); setDraft(emptyDraft); }}>新建广告</button></div>{loading ? <p className="text-sm" style={{ color: 'var(--text-muted)' }}>正在加载广告…</p> : ads.length === 0 ? <p className="text-sm" style={{ color: 'var(--text-muted)' }}>暂无广告内容。</p> : <div className="space-y-2">{ads.map(ad => <div key={ad.id} className="border rounded-lg p-3" style={{ borderColor: 'var(--border)' }}><div className="flex justify-between gap-3"><div><strong>{ad.title || '未命名广告'}</strong><div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{ad.status || 'draft'} · {ad.impressions ?? 0} 次投放 · {ad.clicks ?? 0} 次点击</div></div><div className="flex gap-2"><button className="btn btn-xs btn-outline" onClick={() => { setEditing(ad); setDraft({ ...emptyDraft, ...ad }); }}>编辑</button><button className="btn btn-xs btn-outline" onClick={() => loadStats(ad)}>统计</button></div></div></div>)}</div>}</section>
        {stats && <section className="card" style={{ padding: '1.25rem' }}><h2 className="text-lg font-semibold mb-3">投放与点击统计</h2><div className="grid grid-cols-2 md:grid-cols-4 gap-3"><Stat label="投放数" value={stats.impressions} /><Stat label="链接点击" value={stats.link_clicks ?? 0} /><Stat label="图片查看" value={stats.image_views ?? 0} /><Stat label="广告跳转" value={stats.ad_navigations ?? 0} /></div></section>}
        {(editing || draft.title || draft.body || draft.target_url) && <section className="card" style={{ padding: '1.25rem' }}><h2 className="text-lg font-semibold mb-4">{editing ? '编辑广告' : '新建广告'}</h2><form className="space-y-3" onSubmit={saveAd}><input className="form-control" value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })} placeholder="广告标题" required maxLength={120} /><textarea className="form-control" rows={5} value={draft.body} onChange={e => setDraft({ ...draft, body: e.target.value })} placeholder="广告正文，支持纯文本和链接" required maxLength={5000} /><input className="form-control" value={draft.target_url} onChange={e => setDraft({ ...draft, target_url: e.target.value })} placeholder="可选跳转链接（http/https）" inputMode="url" /><select className="form-control" value={draft.status} onChange={e => setDraft({ ...draft, status: e.target.value })}><option value="draft">草稿</option><option value="active">启用</option><option value="paused">暂停</option></select><div className="flex gap-2"><button className="btn btn-primary" disabled={busy}>保存广告</button><button type="button" className="btn btn-outline" onClick={() => { setEditing(null); setDraft(emptyDraft); }}>取消</button></div></form></section>}
      </>}
    </div>
  </PageLayout>;
}

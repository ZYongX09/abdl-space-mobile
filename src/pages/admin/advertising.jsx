import { useEffect, useState } from 'react';
import AdminLayout from './layout.jsx';
import { adminAPI } from '../../api';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminAdvertising() {
  const { user } = useAuth();
  const [data, setData] = useState({ ads: [], codes: [], settings: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [codeCount, setCodeCount] = useState(1);
  const [saving, setSaving] = useState(false);
  const load = async () => {
    setLoading(true); setError('');
    try { setData(await adminAPI.advertising()); } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);
  async function generateCodes() {
    setSaving(true);
    try { await adminAPI.generateAdvertisingCodes(codeCount); await load(); }
    catch (e) { setError(e.message); }
    finally { setSaving(false); }
  }
  return <AdminLayout active="advertising">
    <section className="ac-panel">
      <div className="ac-section-heading"><div><h2>广告投放管理</h2><p>管理商家授权、广告审核、投放策略与效果数据。</p></div><span className="ac-pill slate">{user?.is_super_admin ? '超级管理员' : '管理员'}</span></div>
      {loading && <p className="ac-message">正在读取数据…</p>}
      {error && <div className="ac-message error" role="alert">{error}</div>}
      {!loading && <>
        <div className="ac-grid ac-grid-4"><div className="ac-stat-card"><span>广告数</span><strong>{data.ads?.length || 0}</strong></div><div className="ac-stat-card"><span>投放数</span><strong>{data.impressions || 0}</strong></div><div className="ac-stat-card"><span>点击总量</span><strong>{data.clicks || 0}</strong></div><div className="ac-stat-card"><span>有效注册码</span><strong>{data.codes?.filter(code => !code.used_at && !code.disabled).length || 0}</strong></div></div>
        <div className="ac-toolbar"><label>生成注册码数量 <input type="number" min="1" max="200" value={codeCount} onChange={e => setCodeCount(Number(e.target.value))} /></label><button className="ac-btn primary" disabled={saving} onClick={generateCodes}>生成注册码</button><button className="ac-btn" onClick={load}>刷新</button></div>
        <div className="ac-table-wrap"><table className="ac-table"><thead><tr><th>广告标题</th><th>商家</th><th>状态</th><th>投放</th><th>点击</th></tr></thead><tbody>{(data.ads || []).map(ad => <tr key={ad.id}><td>{ad.title || '未命名广告'}</td><td>{ad.sponsor_name || '官方'}</td><td>{ad.status || 'draft'}</td><td>{ad.impressions || 0}</td><td>{ad.clicks || 0}</td></tr>)}</tbody></table></div>
      </>}
    </section>
  </AdminLayout>;
}

import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import PageLayout from '../components/PageLayout.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useToast } from '../contexts/ToastContext.jsx';
import { babyVerificationAPI } from '../babyVerification/api.js';
import { createDecisionOperationStore, statusMeta, validateReason } from '../babyVerification/model.js';

function fmt(value) { return value ? new Date(typeof value === 'number' ? value * 1000 : value).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false }) : '—'; }

function SecurePhoto({ requestId, photo }) {
	const [state, setState] = useState({ url: '', show: false, loading: false, error: '' });
	const controller = useRef(null);
	const expiry = useRef(null);
	useEffect(() => () => { controller.current?.abort(); clearTimeout(expiry.current); }, []);
	const toggle = async () => {
		if (state.url) return setState(s => ({ ...s, show: !s.show }));
		controller.current = new AbortController(); setState(s => ({ ...s, loading: true, error: '' }));
		try {
			const access = await babyVerificationAPI.admin.photo(requestId, photo.id, controller.current.signal);
			setState({ url: access.url, show: true, loading: false, error: '' });
			if (access.expiresAt) {
				const expiresAt = typeof access.expiresAt === 'number' ? access.expiresAt * 1000 : new Date(access.expiresAt).getTime();
				expiry.current = setTimeout(() => setState({ url: '', show: false, loading: false, error: '' }), Math.max(0, expiresAt - Date.now()));
			}
		} catch (e) { if (e.name !== 'AbortError') setState({ url: '', show: false, loading: false, error: e.message }); }
	};
	return <div className="mobile-bv-photo"><button onClick={toggle}>{state.url ? <img className={state.show ? '' : 'blurred'} src={state.url} alt={photo.label || '认证照片'} referrerPolicy="no-referrer" /> : <span><i className={`fa-solid ${state.loading ? 'fa-spinner fa-spin' : 'fa-eye-slash'}`} />点击请求短期照片地址</span>}</button><small>{state.error || photo.label}</small></div>;
}

export default function AdminBabyVerifications() {
	const { user } = useAuth(); const toast = useToast();
	const [tab, setTab] = useState('reviews'); const [status, setStatus] = useState('pending');
	const [data, setData] = useState(null); const [selected, setSelected] = useState(null); const [audit, setAudit] = useState(null); const [config, setConfig] = useState(null); const [reason, setReason] = useState(''); const [configReason, setConfigReason] = useState(''); const [error, setError] = useState(''); const [loading, setLoading] = useState(true);
	const decisionOperations = useRef(createDecisionOperationStore());
	const load = useCallback(async () => { setLoading(true); setError(''); try { if (tab === 'reviews') setData(await babyVerificationAPI.admin.list({ status, limit: 50 })); if (tab === 'audit') setAudit(await babyVerificationAPI.admin.audit({ limit: 50 })); if (tab === 'config') setConfig(await babyVerificationAPI.admin.config()); } catch (e) { setError(e.message); } finally { setLoading(false); } }, [tab, status]);
	useEffect(() => { if (user?.role === 'admin') queueMicrotask(load); }, [user, load]);
	const mutate = async name => {
		let checked;
		let stableOperationId;
		try {
			checked = ['claim', 'release'].includes(name) ? undefined : validateReason(reason);
			if (name === 'approve' || name === 'reject') stableOperationId = decisionOperations.current.acquire(selected.id, name, checked);
			const next = await babyVerificationAPI.admin[name](selected.id, checked, selected, stableOperationId);
			if (stableOperationId) decisionOperations.current.settle(selected.id, name, checked);
			setSelected(next); setData(d => d ? { ...d, items: d.items.map(x => x.id === next.id ? next : x) } : d); setReason(''); toast.success('操作已确认');
		} catch (e) {
			if (stableOperationId) decisionOperations.current.reject(selected.id, name, checked, e);
			toast.error(e.message);
		}
	};
	const save = async () => { try { setConfig(await babyVerificationAPI.admin.saveConfig(config, configReason)); setConfigReason(''); toast.success('配置已保存'); } catch (e) { toast.error(e.message); } };
	if (user?.role !== 'admin') return <PageLayout><section className="card"><h1>仅管理员可访问</h1><p>所有管理接口仍会在服务端验证当前账号权限。</p><Link className="btn btn-primary" to="/login">前往登录</Link></section></PageLayout>;
	return <PageLayout hero={{ icon: 'fa-shield-heart', title: '宝宝认证审核' }}><div className="mobile-bv-admin">
		<nav><Link className="btn btn-outline" to="/admin">返回管理后台</Link>{[['reviews','审核'],['audit','审计'],['config','配置']].map(([v,l]) => <button className={`btn ${tab===v?'btn-primary':'btn-outline'}`} key={v} onClick={() => setTab(v)}>{l}</button>)}</nav>
		{tab === 'reviews' && <div className="card mobile-bv-filters"><strong>待审核 {data?.pending ?? '—'}</strong><select className="form-control" value={status} onChange={e => setStatus(e.target.value)}>{['','pending','reviewing','approved','rejected'].map(v => <option key={v} value={v}>{v ? statusMeta(v).label : '全部'}</option>)}</select><button className="btn btn-primary" onClick={load}>刷新</button></div>}
		{error && <div className="card" role="alert">{error}</div>}{loading ? <div className="card"><i className="fa-solid fa-spinner fa-spin" /> 加载中…</div> : tab === 'reviews' ? <div className="mobile-bv-list">{data?.items.map(item => <button className="card" key={item.id} onClick={async () => { try { setSelected(await babyVerificationAPI.admin.detail(item.id)); } catch(e) { toast.error(e.message); } }}><span><strong>{item.displayName || item.username || item.userId}</strong><small>{item.id} · {fmt(item.submittedAt)}</small></span><span className={`verification-pill ${statusMeta(item.status).tone}`}>{statusMeta(item.status).label}</span></button>)}{!data?.items.length && <div className="card">暂无申请</div>}</div> : tab === 'audit' ? <pre className="card mobile-bv-audit">{JSON.stringify(audit?.items || [], null, 2)}</pre> : config && <div className="card mobile-bv-config"><label><input type="checkbox" checked={config.enabled} onChange={e=>setConfig({...config,enabled:e.target.checked})}/> 启用认证</label><label>声明版本<input className="form-control" value={config.declarationVersion} onChange={e=>setConfig({...config,declarationVersion:e.target.value})}/></label><label>普通用户月额度<input className="form-control" type="number" value={config.freeMonthlyLimit} onChange={e=>setConfig({...config,freeMonthlyLimit:Number(e.target.value)})}/></label><label>赞助用户月额度<input className="form-control" type="number" value={config.sponsorMonthlyLimit} onChange={e=>setConfig({...config,sponsorMonthlyLimit:Number(e.target.value)})}/></label><label>拍摄会话有效期（秒）<input className="form-control" type="number" value={config.captureTtlSeconds} onChange={e=>setConfig({...config,captureTtlSeconds:Number(e.target.value)})}/></label><label>上传授权有效期（秒）<input className="form-control" type="number" value={config.uploadTtlSeconds} onChange={e=>setConfig({...config,uploadTtlSeconds:Number(e.target.value)})}/></label><label>单张照片上限（字节）<input className="form-control" type="number" value={config.maxEvidenceSize} onChange={e=>setConfig({...config,maxEvidenceSize:Number(e.target.value)})}/></label><label>修改理由<input className="form-control" value={configReason} maxLength="500" onChange={e=>setConfigReason(e.target.value)}/></label><button className="btn btn-primary" onClick={save}>保存</button></div>}
		{selected && <div className="mobile-bv-sheet"><div className="mobile-bv-sheet-head"><div><h2>{selected.displayName || selected.username}</h2><small>{selected.id}</small></div><button className="btn btn-outline" onClick={() => setSelected(null)}>关闭</button></div><section className="card"><h3>已认证个人资料</h3>{Object.entries(selected.profile).map(([k,v]) => <p key={k}><strong>{k}</strong>：{String(v)}</p>)}</section><section><h3>服务端认证要求与照片</h3><p>照片默认模糊且不加载；点击单张后才请求短期 URL。</p><div className="mobile-bv-photos">{selected.photos.map(p => <SecurePhoto key={p.id} requestId={selected.id} photo={p}/>)}</div></section><textarea className="form-control" rows="3" value={reason} onChange={e=>setReason(e.target.value)} placeholder="操作理由（通过/驳回/吊销/补发必填）"/><div className="mobile-bv-actions"><button className="btn btn-outline" onClick={()=>mutate(selected.claimedBy?'release':'claim')}>{selected.claimedBy?'释放':'认领'}</button><button className="btn btn-primary" onClick={()=>mutate('approve')}>通过</button><button className="btn btn-outline" onClick={()=>mutate('reject')}>驳回</button><button className="btn btn-outline" onClick={()=>mutate('revoke')}>吊销</button><button className="btn btn-outline" onClick={()=>mutate('reissue')}>补发</button></div></div>}
	</div></PageLayout>;
}

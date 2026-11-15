import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { adminSessionKey } from '../pages/admin/access.js';
import { FormField, Modal, useConfirm } from '../pages/admin/ui.jsx';
import { createPostModerationAPI } from './api.js';
import { createPostModerationController } from './controller.js';
import {
  ARCHIVE_LABELS,
  DELETE_LABELS,
  ERROR_LABELS,
  MAX_REASON,
  assetSummary,
  canRetry,
  initialModerationState,
  legalNotice,
  validateReason,
} from './model.js';
import './postModeration.css';

const PENDING_LABELS = {
  target: '正在读取处理状态…',
  detail: '正在读取案件回执…',
  create: '正在提交违规处理；请勿重复操作或关闭页面…',
  snapshot: '正在读取冻结快照…',
  thumbnail: '正在读取私有缩略图…',
  retry: '正在请求重新调度安全任务…',
};

const PHASE_LABELS = {
  idle: '尚未读取处理状态',
  ready: '可提交违规处理',
  writing: '正在写入永久留证',
  stored: '案件已入库，永久留证',
  unknown: '写入结果未确认，只能查询回执',
  conflict: '源内容已变化，需重新核对',
  'read-error': '读取失败，尚未确认可提交',
  blocked: '管理员会话已停止，敏感留证已清空',
};

/** 预览使用与留证相同模板；理由为空时以占位词展示完整句式。 */
function noticePreview(reason) {
  try {
    return legalNotice(reason || '处理理由');
  } catch {
    return '';
  }
}

function phaseLabel(phase) {
  return PHASE_LABELS[phase] || '处理状态未知';
}

export default function PostModerationModal({ post, onClose, onStored, attempts }) {
  const { user, accounts = [] } = useAuth();
  const confirm = useConfirm();
  const token = accounts.find(account => String(account.id) === String(user?.id))?.token || '';
  const sessionKey = adminSessionKey(user, token);
  const session = useRef({ user, token });
  useEffect(() => { session.current = { user, token }; }, [user, token]);

  const [snapshot, setSnapshot] = useState({ key: '', state: initialModerationState() });
  const controllerRef = useRef(null);
  const onStoredRef = useRef(onStored);
  useEffect(() => { onStoredRef.current = onStored; }, [onStored]);

  const openKey = `${sessionKey}:${post.id}`;
  useEffect(() => {
    let live = true;
    const api = createPostModerationAPI({
      base: import.meta.env.VITE_API_BASE ?? '',
      getSession: () => session.current,
      isCurrent: () => live && sessionKey === adminSessionKey(session.current?.user, session.current?.token),
      onRejected: () => window.dispatchEvent(new CustomEvent('admin-session-rejected', { detail: { sessionKey } })),
    });
    const controller = createPostModerationController({
      api,
      attempts,
      onChange: state => { if (live) setSnapshot({ key: openKey, state }); },
      onStored: target => { if (live) onStoredRef.current?.(target); },
    });
    controllerRef.current = controller;
    setSnapshot({ key: openKey, state: controller.getState() });
    void controller.open(post.id);

    const block = () => {
      live = false;
      controller.block();
      setSnapshot({ key: openKey, state: controller.getState() });
    };
    const storage = event => {
      if (!event.key || ['abdl_accounts', 'abdl_active_account', 'abdl_currentUser'].includes(event.key)) block();
    };
    const rejected = event => { if (event.detail?.sessionKey === sessionKey) block(); };
    window.addEventListener('auth-session-changing', block);
    window.addEventListener('storage', storage);
    window.addEventListener('pagehide', block);
    window.addEventListener('admin-session-rejected', rejected);
    return () => {
      live = false;
      controller.dispose();
      if (controllerRef.current === controller) controllerRef.current = null;
      window.removeEventListener('auth-session-changing', block);
      window.removeEventListener('storage', storage);
      window.removeEventListener('pagehide', block);
      window.removeEventListener('admin-session-rejected', rejected);
    };
  }, [attempts, openKey, post.id, sessionKey]);

  const state = snapshot.key === openKey ? snapshot.state : initialModerationState();
  const moderation = state.target?.moderation || null;
  const busy = !!state.pending;
  const writable = ['ready', 'conflict'].includes(state.phase) && !busy;
  let reasonError = '';
  if (state.reason.trim()) {
    try { validateReason(state.reason); } catch (error) { reasonError = error.message; }
  }
  const canSubmit = state.phase === 'ready' && !moderation && state.acknowledged && !busy && !reasonError;
  const close = () => { if (!busy) onClose(); };
  const controller = controllerRef.current;

  const retry = async () => {
    if (!controller || busy) return;
    const ok = await confirm({
      title: '重新调度安全任务',
      message: '只会重新排队归档与 COS 删除检查，不会绕过安全检查。重新调度已受理，不代表已完成。',
      okText: '确认重新调度',
      danger: true,
    });
    if (ok) await controller.retry({ confirmed: true });
  };

  return (
    <Modal
      open
      onClose={close}
      title={`违规处理与留证 · 帖子 #${post.id}`}
      width={880}
      className="pm-modal"
      footer={<>
        <button type="button" className="ac-btn" disabled={busy} onClick={close}>{busy ? '等待回执后关闭' : '关闭'}</button>
        <button type="button" className="ac-btn danger solid" disabled={!canSubmit} onClick={() => controller?.submit({ confirmed: true })}>{moderation ? '案件已入库' : state.phase === 'writing' ? '正在提交…' : '提交违规处理'}</button>
      </>}
    >
      <div className="pm-body">
        <p className="pm-lead">先核对帖子内容与作者，再填写处理理由。提交后会创建永久留证案件；列表将在案件入库后刷新。</p>
        <dl className="pm-target">
          <div><dt>帖子</dt><dd>#{post.id}</dd></div>
          <div><dt>作者</dt><dd>@{post.user?.username || '未知用户'}（ID: {post.user?.id ?? '未提供'}）</dd></div>
          <div><dt>状态</dt><dd>{phaseLabel(state.phase)}</dd></div>
        </dl>

        <div className="pm-warning" role="note">
          <p><strong>请勿写入个人信息：</strong>处理理由会写入永久留证，并向公众展示法律提示。请勿填写姓名、电话、住址、身份证号、聊天记录或其他个人信息。</p>
          <p><strong>永久留证与 COS：</strong>提交即永久留证且不可撤销；附件归档与 COS 删除是独立任务，案件入库不代表源文件或 COS 对象已删除。</p>
        </div>

        <FormField
          label="处理理由"
          htmlFor="pm-reason"
          required
          error={reasonError}
          hint={`1–${MAX_REASON} 字纯文本；首尾空白会被去除，不接受 NUL 字符。`}
        >
          <textarea
            id="pm-reason"
            className="ac-textarea pm-reason"
            value={state.reason}
            maxLength={MAX_REASON}
            disabled={!writable}
            placeholder="例如：该内容包含违反社区规则的公开引流信息"
            onChange={event => controller?.changeReason(event.target.value)}
          />
        </FormField>
        <p className="pm-counter" aria-live="off">{state.reason.trim().length} / {MAX_REASON} 字（不含首尾空白）</p>

        <div className="pm-notice">
          <div className="pm-section-label">法律提示预览（提交后随案件永久留证）</div>
          <p>{noticePreview(state.reason)}</p>
        </div>

        <label className="ac-check-row pm-ack">
          <input
            type="checkbox"
            checked={state.acknowledged}
            disabled={state.phase !== 'ready' || busy}
            onChange={event => controller?.acknowledge(event.target.checked)}
          />
          <span>我已核对帖子与理由，理解留证不可撤销，且处理成功不代表 COS 已全部删除。</span>
        </label>

        <div className="pm-live" role="status" aria-live="polite">
          {busy && <p className="pm-pending">{PENDING_LABELS[state.pending] || '正在处理…'}</p>}
          {state.message && <p className="pm-message">{state.message}</p>}
        </div>
        <div role="alert" aria-live="assertive">
          {state.error && <p className="pm-error">{state.error}</p>}
        </div>

        {moderation ? (
          <section className="pm-case" aria-label="案件留证与附件状态">
            <h3>案件已入库</h3>
            <dl className="pm-case-meta">
              <div><dt>案件 ID</dt><dd><code>{moderation.id}</code></dd></div>
              <div><dt>帖子</dt><dd>#{moderation.post_id}</dd></div>
              <div><dt>处理理由</dt><dd>{moderation.reason}</dd></div>
              <div><dt>法律提示</dt><dd>{moderation.notice}</dd></div>
            </dl>
            <p className="pm-asset-summary">{assetSummary(moderation.assets)}</p>
            {moderation.assets.length > 0 && (
              <ul className="pm-assets">
                {moderation.assets.map(asset => (
                  <li key={asset.id} className="pm-asset">
                    <div className="pm-asset-head">附件 {asset.position + 1} · <code>{asset.id}</code></div>
                    <div className="pm-asset-state">归档：{ARCHIVE_LABELS[asset.archive_state]}</div>
                    <div className="pm-asset-state">删除：{DELETE_LABELS[asset.delete_state]}</div>
                    {asset.error_code && <div className="pm-error">异常：{ERROR_LABELS[asset.error_code]}</div>}
                    {asset.thumbnail_available && !state.thumbnails[asset.id] && (
                      <button type="button" className="ac-btn" disabled={busy} onClick={() => controller?.thumbnail(asset.id)}>读取私有缩略图</button>
                    )}
                    {state.thumbnails[asset.id] && (
                      <img className="pm-thumb" src={state.thumbnails[asset.id]} alt={`附件 ${asset.position + 1} 的私有缩略图`} />
                    )}
                  </li>
                ))}
              </ul>
            )}
            <div className="pm-evidence">
              <button type="button" className="ac-btn" disabled={busy} onClick={() => controller?.snapshot()}>显式读取冻结快照</button>
              <p className="pm-note">快照仅在点击后按需读取，以转义文本展示，不会自动载入。</p>
              {state.snapshotText && <pre className="pm-snapshot" aria-label="冻结快照 JSON 文本">{state.snapshotText}</pre>}
            </div>
            {canRetry(moderation) && (
              <div className="pm-retry">
                <button type="button" className="ac-btn" disabled={busy || state.retryAccepted} onClick={retry}>
                  {state.retryAccepted ? '已请求重新调度' : '重新调度安全任务'}
                </button>
                <p className="pm-note">重新调度已受理，不代表已完成；请主动刷新处理状态，不要连续重试。</p>
              </div>
            )}
          </section>
        ) : (
          <div className="pm-readback">
            <button type="button" className="ac-btn" disabled={busy || state.phase === 'writing'} onClick={() => controller?.readTarget()}>
              {state.phase === 'unknown' || state.phase === 'conflict' ? '查询回执（不会创建第二次处理）' : '重新读取处理状态'}
            </button>
            <p className="pm-note">未知结果不会自动重试；只能查询回执，并沿用本次操作标识，避免重复处理。</p>
          </div>
        )}
      </div>
    </Modal>
  );
}

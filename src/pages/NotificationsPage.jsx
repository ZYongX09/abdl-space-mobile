import { useEffect, useRef } from 'react';
import { accountSessionKey } from '../notifications/scheduler.js';
import PageLayout from '../components/PageLayout';
import { LoadingSkeleton, EmptyState } from '../components/Feedback';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { Link, useNavigate } from 'react-router-dom';

export default function NotificationsPage() {
  const { user, accounts } = useAuth();
  const session = accountSessionKey(user, accounts);
  const { notificationDetails, notificationsError, sessionPaused, detailsKey, readAllNotifications, fetchUnread } = useNotifications();
  const notifications = notificationDetails?.notifications || [];
  const unreadCount = notificationDetails?.unread_count || 0;
  const attempted = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (detailsKey === null || session === null || !notificationDetails || notificationsError || sessionPaused) return;
    const visit = JSON.stringify([session, detailsKey]);
    if (attempted.current === visit) return;
    attempted.current = visit;
    if (unreadCount > 0) void readAllNotifications(detailsKey);
  }, [session, detailsKey, notificationDetails, notificationsError, sessionPaused, unreadCount, readAllNotifications]);



  if (!user) {
    return (
      <>
      <PageLayout hero={{ icon: 'fa-bell', title: '通知' }}>
        <div className="empty-state">
          <div className="icon"><i className="fa-solid fa-bell" /></div>
          <h3>请先登录</h3>
          <Link to="/login" className="btn btn-primary mt-4">去登录</Link>
        </div>
      </PageLayout>
      </>
    );
  }

  return (
    <>
    <PageLayout hero={{ icon: 'fa-bell', title: '通知', subtitle: unreadCount > 0 ? `${unreadCount} 条未读` : undefined }}>
      {notificationsError && <p role="status">{notificationsError.message || '通知暂不可用'} <button className="btn" type="button" onClick={fetchUnread}>重试</button></p>}
      {sessionPaused ? <p role="status">会话已失效，请重新登录。</p> : !notificationDetails ? (
        !notificationsError && <LoadingSkeleton count={4} height={70} />
      ) : notifications.length === 0 ? (
        <EmptyState icon="fa-bell-slash" title="暂无通知" description="新的互动通知会出现在这里" />
      ) : (
        <div className="space-y-2">
          {notifications.map(n => {
            const link = n.post_id ? `/forum/${n.post_id}` : n.target_type === 'post' ? `/forum/${n.target_id}` : null;
            return (
            <div
              key={n.id}
              className="card flex items-center gap-3"
              style={{
                padding: '1rem',
                borderLeft: n.read ? 'none' : '3px solid var(--primary)',
                opacity: n.read ? 0.7 : 1,
                cursor: link ? 'pointer' : 'default',
              }}
              onClick={() => link && navigate(link)}
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: n.type === 'like' ? 'rgba(232, 131, 124, 0.15)' : n.type === 'comment' ? 'rgba(168, 216, 240, 0.2)' : 'var(--primary-light)',
                  color: n.type === 'like' ? 'var(--danger)' : 'var(--primary-dark)',
                }}
              >
                <i className={`fa-solid ${n.type === 'like' ? 'fa-heart' : n.type === 'comment' ? 'fa-comment' : 'fa-bell'} text-sm`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm" style={{ color: 'var(--text)' }}>{n.message}</p>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {n.created_at ? new Date(n.created_at + 'Z').toLocaleString('zh-CN') : ''}
                </span>
              </div>
            </div>
            );
          })}
        </div>
      )}
    </PageLayout>
    </>
  );
}

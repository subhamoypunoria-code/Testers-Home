import { useEffect } from 'react';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Avatar from '../../components/ui/Avatar';
import EmptyState from '../../components/ui/EmptyState';
import Reveal from '../../components/animation/Reveal';
import useNotificationStore from '../../store/notificationStore';
import { timeAgo } from '../../utils/helpers';

const NotificationsPage = () => {
  const { notifications, unreadCount, fetchNotifications, markRead, markAllRead, delete: del } = useNotificationStore();

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  return (
    <AppShell
      title="Notifications"
      subtitle={unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
      actions={unreadCount > 0 && (
        <Button variant="secondary" size="sm" icon={<CheckCheck size={13} />} onClick={markAllRead}>
          Mark all read
        </Button>
      )}
    >
      <div className="p-5 max-w-2xl">
        {notifications.length === 0 ? (
          <EmptyState icon={<Bell size={36} />} title="No notifications" description="You're all caught up!" />
        ) : (
          <Reveal variant="up">
            <Card className="p-0 overflow-hidden divide-y divide-white/[0.04]">
              {notifications.map(n => (
                <div key={n._id}
                  className={`flex items-start gap-3 px-5 py-4 transition-colors ${!n.isRead ? 'bg-[rgba(255,92,26,0.03)]' : ''} hover:bg-white/[0.03] cursor-pointer`}
                  onClick={() => !n.isRead && markRead(n._id)}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {n.sender
                      ? <Avatar user={n.sender} size="sm" />
                      : <div className="w-8 h-8 bg-[rgba(255,92,26,0.1)] rounded-full flex items-center justify-center"><Bell size={14} className="text-[#ff5c1a]" /></div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/80 leading-snug">{n.title}</p>
                    <p className="text-xs text-white/50 mt-0.5">{n.message}</p>
                    <p className="text-xs text-white/30 mt-1">{timeAgo(n.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!n.isRead && <div className="w-2 h-2 bg-[#ff5c1a] rounded-full" />}
                    <button onClick={e => { e.stopPropagation(); del(n._id); }} className="text-white/30 hover:text-red-400 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </Card>
          </Reveal>
        )}
      </div>
    </AppShell>
  );
};

export default NotificationsPage;

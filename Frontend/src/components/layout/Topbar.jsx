import { Bell, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import useNotificationStore from '../../store/notificationStore';
import useAuthStore from '../../store/authStore';
import Avatar from '../ui/Avatar';

const Topbar = ({ title, subtitle, actions, onMenuClick }) => {
  const { unreadCount } = useNotificationStore();
  const { user } = useAuthStore();

  return (
    <header className="h-14 bg-[rgba(10,10,10,0.65)] backdrop-blur-2xl border-b border-white/[0.08] flex items-center gap-4 px-5 flex-shrink-0">
      {onMenuClick && (
        <button onClick={onMenuClick} className="text-white/40 hover:text-white bg-transparent border-none cursor-pointer">
          <Menu size={18} />
        </button>
      )}
      <div className="flex-1 min-w-0">
        {title && (
          <h1 className="font-sora text-sm font-semibold text-white truncate">
            {title}
          </h1>
        )}
        {subtitle && (
          <p className="text-[11px] text-white/35 mt-0.5">{subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {actions}
        <Link to="/notifications" className="relative p-2 text-white/40 hover:text-white transition-colors duration-200 flex">
          <Bell size={17} />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ff5c1a] rounded-full shadow-[0_0_6px_rgba(255,92,26,0.6)]" />
          )}
        </Link>
        <Link to="/settings">
          <Avatar user={user} size="sm" />
        </Link>
      </div>
    </header>
  );
};

export default Topbar;

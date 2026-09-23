import { NavLink, useParams } from 'react-router-dom';
import {
  LayoutDashboard, FolderOpen, Bug, BarChart3, Bell, Settings,
  Users, Trash2, ChevronDown, Shield, LogOut, Plus
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useProjectStore from '../../store/projectStore';
import useNotificationStore from '../../store/notificationStore';
import Avatar from '../ui/Avatar';
import { truncate } from '../../utils/helpers';
import { useState } from 'react';

const NavItem = ({ to, icon, label, badge }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-200 ${
        isActive
          ? 'bg-[rgba(255,92,26,0.12)] text-[#ffb59e] font-semibold'
          : 'text-white/45 hover:text-white hover:bg-white/[0.04]'
      }`
    }
  >
    {icon}
    <span>{label}</span>
    {badge > 0 && (
      <span className="ml-auto bg-[#ff5c1a] text-white text-[10px] font-bold rounded-full w-[18px] h-[18px] flex items-center justify-center">
        {badge > 9 ? '9+' : badge}
      </span>
    )}
  </NavLink>
);

const Sidebar = ({ onCreateProject }) => {
  const { user, logout } = useAuthStore();
  const { projects } = useProjectStore();
  const { unreadCount } = useNotificationStore();
  const { projectId } = useParams();
  const [projectsOpen, setProjectsOpen] = useState(true);

  return (
    <aside className="w-60 h-screen flex flex-col flex-shrink-0 bg-[rgba(10,10,10,0.72)] backdrop-blur-2xl border-r border-white/[0.08]">
      {/* Logo */}
      <div className="p-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#ff5c1a] rounded-lg flex items-center justify-center shadow-[0_0_16px_rgba(255,92,26,0.4)]">
            <Shield size={14} color="#fff" />
          </div>
          <span className="font-sora font-bold text-sm text-white">
            Testers Home
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-0.5">
        <NavItem to="/dashboard" icon={<LayoutDashboard size={15} />} label="Dashboard" />
        <NavItem to="/notifications" icon={<Bell size={15} />} label="Notifications" badge={unreadCount} />

        {/* Projects section */}
        <div className="pt-4 pb-1">
          <div
            className="flex items-center justify-between px-3 mb-1.5 cursor-pointer"
            onClick={() => setProjectsOpen(o => !o)}
          >
            <span className="text-[10px] font-bold text-white/25 uppercase tracking-[0.12em]">
              Projects
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={e => { e.stopPropagation(); onCreateProject && onCreateProject(); }}
                className="text-white/30 hover:text-[#ff5c1a] bg-transparent border-none cursor-pointer flex items-center transition-colors duration-200"
              >
                <Plus size={12} />
              </button>
              <ChevronDown size={11} className="text-white/30 transition-transform duration-200" style={{ transform: projectsOpen ? '' : 'rotate(-90deg)' }} />
            </div>
          </div>
          {projectsOpen && (
            <div className="flex flex-col gap-0.5">
              {projects.slice(0, 8).map(p => {
                const active = projectId === p._id;
                return (
                  <NavLink
                    key={p._id}
                    to={`/projects/${p._id}/defects`}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                        isActive || active
                          ? 'bg-[rgba(255,92,26,0.12)] text-[#ffb59e] font-semibold'
                          : 'text-white/45 hover:text-white hover:bg-white/[0.04]'
                      }`
                    }
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current flex-shrink-0" />
                    {truncate(p.name, 22)}
                  </NavLink>
                );
              })}
              <NavLink
                to="/projects"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-white/25 hover:text-white/60 hover:bg-white/[0.04] transition-all duration-200"
              >
                <FolderOpen size={12} />
                All projects
              </NavLink>
            </div>
          )}
        </div>

        <div className="pt-3 flex flex-col gap-0.5">
          <span className="px-3 text-[10px] font-bold text-white/25 uppercase tracking-[0.12em] block mb-1">
            Workspace
          </span>
          {projectId && (
            <>
              <NavItem to={`/projects/${projectId}/defects`} icon={<Bug size={15} />} label="Defects" />
              <NavItem to={`/projects/${projectId}/analytics`} icon={<BarChart3 size={15} />} label="Analytics" />
              <NavItem to={`/projects/${projectId}/team`} icon={<Users size={15} />} label="Team" />
              <NavItem to={`/projects/${projectId}/trash`} icon={<Trash2 size={15} />} label="Trash" />
            </>
          )}
          <NavItem to="/settings" icon={<Settings size={15} />} label="Settings" />
        </div>
      </div>

      {/* User footer */}
      <div className="p-3 border-t border-white/[0.06]">
        <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.05] border border-white/[0.08] backdrop-blur-md">
          <Avatar user={user} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
            <p className="text-[11px] text-white/35 truncate capitalize">{user?.role?.replace('_', ' ')}</p>
          </div>
          <button
            onClick={logout}
            className="text-white/30 hover:text-red-500 bg-transparent border-none cursor-pointer flex items-center transition-colors duration-200"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderOpen, Plus, Search, Bug, Users, Calendar } from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import PageLoader from '../../components/ui/Loader';
import Avatar from '../../components/ui/Avatar';
import Reveal from '../../components/animation/Reveal';
import CreateProjectForm from './CreateProjectForm';
import useProjectStore from '../../store/projectStore';
import { formatDate, capitalize } from '../../utils/helpers';

const statusColors = {
  active: 'bg-emerald-500',
  archived: 'bg-gray-500',
  inactive: 'bg-yellow-500',
  completed: 'bg-blue-500',
};

const priorityColors = {
  low: 'text-white/40',
  medium: 'text-yellow-400',
  high: 'text-[#ff5c1a]',
  critical: 'text-red-400',
};

const ProjectCard = ({ project, onClick }) => (
  <Card onClick={onClick} className="p-5 block group cursor-pointer">
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 bg-[#ff5c1a]/10 rounded-lg flex items-center justify-center">
          <FolderOpen size={16} className="text-[#ff5c1a]" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white/90 group-hover:text-white transition-colors">{project.name}</h3>
          <span className="text-xs text-white/30 font-mono">{project.key}</span>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <div className={`w-1.5 h-1.5 rounded-full ${statusColors[project.status] || 'bg-gray-500'}`} />
        <span className="text-xs text-white/40">{capitalize(project.status)}</span>
      </div>
    </div>

    {project.description && (
      <p className="text-xs text-white/40 mb-4 leading-relaxed line-clamp-2">{project.description}</p>
    )}

    <div className="flex flex-wrap items-center gap-4 text-xs text-white/40 mb-4">
      <span className="flex items-center gap-1"><Bug size={11} />{project.defectCount || 0} defects</span>
      <span className="flex items-center gap-1"><Users size={11} />{project.members?.length || 0} members</span>
      {project.endDate && <span className="flex items-center gap-1"><Calendar size={11} />{formatDate(project.endDate)}</span>}
    </div>

    <div className="flex items-center justify-between">
      <div className="flex -space-x-1.5">
        {project.members?.slice(0, 4).map(m => (
          <Avatar key={m.user?._id} user={m.user} size="xs" />
        ))}
      </div>
      <span className={`text-xs font-medium ${priorityColors[project.priority]}`}>
        {capitalize(project.priority)} priority
      </span>
    </div>
  </Card>
);

const ProjectsPage = () => {
  const { projects, fetchProjects, loading } = useProjectStore();
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.key.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell
      title="Projects"
      subtitle={`${projects.length} total`}
      actions={
        <Button icon={<Plus size={14} />} size="sm" onClick={() => setCreateOpen(true)}>
          New Project
        </Button>
      }
    >
      <div className="p-4 sm:p-6">
        <Reveal variant="up">
          <div className="flex items-center gap-3 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search projects..."
                icon={<Search size={14} className="text-white/30" />}
              />
            </div>
          </div>
        </Reveal>

        {loading ? <PageLoader /> : filtered.length === 0 ? (
          <EmptyState
            icon={<FolderOpen size={40} />}
            title="No projects found"
            description={search ? 'Try a different search term' : 'Create your first project to get started'}
            action={!search && <Button icon={<Plus size={14} />} size="sm" onClick={() => setCreateOpen(true)}>Create Project</Button>}
          />
        ) : (
          <Reveal variant="up" delay={0.05}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(p => (
                <ProjectCard key={p._id} project={p} onClick={() => navigate(`/projects/${p._id}/defects`)} />
              ))}
            </div>
          </Reveal>
        )}
      </div>

      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="New Project" size="lg">
        <CreateProjectForm onSuccess={() => setCreateOpen(false)} />
      </Modal>
    </AppShell>
  );
};

export default ProjectsPage;

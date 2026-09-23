import { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import Modal from '../ui/Modal';
import CreateProjectForm from '../../pages/projects/CreateProjectForm';

const AppShell = ({ children, title, subtitle, actions }) => {
  const [createProjectOpen, setCreateProjectOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#000000] overflow-hidden relative">
      {/* Ambient glass-mesh background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute -top-[10%] right-[5%] w-[45%] h-[50%] rounded-full bg-[#ff5c1a]/[0.06] blur-[120px]" />
        <div className="absolute bottom-[5%] left-[10%] w-[35%] h-[40%] rounded-full bg-purple-500/[0.05] blur-[100px]" />
        <div className="absolute top-[30%] left-[30%] w-[25%] h-[30%] rounded-full bg-teal-500/[0.04] blur-[90px]" />
      </div>

      <Sidebar onCreateProject={() => setCreateProjectOpen(true)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        <Topbar title={title} subtitle={subtitle} actions={actions} />
        <main className="flex-1 overflow-y-auto relative">
          {children}
        </main>
      </div>

      <Modal isOpen={createProjectOpen} onClose={() => setCreateProjectOpen(false)} title="New Project" size="lg">
        <CreateProjectForm onSuccess={() => setCreateProjectOpen(false)} />
      </Modal>
    </div>
  );
};

export default AppShell;

import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { workspaceAPI } from '../services/api';
import { LayoutDashboard, FolderKanban, LogOut, Plus, ChevronDown, Menu, X } from 'lucide-react';
import CreateWorkspaceModal from '../components/CreateWorkspaceModal';
import toast from 'react-hot-toast';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [workspaces, setWorkspaces] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    workspaceAPI.getAll().then(r => setWorkspaces(r.data)).catch(() => {});
  }, [location]);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'} transition-all duration-300 bg-[#12121f] border-r border-[#2a2a3e] flex flex-col flex-shrink-0`}>
        <div className="p-4 border-b border-[#2a2a3e]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center font-bold text-white text-sm">TF</div>
            <span className="font-semibold text-white text-lg">TaskFlow</span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          <Link to="/" className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${location.pathname === '/' ? 'bg-brand-500/20 text-brand-300' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
            <LayoutDashboard size={16} /> Dashboard
          </Link>

          <div className="pt-4">
            <div className="flex items-center justify-between px-3 mb-2">
              <span className="text-xs text-gray-500 uppercase tracking-wider">Workspaces</span>
              <button onClick={() => setShowCreate(true)} className="text-gray-500 hover:text-brand-400 transition-colors">
                <Plus size={14} />
              </button>
            </div>
            {workspaces.map(ws => (
              <Link key={ws._id} to={`/workspace/${ws._id}`}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${location.pathname.includes(ws._id) ? 'bg-brand-500/20 text-brand-300' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: ws.color || '#6366f1' }} />
                <span className="truncate">{ws.name}</span>
              </Link>
            ))}
          </div>
        </nav>

        <div className="p-3 border-t border-[#2a2a3e]">
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400 font-medium text-sm flex-shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
            <button onClick={handleLogout} className="text-gray-500 hover:text-red-400 transition-colors">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-12 bg-[#12121f] border-b border-[#2a2a3e] flex items-center px-4">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="btn-ghost p-1.5 mr-2">
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet context={{ workspaces, setWorkspaces }} />
        </main>
      </div>

      {showCreate && <CreateWorkspaceModal onClose={() => setShowCreate(false)} onCreated={ws => { setWorkspaces(p => [...p, ws]); setShowCreate(false); navigate(`/workspace/${ws._id}`); }} />}
    </div>
  );
}
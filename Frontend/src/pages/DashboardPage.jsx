import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { workspaceAPI, dashboardAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CheckSquare, AlertTriangle, TrendingUp, Users, FolderKanban, Plus } from 'lucide-react';
import CreateWorkspaceModal from '../components/CreateWorkspaceModal';

export default function DashboardPage() {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState([]);
  const [stats, setStats] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    workspaceAPI.getAll().then(r => {
      setWorkspaces(r.data);
      if (r.data[0]) {
        dashboardAPI.get(r.data[0]._id).then(s => setStats(s.data)).catch(() => {});
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Good {getGreeting()}, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="text-gray-500 mt-1">Here's what's happening across your workspaces.</p>
      </div>

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Tasks', value: stats.totalTasks, icon: CheckSquare, color: 'text-brand-400', bg: 'bg-brand-500/10' },
            { label: 'In Progress', value: stats.byStatus.inprogress, icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { label: 'Overdue', value: stats.overdue, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10' },
            { label: 'Completion', value: `${stats.completionRate}%`, icon: Users, color: 'text-green-400', bg: 'bg-green-500/10' },
          ].map(s => (
            <div key={s.label} className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-500">{s.label}</span>
                <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center`}>
                  <s.icon size={16} className={s.color} />
                </div>
              </div>
              <p className="text-2xl font-bold text-white">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Workspaces</h2>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> New Workspace
        </button>
      </div>

      {workspaces.length === 0 ? (
        <div className="card p-12 text-center">
          <FolderKanban size={40} className="text-gray-600 mx-auto mb-3" />
          <h3 className="text-gray-400 font-medium mb-2">No workspaces yet</h3>
          <p className="text-gray-600 text-sm mb-4">Create your first workspace to get started</p>
          <button onClick={() => setShowCreate(true)} className="btn-primary inline-flex items-center gap-2">
            <Plus size={16} /> Create Workspace
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workspaces.map(ws => (
            <Link key={ws._id} to={`/workspace/${ws._id}`} className="card p-5 hover:border-brand-500/50 transition-colors group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                  style={{ background: ws.color || '#6366f1' }}>
                  {ws.name[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-white group-hover:text-brand-300 transition-colors">{ws.name}</h3>
                  <p className="text-xs text-gray-500">{ws.members?.length} member{ws.members?.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
              {ws.description && <p className="text-sm text-gray-500 truncate">{ws.description}</p>}
            </Link>
          ))}
        </div>
      )}

      {showCreate && <CreateWorkspaceModal onClose={() => setShowCreate(false)} onCreated={ws => { setWorkspaces(p => [...p, ws]); setShowCreate(false); }} />}
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
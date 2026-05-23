import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { workspaceAPI, projectAPI, dashboardAPI, activityAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Users, BarChart3, Clock, Trash2, UserPlus, FolderKanban } from 'lucide-react';
import toast from 'react-hot-toast';
import CreateProjectModal from '../components/CreateProjectModal';
import MembersModal from '../components/MembersModal';

export default function WorkspacePage() {
  const { workspaceId } = useParams();
  const { user } = useAuth();
  const [workspace, setWorkspace] = useState(null);
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, [workspaceId]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [ws, proj, dash, act] = await Promise.all([
        workspaceAPI.getOne(workspaceId),
        projectAPI.getByWorkspace(workspaceId),
        dashboardAPI.get(workspaceId),
        activityAPI.get(workspaceId),
      ]);
      setWorkspace(ws.data);
      setProjects(proj.data);
      setStats(dash.data);
      setActivity(act.data);
    } catch (err) {
      toast.error('Failed to load workspace');
    } finally { setLoading(false); }
  };

  const isAdmin = workspace?.owner?._id === user?._id ||
    workspace?.members?.find(m => m.user?._id === user?._id)?.role === 'admin';

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl"
            style={{ background: workspace?.color || '#6366f1' }}>
            {workspace?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{workspace?.name}</h1>
            <p className="text-gray-500 text-sm">{workspace?.description || 'No description'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowMembers(true)} className="btn-secondary flex items-center gap-2 text-sm">
            <Users size={16} /> Members ({workspace?.members?.length})
          </button>
          {isAdmin && (
            <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2 text-sm">
              <Plus size={16} /> New Project
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Tasks', value: stats.totalTasks },
            { label: 'Done', value: stats.byStatus.done },
            { label: 'Overdue', value: stats.overdue, red: true },
            { label: 'Completion', value: `${stats.completionRate}%` },
          ].map(s => (
            <div key={s.label} className="card p-4">
              <p className="text-xs text-gray-500 mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.red && s.value > 0 ? 'text-red-400' : 'text-white'}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projects */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold text-white mb-4">Projects ({projects.length})</h2>
          {projects.length === 0 ? (
            <div className="card p-8 text-center">
              <FolderKanban size={32} className="text-gray-600 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No projects yet</p>
              {isAdmin && <button onClick={() => setShowCreate(true)} className="btn-primary mt-3 text-sm inline-flex items-center gap-1"><Plus size={14} />Create Project</button>}
            </div>
          ) : (
            <div className="space-y-3">
              {projects.map(p => (
                <Link key={p._id} to={`/workspace/${workspaceId}/project/${p._id}`}
                  className="card p-4 flex items-center gap-4 hover:border-brand-500/50 transition-colors group">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0"
                    style={{ background: p.color || '#0ea5e9' }}>
                    {p.title[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white group-hover:text-brand-300 transition-colors truncate">{p.title}</p>
                    <p className="text-xs text-gray-500 truncate">{p.description || 'No description'}</p>
                  </div>
                  <p className="text-xs text-gray-500 flex-shrink-0">{p.members?.length} members</p>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Activity */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Activity</h2>
          <div className="card p-4 space-y-3 max-h-96 overflow-y-auto">
            {activity.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">No activity yet</p>
            ) : activity.map(log => (
              <div key={log._id} className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400 font-medium text-xs flex-shrink-0 mt-0.5">
                  {log.user?.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-sm text-gray-300">{log.action}</p>
                  <p className="text-xs text-gray-600">{formatTime(log.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showCreate && <CreateProjectModal workspaceId={workspaceId} onClose={() => setShowCreate(false)} onCreated={p => { setProjects(prev => [...prev, p]); setShowCreate(false); }} />}
      {showMembers && <MembersModal workspace={workspace} isAdmin={isAdmin} onClose={() => setShowMembers(false)} onUpdate={setWorkspace} />}
    </div>
  );
}

function formatTime(d) {
  const diff = Date.now() - new Date(d);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
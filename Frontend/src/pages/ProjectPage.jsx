import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { projectAPI, taskAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Pencil, Trash2, Calendar, Flag, User } from 'lucide-react';
import toast from 'react-hot-toast';
import CreateTaskModal from '../components/CreateTaskModal';
import TaskCard from '../components/TaskCard';

const COLUMNS = [
  { key: 'todo', label: 'To Do', color: 'text-gray-400', bg: 'bg-gray-500/10' },
  { key: 'inprogress', label: 'In Progress', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { key: 'done', label: 'Done', color: 'text-green-400', bg: 'bg-green-500/10' },
];

export default function ProjectPage() {
  const { workspaceId, projectId } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, [projectId]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [proj, t] = await Promise.all([
        projectAPI.getOne(projectId),
        taskAPI.getByProject(projectId),
      ]);
      setProject(proj.data);
      setTasks(t.data);
    } catch (err) {
      toast.error('Failed to load project');
    } finally { setLoading(false); }
  };

  const updateTaskStatus = async (taskId, status) => {
    try {
      const res = await taskAPI.update(taskId, { status });
      setTasks(prev => prev.map(t => t._id === taskId ? res.data : t));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const deleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    try {
      await taskAPI.delete(taskId);
      setTasks(prev => prev.filter(t => t._id !== taskId));
      toast.success('Task deleted');
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>;

  const tasksByStatus = (status) => tasks.filter(t => t.status === status);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
            style={{ background: project?.color || '#0ea5e9' }}>
            {project?.title?.[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{project?.title}</h1>
            <p className="text-gray-500 text-sm">{tasks.length} tasks · {tasksByStatus('done').length} done</p>
          </div>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> Add Task
        </button>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {COLUMNS.map(col => (
          <div key={col.key}>
            <div className={`flex items-center gap-2 mb-4 px-1`}>
              <span className={`text-sm font-medium ${col.color}`}>{col.label}</span>
              <span className={`${col.bg} ${col.color} text-xs px-2 py-0.5 rounded-full`}>
                {tasksByStatus(col.key).length}
              </span>
            </div>
            <div className="space-y-3 min-h-20">
              {tasksByStatus(col.key).map(task => (
                <TaskCard key={task._id} task={task}
                  onStatusChange={(status) => updateTaskStatus(task._id, status)}
                  onDelete={() => deleteTask(task._id)}
                  onEdit={() => setEditTask(task)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {showCreate && (
        <CreateTaskModal workspaceId={workspaceId} projectId={projectId} members={project?.members || []}
          onClose={() => setShowCreate(false)}
          onCreated={t => { setTasks(prev => [t, ...prev]); setShowCreate(false); }} />
      )}
      {editTask && (
        <CreateTaskModal workspaceId={workspaceId} projectId={projectId} members={project?.members || []}
          task={editTask} onClose={() => setEditTask(null)}
          onCreated={t => { setTasks(prev => prev.map(x => x._id === t._id ? t : x)); setEditTask(null); }} />
      )}
    </div>
  );
}
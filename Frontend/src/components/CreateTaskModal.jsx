import { useState } from 'react';
import { taskAPI } from '../services/api';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CreateTaskModal({ workspaceId, projectId, members, task, onClose, onCreated }) {
  const [form, setForm] = useState(task ? {
    title: task.title, description: task.description,
    priority: task.priority, status: task.status,
    assignedTo: task.assignedTo?._id || '',
    dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
  } : { title: '', description: '', priority: 'medium', status: 'todo', assignedTo: '', dueDate: '' });
  const [loading, setLoading] = useState(false);
  const isEdit = !!task;

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, projectId, workspaceId, assignedTo: form.assignedTo || null };
      const res = isEdit ? await taskAPI.update(task._id, payload) : await taskAPI.create(payload);
      onCreated(res.data);
      toast.success(isEdit ? 'Task updated!' : 'Task created!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-white">{isEdit ? 'Edit Task' : 'New Task'}</h2>
          <button onClick={onClose} className="btn-ghost p-1"><X size={18} /></button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 block mb-1">Title *</label>
            <input className="input" placeholder="Task title" value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} required />
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-1">Description</label>
            <textarea className="input resize-none" rows={3} value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 block mb-1">Priority</label>
              <select className="input" value={form.priority} onChange={e => setForm(p => ({...p, priority: e.target.value}))}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">Status</label>
              <select className="input" value={form.status} onChange={e => setForm(p => ({...p, status: e.target.value}))}>
                <option value="todo">To Do</option>
                <option value="inprogress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 block mb-1">Assign To</label>
              <select className="input" value={form.assignedTo} onChange={e => setForm(p => ({...p, assignedTo: e.target.value}))}>
                <option value="">Unassigned</option>
                {members.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">Due Date</label>
              <input type="date" className="input" value={form.dueDate} onChange={e => setForm(p => ({...p, dueDate: e.target.value}))} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">{loading ? 'Saving...' : isEdit ? 'Update Task' : 'Create Task'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
import { useState } from 'react';
import { workspaceAPI } from '../services/api';
import { X, UserPlus, Trash2, Crown } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MembersModal({ workspace, isAdmin, onClose, onUpdate }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [adding, setAdding] = useState(false);

  const addMember = async (e) => {
    e.preventDefault();
    setAdding(true);
    try {
      const res = await workspaceAPI.addMember(workspace._id, { email, role });
      onUpdate(res.data);
      setEmail('');
      toast.success('Member added!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setAdding(false); }
  };

  const removeMember = async (userId) => {
    try {
      await workspaceAPI.removeMember(workspace._id, userId);
      const res = await workspaceAPI.getOne(workspace._id);
      onUpdate(res.data);
      toast.success('Member removed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card p-6 w-full max-w-md max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-white">Members</h2>
          <button onClick={onClose} className="btn-ghost p-1"><X size={18} /></button>
        </div>

        {isAdmin && (
          <form onSubmit={addMember} className="flex gap-2 mb-5">
            <input className="input flex-1 text-sm" placeholder="Email address" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            <select className="input w-28 text-sm" value={role} onChange={e => setRole(e.target.value)}>
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
            <button type="submit" disabled={adding} className="btn-primary text-sm px-3">Add</button>
          </form>
        )}

        <div className="overflow-y-auto space-y-2">
          {workspace?.members?.map(m => (
            <div key={m.user?._id} className="flex items-center gap-3 p-3 rounded-lg bg-white/3 hover:bg-white/5">
              <div className="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400 font-medium text-sm flex-shrink-0">
                {m.user?.name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium truncate">{m.user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{m.user?.email}</p>
              </div>
              <div className="flex items-center gap-2">
                {m.role === 'admin' && <Crown size={14} className="text-yellow-400" />}
                <span className={`text-xs px-2 py-0.5 rounded-full ${m.role === 'admin' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-500/20 text-gray-400'}`}>
                  {m.role}
                </span>
                {isAdmin && m.user?._id !== workspace?.owner?._id && (
                  <button onClick={() => removeMember(m.user._id)} className="text-gray-600 hover:text-red-400 transition-colors">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
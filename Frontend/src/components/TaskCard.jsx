import { Calendar, Flag, User, MoreVertical, CheckCircle2, Circle, Clock } from 'lucide-react';
import { format, isPast } from 'date-fns';
import { useState } from 'react';

const PRIORITY_COLORS = { low: 'text-gray-400', medium: 'text-yellow-400', high: 'text-orange-400', critical: 'text-red-400' };
const STATUS_NEXT = { todo: 'inprogress', inprogress: 'done', done: 'todo' };

export default function TaskCard({ task, onStatusChange, onDelete, onEdit }) {
  const [showMenu, setShowMenu] = useState(false);
  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'done';

  return (
    <div className={`card p-4 hover:border-brand-500/30 transition-colors group relative ${isOverdue ? 'border-red-500/30' : ''}`}>
      {isOverdue && <div className="absolute top-0 left-0 right-0 h-0.5 bg-red-500 rounded-t-xl" />}

      <div className="flex items-start gap-2 mb-3">
        <button onClick={() => onStatusChange(STATUS_NEXT[task.status])} className="mt-0.5 flex-shrink-0 text-gray-600 hover:text-brand-400 transition-colors">
          {task.status === 'done' ? <CheckCircle2 size={18} className="text-green-400" /> : <Circle size={18} />}
        </button>
        <p className={`text-sm font-medium flex-1 ${task.status === 'done' ? 'line-through text-gray-500' : 'text-white'}`}>
          {task.title}
        </p>
        <div className="relative">
          <button onClick={() => setShowMenu(!showMenu)} className="opacity-0 group-hover:opacity-100 btn-ghost p-1 text-gray-500">
            <MoreVertical size={14} />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-6 card w-32 py-1 z-10" onMouseLeave={() => setShowMenu(false)}>
              <button onClick={() => { onEdit(); setShowMenu(false); }} className="w-full text-left px-3 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-white/5">Edit</button>
              <button onClick={() => { onDelete(); setShowMenu(false); }} className="w-full text-left px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/10">Delete</button>
            </div>
          )}
        </div>
      </div>

      {task.description && <p className="text-xs text-gray-500 mb-3 line-clamp-2 ml-6">{task.description}</p>}

      <div className="flex items-center gap-3 ml-6 flex-wrap">
        <span className={`badge-${task.priority}`}>{task.priority}</span>
        {task.assignedTo && (
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <User size={11} /> {task.assignedTo.name.split(' ')[0]}
          </span>
        )}
        {task.dueDate && (
          <span className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-400' : 'text-gray-500'}`}>
            <Calendar size={11} /> {format(new Date(task.dueDate), 'MMM d')}
          </span>
        )}
      </div>
    </div>
  );
}
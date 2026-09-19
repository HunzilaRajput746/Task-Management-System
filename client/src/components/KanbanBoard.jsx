import React from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  MoreVertical,
  MessageSquare,
  CheckSquare,
} from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';

const COLUMNS = [
  { id: 'backlog', label: 'Backlog', color: 'border-t-slate-500', badgeColor: 'bg-slate-500/10 text-slate-400' },
  { id: 'todo', label: 'To Do', color: 'border-t-sky-500', badgeColor: 'bg-sky-500/10 text-sky-400' },
  { id: 'in_progress', label: 'In Progress', color: 'border-t-indigo-500', badgeColor: 'bg-indigo-500/10 text-indigo-400' },
  { id: 'in_review', label: 'In Review', color: 'border-t-amber-500', badgeColor: 'bg-amber-500/10 text-amber-400' },
  { id: 'completed', label: 'Completed', color: 'border-t-emerald-500', badgeColor: 'bg-emerald-500/10 text-emerald-400' },
];

export const KanbanBoard = ({ tasks = [], onTaskClick, onStatusChange }) => {
  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      case 'high':
        return 'bg-orange-500/15 text-orange-400 border-orange-500/30';
      case 'medium':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
      default:
        return 'bg-slate-500/15 text-slate-400 border-slate-500/30';
    }
  };

  const isOverdue = (dueDate, status) => {
    if (status === 'completed') return false;
    const date = new Date(dueDate);
    return isPast(date) && !isToday(date);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-6">
      {COLUMNS.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.id);

        return (
          <div
            key={col.id}
            className={`flex flex-col bg-slate-900/40 border border-slate-800/80 rounded-xl p-3 min-w-[280px] border-t-4 ${col.color}`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800/60">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">{col.label}</h4>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${col.badgeColor}`}>
                  {colTasks.length}
                </span>
              </div>
            </div>

            {/* Task Cards Column */}
            <div className="flex-1 space-y-3 overflow-y-auto max-h-[calc(100vh-220px)] pr-1">
              {colTasks.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-600 border border-dashed border-slate-800/80 rounded-lg">
                  No tasks in {col.label.toLowerCase()}
                </div>
              ) : (
                colTasks.map((task) => {
                  const completedChecklist = task.checklists?.filter((c) => c.completed).length || 0;
                  const totalChecklist = task.checklists?.length || 0;
                  const overdue = isOverdue(task.dueDate, task.status);

                  return (
                    <div
                      key={task._id}
                      onClick={() => onTaskClick(task)}
                      className="group relative bg-dark-surface/90 border border-slate-800/90 rounded-xl p-3.5 shadow-sm hover:shadow-md hover:border-slate-700 transition-all duration-200 cursor-pointer hover:scale-[1.01]"
                    >
                      {/* Top Bar: Code & Priority */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[11px] font-mono font-bold text-brand-400">
                          {task.taskCode || 'TASK'}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${getPriorityBadge(
                            task.priority
                          )}`}
                        >
                          {task.priority}
                        </span>
                      </div>

                      {/* Task Title */}
                      <h5 className="text-xs font-semibold text-slate-100 group-hover:text-brand-300 transition-colors line-clamp-2 mb-2">
                        {task.title}
                      </h5>

                      {/* Tags */}
                      {task.tags && task.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {task.tags.slice(0, 3).map((tag, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-400"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Sub-items & Comments counters */}
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mb-3">
                        {totalChecklist > 0 && (
                          <span className="flex items-center gap-1">
                            <CheckSquare className="w-3 h-3 text-brand-400" />
                            <span>
                              {completedChecklist}/{totalChecklist}
                            </span>
                          </span>
                        )}
                        {task.comments?.length > 0 && (
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3 text-slate-400" />
                            <span>{task.comments.length}</span>
                          </span>
                        )}
                      </div>

                      {/* Card Footer: Assignee & Due Date */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                        {/* Assignee */}
                        <div className="flex items-center gap-2">
                          {task.assignee ? (
                            <img
                              src={
                                task.assignee.avatar ||
                                `https://api.dicebear.com/7.x/initials/svg?seed=${task.assignee.name}`
                              }
                              alt={task.assignee.name}
                              className="w-5 h-5 rounded-full ring-1 ring-slate-700 object-cover"
                              title={`Assigned to ${task.assignee.name}`}
                            />
                          ) : (
                            <span className="text-[10px] text-slate-500 italic">Unassigned</span>
                          )}
                        </div>

                        {/* Due Date Indicator */}
                        <div
                          className={`flex items-center gap-1 text-[10px] font-medium ${
                            overdue
                              ? 'text-rose-400 font-bold'
                              : task.status === 'completed'
                              ? 'text-emerald-400'
                              : 'text-slate-400'
                          }`}
                        >
                          <Clock className="w-3 h-3" />
                          <span>{format(new Date(task.dueDate), 'MMM d')}</span>
                        </div>
                      </div>

                      {/* Quick Move Status Selector (Hover Overlay) */}
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between"
                      >
                        <span className="text-[10px] text-slate-500">Move:</span>
                        <select
                          value={task.status}
                          onChange={(e) => onStatusChange(task._id, e.target.value)}
                          className="text-[10px] bg-slate-800 text-slate-300 border border-slate-700 rounded px-1.5 py-0.5 focus:outline-none focus:border-brand-500"
                        >
                          <option value="backlog">Backlog</option>
                          <option value="todo">To Do</option>
                          <option value="in_progress">In Progress</option>
                          <option value="in_review">In Review</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KanbanBoard;

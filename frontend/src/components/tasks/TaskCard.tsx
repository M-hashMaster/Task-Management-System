import React, { useState } from 'react';
import { Task, TaskStatus } from '../../types';
import { TaskStatusBadge } from './TaskStatusBadge';
import { Edit3, Trash2, Calendar, User as UserIcon, Check, ChevronDown } from 'lucide-react';
import { formatDate, isOverdue } from '../../utils/formatDate';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStatusChange: (task: Task, newStatus: TaskStatus) => Promise<void>;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onDelete,
  onStatusChange
}) => {
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);

  const statuses: TaskStatus[] = ['To Do', 'In Progress', 'Done'];

  const handleStatusSelect = async (newStatus: TaskStatus) => {
    if (newStatus === task.status) {
      setIsStatusMenuOpen(false);
      return;
    }
    try {
      setIsUpdatingStatus(true);
      setIsStatusMenuOpen(false);
      await onStatusChange(task, newStatus);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const overdue = task.status !== 'Done' && isOverdue(task.dueDate);

  return (
    <div className="bg-white rounded-lg border border-slate-200/80 shadow-sm hover:shadow transition-all duration-150 p-3.5 space-y-2.5 group">
      {/* Top row: Status and quick actions */}
      <div className="flex items-start justify-between gap-2">
        {/* Status Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsStatusMenuOpen(!isStatusMenuOpen)}
            disabled={isUpdatingStatus}
            aria-label="Change status"
            className="flex items-center gap-1 focus:outline-none focus:ring-1 focus:ring-brand-400 rounded-full"
          >
            <TaskStatusBadge status={task.status} size="sm" />
            <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-slate-600 transition-colors" />
          </button>

          {isStatusMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setIsStatusMenuOpen(false)}
                aria-hidden="true"
              />
              <div className="absolute left-0 top-full mt-1.5 z-30 w-36 bg-white rounded-lg shadow-lg border border-slate-200 py-1 text-xs">
                {statuses.map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => handleStatusSelect(status)}
                    className="w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <span>{status}</span>
                    {task.status === status && <Check className="w-3.5 h-3.5 text-brand-600" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => onEdit(task)}
            aria-label={`Edit ${task.title}`}
            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(task)}
            aria-label={`Delete ${task.title}`}
            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Task Title */}
      <h4 className="text-sm font-semibold text-slate-900 leading-snug break-words">
        {task.title}
      </h4>

      {/* Task Description */}
      {task.description && (
        <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed whitespace-pre-wrap">
          {task.description}
        </p>
      )}

      {/* Footer: Due date and Assignee */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-[11px] text-slate-500">
        {/* Due Date */}
        {task.dueDate ? (
          <div
            className={`flex items-center gap-1 font-medium ${
              overdue ? 'text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded' : 'text-slate-500'
            }`}
          >
            <Calendar className="w-3 h-3" />
            <span>{formatDate(task.dueDate)}</span>
          </div>
        ) : (
          <span className="text-slate-300">No due date</span>
        )}

        {/* Assigned User */}
        {task.assignedTo && typeof task.assignedTo === 'object' ? (
          <div
            className="flex items-center gap-1 bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full font-medium max-w-[120px] truncate"
            title={`Assigned to: ${task.assignedTo.name} (${task.assignedTo.email})`}
          >
            <UserIcon className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{task.assignedTo.name}</span>
          </div>
        ) : (
          <span className="text-slate-300">Unassigned</span>
        )}
      </div>
    </div>
  );
};

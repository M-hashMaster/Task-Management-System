import React from 'react';
import { TaskStatus } from '../../types';
import { Clock, PlayCircle, CheckCircle2 } from 'lucide-react';

interface TaskStatusBadgeProps {
  status: TaskStatus;
  size?: 'sm' | 'md';
}

export const TaskStatusBadge: React.FC<TaskStatusBadgeProps> = ({ status, size = 'sm' }) => {
  const config = {
    'To Do': {
      bg: 'bg-slate-100 text-slate-700 border-slate-200',
      icon: <Clock className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
    },
    'In Progress': {
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: <PlayCircle className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
    },
    'Done': {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: <CheckCircle2 className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
    }
  };

  const current = config[status] || config['To Do'];
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5 gap-1' : 'text-xs px-2.5 py-1 gap-1.5 font-medium';

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium ${current.bg} ${sizeClasses}`}
    >
      {current.icon}
      <span>{status}</span>
    </span>
  );
};

import React from 'react';
import { List, Task, TaskStatus } from '../../types';
import { TaskCard } from '../tasks/TaskCard';
import { Plus, Edit2, Trash2 } from 'lucide-react';

interface ListColumnProps {
  list: List;
  tasks: Task[];
  onRenameList: (list: List) => void;
  onDeleteList: (list: List) => void;
  onAddTask: (list: List) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onTaskStatusChange: (task: Task, newStatus: TaskStatus) => Promise<void>;
}

export const ListColumn: React.FC<ListColumnProps> = ({
  list,
  tasks,
  onRenameList,
  onDeleteList,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onTaskStatusChange
}) => {
  return (
    <div className="w-80 flex-shrink-0 bg-slate-100/90 rounded-xl border border-slate-200/80 shadow-sm flex flex-col max-h-[calc(100vh-12rem)]">
      {/* List Header */}
      <div className="p-3.5 flex items-center justify-between border-b border-slate-200/60">
        <div className="flex items-center gap-2 min-w-0">
          <h3 className="font-semibold text-slate-800 text-sm truncate" title={list.title}>
            {list.title}
          </h3>
          <span className="flex-shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">
            {tasks.length}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onRenameList(list)}
            aria-label={`Rename list ${list.title}`}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDeleteList(list)}
            aria-label={`Delete list ${list.title}`}
            className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Task Cards Container */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 min-h-[60px]">
        {tasks.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400 border border-dashed border-slate-300 rounded-lg">
            No tasks in this list yet.
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
              onStatusChange={onTaskStatusChange}
            />
          ))
        )}
      </div>

      {/* Add Task Button */}
      <div className="p-2 border-t border-slate-200/60">
        <button
          type="button"
          onClick={() => onAddTask(list)}
          className="w-full py-2 px-3 flex items-center justify-center gap-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/80 transition-all focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <Plus className="w-4 h-4 text-slate-500" />
          <span>Add Task</span>
        </button>
      </div>
    </div>
  );
};

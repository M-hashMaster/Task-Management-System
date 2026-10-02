import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Alert } from '../common/Alert';
import { Task, TaskStatus } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { UserCheck, X } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description?: string;
    status: TaskStatus;
    assignedTo?: string | null;
    dueDate?: string | null;
  }) => Promise<void>;
  taskToEdit?: Task | null;
  initialStatus?: TaskStatus;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  taskToEdit,
  initialStatus = 'To Do'
}) => {
  const { user: currentUser } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>(initialStatus);
  const [assignedTo, setAssignedTo] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setStatus(taskToEdit.status);

      if (taskToEdit.assignedTo && typeof taskToEdit.assignedTo === 'object') {
        setAssignedTo(taskToEdit.assignedTo._id);
      } else if (typeof taskToEdit.assignedTo === 'string') {
        setAssignedTo(taskToEdit.assignedTo);
      } else {
        setAssignedTo('');
      }

      if (taskToEdit.dueDate) {
        // Format to YYYY-MM-DD for standard html date input
        const d = new Date(taskToEdit.dueDate);
        if (!isNaN(d.getTime())) {
          setDueDate(d.toISOString().slice(0, 10));
        } else {
          setDueDate('');
        }
      } else {
        setDueDate('');
      }
    } else {
      setTitle('');
      setDescription('');
      setStatus(initialStatus);
      setAssignedTo('');
      setDueDate('');
    }
    setError(null);
  }, [taskToEdit, initialStatus, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Task title is required');
      return;
    }
    if (title.length > 150) {
      setError('Title cannot exceed 150 characters');
      return;
    }
    if (description.length > 2000) {
      setError('Description cannot exceed 2000 characters');
      return;
    }

    // Format ISO dueDate if provided
    let isoDueDate: string | null = null;
    if (dueDate) {
      const parsedDate = new Date(`${dueDate}T23:59:59.000Z`);
      if (!isNaN(parsedDate.getTime())) {
        isoDueDate = parsedDate.toISOString();
      }
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        assignedTo: assignedTo.trim() ? assignedTo.trim() : null,
        dueDate: isoDueDate
      });
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save task';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignToMe = () => {
    if (currentUser?._id) {
      setAssignedTo(currentUser._id);
    }
  };

  const handleClearAssignee = () => {
    setAssignedTo('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={taskToEdit ? 'Edit Task' : 'Create New Task'}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

        <Input
          label="Task Title"
          required
          maxLength={150}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Implement authentication middleware"
          autoFocus
        />

        <div>
          <label htmlFor="task-description" className="block text-sm font-medium text-slate-700 mb-1.5">
            Description <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <textarea
            id="task-description"
            rows={3}
            maxLength={2000}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Details, acceptance criteria, or notes..."
            className="block w-full rounded-lg border border-slate-300 hover:border-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 text-sm py-2 px-3 text-slate-900 placeholder:text-slate-400 focus:outline-none transition-colors"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Status select */}
          <div>
            <label htmlFor="task-status" className="block text-sm font-medium text-slate-700 mb-1.5">
              Status
            </label>
            <select
              id="task-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="block w-full rounded-lg border border-slate-300 hover:border-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 text-sm py-2.5 px-3 bg-white text-slate-900 focus:outline-none transition-colors"
            >
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
          </div>

          {/* Due date input */}
          <div>
            <label htmlFor="task-due-date" className="block text-sm font-medium text-slate-700 mb-1.5">
              Due Date <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              id="task-due-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="block w-full rounded-lg border border-slate-300 hover:border-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 text-sm py-2.5 px-3 bg-white text-slate-900 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Task Assignment */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="assigned-user-id" className="block text-sm font-medium text-slate-700">
              Assign to User <span className="text-slate-400 font-normal">(User ID)</span>
            </label>
            <div className="flex items-center gap-2">
              {currentUser?._id && assignedTo !== currentUser._id && (
                <button
                  type="button"
                  onClick={handleAssignToMe}
                  className="text-xs text-brand-600 hover:text-brand-700 font-medium inline-flex items-center gap-1 hover:underline"
                >
                  <UserCheck className="w-3 h-3" />
                  Assign to me
                </button>
              )}
              {assignedTo && (
                <button
                  type="button"
                  onClick={handleClearAssignee}
                  className="text-xs text-slate-500 hover:text-rose-600 font-medium inline-flex items-center gap-0.5 hover:underline"
                >
                  <X className="w-3 h-3" />
                  Unassign
                </button>
              )}
            </div>
          </div>
          <Input
            id="assigned-user-id"
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            placeholder="Paste 24-character User ObjectId or click 'Assign to me'"
          />
          {assignedTo && currentUser && assignedTo === currentUser._id && (
            <p className="mt-1 text-xs text-emerald-600 font-medium">
              ✓ Assigned to you ({currentUser.name})
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            loadingText={taskToEdit ? 'Saving...' : 'Creating...'}
          >
            {taskToEdit ? 'Save Changes' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

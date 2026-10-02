import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Alert } from '../common/Alert';
import { Board } from '../../types';

interface BoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; description?: string }) => Promise<void>;
  boardToEdit?: Board | null;
}

export const BoardModal: React.FC<BoardModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  boardToEdit
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (boardToEdit) {
      setTitle(boardToEdit.title);
      setDescription(boardToEdit.description || '');
    } else {
      setTitle('');
      setDescription('');
    }
    setError(null);
  }, [boardToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Board title is required');
      return;
    }
    if (title.length > 100) {
      setError('Title cannot exceed 100 characters');
      return;
    }
    if (description.length > 500) {
      setError('Description cannot exceed 500 characters');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined
      });
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save board';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={boardToEdit ? 'Edit Board' : 'Create New Board'}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

        <Input
          label="Board Title"
          required
          maxLength={100}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Q4 Sprint Planning, Product Roadmap"
          autoFocus
        />

        <div>
          <label htmlFor="board-description" className="block text-sm font-medium text-slate-700 mb-1.5">
            Description <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <textarea
            id="board-description"
            rows={3}
            maxLength={500}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief overview or goals for this board..."
            className="block w-full rounded-lg border border-slate-300 hover:border-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 text-sm py-2 px-3 text-slate-900 placeholder:text-slate-400 focus:outline-none transition-colors"
          />
          <p className="mt-1 text-right text-[11px] text-slate-400">
            {description.length}/500 characters
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            loadingText={boardToEdit ? 'Saving...' : 'Creating...'}
          >
            {boardToEdit ? 'Save Changes' : 'Create Board'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

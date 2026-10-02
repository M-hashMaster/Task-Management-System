import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Alert } from '../common/Alert';
import { List } from '../../types';

interface ListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string) => Promise<void>;
  listToEdit?: List | null;
}

export const ListModal: React.FC<ListModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  listToEdit
}) => {
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (listToEdit) {
      setTitle(listToEdit.title);
    } else {
      setTitle('');
    }
    setError(null);
  }, [listToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('List title is required');
      return;
    }
    if (title.length > 100) {
      setError('Title cannot exceed 100 characters');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit(title.trim());
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save list';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={listToEdit ? 'Rename List' : 'Add New List'}
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

        <Input
          label="List Title"
          required
          maxLength={100}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. To Do, In Progress, QA Review"
          autoFocus
        />

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            loadingText={listToEdit ? 'Renaming...' : 'Creating...'}
          >
            {listToEdit ? 'Save Changes' : 'Create List'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

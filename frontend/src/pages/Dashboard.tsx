import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { boardsApi } from '../api/boards.api';
import { Board } from '../types';
import { getErrorMessage } from '../api/client';
import { BoardCard } from '../components/boards/BoardCard';
import { BoardModal } from '../components/boards/BoardModal';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { Button } from '../components/common/Button';
import { Alert } from '../components/common/Alert';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Plus, LayoutDashboard, Search, RefreshCw } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const [boards, setBoards] = useState<Board[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isBoardModalOpen, setIsBoardModalOpen] = useState(false);
  const [boardToEdit, setBoardToEdit] = useState<Board | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [boardToDelete, setBoardToDelete] = useState<Board | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchBoards = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await boardsApi.getBoards();
      setBoards(data);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  const handleOpenCreateModal = () => {
    setBoardToEdit(null);
    setIsBoardModalOpen(true);
  };

  const handleOpenEditModal = (board: Board) => {
    setBoardToEdit(board);
    setIsBoardModalOpen(true);
  };

  const handleOpenDeleteModal = (board: Board) => {
    setBoardToDelete(board);
    setIsDeleteModalOpen(true);
  };

  const handleBoardSubmit = async (data: { title: string; description?: string }) => {
    if (boardToEdit) {
      const updated = await boardsApi.updateBoard(boardToEdit._id, data);
      setBoards((prev) => prev.map((b) => (b._id === updated._id ? updated : b)));
    } else {
      const created = await boardsApi.createBoard(data);
      setBoards((prev) => [created, ...prev]);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!boardToDelete) return;
    try {
      setIsDeleting(true);
      await boardsApi.deleteBoard(boardToDelete._id);
      setBoards((prev) => prev.filter((b) => b._id !== boardToDelete._id));
      setIsDeleteModalOpen(false);
      setBoardToDelete(null);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredBoards = boards.filter((b) =>
    b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (b.description && b.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Top Banner / Greeting */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Welcome back, {user?.name || 'User'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your project boards, lists, and task workflows in real-time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={handleOpenCreateModal}
          >
            Create Board
          </Button>
        </div>
      </div>

      {/* Error alert if any */}
      {error && (
        <div className="mt-6">
          <Alert
            type="error"
            message={error}
            onClose={() => setError(null)}
          />
        </div>
      )}

      {/* Filter / Search Bar */}
      <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="relative max-w-xs w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your boards..."
            className="block w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-xs bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={fetchBoards}
            icon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            aria-label="Refresh boards"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Board Content Section */}
      <div className="mt-6">
        {isLoading ? (
          <div className="py-24">
            <LoadingSpinner size="lg" text="Loading boards..." />
          </div>
        ) : filteredBoards.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBoards.map((board) => (
              <BoardCard
                key={board._id}
                board={board}
                onEdit={handleOpenEditModal}
                onDelete={handleOpenDeleteModal}
              />
            ))}
          </div>
        ) : boards.length === 0 ? (
          /* Empty State: No boards created yet */
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 py-16 px-6 text-center shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-4">
              <LayoutDashboard className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">No boards yet</h2>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-6">
              Create your first board to organize lists, tasks, and project deliverables with your team.
            </p>
            <Button
              variant="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={handleOpenCreateModal}
            >
              Create your first board
            </Button>
          </div>
        ) : (
          /* Filtered search produced 0 matches */
          <div className="bg-white rounded-xl border border-slate-200 py-12 px-4 text-center">
            <p className="text-sm text-slate-500">
              No boards match your search query &ldquo;{searchQuery}&rdquo;.
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-3 text-brand-600"
              onClick={() => setSearchQuery('')}
            >
              Clear search filter
            </Button>
          </div>
        )}
      </div>

      {/* Board Create / Edit Modal */}
      <BoardModal
        isOpen={isBoardModalOpen}
        onClose={() => setIsBoardModalOpen(false)}
        onSubmit={handleBoardSubmit}
        boardToEdit={boardToEdit}
      />

      {/* Board Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setBoardToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Board"
        message={`Are you sure you want to delete "${boardToDelete?.title}"? All lists and tasks inside this board will be permanently deleted. This action cannot be undone.`}
        confirmText="Delete Board"
        isLoading={isDeleting}
        isDestructive={true}
      />
    </div>
  );
};

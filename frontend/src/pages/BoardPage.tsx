import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { boardsApi } from '../api/boards.api';
import { listsApi } from '../api/lists.api';
import { tasksApi, CreateTaskPayload, UpdateTaskPayload } from '../api/tasks.api';
import { Board, List, Task, TaskStatus } from '../types';
import { getErrorMessage } from '../api/client';
import { ListColumn } from '../components/lists/ListColumn';
import { ListModal } from '../components/lists/ListModal';
import { TaskModal } from '../components/tasks/TaskModal';
import { BoardModal } from '../components/boards/BoardModal';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { Button } from '../components/common/Button';
import { Alert } from '../components/common/Alert';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  ArrowLeft,
  Plus,
  Edit3,
  Trash2,
  Columns,
  RefreshCw
} from 'lucide-react';

export const BoardPage: React.FC = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();

  const [board, setBoard] = useState<Board | null>(null);
  const [lists, setLists] = useState<List[]>([]);
  const [tasksByList, setTasksByList] = useState<Record<string, Task[]>>({});

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Board Edit & Delete Modals
  const [isEditBoardOpen, setIsEditBoardOpen] = useState(false);
  const [isDeleteBoardOpen, setIsDeleteBoardOpen] = useState(false);
  const [isDeletingBoard, setIsDeletingBoard] = useState(false);

  // List Create & Rename Modals
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [listToEdit, setListToEdit] = useState<List | null>(null);

  const [isDeleteListOpen, setIsDeleteListOpen] = useState(false);
  const [listToDelete, setListToDelete] = useState<List | null>(null);
  const [isDeletingList, setIsDeletingList] = useState(false);

  // Task Create & Edit Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [activeListForTask, setActiveListForTask] = useState<List | null>(null);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  const [isDeleteTaskOpen, setIsDeleteTaskOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isDeletingTask, setIsDeletingTask] = useState(false);

  // Load Board, Lists, and Tasks
  const loadBoardData = useCallback(async () => {
    if (!boardId) return;

    try {
      setIsLoading(true);
      setError(null);

      // 1. Fetch Board
      const boardData = await boardsApi.getBoardById(boardId);
      setBoard(boardData);

      // 2. Fetch Lists
      const listsData = await listsApi.getLists(boardId);
      setLists(listsData);

      // 3. Fetch Tasks for all lists concurrently
      const tasksMap: Record<string, Task[]> = {};
      await Promise.all(
        listsData.map(async (list) => {
          try {
            const tasks = await tasksApi.getTasks(boardId, list._id);
            tasksMap[list._id] = tasks;
          } catch (err) {
            console.error(`Failed to fetch tasks for list ${list._id}:`, err);
            tasksMap[list._id] = [];
          }
        })
      );
      setTasksByList(tasksMap);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [boardId]);

  useEffect(() => {
    loadBoardData();
  }, [loadBoardData]);

  // Board Update / Delete Handlers
  const handleUpdateBoard = async (data: { title: string; description?: string }) => {
    if (!boardId) return;
    const updated = await boardsApi.updateBoard(boardId, data);
    setBoard(updated);
  };

  const handleDeleteBoardConfirm = async () => {
    if (!boardId) return;
    try {
      setIsDeletingBoard(true);
      await boardsApi.deleteBoard(boardId);
      navigate('/dashboard');
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setIsDeletingBoard(false);
    }
  };

  // List Handlers
  const handleOpenCreateList = () => {
    setListToEdit(null);
    setIsListModalOpen(true);
  };

  const handleOpenRenameList = (list: List) => {
    setListToEdit(list);
    setIsListModalOpen(true);
  };

  const handleListSubmit = async (title: string) => {
    if (!boardId) return;
    if (listToEdit) {
      const updated = await listsApi.updateList(boardId, listToEdit._id, { title });
      setLists((prev) => prev.map((l) => (l._id === updated._id ? updated : l)));
    } else {
      const created = await listsApi.createList(boardId, { title });
      setLists((prev) => [...prev, created]);
      setTasksByList((prev) => ({ ...prev, [created._id]: [] }));
    }
  };

  const handleOpenDeleteList = (list: List) => {
    setListToDelete(list);
    setIsDeleteListOpen(true);
  };

  const handleDeleteListConfirm = async () => {
    if (!boardId || !listToDelete) return;
    try {
      setIsDeletingList(true);
      await listsApi.deleteList(boardId, listToDelete._id);
      setLists((prev) => prev.filter((l) => l._id !== listToDelete._id));
      setTasksByList((prev) => {
        const copy = { ...prev };
        delete copy[listToDelete._id];
        return copy;
      });
      setIsDeleteListOpen(false);
      setListToDelete(null);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setIsDeletingList(false);
    }
  };

  // Task Handlers
  const handleOpenAddTask = (list: List) => {
    setActiveListForTask(list);
    setTaskToEdit(null);
    setIsTaskModalOpen(true);
  };

  const handleOpenEditTask = (task: Task) => {
    const parentList = lists.find((l) => l._id === task.list) || null;
    setActiveListForTask(parentList);
    setTaskToEdit(task);
    setIsTaskModalOpen(true);
  };

  const handleTaskSubmit = async (payload: {
    title: string;
    description?: string;
    status: TaskStatus;
    assignedTo?: string | null;
    dueDate?: string | null;
  }) => {
    if (!boardId || !activeListForTask) return;

    if (taskToEdit) {
      const updatePayload: UpdateTaskPayload = {
        title: payload.title,
        description: payload.description,
        status: payload.status,
        assignedTo: payload.assignedTo,
        dueDate: payload.dueDate
      };
      const updated = await tasksApi.updateTask(
        boardId,
        activeListForTask._id,
        taskToEdit._id,
        updatePayload
      );
      setTasksByList((prev) => ({
        ...prev,
        [activeListForTask._id]: (prev[activeListForTask._id] || []).map((t) =>
          t._id === updated._id ? updated : t
        )
      }));
    } else {
      const createPayload: CreateTaskPayload = {
        title: payload.title,
        description: payload.description,
        status: payload.status,
        assignedTo: payload.assignedTo,
        dueDate: payload.dueDate
      };
      const created = await tasksApi.createTask(
        boardId,
        activeListForTask._id,
        createPayload
      );
      setTasksByList((prev) => ({
        ...prev,
        [activeListForTask._id]: [...(prev[activeListForTask._id] || []), created]
      }));
    }
  };

  const handleQuickStatusChange = async (task: Task, newStatus: TaskStatus) => {
    if (!boardId) return;
    try {
      const updated = await tasksApi.updateTask(boardId, task.list, task._id, {
        status: newStatus
      });
      setTasksByList((prev) => ({
        ...prev,
        [task.list]: (prev[task.list] || []).map((t) =>
          t._id === updated._id ? updated : t
        )
      }));
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    }
  };

  const handleOpenDeleteTask = (task: Task) => {
    setTaskToDelete(task);
    setIsDeleteTaskOpen(true);
  };

  const handleDeleteTaskConfirm = async () => {
    if (!boardId || !taskToDelete) return;
    try {
      setIsDeletingTask(true);
      await tasksApi.deleteTask(boardId, taskToDelete.list, taskToDelete._id);
      setTasksByList((prev) => ({
        ...prev,
        [taskToDelete.list]: (prev[taskToDelete.list] || []).filter(
          (t) => t._id !== taskToDelete._id
        )
      }));
      setIsDeleteTaskOpen(false);
      setTaskToDelete(null);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setIsDeletingTask(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24">
        <LoadingSpinner size="lg" text="Loading board workspace and tasks..." />
      </div>
    );
  }

  if (error || !board) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <Alert
          type="error"
          message={error || 'Board not found or access denied.'}
        />
        <div className="mt-6 flex justify-center gap-3">
          <Button variant="secondary" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
          <Button variant="primary" onClick={loadBoardData}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
      {/* Board Header Bar */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-3">
            <Link
              to="/dashboard"
              aria-label="Back to dashboard"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors mt-0.5"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>

            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  {board.title}
                </h1>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setIsEditBoardOpen(true)}
                    aria-label="Edit board title & description"
                    className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsDeleteBoardOpen(true)}
                    aria-label="Delete this board"
                    className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {board.description && (
                <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                  {board.description}
                </p>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={<RefreshCw className="w-3.5 h-3.5" />}
              onClick={loadBoardData}
              aria-label="Refresh board"
            >
              Refresh
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              onClick={handleOpenCreateList}
            >
              Add List
            </Button>
          </div>
        </div>
      </div>

      {/* Kanban Board Work Area */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-auto min-h-[calc(100vh-10rem)]">
        {lists.length === 0 ? (
          <div className="max-w-md mx-auto py-16 text-center bg-white rounded-2xl border border-dashed border-slate-300 p-8 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-3">
              <Columns className="w-6 h-6" />
            </div>
            <h2 className="text-base font-semibold text-slate-900">No lists on this board yet</h2>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              Add your first column (e.g. &ldquo;To Do&rdquo;, &ldquo;In Progress&rdquo;, or &ldquo;Done&rdquo;) to start creating and tracking tasks.
            </p>
            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              onClick={handleOpenCreateList}
            >
              Create First List
            </Button>
          </div>
        ) : (
          <div className="flex items-start gap-5 pb-6">
            {lists.map((list) => (
              <ListColumn
                key={list._id}
                list={list}
                tasks={tasksByList[list._id] || []}
                onRenameList={handleOpenRenameList}
                onDeleteList={handleOpenDeleteList}
                onAddTask={handleOpenAddTask}
                onEditTask={handleOpenEditTask}
                onDeleteTask={handleOpenDeleteTask}
                onTaskStatusChange={handleQuickStatusChange}
              />
            ))}

            {/* Quick Add Another List Card */}
            <div className="w-72 flex-shrink-0">
              <button
                type="button"
                onClick={handleOpenCreateList}
                className="w-full py-3 px-4 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 hover:border-brand-400 bg-white/60 hover:bg-white text-slate-600 hover:text-brand-600 transition-all font-medium text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <Plus className="w-4 h-4" />
                <span>Add another list</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Board Modal */}
      <BoardModal
        isOpen={isEditBoardOpen}
        onClose={() => setIsEditBoardOpen(false)}
        onSubmit={handleUpdateBoard}
        boardToEdit={board}
      />

      {/* Delete Board Confirmation */}
      <ConfirmModal
        isOpen={isDeleteBoardOpen}
        onClose={() => setIsDeleteBoardOpen(false)}
        onConfirm={handleDeleteBoardConfirm}
        title="Delete Board"
        message={`Are you sure you want to delete board "${board.title}"? This will permanently delete all lists and tasks on this board.`}
        confirmText="Delete Board"
        isLoading={isDeletingBoard}
        isDestructive={true}
      />

      {/* Create / Rename List Modal */}
      <ListModal
        isOpen={isListModalOpen}
        onClose={() => setIsListModalOpen(false)}
        onSubmit={handleListSubmit}
        listToEdit={listToEdit}
      />

      {/* Delete List Confirmation */}
      <ConfirmModal
        isOpen={isDeleteListOpen}
        onClose={() => {
          setIsDeleteListOpen(false);
          setListToDelete(null);
        }}
        onConfirm={handleDeleteListConfirm}
        title="Delete List"
        message={`Are you sure you want to delete "${listToDelete?.title}"? All tasks inside this list will be deleted.`}
        confirmText="Delete List"
        isLoading={isDeletingList}
        isDestructive={true}
      />

      {/* Create / Edit Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setTaskToEdit(null);
          setActiveListForTask(null);
        }}
        onSubmit={handleTaskSubmit}
        taskToEdit={taskToEdit}
      />

      {/* Delete Task Confirmation */}
      <ConfirmModal
        isOpen={isDeleteTaskOpen}
        onClose={() => {
          setIsDeleteTaskOpen(false);
          setTaskToDelete(null);
        }}
        onConfirm={handleDeleteTaskConfirm}
        title="Delete Task"
        message={`Are you sure you want to delete task "${taskToDelete?.title}"?`}
        confirmText="Delete Task"
        isLoading={isDeletingTask}
        isDestructive={true}
      />
    </div>
  );
};

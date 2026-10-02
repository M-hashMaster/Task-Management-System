import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Board } from '../../types';
import { LayoutDashboard, Edit3, Trash2, ArrowRight, Calendar } from 'lucide-react';
import { Button } from '../common/Button';
import { formatDate } from '../../utils/formatDate';

interface BoardCardProps {
  board: Board;
  onEdit: (board: Board) => void;
  onDelete: (board: Board) => void;
}

export const BoardCard: React.FC<BoardCardProps> = ({ board, onEdit, onDelete }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group">
      <div className="p-5 flex-1">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="p-2 rounded-lg bg-brand-50 text-brand-600 group-hover:bg-brand-100 transition-colors">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(board);
              }}
              aria-label={`Edit ${board.title}`}
              className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(board);
              }}
              aria-label={`Delete ${board.title}`}
              className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <h3 className="text-base font-semibold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1 mb-1.5">
          {board.title}
        </h3>

        <p className="text-xs text-slate-500 line-clamp-2 min-h-[32px] leading-relaxed">
          {board.description || 'No description provided.'}
        </p>
      </div>

      <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          <span>{formatDate(board.createdAt)}</span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="text-brand-600 hover:text-brand-700 p-0 hover:bg-transparent font-medium group/btn"
          onClick={() => navigate(`/boards/${board._id}`)}
          aria-label={`Open ${board.title}`}
        >
          <span>Open Board</span>
          <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover/btn:translate-x-1" />
        </Button>
      </div>
    </div>
  );
};

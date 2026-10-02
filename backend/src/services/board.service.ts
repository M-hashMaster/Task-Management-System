import { Board, IBoard } from '../models/board.model';
import { List } from '../models/list.model';
import { Task } from '../models/task.model';
import { AppError } from '../utils/appError';
import { CreateBoardInput, UpdateBoardInput } from '../validations/board.validation';

export class BoardService {
  public async verifyBoardOwnership(userId: string, boardId: string): Promise<IBoard> {
    const board = await Board.findById(boardId);
    if (!board) {
      throw new AppError('Board not found', 404);
    }
    if (board.owner.toString() !== userId) {
      throw new AppError('Access denied. You do not own this board', 403);
    }
    return board;
  }

  public async createBoard(userId: string, data: CreateBoardInput): Promise<IBoard> {
    const board = await Board.create({
      title: data.title,
      description: data.description || '',
      owner: userId
    });
    return board;
  }

  public async getBoards(userId: string): Promise<IBoard[]> {
    const boards = await Board.find({ owner: userId }).sort({ createdAt: -1 });
    return boards;
  }

  public async getBoardById(userId: string, boardId: string): Promise<IBoard> {
    return this.verifyBoardOwnership(userId, boardId);
  }

  public async updateBoard(
    userId: string,
    boardId: string,
    data: UpdateBoardInput
  ): Promise<IBoard> {
    await this.verifyBoardOwnership(userId, boardId);

    const updatedBoard = await Board.findByIdAndUpdate(
      boardId,
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!updatedBoard) {
      throw new AppError('Board not found', 404);
    }

    return updatedBoard;
  }

  public async deleteBoard(userId: string, boardId: string): Promise<IBoard> {
    const board = await this.verifyBoardOwnership(userId, boardId);

    // Cascade delete all lists belonging to this board and tasks in those lists
    const lists = await List.find({ board: boardId }).select('_id');
    const listIds = lists.map((l) => l._id);

    if (listIds.length > 0) {
      await Task.deleteMany({ list: { $in: listIds } });
      await List.deleteMany({ board: boardId });
    }

    await Board.findByIdAndDelete(boardId);
    return board;
  }
}

export const boardService = new BoardService();

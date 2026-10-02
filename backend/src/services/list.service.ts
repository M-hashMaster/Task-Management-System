import { List, IList } from '../models/list.model';
import { Task } from '../models/task.model';
import { boardService } from './board.service';
import { AppError } from '../utils/appError';
import { CreateListInput, UpdateListInput } from '../validations/list.validation';

export class ListService {
  public async verifyListAccess(
    userId: string,
    boardId: string,
    listId: string
  ): Promise<{ list: IList }> {
    // 1. Verify user owns the board
    await boardService.verifyBoardOwnership(userId, boardId);

    // 2. Verify list exists
    const list = await List.findById(listId);
    if (!list) {
      throw new AppError('List not found', 404);
    }

    // 3. Verify list belongs to the specified board
    if (list.board.toString() !== boardId) {
      throw new AppError('List does not belong to the specified board', 400);
    }

    return { list };
  }

  public async createList(
    userId: string,
    boardId: string,
    data: CreateListInput
  ): Promise<IList> {
    // Verify user owns the board before creating a list inside it
    await boardService.verifyBoardOwnership(userId, boardId);

    const list = await List.create({
      title: data.title,
      board: boardId
    });

    return list;
  }

  public async getLists(userId: string, boardId: string): Promise<IList[]> {
    // Verify user owns the board before fetching its lists
    await boardService.verifyBoardOwnership(userId, boardId);

    const lists = await List.find({ board: boardId }).sort({ createdAt: 1 });
    return lists;
  }

  public async getListById(
    userId: string,
    boardId: string,
    listId: string
  ): Promise<IList> {
    const { list } = await this.verifyListAccess(userId, boardId, listId);
    return list;
  }

  public async updateList(
    userId: string,
    boardId: string,
    listId: string,
    data: UpdateListInput
  ): Promise<IList> {
    await this.verifyListAccess(userId, boardId, listId);

    const updatedList = await List.findByIdAndUpdate(
      listId,
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!updatedList) {
      throw new AppError('List not found', 404);
    }

    return updatedList;
  }

  public async deleteList(
    userId: string,
    boardId: string,
    listId: string
  ): Promise<IList> {
    const { list } = await this.verifyListAccess(userId, boardId, listId);

    // Cascade delete all tasks belonging to this list
    await Task.deleteMany({ list: listId });

    await List.findByIdAndDelete(listId);
    return list;
  }
}

export const listService = new ListService();

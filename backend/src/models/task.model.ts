import { Schema, model, Document, Types } from 'mongoose';
import { TaskStatus } from '../types';

export interface ITask {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  status: TaskStatus;
  list: Types.ObjectId;
  assignedTo?: Types.ObjectId | null;
  dueDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type TaskDocument = Document<Types.ObjectId, Record<string, unknown>, ITask> & ITask;

const taskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    status: {
      type: String,
      enum: ['To Do', 'In Progress', 'Done'],
      default: 'To Do',
      required: true
    },
    list: {
      type: Schema.Types.ObjectId,
      ref: 'List',
      required: true
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    dueDate: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        const { __v: _v, ...rest } = ret;
        return rest;
      }
    }
  }
);

export const Task = model<ITask>('Task', taskSchema);

import { Schema, model, Document, Types } from 'mongoose';

export interface IBoard {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  owner: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type BoardDocument = Document<Types.ObjectId, Record<string, unknown>, IBoard> & IBoard;

const boardSchema = new Schema<IBoard>(
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
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
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

export const Board = model<IBoard>('Board', boardSchema);

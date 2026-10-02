import { Schema, model, Document, Types } from 'mongoose';

export interface IList {
  _id: Types.ObjectId;
  title: string;
  board: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type ListDocument = Document<Types.ObjectId, Record<string, unknown>, IList> & IList;

const listSchema = new Schema<IList>(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    board: {
      type: Schema.Types.ObjectId,
      ref: 'Board',
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

export const List = model<IList>('List', listSchema);

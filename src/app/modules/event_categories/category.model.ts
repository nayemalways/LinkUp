import mongoose from 'mongoose';
import { ICategory } from './category.interface';

const categoriesSchema = new mongoose.Schema<ICategory>(
  {
    category_name: { type: String, required: true, unique: true, ref: 'category' },
    isDeleted:{ type: Boolean, default: false }
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const Category = mongoose.model<ICategory>('category', categoriesSchema);

export default Category;

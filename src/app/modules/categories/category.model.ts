import mongoose from 'mongoose';
import { ICategory } from './category.interface';

const categoriesSchema = new mongoose.Schema<ICategory>(
  {
    categoriy_name: { type: String, required: true, ref: 'category' },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const Category = mongoose.model<ICategory>('category', categoriesSchema);

export default Category;

import { StatusCodes } from 'http-status-codes';
import AppError from '../../errorHelpers/AppError';
import Category from './category.model';

// CREATE EVENT CATEGORY
const createEventCategoryService = async (category_name: string) => {
  if (!category_name) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Category name must required!');
  }

  const category = await Category.findOne({ category_name });
  if (category) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      `${category_name} - already exist!`
    );
  }

  // Create Category
  const categoryCreate = await Category.create({ category_name });
  return categoryCreate;
};

// GET EVENT CATEGORY
const getEventCategoryService = async (isDeleted: boolean) => {

  const categories = await Category.find({ isDeleted });
  return categories;
};

// UPDATE EVENT CATEGORY
const updateEventCategoryService = async (categoryId: string, category_name: string) => {
    const category = await Category.findById(categoryId);
    if (!category) {
        throw new AppError(StatusCodes.NOT_FOUND, "Category not found!");
    }

// Update Category
  const updateCategory = await Category.findByIdAndUpdate(categoryId, { category_name }, { runValidators: true, new: true });

  return updateCategory;
};

// DELETE EVENT CATEGORY
const deleteEventCategoryService = async (categoryId: string) => {
    const category = await Category.findById(categoryId);
    if (!category) {
        throw new AppError(StatusCodes.NOT_FOUND, "Category not found!");
    }

    if (category.isDeleted) {
        throw new AppError(StatusCodes.BAD_REQUEST, "This category is already deleted!");
    }

// Update Category
  const deleteCategory = await Category.findByIdAndUpdate(categoryId, { isDeleted: true }, { runValidators: true, new: true });

  return deleteCategory;
};

export const categoryServices = {
  createEventCategoryService,
  getEventCategoryService,
  updateEventCategoryService,
  deleteEventCategoryService
};

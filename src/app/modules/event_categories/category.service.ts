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

export const categoryServices = {
  createEventCategoryService,
  getEventCategoryService,
};

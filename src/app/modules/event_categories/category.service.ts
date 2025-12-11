import { StatusCodes } from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import Category from "./category.model";


const createEventCategoryService = async (category_name: string) => {
    if (!category_name) {
        throw new AppError(StatusCodes.NOT_FOUND, "Categor name must required!");
    }

    const category = await Category.create({ category_name });

    return category;
}


export const categoryServices = {
    createEventCategoryService
} 
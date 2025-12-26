import { StatusCodes } from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { ISponsoredPackage } from "./sponsored.interface";
import { SponsoredPackage } from "./sponsored.model";


// CREATE SPONSORSHIP PACKAGE SERVICE
const createSponsoredPackageService = async (paylod: Partial<ISponsoredPackage>) => {
    const isExist = await SponsoredPackage.findOne({ type: paylod.type?.toLocaleUpperCase() });
    if (paylod.title === isExist?.title) {
        throw new AppError(StatusCodes.FORBIDDEN, "A package already exist by ths name!");
    }

    if (isExist) {
        throw new AppError(StatusCodes.BAD_REQUEST, "Already a package exist by this type!");
    }

    const createPackage = await SponsoredPackage.create(paylod);
    return createPackage;
};

// GET ALL AVAILABLE PACAGE SERVICE
const getAvailablePackageService = async () => await SponsoredPackage.find();


// UPDATE PACKAGE
const updatePackageService = async (packageId: string, payload: Partial<ISponsoredPackage>) => {
    const isExist = await SponsoredPackage.findById(packageId);
    if (!isExist) {
        throw new AppError(StatusCodes.NOT_FOUND, "Package not found to update!");
    }

    const updatePackage = await SponsoredPackage.findByIdAndUpdate(packageId, payload, {new: true, runValidators: true});
    return updatePackage
}



export const sponsoredServices = {
    createSponsoredPackageService,
    getAvailablePackageService,
    updatePackageService
}
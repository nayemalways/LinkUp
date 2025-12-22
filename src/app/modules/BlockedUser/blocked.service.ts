import { QueryBuilder } from "../../utils/QueryBuilder";
import BlockedUser from "./blocked.model";


const createBlockedUserService = async (userId: string, blockedUserId: string) => {
    const isBlocked = await BlockedUser.findOne({ user: userId, blockedUser: blockedUserId });
    if (isBlocked) {
        throw new Error("User is already blocked");
    }

    const blockedUser = await BlockedUser.create({ user: userId, blockedUser: blockedUserId });
    return blockedUser;
};


const getBlockedUsersService = async (userId: string, query: Record<string, string>) => {

    const queryBuilder = new QueryBuilder(BlockedUser.find({ user: userId }), query);
    const blockList = await queryBuilder
    .filter()
    .join()
    .sort()
    .paginate()
    .build();

    const meta = await queryBuilder.getMeta();

    return {meta, blockList};
}




export const blockedUserService = {
    createBlockedUserService,
    getBlockedUsersService
}
/* eslint-disable no-console */
import env from "../config/env"
import { IAuthProvider, IUser, Role } from "../modules/users/user.interface";
import User from "../modules/users/user.model"

export const adminCreate = async () => {
  try {
    const isUserExist = await User.findOne({ email: env?.ADMIN_GMAIL });
    if (isUserExist) {
      console.log('Super Admin Already Created');
      return;
    }

    const authProvider: IAuthProvider = {
      provider: 'credentials',
      providerId: env?.ADMIN_GMAIL,
    };

    const payload: IUser = {
      fullName: 'Nayem',
      email: env?.ADMIN_GMAIL,
      password: env?.ADMIN_PASSWORD,
      role: Role.ADMIN,
      auths: [authProvider],
    };

    const super_admin = await User.create(payload);
    console.log(super_admin);
  } catch (error) {
    console.log(error);
  }
};

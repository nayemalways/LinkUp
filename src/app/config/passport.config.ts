/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import User from '../modules/users/user.model';
import bcrypt from 'bcrypt';

// CREDENTIALS LOGIN LOCAL STRATEGY
passport.use(
  new LocalStrategy(
    { usernameField: 'email', passwordField: 'password' },
    async (email: string, password: string, done: any) => {
      try {

        const user = await User.findOne({ email }).select("+password");
        if (!user) {
          return done(null, false, { message: 'User does not exist!' });
        }

        // Check instagram user
        const isInstagramUser = user.auths?.some(
          (provider) => provider.provider === 'instagram'
        );

        if (isInstagramUser) {
          return done(null, false, {
            message:
              'Please Login with instagram!',
          });
        }


        // Matching Password
        const isMatchPassowrd = await bcrypt.compare(
          password,
          user.password as string
        );

        if (!isMatchPassowrd) {
          return done(null, false, { message: 'Incorrect password!' });
        }

        return done(null, user);
      } catch (error) {
        console.log('Passport Local login error: ', error);
        done(error);
      }
    }
  )
);



passport.serializeUser((user: any, done: (err: any, id?: unknown) => void) => {
  done(null, user._id);
});

passport.deserializeUser(async (id: string, done: any) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    console.log(error);
    done(error);
  }
});

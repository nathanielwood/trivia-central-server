// config/strategies.js

import { Strategy, ExtractJwt } from 'passport-jwt';
import FacebookTokenStrategy from 'passport-facebook-token';
import GoogleTokenStrategy from 'passport-google-id-token';
import User from './models/User';
import config from '../config';

export default (passport) => {
  // JWT AUTHORIZATION
  const opts = {
    secretOrKey: config.jwt.authorization.secret,
    jwtFromRequest: ExtractJwt.fromAuthHeader(),
  };
  passport.use('authorization', new Strategy(opts, (payload, done) => {
    User.findById(payload.id, (err, user) => {
      if (err) return done(err, false);
      return done(null, user);
    });
  }));

  // FORGOT PASSWORD TOKEN AUTHENTICATION
  const forgotPasswordOpts = {
    secretOrKey: config.jwt.forgotPassword.secret,
    jwtFromRequest: ExtractJwt.fromAuthHeader(),
  };
  passport.use('forgot-password', new Strategy(forgotPasswordOpts, (payload, done) => {
    User.findById(payload.id, (err, user) => {
      if (err) return done(err, false);
      return done(null, user);
    });
  }));

  // FACEBOOK ACCESS TOKEN AUTHENTICATION
  const facebookOpts = {
    clientID: config.facebook.clientID,
    clientSecret: config.facebook.secret,
  };
  passport.use('facebook-token', new FacebookTokenStrategy(
    facebookOpts,
    (accessToken, refreshToken, profile, done) => {
      User.findOne({ 'facebook.id': profile.id }, (err, user) => {
        if (err) return done(err, false);
        // if no user was found, create one with facebook values
        if (!user) {
          const newUser = new User({
            facebook: {
              id: profile.id,
              name: profile.displayName,
              email: profile.emails[0].value,
            },
          });
          newUser.save((err2, user2) => {
            if (err) return done(err2, false);
            return done(null, user2);
          });
        } else {
          return done(null, user);
        }
        return null;
      });
    }
  ));

  // GOOGLE ID TOKEN AUTHENTICATION
  const googleOpts = {
    clientID: config.google.clientID,
    // clientSecret: config.google.secret,
  };
  passport.use('google-id-token', new GoogleTokenStrategy(
    googleOpts,
    (parsedToken, googleId, done) => {
      User.findOne({ 'google.id': googleId }, (err, user) => {
        if (err) return done(err, false);
        // if no user was found, create one with google values
        if (!user) {
          const newUser = new User({
            google: {
              id: googleId,
              name: parsedToken.payload.name,
              email: parsedToken.payload.email,
            },
          });
          newUser.save((err2, user2) => {
            if (err2) return done(err2, false);
            return done(null, user2);
          });
        } else {
          return done(null, user);
        }
        return null;
      });
    }
  ));
};

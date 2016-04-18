// api/controllers/user.js

import FormData from 'form-data';
import fetch from 'isomorphic-fetch';
import jwt from 'jsonwebtoken';
import _ from 'lodash';
import User from '../models/User';
import config from '../../config/custom';
import {
  validateRegisterForm,
  validateSigninForm,
  validateUsernameForm,
  validateForgotPasswordForm,
  validateChangePasswordForm,
} from '../../trivia-central-lib/validations';
import { registerMail, forgotPasswordMail, contactMail } from './mail';

const returnUser = (user) => {
  const compileUser = {
    id: user._id,
    username: user.username,
  };
  if (user.local) {
    compileUser.local = {
      email: user.local.email,
    };
  }
  if (user.facebook) {
    compileUser.facebook = {
      name: user.facebook.name,
      email: user.facebook.email,
    };
  }
  if (user.google) {
    compileUser.google = {
      name: user.google.name,
      email: user.google.email,
    };
  }
  return compileUser;
};

const grantToken = (user, res) => (
  jwt.sign(
    { id: user._id },
    config.jwt.authorization.secret,
    config.jwt.authorization.options,
    (token) => (
      res.json({
        success: true,
        message: 'Authentication granted',
        token: `JWT ${token}`,
        user: returnUser(user),
      })
    )
  )
);

export const addLocal = (req, res) => {
  const errors = validateRegisterForm(req.body);
  if (!_.isEmpty(errors)) {
    return res.json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }
  return User.findOne({ 'local.email': req.body.email }, (err, user) => {
    if (err) return res.send(err);
    if (user) {
      return res.json({
        success: false,
        message: 'Registration failed',
        errors: {
          _error:
          'The email address is already registered to an account. Please sign in to proceed.',
        },
      });
    }
    // check to see if the username has been taken
    return User.findOne({ username: req.body.username }, (err2, user2) => {
      if (err2) return res.send(err);
      if (user2) {
        return res.json({
          success: false,
          message: 'Registration failed',
          errors: {
            username: 'That username has already been taken. Please choose a different one.',
          },
        });
      }
      const newUser = new User({
        username: req.body.username,
        local: {
          email: req.body.email,
          password: req.body.password,
        },
      });
      return newUser.save((err3, user3) => {
        if (err3) return res.send(err3);
        registerMail({ name: user3.username, email: user3.local.email });
        return grantToken(user3, res);
      });
    });
  });
};

export const registerUsername = (req, res) => {
  const user = req.user;
  // disallow username changes
  if (user.username) {
    return res.json({
      success: false,
      message: 'No username changes',
      errors: {
        _error: 'A username is already registered to this account',
      },
    });
  }
  // validate username
  const errors = validateUsernameForm(req.body);
  if (!_.isEmpty(errors)) {
    return res.json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }
  // disallow similar usernames
  return User.findOne({ username: req.body.username }).exec((err, result) => {
    if (err) return res.send(err);
    if (result) {
      return res.json({
        success: false,
        message: 'Username taken',
        errors: {
          username: 'That username has already been taken. Please choose a different one.',
        },
      });
    }
    // Save new username to db
    user.username = req.body.username;
    return user.save((err2, user2) => {
      if (err2) return res.send(err2);
      return res.json({
        success: true,
        message: 'Username registered',
        user: returnUser(user2),
      });
    });
  });
};

export const requireUsername = (req, res, next) => {
  if (!req.user.username) {
    return res.json({
      success: false,
      message: 'Username required',
      errors: {
        _error: 'Please register a username to continue',
      },
    });
  }
  return next();
};

export const loginLocal = (req, res) => {
  const errors = validateSigninForm(req.body);
  if (!_.isEmpty(errors)) {
    return res.json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }
  return User.findOne({ 'local.email': req.body.email }, (err, user) => {
    if (err) return res.send(err);
    if (!user) {
      return res.json({
        success: false,
        message: 'Authentication failed.',
        errors: {
          _error: 'Authentication failed. Wrong email address or password.',
        },
      });
    }
    return user.comparePassword(req.body.password, (err2, isMatch) => {
      if (!isMatch) {
        return res.json({
          success: false,
          message: 'Authentication failed.',
          errors: {
            _error: 'Authentication failed. Wrong email address or password.',
          },
        });
      }
      return grantToken(user, res);
    });
  });
};

export const loginFacebook = (req, res) => (
  grantToken(req.user, res)
);

export const loginGoogle = (req, res) => (
  grantToken(req.user, res)
);

export const getUser = (req, res) => {
  res.json({
    success: true,
    message: 'User authorized',
    user: returnUser(req.user),
  });
};

export const forgotPassword = (req, res) => {
  const errors = validateForgotPasswordForm(req.body);
  if (!_.isEmpty(errors)) {
    return res.json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }
  User.findOne({ 'local.email': req.body.email }, (err, user) => {
    if (err) return res.send(err);
    if (user) {
      jwt.sign(
        { id: user._id },
        config.jwt.forgotPassword.secret,
        config.jwt.forgotPassword.options,
        (token) => (
          forgotPasswordMail({
            name: user.username,
            email: user.local.email,
            link: `${config.client.domain}/reset-password?token=${token}`,
          })
        )
      );
    }
    return res.json({
      success: true,
      message:
      'If the email matches an account, a reset-password link will be sent to your email address',
    });
  });
  return null;
};

export const resetPassword = (req, res) => {
  const errors = validateChangePasswordForm(req.body);
  if (!_.isEmpty(errors)) {
    return res.json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }
  const user = req.user;
  user.local.password = req.body.password;
  return user.save((err) => {
    if (err) return res.send(err);
    return res.json({
      success: true,
      message: 'Password reset. You may now log in with the new password',
    });
  });
};

export const contactForm = (req, res) => {
  if (!req.body.recaptcha) {
    return res.json({
      success: false,
    });
  }
  const formData = new FormData();
  formData.append('secret', config.recaptcha.secret);
  formData.append('response', req.body.recaptcha);
  const options = {
    method: 'post',
    body: formData,
  };
  return fetch(config.recaptcha.url, options)
  .then(response => response.json())
  .then((json) => {
    if (json.success) {
      contactMail({
        name: req.body.name,
        email: req.body.email,
        content: req.body.content,
      });
      return res.json({
        success: true,
      });
    }
    return res.json({
      success: false,
    });
  });
};

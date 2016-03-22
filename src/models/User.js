// api/models/User.js

import mongoose from 'mongoose';
import bcrypt from 'bcrypt-nodejs';

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: {
    type: String,
  },
  local: {
    email: {
      type: String,
    },
    password: {
      type: String,
    },
  },
  facebook: {
    id: {
      type: String,
    },
    name: {
      type: String,
    },
    email: {
      type: String,
    },
  },
  google: {
    id: {
      type: String,
    },
    name: {
      type: String,
    },
    email: {
      type: String,
    },
  },
});

UserSchema.pre('save', function hashPassword(next) {
  if (this.isModified('local.password') || this.isNew && this.local.password) {
    bcrypt.genSalt(10, (err, salt) => {
      if (err) return next(err);
      return bcrypt.hash(this.local.password, salt, null, (err2, hash) => {
        if (err2) return next(err2);
        this.local.password = hash;
        return next();
      });
    });
  } else {
    return next();
  }
  return null;
});

UserSchema.methods.comparePassword = function comparePassword(password, next) {
  return bcrypt.compare(password, this.local.password, next);
};

const User = mongoose.model('User', UserSchema);

export default User;

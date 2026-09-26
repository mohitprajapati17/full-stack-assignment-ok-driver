import mongoose from 'mongoose';
import { USER_ROLES, enumValues } from '../constants/enums.js';
import { toJSONPlugin } from './plugins/toJSON.plugin.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      maxlength: 254,
      match: [EMAIL_REGEX, 'Email is invalid'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
      select: false,
      private: true,
    },
    role: {
      type: String,
      enum: enumValues(USER_ROLES),
      default: USER_ROLES.OPERATOR,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1, isActive: 1 });

userSchema.plugin(toJSONPlugin);

export const User = mongoose.model('User', userSchema);

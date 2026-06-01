import mongoose from 'mongoose';
import { getDefaultTokenGrant } from '@/lib/config/tokens.js';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    name: { type: String, trim: true, default: '' },
    tokenBalance: { type: Number, default: getDefaultTokenGrant },
    tokensUsed: { type: Number, default: 0 },
    tokensGranted: { type: Number, default: getDefaultTokenGrant },
  },
  { timestamps: true }
);

// Avoid stale schema in dev after hot reload
if (mongoose.models.User) {
  delete mongoose.models.User;
}

export const User = mongoose.model('User', userSchema);

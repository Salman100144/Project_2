import mongoose, { Document, Schema, Model } from 'mongoose';

/**
 * User Interface
 * Mirrors BetterAuth's user schema + our custom fields
 */
export interface IUser {
  _id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string;
  firstName?: string;
  lastName?: string;
  role: 'customer' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserDocument extends Omit<IUser, '_id'>, Document {}

export interface IUserModel extends Model<IUserDocument> {
  findByEmail(email: string): Promise<IUserDocument | null>;
  findAdmins(): Promise<IUserDocument[]>;
}

/**
 * User Schema
 * 
 * NOTE: BetterAuth manages user creation/updates through its own adapter.
 * This Mongoose model is for READ operations and relationships with other models.
 * Do NOT use this model to create/update users - use BetterAuth API instead.
 */
const userSchema = new Schema<IUserDocument, IUserModel>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    image: {
      type: String,
      default: null,
    },
    firstName: {
      type: String,
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
      type: String,
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    role: {
      type: String,
      enum: {
        values: ['customer', 'admin'],
        message: 'Role must be either customer or admin',
      },
      default: 'customer',
    },
  },
  {
    timestamps: true,
    // Use the same collection that BetterAuth uses
    collection: 'user',
    // Ensure virtuals are included in JSON
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for faster queries
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });

/**
 * Virtual: fullName
 * Combines firstName and lastName, falls back to name
 */
userSchema.virtual('fullName').get(function (this: IUserDocument) {
  if (this.firstName && this.lastName) {
    return `${this.firstName} ${this.lastName}`;
  }
  return this.name;
});

/**
 * Static: Find user by email
 */
userSchema.statics.findByEmail = function (email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

/**
 * Static: Find all admin users
 */
userSchema.statics.findAdmins = function () {
  return this.find({ role: 'admin' });
};

/**
 * Instance method: Check if user is admin
 */
userSchema.methods.isAdmin = function (this: IUserDocument): boolean {
  return this.role === 'admin';
};

// Create and export the model
const User = mongoose.model<IUserDocument, IUserModel>('User', userSchema);

export default User;

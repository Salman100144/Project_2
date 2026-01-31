import mongoose, { Document, Schema, Model, Types } from 'mongoose';

/**
 * Wishlist Item Interface
 * Represents a single item in the wishlist
 */
export interface IWishlistItem {
  productId: number; // DummyJSON product ID
  title: string;
  price: number;
  thumbnail: string;
  addedAt: Date;
}

/**
 * Wishlist Interface
 */
export interface IWishlist {
  _id: Types.ObjectId;
  userId: string; // BetterAuth user ID
  items: IWishlistItem[];
  totalItems: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IWishlistDocument extends Omit<IWishlist, '_id'>, Document {}

export interface IWishlistModel extends Model<IWishlistDocument> {
  findByUserId(userId: string): Promise<IWishlistDocument | null>;
  getOrCreate(userId: string): Promise<IWishlistDocument>;
}

/**
 * Wishlist Item Schema
 */
const wishlistItemSchema = new Schema<IWishlistItem>(
  {
    productId: {
      type: Number,
      required: [true, 'Product ID is required'],
    },
    title: {
      type: String,
      required: [true, 'Product title is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    thumbnail: {
      type: String,
      required: [true, 'Product thumbnail is required'],
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

/**
 * Wishlist Schema
 */
const wishlistSchema = new Schema<IWishlistDocument, IWishlistModel>(
  {
    userId: {
      type: String,
      required: [true, 'User ID is required'],
      unique: true,
      index: true,
    },
    items: {
      type: [wishlistItemSchema],
      default: [],
    },
    totalItems: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/**
 * Pre-save hook to calculate total items
 */
wishlistSchema.pre('save', function () {
  this.totalItems = this.items.length;
});

/**
 * Static: Find wishlist by user ID
 */
wishlistSchema.statics.findByUserId = function (userId: string) {
  return this.findOne({ userId });
};

/**
 * Static: Get or create wishlist for user
 */
wishlistSchema.statics.getOrCreate = async function (userId: string) {
  let wishlist = await this.findOne({ userId });
  if (!wishlist) {
    wishlist = await this.create({ userId, items: [] });
  }
  return wishlist;
};

const Wishlist = mongoose.model<IWishlistDocument, IWishlistModel>(
  'Wishlist',
  wishlistSchema
);

export default Wishlist;

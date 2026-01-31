import mongoose, { Document, Schema, Model, Types } from 'mongoose';

/**
 * Cart Item Interface
 * Represents a single item in the cart
 */
export interface ICartItem {
  productId: number; // DummyJSON product ID
  quantity: number;
  price: number; // Price at time of adding to cart
  title: string;
  thumbnail: string;
  addedAt: Date;
}

/**
 * Cart Interface
 */
export interface ICart {
  _id: Types.ObjectId;
  userId: string; // BetterAuth user ID
  items: ICartItem[];
  totalItems: number;
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICartDocument extends Omit<ICart, '_id'>, Document {
  calculateTotals(): void;
}

export interface ICartModel extends Model<ICartDocument> {
  findByUserId(userId: string): Promise<ICartDocument | null>;
  getOrCreate(userId: string): Promise<ICartDocument>;
}

/**
 * Cart Item Schema
 */
const cartItemSchema = new Schema<ICartItem>(
  {
    productId: {
      type: Number,
      required: [true, 'Product ID is required'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
      default: 1,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    title: {
      type: String,
      required: [true, 'Product title is required'],
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
 * Cart Schema
 */
const cartSchema = new Schema<ICartDocument, ICartModel>(
  {
    userId: {
      type: String,
      required: [true, 'User ID is required'],
      unique: true,
      index: true,
    },
    items: {
      type: [cartItemSchema],
      default: [],
    },
    totalItems: {
      type: Number,
      default: 0,
    },
    totalPrice: {
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
 * Calculate totals method
 */
cartSchema.methods.calculateTotals = function (): void {
  this.totalItems = this.items.reduce(
    (sum: number, item: ICartItem) => sum + item.quantity,
    0
  );
  this.totalPrice = this.items.reduce(
    (sum: number, item: ICartItem) => sum + item.price * item.quantity,
    0
  );
};

/**
 * Pre-save hook to calculate totals
 */
cartSchema.pre('save', function () {
  this.calculateTotals();
});

/**
 * Static: Find cart by user ID
 */
cartSchema.statics.findByUserId = function (userId: string) {
  return this.findOne({ userId });
};

/**
 * Static: Get or create cart for user
 */
cartSchema.statics.getOrCreate = async function (userId: string) {
  let cart = await this.findOne({ userId });
  if (!cart) {
    cart = await this.create({ userId, items: [] });
  }
  return cart;
};

const Cart = mongoose.model<ICartDocument, ICartModel>('Cart', cartSchema);

export default Cart;

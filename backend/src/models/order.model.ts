import mongoose, { Schema, Document } from 'mongoose';
import { Order, OrderItem, ShippingAddress, OrderStatus, PaymentStatus, StatusHistoryEntry, TrackingInfo } from '../types/order.types';

export interface IOrder extends Omit<Order, '_id'>, Document {}

const OrderItemSchema = new Schema<OrderItem>(
  {
    productId: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    title: { type: String, required: true },
    thumbnail: { type: String, required: true },
  },
  { _id: false }
);

const ShippingAddressSchema = new Schema<ShippingAddress>(
  {
    fullName: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    phone: { type: String },
  },
  { _id: false }
);

const StatusHistorySchema = new Schema<StatusHistoryEntry>(
  {
    status: { 
      type: String, 
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      required: true 
    },
    timestamp: { type: Date, required: true, default: Date.now },
    note: { type: String },
  },
  { _id: false }
);

const TrackingInfoSchema = new Schema<TrackingInfo>(
  {
    carrier: { type: String },
    trackingNumber: { type: String },
    estimatedDelivery: { type: Date },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    userId: { 
      type: String, 
      required: true, 
      index: true 
    },
    items: {
      type: [OrderItemSchema],
      required: true,
      validate: [(val: OrderItem[]) => val.length > 0, 'Order must have at least one item'],
    },
    totalItems: { 
      type: Number, 
      required: true, 
      min: 1 
    },
    subtotal: { 
      type: Number, 
      required: true, 
      min: 0 
    },
    tax: { 
      type: Number, 
      required: true, 
      default: 0, 
      min: 0 
    },
    shipping: { 
      type: Number, 
      required: true, 
      default: 0, 
      min: 0 
    },
    totalPrice: { 
      type: Number, 
      required: true, 
      min: 0 
    },
    shippingAddress: {
      type: ShippingAddressSchema,
      required: true,
    },
    paymentIntentId: { 
      type: String, 
      required: true,
      unique: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    orderStatus: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    statusHistory: {
      type: [StatusHistorySchema],
      default: [],
    },
    trackingInfo: {
      type: TrackingInfoSchema,
      default: null,
    },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for common queries (paymentIntentId index is created via unique: true)
OrderSchema.index({ paymentStatus: 1 });
OrderSchema.index({ orderStatus: 1 });
OrderSchema.index({ createdAt: -1 });

export const OrderModel = mongoose.model<IOrder>('Order', OrderSchema);
export default OrderModel;

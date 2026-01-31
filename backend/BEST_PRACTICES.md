
# Backend Best Practices & Patterns

## Tech Stack
- **Express.js** with TypeScript
- **BetterAuth** for authentication
- **Mongoose** for MongoDB ODM
- **Zod** for validation

---

## 📁 Folder Structure

```
src/
├── config/             # Configuration files
│   ├── database.ts     # MongoDB connection
│   ├── auth.ts         # BetterAuth configuration
│   └── env.ts          # Environment variables
├── controllers/        # Request handlers
│   ├── authController.ts
│   ├── productController.ts
│   ├── cartController.ts
│   └── orderController.ts
├── models/             # Mongoose models
│   ├── User.ts
│   ├── Product.ts
│   ├── Cart.ts
│   └── Order.ts
├── routes/             # Express routes
│   ├── index.ts        # Route aggregator
│   ├── authRoutes.ts
│   ├── productRoutes.ts
│   ├── cartRoutes.ts
│   └── orderRoutes.ts
├── middleware/         # Express middleware
│   ├── auth.ts         # Authentication middleware
│   ├── errorHandler.ts # Global error handler
│   ├── validate.ts     # Request validation
│   └── rateLimiter.ts  # Rate limiting
├── services/           # Business logic
│   ├── authService.ts
│   ├── productService.ts
│   ├── cartService.ts
│   ├── orderService.ts
│   └── paymentService.ts
├── utils/              # Utility functions
│   ├── ApiError.ts     # Custom error class
│   ├── ApiResponse.ts  # Standardized responses
│   ├── asyncHandler.ts # Async wrapper
│   └── logger.ts       # Logging utility
├── types/              # TypeScript types
│   ├── express.d.ts    # Express type extensions
│   └── index.ts
├── validators/         # Zod schemas
│   ├── authValidator.ts
│   ├── productValidator.ts
│   └── orderValidator.ts
├── app.ts              # Express app setup
└── server.ts           # Server entry point
```

---

## 🏗️ Architecture Patterns

### 1. Layered Architecture
```
Request → Routes → Controllers → Services → Models → Database
                         ↓
                   Middleware (auth, validation, error handling)
```

### 2. Separation of Concerns
- **Routes**: Define endpoints and attach middleware
- **Controllers**: Handle HTTP request/response
- **Services**: Business logic (reusable across controllers)
- **Models**: Database schema and data access

---

## 🔧 Configuration Patterns

### 1. Environment Configuration
```typescript
// config/env.ts
import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000'),
  MONGODB_URI: z.string(),
  BETTER_AUTH_SECRET: z.string(),
  BETTER_AUTH_URL: z.string(),
  STRIPE_SECRET_KEY: z.string().optional(),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
```

### 2. Database Connection
```typescript
// config/database.ts
import mongoose from 'mongoose';
import { env } from './env';

export const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected');
});

mongoose.connection.on('error', (error) => {
  console.error('❌ MongoDB error:', error);
});
```

---

## 📝 Model Patterns

### 1. Mongoose Model Structure
```typescript
// models/User.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  name: string;
  emailVerified: boolean;
  image?: string;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    image: {
      type: String,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes
userSchema.index({ email: 1 });

export const User = mongoose.model<IUser>('User', userSchema);
```

### 2. Product Model
```typescript
// models/Product.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand: string;
  category: string;
  thumbnail: string;
  images: string[];
}

const productSchema = new Schema<IProduct>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    discountPercentage: { type: Number, default: 0, min: 0, max: 100 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    stock: { type: Number, required: true, min: 0 },
    brand: { type: String, required: true },
    category: { type: String, required: true, index: true },
    thumbnail: { type: String, required: true },
    images: [{ type: String }],
  },
  { timestamps: true }
);

// Text index for search
productSchema.index({ title: 'text', description: 'text', brand: 'text' });

export const Product = mongoose.model<IProduct>('Product', productSchema);
```

### 3. Order Model
```typescript
// models/Order.ts
import mongoose, { Schema, Document } from 'mongoose';

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  title: string;
  price: number;
  quantity: number;
  thumbnail: string;
}

export interface IShippingAddress {
  fullName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;
  items: IOrderItem[];
  shippingAddress: IShippingAddress;
  paymentIntentId: string;
  status: OrderStatus;
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  trackingNumber?: string;
  estimatedDelivery?: Date;
  deliveredAt?: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        title: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
        thumbnail: { type: String, required: true },
      },
    ],
    shippingAddress: {
      fullName: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
      phone: { type: String, required: true },
    },
    paymentIntentId: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    subtotal: { type: Number, required: true },
    shippingCost: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true },
    trackingNumber: { type: String },
    estimatedDelivery: { type: Date },
    deliveredAt: { type: Date },
  },
  { timestamps: true }
);

export const Order = mongoose.model<IOrder>('Order', orderSchema);
```

---

## 🛣️ Route Patterns

### 1. Route Definition
```typescript
// routes/productRoutes.ts
import { Router } from 'express';
import { productController } from '../controllers/productController';
import { validate } from '../middleware/validate';
import { productValidators } from '../validators/productValidator';
import { auth, adminOnly } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', productController.getProducts);
router.get('/search', productController.searchProducts);
router.get('/categories', productController.getCategories);
router.get('/:id', validate(productValidators.getById), productController.getProductById);

// Admin routes
router.post('/', auth, adminOnly, validate(productValidators.create), productController.createProduct);
router.put('/:id', auth, adminOnly, validate(productValidators.update), productController.updateProduct);
router.delete('/:id', auth, adminOnly, productController.deleteProduct);

export default router;
```

### 2. Route Aggregator
```typescript
// routes/index.ts
import { Router } from 'express';
import productRoutes from './productRoutes';
import cartRoutes from './cartRoutes';
import orderRoutes from './orderRoutes';

const router = Router();

router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);

// Health check
router.get('/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
```

---

## 🎮 Controller Patterns

### 1. Controller Structure
```typescript
// controllers/productController.ts
import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { productService } from '../services/productService';

export const productController = {
  getProducts: asyncHandler(async (req: Request, res: Response) => {
    const { category, limit = 20, skip = 0, sortBy, order } = req.query;
    
    const products = await productService.getProducts({
      category: category as string,
      limit: Number(limit),
      skip: Number(skip),
      sortBy: sortBy as string,
      order: order as 'asc' | 'desc',
    });

    res.json(new ApiResponse(200, products, 'Products fetched successfully'));
  }),

  getProductById: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const product = await productService.getProductById(id);

    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    res.json(new ApiResponse(200, product, 'Product fetched successfully'));
  }),

  searchProducts: asyncHandler(async (req: Request, res: Response) => {
    const { q } = req.query;
    
    if (!q || typeof q !== 'string') {
      throw new ApiError(400, 'Search query is required');
    }

    const products = await productService.searchProducts(q);
    res.json(new ApiResponse(200, products, 'Search results'));
  }),

  createProduct: asyncHandler(async (req: Request, res: Response) => {
    const product = await productService.createProduct(req.body);
    res.status(201).json(new ApiResponse(201, product, 'Product created successfully'));
  }),
};
```

---

## 🔧 Service Patterns

### 1. Service Structure
```typescript
// services/productService.ts
import { Product, IProduct } from '../models/Product';
import { ApiError } from '../utils/ApiError';

interface GetProductsParams {
  category?: string;
  limit: number;
  skip: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export const productService = {
  getProducts: async (params: GetProductsParams) => {
    const { category, limit, skip, sortBy = 'createdAt', order = 'desc' } = params;
    
    const query = category ? { category } : {};
    const sortOrder = order === 'asc' ? 1 : -1;

    const [products, total] = await Promise.all([
      Product.find(query)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query),
    ]);

    return { products, total, skip, limit };
  },

  getProductById: async (id: string) => {
    return Product.findById(id).lean();
  },

  searchProducts: async (query: string) => {
    return Product.find(
      { $text: { $search: query } },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(20)
      .lean();
  },

  createProduct: async (data: Partial<IProduct>) => {
    const product = new Product(data);
    return product.save();
  },

  updateProduct: async (id: string, data: Partial<IProduct>) => {
    const product = await Product.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }
    
    return product;
  },

  deleteProduct: async (id: string) => {
    const product = await Product.findByIdAndDelete(id);
    
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }
    
    return product;
  },
};
```

---

## 🛡️ Middleware Patterns

### 1. Async Handler
```typescript
// utils/asyncHandler.ts
import { Request, Response, NextFunction } from 'express';

type AsyncFunction = (req: Request, res: Response, next: NextFunction) => Promise<any>;

export const asyncHandler = (fn: AsyncFunction) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
```

### 2. Error Handler
```typescript
// middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { env } from '../config/env';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
      ...(env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: err.message,
    });
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format',
    });
  }

  // Default error
  console.error('Unhandled Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
```

### 3. Validation Middleware
```typescript
// middleware/validate.ts
import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation Error',
          errors: error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        });
      }
      next(error);
    }
  };
};
```

### 4. Auth Middleware
```typescript
// middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import { auth } from '../config/auth';
import { ApiError } from '../utils/ApiError';

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session) {
      throw new ApiError(401, 'Unauthorized');
    }

    req.user = session.user;
    req.session = session.session;
    next();
  } catch (error) {
    next(new ApiError(401, 'Unauthorized'));
  }
};

export const adminOnly = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'admin') {
    throw new ApiError(403, 'Admin access required');
  }
  next();
};
```

---

## 📊 Utility Classes

### 1. Custom API Error
```typescript
// utils/ApiError.ts
export class ApiError extends Error {
  statusCode: number;
  errors: any[];
  isOperational: boolean;

  constructor(
    statusCode: number,
    message: string,
    errors: any[] = [],
    stack = ''
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
```

### 2. Standardized API Response
```typescript
// utils/ApiResponse.ts
export class ApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;

  constructor(statusCode: number, data: T, message = 'Success') {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}
```

---

## ✅ Validation Patterns

### 1. Zod Validators
```typescript
// validators/productValidator.ts
import { z } from 'zod';

export const productValidators = {
  getById: z.object({
    params: z.object({
      id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid product ID'),
    }),
  }),

  create: z.object({
    body: z.object({
      title: z.string().min(2).max(200),
      description: z.string().min(10).max(2000),
      price: z.number().positive(),
      discountPercentage: z.number().min(0).max(100).optional(),
      stock: z.number().int().min(0),
      brand: z.string().min(1).max(100),
      category: z.string().min(1).max(100),
      thumbnail: z.string().url(),
      images: z.array(z.string().url()).optional(),
    }),
  }),

  update: z.object({
    params: z.object({
      id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid product ID'),
    }),
    body: z.object({
      title: z.string().min(2).max(200).optional(),
      description: z.string().min(10).max(2000).optional(),
      price: z.number().positive().optional(),
      discountPercentage: z.number().min(0).max(100).optional(),
      stock: z.number().int().min(0).optional(),
      brand: z.string().min(1).max(100).optional(),
      category: z.string().min(1).max(100).optional(),
      thumbnail: z.string().url().optional(),
      images: z.array(z.string().url()).optional(),
    }),
  }),
};
```

---

## 🔐 BetterAuth Setup

### 1. Auth Configuration
```typescript
// config/auth.ts
import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { MongoClient } from 'mongodb';
import { env } from './env';

const client = new MongoClient(env.MONGODB_URI);

export const auth = betterAuth({
  database: mongodbAdapter(client.db()),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set true in production
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        default: 'user',
      },
    },
  },
  trustedOrigins: [env.FRONTEND_URL],
});

export type Session = typeof auth.$Infer.Session;
```

### 2. Auth Routes Integration
```typescript
// app.ts
import express from 'express';
import cors from 'cors';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './config/auth';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { env } from './config/env';

const app = express();

// CORS
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
}));

// BetterAuth handler - must be before JSON parser for auth routes
app.all('/api/auth/*', toNodeHandler(auth));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api', routes);

// Error handler
app.use(errorHandler);

export default app;
```

---

## ✅ Code Quality Checklist

- [ ] Use TypeScript strict mode
- [ ] Define interfaces for all data structures
- [ ] Use async/await with proper error handling
- [ ] Validate all inputs with Zod
- [ ] Use environment variables for config
- [ ] Implement proper logging
- [ ] Add request rate limiting
- [ ] Use proper HTTP status codes
- [ ] Document API endpoints
- [ ] Handle database connection errors
- [ ] Implement graceful shutdown
- [ ] Add health check endpoint

---

## 📦 Recommended Packages

```json
{
  "dependencies": {
    "express": "^4.18.x",
    "mongoose": "^8.x",
    "better-auth": "^1.x",
    "zod": "^3.x",
    "cors": "^2.x",
    "helmet": "^7.x",
    "morgan": "^1.x",
    "stripe": "^14.x",
    "dotenv": "^16.x"
  },
  "devDependencies": {
    "@types/express": "^4.x",
    "@types/node": "^20.x",
    "@types/cors": "^2.x",
    "@types/morgan": "^1.x",
    "typescript": "^5.x",
    "tsx": "^4.x",
    "nodemon": "^3.x"
  }
}
```

---

## 🚀 Scripts

```json
{
  "scripts": {
    "dev": "nodemon --exec tsx src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "lint": "eslint src --ext .ts",
    "typecheck": "tsc --noEmit"
  }
}
```

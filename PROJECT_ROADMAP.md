# E-Commerce Store - Project Roadmap

## Tech Stack
- **Frontend**: React, TypeScript, Zustand, Tailwind CSS, shadcn/ui, Axios
- **Backend**: Express.js, BetterAuth, Mongoose, TypeScript
- **Database**: MongoDB
- **Payment**: Stripe
- **API for Product Data**: [DummyJSON](https://dummyjson.com)

---

## Phase 1: Foundation Setup ✅
### Tasks:
- [x] Create folder structure
- [x] Create best practices documentation
- [x] Initialize frontend with Vite + React + TypeScript
- [x] Configure Tailwind CSS
- [x] Install and configure shadcn/ui
- [x] Set up Zustand store structure
- [x] Initialize backend with Express + TypeScript
- [x] Configure MongoDB connection
- [x] Set up basic routing structure

---

## Phase 2: Authentication ← (Current)
### Tasks:
- [x] Set up BetterAuth on backend
- [x] Create User model (Mongoose)
- [x] Implement registration endpoint (POST /api/auth/sign-up/email)
- [x] Implement login endpoint (POST /api/auth/sign-in/email)
- [x] Implement logout endpoint (POST /api/auth/sign-out)
- [x] Create auth middleware
- [x] Frontend: Create auth store (Zustand)
- [x] Frontend: Login page
- [x] Frontend: Register page
- [ ] Frontend: Protected routes
- [ ] Frontend: Auth context/provider

### Acceptance Criteria:
- Users can register with email/password
- Users can login and receive session
- Protected routes redirect to login
- Session persists on page refresh

---

## Phase 3: Products Module
### Tasks:
- [ ] Fetch products from DummyJSON API
- [ ] Create Product types/interfaces
- [ ] Backend: Product caching layer (optional)
- [ ] Frontend: Products store (Zustand)
- [ ] Frontend: Product listing page
- [ ] Frontend: Product card component
- [ ] Frontend: Product detail page
- [ ] Frontend: Category filter
- [ ] Frontend: Search functionality
- [ ] Frontend: Sorting (price, rating)
- [ ] Frontend: Pagination

### Acceptance Criteria:
- Products display with images, price, title
- Users can filter by category
- Users can search products
- Product detail page shows full info

---

## Phase 4: Cart & Wishlist
### Tasks:
- [ ] Backend: Cart model
- [ ] Backend: Cart CRUD endpoints
- [ ] Backend: Wishlist model
- [ ] Backend: Wishlist CRUD endpoints
- [ ] Frontend: Cart store (Zustand)
- [ ] Frontend: Wishlist store
- [ ] Frontend: Cart page
- [ ] Frontend: Add to cart functionality
- [ ] Frontend: Cart sidebar/drawer
- [ ] Frontend: Quantity controls
- [ ] Frontend: Wishlist page
- [ ] Frontend: Move to cart from wishlist

### Acceptance Criteria:
- Users can add/remove items from cart
- Cart persists for logged-in users
- Quantity can be adjusted
- Cart shows total price
- Wishlist functionality works

---

## Phase 5: Checkout & Payment (Stripe)
### Tasks:
- [ ] Set up Stripe account
- [ ] Backend: Stripe integration
- [ ] Backend: Create payment intent endpoint
- [ ] Backend: Order model
- [ ] Backend: Webhook for payment confirmation
- [ ] Frontend: Checkout page
- [ ] Frontend: Shipping address form
- [ ] Frontend: Stripe Elements integration
- [ ] Frontend: Order confirmation page
- [ ] Frontend: Payment error handling

### Acceptance Criteria:
- Users can enter shipping info
- Stripe payment form works
- Order is created after successful payment
- User receives confirmation

---

## Phase 6: Order Tracking
### Tasks:
- [ ] Backend: Order status enum (pending, processing, shipped, delivered)
- [ ] Backend: Order history endpoint
- [ ] Backend: Single order detail endpoint
- [ ] Frontend: Order history page
- [ ] Frontend: Order detail page
- [ ] Frontend: Order status tracker component
- [ ] Frontend: Order timeline visualization

### Acceptance Criteria:
- Users can view order history
- Each order shows current status
- Visual timeline of order progress

---

## Phase 7: Admin Panel
### Tasks:
- [ ] Backend: Admin role check middleware
- [ ] Backend: Admin product management endpoints
- [ ] Backend: Admin order management endpoints
- [ ] Backend: Admin user management endpoints
- [ ] Backend: Dashboard stats endpoint
- [ ] Frontend: Admin layout
- [ ] Frontend: Admin dashboard with stats
- [ ] Frontend: Product management (CRUD)
- [ ] Frontend: Order management
- [ ] Frontend: User management

### Acceptance Criteria:
- Admin can manage products
- Admin can update order status
- Admin can view/manage users
- Dashboard shows key metrics

---

## Phase 8: Polish & Deployment
### Tasks:
- [ ] Add loading states everywhere
- [ ] Error boundaries
- [ ] SEO meta tags
- [ ] Performance optimization
- [ ] Mobile responsiveness check
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Set up CI/CD
- [ ] Deploy frontend (Vercel/Netlify)
- [ ] Deploy backend (Railway/Render)
- [ ] Set up production MongoDB (Atlas)

---

## API Reference: DummyJSON

### Products
- `GET /products` - All products
- `GET /products/{id}` - Single product
- `GET /products/search?q={query}` - Search products
- `GET /products/categories` - All categories
- `GET /products/category/{category}` - Products by category

### Auth (for reference, we'll use BetterAuth)
- `POST /auth/login` - Login
- `GET /auth/me` - Current user

### Carts
- `GET /carts/user/{userId}` - User's carts
- `POST /carts/add` - Add to cart

Base URL: `https://dummyjson.com`

---

## Folder Structure

```
Project_2/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── stores/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── types/
│   │   └── services/
│   └── ...config files
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── services/
│   │   ├── utils/
│   │   └── config/
│   └── ...config files
└── PROJECT_ROADMAP.md
```

---

## Estimated Timeline
- **Phase 1-2**: 1-2 weeks
- **Phase 3-4**: 2-3 weeks
- **Phase 5-6**: 2 weeks
- **Phase 7**: 1-2 weeks
- **Phase 8**: 1 week

**Total**: 7-10 weeks for a production-ready MVP

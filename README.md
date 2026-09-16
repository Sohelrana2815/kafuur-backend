# Kafuur — E-commerce Backend

REST API and backend services for **Kafuur**, a premium fragrance and body spray e-commerce platform.

## Overview

Kafuur Backend provides the server-side API, business logic, authentication, database operations, order processing, and payment integration for the Kafuur e-commerce platform.

The backend is responsible for managing users, products, shopping carts, orders, payments, and administrative operations while providing a secure and scalable API for the Kafuur frontend.

## Features

* User registration and authentication
* JWT-based authentication
* Role-based authorization
* User profile management
* Product creation, updating, and deletion
* Product search, filtering, sorting, and pagination
* Shopping cart management
* Cart ownership validation
* Order creation and management
* Order item price snapshots
* Cash on Delivery and online payment support
* Stripe Checkout integration
* Payment status management
* Order status management
* Transaction tracking
* Request validation
* Centralized error handling
* Secure API responses
* Database transactions
* PostgreSQL database
* Prisma ORM

## Tech Stack

* Node.js
* TypeScript
* Express.js
* Prisma ORM
* PostgreSQL
* Stripe
* Zod
* JWT
* bcrypt
* pnpm

## Project Architecture

```text
src/
├── app/
│   ├── modules/
│   │   ├── auth/
│   │   ├── user/
│   │   ├── product/
│   │   ├── cart/
│   │   ├── order/
│   │   └── payment/
│   │
│   ├── middlewares/
│   ├── routes/
│   ├── errors/
│   ├── utils/
│   └── lib/
│
├── config/
├── app.ts
└── server.ts
```

## Core Modules

### Authentication

Handles:

* User registration
* Login
* JWT Token generation
* Authentication middleware
* Role-based authorization

### Users

Handles:

* User profiles
* Account status
* Contact information
* User administration

### Products

Handles:

* Product management
* Product categories
* Product search
* Filtering
* Sorting
* Pagination

### Cart

Handles:

* Adding products to cart
* Updating quantities
* Removing cart items
* Cart ownership validation
* Order summary calculations

### Orders (Not fully Completed yet)

Handles:

* Order creation
* Order item management
* Order status
* Payment status
* Delivery fees
* Historical pricing
* Order administration

### Payments

Handles:

* Stripe Checkout Sessions
* Online payment processing
* Transaction tracking
* Payment verification
* Payment status updates

## Database

Kafuur uses **PostgreSQL** as the primary database and **Prisma ORM** for database access.


## Environment Variables

Create a `.env` file in the project root and add the following environment variables:

```env
# Server
PORT="5000"
NODE_ENV="development"

# Database
DATABASE_URL=""

# Security
BCRYPT_SALT_ROUND="10"

JWT_ACCESS_SECRET=""
JWT_ACCESS_EXPIRES_IN="3d"

JWT_REFRESH_SECRET=""
JWT_REFRESH_EXPIRES_IN="30d"

# Admin
ADMIN_EMAIL="admin@test.com"
ADMIN_PASSWORD="admin"

# Cloudinary
CLOUDINARY_CLOUDE_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

# Google OAuth 2.0
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GOOGLE_CALLBACK_URL="http://localhost:5000/api/v1/auth/google/callback"

# Express Session
EXPRESS_SESSION_SECRET=""

# Frontend
FRONTEND_URL="http://localhost:3000"

# Stripe Payment
STRIPE_PUBLISHABLE_KEY=""
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""

# Delivery Fee
DELIVERY_FEE=""
```

> **Note:** Replace the empty values with your actual credentials and configuration. Do not commit your `.env` file or expose secrets such as database credentials, JWT secrets, Cloudinary API secrets, Google OAuth secrets, or Stripe secret keys.


Never commit environment variables or secrets to the repository.

## Getting Started

### 1. Clone the repository

```bash
git clone <backend-repository-url>
cd <backend-project>
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment variables

Create a `.env` file and add the required environment variables.

### 4. Generate Prisma Client

```bash
pnpm prisma generate
```

### 5. Run database migrations

```bash
pnpm prisma migrate dev
```

### 6. Start the development server

```bash
pnpm dev
```

The API will be available at:

```text
http://localhost:5000
```

## API

Base API URL:

```text
/api/v1
```

### Main Endpoints

| Module   | Endpoint    | Description        |
| -------- | ----------- | ------------------ |
| Auth     | `/auth`     | Authentication     |
| Users    | `/users`    | User management    |
| Products | `/products` | Product management |
| Cart     | `/cart`     | Shopping cart      |
| Orders   | `/orders`   | Order management   |
| Payments | `/payments` | Payment operations |

## API Query Features

The backend supports reusable query functionality for administrative and catalog APIs.

### Search

```text
?search=nolan
```

### Filtering

```text
?category=MEN
```

### Sorting

```text
?sort=-price
```

### Field Selection

```text
?fields=name,price,category
```

### Pagination

```text
?page=1&limit=10
```

These query capabilities allow frontend clients to efficiently retrieve and manage large datasets.

## Order & Payment Flow

```text
Customer
   │
   ▼
Select Cart Items
   │
   ▼
Create Order
   │
   ├── COD ───────────────► Order Created
   │
   └── ONLINE
          │
          ▼
   Create Stripe Session
          │
          ▼
   Customer Completes Payment
          │
          ▼
   Stripe Webhook / Verification
          │
          ▼
   Update Payment Status
          │
          ▼
   Update Transaction ID
```

For online payments, the order stores the Stripe session identifier temporarily for payment tracking while the final transaction identifier is stored after successful payment.

## Order Pricing

Order item prices are stored as snapshots when an order is created.

For example:

```text
Product price at purchase: ৳154
Quantity: 2

OrderItem price:
৳154
```

If the product price later changes to ৳199, the historical order still retains the original purchase price of ৳154.

This prevents past orders from being affected by future product price changes.

## Security

The API follows several security practices:

* Passwords are hashed using bcrypt.
* Authentication is handled through JWT.
* Protected routes require authentication.
* Administrative operations use role-based authorization.
* User ownership is validated for cart and order operations.
* Sensitive fields are excluded from API responses.
* Environment variables are used for secrets.
* Database operations use Prisma transactions where atomicity is required.

## Database Transactions

Critical operations such as order creation use database transactions to ensure consistency.

For example:

```text
Create Order
     ↓
Create Order Items
     ↓
Remove Purchased Cart Items
     ↓
Commit Transaction
```

If any operation fails, the transaction is rolled back.

## Development

Run the development server:

```bash
pnpm dev
```

Generate Prisma Client:

```bash
pnpm prisma generate
```

Open Prisma Studio:

```bash
pnpm prisma studio
```

Build the project:

```bash
pnpm build
```

Run the production server:

```bash
pnpm start
```

## Production

Before deploying:

1. Configure production environment variables.
2. Apply database migrations.
3. Generate the Prisma Client.
4. Build the application.
5. Configure Stripe production credentials.
6. Configure the frontend API URL.
7. Configure CORS for the production frontend.

## Frontend

This backend powers the Kafuur frontend application.

**Frontend Repository:** <frontend-repository-url>

## Related Repository

* **Frontend:** <frontend-repository-url>
* **Backend:** This repository

## Future Improvements

Potential future improvements include:

* Automated order notifications
* Inventory management
* Product reviews and ratings
* Coupon and discount management
* Advanced analytics
* Payment reconciliation
* Improved order tracking
* Automated abandoned-payment handling
* API documentation with Swagger/OpenAPI

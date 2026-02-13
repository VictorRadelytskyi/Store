# EStore - E-commerce Platform

A full-stack e-commerce application with product browsing, shopping cart, order management, and user reviews.

## Author
**Viktor Radelytskyi**

## Technology Stack

### Backend
- **Node.js** with Express.js
- **SQLite** database with Sequelize ORM
- **JWT** authentication with refresh tokens
- **bcrypt** for password hashing

### Frontend  
- **React 18** with TypeScript
- **React Boostsrap** for styling
- **Axios** for API communication
- **React Router** for navigation

## Project Setup

### 1. Backend Setup
Navigate to the backend directory and start the server:

```bash
cd backend
node server.js --with-seed  # First time only (downloads products from FakeStore API and setups admin user)
node server.js              # Subsequent runs
```

### 2. Frontend Setup
Navigate to the frontend directory and start the development server:

```bash
cd frontend
npm run dev
```

## Default Users

The system comes with two pre-configured users:

### Admin User
- **Email:** `admin@store.com`
- **Password:** `admin123456789`
- **Role:** Administrator
- **Access:** Full comment management, order management, user management (NO GUI)

### Regular User
- **Email:** `victor@store.com` 
- **Password:** `victor123456789`
- **Role:** Customer
- **Access:** Product browsing, cart management, order placement, reviews

## Core Functionality

- **Product Catalog** - Browse products by categories with search and filtering
- **Shopping Cart** - Add products, manage quantities, persistent storage
- **User Authentication** - Secure login/logout with JWT tokens
- **Order Management** - Place orders, view history, cancel pending orders
- **Inventory Tracking** - Real-time stock management and availability, with server-side validation
- **Review System** - Product reviews and ratings with user authentication
- **Responsive Design** - Mobile-friendly interface using Bootstrap

## API Features

- RESTful API design with proper HTTP status codes
- Input validation and sanitization
- Role-based access control (admin/user permissions)
- Automatic token refresh for seamless user experience
- Comprehensive error handling and logging
- Backend uses RBAC (2 roles: user and admin), prevents privelege escalation, and uses authenticate and authorize middleware
# EStore - E-commerce Platform

A full-stack e-commerce application with product browsing, shopping cart, order management, and user reviews. Features comprehensive end-to-end testing with Playwright and full Docker containerization.

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
- **React Bootstrap** for styling
- **Axios** for API communication
- **React Router** for navigation

### Testing & DevOps
- **Playwright** for end-to-end testing
- **Docker** with multi-stage builds
- **Docker Compose** for orchestration
- **ESLint** for code quality

## Quick Start with Docker

The fastest way to get the application running:

```bash
# Clone and navigate to project
git clone <repository-url>
cd store

# Start with Docker Compose
docker-compose up --build

# Access the application
# Frontend: http://localhost:5000
# Backend API: http://localhost:5000/api
```

## Development Setup

## Development Setup

### Prerequisites
- Node.js 18+ and npm
- Docker and Docker Compose (optional but recommended)

### 1. Backend Setup
Navigate to the backend directory and start the server:

```bash
cd backend
npm install                  # Install dependencies
node server.js --with-seed  # First time only (downloads products from FakeStore API and setups admin user)
node server.js              # Subsequent runs
```

### 2. Frontend Setup
Navigate to the frontend directory and start the development server:

```bash
cd frontend
npm install      # Install dependencies
npm run dev      # Start development server
```

## Testing

### End-to-End Testing with Playwright
The application includes comprehensive E2E tests covering the complete user journey:

```bash
# Install Playwright (first time only)
npm run test:install

# Run E2E tests
npm run test:e2e

# Run tests with UI mode for debugging
npm run test:e2e -- --ui

# Generate test reports
npm run test:report
```

**Test Coverage:**
- User registration and authentication
- Product browsing and search
- Shopping cart functionality
- Order placement and verification
- Multi-browser support (Chromium, Firefox, WebKit)

**Prerequisites for testing:**
- Application must be running (either via Docker Compose or manual setup)
- Backend seeded with test data
- Frontend accessible at http://localhost:5000

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

### User Features
- **Product Catalog** - Browse products by categories with search and filtering
- **Shopping Cart** - Add products, manage quantities, persistent storage
- **User Authentication** - Secure registration/login with JWT tokens
- **Order Management** - Place orders, view history, cancel pending orders
- **Review System** - Product reviews and ratings with user authentication
- **Responsive Design** - Mobile-friendly interface using Bootstrap

### Admin Features
- **Comment Management** - Moderate and manage user reviews
- **Order Processing** - View and manage customer orders
- **User Management** - Access control and user administration (API only)

### Technical Features
- **Inventory Tracking** - Real-time stock management and availability
- **Role-Based Access Control** - Admin/user permissions with middleware
- **Token Management** - Automatic JWT refresh for seamless experience
- **Input Validation** - Comprehensive server-side validation
- **Error Handling** - Proper HTTP status codes and error responses

## Available Scripts

### Root Level
```bash
npm run test:install    # Install Playwright browsers
npm run test:e2e       # Run E2E tests
npm run test:report    # Generate test reports
```

### Frontend
```bash
npm run dev            # Start development server
npm run build          # Build for production
npm run preview        # Preview production build
npm run lint           # Run ESLint
```

### Backend
```bash
node server.js --with-seed  # Start with seed data
node server.js              # Start server
```

## API Features

- RESTful API design with proper HTTP status codes
- Input validation and sanitization
- Role-based access control (admin/user permissions)
- Automatic token refresh for seamless user experience
- Comprehensive error handling and logging
- Backend uses RBAC (2 roles: user and admin), prevents privilege escalation, and uses authenticate and authorize middleware

## Development Notes

### Database
- Uses SQLite for simplicity and portability
- Database file created automatically on first run
- Sequelize ORM handles migrations and relationships

### Security
- JWT tokens with refresh mechanism
- bcrypt password hashing with salt rounds
- Input sanitization and validation
- CORS configuration for cross-origin requests

### File Structure
```
store/
├── backend/          # Node.js/Express server
├── frontend/         # React TypeScript app
├── tests/           # Playwright E2E tests
├── docker-compose.yml
└── README.md
```
# 🏢 Online Procurement and Supply Management System

A comprehensive, full-stack procurement and supply chain management platform designed to streamline and automate the entire procurement lifecycle. The system features a dual-service architecture with separate portals for organizations and suppliers, enabling efficient bidding, order management, and supply chain coordination.

## 📋 Table of Contents
- [Overview](#overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Technology Stack](#-technology-stack)
- [Getting Started](#-getting-started)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Application](#-running-the-application)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [User Roles & Permissions](#-user-roles--permissions)
- [Workflow](#-system-workflow)
- [Development](#-development)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

## 🎯 Overview

This system provides an end-to-end solution for modern procurement operations, featuring:
- **Dual Portal Architecture**: Separate, specialized interfaces for organizations and suppliers
- **Complete Procurement Lifecycle**: From purchase request creation to payment processing
- **Advanced Supplier Management**: Supplier registration, catalog management, RFQ/bidding system
- **Real-time Collaboration**: Live notifications, status updates, and document sharing
- **Enterprise-Grade Security**: JWT authentication, role-based access control, input sanitization, and NoSQL injection prevention

## ✨ Features

### Organization Portal
- **Purchase Request Management**: Create, review, approve, and track purchase requests
- **Approval Workflows**: Configurable approval routing with multi-level authorization
- **Supplier Directory**: Centralized supplier database with performance tracking
- **Bid Management**: Review and compare supplier bids with analytics
- **Purchase Order Generation**: Automated PO creation and distribution
- **Inventory Tracking**: Real-time stock monitoring with automated reorder alerts
- **Reporting & Analytics**: Comprehensive dashboards and custom report generation
- **Document Management**: Secure attachment handling for all transactions
- **User Management**: Role-based access control and permission management
- **Geographic Supplier Mapping**: Interactive map view of supplier locations

### Supplier Portal
- **Supplier Registration**: Self-service registration with profile management
- **Product Catalog Management**: Create and maintain product/service catalogs
- **RFQ (Request for Quotation) Management**: Receive and respond to RFQs
- **Bid Submission**: Submit competitive bids with pricing and delivery terms
- **Order Management**: View and manage awarded purchase orders
- **Delivery Tracking**: Update delivery status and manage logistics
- **Performance Analytics**: View supplier performance metrics and ratings
- **Secure Communication**: Direct messaging with organization procurement teams

### Security Features
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control (RBAC)**: Granular permission management
- **Input Sanitization**: Protection against XSS and injection attacks
- **NoSQL Injection Prevention**: MongoDB query sanitization
- **Rate Limiting**: API throttling to prevent abuse
- **Helmet.js Security**: HTTP header protection
- **CORS Configuration**: Controlled cross-origin resource sharing
- **Audit Logging**: Comprehensive activity tracking

## 🏗 Architecture

The system uses a **microservices-inspired architecture** with two independent service modules:

```
procurement-system/
├── Organization/          # Organization portal services
│   ├── frontend/         # React SPA for organization users
│   └── backend/          # Express.js API server
└── Supplier/             # Supplier portal services
    ├── frontend/         # React SPA for suppliers
    └── backend/          # Express.js API server
```

### Architecture Highlights
- **Separation of Concerns**: Independent frontend and backend for each portal
- **RESTful APIs**: Well-structured REST endpoints for all operations
- **Stateless Authentication**: JWT tokens for scalable authentication
- **Database Per Service**: Dedicated MongoDB databases for data isolation
- **Event-Driven Communication**: Real-time updates through event handling
- **Modular Design**: Clear separation between routes, controllers, models, and services

## 🛠 Technology Stack

### Frontend (Both Portals)
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.2+ / 19.1+ | UI framework |
| **Vite** | 7.1+ | Build tool and dev server |
| **React Router DOM** | 7.9+ | Client-side routing |
| **TailwindCSS** | 3.4+ | Utility-first CSS framework |
| **Lucide React** | 0.552+ | Icon library |
| **Axios** | 1.13+ | HTTP client |
| **React Query** | 3.39+ | Server state management (Organization) |
| **React Hook Form** | 7.66+ | Form validation (Supplier) |
| **date-fns** | 2.30+ | Date manipulation |
| **MapLibre GL** | 5.10+ | Interactive maps |
| **React Leaflet** | 5.0+ | Map components |

### Backend (Organization Portal)
| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | LTS | Runtime environment |
| **Express.js** | 4.21+ | Web application framework |
| **MongoDB** | 5.9+ | NoSQL database |
| **Mongoose** | 7.8+ | ODM for MongoDB |
| **JSON Web Token** | 9.0+ | Authentication |
| **bcryptjs** | 2.4+ | Password hashing |
| **Helmet** | 8.1+ | Security middleware |
| **Morgan** | 1.10+ | HTTP request logger |
| **CORS** | 2.8+ | Cross-origin resource sharing |
| **dotenv** | 16.6+ | Environment configuration |

### Backend (Supplier Portal)
| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | LTS | Runtime environment |
| **Express.js** | 5.1+ | Web application framework |
| **MongoDB** | 8.19+ | NoSQL database |
| **Mongoose** | 8.19+ | ODM for MongoDB |
| **JSON Web Token** | 9.0+ | Authentication |
| **bcryptjs** | 3.0+ | Password hashing |
| **Express Validator** | 7.3+ | Input validation |
| **CORS** | 2.8+ | Cross-origin resource sharing |
| **dotenv** | 17.2+ | Environment configuration |

### Development Tools
- **Nodemon** | 3.1+ - Auto-restart for development
- **ESLint** | 9.36+ - Code linting
- **PostCSS** | 8.5+ - CSS processing
- **Autoprefixer** | 10.4+ - CSS vendor prefixing

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16.x or higher) - [Download](https://nodejs.org/)
- **npm** (v8.x or higher) - Comes with Node.js
- **MongoDB** (v5.x or higher) - [Download](https://www.mongodb.com/try/download/community)
- **Git** - [Download](https://git-scm.com/downloads)

### System Requirements
- **OS**: Windows 10+, macOS 10.15+, or Linux (Ubuntu 20.04+)
- **RAM**: Minimum 4GB (8GB recommended)
- **Storage**: 2GB free space

## 📦 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/Robel-Y/procurement-.git
cd procurement-
```

### 2. Install Organization Portal Dependencies

#### Backend
```bash
cd Organization/backend
npm install
```

#### Frontend
```bash
cd ../frontend
npm install
cd ../..
```

### 3. Install Supplier Portal Dependencies

#### Backend
```bash
cd Supplier/backend
npm install
```

#### Frontend
```bash
cd ../frontend
npm install
cd ../..
```

## ⚙️ Configuration

### Database Setup

1. **Install MongoDB**: Ensure MongoDB is running locally or use MongoDB Atlas
   ```bash
   # Start MongoDB locally (if installed)
   mongod
   ```

2. **Create Databases**: The application will automatically create databases:
   - `procurement_system` - Organization portal database
   - Supplier portal database (configured in Supplier backend)

### Environment Variables

Create `.env` files in each backend directory:

#### Organization Backend (`.env`)
```bash
cd Organization/backend
cat > .env << EOF
# Server Configuration
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/procurement_system

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=30d

# Client URL (for CORS)
CLIENT_URL=http://localhost:3000
EOF
```

#### Supplier Backend (`.env`)
```bash
cd Supplier/backend
cat > .env << EOF
# Server Configuration
NODE_ENV=development
PORT=5001

# Database
MONGODB_URI=mongodb://localhost:27017/supplier_system

# JWT Configuration
JWT_SECRET=your_supplier_jwt_secret_change_in_production
JWT_EXPIRE=30d

# Client URL (for CORS)
CLIENT_URL=http://localhost:3001
EOF
```

### Frontend Configuration

Update API base URLs if needed:

#### Organization Frontend
Edit `Organization/frontend/src/services/api.js` or similar:
```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

#### Supplier Frontend
Edit `Supplier/frontend/src/services/api.js` or similar:
```javascript
const API_BASE_URL = 'http://localhost:5001/api';
```

## 🎮 Running the Application

### Development Mode

You'll need **4 terminal windows** to run both portals:

#### Terminal 1: Organization Backend
```bash
cd Organization/backend
npm run dev
# Server runs on http://localhost:5000
```

#### Terminal 2: Organization Frontend
```bash
cd Organization/frontend
npm run dev
# App runs on http://localhost:3000
```

#### Terminal 3: Supplier Backend
```bash
cd Supplier/backend
npm run dev
# Server runs on http://localhost:5001
```

#### Terminal 4: Supplier Frontend
```bash
cd Supplier/frontend
npm run dev
# App runs on http://localhost:3001
```

### Production Mode

#### Build Frontend Applications
```bash
# Organization Frontend
cd Organization/frontend
npm run build

# Supplier Frontend
cd Supplier/frontend
npm run build
```

#### Start Backend Servers
```bash
# Organization Backend
cd Organization/backend
npm start

# Supplier Backend
cd Supplier/backend
npm start
```

### Health Checks

Verify services are running:
```bash
# Organization API
curl http://localhost:5000/api/health

# Supplier API
curl http://localhost:5001/
```

## 📁 Project Structure

```
procurement-/
│
├── Organization/                    # Organization Portal
│   ├── backend/
│   │   ├── config/                 # Database and environment config
│   │   ├── controllers/            # Request handlers
│   │   │   ├── authController.js
│   │   │   ├── purchaseRequestController.js
│   │   │   ├── purchaseOrderController.js
│   │   │   ├── centralSupplierController.js
│   │   │   ├── bidController.js
│   │   │   └── userController.js
│   │   ├── middleware/             # Custom middleware
│   │   │   └── error.js
│   │   ├── models/                 # Mongoose models
│   │   │   ├── User.js
│   │   │   ├── PurchaseRequest.js
│   │   │   ├── PurchaseOrder.js
│   │   │   ├── CentralSupplier.js
│   │   │   └── ExternalRequest.js
│   │   ├── routes/                 # API routes
│   │   │   ├── auth.js
│   │   │   ├── users.js
│   │   │   ├── purchaseRequests.js
│   │   │   ├── purchaseOrders.js
│   │   │   ├── publicOrders.js
│   │   │   └── centralSuppliers.js
│   │   ├── services/               # Business logic
│   │   ├── utils/                  # Helper functions
│   │   ├── server.js               # Application entry point
│   │   ├── package.json
│   │   └── .env
│   │
│   └── frontend/
│       ├── public/                 # Static assets
│       ├── src/
│       │   ├── components/         # Reusable components
│       │   ├── context/            # React context providers
│       │   ├── models/             # Frontend data models
│       │   ├── pages/              # Page components
│       │   │   ├── Login.jsx
│       │   │   ├── Dashboard.jsx
│       │   │   ├── PurchaseRequests.jsx
│       │   │   ├── CreatePurchaseRequest.jsx
│       │   │   ├── Approvals.jsx
│       │   │   ├── Suppliers.jsx
│       │   │   ├── BidManagement.jsx
│       │   │   ├── Reports.jsx
│       │   │   └── Users.jsx
│       │   ├── services/           # API services
│       │   ├── utils/              # Helper functions
│       │   ├── App.jsx             # Root component
│       │   ├── main.jsx            # Entry point
│       │   └── styles.css          # Global styles
│       ├── index.html
│       ├── vite.config.js
│       ├── package.json
│       └── .env
│
├── Supplier/                        # Supplier Portal
│   ├── backend/
│   │   ├── config/                 # Configuration files
│   │   ├── controllers/            # Request handlers
│   │   │   ├── authController.js
│   │   │   ├── supplierController.js
│   │   │   ├── catalogController.js
│   │   │   ├── rfqController.js
│   │   │   └── bidController.js
│   │   ├── middlewares/            # Custom middleware
│   │   │   ├── authMiddleware.js
│   │   │   ├── roleMiddleware.js
│   │   │   ├── validationMiddleware.js
│   │   │   ├── sanitizationMiddleware.js
│   │   │   ├── rateLimitMiddleware.js
│   │   │   ├── loggingMiddleware.js
│   │   │   ├── ownershipMiddleware.js
│   │   │   └── paginationMiddleware.js
│   │   ├── models/                 # Mongoose models
│   │   │   ├── User.js
│   │   │   ├── Supplier.js
│   │   │   ├── CatalogItem.js
│   │   │   ├── RFQ.js
│   │   │   └── Bid.js
│   │   ├── routes/                 # API routes
│   │   │   ├── authRoutes.js
│   │   │   ├── supplierRoutes.js
│   │   │   ├── catalogRoutes.js
│   │   │   ├── rfqRoutes.js
│   │   │   └── bidRoutes.js
│   │   ├── utils/                  # Helper functions
│   │   ├── server.js               # Application entry point
│   │   ├── package.json
│   │   └── .env
│   │
│   └── frontend/
│       ├── public/                 # Static assets
│       ├── src/
│       │   ├── components/         # Reusable components
│       │   ├── contexts/           # React context providers
│       │   ├── hooks/              # Custom React hooks
│       │   ├── pages/              # Page components
│       │   │   ├── Dashboard.jsx
│       │   │   ├── auth/           # Authentication pages
│       │   │   ├── supplier/       # Supplier management pages
│       │   │   ├── catalog/        # Catalog management pages
│       │   │   ├── rfq/            # RFQ pages
│       │   │   └── bid/            # Bid management pages
│       │   ├── services/           # API services
│       │   ├── utils/              # Helper functions
│       │   ├── App.jsx             # Root component
│       │   ├── main.jsx            # Entry point
│       │   └── index.css           # Global styles
│       ├── index.html
│       ├── vite.config.js
│       ├── tailwind.config.js
│       ├── postcss.config.js
│       ├── package.json
│       └── README.md
│
├── .gitignore
├── README.md
└── LICENSE
```

## 📚 API Documentation

### Organization API Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

#### Purchase Requests
- `GET /api/purchase-requests` - List all purchase requests
- `POST /api/purchase-requests` - Create new purchase request
- `GET /api/purchase-requests/:id` - Get purchase request details
- `PUT /api/purchase-requests/:id` - Update purchase request
- `DELETE /api/purchase-requests/:id` - Delete purchase request
- `PUT /api/purchase-requests/:id/approve` - Approve request
- `PUT /api/purchase-requests/:id/reject` - Reject request

#### Purchase Orders
- `GET /api/purchase-orders` - List all purchase orders
- `POST /api/purchase-orders` - Create new purchase order
- `GET /api/purchase-orders/:id` - Get purchase order details
- `PUT /api/purchase-orders/:id` - Update purchase order
- `PUT /api/purchase-orders/:id/status` - Update order status

#### Suppliers
- `GET /api/suppliers` - List all suppliers
- `POST /api/suppliers` - Register new supplier
- `GET /api/suppliers/:id` - Get supplier details
- `PUT /api/suppliers/:id` - Update supplier information
- `GET /api/suppliers/:id/performance` - Get supplier performance metrics

#### Bids
- `GET /api/bids` - List all bids
- `GET /api/bids/:id` - Get bid details
- `PUT /api/bids/:id/evaluate` - Evaluate bid
- `PUT /api/bids/:id/accept` - Accept bid
- `PUT /api/bids/:id/reject` - Reject bid

#### Users
- `GET /api/users` - List all users
- `POST /api/users` - Create new user
- `GET /api/users/:id` - Get user details
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Supplier API Endpoints

#### Authentication
- `POST /api/auth/register` - Supplier registration
- `POST /api/auth/login` - Supplier login
- `GET /api/auth/profile` - Get supplier profile

#### Supplier Management
- `GET /api/suppliers/profile` - Get supplier profile
- `PUT /api/suppliers/profile` - Update supplier profile
- `GET /api/suppliers/statistics` - Get supplier statistics

#### Catalog Management
- `GET /api/catalog` - List catalog items
- `POST /api/catalog` - Add catalog item
- `GET /api/catalog/:id` - Get catalog item details
- `PUT /api/catalog/:id` - Update catalog item
- `DELETE /api/catalog/:id` - Delete catalog item

#### RFQ Management
- `GET /api/rfqs` - List RFQs
- `GET /api/rfqs/:id` - Get RFQ details
- `PUT /api/rfqs/:id/respond` - Respond to RFQ

#### Bid Management
- `GET /api/bids` - List supplier bids
- `POST /api/bids` - Submit new bid
- `GET /api/bids/:id` - Get bid details
- `PUT /api/bids/:id` - Update bid
- `DELETE /api/bids/:id` - Withdraw bid

### API Response Format

All API responses follow a consistent format:

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message",
  "details": { ... }
}
```

## 👥 User Roles & Permissions

### Organization Portal Roles

| Role | Permissions |
|------|-------------|
| **Admin** | - Full system access<br>- User management (create, update, delete)<br>- System configuration<br>- Access all modules<br>- Generate all reports<br>- Manage suppliers |
| **Procurement Officer** | - Create purchase requests<br>- Approve/reject requests (based on approval level)<br>- View dashboards<br>- Generate procurement reports<br>- Manage bids<br>- Create purchase orders |
| **Finance Officer** | - Approve payments<br>- View purchase histories<br>- Generate financial reports<br>- Review budget allocations<br>- Approve high-value requests |
| **Requester** | - Create purchase requests<br>- View own requests<br>- Track request status<br>- Upload supporting documents |

### Supplier Portal Roles

| Role | Permissions |
|------|-------------|
| **Supplier Admin** | - Full supplier account access<br>- Manage supplier profile<br>- Manage catalog items<br>- Submit and manage bids<br>- View all RFQs<br>- Manage delivery status<br>- View performance metrics |
| **Supplier User** | - View RFQs<br>- Submit bids (with approval)<br>- Update catalog items<br>- View purchase orders<br>- Update delivery status |

## 🔄 System Workflow

### 1. Purchase Request Creation
- Requester identifies need for goods/services
- Creates purchase request with specifications
- Attaches supporting documents
- Submits for approval

### 2. Approval Process
- Request routes to appropriate approvers based on:
  - Request value
  - Item category
  - Department budget
- Multi-level approval workflow
- Automatic email notifications

### 3. Supplier Selection
- For approved requests:
  - **Direct Purchase**: Select from registered suppliers
  - **RFQ Process**: Create RFQ and invite suppliers to bid

### 4. Bidding Process (if applicable)
- RFQ published to supplier portal
- Suppliers submit competitive bids
- Organization evaluates bids
- Best bid selected and awarded

### 5. Purchase Order Generation
- System automatically generates PO
- PO sent to selected supplier
- Budget allocated and recorded
- Inventory system notified

### 6. Delivery Tracking
- Supplier updates delivery status
- Organization receives delivery notification
- Goods receipt confirmation
- Quality inspection (if required)

### 7. Payment Processing
- Invoice verification
- Finance officer approval
- Payment processing
- Transaction recorded

### 8. Inventory Update
- Stock levels automatically updated
- Reorder point checking
- Automatic reorder if threshold reached
- Inventory reports updated

## 💻 Development

### Code Style Guidelines
- **JavaScript**: ES6+ standards
- **React**: Functional components with hooks
- **Naming Conventions**: 
  - Components: PascalCase (`UserProfile.jsx`)
  - Functions: camelCase (`handleSubmit`)
  - Constants: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **File Organization**: Group by feature/domain

### Available Scripts

#### Backend
```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm test           # Run tests (when configured)
```

#### Frontend
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

### Adding New Features

1. **Backend Feature**:
   - Create model in `models/`
   - Create controller in `controllers/`
   - Add routes in `routes/`
   - Update server.js if needed

2. **Frontend Feature**:
   - Create component in `components/`
   - Add page in `pages/`
   - Update routing in `App.jsx`
   - Add API service in `services/`

### Database Migrations

When updating models:
1. Update Mongoose schema in `models/`
2. Test with existing data
3. Document schema changes
4. Consider backward compatibility

## 🧪 Testing

### Manual Testing

#### Test User Accounts
Create test accounts for each role:
```javascript
// Organization Users
{
  email: "admin@test.com",
  password: "admin123",
  role: "admin"
}

// Supplier Users
{
  email: "supplier@test.com",
  password: "supplier123",
  role: "supplier_admin"
}
```

#### Testing Checklist
- [ ] User registration and login
- [ ] Purchase request creation
- [ ] Approval workflow
- [ ] Bid submission
- [ ] Purchase order generation
- [ ] Role-based access control
- [ ] File uploads
- [ ] Report generation

### Automated Testing (Future Enhancement)

Recommended testing stack:
- **Backend**: Jest + Supertest
- **Frontend**: Vitest + React Testing Library
- **E2E**: Playwright or Cypress

## 🚀 Deployment

### Production Checklist
- [ ] Update all `.env` files with production values
- [ ] Change default JWT secrets
- [ ] Set `NODE_ENV=production`
- [ ] Configure production database (MongoDB Atlas recommended)
- [ ] Set up HTTPS/SSL certificates
- [ ] Configure CORS for production domains
- [ ] Set up logging and monitoring
- [ ] Configure backups
- [ ] Set up rate limiting
- [ ] Review security headers

### Deployment Options

#### Option 1: Traditional VPS (DigitalOcean, AWS EC2, etc.)
```bash
# 1. Build frontend
cd Organization/frontend && npm run build
cd Supplier/frontend && npm run build

# 2. Use PM2 for process management
npm install -g pm2
pm2 start Organization/backend/server.js --name org-backend
pm2 start Supplier/backend/server.js --name supplier-backend

# 3. Serve frontend with Nginx or similar
```

#### Option 2: Platform as a Service (Heroku, Railway, Render)
- Create separate services for each backend
- Deploy frontend to Vercel, Netlify, or similar
- Configure environment variables in platform

#### Option 3: Containerization (Docker)
```dockerfile
# Example Dockerfile for backend
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

#### Option 4: Cloud Services
- **Frontend**: Vercel, Netlify, AWS S3 + CloudFront
- **Backend**: AWS Lambda, Google Cloud Run, Azure App Service
- **Database**: MongoDB Atlas (recommended)

### Environment Variables for Production

#### Organization Backend
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/procurement_prod
JWT_SECRET=your_super_long_random_production_secret_here
JWT_EXPIRE=7d
CLIENT_URL=https://your-org-domain.com
```

#### Supplier Backend
```env
NODE_ENV=production
PORT=5001
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/supplier_prod
JWT_SECRET=different_super_long_random_production_secret
JWT_EXPIRE=7d
CLIENT_URL=https://your-supplier-domain.com
```

### Database Backup Strategy
```bash
# Daily backups with mongodump
mongodump --uri="mongodb+srv://..." --out=/backups/$(date +%Y%m%d)

# Restore from backup
mongorestore --uri="mongodb+srv://..." /backups/20240101
```

### Monitoring & Logging

Recommended tools:
- **Application Monitoring**: PM2, New Relic, Datadog
- **Error Tracking**: Sentry
- **Log Management**: Winston, Loggly, Papertrail
- **Uptime Monitoring**: UptimeRobot, Pingdom

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### How to Contribute

1. **Fork the Repository**
   ```bash
   git clone https://github.com/your-username/procurement-.git
   cd procurement-
   ```

2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make Your Changes**
   - Follow code style guidelines
   - Write clear commit messages
   - Add tests if applicable

4. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "Add: Brief description of your changes"
   ```

5. **Push to Your Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Submit a Pull Request**
   - Provide clear description of changes
   - Reference any related issues
   - Ensure all checks pass

### Commit Message Format
```
Type: Brief description

Detailed explanation if needed

Types: Add, Update, Fix, Remove, Refactor, Docs, Test, Style
```

### Code Review Process
- All PRs require review
- Address review feedback
- Ensure CI/CD passes
- Maintain test coverage

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 👨‍💻 Authors & Maintainers

- **Khalid** - Original Author
- **Contributors** - See [Contributors](https://github.com/Robel-Y/procurement-/graphs/contributors)

## 📞 Contact & Support

- **Issues**: [GitHub Issues](https://github.com/Robel-Y/procurement-/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Robel-Y/procurement-/discussions)
- **Email**: [Contact Maintainer]

## 🙏 Acknowledgments

- React team for the amazing framework
- MongoDB team for the database
- Express.js community
- All open-source contributors

## 📊 Project Status

**Current Version**: 1.0.0
**Status**: Active Development
**Last Updated**: December 2024

## 🗺 Roadmap

### Planned Features
- [ ] Mobile application (React Native)
- [ ] Advanced analytics and BI dashboard
- [ ] Integration with ERP systems (SAP, Oracle)
- [ ] Multi-language support
- [ ] Advanced reporting with chart exports
- [ ] Email notification system
- [ ] Document version control
- [ ] Automated testing suite
- [ ] GraphQL API option
- [ ] Blockchain integration for supply chain tracking
- [ ] AI-powered supplier recommendations
- [ ] Automated contract management
- [ ] Integration with payment gateways

---

**Happy Procuring! 🎉**

For more information, please visit our [Wiki](https://github.com/Robel-Y/procurement-/wiki) or contact the development team.

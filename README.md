# Online Procurement and Supply Management System

An **Online Procurement and Supply Management System** designed to automate and streamline the procurement process for organizations. This system handles purchase requests, supplier management, approvals, inventory tracking, and reporting while providing role-based access for users.


## ✨ Features
- **Purchase Request Management**: Create, approve, reject, and track requests
- **Supplier Management**: Register, manage, and evaluate suppliers
- **Role-Based Access Control**: Admin, Procurement Officer, Supplier, Finance Officer roles
- **Approval Workflow**: Fixed or dynamic approval routing
- **Real-time Notifications**: Email and dashboard alerts
- **Reporting & Analytics**: Generate reports and dashboards
- **Document Management**: Attach supporting documents
- **Inventory Tracking**: Monitor stock levels and automate reordering

## 👥 User Roles
| Role | Permissions |
|------|-------------|
| **Admin** | Full system access, user management, system configuration |
| **Procurement Officer** | Create requests, approve/reject, view dashboards, generate reports |
| **Supplier** | Submit bids, view assigned purchase orders, update delivery status |
| **Finance Officer** | Approve payments, view purchase histories, generate financial reports |

## 🔄 System Workflow
1. **Purchase Request Creation** → 2. **Approval Process** → 3. **Supplier Selection** → 4. **Purchase Order Generation** → 5. **Delivery Tracking** → 6. **Payment Processing** → 7. **Inventory Update**

## 🛠 Technology Stack
- **Frontend**: React.js, TailwindCSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based with role-based access
- **File Uploads**: Multer for document handling
- **Notifications**: Email via Nodemailer



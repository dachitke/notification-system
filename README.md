# Croco Notification System - Backend

A complete Node.js backend API for the Croco Notification System that provides customer management and notification tracking capabilities.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation & Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Server**
   ```bash
   # Development mode (with auto-restart)
   npm run dev

   # Production mode
   npm start
   ```

3. **Access the API**
   - Server: `http://localhost:8080`
   - Health Check: `http://localhost:8080/health`

### Default Credentials
- **Username:** `admin`
- **Password:** `admin123`

## 📊 Database

The backend uses **SQLite** for simplicity and portability. The database file (`croco_notifications.db`) will be created automatically on first run.

### Sample Data
The system automatically creates:
- Default admin user
- 2 sample customers (John Doe, Jane Smith)
- 3 sample notifications with different statuses

## 🔗 API Endpoints

### Authentication
- `POST /api/admins/login` - Admin login (returns JWT token)

### Customers
- `GET /api/customers` - Get all customers (requires auth)
- `POST /api/customers` - Create new customer (requires auth)
- `GET /api/customers/:id` - Get customer by ID (requires auth)
- `PUT /api/customers/:id` - Update customer (requires auth)
- `DELETE /api/customers/:id` - Delete customer (requires auth)
- `GET /api/customers/search` - Search customers (requires auth)

### Notifications
- `GET /api/notifications` - Get all notifications
- `GET /api/notifications/status/:status` - Get notifications by status
- `GET /api/notifications/customer/:customerId` - Get notifications by customer
- `GET /api/notifications/report/full` - Get notification summary report

### Utility
- `GET /health` - Health check endpoint

## 🔐 Authentication

The API uses **JWT (JSON Web Tokens)** for authentication:
- Login to get a token
- Include token in requests: `Authorization: Bearer <your-token>`
- Token expires in 24 hours

## 🛠️ Technical Stack

- **Framework:** Express.js
- **Database:** SQLite with sqlite3
- **Authentication:** JWT + bcryptjs
- **Other:** CORS, UUID generation

## 📝 API Examples

### Login
```bash
curl -X POST http://localhost:8080/api/admins/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### Get Customers (with token)
```bash
curl -X GET http://localhost:8080/api/customers \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Create Customer
```bash
curl -X POST http://localhost:8080/api/customers \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Alice","lastName":"Johnson","email":"alice@example.com","phone":"+1555000000"}'
```

## 🎯 Frontend Integration

This backend is designed to work seamlessly with the existing Croco Notification frontend. Simply:

1. Start this backend server
2. Open your frontend files in a web browser
3. Login with the default credentials
4. The frontend will automatically connect to `http://localhost:8080`

## 🔧 Configuration

### Environment Variables (Optional)
Create a `.env` file for custom configuration:

```env
PORT=8080
JWT_SECRET=your-custom-secret-key
DB_PATH=./croco_notifications.db
```

### Production Considerations
- Change the JWT secret key
- Use a production database (PostgreSQL, MySQL)
- Add rate limiting
- Add request validation
- Add logging
- Set up HTTPS

## 📁 Database Schema

### Admins Table
```sql
CREATE TABLE admins (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Customers Table
```sql
CREATE TABLE customers (
  id TEXT PRIMARY KEY,
  firstName TEXT,
  lastName TEXT,
  name TEXT,
  email TEXT,
  phone TEXT,
  addresses TEXT, -- JSON string
  preference TEXT, -- JSON string
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Notifications Table
```sql
CREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  customerId TEXT,
  channel TEXT, -- EMAIL, SMS, PUSH
  status TEXT, -- PENDING, DELIVERED, FAILED
  message TEXT,
  sentAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(customerId) REFERENCES customers(id)
);
```

## 🚀 Deployment Options

### Option 1: Local Development
```bash
npm run dev
```

### Option 2: Production Server
```bash
npm start
```

### Option 3: Docker (create Dockerfile)
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 8080
CMD ["npm", "start"]
```

## 📞 Support

If you encounter any issues:
1. Check the console output for error messages
2. Verify Node.js version (v14+)
3. Ensure port 8080 is available
4. Check database file permissions

---

**Ready to go!** Your Croco Notification System backend is now complete and ready to power your frontend application. 🎉 
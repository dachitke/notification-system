# API Design & Database Schema Documentation

## 🔌 REST API Specification

### Authentication Endpoints

#### `POST /api/admins/login`
**Purpose**: Admin authentication and JWT token generation

**Request Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `400`: Missing username/password
- `401`: Invalid credentials

### Customer Management APIs

#### `GET /api/customers`
**Purpose**: Retrieve all customers with pagination support

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": 1234567890,
    "addresses": [
      {
        "id": 1,
        "type": "home",
        "value": "123 Main St",
        "street": "123 Main St",
        "city": "New York",
        "country": "USA"
      }
    ],
    "preference": {
      "id": 1,
      "smsOptIn": true,
      "emailOptIn": true,
      "promoOptIn": false,
      "preferredChannel": "EMAIL"
    }
  }
]
```

#### `POST /api/customers`
**Purpose**: Create new customer

**Request Body:**
```json
{
  "name": "Jane",
  "lastName": "Smith",
  "email": "jane.smith@example.com",
  "phone": 9876543210
}
```

#### `PUT /api/customers/{id}`
**Purpose**: Update existing customer

**Path Parameters:**
- `id` (Long): Customer ID

**Request Body:**
```json
{
  "name": "Updated Name",
  "lastName": "Updated LastName",
  "email": "updated.email@example.com",
  "phone": 5555555555
}
```

#### `DELETE /api/customers/{id}`
**Purpose**: Delete customer

**Path Parameters:**
- `id` (Long): Customer ID

**Response:**
- `204`: Successfully deleted
- `404`: Customer not found

#### `GET /api/customers/search`
**Purpose**: Search customers with filters

**Query Parameters:**
- `name` (String, optional): Filter by first name
- `lastName` (String, optional): Filter by last name  
- `email` (String, optional): Filter by email
- `channel` (String, optional): Filter by preferred channel
- `smsOptIn` (Boolean, optional): Filter by SMS opt-in status
- `emailOptIn` (Boolean, optional): Filter by email opt-in status
- `sortBy` (String, default: "id"): Sort field
- `order` (String, default: "asc"): Sort direction

**Example:**
```
GET /api/customers/search?name=John&sortBy=email&order=desc
```

#### `PUT /api/customers/batch`
**Purpose**: Batch update multiple customers

**Request Body:**
```json
[
  {
    "id": 1,
    "name": "Updated Name 1",
    "email": "updated1@example.com"
  },
  {
    "id": 2,
    "name": "Updated Name 2",
    "email": "updated2@example.com"
  }
]
```

### Notification Management APIs

#### `GET /api/notifications`
**Purpose**: Retrieve all notifications

**Response:**
```json
[
  {
    "id": 1,
    "customerId": "CUST001",
    "message": "Welcome to our service!",
    "channel": "EMAIL",
    "status": "DELIVERED",
    "sentAt": "2024-01-15T10:30:00",
    "deliveredAt": "2024-01-15T10:31:00"
  }
]
```

#### `POST /api/notifications`
**Purpose**: Create new notification

**Request Body:**
```json
{
  "customerId": "CUST001",
  "message": "Your order is ready!",
  "channel": "SMS",
  "status": "PENDING"
}
```

#### `PUT /api/notifications/{id}`
**Purpose**: Update notification status

**Path Parameters:**
- `id` (Long): Notification ID

**Query Parameters:**
- `status` (String): New status (PENDING, DELIVERED, FAILED)

**Example:**
```
PUT /api/notifications/1?status=DELIVERED
```

#### `GET /api/notifications/status/{status}`
**Purpose**: Get notifications by status

**Path Parameters:**
- `status` (String): Status filter (PENDING, DELIVERED, FAILED)

#### `GET /api/notifications/customer/{customerId}`
**Purpose**: Get notifications for specific customer

**Path Parameters:**
- `customerId` (String): Customer identifier

#### `GET /api/notifications/report`
**Purpose**: Get delivery statistics

**Response:**
```json
{
  "DELIVERED": 150,
  "PENDING": 25,
  "FAILED": 10
}
```

#### `GET /api/notifications/report/full`
**Purpose**: Get comprehensive delivery report

**Response:**
```json
{
  "total": 185,
  "delivered": 150,
  "pending": 25,
  "failed": 10,
  "details": [
    // Array of all notifications
  ]
}
```

#### `GET /api/notifications/preferences-summary`
**Purpose**: Get customer preference statistics

**Response:**
```json
{
  "emailOptInCount": 75,
  "smsOptInCount": 60,
  "promoOptInCount": 45
}
```

## 🗄️ Database Schema Design

### MySQL Schema (Spring Boot)

#### Customer Table
```sql
CREATE TABLE customer (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    last_name VARCHAR(255),
    email VARCHAR(255),
    phone INT
);
```

#### Address Table
```sql
CREATE TABLE address (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(50),
    value VARCHAR(500),
    street VARCHAR(255),
    city VARCHAR(255),
    country VARCHAR(255),
    customer_id BIGINT,
    FOREIGN KEY (customer_id) REFERENCES customer(id) ON DELETE CASCADE
);
```

#### Preference Table
```sql
CREATE TABLE preference (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sms_opt_in BOOLEAN DEFAULT FALSE,
    email_opt_in BOOLEAN DEFAULT FALSE,
    promo_opt_in BOOLEAN DEFAULT FALSE,
    customer_id BIGINT UNIQUE,
    FOREIGN KEY (customer_id) REFERENCES customer(id) ON DELETE CASCADE
);
```

#### Notification Table
```sql
CREATE TABLE notification (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id VARCHAR(255),
    message TEXT,
    channel VARCHAR(50),
    status VARCHAR(50),
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    delivered_at TIMESTAMP NULL
);
```

#### Admin Table
```sql
CREATE TABLE admin (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'ADMIN'
);
```

### SQLite Schema (Node.js)

#### Customers Table
```sql
CREATE TABLE customers (
    id TEXT PRIMARY KEY,
    firstName TEXT,
    lastName TEXT,
    name TEXT,
    email TEXT,
    phone TEXT,
    addresses TEXT,              -- JSON string
    preference TEXT,             -- JSON string
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Notifications Table
```sql
CREATE TABLE notifications (
    id TEXT PRIMARY KEY,
    customerId TEXT,
    channel TEXT,
    status TEXT,
    message TEXT,
    sentAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(customerId) REFERENCES customers(id)
);
```

#### Admins Table
```sql
CREATE TABLE admins (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🔄 Data Flow Patterns

### Customer Creation Flow
```
1. POST /api/customers
2. Validate input data
3. Create Customer entity
4. Auto-create default Preference
5. Return created customer with relations
```

### Notification Processing Flow
```
1. POST /api/notifications
2. Validate customer exists
3. Set initial status (PENDING)
4. Set sentAt timestamp
5. Return created notification
6. [External] Process notification delivery
7. PUT /api/notifications/{id}?status=DELIVERED
```

### Authentication Flow
```
1. POST /api/admins/login
2. Validate credentials with BCrypt
3. Generate JWT token (10-hour expiry)
4. Return token to client
5. Client includes token in Authorization header
6. Server validates token on protected routes
```

## 📊 Response Status Codes

### Success Codes
- `200 OK`: Successful GET, PUT requests
- `201 Created`: Successful POST requests
- `204 No Content`: Successful DELETE requests

### Error Codes
- `400 Bad Request`: Invalid request body/parameters
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Valid auth but insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server-side errors

## 🔧 API Design Principles

### RESTful Design
- **Resource-based URLs**: `/api/customers`, `/api/notifications`
- **HTTP verbs**: GET, POST, PUT, DELETE for CRUD operations
- **Stateless**: Each request contains all necessary information

### Error Handling
```json
{
  "error": "Validation failed",
  "message": "Email is required",
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/customers"
}
```

### Pagination (Future Enhancement)
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "size": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### Content Negotiation
- **Request**: `Content-Type: application/json`
- **Response**: `Content-Type: application/json`
- **Character Encoding**: UTF-8

This API design follows REST principles, provides comprehensive CRUD operations, and maintains consistency across all endpoints while supporting both the Spring Boot and Node.js implementations. 
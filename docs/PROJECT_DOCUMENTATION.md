# Croco Notification System - Project Documentation

## 📋 Project Overview

The Croco Notification System is a comprehensive notification management platform designed to handle customer communications across multiple channels (Email, SMS, Push notifications) with robust authentication, customer management, and analytics capabilities.

## 🏗️ System Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Spring Boot   │    │   Node.js       │
│   (HTML/CSS/JS) │◄──►│   Backend       │    │   Backend       │
│                 │    │   (Primary)     │    │   (Alternative) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       ▼                       ▼
         │              ┌─────────────────┐    ┌─────────────────┐
         │              │     MySQL       │    │     SQLite      │
         │              │   Database      │    │   Database      │
         └──────────────┤                 │    │                 │
                        └─────────────────┘    └─────────────────┘
```

### Design Choice: Dual Backend Architecture

**Why Two Backends?**
1. **Spring Boot (Primary)**: Enterprise-grade Java backend with robust security, ORM, and scalability
2. **Node.js (Alternative)**: Lightweight, rapid development backend for simpler deployments

This design provides deployment flexibility - teams can choose based on their infrastructure and expertise.

## 📁 Project Structure

```
croco-notification-system/
├── src/main/java/                          # Spring Boot Backend
│   └── com/example/notificationsystem/
│       ├── controller/                     # REST API Controllers
│       ├── model/                          # JPA Entities
│       ├── repository/                     # Data Access Layer
│       ├── service/                        # Business Logic
│       ├── security/                       # JWT & Security Config
│       └── dto/                           # Data Transfer Objects
├── src/main/resources/                     # Configuration Files
├── frontend/                               # Client-Side Application
│   ├── index.html                         # Login Page
│   ├── dashboard.html                     # Main Application UI
│   ├── server.js                          # Node.js Alternative Backend
│   └── *.js, *.css                       # Frontend Logic & Styling
├── pom.xml                                # Maven Dependencies
└── README.md                              # Setup Instructions
```

## 🎯 Core Components

### 1. Data Layer

#### Entity Relationship Design
```
Customer (1) ──── (n) Address
    │
    │ (1:1)
    ▼
Preference

Customer (1) ──── (n) Notification
```

**Key Entities:**
- **Customer**: Core user entity with personal information
- **Address**: Multiple addresses per customer (home, work, etc.)
- **Preference**: Communication preferences (SMS, Email, Promo opt-ins)
- **Notification**: Message records with delivery tracking
- **Admin**: System administrators with authentication

#### Design Choice: Normalized Database Structure
- **Rationale**: Maintains data integrity and reduces redundancy
- **Trade-off**: Slightly more complex queries for better data consistency

### 2. Security Layer

#### JWT-Based Authentication
```
Login Request → JWT Token → Protected Routes
```

**Design Choices:**
- **Stateless Authentication**: JWT tokens eliminate server-side sessions
- **Role-Based Access**: Admin-only system with expandable role structure
- **CORS Configuration**: Supports frontend-backend separation

### 3. API Layer

#### RESTful Design Principles
```
/api/customers     - Customer CRUD operations
/api/notifications - Notification management
/api/admins        - Authentication endpoints
```

**Design Patterns:**
- **Controller-Service-Repository**: Clear separation of concerns
- **DTO Pattern**: Data transfer objects for API responses
- **Exception Handling**: Centralized error management

### 4. Frontend Architecture

#### Component-Based Design
```
Dashboard
├── Navigation Tabs
├── Customer Management
├── Notification Center
└── Analytics/Reports
```

**Design Choices:**
- **Vanilla JavaScript**: No framework dependencies for simplicity
- **Modular Structure**: Separate JS files for each feature
- **Responsive Design**: Mobile-first CSS approach
- **Dark/Light Mode**: User preference persistence

## 🛠️ Technology Stack Rationale

### Backend Technologies

#### Spring Boot
- **Pros**: Enterprise features, robust security, extensive ecosystem
- **Use Case**: Production environments, complex business logic
- **Trade-offs**: Heavier resource usage, longer startup time

#### Node.js + Express
- **Pros**: Lightweight, fast development, JavaScript consistency
- **Use Case**: Rapid prototyping, simpler deployments
- **Trade-offs**: Less enterprise features, manual security implementation

### Database Choices

#### MySQL (Spring Boot)
- **Rationale**: ACID compliance, proven scalability, enterprise support
- **Schema**: Normalized structure with foreign key constraints

#### SQLite (Node.js)
- **Rationale**: Zero-configuration, portable, perfect for development
- **Schema**: Simplified structure with JSON storage for complex data

### Frontend Approach

#### Vanilla JavaScript
- **Rationale**: 
  - No build tools required
  - Direct browser compatibility
  - Easier deployment and maintenance
  - Learning-friendly codebase

## 🔄 Data Flow Architecture

### Authentication Flow
```
1. User Login → 2. JWT Generation → 3. Token Storage → 4. API Requests
```

### Notification Processing
```
1. Create Notification → 2. Channel Selection → 3. Status Tracking → 4. Analytics
```

### Customer Management
```
1. Customer CRUD → 2. Address Management → 3. Preference Setting → 4. Notification Targeting
```

## 📊 Design Patterns Implemented

### 1. Repository Pattern
- **Purpose**: Abstracts data access logic
- **Implementation**: Spring Data JPA repositories

### 2. Service Layer Pattern
- **Purpose**: Encapsulates business logic
- **Benefits**: Testability, reusability, separation of concerns

### 3. DTO Pattern
- **Purpose**: Data transfer between layers
- **Example**: `PreferenceSummaryDTO` for aggregated reporting

### 4. Factory Pattern (JWT)
- **Purpose**: Token creation and validation
- **Implementation**: `JwtUtil` class

## 🚀 Deployment Architecture

### Development Setup
```
Frontend (File Server) + Spring Boot (Port 8080) + MySQL
                OR
Frontend (File Server) + Node.js (Port 8080) + SQLite
```

### Production Considerations
- **Spring Boot**: Docker containerization, database connection pooling
- **Node.js**: PM2 process management, environment variables
- **Frontend**: CDN deployment, asset optimization

## 🔐 Security Design

### Authentication Strategy
- **JWT Tokens**: 10-hour expiration for security/usability balance
- **Password Hashing**: BCrypt with salt for admin credentials
- **CORS Policy**: Restricted to specific frontend origins

### Data Protection
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Input sanitization on frontend
- **Authorization**: Route-level protection with JWT middleware

## 📈 Scalability Considerations

### Current Limitations
- **Single-instance deployment**: No clustering support yet
- **Synchronous processing**: All operations are blocking
- **In-memory sessions**: JWT-only, no session management

### Future Enhancements
- **Microservices**: Split notification processing into separate service
- **Message Queues**: Async notification processing
- **Caching Layer**: Redis for performance optimization
- **Database Sharding**: Customer data partitioning

## 🧪 Testing Strategy

### Current State
- **Unit Tests**: Basic Spring Boot test structure
- **Integration Tests**: Database interaction testing

### Recommended Additions
- **API Testing**: Postman/Newman automation
- **Frontend Testing**: Jest/Cypress implementation
- **Load Testing**: JMeter for performance validation

## 📝 Configuration Management

### Environment-Specific Settings
- **Development**: H2 in-memory database for quick testing
- **Production**: MySQL with connection pooling
- **Security**: Environment-based JWT secrets

### Configuration Files
- `application.properties`: Spring Boot settings
- `package.json`: Node.js dependencies and scripts
- `pom.xml`: Maven dependencies and build configuration

## 🎯 Business Logic Design

### Customer Management
- **Flexible Address System**: Multiple addresses per customer
- **Preference Management**: Granular opt-in/opt-out controls
- **Search Capabilities**: Multi-field filtering and sorting

### Notification System
- **Channel Abstraction**: Easy addition of new communication channels
- **Status Tracking**: Comprehensive delivery monitoring
- **Reporting**: Real-time analytics and success metrics

This documentation provides a comprehensive overview of the project's architecture, design decisions, and implementation strategies. It serves as both a technical reference and a guide for future development efforts. 
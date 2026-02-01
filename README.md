# Supply Chain Management System - Microservices Architecture

A comprehensive, scalable supply chain management system built with **Spring Boot microservices** and **Next.js** frontend. Designed for supermarkets to manage products, inventory, orders, and get AI-powered stock recommendations with real-time monitoring through Eureka service discovery.

## 🏗️ Architecture Overview

This application follows a **microservices architecture** with the following services:

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                       │
│                   http://localhost:3000                     │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  Product    │  │  Inventory  │  │   Order     │
│  Service    │  │  Service    │  │  Service    │
│   :8081     │  │   :8082     │  │   :8083     │
└─────────────┘  └─────────────┘  └─────────────┘
         │               │               │
         └───────────────┼───────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│Recommendation│ │    User     │  │   Eureka    │
│  Service    │  │   Service   │  │   Server    │
│   :8084     │  │   :8085     │  │   :8761     │
└─────────────┘  └─────────────┘  └─────────────┘
         │               │
         └───────────────┘
                 │
                 ▼
        ┌─────────────────┐
        │  MySQL Database │
        │ supermarket_sc  │
        └─────────────────┘
```

## ✨ Features

### Backend Microservices
- **Eureka Server** - Service discovery and registration
- **Product Service** - Product and supplier management
- **Inventory Service** - Real-time stock tracking with Feign client integration
- **Order Service** - Order processing and fulfillment
- **Recommendation Service** - AI-powered stock recommendations
- **User Service** - Authentication and user management

### Frontend Application
- **Interactive Dashboard** - Real-time analytics with Recharts
- **Product Management** - CRUD operations with supplier integration
- **Inventory Tracking** - Stock levels, restock alerts, low stock monitoring
- **Order Management** - Place, track, and process orders
- **Stock Recommendations** - AI-driven restocking suggestions
- **User Management** - Role-based access control

## 🛠️ Tech Stack

### Backend
- **Framework**: Spring Boot 3.0.2
- **Language**: Java 17 (compatible with Java 23)
- **Database**: MySQL 8.0
- **Service Discovery**: Netflix Eureka
- **Inter-Service Communication**: OpenFeign
- **ORM**: Spring Data JPA + Hibernate
- **Build Tool**: Maven
- **Caching**: Redis (optional, currently disabled)

### Frontend
- **Framework**: Next.js 15.5.11
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3.4.19
- **State Management**: React Hook Form + Zod validation
- **HTTP Client**: Axios 1.13.4
- **Charts**: Recharts 3.7.0
- **UI Components**: Custom components with Lucide icons

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Java JDK 17 or higher** - [Download](https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html)
- **Node.js 18 or later** - [Download](https://nodejs.org/)
- **MySQL 8.0** - [Download](https://dev.mysql.com/downloads/installer/)
- **Maven** (optional, wrapper included) - [Download](https://maven.apache.org/download.cgi)
- **Git** - [Download](https://git-scm.com/downloads)

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/MitanshuDS23/Supply-Chain-Management.git
cd Supply-Chain-Management
```

### 2. Database Configuration

**Create the MySQL database:**

```sql
CREATE DATABASE supermarket_supply_chain;
```

**Update credentials** (if different from defaults):
- Default username: `mitan`
- Default password: `root`

Update in all service `application.properties` files:
```properties
# Located in each service: src/main/resources/application.properties
spring.datasource.username=your_username
spring.datasource.password=your_password
```

### 3. Set JAVA_HOME Environment Variable

**Windows:**
```powershell
$env:JAVA_HOME = "C:\Program Files\Java\jdk-23"
```

**Linux/Mac:**
```bash
export JAVA_HOME=/path/to/your/jdk
```

### 4. Build All Services

```bash
cd Supply-Chain-Management-With-Springboot-main
.\mvnw clean compile
```

### 5. Start the Services

**Start services in the following order** (each in a separate terminal):

#### 5.1 Eureka Server (Service Discovery)
```bash
cd Supply-Chain-Management-With-Springboot-main/eureka-server
..\mvnw spring-boot:run
```
✅ **Running at**: http://localhost:8761

#### 5.2 Product Service
```bash
cd Supply-Chain-Management-With-Springboot-main/product-service
..\mvnw spring-boot:run
```
✅ **Running at**: http://localhost:8081

#### 5.3 Inventory Service
```bash
cd Supply-Chain-Management-With-Springboot-main/inventory-service
..\mvnw spring-boot:run
```
✅ **Running at**: http://localhost:8082

#### 5.4 Order Service
```bash
cd Supply-Chain-Management-With-Springboot-main/order-service
..\mvnw spring-boot:run
```
✅ **Running at**: http://localhost:8083

#### 5.5 Recommendation Service
```bash
cd Supply-Chain-Management-With-Springboot-main/recommendation-service
..\mvnw spring-boot:run
```
✅ **Running at**: http://localhost:8084

#### 5.6 User Service
```bash
cd Supply-Chain-Management-With-Springboot-main/user-service
..\mvnw spring-boot:run
```
✅ **Running at**: http://localhost:8085

⏱️ **Wait 30-45 seconds** for all services to register with Eureka.

### 6. Start the Frontend

**In a new terminal:**

```bash
cd supply-chain-frontend

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

✅ **Frontend running at**: http://localhost:3000

## 🔍 Verify Installation

### Check Eureka Dashboard
Visit **http://localhost:8761** to see all registered services.

You should see:
- PRODUCT-SERVICE
- INVENTORY-SERVICE
- ORDER-SERVICE
- RECOMMENDATION-SERVICE
- USER-SERVICE

### Test API Endpoints

```bash
# Test Product Service
curl http://localhost:8081/products

# Test Inventory Service
curl http://localhost:8082/inventory

# Test Order Service
curl http://localhost:8083/orders

# Test Recommendation Service
curl http://localhost:8084/recommendations

# Test User Service
curl http://localhost:8085/getAllUsers/0/10
```

## 📡 API Documentation

### Product Service (Port 8081)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products` | Get all products (paginated) |
| POST | `/products` | Create new product |
| GET | `/products/{id}` | Get product by ID |
| PUT | `/products/{id}` | Update product |
| DELETE | `/products/{id}` | Delete product |
| GET | `/products/category/{category}` | Get products by category |
| GET | `/products/supplier/{supplierId}` | Get products by supplier |
| GET | `/products/search?keyword=` | Search products |

### Inventory Service (Port 8082)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/inventory` | Get all inventory |
| POST | `/inventory` | Create inventory for product |
| GET | `/inventory/{productId}` | Get inventory by product ID |
| PUT | `/inventory/restock/{productId}` | Restock product |
| PUT | `/inventory/reduce/{productId}` | Reduce stock |
| GET | `/inventory/low-stock` | Get low stock items |

### Order Service (Port 8083)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/orders` | Get all orders |
| POST | `/orders` | Place new order |
| GET | `/orders/{id}` | Get order by ID |
| GET | `/orders/status/{status}` | Get orders by status |
| PUT | `/orders/{id}/accept` | Accept order |
| PUT | `/orders/{id}/deliver` | Mark order delivered |
| DELETE | `/orders/{id}` | Delete order |

### Recommendation Service (Port 8084)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/recommendations` | Get all recommendations |
| GET | `/recommendations/{productId}` | Get recommendation for product |
| GET | `/recommendations/alerts` | Get critical alerts |
| GET | `/recommendations/threshold/{percent}` | Get alerts with threshold |

### User Service (Port 8085)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/addUsers` | Create new user |
| GET | `/getAllUsers/{pageNo}/{pageSize}` | Get all users |
| GET | `/getUserById/{id}` | Get user by ID |
| PUT | `/updatePassword/{id}` | Update password |
| DELETE | `/deleteUsers/{id}` | Delete user |

## 🏃 Quick Start Script

**Windows PowerShell:**

```powershell
# Copy this script and save as start-all-services.ps1
$env:JAVA_HOME = "C:\Program Files\Java\jdk-23"

# Start Eureka Server
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd eureka-server; ..\mvnw spring-boot:run"

Start-Sleep -Seconds 20

# Start all other services
$services = @("product-service", "inventory-service", "order-service", "recommendation-service", "user-service")
foreach ($service in $services) {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd $service; ..\mvnw spring-boot:run"
    Start-Sleep -Seconds 5
}

# Start frontend
Start-Sleep -Seconds 20
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd ..\supply-chain-frontend; npm run dev"
```

## 🔧 Configuration

### Backend Configuration Files

Each service has its own `application.properties`:

```properties
spring.application.name=service-name
server.port=80XX
spring.datasource.url=jdbc:mysql://localhost:3306/supermarket_supply_chain
spring.datasource.username=mitan
spring.datasource.password=root
spring.jpa.hibernate.ddl-auto=update
eureka.client.service-url.defaultZone=http://localhost:8761/eureka/
```

### Frontend Configuration

Environment variables in `.env.local`:

```env
NEXT_PUBLIC_PRODUCT_SERVICE_URL=http://localhost:8081
NEXT_PUBLIC_INVENTORY_SERVICE_URL=http://localhost:8082
NEXT_PUBLIC_ORDER_SERVICE_URL=http://localhost:8083
NEXT_PUBLIC_RECOMMENDATION_SERVICE_URL=http://localhost:8084
NEXT_PUBLIC_USER_SERVICE_URL=http://localhost:8085
```

## 🐛 Troubleshooting

### Services won't start

**Issue**: `JAVA_HOME` not set  
**Solution**: Set the environment variable as shown in step 3

**Issue**: MySQL connection refused  
**Solution**: Ensure MySQL is running and credentials are correct

**Issue**: Port already in use  
**Solution**: Stop any services running on ports 8081-8085, 8761, or 3000

### Frontend can't connect to backend

**Issue**: CORS errors  
**Solution**: Backend services are configured for `localhost:3000` and `localhost:3001`

**Issue**: API calls failing  
**Solution**: Ensure all backend services are running and registered with Eureka

### Eureka shows no services

**Issue**: Services not registering  
**Solution**: Wait 30-60 seconds for registration. Check that Eureka is running first.

## 📦 Production Build

### Backend

```bash
cd Supply-Chain-Management-With-Springboot-main
.\mvnw clean package -DskipTests

# JAR files will be in each service's target/ directory
```

### Frontend

```bash
cd supply-chain-frontend
npm run build
npm run start
```

## 🚢 Deployment

### Docker (Recommended)

Create Docker images for each service and deploy using Docker Compose or Kubernetes.

### Cloud Deployment

- **Backend**: Deploy to AWS EC2, Google Cloud, or Azure VMs
- **Frontend**: Deploy to Vercel, Netlify, or AWS Amplify
- **Database**: Use managed MySQL (AWS RDS, Google Cloud SQL)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the MIT License.

## 👤 Author

**Mitanshu**
- GitHub: [@MitanshuDS23](https://github.com/MitanshuDS23)
- Repository: [Supply-Chain-Management](https://github.com/MitanshuDS23/Supply-Chain-Management)

## 🙏 Acknowledgments

- Spring Boot and Spring Cloud for the excellent microservices framework
- Netflix Eureka for service discovery
- Next.js team for the amazing React framework
- All open-source contributors

---

## 📊 System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| RAM | 8 GB | 16 GB |
| CPU | 4 cores | 8 cores |
| Storage | 2 GB | 5 GB |
| Java | JDK 17 | JDK 23 |
| Node.js | v18 | v20+ |
| MySQL | 8.0 | 8.0+ |

---

**⭐ Star this repository if you find it helpful!**

**🐛 Found a bug? Please create an issue.**

**💡 Have a feature request? Open a discussion!**

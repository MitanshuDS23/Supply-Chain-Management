#  Supermarket Supply Chain Management System

A robust, multi-tenant SaaS platform built with **Spring Boot** (Backend) and **Next.js** (Frontend). Designed to streamline supermarket operations with real-time inventory tracking, analytics, and event-driven processing.

##  Features
- **Real-time Inventory Management:** Track stock levels with high precision.
- **Interactive Dashboard:** Visual analytics using Recharts.
- **High Performance:** Optimized with Redis caching and RabbitMQ.
- **Secure:** Built with industry-standard security practices.

##  Tech Stack
- **Backend:** Java 17, Spring Boot 3.0.2, Spring Data JPA, MySQL
- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS, Recharts
- **Database:** MySQL

---

## Setup & Installation Guide

Follow these steps to get the application running locally.

###  Prerequisites
Ensure you have the following installed:
- [Java JDK 17](https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html)
- [Node.js](https://nodejs.org/) (v18 or later)
- [MySQL Server](https://dev.mysql.com/downloads/installer/)

---

### 1️ Database Configuration

1. Open your MySQL Command Line or Workbench.
2. Create the required database.

```sql
CREATE DATABASE supermarket_supply_chain;
```
*(The tables will be automatically created by Hibernate on the first run)*

---

### 2️ Backend Setup (Spring Boot)

Navigate to the backend directory and start the server.

```bash
# Navigate to the backend project folder
cd "Supply-Chain-Management-With-Springboot-main/Supply-Chain-Management-With-Springboot-main"

# (Optional) Verify database credentials in src/main/resources/application.properties
# Default configured user: 'mitan', password: 'root'

# Run the application
./mvnw spring-boot:run
```

 **Server started at:** `http://localhost:8080`

---

### 3️ Frontend Setup (Next.js)

Open a **new terminal** window and setup the frontend.

```bash
# Navigate to the frontend project folder
cd "Supply-Chain-Management-With-Springboot-main/supply-chain-frontend"

# Install dependencies
npm install

# Start the development server
npm run dev
```

 **App running at:** `http://localhost:3000`

---

##  Usage Instructions

1.  **Dashboard**: Access `http://localhost:3000` to view the comprehensive dashboard with stock alerts and performance charts.
2.  **Inventory**: API endpoints are available at `http://localhost:8080/api/v1/inventory` (configured in your Controller).
3.  **Troubleshooting**:
    *   If the backend fails to start, ensure MySQL service is running and credentials in `application.properties` match your local setup.
    *   If the frontend cannot connect, ensure the backend is running on port `8080`.

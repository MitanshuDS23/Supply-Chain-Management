# Supply Chain Management — Frontend (React + Vite)

A single-page management console for the Spring Boot supply-chain microservices.
Built with **React 18**, **Vite**, **React Router**, **Axios** and **Recharts**.

## Features

- **Auth** — sign in / sign up against the user-service (`/api/auth`)
- **Dashboard** — KPIs, order-status & category charts, recent orders, low-stock alerts
- **Products** — full CRUD with supplier linking and search/category filters
- **Suppliers** — CRUD with star ratings
- **Inventory** — stock levels with restock / reduce, reorder-level and consumption controls
- **Orders** — place multi-line orders, view line items, accept → transfer → deliver lifecycle
- **Recommendations** — threshold-based restock suggestions with one-click restock
- **Users** — account management, roles, password updates

## Prerequisites

- Node.js 18+
- The six backend services running (Eureka + product/inventory/order/recommendation/user).
  See the backend README under `Supply-Chain-Management-With-Springboot-main/`.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000. Demo login: **Mitanshu / 123123**.

## How it talks to the backend

The dev server proxies each microservice through a `/svc/*` prefix (see `vite.config.js`),
so the browser only ever talks to the Vite origin — **no CORS configuration needed**:

| Prefix                 | Service                | Port |
|------------------------|------------------------|------|
| `/svc/product`         | product-service        | 8081 |
| `/svc/inventory`       | inventory-service      | 8082 |
| `/svc/order`           | order-service          | 8083 |
| `/svc/recommendation`  | recommendation-service | 8084 |
| `/svc/user`            | user-service           | 8085 |

To point at different hosts/ports, edit the `proxy` block in `vite.config.js`.

## Build

```bash
npm run build      # outputs to dist/
npm run preview
```

## Project structure

```
src/
  api/client.js          Axios instances + typed API wrappers for every endpoint
  context/AuthContext.jsx Auth state (persisted to localStorage)
  components/            Layout, Toast, reusable UI kit (ui.jsx)
  pages/                Dashboard, Products, Suppliers, Inventory, Orders,
                        Recommendations, Users, Login
```

# 🎓 PharmaLink: Developer & Architecture Guide

This document serves as the technical manual for the PharmaLink system. It details the data flow, database schema, and architectural decisions made during development.

---

## 1. Database Schema & Relationships
The system is built on **`PharmaLinkDB`** with the following core entities:

### **A. Core Tables**
* **`Users`**: Stores credentials and Roles (`Admin` vs `Pharmacist`).
    * *Key Columns:* `Id`, `UserName`, `PasswordHash`, `Role`.
* **`Categories`**: Classification for medicines (e.g., "Antibiotics", "Syrups").
* **`Medicines`**: The inventory items.
    * *Relationship:* Linked to `Categories` via `CategoryId` (Foreign Key).
    * *Key Columns:* `StockQuantity`, `ExpiryDate`, `Price`.
* **`Sales`**: Represents a transaction header.
    * *Key Columns:* `TransactionDate`, `TotalAmount`.

*(See `script.sql` for full constraints and foreign key definitions).*

---

## 2. The "Full Stack" Data Flow
How a click in React becomes a row in SQL Server:

### **Scenario: Processing a Sale (POS)**
1.  **Frontend (React):**
    * User adds items to the cart in `POSTerminalPage.tsx`.
    * When "Process" is clicked, `saleService.createSale(cartData)` is called.
2.  **API Layer (ASP.NET):**
    * Receives the JSON payload.
    * **Transaction Scope:** The API opens a SQL Transaction.
        1.  Insert row into `Sales` table.
        2.  Insert rows into `SaleItems` table.
        3.  **UPDATE `Medicines`**: Decrement `StockQuantity` by the sold amount.
3.  **Database (SQL):**
    * Commits the transaction only if all steps succeed.
4.  **UI Feedback:**
    * Frontend receives `200 OK`.
    * Cart is cleared, and a receipt is generated.

---

## 3. Security Implementation

### **Frontend: Route Guards**
We strictly enforce access using Higher-Order Components in `App.tsx`:
* **`ProtectedRoute`**: Verifies if `localStorage` contains a token.
* **`RoleRoute`**: Decodes the User Role.
    * *Example:* Accessing `/users` triggers a check: `if (user.role !== 'Admin') return <Unauthorized />`.

### **Backend: JWT Authentication**
* The `Users` table stores passwords as **Hashes**, not plain text.
* Every API request from the frontend includes the header: `Authorization: Bearer <token>`.

---

## 4. Performance Optimization Features
* **Lazy Loading:** Major features (`Inventory`, `POS`) are split into separate chunks. They only load when requested.
* **Artificial Delay (Demo Mode):**
    * *Logic:* `delayForDemo` in `App.tsx`.
    * *Purpose:* Forces a 1.5s wait to demonstrate the **Skeleton Loading** UI to users/evaluators, preventing UI flickering on fast local networks.

---

## 5. Critical Files to Know
| File | Purpose |
| :--- | :--- |
| **`script.sql`** | The "Reset Button" for the database. Re-creates tables and seeds users `jack` & `Calago`. |
| **`api.ts`** | The central Axios instance. Handles all HTTP requests and token attachment. |
| **`DashboardLayout.tsx`** | The main container. Handles the Sidebar and the Global Suspense (Loading Spinner). |
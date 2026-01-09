# PharmaLink 🏥
### Efficient Management for Modern Pharmacies

PharmaLink is a full-stack **Pharmacy Management System** designed to streamline inventory tracking, sales processing, and user administration. It features a secure, role-based architecture separating **Admins** (Inventory/User Managers) from **Pharmacists** (Point of Sale/Sales).

---

## 🚀 Tech Stack

### **Frontend**
* **Framework:** React 18 (Vite)
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **State Management:** React Context API (Auth)
* **Routing:** React Router DOM v6
* **Charts:** Recharts

### **Backend** (API)
* **Framework:** ASP.NET Core Web API 8.0
* **Language:** C#
* **ORM:** Dapper / ADO.NET
* **Database:** Microsoft SQL Server
* **Authentication:** JWT (JSON Web Tokens)

---

## ✨ Key Features

### 🛡️ **Role-Based Access Control (RBAC)**
* **Admin**: Full access to Inventory, Categories, User Management, and Dashboard Analytics.
* **Pharmacist**: Restricted access to POS Terminal, Sales History, and Personal Profile.
* **Security**: Routes are protected via `ProtectedRoutes` and `RoleRoute` guards.

### 💊 **Inventory Management**
* Real-time stock tracking.
* "Low Stock" and "Expiring Soon" filters.
* Add, Edit, Delete, and Restock medicines.

### 🛒 **Point of Sale (POS)**
* Fast product search and cart management.
* Real-time total calculation.
* Generates printable receipts.
* Automatic stock deduction upon sale completion.

### 📊 **Dashboard Analytics**
* Visual charts for weekly sales trends.
* Key metrics: Total Revenue, Low Stock Alerts, Expiring Items.

---

## 🛠️ Setup Instructions

### 1. Database Setup 🗄️
Before running the API, you must configure the database.
1.  Open **Microsoft SQL Server Management Studio (SSMS)**.
2.  Create a new database named `PharmaLinkDB`.
3.  Open the file `DatabaseSetup.sql` provided in the backend folder.
4.  **Execute** the script to generate the required Tables (`Users`, `Medicines`, `Sales`, etc.) and Seed Data (Default Admin/Pharmacist accounts).

### 2. Backend API Setup ⚙️
1.  Navigate to the `PharmaLink.API` folder.
2.  Open `appsettings.json` and update the **Connection String** to match your local SQL Server instance.
3.  Run the application:
    ```bash
    dotnet run
    ```
4.  The API will start at `http://localhost:5000` (or similar).

### 3. Frontend Setup 💻
1.  Navigate to the `pharmalink-web` folder.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
4.  Open your browser at `http://localhost:5173`.

---

## 🔑 Default Credentials
Use these accounts to test the system (created by `DatabaseSetup.sql`):

| Role | Username | Password |
| :--- | :--- | :--- |
| **Admin** | `admin` | `admin123` |
| **Pharmacist** | `user` | `user123` |

---

## 📂 Project Structure
src/ ├── features/ # Feature-based modules (The "Pages") │ ├── auth/ # Login & Authentication logic │ ├── dashboard/ # Analytics graphs & stats │ ├── inventory/ # Medicine tables & modals │ ├── pos/ # Point of Sale terminal │ └── users/ # User management (Admin only) ├── components/ # Reusable UI (Buttons, Modals, Skeleton) ├── context/ # Global State (AuthContext) ├── services/ # API Communication (Axios) └── layouts/ # Main Dashboard Wrapper (Sidebar + Outlet)

---

*© 2025 PharmaLink System. All Rights Reserved.*

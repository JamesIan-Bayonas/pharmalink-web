import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, RoleRoute } from '../src/routes/ProtectedRoutes';
import Login from './features/auth/Login';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardPage from './features/dashboard/DashboardPage';
import InventoryPage from './features/inventory/InventoryPage';
import POSTerminalPage from './features/pos/POSTerminalPage';
import SalesHistoryPage from './features/sales/SalesHistoryPage';
import UserManagementPage from './features/users/UserManagementPage';
import CategoryManagementPage from './features/categories/CategoryManagementPage';
import ProfilePage from './features/users/ProfilePage';

// Placeholders (Create these files later as .tsx)
// const Dashboard = () => <h2>Dashboard (Common)</h2>;
// const Inventory = () => <h2>Inventory (Admin Only)</h2>;
// const POS = () => <h2>POS Terminal (Pharmacist/Admin)</h2>;
const Unauthorized = () => <div className="p-8 text-center text-red-600 text-xl font-bold">Access Denied</div>; 

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected Area */}
          <Route element={<ProtectedRoute />}>
            {/* Dashboard Layout */}
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route element={<RoleRoute allowedRoles={['Admin', 'Pharmacist']} />}>
                <Route path="/sales" element={<POSTerminalPage />} />
                <Route path="/history" element={<SalesHistoryPage />} />
              </Route>
              <Route element={<RoleRoute allowedRoles={['Admin']} />}>
                <Route path="/inventory" element={<InventoryPage />} />
                <Route path="/users" element={<UserManagementPage />} />
                <Route path="/categories" element={<CategoryManagementPage />} />
                <Route path="profile" element={<ProfilePage />} />
              </Route>

            </Route>
          </Route>

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
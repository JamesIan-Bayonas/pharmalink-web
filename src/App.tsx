import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, RoleRoute } from '../src/routes/ProtectedRoutes';
import Login from './features/auth/Login';
import DashboardLayout from './layouts/DashboardLayout';

// Placeholders (Create these files later as .tsx)
const Dashboard = () => <h2>Dashboard (Common)</h2>;
const Inventory = () => <h2>Inventory (Admin Only)</h2>;
const POS = () => <h2>POS Terminal (Pharmacist/Admin)</h2>;
const Unauthorized = () => <h2>Access Denied</h2>;

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
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />

             {/* Role Based Access */}
             <Route element={<RoleRoute allowedRoles={['Admin', 'Pharmacist']} />}>
                <Route path="/sales" element={<POS />} />
             </Route>

             <Route element={<RoleRoute allowedRoles={['Admin']} />}>
                <Route path="/inventory" element={<Inventory />} />
             </Route>
          </Route>

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
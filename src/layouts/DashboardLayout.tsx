import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DashboardLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Helper to check active link for styling
    const isActive = (path: string) => location.pathname.startsWith(path) 
        ? "bg-blue-700 text-white" 
        : "text-gray-300 hover:bg-blue-800 hover:text-white";

    return (
        <div className="flex h-screen bg-gray-100">
            {/* SIDEBAR */}
            <aside className="w-64 bg-gray-900 text-white flex flex-col">
                <div className="p-4 text-2xl font-bold text-center border-b border-gray-700">
                    PharmaLink
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <Link to="/dashboard" className={`block px-4 py-2 rounded ${isActive('/dashboard')}`}>
                        Dashboard
                    </Link>

                    {/* SHARED LINKS (Admin & Pharmacist) */}
                    <Link to="/sales" className={`block px-4 py-2 rounded ${isActive('/sales')}`}>
                        POS Terminal
                    </Link>

                    {/* ADMIN ONLY LINKS */}
                    {user?.role === 'Admin' && (
                        <>
                            <Link to="/inventory" className={`block px-4 py-2 rounded ${isActive('/inventory')}`}>
                                Inventory Management
                            </Link>
                            <Link to="/users" className={`block px-4 py-2 rounded ${isActive('/users')}`}>
                                User Management
                            </Link>
                        </>
                    )}
                </nav>

                <div className="p-4 border-t border-gray-700">
                    <div className="mb-2 text-sm text-gray-400">
                        Logged in as: <span className="text-white font-bold">{user?.username}</span>
                        <br />
                        <span className="text-xs uppercase tracking-wider">{user?.role}</span>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-sm font-bold text-white bg-red-600 rounded hover:bg-red-700"
                    >
                        Logout
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 overflow-auto p-8">
                <Outlet /> 
            </main>
        </div>
    );
};

export default DashboardLayout;
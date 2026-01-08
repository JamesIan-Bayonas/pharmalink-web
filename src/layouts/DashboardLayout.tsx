import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DashboardLayout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { label: 'My Profile', path: '/profile', roles: ['Admin', 'Pharmacist'] },
        { label: 'Overview', path: '/dashboard', roles: ['Admin', 'Pharmacist'] },
        { label: 'POS Terminal', path: '/sales', roles: ['Admin', 'Pharmacist'] },
        { label: 'Sales History', path: '/history', roles: ['Admin', 'Pharmacist'] },
        { label: 'Inventory', path: '/inventory', roles: ['Admin'] },
        { label: 'Categories', path: '/categories', roles: ['Admin'] },
        { label: 'User Management', path: '/users', roles: ['Admin'] },
    ];

    const visibleNavItems = navItems.filter(item => 
        user && item.roles.includes(user.role)
    );

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            {/* SIDEBAR */}
            <aside className="w-64 bg-gray-800 text-white flex flex-col shadow-lg">
                <div className="p-6 border-b border-gray-700">
                    <h2 className="text-2xl font-bold tracking-wide text-blue-400">PharmaLink</h2>
                    <p className="text-xs text-gray-400 mt-1">Pharmacy Management</p>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {visibleNavItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link 
                                key={item.path}
                                to={item.path}
                                className={`block px-4 py-3 rounded transition-colors duration-200 
                                    ${isActive 
                                        ? 'bg-blue-600 text-white font-bold shadow-md' 
                                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                    }`}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-700">
                    <div className="mb-4 px-4">
                        <p className="text-sm font-medium text-white">{user?.username || 'User'}</p>
                        <p className="text-xs text-gray-400">{user?.role || 'Guest'}</p>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded transition-colors"
                    >
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Top Header (Optional, good for mobile or extra info) */}
                <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6 z-10">
                    <h1 className="text-xl font-bold text-gray-700">
                        {navItems.find(i => i.path === location.pathname)?.label || 'Dashboard'}
                    </h1>
                    {/* Add a Date/Time display here later if you want */}
                    <div className="text-sm text-gray-500">
                        {new Date().toLocaleDateString()}
                    </div>
                </header>

                {/* Page Content Scroller */}
                <div className="flex-1 overflow-auto p-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
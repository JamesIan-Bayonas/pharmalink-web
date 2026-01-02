import { useEffect, useState } from 'react';
import { getDashboardStats, type DashboardStats } from '../../services/dashboardService';
import { useAuth } from '../../context/AuthContext';

const DashboardPage = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await getDashboardStats();
                setStats(data);
            } catch (err) {
                console.error("Failed to load dashboard stats", err);
                setError('Failed to load dashboard data.');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading Dashboard...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold text-gray-800">Overview</h1>
                <p className="text-gray-600">Welcome back, {user?.username}!</p>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                
                {/* Card 1: Revenue (Green) */}
                <div className="p-6 bg-white border-l-4 border-green-500 rounded-lg shadow-sm">
                    <div className="text-sm font-medium text-gray-500 uppercase">Today's Revenue</div>
                    <div className="mt-2 text-3xl font-bold text-gray-900">
                        ₱{stats?.totalRevenueToday.toLocaleString()}
                    </div>
                </div>

                {/* Card 2: Sales Count (Blue) */}
                <div className="p-6 bg-white border-l-4 border-blue-500 rounded-lg shadow-sm">
                    <div className="text-sm font-medium text-gray-500 uppercase">Sales Processed</div>
                    <div className="mt-2 text-3xl font-bold text-gray-900">
                        {stats?.totalSalesToday}
                    </div>
                </div>

                {/* Card 3: Low Stock (Red - Critical) */}
                <div className="p-6 bg-white border-l-4 border-red-500 rounded-lg shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-gray-500 uppercase">Low Stock Alerts</div>
                        <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded-full">Action Needed</span>
                    </div>
                    <div className="mt-2 text-3xl font-bold text-red-600">
                        {stats?.lowStockItems}
                    </div>
                    <p className="mt-1 text-xs text-gray-400">Items with &lt; 10 units</p>
                </div>

                {/* Card 4: Expiring Soon (Yellow/Orange) */}
                <div className="p-6 bg-white border-l-4 border-orange-400 rounded-lg shadow-sm">
                    <div className="text-sm font-medium text-gray-500 uppercase">Expiring Soon</div>
                    <div className="mt-2 text-3xl font-bold text-gray-900">
                        {stats?.expiringSoonItems}
                    </div>
                    <p className="mt-1 text-xs text-gray-400">Items expiring in &lt; 3 months</p>
                </div>
            </div>

            {/* Quick Actions / Total Inventory Overview */}
            <div className="p-6 mt-6 bg-white rounded-lg shadow-sm">
                <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">Inventory Status</h2>
                <div className="flex items-center space-x-4">
                    <div className="flex-1">
                        <p className="text-gray-500">Total Unique Medicines</p>
                        <p className="text-2xl font-bold">{stats?.totalMedicines}</p>
                    </div>
                    {/* Role Based Action Button */}
                    {user?.role === 'Admin' ? (
                         <button className="px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded hover:bg-blue-700">
                            Manage Inventory
                         </button>
                    ) : (
                        <button className="px-4 py-2 text-sm font-bold text-white bg-green-600 rounded hover:bg-green-700">
                            New Transaction
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
import { useEffect, useState } from 'react';
import { getDashboardStats, type DashboardStats } from '../../services/dashboardService';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const DashboardPage = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await getDashboardStats();
                setStats(data);
            } catch (err) {
                console.error("Failed to load dashboard:", err);
                setError('Failed to load dashboard data.');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading Analytics...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
    if (!stats) return null;

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Pharmacy Overview</h1>
                    <p className="text-gray-500 text-sm">Real-time inventory and sales metrics</p>
                </div>
                <div className="text-right">
                    <p className="text-sm font-semibold text-gray-600">{new Date().toLocaleDateString()}</p>
                </div>
            </header>

            {/* TOP ROW: STAT CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* REVENUE */}
                <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Today's Revenue</p>
                            <h3 className="text-2xl font-bold text-gray-800 mt-1">
                                ₱{stats.totalRevenueToday.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </h3>
                        </div>
                        <span className="p-2 bg-green-100 text-green-600 rounded-lg">💰</span>
                    </div>
                </div>

                {/* TRANSACTIONS */}
                <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Transactions</p>
                            <h3 className="text-2xl font-bold text-gray-800 mt-1">
                                {stats.totalSalesToday}
                            </h3>
                        </div>
                        <span className="p-2 bg-blue-100 text-blue-600 rounded-lg">🧾</span>
                    </div>
                </div>

                {/* LOW STOCK */}
                <Link to="/inventory?filter=low" className="block transform transition hover:scale-105">
                    <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-red-500 cursor-pointer">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-bold text-red-400 uppercase tracking-wider">Low Stock</p>
                                <h3 className="text-2xl font-bold text-red-600 mt-1">
                                    {stats.lowStockItems}
                                </h3>
                                <p className="text-xs text-red-400 mt-1">Items below threshold</p>
                            </div>
                            <span className="p-2 bg-red-100 text-red-600 rounded-lg">⚠️</span>
                        </div>
                    </div>
                </Link>

                {/* EXPIRING SOON */}
                <Link to="/inventory?filter=expiring" className="block transform transition hover:scale-105">
                    <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-orange-500">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-bold text-orange-400 uppercase tracking-wider">Expiring (90 Days)</p>
                                <h3 className="text-2xl font-bold text-gray-800 mt-1">
                                    {stats.expiringSoonItems}
                                </h3>
                                <p className="text-xs text-gray-400 mt-1">Out of {stats.totalMedicines} total medicines</p>
                            </div>
                            <span className="p-2 bg-orange-100 text-orange-600 rounded-lg">📅</span>
                        </div>
                    </div>
                </Link>
            </div>

            {/* MIDDLE ROW: CHART SECTION */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Weekly Sales Trend</h3>
                {/* --- CHART SECTION START --- */}
            <div className="w-full h-[300px]">
                {stats.weeklySales && stats.weeklySales.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.weeklySales}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis 
                                dataKey="dateLabel" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: '#6B7280', fontSize: 12 }} 
                                dy={10}
                            />
                            <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: '#6B7280', fontSize: 12 }} 
                                tickFormatter={(value) => `₱${value}`}
                            />
                            <Tooltip 
                                cursor={{ fill: '#F3F4F6' }}
                                formatter={(value: any) => [`₱${Number(value).toLocaleString()}`, 'Revenue']}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                            />
                            <Bar 
                                dataKey="totalAmount"
                                fill="#3B82F6" 
                                radius={[4, 4, 0, 0]} 
                                barSize={40}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex items-center justify-center text-gray-400 border border-dashed rounded-lg">
                        No sales data for the last 7 days.
                    </div>
                )}
            </div>
            {/* --- CHART SECTION END --- */}
            </div>

            {/* BOTTOM ROW: QUICK ACTIONS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 flex flex-col justify-center items-start">
                    <h3 className="font-bold text-blue-800 text-lg">New Transaction</h3>
                    <p className="text-sm text-blue-600 mb-4">Process sales and print receipts.</p>
                    <Link to="/sales" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-medium transition">
                        Go to POS Terminal
                    </Link>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 flex flex-col justify-center items-start">
                    <h3 className="font-bold text-gray-800 text-lg">Manage Inventory</h3>
                    <p className="text-sm text-gray-600 mb-4">Add stocks or check expiring items.</p>
                    <Link to="/inventory" className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 px-6 py-2 rounded font-medium transition">
                        View Inventory
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
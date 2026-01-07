import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom'; // Import this
import { getMedicines, deleteMedicine, type Medicine, type PaginationMeta } from '../../services/medicineService';
import { getAllCategories } from '../../services/categoryService';
import { useAuth } from '../../context/AuthContext';
import AddMedicineModal from './AddMedicineModal';
import RestockModal from './RestockModal';

const InventoryPage = () => {
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams(); // URL Params
    
    // Data State
    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [categories, setCategories] = useState<Record<number, string>>({});
    const [meta, setMeta] = useState<PaginationMeta | null>(null);
    
    // UI State
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);

    // Read Filter from URL (default to empty)
    const activeFilter = searchParams.get('filter') || '';

    // Modal State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
    const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);

    // Fetch Inventory
    const fetchInventory = async () => {
        setLoading(true);
        try {
            const response = await getMedicines({ 
                pageNumber: page, 
                pageSize: 10, 
                searchTerm: searchTerm,
                filter: activeFilter // Pass filter to API
            });
            setMedicines(response.data);
            setMeta(response.meta);
        } catch (error) {
            console.error("Failed to load inventory", error);
        } finally {
            setLoading(false);
        }
    };

    // Load Categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await getAllCategories();
                const catMap: Record<number, string> = {};
                data.forEach(c => catMap[c.id] = c.name);
                setCategories(catMap);
            } catch (error) {
                console.error("Failed to load categories", error);
            }
        };
        fetchCategories();
    }, []);

    // Refetch when dependencies change
    useEffect(() => {
        fetchInventory();
    }, [page, searchTerm, activeFilter]);

    // Handlers
    const handleFilterChange = (newFilter: string) => {
        setPage(1);
        setSearchParams(newFilter ? { filter: newFilter } : {}); // Update URL
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            await deleteMedicine(id);   
            fetchInventory();
        } catch (error) {
            alert("Failed to delete.");
        }
    };

    // Helper: Row Color Logic
    const getRowColor = (item: Medicine) => {
        const isLow = item.stockQuantity <= 10;
        // Check if expiry is within 90 days
        const daysUntilExpiry = Math.ceil((new Date(item.expiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
        const isExpiring = daysUntilExpiry <= 90;

        if (isLow) return 'bg-red-50 hover:bg-red-100';
        if (isExpiring) return 'bg-orange-50 hover:bg-orange-100';
        return 'hover:bg-gray-50';
    };

    return (
        <div className="space-y-6">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-4 rounded shadow-sm gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Inventory</h1>
                    <p className="text-sm text-gray-500">Manage stock and pricing</p>
                </div>
                
                {/* --- NEW: QUICK FILTERS --- */}
                <div className="flex space-x-2">
                    <button 
                        onClick={() => handleFilterChange('')}
                        className={`px-3 py-1 text-sm rounded-full border ${activeFilter === '' ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-300'}`}
                    >
                        All
                    </button>
                    <button 
                        onClick={() => handleFilterChange('low')}
                        className={`px-3 py-1 text-sm rounded-full border ${activeFilter === 'low' ? 'bg-red-600 text-white border-red-600' : 'bg-white text-red-600 border-red-200'}`}
                    >
                        Low Stock
                    </button>
                    <button 
                        onClick={() => handleFilterChange('expiring')}
                        className={`px-3 py-1 text-sm rounded-full border ${activeFilter === 'expiring' ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-orange-500 border-orange-200'}`}
                    >
                        Expiring
                    </button>
                </div>

                <div className="flex space-x-2 w-full md:w-auto">
                    <input 
                        type="text" 
                        placeholder="Search..." 
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                        className="border p-2 rounded flex-1 md:w-48 outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    {user?.role === 'Admin' && (
                        <button 
                            onClick={() => { setSelectedMedicine(null); setIsAddModalOpen(true); }}
                            className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700 whitespace-nowrap"
                        >
                            + Add Item
                        </button>
                    )}
                </div>
            </header>

            {/* Main Table */}
            <div className="bg-white rounded shadow overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                            <th className="py-3 px-6">Name</th>
                            <th className="py-3 px-6">Category</th>
                            <th className="py-3 px-6 text-center">Stock</th>
                            <th className="py-3 px-6 text-right">Price</th>
                            <th className="py-3 px-6 text-center">Expiry</th>
                            <th className="py-3 px-6 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-600 text-sm">
                        {loading ? (
                             <tr><td colSpan={6} className="text-center py-8">Loading inventory...</td></tr>
                        ) : medicines.length === 0 ? (
                             <tr><td colSpan={6} className="text-center py-8">No medicines found matching your criteria.</td></tr>
                        ) : (
                            medicines.map((item) => (
                                <tr key={item.id} className={`border-b border-gray-200 transition ${getRowColor(item)}`}>
                                    <td className="py-3 px-6 font-medium text-gray-900">{item.name}</td>
                                    <td className="py-3 px-6">
                                        <span className="bg-blue-100 text-blue-800 py-1 px-3 rounded-full text-xs">
                                            {categories[item.categoryId] || 'Unknown'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-6 text-center">
                                        <span className={`font-bold ${item.stockQuantity <= 10 ? 'text-red-600' : 'text-green-600'}`}>
                                            {item.stockQuantity}
                                        </span>
                                    </td>
                                    <td className="py-3 px-6 text-right">₱{item.price.toFixed(2)}</td>
                                    <td className="py-3 px-6 text-center">
                                        {new Date(item.expiryDate).toLocaleDateString()}
                                    </td>
                                    <td className="py-3 px-6 text-center space-x-2">
                                        {user?.role === 'Admin' && (
                                            <>
                                                <button 
                                                    onClick={() => { setSelectedMedicine(item); setIsRestockModalOpen(true); }}
                                                    className="text-green-600 hover:text-green-800 font-bold text-xs border border-green-600 px-2 py-1 rounded"
                                                >
                                                    + Stock
                                                </button>
                                                <button 
                                                    onClick={() => { setSelectedMedicine(item); setIsAddModalOpen(true); }}
                                                    className="text-blue-600 hover:text-blue-800 font-bold"
                                                >
                                                    Edit
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(item.id)}
                                                    className="text-red-500 hover:text-red-700 font-bold"
                                                >
                                                    ×
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {meta && (
                <div className="flex justify-between items-center bg-white p-4 rounded shadow-sm">
                    <span className="text-gray-600 text-sm">
                        Page {meta.currentPage} of {meta.totalPages} ({meta.totalCount} records)
                    </span>
                    <div className="space-x-2">
                        <button 
                            disabled={meta.currentPage === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="px-3 py-1 border rounded disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <button 
                            disabled={meta.currentPage === meta.totalPages}
                            onClick={() => setPage(p => p + 1)}
                            className="px-3 py-1 border rounded disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
            
            <AddMedicineModal 
                isOpen={isAddModalOpen} 
                onClose={() => setIsAddModalOpen(false)} 
                onSuccess={() => { setIsAddModalOpen(false); fetchInventory(); }} 
                medicineToEdit={selectedMedicine} 
            />

            <RestockModal
                isOpen={isRestockModalOpen}
                onClose={() => setIsRestockModalOpen(false)}
                onSuccess={() => { fetchInventory(); }}
                medicine={selectedMedicine}
            />
        </div>
    );
};

export default InventoryPage;
import { useEffect, useState } from 'react';
import { getMedicines, deleteMedicine, type Medicine, type PaginationMeta } from '../../services/medicineService';
import { getAllCategories } from '../../services/categoryService';
import { useAuth } from '../../context/AuthContext';
import AddMedicineModal from './AddMedicineModal';

const InventoryPage = () => {
    const { user } = useAuth();
    
    // Data State
    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [categories, setCategories] = useState<Record<number, string>>({});
    const [meta, setMeta] = useState<PaginationMeta | null>(null);
    const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
    
    // UI State
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Helper Function: Fetch Inventory
    const fetchInventory = async () => {
        setLoading(true);
        try {
            const response = await getMedicines({ 
                pageNumber: page, 
                pageSize: 10, 
                searchTerm: searchTerm 
            });
            setMedicines(response.data);
            setMeta(response.meta);
        } catch (error) {
            console.error("Failed to load inventory", error);
        } finally {
            setLoading(false);
        }
    };

    // initially Load Categories (Lookup Map)
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await getAllCategories();
                // Convert Array to Object for fast lookup: { 1: "Pills", 2: "Syrup" }
                const catMap: Record<number, string> = {};
                data.forEach(c => catMap[c.id] = c.name);
                setCategories(catMap);
            } catch (error) {
                console.error("Failed to load categories", error);
            }
        };
        fetchCategories();
    }, []);

    // Load Medicines whenever Page or Search changes
    useEffect(() => {
        fetchInventory();
    }, [page, searchTerm]); // Re-run when these change

    // Delete Handler
    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this medicine?")) return;
        try {
            await deleteMedicine(id);   
            // Refresh the list after delete
            setMedicines(prev => prev.filter(m => m.id !== id));
        } catch (error) {
            alert("Failed to delete. You might not have permission.");
        }
    };

    const handleEdit = (medicine: Medicine) => {
        setSelectedMedicine(medicine);
        setIsAddModalOpen(true);
    };

    const handleAdd = () => {
        setSelectedMedicine(null);
        setIsAddModalOpen(true);
    };

    return (
        <div className="space-y-6">
            {/* Header / Controls */}
            <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded shadow-sm">
                <h1 className="text-2xl font-bold text-gray-800">Inventory</h1>
                
                <div className="flex space-x-2 w-full md:w-auto mt-4 md:mt-0">
                    <input 
                        type="text" 
                        placeholder="Search medicines..." 
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }} // Reset to page 1 on search
                        className="border p-2 rounded w-full md:w-64"
                    />
                    {user?.role === 'Admin' && (
                        <button onClick={handleAdd}
                        className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700">
                            + Add Medicine
                        </button>
                    )}
                </div>
            </div>

            {/* Data Table */}
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
                             <tr><td colSpan={6} className="text-center py-4">Loading inventory...</td></tr>
                        ) : medicines.length === 0 ? (
                             <tr><td colSpan={6} className="text-center py-4">No medicines found.</td></tr>
                        ) : (
                            medicines.map((item) => (
                                <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                                    <td className="py-3 px-6 font-medium text-gray-900">{item.name}</td>
                                    <td className="py-3 px-6">
                                        <span className="bg-blue-100 text-blue-800 py-1 px-3 rounded-full text-xs">
                                            {categories[item.categoryId] || 'Unknown'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-6 text-center">
                                        <span className={`font-bold ${item.stockQuantity < 10 ? 'text-red-600' : 'text-green-600'}`}>
                                            {item.stockQuantity}
                                        </span>
                                    </td>
                                    <td className="py-3 px-6 text-right">₱{item.price.toFixed(2)}</td>
                                    <td className="py-3 px-6 text-center">
                                        {new Date(item.expiryDate).toLocaleDateString()}
                                    </td>
                                    <td className="py-3 px-6 text-center">
                                        {user?.role === 'Admin' && (
                                            <div className="flex justify-center space-x-4">
                                                <button 
                                                    onClick={() => handleEdit(item)}
                                                    className="text-indigo-600 hover:text-indigo-900 font-bold"
                                                >
                                                    Edit
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(item.id)}
                                                    className="text-red-500 hover:text-red-700 font-bold"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {meta && (
                <div className="flex justify-between items-center bg-white p-4 rounded shadow-sm">
                    <span className="text-gray-600 text-sm">
                        Showing Page {meta.currentPage} of {meta.totalPages}
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
            
            {/* The Modal Component (Added Here) */}
            <AddMedicineModal 
                isOpen={isAddModalOpen} 
                onClose={() => setIsAddModalOpen(false)} 
                onSuccess={() => {
                    setIsAddModalOpen(false); 
                    fetchInventory(); // Calls the function we moved up
                }}
                medicineToEdit={selectedMedicine}
            />
        </div>
    );
};

export default InventoryPage;
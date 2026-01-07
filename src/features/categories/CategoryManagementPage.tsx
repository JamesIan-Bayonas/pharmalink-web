import { useEffect, useState } from 'react';
import { 
    getAllCategories, 
    createCategory, 
    deleteCategory, 
    updateCategory,
    type Category 
} from '../../services/categoryService';
import { getMedicines, type Medicine } from '../../services/medicineService';

const CategoryManagementPage = () => {
    // Category State
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Accordion State (Which row is open?)
    const [expandedCategoryId, setExpandedCategoryId] = useState<number | null>(null);
    const [expandedMedicines, setExpandedMedicines] = useState<Medicine[]>([]);
    const [loadingMedicines, setLoadingMedicines] = useState(false);

    // Form State
    const [formName, setFormName] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);

    const fetchCategories = async () => {
        try {
            const data = await getAllCategories();
            setCategories(data);
        } catch (error) {
            console.error("Failed to load categories", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const toggleCategory = async (catId: number) => {
        // If clicking the already open one, close it
        if (expandedCategoryId === catId) {
            setExpandedCategoryId(null);
            setExpandedMedicines([]);
            return;
        }

        // Open new one and fetch data
        setExpandedCategoryId(catId);
        setLoadingMedicines(true);
        try {
            // Fetch medicines specifically for this category
            // We request a slightly larger page size (e.g., 20) to see a good chunk
            const response = await getMedicines({ 
                categoryId: catId, 
                pageSize: 20 
            });
            setExpandedMedicines(response.data);
        } catch (error) {
            console.error("Failed to load medicines for category");
        } finally {
            setLoadingMedicines(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formName.trim()) return;

        try {
            if (editingId) {
                await updateCategory(editingId, { name: formName });
                alert("Category Updated!");
            } else {
                await createCategory({ name: formName });
            }
            setFormName('');
            setEditingId(null);
            fetchCategories();
        } catch (error) {
            alert("Operation failed.");
        }
    };

    const handleEdit = (e: React.MouseEvent, cat: Category) => {
        e.stopPropagation(); // Prevent toggling the accordion when clicking Edit
        setFormName(cat.name);
        setEditingId(cat.id);
    };

    const handleDelete = async (e: React.MouseEvent, category: Category) => {
        e.stopPropagation();

        // AUDIT: Real-time check for existing medicines
        try {
            const checkResponse = await getMedicines({ 
                categoryId: category.id, 
                pageSize: 1 // We only need to know if ONE exists
            });

            if (checkResponse.data.length > 0) {
                alert(`Cannot delete "${category.name}".\n\nIt contains ${checkResponse.meta.totalCount} medicines. Please delete or reassign them first.`);
                return; 
            }
        } catch (error) {
            console.error("Failed to verify category contents", error);
            alert("Could not verify if category is safe to delete. Please try again.");
            return;
        }

        //  Only reachable if category is empty
        if (!window.confirm(`Are you sure you want to delete "${category.name}"? This action cannot be undone.`)) return;

        // Proceed with deletion
        try {
            await deleteCategory(category.id);
            setCategories(prev => prev.filter(c => c.id !== category.id));
            if (expandedCategoryId === category.id) setExpandedCategoryId(null);
        } catch (error) {
            alert("Failed to delete category.");
        }
    };

    return (
        <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-100px)]">
            
            {/* LEFT: Category List */}
            <div className="flex-1 bg-white rounded shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b bg-gray-50">
                    <h2 className="text-xl font-bold text-gray-800">Categories</h2>
                    <p className="text-sm text-gray-500">Click a category to view its medicines</p>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {loading ? (
                        <div className="text-center text-gray-400">Loading...</div>
                    ) : categories.map((cat) => (
                        <div key={cat.id} className="border rounded overflow-hidden">
                            {/* The Header (Clickable) */}
                            <div 
                                onClick={() => toggleCategory(cat.id)}
                                className={`flex justify-between items-center p-3 cursor-pointer transition-colors
                                    ${expandedCategoryId === cat.id ? 'bg-blue-50 border-b' : 'hover:bg-gray-50'}
                                `}
                            >
                                <div className="flex items-center gap-2">
                                    <span className={`transform transition-transform ${expandedCategoryId === cat.id ? 'rotate-90' : ''}`}>  
                                    </span>
                                    <span className="font-medium text-gray-800">{cat.name}</span>
                                    {cat.medicineCount !== undefined && (
                                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                                            {cat.medicineCount}
                                        </span>
                                    )}
                                </div>
                                <div className="space-x-2">
                                    <button onClick={(e) => handleEdit(e, cat)} className="text-blue-600 text-sm hover:underline">Edit</button>
                                    <button onClick={(e) => handleDelete(e, cat)} className="text-red-500 text-sm hover:underline">Delete</button>
                                </div>
                            </div>

                            {/* The Drawer (Expanded Content) */}
                            {expandedCategoryId === cat.id && (
                                <div className="bg-gray-50 p-3 text-sm animate-fade-in-down">
                                    {loadingMedicines ? (
                                        <div className="text-center py-2 text-gray-500">Loading items...</div>
                                    ) : expandedMedicines.length === 0 ? (
                                        <div className="text-center py-2 text-gray-400 italic">No medicines in this category.</div>
                                    ) : (
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="text-gray-500 border-b">
                                                    <th className="pb-1 font-normal">Medicine Name</th>
                                                    <th className="pb-1 font-normal text-right">Stock</th>
                                                    <th className="pb-1 font-normal text-right">Price</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {expandedMedicines.map(med => (
                                                    <tr key={med.id} className="border-b last:border-0 border-gray-200">
                                                        <td className="py-2 text-gray-800">{med.name}</td>
                                                        <td className={`py-2 text-right font-medium ${med.stockQuantity < 10 ? 'text-red-600' : 'text-green-600'}`}>
                                                            {med.stockQuantity}
                                                        </td>
                                                        <td className="py-2 text-right text-gray-600">₱{med.price.toFixed(2)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* RIGHT: Action Form (Same as before) */}
            <div className="w-full md:w-80 bg-white rounded shadow-sm p-6 h-fit">
                <h3 className="text-lg font-bold mb-4 text-gray-800">
                    {editingId ? 'Edit Category' : 'Add New Category'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Name</label>
                        <input 
                            type="text" required
                            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formName}
                            onChange={e => setFormName(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <button type="submit" className={`flex-1 py-2 text-white font-bold rounded ${editingId ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
                            {editingId ? 'Update' : 'Create'}
                        </button>
                        {editingId && (
                            <button type="button" onClick={() => { setFormName(''); setEditingId(null); }} className="px-4 py-2 bg-gray-200 text-gray-600 font-bold rounded hover:bg-gray-300">
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CategoryManagementPage;
import { useEffect, useState } from 'react';
import { 
    getAllCategories, 
    createCategory, 
    deleteCategory, 
    updateCategory,
    type Category 
} from '../../services/categoryService';

const CategoryManagementPage = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formName.trim()) return;

        try {
            if (editingId) {

                // Update mode logic
                await updateCategory(editingId, { name: formName });
                alert("Category Updated!");
            } else {
                // Create mode logic
                await createCategory({ name: formName });
            }
            // Reset and Refresh
            setFormName('');
            setEditingId(null);
            fetchCategories();
        } catch (error) {
            alert("Operation failed. Try again.");
        }
    };

    const handleEdit = (cat: Category) => {
        setFormName(cat.name);
        setEditingId(cat.id);
    };

    const handleCancel = () => {
        setFormName('');
        setEditingId(null);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Delete this category? \nWarning: This might fail if medicines are using it.")) return;
        try {
            await deleteCategory(id);
            setCategories(prev => prev.filter(c => c.id !== id));
        } catch (error) {
            alert("Cannot delete: This category likely contains medicines.");
        }
    };

    return (
        <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-100px)]">
            
            {/* LEFT: Category List */}
            <div className="flex-1 bg-white rounded shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b bg-gray-50">
                    <h2 className="text-xl font-bold text-gray-800">Categories</h2>
                    <p className="text-sm text-gray-500">Manage medicine classifications</p>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {loading ? (
                        <div className="text-center text-gray-400">Loading...</div>
                    ) : categories.length === 0 ? (
                        <div className="text-center text-gray-400 italic">No categories found.</div>
                    ) : (
                        categories.map((cat) => (
                            <div key={cat.id} className="flex justify-between items-center p-3 border rounded hover:bg-blue-50 group">
                                <div>
                                    <span className="font-medium text-gray-800">{cat.name}</span>
                                    {/* Show Medicine Count if available */}
                                    {cat.medicineCount !== undefined && (
                                        <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                                            {cat.medicineCount} items
                                        </span>
                                    )}
                                </div>
                                <div className="space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => handleEdit(cat)}
                                        className="text-blue-600 font-bold hover:underline text-sm"
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(cat.id)}
                                        className="text-red-500 font-bold hover:underline text-sm"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* RIGHT: Action Form */}
            <div className="w-full md:w-80 bg-white rounded shadow-sm p-6 h-fit">
                <h3 className="text-lg font-bold mb-4 text-gray-800">
                    {editingId ? 'Edit Category' : 'Add New Category'}
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Name</label>
                        <input 
                            type="text" 
                            required
                            placeholder="e.g. Antibiotics"
                            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formName}
                            onChange={e => setFormName(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-2">
                        <button 
                            type="submit" 
                            className={`flex-1 py-2 text-white font-bold rounded ${editingId ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700'}`}
                        >
                            {editingId ? 'Update' : 'Create'}
                        </button>
                        
                        {editingId && (
                            <button 
                                type="button" 
                                onClick={handleCancel}
                                className="px-4 py-2 bg-gray-200 text-gray-600 font-bold rounded hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>

                <div className="mt-6 p-4 bg-blue-50 rounded text-sm text-blue-800">
                    <p className="font-bold">Tip:</p>
                    <p>Categories with existing medicines cannot be deleted. Remove the medicines first.</p>
                </div>
            </div>
        </div>
    );
};

export default CategoryManagementPage;
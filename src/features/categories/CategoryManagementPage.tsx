import { useEffect, useState } from 'react';
import { 
    getAllCategories, 
    deleteCategory, 
    type Category 
} from '../../services/categoryService';
import CategoryModal from './CategoryModel'; // Importing your existing modal

const CategoryManagementPage = () => {
    // Data State
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

    // Fetch Data
    const fetchCategories = async () => {
        setLoading(true);
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

    // Handlers
    const handleDelete = async (category: Category) => {
        if (!window.confirm(`Are you sure you want to delete "${category.name}"?`)) return;

        try {
            await deleteCategory(category.id);
            // Optimistic update: Remove from UI immediately
            setCategories(prev => prev.filter(c => c.id !== category.id));
        } catch (error: any) {
            // Show specific error message from API
            const message = error.response?.data?.message || "Failed to delete category. It might be in use.";
            alert("Error: " + message);
        }
    };

    const handleEdit = (category: Category) => {
        setSelectedCategory(category);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setSelectedCategory(null); // Clear selection for "New"
        setIsModalOpen(true);
    };

    // Client-side Filter
    const filteredCategories = categories.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <header className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded shadow-sm gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Category Management</h1>
                    <p className="text-sm text-gray-500">Organize your medicines</p>
                </div>

                <div className="flex w-full md:w-auto space-x-2">
                    <input 
                        type="text" 
                        placeholder="Search categories..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="border p-2 rounded flex-1 md:w-64 outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button 
                        onClick={handleAdd}
                        className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700 whitespace-nowrap"
                    >
                        + Add Category
                    </button>
                </div>
            </header>

            <div className="bg-white rounded shadow overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                            <th className="py-3 px-6">ID</th>
                            <th className="py-3 px-6">Category Name</th>
                            <th className="py-3 px-6 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-600 text-sm">
                        {loading ? (
                             <tr><td colSpan={3} className="text-center py-8">Loading...</td></tr>
                        ) : filteredCategories.length === 0 ? (
                             <tr><td colSpan={3} className="text-center py-8">No categories found.</td></tr>
                        ) : (
                            filteredCategories.map((cat) => (
                                <tr key={cat.id} className="border-b border-gray-200 hover:bg-gray-50">
                                    <td className="py-3 px-6 font-mono text-gray-400">#{cat.id}</td>
                                    <td className="py-3 px-6 font-medium text-gray-800">{cat.name}</td>
                                    <td className="py-3 px-6 text-right space-x-4">
                                        <button 
                                            onClick={() => handleEdit(cat)}
                                            className="text-blue-600 hover:text-blue-800 font-bold"
                                        >
                                            Edit
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(cat)}
                                            className="text-red-500 hover:text-red-700 font-bold"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Reusing your existing Modal Component */}
            <CategoryModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => { fetchCategories(); }}
                categoryToEdit={selectedCategory}
            />
        </div>
    );
};

export default CategoryManagementPage;
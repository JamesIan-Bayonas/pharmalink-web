import { useState, useEffect } from 'react';
import { createCategory, updateCategory, type Category } from '../../services/categoryService';

interface CategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    categoryToEdit?: Category | null;
}

const CategoryModal = ({ isOpen, onClose, onSuccess, categoryToEdit }: CategoryModalProps) => {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setError('');
            if (categoryToEdit) {
                setName(categoryToEdit.name);
            } else {
                setName('');
            }
        }
    }, [isOpen, categoryToEdit]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        
        setLoading(true);
        setError('');

        try {
            if (categoryToEdit) {
                await updateCategory(categoryToEdit.id, { name });
            } else {
                await createCategory({ name });
            }
            onSuccess();
            onClose();
        } catch (err: any) {
            console.error(err);
            setError("Failed to save category. It may already exist.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-xl">
                <h2 className="text-xl font-bold mb-4 text-gray-800">
                    {categoryToEdit ? 'Edit Category' : 'Add New Category'}
                </h2>
                
                {error && (
                    <div className="mb-4 p-2 bg-red-100 text-red-700 text-sm rounded">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                        <input 
                            autoFocus
                            type="text" 
                            required
                            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="e.g. Tablets, Syrups"
                        />
                    </div>

                    <div className="flex justify-end space-x-2 mt-6">
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded font-medium"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 font-bold"
                        >
                            {loading ? 'Saving...' : (categoryToEdit ? 'Update' : 'Create')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CategoryModal;
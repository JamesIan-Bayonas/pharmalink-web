import { useState, useEffect } from 'react';
import { createMedicine, updateMedicine, type CreateMedicineRequest, type Medicine } from '../../services/medicineService';
import { getAllCategories, type Category } from '../../services/categoryService';

interface AddMedicineModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void; // Trigger to refresh the parent table
    medicineToEdit?: Medicine | null;
}

const AddMedicineModal = ({ isOpen, onClose, onSuccess, medicineToEdit }: AddMedicineModalProps) => {
    // Dropdown Data
    const [categories, setCategories] = useState<Category[]>([]);
    
    // Form State
    const [formData, setFormData] = useState<CreateMedicineRequest>({
        name: '',
        categoryId: 0,
        price: 0,
        stockQuantity: 0,
        expiryDate: '',
        description: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Load Categories when Modal opens
    useEffect(() => {
        if (isOpen) {
            const loadCategories = async () => {
                try {
                    const data = await getAllCategories();
                    setCategories(data);
                    
                    if (medicineToEdit) {
                        // Pre-fill form if editing
                        setFormData({
                            name: medicineToEdit.name,
                            categoryId: medicineToEdit.categoryId,
                            price: medicineToEdit.price,
                            stockQuantity: medicineToEdit.stockQuantity,
                            expiryDate: medicineToEdit.expiryDate.split('T')[0],
                            description: medicineToEdit.description || ''
                        });
                    } else {
                        setFormData({
                            name: '',
                            categoryId: data.length > 0 ? data[0].id : 0,
                            price: 0,
                            stockQuantity: 0,
                            expiryDate: '',
                            description: ''
                        });
                    }
                } catch (err) {
                    console.error("Failed to load categories");
                }
            };
            loadCategories();
        }
    }, [isOpen, medicineToEdit]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (medicineToEdit) {
                 await updateMedicine(medicineToEdit.id, formData);
            } else {
                 await createMedicine(formData);
            }
            
            onSuccess(); // Tell parent to refresh
            onClose();   // Close modal
            // Reset Form
            setFormData({
                name: '', categoryId: categories[0]?.id || 0, price: 0, 
                stockQuantity: 0, expiryDate: '', description: ''
            });
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to save medicine");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
                <h2 className="text-xl font-bold mb-4">
                    {medicineToEdit ? 'Edit Medicine' : 'Add New Medicine'}
                </h2>
                
                {error && <div className="mb-4 p-2 bg-red-100 text-red-700 text-sm rounded">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium">Medicine Name</label>
                        <input 
                            required
                            type="text" 
                            className="w-full border p-2 rounded"
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                    </div>

                    {/* Category Dropdown */}
                    <div>
                        <label className="block text-sm font-medium">Category</label>
                        <select 
                            className="w-full border p-2 rounded"
                            value={formData.categoryId}
                            onChange={e => setFormData({...formData, categoryId: Number(e.target.value)})}
                        >
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Price & Stock Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium">Price (₱)</label>
                            <input 
                                required
                                type="number" 
                                step="0.01"
                                className="w-full border p-2 rounded"
                                value={formData.price}
                                onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Stock Qty</label>
                            <input 
                                required
                                type="number" 
                                className="w-full border p-2 rounded"
                                value={formData.stockQuantity}
                                onChange={e => setFormData({...formData, stockQuantity: Number(e.target.value)})}
                            />
                        </div>
                    </div>

                    {/* Expiry Date */}
                    <div>
                        <label className="block text-sm font-medium">Expiry Date</label>
                        <input 
                            required
                            type="date" 
                            className="w-full border p-2 rounded"
                            value={formData.expiryDate}
                            onChange={e => setFormData({...formData, expiryDate: e.target.value})}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-2 mt-6">
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : (medicineToEdit ? 'Update Medicine' : 'Save Medicine')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddMedicineModal;
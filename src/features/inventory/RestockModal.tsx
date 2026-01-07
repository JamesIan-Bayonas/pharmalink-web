import { useState } from 'react';
import { updateMedicineStock, type Medicine } from '../../services/medicineService';

interface RestockModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    medicine: Medicine | null;
}

const RestockModal = ({ isOpen, onClose, onSuccess, medicine }: RestockModalProps) => {
    const [quantity, setQuantity] = useState<number | ''>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!medicine || !quantity) return;

        setLoading(true);
        setError('');

        try {
            // We pass the positive number here; the Service layer handles the negative conversion
            await updateMedicineStock(medicine.id, Number(quantity));
            onSuccess();
            onClose();
            setQuantity(''); // Reset
        } catch (err: any) {
            setError("Failed to update stock. Try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !medicine) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-xl">
                <h2 className="text-xl font-bold text-gray-800 mb-2">Restock Inventory</h2>
                <p className="text-sm text-gray-500 mb-4">
                    Adding stock for <span className="font-bold text-blue-600">{medicine.name}</span>
                </p>
                
                {error && <div className="mb-4 p-2 bg-red-100 text-red-700 text-sm rounded">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Quantity to Add</label>
                        <input 
                            autoFocus
                            required
                            min="1"
                            type="number" 
                            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="e.g. 50"
                            value={quantity}
                            onChange={e => setQuantity(Number(e.target.value))}
                        />
                    </div>

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
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-bold"
                        >
                            {loading ? 'Updating...' : '+ Add Stock'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RestockModal;
import { useState, useEffect } from 'react';
import { getMedicines, type Medicine } from '../../services/medicineService';
import { createSale, type SaleItemDto } from '../../services/saleService';

// Helper interface for the Cart (Extends Medicine with a 'cartQuantity')
interface CartItem extends Medicine {
    cartQuantity: number;
}

const POSTerminalPage = () => {
    // === STATE ===
    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);

    // === 1. FETCH PRODUCTS (Left Side) ===
    useEffect(() => {
        const loadProducts = async () => {
            setLoading(true);
            try {
                // Fetch first 20 items matching search
                const response = await getMedicines({ 
                    pageNumber: 1, 
                    pageSize: 20, 
                    searchTerm: searchTerm 
                });
                setMedicines(response.data);
            } catch (error) {
                console.error("Failed to load products");
            } finally {
                setLoading(false);
            }
        };
        // Debounce could be added here, but direct call works for now
        loadProducts();
    }, [searchTerm]);

    // === 2. CART ACTIONS ===
    
    // Add Item to Cart
    const addToCart = (medicine: Medicine) => {
        setCart(prevCart => {
            const existing = prevCart.find(item => item.id === medicine.id);
            if (existing) {
                // If already in cart, check stock limit before incrementing
                if (existing.cartQuantity >= medicine.stockQuantity) {
                    alert(`Only ${medicine.stockQuantity} units available!`);
                    return prevCart;
                }
                return prevCart.map(item => 
                    item.id === medicine.id 
                        ? { ...item, cartQuantity: item.cartQuantity + 1 } 
                        : item
                );
            } else {
                // Add new item
                if (medicine.stockQuantity < 1) {
                    alert("Out of stock!");
                    return prevCart;
                }
                return [...prevCart, { ...medicine, cartQuantity: 1 }];
            }
        });
    };

    // Remove or Decrease Item
    const removeFromCart = (medicineId: number) => {
        setCart(prevCart => {
            return prevCart.reduce((acc, item) => {
                if (item.id === medicineId) {
                    if (item.cartQuantity > 1) {
                        acc.push({ ...item, cartQuantity: item.cartQuantity - 1 });
                    }
                    // If quantity is 1, it gets removed (skipped)
                } else {
                    acc.push(item);
                }
                return acc;
            }, [] as CartItem[]);
        });
    };

    // Calculate Total
    const grandTotal = cart.reduce((sum, item) => sum + (item.price * item.cartQuantity), 0);

    // === 3. CHECKOUT (Submit to API) ===
    const handleCheckout = async () => {
        if (cart.length === 0) return;
        if (!window.confirm(`Process sale for ₱${grandTotal.toFixed(2)}?`)) return;

        try {
            // Transform CartItem[] -> SaleItemDto[]
            const salesItems: SaleItemDto[] = cart.map(item => ({
                medicineId: item.id,
                quantity: item.cartQuantity
            }));

            const result = await createSale({ salesItems });
            
            alert(`Sale Successful! ID: ${result.saleId}`);
            setCart([]); // Clear cart
            // Optional: Refresh medicine list to update stock numbers
            setSearchTerm(''); 
        } catch (error: any) {
            alert("Checkout Failed: " + (error.response?.data?.message || "Unknown error"));
        }
    };

    return (
        <div className="flex flex-col md:flex-row h-[calc(100vh-100px)] gap-4">
            
            {/* LEFT SIDE: Product Catalog */}
            <div className="flex-1 bg-white p-4 rounded shadow-sm flex flex-col">
                <div className="mb-4">
                    <input 
                        type="text" 
                        placeholder="Search products..." 
                        className="w-full border p-3 rounded text-lg"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        autoFocus
                    />
                </div>
                
                <div className="flex-1 overflow-y-auto grid grid-cols-2 lg:grid-cols-3 gap-4 content-start">
                    {medicines.map(med => (
                        <button 
                            key={med.id}
                            onClick={() => addToCart(med)}
                            className="p-4 border rounded hover:border-blue-500 hover:bg-blue-50 text-left transition"
                        >
                            <div className="font-bold text-gray-800">{med.name}</div>
                            <div className="text-sm text-gray-500">Stock: {med.stockQuantity}</div>
                            <div className="mt-2 font-bold text-blue-600">₱{med.price.toFixed(2)}</div>
                        </button>
                    ))}
                    {medicines.length === 0 && !loading && (
                        <div className="col-span-full text-center text-gray-400 mt-10">
                            No products found.
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT SIDE: The Cart (Register) */}
            <div className="w-full md:w-96 bg-gray-50 p-4 rounded shadow-sm flex flex-col border-l">
                <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Current Sale</h2>
                
                <div className="flex-1 overflow-y-auto space-y-2">
                    {cart.length === 0 ? (
                        <div className="text-center text-gray-400 mt-10 italic">Cart is empty</div>
                    ) : (
                        cart.map(item => (
                            <div key={item.id} className="bg-white p-3 rounded shadow-sm flex justify-between items-center">
                                <div>
                                    <div className="font-medium">{item.name}</div>
                                    <div className="text-xs text-gray-500">
                                        ₱{item.price.toFixed(2)} x {item.cartQuantity}
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <span className="font-bold text-gray-800">
                                        ₱{(item.price * item.cartQuantity).toFixed(2)}
                                    </span>
                                    <button 
                                        onClick={() => removeFromCart(item.id)}
                                        className="text-red-500 hover:bg-red-100 p-1 rounded"
                                    >
                                        −
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer: Totals & Pay Button */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center mb-4 text-2xl font-bold text-gray-900">
                        <span>Total</span>
                        <span>₱{grandTotal.toFixed(2)}</span>
                    </div>
                    <button 
                        onClick={handleCheckout}
                        disabled={cart.length === 0}
                        className="w-full py-4 bg-green-600 text-white font-bold rounded text-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                        PAY NOW
                    </button>
                </div>
            </div>
        </div>
    );
};

export default POSTerminalPage;
import { useState, useEffect } from 'react';
import { getMedicines, type Medicine } from '../../services/medicineService';
import { createSale, type SaleItemDto } from '../../services/saleService';
import { useAuth } from '../../context/AuthContext';
import PrintableReceipt, { type ReceiptData } from './PrintableReciept';

interface CartItem extends Medicine {
    cartQuantity: number;
}

const POSTerminalPage = () => {
    const { user } = useAuth();
    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    
    // State for the Receipt
    const [lastSale, setLastSale] = useState<ReceiptData | null>(null);

    // Fetch Products
    useEffect(() => {
        const loadProducts = async () => {
            setLoading(true);
            try {
                const response = await getMedicines({ 
                    pageNumber: 1, pageSize: 20, searchTerm: searchTerm 
                });
                setMedicines(response.data);
            } catch (error) {
                console.error("Failed to load products");
            } finally {
                setLoading(false);
            }
        };

        // Create a timer that waits 500ms before running loadProducts
        const debounceTimer = setTimeout(() => {
            loadProducts();
        }, 500);

        // Cleanup: If the user types again (searchTerm changes) clears the timer
        return () => clearTimeout(debounceTimer);
        
    }, [searchTerm]);

    // Auto print logic
    useEffect(() => {
        if (lastSale) {
            const timer = setTimeout(() => {
                window.print();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [lastSale]);

    // Manage Cart
    const addToCart = (medicine: Medicine) => {
        setCart(prev => {
            const existing = prev.find(i => i.id === medicine.id);
            if (existing && existing.cartQuantity >= medicine.stockQuantity) {
                alert("Stock limit reached!"); return prev;
            }
            if (!existing && medicine.stockQuantity < 1) {
                alert("Out of stock!"); return prev;
            }
            return existing 
                ? prev.map(i => i.id === medicine.id ? { ...i, cartQuantity: i.cartQuantity + 1 } : i)
                : [...prev, { ...medicine, cartQuantity: 1 }];
        });
    };

    const removeFromCart = (id: number) => {
        setCart(prev => prev.reduce((acc, item) => {
            if (item.id === id) {
                if (item.cartQuantity > 1) acc.push({ ...item, cartQuantity: item.cartQuantity - 1 });
            } else {
                acc.push(item);
            }
            return acc;
        }, [] as CartItem[]));
    };

    const grandTotal = cart.reduce((sum, item) => sum + (item.price * item.cartQuantity), 0);

    // CHECKOUT
    const handleCheckout = async () => {
        if (cart.length === 0) return;
        if (!window.confirm(`Process sale for ₱${grandTotal.toFixed(2)}?`)) return;

        try {
            const salesItems: SaleItemDto[] = cart.map(item => ({
                medicineId: item.id, quantity: item.cartQuantity
            }));

            const result = await createSale({ items: salesItems });

            console.log("API RESULT:", result); 
            
            // Format Receipt Data
            const receiptData: ReceiptData = {
                id: (result as any).saleId, 
                date: new Date().toISOString(),
                total: grandTotal, 
                cashierName: user?.username || 'Staff',

                items: cart.map(c => ({
                    name: c.name, 
                    qty: c.cartQuantity, 
                    price: c.price, 
                    total: c.price * c.cartQuantity 
                }))
            };

            setLastSale(receiptData); 
            
            alert(`Sale Successful! ID: ${receiptData.id}`); 
            setCart([]); 
            setSearchTerm(''); 
            
        } catch (error: any) {
            console.error("Checkout Error:", error);
            alert("Checkout Failed: " + (error.response?.data?.message || "Unknown error"));
        }
    };

    // Print function
    const handleReprint = () => {
        if (lastSale) {
            window.print();
        }
    };

    return (
        <div className="flex flex-col md:flex-row h-[calc(100vh-100px)] gap-4">
            
            {/* Left Side: Catalog */}
            <div className="flex-1 bg-white p-4 rounded shadow-sm flex flex-col">
                <input 
                    type="text" placeholder="Search products..." className="w-full border p-3 rounded mb-4"
                    value={searchTerm} onChange={e => setSearchTerm(e.target.value)} autoFocus
                />
                <div className="flex-1 overflow-y-auto grid grid-cols-2 lg:grid-cols-3 gap-4 content-start">
                    {medicines.map(med => ( 
                        <button key={med.id} onClick={() => addToCart(med)} className="p-4 border rounded hover:border-blue-500 text-left">
                            <div className="font-bold">{med.name}</div>
                            <div className="text-sm text-gray-500">Stock: {med.stockQuantity}</div>
                            <div className="text-blue-600 font-bold">₱{med.price.toFixed(2)}</div>
                        </button>
                    ))}
                </div>
            </div>  

            {/* Right Side: Cart */}
            <div className="w-full md:w-96 bg-gray-50 p-4 rounded shadow-sm flex flex-col border-l">
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h2 className="text-xl font-bold">Current Sale</h2>
                    {/* NEW: REPRINT BUTTON */}
                    {lastSale && (
                        <button onClick={handleReprint} className="text-xs text-blue-600 hover:underline">
                            Reprint Last Receipt
                        </button>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto space-y-2">
                    {cart.length === 0 ? <div className="text-center text-gray-400 mt-10">Cart is empty</div> : 
                        cart.map(item => (
                            <div key={item.id} className="bg-white p-2 rounded flex justify-between items-center">
                                <div>
                                    <div className="font-medium">{item.name}</div>
                                    <div className="text-xs text-gray-500">₱{item.price} x {item.cartQuantity}</div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold">₱{(item.price * item.cartQuantity).toFixed(2)}</span>
                                    <button onClick={() => removeFromCart(item.id)} className="text-red-500 px-2">-</button>
                                </div>
                            </div>
                        ))
                    }
                </div>

                <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between text-2xl font-bold mb-4">
                        <span>Total</span><span>₱{grandTotal.toFixed(2)}</span>
                    </div>
                    <button 
                        onClick={handleCheckout} 
                        disabled={cart.length === 0}
                        className="w-full py-4 bg-green-600 text-white font-bold rounded hover:bg-green-700 disabled:opacity-50"
                    >
                        PAY NOW
                    </button>
                </div>
            </div>
            {/*Receipt components*/}
            <PrintableReceipt data={lastSale} />
        </div>
    );
};

export default POSTerminalPage;
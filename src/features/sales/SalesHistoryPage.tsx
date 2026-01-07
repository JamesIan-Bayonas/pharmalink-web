import { useEffect, useState } from 'react';
import { getSales, type SaleResponse, type PaginationMeta } from '../../services/saleService';
import PrintableReceipt, { type ReceiptData } from '../pos/PrintableReciept'; 

const SalesHistoryPage = () => {

    const [sales, setSales] = useState<SaleResponse[]>([]);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    
    // --- NEW: Date Filter State ---
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const [selectedSale, setSelectedSale] = useState<SaleResponse | null>(null);
    const [printData, setPrintData] = useState<ReceiptData | null>(null);

    // Fetch Function
    const fetchSales = async () => {
        setLoading(true);
        try {
            // --- UPDATED: Pass dates to the service ---
            const response = await getSales({ 
                pageNumber: page, 
                pageSize: 10,
                startDate: startDate || undefined, // Send undefined if empty
                endDate: endDate || undefined 
            });
            setSales(response.data);
            setMeta(response.meta);
        } catch (error) {
            console.error("Failed to load sales history", error);
        } finally {
            setLoading(false);
        }
    };

    // --- UPDATED: Trigger fetch when Page OR Dates change ---
    useEffect(() => {
        fetchSales();
    }, [page, startDate, endDate]);

    // Handle Printing
    useEffect(() => {
        if (printData) {
            const timer = setTimeout(() => {
                window.print();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [printData]);

    const handlePrint = (sale: SaleResponse) => {
        const adapterData: ReceiptData = {
            id: sale.id,
            date: sale.transactionDate,
            total: sale.totalAmount,
            cashierName: `Staff #${sale.userId}`, 
            items: sale.items.map(item => ({
                name: item.medicineName, 
                qty: item.quantity,
                price: item.unitPrice,
                total: item.subTotal
            }))
        };
        setPrintData(adapterData);
    };

    return (
        <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
            <header className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded shadow-sm gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Sales History</h1>
                    <p className="text-sm text-gray-500">Audit logs and past transactions</p>
                </div>

                {/* --- NEW: Date Filter Controls --- */}
                <div className="flex items-center space-x-3 bg-gray-50 p-2 rounded border">
                    <div className="flex flex-col">
                        <label className="text-[10px] uppercase font-bold text-gray-500">From</label>
                        <input 
                            type="date" 
                            className="bg-white border rounded px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                            value={startDate}
                            onChange={(e) => {
                                setStartDate(e.target.value);
                                setPage(1); // Reset to page 1 when filter changes
                            }}
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-[10px] uppercase font-bold text-gray-500">To</label>
                        <input 
                            type="date" 
                            className="bg-white border rounded px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                            value={endDate}
                            onChange={(e) => {
                                setEndDate(e.target.value);
                                setPage(1); // Reset to page 1 when filter changes
                            }}
                        />
                    </div>

                    {/* Clear Button (Only shows if filters are active) */}
                    {(startDate || endDate) && (
                        <button 
                            onClick={() => { setStartDate(''); setEndDate(''); setPage(1); }}
                            className="ml-2 text-red-500 hover:text-red-700 text-xs font-bold"
                            title="Clear Filters"
                        >
                            ✕ Clear
                        </button>
                    )}
                </div>
            </header>

            {/* Main Table */}
            <div className="bg-white rounded shadow flex-1 overflow-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-gray-100 z-10">
                        <tr className="text-gray-600 uppercase text-sm leading-normal">
                            <th className="py-3 px-6">Receipt ID</th>
                            <th className="py-3 px-6">Date & Time</th>
                            <th className="py-3 px-6 text-center">Items Count</th>
                            <th className="py-3 px-6 text-right">Total Amount</th>
                            <th className="py-3 px-6 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-600 text-sm">
                        {loading ? (
                            <tr><td colSpan={5} className="text-center py-8">Loading records...</td></tr>
                        ) : sales.length === 0 ? (
                            <tr><td colSpan={5} className="text-center py-8">No sales found for this period.</td></tr>
                        ) : (
                            sales.map((sale) => (
                                <tr key={sale.id} className="border-b border-gray-200 hover:bg-gray-50">
                                    <td className="py-3 px-6 font-medium">#{sale.id}</td>
                                    <td className="py-3 px-6">
                                        {new Date(sale.transactionDate).toLocaleString()}
                                    </td>
                                    <td className="py-3 px-6 text-center">
                                        <span className="bg-blue-100 text-blue-800 py-1 px-3 rounded-full text-xs">
                                            {sale.items.length} items
                                        </span>
                                    </td>
                                    <td className="py-3 px-6 text-right font-bold text-gray-800">
                                        ₱{sale.totalAmount.toFixed(2)}
                                    </td>
                                    <td className="py-3 px-6 text-center">
                                        <button 
                                            onClick={() => setSelectedSale(sale)}
                                            className="text-blue-600 hover:underline font-bold"
                                        >
                                            View Receipt
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Table*/}
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

            {/* RECEIPT MODAL */}
            {selectedSale && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white w-full max-w-md p-6 rounded-lg shadow-xl max-h-[90vh] flex flex-col">
                        <div className="flex justify-between items-center mb-4 border-b pb-2">
                            <h2 className="text-xl font-bold">Receipt #{selectedSale.id}</h2>
                            <button onClick={() => setSelectedSale(null)} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
                        </div>
                        
                        <div className="text-sm text-gray-500 mb-4">
                            Date: {new Date(selectedSale.transactionDate).toLocaleString()}
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-2 mb-4">
                            {selectedSale.items.map((item) => (
                                <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                    <div>
                                        <div className="font-medium text-gray-800">{item.medicineName}</div>
                                        <div className="text-xs text-gray-500">Qty: {item.quantity} x ₱{item.unitPrice.toFixed(2)}</div>
                                    </div>
                                    <div className="font-bold">₱{item.subTotal.toFixed(2)}</div>
                                </div>
                            ))}
                        </div>

                        <div className="border-t pt-4 flex justify-between items-center text-lg font-bold">
                            <span>Total Paid</span>
                            <span className="text-green-600">₱{selectedSale.totalAmount.toFixed(2)}</span>
                        </div>
                        
                        <div className="flex gap-2 mt-6">
                            <button 
                                onClick={() => handlePrint(selectedSale)}
                                className="flex-1 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-bold"
                            >
                                Print
                            </button>
                            <button 
                                onClick={() => setSelectedSale(null)}
                                className="flex-1 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <PrintableReceipt data={printData} />
        </div>
    );
};

export default SalesHistoryPage;
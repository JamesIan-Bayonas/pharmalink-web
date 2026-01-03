import { useEffect, useState } from 'react';
import { getSales, type SaleResponse, type PaginationMeta } from '../../services/saleService';

const SalesHistoryPage = () => {

    const [sales, setSales] = useState<SaleResponse[]>([]);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);

    // Modal State used for viewing receipt details
    const [selectedSale, setSelectedSale] = useState<SaleResponse | null>(null);

    // Fetch Data
    useEffect(() => {
        const fetchSales = async () => {
            setLoading(true);
            try {
                const response = await getSales({ pageNumber: page, pageSize: 10 });
                setSales(response.data);
                setMeta(response.meta);
            } catch (error) {
                console.error("Failed to load sales history", error);
            } finally {
                setLoading(false);
            }
        };    

        fetchSales();
    }, [page]);

    return (
        <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
            <header className="flex justify-between items-center bg-white p-4 rounded shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Sales History</h1>
                    <p className="text-sm text-gray-500">Audit logs and past transactions</p>
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
                            <tr><td colSpan={5} className="text-center py-8">No sales recorded yet.</td></tr>
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

            {/* RECEIPT MODAL embedded*/}
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
                        
                        <button 
                            onClick={() => setSelectedSale(null)}
                            className="mt-6 w-full py-2 bg-gray-800 text-white rounded hover:bg-gray-900"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SalesHistoryPage;
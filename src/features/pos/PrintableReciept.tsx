
// We need a specific type for the receipt data because the API response 
// doesn't have the item names (only IDs), but our Cart has the names.
export interface ReceiptData {
    id: number;
    date: string;
    total: number;
    items: {
        name: string;
        qty: number;
        price: number;
        total: number;
    }[];
    cashierName?: string;
}

interface PrintableReceiptProps {
    data: ReceiptData | null;
}

const PrintableReceipt = ({ data }: PrintableReceiptProps) => {
    if (!data) return null;

    return (
        <div id="printable-receipt" className="p-4 font-mono text-sm text-black">
            <div className="text-center mb-4">
                <h1 className="font-bold text-xl uppercase">PharmaLink</h1>
                <p>Dipolog City, Zamboanga</p>
                <p>Tel: (065) 123-4567</p>
            </div>

            <div className="border-b border-black pb-2 mb-2">
                <p>Rcpt #: {data.id}</p>
                <p>Date: {new Date(data.date).toLocaleString()}</p>
                <p>Cashier: {data.cashierName || 'Staff'}</p>
            </div>

            <table className="w-full mb-4">
                <thead>
                    <tr className="text-left">
                        <th className="pb-1">Item</th>
                        <th className="pb-1 text-right">Qty</th>
                        <th className="pb-1 text-right">Amt</th>
                    </tr>
                </thead>
                <tbody>
                    {data.items.map((item, index) => (
                        <tr key={index}>
                            <td className="py-1">{item.name}</td>
                            <td className="py-1 text-right">{item.qty}</td>
                            <td className="py-1 text-right">{item.total.toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="border-t border-black pt-2 mb-4">
                <div className="flex justify-between font-bold text-lg">
                    <span>TOTAL</span>
                    <span>P {data.total.toFixed(2)}</span>
                </div>
                <div className="text-xs text-center mt-4">
                    -- THIS IS YOUR OFFICIAL RECEIPT --
                    <br />
                    Thank you for your purchase!
                </div>
            </div>
        </div>
    );
};

export default PrintableReceipt;